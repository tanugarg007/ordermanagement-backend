import { Request, Response } from "express";
import User from "../models/usermodel";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export const createUser = async (
  req: Request<{}, {}, CreateUserRequest>,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    console.log("CREATE USER BODY:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};