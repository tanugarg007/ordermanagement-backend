import mongoose from "mongoose";

export interface PaymentSeed {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  amount: number;
  status?: "pending" | "completed" | "failed";
  paymentMethod: "cash" | "card" | "upi" | "netbanking";
}

export const payments: PaymentSeed[] = [
  {
    userId: new mongoose.Types.ObjectId(),
    orderId: new mongoose.Types.ObjectId(),
    amount: 100.0,
    status: "pending",
    paymentMethod: "cash"
  },
  {
    userId: new mongoose.Types.ObjectId(),
    orderId: new mongoose.Types.ObjectId(),
    amount: 200.0,
    status: "completed",
    paymentMethod: "card"
  },
  {
    userId: new mongoose.Types.ObjectId(),
    orderId: new mongoose.Types.ObjectId(),
    amount: 150.0,
    status: "failed",
    paymentMethod: "upi"
  },
  {
    userId: new mongoose.Types.ObjectId(),
    orderId: new mongoose.Types.ObjectId(),
    amount: 250.0,
    status: "pending",
    paymentMethod: "netbanking"
  }
];
