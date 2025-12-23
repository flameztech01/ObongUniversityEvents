import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import crypto from "crypto";

// OPay account details
const OPAY_ACCOUNT_NUMBER = process.env.OPAY_ACCOUNT_NUMBER || "7072179623";
const OPAY_ACCOUNT_NAME = process.env.OPAY_ACCOUNT_NAME || "Larry Clinton Ebubechukwu";
const OPAY_BANK_NAME = process.env.OPAY_BANK_NAME || "OPay";

// Helper function to get amount based on level
const getAmountByLevel = (level) => {
  const amountMap = {
    "100": 4000,  // 100 level
    "200": 3000,  // 200 level
    "300": 3000,  // 300 level
    "400": 3000,  // 400 level
    "500": 6000,  // 500 level
  };
  return amountMap[level] || 4000; // Default to 4000 if level not found
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, level, phone } = req.body;

  // Validate required fields
  if (!name || !email || !level || !phone) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate a unique payment reference
  const paymentReference = `OPAY-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  
  // Calculate amount based on level
  const amount = getAmountByLevel(level);

  const user = await User.create({
    name,
    email,
    level,
    phone,
    amount,
    status: "pending_payment",
    paymentReference,
    paid: false,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        phone: user.phone,
        amount: user.amount,
        status: user.status,
        paymentReference: user.paymentReference,
        paymentDetails: {
          accountNumber: OPAY_ACCOUNT_NUMBER,
          accountName: OPAY_ACCOUNT_NAME,
          bankName: OPAY_BANK_NAME,
          amount: user.amount,
          reference: paymentReference,
          note: `Payment for ${name} - ${paymentReference}`
        }
      },
      message: "Registration successful. Please make payment to the OPay account and upload your receipt.",
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate required field
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found. Please register first.");
  }

  // Return user data for dashboard access
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      phone: user.phone,
      status: user.status,
      paid: user.paid,
      ticketId: user.ticketId,
      paymentReference: user.paymentReference,
      amount: user.amount,
      // Include payment details if payment is pending
      ...(user.status === "pending_payment" && {
        paymentDetails: {
          accountNumber: OPAY_ACCOUNT_NUMBER,
          accountName: OPAY_ACCOUNT_NAME,
          bankName: OPAY_BANK_NAME,
          amount: user.amount,
          reference: user.paymentReference,
          note: `Payment for ${user.name} - ${user.paymentReference}`
        }
      }),
      // Include receipt URL if uploaded
      ...(user.receiptUrl && { receiptUrl: user.receiptUrl }),
      // Include ticket details if approved
      ...(user.status === "approved" && {
        qrCodeImage: user.qrCodeImage,
        approvedAt: user.approvedAt
      }),
      // Include rejection details if rejected
      ...(user.status === "rejected" && {
        rejectionReason: user.rejectionReason,
        rejectedAt: user.rejectedAt
      })
    },
    message: "Login successful"
  });
});

// Upload payment receipt
const uploadReceipt = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { receiptUrl } = req.body;

  if (!receiptUrl) {
    res.status(400);
    throw new Error("Receipt URL is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.status !== "pending_payment") {
    res.status(400);
    throw new Error(`Cannot upload receipt. Current status: ${user.status}`);
  }

  // Update user with receipt and change status
  user.receiptUrl = receiptUrl;
  user.status = "pending_verification";
  user.paymentDate = new Date();
  
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      message: "Receipt uploaded successfully. Awaiting admin verification.",
      status: user.status,
      paymentReference: user.paymentReference,
      receiptUrl: user.receiptUrl,
      paymentDate: user.paymentDate
    }
  });
});

// Get user's payment status
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-qrCodeData');

  if (!user) {
    return res.status(404).json({ 
      success: false,
      error: "User not found" 
    });
  }

  let response = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    level: user.level,
    status: user.status,
    paid: user.paid,
    ticketId: user.ticketId,
    paymentReference: user.paymentReference,
    paymentDate: user.paymentDate,
    amount: user.amount,
  };

  // Add payment details if user hasn't paid yet
  if (user.status === "pending_payment") {
    response.paymentDetails = {
      accountNumber: OPAY_ACCOUNT_NUMBER,
      accountName: OPAY_ACCOUNT_NAME,
      bankName: OPAY_BANK_NAME,
      amount: user.amount,
      reference: user.paymentReference,
      note: `Payment for ${user.name} - ${user.paymentReference}`
    };
  }

  // Add receipt URL if uploaded
  if (user.receiptUrl) {
    response.receiptUrl = user.receiptUrl;
  }

  // Add ticket details if approved
  if (user.status === "approved") {
    response.qrCodeImage = user.qrCodeImage;
    response.approvedAt = user.approvedAt;
  }

  // Add rejection details if rejected
  if (user.status === "rejected") {
    response.rejectionReason = user.rejectionReason;
    response.rejectedAt = user.rejectedAt;
  }

  res.status(200).json({
    success: true,
    data: response
  });
});

// Verify ticket by scanning QR code
const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const user = await User.findOne({ ticketId });

  if (!user) {
    return res.status(404).json({ 
      success: false,
      error: "Invalid ticket ID" 
    });
  }

  if (user.status !== "approved") {
    return res.status(400).json({ 
      success: false,
      error: "Ticket not valid",
      status: user.status 
    });
  }

  res.status(200).json({
    success: true,
    data: {
      valid: true,
      ticketId: user.ticketId,
      userDetails: {
        name: user.name,
        email: user.email,
        level: user.level,
        phone: user.phone,
      },
      verificationTime: new Date().toISOString(),
    }
  });
});

// Get user by ID (for user's own dashboard)
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-qrCodeData');

  if (!user) {
    return res.status(404).json({ 
      success: false,
      error: "User not found" 
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

export {
  registerUser,
  loginUser,
  uploadReceipt,
  getPaymentStatus,
  verifyTicket,
  getUserProfile
};