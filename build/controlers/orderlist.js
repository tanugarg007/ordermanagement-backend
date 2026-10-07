"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.getMyOrders = exports.getOrders = exports.createOrder = void 0;
const orderlistmodel_1 = require("../models/orderlistmodel");
const usermodel_1 = __importDefault(require("../models/usermodel"));
const itemlistmodel_1 = __importDefault(require("../models/itemlistmodel"));
const mongoose_1 = __importDefault(require("mongoose"));
const createOrder = async (req, res) => {
    try {
        const { productId, quantity, paymentMethod } = req.body;
        const userId = req.user?.id;
        const idempotencyKey = req.get("Idempotency-Key");
        if (!userId ||
            !mongoose_1.default.isValidObjectId(userId) ||
            (idempotencyKey !== undefined &&
                (!idempotencyKey.trim() || idempotencyKey.length > 128)) ||
            typeof productId !== "string" ||
            !mongoose_1.default.isValidObjectId(productId) ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            paymentMethod !== "cash") {
            return res.status(400).json({ message: "Invalid order details." });
        }
        if (idempotencyKey) {
            const existingOrder = await orderlistmodel_1.OrderList.findOne({
                userId,
                idempotencyKey,
            });
            if (existingOrder) {
                return res.status(200).json({
                    message: "Order already created",
                    order: existingOrder,
                });
            }
        }
        const customer = await usermodel_1.default.findById(userId);
        if (!customer || customer.role !== "user") {
            return res.status(401).json({ message: "A customer account is required to place an order." });
        }
        const deliveryAddress = customer.deliveryAddress;
        if (!deliveryAddress ||
            ![
                deliveryAddress.name,
                deliveryAddress.state,
                deliveryAddress.city,
                deliveryAddress.phoneNumber,
                deliveryAddress.pincode,
                deliveryAddress.address,
                deliveryAddress.houseNumber,
            ].every((value) => String(value || "").trim())) {
            return res.status(400).json({
                message: "Save a complete delivery address before placing your order.",
            });
        }
        const product = await itemlistmodel_1.default.findOneAndUpdate({ _id: productId, quantity: { $gte: quantity } }, { $inc: { quantity: -quantity } }, { new: true });
        if (!product) {
            return res.status(409).json({
                message: "This item is no longer available in the requested quantity.",
            });
        }
        const order = new orderlistmodel_1.OrderList({
            userId: customer._id,
            name: customer.name,
            email: customer.email,
            items: [product.name],
            quantity: [quantity],
            totalAmount: product.price * quantity,
            status: "Pending",
            paymentMethod,
            ...(idempotencyKey ? { idempotencyKey } : {}),
            deliveryAddress: {
                name: deliveryAddress.name,
                state: deliveryAddress.state,
                city: deliveryAddress.city,
                phoneNumber: deliveryAddress.phoneNumber,
                pincode: deliveryAddress.pincode,
                address: deliveryAddress.address,
                houseNumber: deliveryAddress.houseNumber,
            },
        });
        let savedOrder;
        try {
            savedOrder = await order.save();
        }
        catch (error) {
            await itemlistmodel_1.default.updateOne({ _id: product._id }, { $inc: { quantity } });
            if (idempotencyKey &&
                error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === 11000) {
                const existingOrder = await orderlistmodel_1.OrderList.findOne({
                    userId,
                    idempotencyKey,
                });
                if (existingOrder) {
                    return res.status(200).json({
                        message: "Order already created",
                        order: existingOrder,
                    });
                }
            }
            throw error;
        }
        res.status(201).json({
            message: "Order created successfully",
            order: savedOrder,
        });
    }
    catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const orders = await orderlistmodel_1.OrderList.find();
        res.status(200).json({
            message: "Orders retrieved successfully",
            orders,
        });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
exports.getOrders = getOrders;
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userEmail = req.user?.email;
        if (!userId || !userEmail || !mongoose_1.default.isValidObjectId(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const orders = await orderlistmodel_1.OrderList.find({
            $or: [
                { userId: new mongoose_1.default.Types.ObjectId(userId) },
                { userId: null, email: userEmail.toLowerCase() },
            ],
        }).sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Orders retrieved successfully",
            orders,
        });
    }
    catch (error) {
        console.error("Error fetching customer orders:", error);
        return res.status(500).json({ message: "Could not fetch your orders." });
    }
};
exports.getMyOrders = getMyOrders;
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, items, quantity, totalAmount, status } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        if (typeof name !== "string" ||
            !name.trim() ||
            !normalizedEmail ||
            !Array.isArray(items) ||
            items.length === 0 ||
            !items.every((item) => typeof item === "string" && item.trim()) ||
            !Array.isArray(quantity) ||
            quantity.length !== items.length ||
            !quantity.every((value) => typeof value === "number" && Number.isInteger(value) && value > 0) ||
            !Number.isFinite(Number(totalAmount)) ||
            Number(totalAmount) <= 0 ||
            typeof status !== "string" ||
            !status.trim()) {
            return res.status(400).json({ message: "Invalid order details." });
        }
        const customer = await usermodel_1.default.findOne({ email: normalizedEmail });
        const updatedOrder = await orderlistmodel_1.OrderList.findByIdAndUpdate(id, {
            userId: customer?._id ?? null,
            name: name.trim(),
            email: normalizedEmail,
            items: items.map((item) => item.trim()),
            quantity,
            totalAmount: Number(totalAmount),
            status: status.trim(),
        }, { new: true, runValidators: true });
        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found",
            });
        }
        res.status(200).json({
            message: "Order updated successfully",
            order: updatedOrder,
        });
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await orderlistmodel_1.OrderList.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({
                message: "Order not found",
            });
        }
        res.status(200).json({
            message: "Order deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
exports.deleteOrder = deleteOrder;
//# sourceMappingURL=orderlist.js.map