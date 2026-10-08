import mongoose from "mongoose";
export interface PaymentSeed {
    userId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    amount: number;
    status?: "pending" | "completed" | "failed";
    paymentMethod: "cash" | "card" | "upi" | "netbanking";
}
export declare const payments: PaymentSeed[];
//# sourceMappingURL=payments.d.ts.map