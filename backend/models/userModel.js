import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: true,
    trim: true 
  },
  level: { 
    type: String, 
    required: true,
    enum: ['100', '200', '300', '400', '500'] // Changed to numeric values
  },
  status: { 
    type: String, 
    enum: ['pending_payment', 'pending_verification', 'approved', 'rejected'],
    default: 'pending_payment'
  },
  paymentReference: { 
    type: String, 
    unique: true 
  },
  receiptUrl: { 
    type: String 
  },
  ticketId: { 
    type: String, 
    unique: true,
    sparse: true
  },
  qrCodeData: { 
    type: Object 
  },
  qrCodeImage: { 
    type: String 
  },
  paid: { 
    type: Boolean, 
    default: false 
  },
  amount: { 
    type: Number 
  },
  paymentDate: { 
    type: Date 
  },
  approvedAt: { 
    type: Date 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.Mixed, 
    ref: 'Admin' 
  },
  rejectedAt: { 
    type: Date 
  },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  rejectionReason: { 
    type: String 
  },
  adminNotes: { 
    type: String 
  }
}, { 
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
export default User;