"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controlers/user");
const ordercontroler_1 = require("../controlers/ordercontroler");
const orderaccess_1 = require("../controlers/orderaccess");
const itemlist_1 = require("../controlers/itemlist");
const orderlist_1 = require("../controlers/orderlist");
const upload_1 = __importDefault(require("../middleware/upload"));
const auth_1 = require("../middleware/auth");
const deliveryaddress_1 = require("../controlers/deliveryaddress");
const payment_1 = require("../controlers/payment");
const product_1 = require("../controlers/product");
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
router.post("/user", auth_1.optionalProtect, user_1.createUser);
router.get("/users", auth_1.protect, user_1.getAllUsers);
router.get("/me", auth_1.protect, user_1.getProfile);
router.delete("/me", auth_1.protect, user_1.deleteMyAccount);
router.patch("/me/delivery-address", auth_1.protect, user_1.saveDeliveryAddress);
// Items
router.get("/items", itemlist_1.getItemLists);
router.get("/items/:id", itemlist_1.getItemList);
router.post("/items", upload_1.default.single("image"), itemlist_1.createItemList);
router.put("/items/:id", upload_1.default.single("image"), itemlist_1.updateItemList);
router.delete("/items/:id", itemlist_1.deleteItemList);
router.post("/orders", auth_1.protect, orderlist_1.createOrder);
router.get("/orders/mine", auth_1.protect, orderlist_1.getMyOrders);
router.post("/orders/email-otp", orderaccess_1.sendOrderOtp);
router.post("/orders/verify-email-otp", orderaccess_1.verifyOrderOtp);
router.get("/orders", orderlist_1.getOrders);
router.patch("/orders/:id", orderlist_1.updateOrder);
router.delete("/orders/:id", orderlist_1.deleteOrder);
router.get("/delivery-address/mine", auth_1.protect, deliveryaddress_1.getMyDeliveryAddress);
router.post("/delivery-address", deliveryaddress_1.createDeliveryAddress);
router.patch('/delivery-address/:id', auth_1.protect, deliveryaddress_1.updateDeliveryAddress);
router.delete('/delivery-address/:id', auth_1.protect, deliveryaddress_1.deleteDeliveryAddress);
router.post('/payment', payment_1.createPayment);
router.get('/payments', payment_1.getPayment);
router.patch('/payments/:id', payment_1.updatePaymentStatus);
router.delete('/payments/:id', payment_1.deletePayment);
router.post("/orders/webhook", ordercontroler_1.orderWebhook);
router.post("/products", upload_1.default.single("image"), product_1.createProduct);
router.get("/products", product_1.getProducts);
router.put("/products/:id", upload_1.default.single("image"), product_1.updateProduct);
router.delete("/products/:id", product_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=approuter.js.map