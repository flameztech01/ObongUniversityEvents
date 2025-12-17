import express from "express";
import User from "../models/userModel.js";
import {
  registerUser,
  verifyPayment,
  paystackWebhook,
  initializePayment,
  processPayment,
  verifyTicket,
  getPaymentStatus,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/initialize-payment", initializePayment);
router.post("/paystack-webhook", paystackWebhook);
router.get("/verify-payment/:reference", verifyPayment);
router.post("/pay", processPayment);
router.get("/verify/:ticketId", verifyTicket);
router.get("/status/:userId", getPaymentStatus);

export default router;
// Generate unique ticket ID
const ticketId = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
