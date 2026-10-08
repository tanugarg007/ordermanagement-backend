import mongoose, { Document } from "mongoose";
export interface IOrderList extends Document {
    userId?: mongoose.Types.ObjectId | null;
    name: string;
    email: string;
    items: string[];
    quantity: number[];
    totalAmount: number;
    status: string;
    paymentMethod?: string;
    idempotencyKey?: string;
    deliveryAddress?: {
        name: string;
        state: string;
        city: string;
        phoneNumber: string;
        pincode: string;
        address: string;
        houseNumber: string;
    };
}
export declare const OrderList: mongoose.Model<IOrderList, {}, {}, {}, mongoose.Document<unknown, {}, IOrderList, {}, mongoose.DefaultSchemaOptions> & IOrderList & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrderList & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=order.d.ts.map