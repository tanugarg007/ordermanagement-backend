import mongoose, { Document } from 'mongoose';
interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking';
    createdAt: Date;
    updatedAt: Date;
}
declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, mongoose.DefaultSchemaOptions> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default Payment;
//# sourceMappingURL=payment.d.ts.map