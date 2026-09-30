"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const usermodel_1 = __importDefault(require("../models/usermodel"));
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("CREATE USER BODY:", req.body);
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }
        const user = await usermodel_1.default.create({
            name,
            email,
            password,
        });
        return res.status(201).json({
            message: "User created successfully",
            user,
        });
    }
    catch (error) {
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
exports.createUser = createUser;
//# sourceMappingURL=user.js.map