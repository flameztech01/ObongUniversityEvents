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
import multer from 'multer';
import pkg from 'cloudinary';
const cloudinary = pkg.v2;

import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();


//Cloudinary Configuration with lowercase underscores
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "event_receipt_uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({storage});

cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connected successfully'))
  .catch(result => console.error('Cloudinary not fonneted', err.message));

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-ticket/:ticketId", verifyTicket);

// Protected routes (user must be logged in)
router.post("/upload-receipt/:userId", upload.single("receipt"),  uploadReceipt);
router.get("/status/:userId", getPaymentStatus);
router.get("/profile", getUserProfile);

export default router;