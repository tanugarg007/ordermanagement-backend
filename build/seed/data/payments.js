"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payments = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.payments = [
    {
        userId: new mongoose_1.default.Types.ObjectId(),
        orderId: new mongoose_1.default.Types.ObjectId(),
        amount: 100.0,
        status: "pending",
        paymentMethod: "cash"
    },
    {
        userId: new mongoose_1.default.Types.ObjectId(),
        orderId: new mongoose_1.default.Types.ObjectId(),
        amount: 200.0,
        status: "completed",
        paymentMethod: "card"
    },
    {
        userId: new mongoose_1.default.Types.ObjectId(),
        orderId: new mongoose_1.default.Types.ObjectId(),
        amount: 150.0,
        status: "failed",
        paymentMethod: "upi"
    },
    {
        userId: new mongoose_1.default.Types.ObjectId(),
        orderId: new mongoose_1.default.Types.ObjectId(),
        amount: 250.0,
        status: "pending",
        paymentMethod: "netbanking"
    }
];
//# sourceMappingURL=payments.js.map