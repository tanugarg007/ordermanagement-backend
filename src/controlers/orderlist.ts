import { Request, Response } from "express";
import { OrderList } from "../models/orderlistmodel";
import User from "../models/usermodel";
import ItemList from "../models/itemlistmodel";
import mongoose from "mongoose";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, paymentMethod } = req.body;
    const userId = req.user?.id;
    const idempotencyKey = req.get("Idempotency-Key");

    if (
      !userId ||
      !mongoose.isValidObjectId(userId) ||
      (idempotencyKey !== undefined &&
        (!idempotencyKey.trim() || idempotencyKey.length > 128)) ||
      typeof productId !== "string" ||
      !mongoose.isValidObjectId(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      paymentMethod !== "cash"
    ) {
      return res.status(400).json({ message: "Invalid order details." });
    }

    if (idempotencyKey) {
      const existingOrder = await OrderList.findOne({
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

    const customer = await User.findById(userId);
    if (!customer || customer.role !== "user") {
      return res.status(401).json({ message: "A customer account is required to place an order." });
    }
    const deliveryAddress = customer.deliveryAddress;
    if (
      !deliveryAddress ||
      ![
        deliveryAddress.name,
        deliveryAddress.state,
        deliveryAddress.city,
        deliveryAddress.phoneNumber,
        deliveryAddress.pincode,
        deliveryAddress.address,
        deliveryAddress.houseNumber,
      ].every((value) => String(value || "").trim())
    ) {
      return res.status(400).json({
        message: "Save a complete delivery address before placing your order.",
      });
    }

    const product = await ItemList.findOneAndUpdate(
      { _id: productId, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    if (!product) {
      return res.status(409).json({
        message: "This item is no longer available in the requested quantity.",
      });
    }

    const order = new OrderList({
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
    } catch (error) {
      await ItemList.updateOne(
        { _id: product._id },
        { $inc: { quantity } }
      );
      if (
        idempotencyKey &&
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        const existingOrder = await OrderList.findOne({
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
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderList.find();

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const orders = await OrderList.find({
      $or: [
        { userId: new mongoose.Types.ObjectId(userId) },
        { userId: null, email: userEmail.toLowerCase() },
      ],
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({ message: "Could not fetch your orders." });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, items, quantity, totalAmount, status } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !normalizedEmail ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !items.every((item: unknown) => typeof item === "string" && item.trim()) ||
      !Array.isArray(quantity) ||
      quantity.length !== items.length ||
      !quantity.every(
        (value: unknown) =>
          typeof value === "number" && Number.isInteger(value) && value > 0
      ) ||
      !Number.isFinite(Number(totalAmount)) ||
      Number(totalAmount) <= 0 ||
      typeof status !== "string" ||
      !status.trim()
    ) {
      return res.status(400).json({ message: "Invalid order details." });
    }

    const customer = await User.findOne({ email: normalizedEmail });

    const updatedOrder = await OrderList.findByIdAndUpdate(
      id,
      {
        userId: customer?._id ?? null,
        name: name.trim(),
        email: normalizedEmail,
        items: items.map((item: string) => item.trim()),
        quantity,
        totalAmount: Number(totalAmount),
        status: status.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedOrder = await OrderList.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};