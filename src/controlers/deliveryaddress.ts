import {Request, response, Response} from "express";
import DeliveryAddress from "../models/deliveryaddressmodel";
import User from "../models/usermodel";
import mongoose from "mongoose";

interface IDeliveryAddressBody {
    name: string;
    state: string;
    city: string;
    phoneNumber: number;
    pincode: number;
    address: string;
    houseNumber: string;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getMyDeliveryAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.deliveryAddress) {
      return res.status(200).json({
        address: user.deliveryAddress,
        user: user.toJSON(),
      });
    }

    const matches = await DeliveryAddress.find({
      name: new RegExp(`^${escapeRegExp(user.name.trim())}$`, "i"),
    }).limit(2);

    if (matches.length > 1) {
      return res.status(409).json({
        message:
          "Multiple saved addresses match your name. Please save your address to your account once to continue.",
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
  } catch (error) {
    console.error("Error retrieving saved delivery address:", error);
    return res.status(500).json({
      message: "Could not retrieve saved delivery address.",
    });
  }
};

export const createDeliveryAddress = async (req: Request, res: Response) => {
  try {
    const { name, state, city, phoneNumber, pincode, address, houseNumber } = req.body as IDeliveryAddressBody;
     if (!name || !state || !city || !phoneNumber || !pincode || !address || !houseNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const data = await DeliveryAddress.create(  {
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
}

export const updateDeliveryAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedAddress = await DeliveryAddress.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        message: "Delivery address not found",
      });
    }

    res.status(200).json({
      message: "Delivery address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating delivery address",
      error,
    });
  }
};

export const deleteDeliveryAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const deletedAddress = await DeliveryAddress.findOneAndDelete({
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
  } catch (error) {
    res.status(500).json({
      message: "Error deleting delivery address",
      error,
    });
  }
};