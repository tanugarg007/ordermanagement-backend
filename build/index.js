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
const upload_1 = require("./middleware/upload");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express_1.default.static(upload_1.UPLOAD_ABSOLUTE_DIR));
app.use("/users", approuter_1.default);
app.post("/test", (req, res) => {
    res.json({
        message: "POST route is working",
        body: req.body,
    });
});
app.get("/", (_req, res) => {
    res.json({
        message: "Order Management Backend is running",
        endpoints: {
            health: "GET /api/health",
            auth: {
                register: "POST /api/register { name, email, password, role }",
                login: "POST /api/login { email, password }",
                deliveryAddress: "PATCH /users/me/delivery-address [authenticated]",
                me: "GET /api/me [Bearer <token>]",
                users: "GET /api/users [Bearer <token>]",
            },
            items: {
                list: "GET /api/items?category=&status=&search=&sortBy=&order=&limit=&page=",
                get: "GET /api/items/:id",
                create: "POST /api/items [multipart/form-data, field 'image' file upload, Bearer <token>]",
                update: "PATCH /api/items/:id [multipart/form-data, field 'image' file upload, Bearer <token>]",
                delete: "DELETE /api/items/:id [Bearer <token>]",
            },
        },
    });
});
const errorHandler = (err, _req, res, _next) => {
    if (err && typeof err === "object" && "code" in err && err.code === "LIMIT_FILE_SIZE") {
        return res
            .status(413)
            .json({ message: "File too large. Max 5MB allowed." });
    }
    const msg = err instanceof Error ? err.message : "Unknown server error";
    if (msg.toLowerCase().includes("only image files")) {
        return res.status(415).json({ message: msg });
    }
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ message: msg });
};
app.use(errorHandler);
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("Connected to MongoDB");
    app.listen(Number(PORT), () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Uploads served at /uploads (folder: ${upload_1.UPLOAD_ABSOLUTE_DIR})`);
    });
})
    .catch((error) => {
    console.error("MongoDB connection failed:", error);
});
//# sourceMappingURL=index.js.map