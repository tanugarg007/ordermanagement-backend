import mongoose, { Schema, Document } from "mongoose";

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

const orderListSchema = new Schema<IOrderList>(
  {
     userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    items: {
      type: [String],
      required: true,
    },
    quantity: {
      type: [Number],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash"],
    },
    idempotencyKey: {
      type: String,
      trim: true,
    },
    deliveryAddress: {
      name: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      phoneNumber: { type: String, required: true, match: /^\d{10}$/ },
      pincode: { type: String, required: true, match: /^\d{6}$/ },
      address: { type: String, required: true, trim: true },
      houseNumber: { type: String, required: true, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

orderListSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
  }
);

export const OrderList = mongoose.model<IOrderList>(
  "OrderList",
  orderListSchema
);