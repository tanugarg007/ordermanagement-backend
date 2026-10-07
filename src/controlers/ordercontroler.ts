import { Request, Response } from "express";  
import { OrderList } from "../models/orderlistmodel";
export const orderWebhook = async (req: Request, res: Response) => {
  console.log("Webhook controller hit");
  console.log("Webhook body:", req.body);

  try {
    const { orderId, status } = req.body;

    console.log("orderId:", orderId);
    console.log("status:", status);

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    if (status === "confirmed") {
      console.log("Status is confirmed");

      await OrderList.findByIdAndUpdate(orderId, {
        status: "confirmed",
      });

      console.log("Order status updated");

      return res.status(200).json({
        success: true,
        message: "Order confirmed successfully",
      });
    }

   

    return res.status(200).json({
      success: false,
      message: "Order not confirmed",
    });

  } catch (error) {
    console.log("Webhook error:", error);

    return res.status(500).json({
      message: "Webhook error",
      error,
    });
  }
};