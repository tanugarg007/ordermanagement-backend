"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeliveryAddress = exports.updateDeliveryAddress = exports.createDeliveryAddress = exports.getMyDeliveryAddress = void 0;
const deliveryaddressmodel_1 = __importDefault(require("../models/deliveryaddressmodel"));
const usermodel_1 = __importDefault(require("../models/usermodel"));
const mongoose_1 = __importDefault(require("mongoose"));
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getMyDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId || !mongoose_1.default.isValidObjectId(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const user = await usermodel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.deliveryAddress) {
            return res.status(200).json({
                address: user.deliveryAddress,
                user: user.toJSON(),
            });
        }
        const matches = await deliveryaddressmodel_1.default.find({
            name: new RegExp(`^${escapeRegExp(user.name.trim())}$`, "i"),
        }).limit(2);
        if (matches.length > 1) {
            return res.status(409).json({
                message: "Multiple saved addresses match your name. Please save your address to your account once to continue.",
            });
        }
        const legacyAddress = matches[0];
        if (!legacyAddress) {
            return res.status(200).json({ address: null, user: user.toJSON() });
        }
        user.deliveryAddress = {
            name: legacyAddress.name,
            state: legacyAddress.state,
            city: legacyAddress.city,
            phoneNumber: String(legacyAddress.phoneNumber),
            pincode: String(legacyAddress.pincode),
            address: legacyAddress.address,
            houseNumber: legacyAddress.houseNumber,
        };
        await user.save();
        return res.status(200).json({
            address: user.deliveryAddress,
            user: user.toJSON(),
            migrated: true,
        });
    }
    catch (error) {
        console.error("Error retrieving saved delivery address:", error);
        return res.status(500).json({
            message: "Could not retrieve saved delivery address.",
        });
    }
};
exports.getMyDeliveryAddress = getMyDeliveryAddress;
const createDeliveryAddress = async (req, res) => {
    try {
        const { name, state, city, phoneNumber, pincode, address, houseNumber } = req.body;
        if (!name || !state || !city || !phoneNumber || !pincode || !address || !houseNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const data = await deliveryaddressmodel_1.default.create({
            name,
            state,
            city,
            phoneNumber,
            pincode,
            address,
            houseNumber
        });
        res.status(201).json({ message: "Delivery address created successfully", data });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating delivery address", error });
    }
};
exports.createDeliveryAddress = createDeliveryAddress;
const updateDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId || !mongoose_1.default.isValidObjectId(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const updatedAddress = await deliveryaddressmodel_1.default.findOneAndUpdate({ userId }, { $set: req.body }, { new: true, runValidators: true });
        if (!updatedAddress) {
            return res.status(404).json({
                message: "Delivery address not found",
            });
        }
        res.status(200).json({
            message: "Delivery address updated successfully",
            address: updatedAddress,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating delivery address",
            error,
        });
    }
};
exports.updateDeliveryAddress = updateDeliveryAddress;
const deleteDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId || !mongoose_1.default.isValidObjectId(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const deletedAddress = await deliveryaddressmodel_1.default.findOneAndDelete({
            userId,
        });
        if (!deletedAddress) {
            return res.status(404).json({
                message: "Delivery address not found",
            });
        }
        res.status(200).json({
            message: "Delivery address deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting delivery address",
            error,
        });
    }
};
exports.deleteDeliveryAddress = deleteDeliveryAddress;
//# sourceMappingURL=deliveryaddress.js.map