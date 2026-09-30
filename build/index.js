"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const approuter_1 = __importDefault(require("./router/approuter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/users", approuter_1.default);
app.post("/test", (req, res) => {
    res.json({
        message: "POST route is working"
    });
});
app.get("/", (req, res) => {
    res.json({
        message: "Order Management Backend is running",
    });
});
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error("MongoDB connection failed:", error);
});
//# sourceMappingURL=index.js.map