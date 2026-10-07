import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import OrderOtp from "../models/orderotpmodel";
import { OrderList } from "../models/orderlistmodel";

const OTP_EXPIRY_SECONDS = 30;
const OTP_EXPIRY_MS = OTP_EXPIRY_SECONDS * 1_000;

const normalizeEmail = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

const hashOtp = (email: string, otp: string) =>
  createHmac(
    "sha256",
    process.env.ORDER_OTP_SECRET || process.env.JWT_SECRET || "change_me"
  )
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

export const sendOrderOtp = async (req: Request, res: Response) => {
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
    const currentChallenge = await OrderOtp.findOne({ email });
    if (
      currentChallenge &&
      now.getTime() - currentChallenge.sentAt.getTime() < 60_000
    ) {
      return res.status(429).json({ message: "Please wait before requesting another code." });
    }

    const otp = String(randomInt(100000, 1000000));
    const codeHash = hashOtp(email, otp);
    await OrderOtp.findOneAndUpdate(
      { email },
      {
        $set: {
          codeHash,
          attempts: 0,
          sentAt: now,
          expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      const transporter = nodemailer.createTransport({
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
    } catch (error) {
      await OrderOtp.deleteOne({ email, codeHash });
      throw error;
    }

    return res.status(200).json({
      message: "If the email can receive messages, a verification code has been sent.",
    });
  } catch (error) {
    console.error("Error sending order verification email:", error);
    return res.status(500).json({ message: "Could not send the verification code. Please try again." });
  }
};

export const verifyOrderOtp = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";
  if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: "Enter the email address and six-digit code." });
  }

  try {
    const challenge = await OrderOtp.findOne({ email });
    if (!challenge || challenge.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({ message: "The code is invalid or has expired. Request a new code." });
    }
    if (challenge.attempts >= 5) {
      await OrderOtp.deleteOne({ _id: challenge._id });
      return res.status(429).json({ message: "Too many incorrect codes. Request a new code." });
    }

    const expectedHash = Buffer.from(challenge.codeHash, "hex");
    const submittedHash = Buffer.from(hashOtp(email, otp), "hex");
    if (
      expectedHash.length !== submittedHash.length ||
      !timingSafeEqual(expectedHash, submittedHash)
    ) {
      const updated = await OrderOtp.findOneAndUpdate(
        { _id: challenge._id },
        { $inc: { attempts: 1 } },
        { new: true }
      );
      if (updated && updated.attempts >= 5) {
        await OrderOtp.deleteOne({ _id: updated._id });
      }
      return res.status(400).json({ message: "The code is incorrect." });
    }

    const consumed = await OrderOtp.findOneAndDelete({
      _id: challenge._id,
      codeHash: challenge.codeHash,
    });
    if (!consumed) {
      return res.status(400).json({ message: "The code has already been used. Request a new code." });
    }

    const orders = await OrderList.find({ email }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Email verified.", orders });
  } catch (error) {
    console.error("Error verifying order access code:", error);
    return res.status(500).json({ message: "Could not verify the code. Please try again." });
  }
};
