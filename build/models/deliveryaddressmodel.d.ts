import mongoose, { Document } from 'mongoose';
export interface IDeliveryAddress extends Document {
    name: string;
    state: string;
    city: string;
    phoneNumber: number;
    pincode: number;
    address: string;
    houseNumber: string;
}
declare const DeliveryAddress: mongoose.Model<IDeliveryAddress, {}, {}, {}, mongoose.Document<unknown, {}, IDeliveryAddress, {}, mongoose.DefaultSchemaOptions> & IDeliveryAddress & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDeliveryAddress>;
export default DeliveryAddress;
//# sourceMappingURL=deliveryaddressmodel.d.ts.map