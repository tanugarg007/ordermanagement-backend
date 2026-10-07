"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = void 0;
const otpmodel_1 = require("../models/otpmodel");
const sendOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }
        const otpDocument = new otpmodel_1.OTP({
            email,
            otp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        await otpDocument.save();
        return res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.sendOTP = sendOTP;
//# sourceMappingURL=send-otp.js.map