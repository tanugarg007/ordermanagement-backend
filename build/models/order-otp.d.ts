import mongoose, { Document } from "mongoose";
interface IOrderOtp extends Document {
    email: string;
    codeHash: string;
    attempts: number;
    sentAt: Date;
    expiresAt: Date;
}
declare const OrderOtp: mongoose.Model<IOrderOtp, {}, {}, {}, mongoose.Document<unknown, {}, IOrderOtp, {}, mongoose.DefaultSchemaOptions> & IOrderOtp & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrderOtp & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default OrderOtp;
//# sourceMappingURL=order-otp.d.ts.map