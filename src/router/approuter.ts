import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  createUser,
  deleteMyAccount,
  saveDeliveryAddress,
} from "../controlers/user";
import { orderWebhook } from "../controlers/ordercontroler";
import { sendOrderOtp, verifyOrderOtp } from "../controlers/orderaccess";
import {createItemList,getItemLists,getItemList, updateItemList, deleteItemList,} from "../controlers/itemlist";

import {
  createOrder,
  deleteOrder,
  getMyOrders,
  getOrders,
  updateOrder,
} from "../controlers/orderlist";

import upload from "../middleware/upload";
import { optionalProtect, protect } from "../middleware/auth";
import {
  createDeliveryAddress,
  deleteDeliveryAddress,
  getMyDeliveryAddress,
  updateDeliveryAddress,
} from "../controlers/deliveryaddress";
import { createPayment, getPayment, updatePaymentStatus, deletePayment } from "../controlers/payment";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controlers/product";



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
router.post("/user", optionalProtect, createUser);

router.get("/users", protect, getAllUsers);
router.get("/me", protect, getProfile);
router.delete("/me", protect, deleteMyAccount);
router.patch("/me/delivery-address", protect, saveDeliveryAddress);

// Items
router.get("/items", getItemLists);
router.get("/items/:id", getItemList);
router.post("/items", upload.single("image"), createItemList);
router.put("/items/:id", upload.single("image"), updateItemList);
router.delete("/items/:id", deleteItemList);

router.post("/orders", protect, createOrder);
router.get("/orders/mine", protect, getMyOrders);
router.post("/orders/email-otp", sendOrderOtp);
router.post("/orders/verify-email-otp", verifyOrderOtp);
router.get("/orders", getOrders);
router.patch("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);

router.get("/delivery-address/mine", protect, getMyDeliveryAddress);
router.post("/delivery-address", createDeliveryAddress);
router.patch('/delivery-address/:id', protect, updateDeliveryAddress);
router.delete('/delivery-address/:id', protect, deleteDeliveryAddress);

router.post('/payment', createPayment);
router.get('/payments', getPayment);
router.patch('/payments/:id', updatePaymentStatus);
router.delete('/payments/:id', deletePayment);

router.post("/orders/webhook", orderWebhook);

router.post("/products", upload.single("image"), createProduct);
router.get("/products", getProducts);

router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);





export default router;