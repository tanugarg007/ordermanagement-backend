import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  createUser,
  getStaffUsers,
  deleteMyAccount,
  saveDeliveryAddress,
} from "../controllers/user";
import { orderWebhook } from "../controllers/order-webhook";
import { sendOrderOtp, verifyOrderOtp } from "../controllers/order-access";
import { createItemList, getItemLists, getItemList, updateItemList, deleteItemList } from "../controllers/inventory";

import {
  createOrder,
  deleteOrder,
  getMyOrders,
  getOrders,
  updateOrder,
} from "../controllers/order";

import upload from "../middleware/upload";
import { optionalProtect, protect, requireRoles } from "../middleware/auth";
import {
  createDeliveryAddress,
  deleteDeliveryAddress,
  getMyDeliveryAddress,
  updateDeliveryAddress,
} from "../controllers/delivery-address";
import { createPayment, getPayment, updatePaymentStatus, deletePayment } from "../controllers/payment";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controllers/catalog-product";



const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    message: "Router is healthy",
    ok: true,
    timestamp: Date.now(),
  });
});

router.post("/register", optionalProtect, registerUser);
router.post("/login", loginUser);
router.post("/user", protect, requireRoles("admin", "superadmin"), createUser);

router.get("/users", protect, requireRoles("admin", "superadmin"), getAllUsers);
router.get("/staff", protect, requireRoles("admin", "superadmin"), getStaffUsers);
router.get("/me", protect, getProfile);
router.delete("/me", protect, deleteMyAccount);
router.patch("/me/delivery-address", protect, saveDeliveryAddress);

// Items
router.get("/items", getItemLists);
router.get("/items/:id", getItemList);
router.post("/items", protect, requireRoles("admin", "superadmin", "inventory"), upload.single("image"), createItemList);
router.put("/items/:id", protect, requireRoles("admin", "superadmin", "inventory"), upload.single("image"), updateItemList);
router.patch("/items/:id", protect, requireRoles("admin", "superadmin", "inventory"), upload.single("image"), updateItemList);
router.delete("/items/:id", protect, requireRoles("admin", "superadmin", "inventory"), deleteItemList);

router.post("/orders", protect, createOrder);
router.get("/orders/mine", protect, getMyOrders);
router.post("/orders/email-otp", sendOrderOtp);
router.post("/orders/verify-email-otp", verifyOrderOtp);
router.get("/orders", protect, requireRoles("admin", "superadmin"), getOrders);
router.patch("/orders/:id", protect, requireRoles("admin", "superadmin"), updateOrder);
router.delete("/orders/:id", protect, requireRoles("admin", "superadmin"), deleteOrder);

router.get("/delivery-address/mine", protect, getMyDeliveryAddress);
router.post("/delivery-address", createDeliveryAddress);
router.patch('/delivery-address/:id', protect, updateDeliveryAddress);
router.delete('/delivery-address/:id', protect, deleteDeliveryAddress);

router.post("/payment", protect, requireRoles("user", "admin", "superadmin"), createPayment);
router.get("/payments", protect, requireRoles("admin", "superadmin"), getPayment);
router.patch("/payments/:id", protect, requireRoles("admin", "superadmin"), updatePaymentStatus);
router.delete("/payments/:id", protect, requireRoles("admin", "superadmin"), deletePayment);

router.post("/orders/webhook", orderWebhook);

router.post("/products", protect, requireRoles("admin", "superadmin", "inventory"), upload.single("image"), createProduct);
router.get("/products", getProducts);

router.put("/products/:id", protect, requireRoles("admin", "superadmin", "inventory"), upload.single("image"), updateProduct);
router.delete("/products/:id", protect, requireRoles("admin", "superadmin", "inventory"), deleteProduct);





export default router;