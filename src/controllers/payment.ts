import {Request,Response} from 'express';
import Payment from "../models/payment";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { userId, orderId, amount, status, paymentMethod } = req.body;

    const payment = new Payment({
      userId,
      orderId,
      amount,
      status,
      paymentMethod
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error });
  }
};

export const getPayment = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find();

    res.status(200).json({
      message: "Payments fetched successfully",
      payments: payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      error,
    });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );

    res.status(200).json({
      message: "Payment status updated successfully",
      payment: payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating payment status",
      error,
    });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByIdAndDelete(paymentId);

    res.status(200).json({
      message: "Payment deleted successfully",
      payment: payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting payment",
      error,
    });
  }
};
