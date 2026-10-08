"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI must be set before connecting to MongoDB.");
    }
    await mongoose_1.default.connect(mongoUri);
    console.log("Connected to MongoDB");
};
exports.connectDatabase = connectDatabase;
//# sourceMappingURL=database.js.map