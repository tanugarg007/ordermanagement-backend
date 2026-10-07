"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentWebhook = void 0;
const paymentWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log("Webhook received:", event);
        // Payment event check karo
        // Signature verify karo
        // Database update karo
        res.status(200).json({
            message: "Webhook received successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Webhook error",
            error,
        });
    }
};
exports.paymentWebhook = paymentWebhook;
//# sourceMappingURL=paymentwebhook.js.map