import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import QRCode from "qrcode";


const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, and password");
  }

  // Check if admin already exists
  const adminExists = await Admin.findOne({ email });
  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists with this email");
  }

  // Create admin
  const admin = await Admin.create({
    name,
    email,
    password,
    role: role || "admin", // Default to "admin" if role not provided
    isActive: true,
    createdBy: req.admin?._id || null // If created by another admin
  });

  // Remove password from response
  const adminData = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
    createdBy: admin.createdBy
  };

  res.status(201).json({
    success: true,
    data: adminData,
    message: "Admin registered successfully"
  });
});







// Admin authentication
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!admin.isActive) {
    res.status(403);
    throw new Error("Admin account is deactivated");
  }

  const isPasswordMatch = await admin.comparePassword(password);
  
  if (!isPasswordMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin
    },
    message: "Login successful"
  });
});




// Get all pending verifications
const getPendingVerifications = asyncHandler(async (req, res) => {
  // Assuming admin authentication middleware adds req.admin
  if (!req.admin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const pendingUsers = await User.find({ 
    status: "pending_verification" 
  }).select('-qrCodeData -qrCodeImage')
    .sort({ paymentDate: 1 }); // Sort by payment date (oldest first)

  res.status(200).json({
    success: true,
    data: {
      count: pendingUsers.length,
      users: pendingUsers
    }
  });
});

// Approve payment and generate ticket
const approvePayment = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { adminNotes } = req.body;

  // Check if user is admin
  if (!req.admin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.status !== "pending_verification") {
    res.status(400);
    throw new Error(`User is not pending verification. Current status: ${user.status}`);
  }

  // Generate unique ticket ID
  const ticketId = `TICKET-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  // Create QR code data
  const qrCodeData = {
    ticketId,
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    level: user.level,
    event: "Your Event Name",
    date: new Date().toISOString(),
    verifiedBy: req.admin.id
  };

  // Generate QR code image
  const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData));

  // Update user
  user.status = "approved";
  user.paid = true;
  user.ticketId = ticketId;
  user.qrCodeData = qrCodeData;
  user.qrCodeImage = qrCodeImage;
  user.approvedAt = new Date();
  user.approvedBy = req.admin.id;
  user.adminNotes = adminNotes;
  
  await user.save();

  // TODO: Send email notification to user
  // await sendTicketEmail(user.email, ticketId, qrCodeImage);

  res.status(200).json({
    success: true,
    data: {
      message: "Payment approved and ticket generated successfully",
      ticketDetails: {
        ticketId: user.ticketId,
        name: user.name,
        email: user.email,
        level: user.level,
        qrCodeImage: user.qrCodeImage,
        approvedAt: user.approvedAt
      }
    }
  });
});





// Reject payment
const rejectPayment = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    res.status(400);
    throw new Error("Rejection reason is required");
  }

  // Check if user is admin
  if (!req.admin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.status !== "pending_verification") {
    res.status(400);
    throw new Error(`User is not pending verification. Current status: ${user.status}`);
  }

  // Update user
  user.status = "rejected";
  user.rejectionReason = rejectionReason;
  user.rejectedAt = new Date();
  user.rejectedBy = req.admin.id;
  
  await user.save();

  // TODO: Send email notification to user
  // await sendRejectionEmail(user.email, rejectionReason);

  res.status(200).json({
    success: true,
    data: {
      message: "Payment rejected",
      userId: user._id,
      name: user.name,
      email: user.email,
      rejectionReason: user.rejectionReason,
      rejectedAt: user.rejectedAt
    }
  });
});












// Get all users for admin dashboard
const getAllUsers = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (!req.admin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find({})
    .select('-qrCodeData -qrCodeImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments();

  // Count by status
  const stats = {
    total: totalUsers,
    pending_payment: await User.countDocuments({ status: "pending_payment" }),
    pending_verification: await User.countDocuments({ status: "pending_verification" }),
    approved: await User.countDocuments({ status: "approved" }),
    rejected: await User.countDocuments({ status: "rejected" }),
  };

  res.status(200).json({
    success: true,
    data: {
      stats,
      users,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
      }
    }
  });
});





// Get user details by ID (admin view)
const getUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user is admin
  if (!req.admin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    data: user
  });
});






// Search users
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error("Search query is required");
  }

  // Check if user is admin
  if (!req.admin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { ticketId: { $regex: query, $options: 'i' } },
      { paymentReference: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  }).select('-qrCodeData -qrCodeImage')
    .limit(50);

  res.status(200).json({
    success: true,
    data: {
      count: users.length,
      users
    }
  });
});

// Export users data (for reports)
const exportUsers = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (!req.admin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const users = await User.find({})
    .select('-qrCodeData -qrCodeImage -__v')
    .sort({ createdAt: -1 });

  // Format for CSV/Excel
  const formattedUsers = users.map(user => ({
    "Ticket ID": user.ticketId || "N/A",
    "Name": user.name,
    "Email": user.email,
    "Phone": user.phone,
    "Level": user.level,
    "Amount": user.amount,
    "Status": user.status,
    "Payment Reference": user.paymentReference,
    "Payment Date": user.paymentDate ? user.paymentDate.toISOString() : "N/A",
    "Approved Date": user.approvedAt ? user.approvedAt.toISOString() : "N/A",
    "Registration Date": user.createdAt.toISOString()
  }));

  res.status(200).json({
    success: true,
    data: formattedUsers
  });
});

// adminController.js
const getDashboardStats = asyncHandler(async (req, res) => {
  // Remove the req.admin check or keep it based on your testing
  // if (!req.admin) {
  //   res.status(403);
  //   throw new Error("Not authorized");
  // }

  const total = await User.countDocuments();
  const pending_payment = await User.countDocuments({ status: "pending_payment" });
  const pending_verification = await User.countDocuments({ status: "pending_verification" });
  const approved = await User.countDocuments({ status: "approved" });
  const rejected = await User.countDocuments({ status: "rejected" });

  // Optional: Recent activity
  const recent_activity = await User.find({})
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('name email status updatedAt');

  res.status(200).json({
    success: true,
    data: {
      total,
      pending_payment,
      pending_verification,
      approved,
      rejected,
      recent_activity: recent_activity.map(user => ({
        description: `${user.name} (${user.email}) - Status: ${user.status}`,
        type: user.status,
        timestamp: user.updatedAt
      }))
    }
  });
});


export {
  registerAdmin,
    loginAdmin,
    getPendingVerifications,
    approvePayment,
    rejectPayment,
    getAllUsers,
    getUserDetails,
    searchUsers,
    exportUsers,
    getDashboardStats
}