import mongoose, { Document } from 'mongoose';
interface OTPDocument extends Document {
    email: string;
    otp: number;
    createdAt: Date;
    expiresAt: Date;
}
declare const OTP: mongoose.Model<OTPDocument, {}, {}, {}, mongoose.Document<unknown, {}, OTPDocument, {}, mongoose.DefaultSchemaOptions> & OTPDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, OTPDocument>;
export default OTP;
//# sourceMappingURL=otpmodel.d.ts.map