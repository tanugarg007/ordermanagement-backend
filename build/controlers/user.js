"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getAllUsers = exports.saveDeliveryAddress = exports.deleteMyAccount = exports.getProfile = exports.loginUser = exports.registerUser = void 0;
const usermodel_1 = __importDefault(require("../models/usermodel"));
const mongoose_1 = __importDefault(require("mongoose"));
const orderlistmodel_1 = require("../models/orderlistmodel");
const buildUserResponse = (user) => {
    const token = user.generateJWT();
    return {
        message: "Success",
        token,
        user: user.toJSON(),
    };
};
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Name, email and password are required" });
        }
        const requestedRole = role ?? "user";
        if (requestedRole !== "user" && requestedRole !== "admin") {
            return res.status(400).json({ message: "Role must be user or admin." });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long" });
        }
        const existing = await usermodel_1.default.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already exists" });
        }
        const user = await usermodel_1.default.create({
            name,
            email,
            password,
            role: requestedRole,
        });
        return res.status(201).json(buildUserResponse(user));
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({
            message: "Error registering user",
            error: error.message,
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const user = await usermodel_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const match = await user.comparePassword(password);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        return res.status(200).json(buildUserResponse(user));
    }
    catch (error) {
        return res.status(500).json({
            message: "Error logging in user",
            error: error.message,
        });
    }
};
exports.loginUser = loginUser;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId || !mongoose_1.default.isValidObjectId(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const user = await usermodel_1.default.findById(userId).select("-password -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching profile",
            error: error.message,
        });
    }
};
exports.getProfile = getProfile;
const deleteMyAccount = async (req, res) => {
    const userId = req.user?.id;
    if (!userId || !mongoose_1.default.isValidObjectId(userId)) {
        return res.status(401).json({ message: "Not authorized" });
    }
    const mongoSession = await mongoose_1.default.startSession();
    let accountNotFound = false;
    let accountIsAdmin = false;
    try {
        await mongoSession.withTransaction(async () => {
            const user = await usermodel_1.default.findById(userId).session(mongoSession);
            if (!user) {
                accountNotFound = true;
                return;
            }
            if (user.role !== "user") {
                accountIsAdmin = true;
                return;
            }
            await orderlistmodel_1.OrderList.deleteMany({
                $or: [
                    { userId: user._id },
                    { userId: null, email: user.email.toLowerCase() },
                ],
            }, { session: mongoSession });
            await usermodel_1.default.deleteOne({ _id: user._id }, { session: mongoSession });
        });
        if (accountNotFound) {
            return res.status(404).json({ message: "Account not found." });
        }
        if (accountIsAdmin) {
            return res.status(403).json({ message: "Administrator accounts cannot be deleted here." });
        }
        return res.status(200).json({
            message: "Account and order history deleted successfully.",
        });
    }
    catch (error) {
        console.error("Error deleting customer account:", error);
        return res.status(500).json({ message: "Could not delete account and order history." });
    }
    finally {
        await mongoSession.endSession();
    }
};
exports.deleteMyAccount = deleteMyAccount;
const saveDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId || !mongoose_1.default.isValidObjectId(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const normalizeField = (value) => typeof value === "string" && value.trim() ? value.trim() : null;
        const name = normalizeField(req.body.name);
        const state = normalizeField(req.body.state);
        const city = normalizeField(req.body.city);
        const phoneNumber = normalizeField(req.body.phoneNumber);
        const pincode = normalizeField(req.body.pincode);
        const addressLine = normalizeField(req.body.address);
        const houseNumber = normalizeField(req.body.houseNumber);
        if (!name ||
            !state ||
            !city ||
            !phoneNumber ||
            !pincode ||
            !addressLine ||
            !houseNumber) {
            return res.status(400).json({
                message: "All delivery address fields are required.",
            });
        }
        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits.",
            });
        }
        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                message: "PIN code must contain exactly 6 digits.",
            });
        }
        const deliveryAddress = {
            name,
            state,
            city,
            phoneNumber,
            pincode,
            address: addressLine,
            houseNumber,
        };
        const user = await usermodel_1.default.findByIdAndUpdate(userId, { $set: { deliveryAddress } }, { new: true, runValidators: true }).select("-password -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json({
            message: "Delivery address saved successfully.",
            user,
        });
    }
    catch (error) {
        console.error("Error saving delivery address:", error);
        return res.status(500).json({
            message: "Could not save delivery address.",
        });
    }
};
exports.saveDeliveryAddress = saveDeliveryAddress;
const getAllUsers = async (_req, res) => {
    try {
        const users = await usermodel_1.default.find().select("-password -__v").sort({ createdAt: -1 });
        return res.status(200).json({ count: users.length, users });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching users",
            error: error.message,
        });
    }
};
exports.getAllUsers = getAllUsers;
exports.createUser = exports.registerUser;
//# sourceMappingURL=user.js.map