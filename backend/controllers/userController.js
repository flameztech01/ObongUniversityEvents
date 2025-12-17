import express from "express";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import crypto from "crypto";

const router = express.Router();


const paystack = process.env.PAYSTACK_SECRET_KEY;

// Register user without ticket ID
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, level, amount } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user without ticket ID initially
  const user = await User.create({
    name,
    email,
    level,
    amount,
    paid: false,
    // No ticketId assigned yet
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      amount: user.amount,
      paid: user.paid,
      ticketId: null, // No ticket ID until payment
      message: "Registration successful. Please proceed to payment to get your ticket ID.",
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});


// Initialize Paystack payment
const initializePayment = asyncHandler(async (req, res) => {
  const { userId, email, amount } = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  
  if (user.paid) {
    res.status(400);
    throw new Error("User has already paid");
  }
  
  // Convert amount to kobo (Paystack requires amount in kobo)
  const amountInKobo = amount * 100;
  
  // Initialize Paystack transaction
  const transaction = await paystack.transaction.initialize({
    email: email || user.email,
    amount: amountInKobo, // Amount in kobo
    currency: 'NGN',
    reference: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
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
  });
  
  if (!transaction.status) {
    res.status(400);
    throw new Error("Failed to initialize payment");
  }
  
  // Save payment reference to user (temporarily)
  user.paymentReference = transaction.data.reference;
  await user.save();
  
  res.status(200).json({
    authorization_url: transaction.data.authorization_url,
    access_code: transaction.data.access_code,
    reference: transaction.data.reference,
    message: "Payment initialized successfully"
  });
});












// Webhook endpoint for Paystack callback
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.body;
  
  if (!reference) {
    res.status(400);
    throw new Error("Payment reference is required");
  }
  
  // Verify transaction with Paystack
  const verification = await paystack.transaction.verify(reference);
  
  if (!verification.status || verification.data.status !== 'success') {
    res.status(400);
    throw new Error("Payment verification failed");
  }
  
  // Find user by payment reference
  const user = await User.findOne({ paymentReference: reference });
  
  if (!user) {
    res.status(404);
    throw new Error("User not found for this payment");
  }
  
  if (user.paid) {
    res.status(200).json({
      message: "Payment already processed",
      ticketId: user.ticketId
    });
    return;
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
  user.amount = verification.data.amount / 100; // Convert from kobo to Naira
  
  await user.save();
  
  // In production, you might want to send an email here
  
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
      reference: verification.data.reference,
      amount: verification.data.amount / 100,
      currency: verification.data.currency,
      paidAt: verification.data.paid_at
    }
  });
});








const paystackWebhook = asyncHandler(async (req, res) => {
  // Validate Paystack signature
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (hash !== req.headers['x-paystack-signature']) {
    res.status(401);
    throw new Error("Invalid signature");
  }
  
  const event = req.body;
  
  // Handle charge.success event
  if (event.event === 'charge.success') {
    const { reference } = event.data;
    
    // Process payment (use the verification logic from above)
    // ... same verification and ticket generation code
    
    // Return 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  }
  
  res.status(200).json({ received: true });
});






// Process payment and generate ticket ID
const processPayment = asyncHandler(async (req, res) => {
  const { userId, paymentReference } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.paid) {
    res.status(400);
    throw new Error("User has already paid");
  }

  // Generate unique ticket ID
  const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Generate QR code data (can be URL or JSON string)
  const qrCodeData = JSON.stringify({
    ticketId,
    name: user.name,
    email: user.email,
    level: user.level,
  });

  // Update user with ticket ID and payment status
  user.ticketId = ticketId;
  user.paid = true;
  user.paymentReference = paymentReference;
  user.qrCodeData = qrCodeData;

  await user.save();

  res.status(200).json({
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
});











// Verify ticket by scanning QR code
const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const user = await User.findOne({ ticketId });

  if (!user) {
    res.status(404);
    throw new Error("Invalid ticket ID");
  }

  if (!user.paid) {
    res.status(400);
    throw new Error("Ticket not paid for");
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
    res.status(404);
    throw new Error("User not found");
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
}