import express from "express";
import {
  loginAdmin,
  getPendingVerifications,
  approvePayment,
  rejectPayment,
  getAllUsers,
  getUserDetails,
  searchUsers,
  exportUsers
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Your auth middleware

const router = express.Router();

// Admin authentication
router.post("/login", loginAdmin);

// Protected admin routes
router.get("/pending-verifications", protect, admin, getPendingVerifications);
router.put("/approve/:userId", protect, admin, approvePayment);
router.put("/reject/:userId", protect, admin, rejectPayment);
router.get("/users", protect, admin, getAllUsers);
router.get("/users/:userId", protect, admin, getUserDetails);
router.get("/search", protect, admin, searchUsers);
router.get("/export", protect, admin, exportUsers);

export default router;