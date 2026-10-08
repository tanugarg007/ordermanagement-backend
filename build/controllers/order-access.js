"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOrderOtp = exports.sendOrderOtp = void 0;
const crypto_1 = require("crypto");
const nodemailer_1 = __importDefault(require("nodemailer"));
const order_otp_1 = __importDefault(require("../models/order-otp"));
const order_1 = require("../models/order");
const OTP_EXPIRY_SECONDS = 30;
const OTP_EXPIRY_MS = OTP_EXPIRY_SECONDS * 1_000;
const normalizeEmail = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
const hashOtp = (email, otp) => (0, crypto_1.createHmac)("sha256", process.env.ORDER_OTP_SECRET || process.env.JWT_SECRET || "change_me")
    .update(`${email}:${otp}`)
    .digest("hex");
const mailConfiguration = () => {
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT || 587);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const from = process.env.EMAIL_FROM || user;
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass || !from) {
        return null;
    }
    return { host, port, user, pass, from };
};
const sendOrderOtp = async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
    }
    const mail = mailConfiguration();
    if (!mail) {
        return res.status(503).json({ message: "Email verification is not configured. Please contact support." });
    }
    const now = new Date();
    try {
        const currentChallenge = await order_otp_1.default.findOne({ email });
        if (currentChallenge &&
            now.getTime() - currentChallenge.sentAt.getTime() < 60_000) {
            return res.status(429).json({ message: "Please wait before requesting another code." });
        }
        const otp = String((0, crypto_1.randomInt)(100000, 1000000));
        const codeHash = hashOtp(email, otp);
        await order_otp_1.default.findOneAndUpdate({ email }, {
            $set: {
                codeHash,
                attempts: 0,
                sentAt: now,
                expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: mail.host,
                port: mail.port,
                secure: mail.port === 465,
                auth: { user: mail.user, pass: mail.pass },
            });
            await transporter.sendMail({
                from: mail.from,
                to: email,
                subject: "Your order verification code",
                text: `Your order verification code is ${otp}. It expires in ${OTP_EXPIRY_SECONDS} seconds.`,
                html: `<p>Your order verification code is <strong>${otp}</strong>.</p><p>It expires in ${OTP_EXPIRY_SECONDS} seconds. If you did not request this code, you can ignore this email.</p>`,
            });
        }
        catch (error) {
            await order_otp_1.default.deleteOne({ email, codeHash });
            throw error;
        }
        return res.status(200).json({
            message: "If the email can receive messages, a verification code has been sent.",
        });
    }
    catch (error) {
        console.error("Error sending order verification email:", error);
        return res.status(500).json({ message: "Could not send the verification code. Please try again." });
    }
};
exports.sendOrderOtp = sendOrderOtp;
const verifyOrderOtp = async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";
    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: "Enter the email address and six-digit code." });
    }
    try {
        const challenge = await order_otp_1.default.findOne({ email });
        if (!challenge || challenge.expiresAt.getTime() <= Date.now()) {
            return res.status(400).json({ message: "The code is invalid or has expired. Request a new code." });
        }
        if (challenge.attempts >= 5) {
            await order_otp_1.default.deleteOne({ _id: challenge._id });
            return res.status(429).json({ message: "Too many incorrect codes. Request a new code." });
        }
        const expectedHash = Buffer.from(challenge.codeHash, "hex");
        const submittedHash = Buffer.from(hashOtp(email, otp), "hex");
        if (expectedHash.length !== submittedHash.length ||
            !(0, crypto_1.timingSafeEqual)(expectedHash, submittedHash)) {
            const updated = await order_otp_1.default.findOneAndUpdate({ _id: challenge._id }, { $inc: { attempts: 1 } }, { new: true });
            if (updated && updated.attempts >= 5) {
                await order_otp_1.default.deleteOne({ _id: updated._id });
            }
            return res.status(400).json({ message: "The code is incorrect." });
        }
        const consumed = await order_otp_1.default.findOneAndDelete({
            _id: challenge._id,
            codeHash: challenge.codeHash,
        });
        if (!consumed) {
            return res.status(400).json({ message: "The code has already been used. Request a new code." });
        }
        const orders = await order_1.OrderList.find({ email }).sort({ createdAt: -1 });
        return res.status(200).json({ message: "Email verified.", orders });
    }
    catch (error) {
        console.error("Error verifying order access code:", error);
        return res.status(500).json({ message: "Could not verify the code. Please try again." });
    }
};
exports.verifyOrderOtp = verifyOrderOtp;
//# sourceMappingURL=order-access.js.map