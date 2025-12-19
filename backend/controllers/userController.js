import express from "express";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import axios from "axios"; // Add axios for API calls

const router = express.Router();

// Initialize Paystack with the secret key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Register user without ticket ID
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, level, amount } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    level,
    amount,
    paid: false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      amount: user.amount,
      paid: user.paid,
      ticketId: null,
      message: "Registration successful. Please proceed to payment to get your ticket ID.",
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Initialize Paystack payment - FIXED VERSION
const initializePayment = asyncHandler(async (req, res) => {
  const { userId, email, amount } = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  if (user.paid) {
    return res.status(400).json({ error: "User has already paid" });
  }
  
  // Validate Paystack secret key
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: "Paystack configuration error" });
  }
  
  // Convert amount to kobo (Paystack requires amount in kobo)
  const amountInKobo = Math.round(amount * 100);
  
  // Generate unique reference
  const reference = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  try {
    // Make API call to Paystack
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: email || user.email,
        amount: amountInKobo,
        currency: 'NGN',
        reference: reference,
        metadata: {
          userId: user._id.toString(),
          custom_fields: [
            {
              display_name: "Full Name",
              variable_name: "full_name",
              value: user.name
            },
            {
              display_name: "Level",
              variable_name: "level",
              value: user.level
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.status !== true) {
      return res.status(400).json({ 
        error: "Failed to initialize payment",
        details: response.data.message 
      });
    }
    
    // Save payment reference to user
    user.paymentReference = reference;
    await user.save();
    
    res.status(200).json({
      status: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference
      }
    });
    
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to initialize payment",
      details: error.response?.data?.message || error.message 
    });
  }
});

// Verify payment using Paystack API
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params; // Changed from req.body to req.params
  
  if (!reference) {
    return res.status(400).json({ error: "Payment reference is required" });
  }
  
  try {
    // Verify transaction with Paystack API
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.status !== true || response.data.data.status !== 'success') {
      return res.status(400).json({ error: "Payment verification failed" });
    }
    
    // Find user by payment reference
    const user = await User.findOne({ paymentReference: reference });
    
    if (!user) {
      return res.status(404).json({ error: "User not found for this payment" });
    }
    
    if (user.paid) {
      return res.status(200).json({
        message: "Payment already processed",
        ticketId: user.ticketId
      });
    }
    
    // Generate unique ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate QR code data
    const qrCodeData = JSON.stringify({
      ticketId,
      name: user.name,
      email: user.email,
      level: user.level,
      paymentReference: reference,
      paymentDate: new Date().toISOString()
    });
    
    // Update user with ticket ID and payment status
    user.ticketId = ticketId;
    user.paid = true;
    user.paymentDate = new Date();
    user.qrCodeData = qrCodeData;
    user.amount = response.data.data.amount / 100; // Convert from kobo to Naira
    
    await user.save();
    
    res.status(200).json({
      message: "Payment verified successfully!",
      ticketId: user.ticketId,
      qrCodeData: user.qrCodeData,
      userDetails: {
        name: user.name,
        email: user.email,
        level: user.level,
        amount: user.amount,
        paymentDate: user.paymentDate
      },
      paymentDetails: {
        reference: response.data.data.reference,
        amount: response.data.data.amount / 100,
        currency: response.data.data.currency,
        paidAt: response.data.data.paid_at
      }
    });
    
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: "Payment verification failed",
      details: error.response?.data?.message || error.message 
    });
  }
});

// Paystack webhook handler
const paystackWebhook = asyncHandler(async (req, res) => {
  // Validate Paystack signature
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  
  const event = req.body;
  
  // Handle charge.success event
  if (event.event === 'charge.success') {
    const { reference } = event.data;
    
    try {
      // Find user by payment reference
      const user = await User.findOne({ paymentReference: reference });
      
      if (user && !user.paid) {
        // Generate ticket ID for successful payment
        const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const qrCodeData = JSON.stringify({
          ticketId,
          name: user.name,
          email: user.email,
          level: user.level,
          paymentReference: reference,
          paymentDate: new Date().toISOString()
        });
        
        user.ticketId = ticketId;
        user.paid = true;
        user.paymentDate = new Date();
        user.qrCodeData = qrCodeData;
        
        await user.save();
        
        // Here you can also send email notification
        console.log(`Payment successful for user ${user.email}, ticket: ${ticketId}`);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }
  
  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
});

// Process payment (alternative to webhook - for direct calls)
const processPayment = asyncHandler(async (req, res) => {
  const { userId, paymentReference } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.paid) {
    return res.status(400).json({ error: "User has already paid" });
  }

  // Verify payment first
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.status !== true || response.data.data.status !== 'success') {
      return res.status(400).json({ error: "Payment verification failed" });
    }
    
    // Generate unique ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const qrCodeData = JSON.stringify({
      ticketId,
      name: user.name,
      email: user.email,
      level: user.level,
    });
    
    // Update user
    user.ticketId = ticketId;
    user.paid = true;
    user.paymentReference = paymentReference;
    user.qrCodeData = qrCodeData;
    user.amount = response.data.data.amount / 100;
    user.paymentDate = new Date();
    
    await user.save();
    
    return res.status(200).json({
      message: "Payment successful!",
      ticketId: user.ticketId,
      qrCodeData: user.qrCodeData,
      userDetails: {
        name: user.name,
        email: user.email,
        level: user.level,
        amount: user.amount,
      },
    });
    
  } catch (error) {
    console.error('Process payment error:', error);
    return res.status(500).json({ 
      error: "Payment processing failed",
      details: error.response?.data?.message || error.message 
    });
  }
});

// Verify ticket by scanning QR code
const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const user = await User.findOne({ ticketId });

  if (!user) {
    return res.status(404).json({ error: "Invalid ticket ID" });
  }

  if (!user.paid) {
    return res.status(400).json({ error: "Ticket not paid for" });
  }

  res.status(200).json({
    valid: true,
    ticketId: user.ticketId,
    userDetails: {
      name: user.name,
      email: user.email,
      level: user.level,
      amount: user.amount,
      paid: user.paid,
      paymentDate: user.updatedAt,
    },
    verificationTime: new Date().toISOString(),
  });
});

// Get user's payment status
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({
    name: user.name,
    email: user.email,
    paid: user.paid,
    ticketId: user.ticketId,
    amount: user.amount,
    level: user.level,
  });
});

export {
  registerUser,
  verifyPayment,
  paystackWebhook,
  initializePayment,
  processPayment,
  verifyTicket,
  getPaymentStatus,
};