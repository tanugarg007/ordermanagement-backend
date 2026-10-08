"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderWebhook = void 0;
const order_1 = require("../models/order");
const orderWebhook = async (req, res) => {
    console.log("Webhook controller hit");
    console.log("Webhook body:", req.body);
    try {
        const { orderId, status } = req.body;
        console.log("orderId:", orderId);
        console.log("status:", status);
        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }
        if (status === "confirmed") {
            console.log("Status is confirmed");
            await order_1.OrderList.findByIdAndUpdate(orderId, {
                status: "confirmed",
            });
            console.log("Order status updated");
            return res.status(200).json({
                success: true,
                message: "Order confirmed successfully",
            });
        }
        return res.status(200).json({
            success: false,
            message: "Order not confirmed",
        });
    }
    catch (error) {
        console.log("Webhook error:", error);
        return res.status(500).json({
            message: "Webhook error",
            error,
        });
    }
};
exports.orderWebhook = orderWebhook;
//# sourceMappingURL=order-webhook.js.map