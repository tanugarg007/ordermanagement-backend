"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalProtect = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
exports.default = exports.protect;
//# sourceMappingURL=auth.js.map