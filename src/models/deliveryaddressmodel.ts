import mongoose, { Schema, Document } from 'mongoose';


export interface IDeliveryAddress extends Document {
  name: string;
  state: string;
  city: string;
  phoneNumber: number;
  pincode: number;
  address: string;
  houseNumber: string;
}

const deliveryAddressSchema = new Schema<IDeliveryAddress>(
    {
        name:{
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        phoneNumber: {
            type: Number,
            required: true,
            match: /^\d{10}$/
        },
        pincode: {
            type: Number,
            required: true,
            match: /^\d{6}$/
        },
        address: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        houseNumber: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        }
    }
)

const DeliveryAddress = mongoose.model<IDeliveryAddress>('DeliveryAddress', deliveryAddressSchema);
export default DeliveryAddress;