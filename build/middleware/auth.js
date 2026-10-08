"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.optionalProtect = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Not authorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "change_me");
        req.user = { id: decoded.id, email: decoded.email };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Not authorized, invalid token" });
    }
};
exports.protect = protect;
const optionalProtect = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        next();
        return;
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, invalid token" });
    }
    try {
        const token = authHeader.slice("Bearer ".length);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "change_me");
        req.user = { id: decoded.id, email: decoded.email };
        next();
    }
    catch {
        return res.status(401).json({ message: "Not authorized, invalid token" });
    }
};
exports.optionalProtect = optionalProtect;
const requireRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            const user = req.user?.id ? await user_1.default.findById(req.user.id).select("role") : null;
            if (!user) {
                return res.status(401).json({ message: "Not authorized" });
            }
            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: "You do not have permission to perform this action." });
            }
            return next();
        }
        catch (error) {
            return next(error);
        }
    };
};
exports.requireRoles = requireRoles;
exports.default = exports.protect;
//# sourceMappingURL=auth.js.map