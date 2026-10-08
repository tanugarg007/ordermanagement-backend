import mongoose, { Schema, Document } from 'mongoose';

interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking';
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking'],
      required: true
    }
  },
  {
    timestamps: true
  }
);


const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;