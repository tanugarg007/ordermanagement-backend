import { Request, Response } from "express";
import User, { IUser, UserRole } from "../models/user";
import mongoose from "mongoose";
import { OrderList } from "../models/order";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "inventory";
}

interface LoginRequest {
  email: string;
  password: string;
}

interface DeliveryAddressRequest {
  name: string;
  state: string;
  city: string;
  phoneNumber: string;
  pincode: string;
  address: string;
  houseNumber: string;
}

const buildUserResponse = (user: IUser) => {
  const token = user.generateJWT();
  return {
    message: "Success",
    token,
    user: user.toJSON(),
  };
};

export const registerUser = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (role !== undefined && role !== "user") {
      return res.status(400).json({ message: "Public registration is only available for customer accounts." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user",
    });

    return res.status(201).json(buildUserResponse(user));
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const createStaffUser = async (
  req: Request<{}, {}, CreateStaffRequest>,
  res: Response
) => {
  try {
    const { name, email, password, role } = req.body;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, password and role are required.",
      });
    }
    if (role !== "superadmin" && role !== "inventory") {
      return res.status(400).json({
        message: "Role must be superadmin or inventory.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    return res.status(201).json({
      message: "Staff account created successfully.",
      user: user.toJSON(),
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({
      message: "Error creating staff account",
      error: error.message,
    });
  }
};

export const loginUser = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
     const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ 
      email: normalizedEmail
     });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json(buildUserResponse(user));
  } 
  catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

export const deleteMyAccount = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const mongoSession = await mongoose.startSession();
  let accountNotFound = false;
  let accountIsAdmin = false;

  try {
    await mongoSession.withTransaction(async () => {
      const user = await User.findById(userId).session(mongoSession);
      if (!user) {
        accountNotFound = true;
        return;
      }
      if (user.role !== "user") {
        accountIsAdmin = true;
        return;
      }

      await OrderList.deleteMany(
        {
          $or: [
            { userId: user._id },
            { userId: null, email: user.email.toLowerCase() },
          ],
        },
        { session: mongoSession }
      );
      await User.deleteOne({ _id: user._id }, { session: mongoSession });
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
  } catch (error) {
    console.error("Error deleting customer account:", error);
    return res.status(500).json({ message: "Could not delete account and order history." });
  } finally {
    await mongoSession.endSession();
  }
};

export const saveDeliveryAddress = async (
  req: Request<{}, {}, DeliveryAddressRequest>,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const normalizeField = (value: unknown) =>
      typeof value === "string" && value.trim() ? value.trim() : null;
    const name = normalizeField(req.body.name);
    const state = normalizeField(req.body.state);
    const city = normalizeField(req.body.city);
    const phoneNumber = normalizeField(req.body.phoneNumber);
    const pincode = normalizeField(req.body.pincode);
    const addressLine = normalizeField(req.body.address);
    const houseNumber = normalizeField(req.body.houseNumber);

    if (
      !name ||
      !state ||
      !city ||
      !phoneNumber ||
      !pincode ||
      !addressLine ||
      !houseNumber
    ) {
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

    const deliveryAddress: DeliveryAddressRequest = {
      name,
      state,
      city,
      phoneNumber,
      pincode,
      address: addressLine,
      houseNumber,
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { deliveryAddress } },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Delivery address saved successfully.",
      user,
    });
  } catch (error) {
    console.error("Error saving delivery address:", error);
    return res.status(500).json({
      message: "Could not save delivery address.",
    });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password -__v")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getStaffUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $in: ["admin", "superadmin", "inventory"] } })
      .select("-password -__v")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching staff accounts",
      error: error.message,
    });
  }
};

export const createUser = createStaffUser;
