import express from "express";
import {
  registerUser,
  loginUser,
  uploadReceipt,
  getPaymentStatus,
  verifyTicket,
  getUserProfile
} from "../controllers/userController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-ticket/:ticketId", verifyTicket);

// Protected routes (user must be logged in)
router.post("/upload-receipt/:userId", uploadReceipt);
router.get("/status/:userId", getPaymentStatus);
router.get("/profile", getUserProfile);

export default router;