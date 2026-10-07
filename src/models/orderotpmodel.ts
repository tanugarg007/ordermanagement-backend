import mongoose, { Schema, Document } from "mongoose";

interface IOrderOtp extends Document {
  email: string;
  codeHash: string;
  attempts: number;
  sentAt: Date;
  expiresAt: Date;
}

const orderOtpSchema = new Schema<IOrderOtp>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, required: true, default: 0 },
    sentAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

const OrderOtp = mongoose.model<IOrderOtp>("OrderOtp", orderOtpSchema);

export default OrderOtp;
