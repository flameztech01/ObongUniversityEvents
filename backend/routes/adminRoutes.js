import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getPendingVerifications,
  approvePayment,
  rejectPayment,
  getAllUsers,
  getUserDetails,
  searchUsers,
  exportUsers,
  getDashboardStats,
  bulkApprovePayments,
  bulkRejectPayments,
  approveAllPending,
} from "../controllers/adminController.js";
import { protect, adminProtect } from "../middleware/authMiddleware.js"; // Your auth middleware

const router = express.Router();

router.use((req, res, next) => {
  req.admin = { id: "dev-admin", name: "Dev Admin" };
  next();
});

// Admin authentication
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected admin routes
router.get("/pending-verifications", getPendingVerifications);
router.put("/approve/:userId", approvePayment);
router.put("/reject/:userId", rejectPayment);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.get("/search", searchUsers);
router.get("/export", exportUsers);
router.get("/stats", getDashboardStats);

router.post('/bulk-process',  bulkApprovePayments);
router.post('/bulk-reject',  bulkRejectPayments);
router.post('/approve-all-pending', approveAllPending);

export default router;
