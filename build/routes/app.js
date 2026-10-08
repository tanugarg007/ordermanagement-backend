"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const order_webhook_1 = require("../controllers/order-webhook");
const order_access_1 = require("../controllers/order-access");
const inventory_1 = require("../controllers/inventory");
const order_1 = require("../controllers/order");
const upload_1 = __importDefault(require("../middleware/upload"));
const auth_1 = require("../middleware/auth");
const delivery_address_1 = require("../controllers/delivery-address");
const payment_1 = require("../controllers/payment");
const catalog_product_1 = require("../controllers/catalog-product");
const router = express_1.default.Router();
router.get("/health", (_req, res) => {
    res.json({
        message: "Router is healthy",
        ok: true,
        timestamp: Date.now(),
    });
});
router.post("/register", auth_1.optionalProtect, user_1.registerUser);
router.post("/login", user_1.loginUser);
router.post("/user", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), user_1.createUser);
router.get("/users", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), user_1.getAllUsers);
router.get("/staff", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), user_1.getStaffUsers);
router.get("/me", auth_1.protect, user_1.getProfile);
router.delete("/me", auth_1.protect, user_1.deleteMyAccount);
router.patch("/me/delivery-address", auth_1.protect, user_1.saveDeliveryAddress);
// Items
router.get("/items", inventory_1.getItemLists);
router.get("/items/:id", inventory_1.getItemList);
router.post("/items", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin", "inventory"), upload_1.default.single("image"), inventory_1.createItemList);
router.put("/items/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin", "inventory"), upload_1.default.single("image"), inventory_1.updateItemList);
router.patch("/items/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin", "inventory"), upload_1.default.single("image"), inventory_1.updateItemList);
router.delete("/items/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin", "inventory"), inventory_1.deleteItemList);
router.post("/orders", auth_1.protect, order_1.createOrder);
router.get("/orders/mine", auth_1.protect, order_1.getMyOrders);
router.post("/orders/email-otp", order_access_1.sendOrderOtp);
router.post("/orders/verify-email-otp", order_access_1.verifyOrderOtp);
router.get("/orders", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), order_1.getOrders);
router.patch("/orders/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), order_1.updateOrder);
router.delete("/orders/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), order_1.deleteOrder);
router.get("/delivery-address/mine", auth_1.protect, delivery_address_1.getMyDeliveryAddress);
router.post("/delivery-address", delivery_address_1.createDeliveryAddress);
router.patch('/delivery-address/:id', auth_1.protect, delivery_address_1.updateDeliveryAddress);
router.delete('/delivery-address/:id', auth_1.protect, delivery_address_1.deleteDeliveryAddress);
router.post("/payment", auth_1.protect, (0, auth_1.requireRoles)("user", "admin", "superadmin"), payment_1.createPayment);
router.get("/payments", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), payment_1.getPayment);
router.patch("/payments/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), payment_1.updatePaymentStatus);
router.delete("/payments/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin"), payment_1.deletePayment);
router.post("/orders/webhook", order_webhook_1.orderWebhook);
router.post("/products", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin", "inventory"), upload_1.default.single("image"), catalog_product_1.createProduct);
router.get("/products", catalog_product_1.getProducts);
router.put("/products/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin", "inventory"), upload_1.default.single("image"), catalog_product_1.updateProduct);
router.delete("/products/:id", auth_1.protect, (0, auth_1.requireRoles)("admin", "superadmin", "inventory"), catalog_product_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=app.js.map