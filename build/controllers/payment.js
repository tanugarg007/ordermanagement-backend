"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.updatePaymentStatus = exports.getPayment = exports.createPayment = void 0;
const payment_1 = __importDefault(require("../models/payment"));
const createPayment = async (req, res) => {
    try {
        const { userId, orderId, amount, status, paymentMethod } = req.body;
        const payment = new payment_1.default({
            userId,
            orderId,
            amount,
            status,
            paymentMethod
        });
        await payment.save();
        res.status(201).json(payment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating payment', error });
    }
};
exports.createPayment = createPayment;
const getPayment = async (req, res) => {
    try {
        const payments = await payment_1.default.find();
        res.status(200).json({
            message: "Payments fetched successfully",
            payments: payments,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching payments",
            error,
        });
    }
};
exports.getPayment = getPayment;
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;
        const payment = await payment_1.default.findByIdAndUpdate(paymentId, { status }, { new: true });
        res.status(200).json({
            message: "Payment status updated successfully",
            payment: payment,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating payment status",
            error,
        });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await payment_1.default.findByIdAndDelete(paymentId);
        res.status(200).json({
            message: "Payment deleted successfully",
            payment: payment,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting payment",
            error,
        });
    }
};
exports.deletePayment = deletePayment;
//# sourceMappingURL=payment.js.map