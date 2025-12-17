import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    level: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    ticketId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentReference: {
      type: String,
    },
    qrCodeData: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;