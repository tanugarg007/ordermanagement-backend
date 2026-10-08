"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderList = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const orderListSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    items: {
        type: [String],
        required: true,
    },
    quantity: {
        type: [Number],
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["cash"],
    },
    idempotencyKey: {
        type: String,
        trim: true,
    },
    deliveryAddress: {
        name: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, match: /^\d{10}$/ },
        pincode: { type: String, required: true, match: /^\d{6}$/ },
        address: { type: String, required: true, trim: true },
        houseNumber: { type: String, required: true, trim: true },
    },
}, {
    timestamps: true,
});
orderListSchema.index({ userId: 1, idempotencyKey: 1 }, {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
});
exports.OrderList = mongoose_1.default.model("OrderList", orderListSchema);
//# sourceMappingURL=order.js.map