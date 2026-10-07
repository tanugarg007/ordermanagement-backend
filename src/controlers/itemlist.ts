import { Request, Response } from "express";
import ItemList from "../models/itemlistmodel";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

interface IItemListBody {
  name: string;
  price: number | string;
  quantity: number | string;
  category: string;
  status: string;
  image?: string;
}

const deleteImageFile = (imagePath?: string) => {
  if (!imagePath) return;
  try {
    const abs = path.isAbsolute(imagePath) ? imagePath : path.resolve(imagePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {
    /* ignore */
  }
};

const resolveImageUrl = (
  req: Request,
  filename?: string,
  fallbackImage?: string
) => {
  if (filename) {
    const protocol =
      (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
    const host =
      (req.headers["x-forwarded-host"] as string) ||
      req.headers.host ||
      "localhost:5000";
    return `${protocol}://${host}/uploads/${filename}`;
  }
  return fallbackImage || "";
};

export const createItemList = async (req: Request, res: Response) => {
  try {
    const { name, price, quantity, category, status } =
      req.body as IItemListBody;
    const fallbackImage = (req.body as IItemListBody).image;

    if (
      !name ||
      price === undefined ||
      price === null ||
      price === "" ||
      quantity === undefined ||
      quantity === null ||
      quantity === "" ||
      !category ||
      !status
    ) {
      deleteImageFile(req.file?.path);
      return res.status(400).json({
        message:
          "All fields (name, price, quantity, category, status) are required",
      });
    }

    const imageUrl = resolveImageUrl(req, req.file?.filename, fallbackImage);
    if (!imageUrl) {
      deleteImageFile(req.file?.path);
      return res.status(400).json({
        message: "Item image is required (file upload or 'image' URL)",
      });
    }

    const numericPrice = Number(price);
    const numericQty = Number(quantity);
    if (
      Number.isNaN(numericPrice) ||
      Number.isNaN(numericQty) ||
      numericPrice < 0 ||
      numericQty < 0
    ) {
      deleteImageFile(req.file?.path);
      return res.status(400).json({
        message: "Price and quantity must be non-negative numbers",
      });
    }

    const newItem = new ItemList({
      name,
      price: numericPrice,
      quantity: numericQty,
      category,
      status,
      image: imageUrl,
    });
    await newItem.save();

    return res.status(201).json({
      message: "Item created successfully",
      item: newItem,
    });
  } catch (error: any) {
    deleteImageFile(req.file?.path);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getItemLists = async (req: Request, res: Response) => {
  try {
    const {
      category,
      status,
      search,
      sortBy = "createdAt",
      order = "desc",
      limit,
      page,
    } = req.query;
    const filter: Record<string, any> = {};
    if (category) filter.category = String(category);
    if (status) filter.status = String(status);
    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: "i" } },
        { category: { $regex: String(search), $options: "i" } },
      ];
    }

    const sortOrder = String(order).toLowerCase() === "asc" ? 1 : -1;
    const sort: Record<string, any> = { [String(sortBy)]: sortOrder };

    let query = ItemList.find(filter).sort(sort);

    const limitNum = limit ? Number(limit) : undefined;
    const pageNum = page ? Number(page) : undefined;
    if (limitNum && !Number.isNaN(limitNum) && limitNum > 0) {
      const skip =
        pageNum && !Number.isNaN(pageNum) && pageNum > 0
          ? (pageNum - 1) * limitNum
          : 0;
      query = query.skip(skip).limit(limitNum);
    }

    const [items, total] = await Promise.all([
      query.exec(),
      ItemList.countDocuments(filter),
    ]);

    return res.status(200).json({
      count: items.length,
      total,
      items,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getItemList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid item id" });
    }
    const item = await ItemList.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ item });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateItemList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      deleteImageFile(req.file?.path);
      return res.status(400).json({ message: "Invalid item id" });
    }
    const item = await ItemList.findById(id);
    if (!item) {
      deleteImageFile(req.file?.path);
      return res.status(404).json({ message: "Item not found" });
    }

    const { name, price, quantity, category, status, image } =
      req.body as IItemListBody;

    if (name !== undefined && name !== null && String(name).length > 0)
      item.name = String(name);
    if (price !== undefined && price !== null && String(price).length > 0) {
      const p = Number(price);
      if (Number.isNaN(p) || p < 0) {
        deleteImageFile(req.file?.path);
        return res.status(400).json({ message: "Invalid price" });
      }
      item.price = p;
    }
    if (
      quantity !== undefined &&
      quantity !== null &&
      String(quantity).length > 0
    ) {
      const q = Number(quantity);
      if (Number.isNaN(q) || q < 0) {
        deleteImageFile(req.file?.path);
        return res.status(400).json({ message: "Invalid quantity" });
      }
      item.quantity = q;
    }
    if (category !== undefined && category !== null)
      item.category = String(category);
    if (status !== undefined && status !== null) item.status = String(status);

    if (req.file?.filename) {
      const newImage = resolveImageUrl(req, req.file.filename);
      const oldUrl = item.image;
      item.image = newImage;
      if (oldUrl && oldUrl.includes("/uploads/")) {
        const oldName = oldUrl.split("/uploads/").pop();
        if (oldName) {
          deleteImageFile(
            path.resolve(process.env.UPLOAD_DIR || "uploads", oldName)
          );
        }
      }
    } else if (typeof image === "string" && image.length > 0) {
      item.image = image;
    }

    await item.save();
    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error: any) {
    deleteImageFile(req.file?.path);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteItemList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid item id" });
    }
    const item = await ItemList.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.image && item.image.includes("/uploads/")) {
      const oldName = item.image.split("/uploads/").pop();
      if (oldName) {
        deleteImageFile(
          path.resolve(process.env.UPLOAD_DIR || "uploads", oldName)
        );
      }
    }
    return res
      .status(200)
      .json({ message: "Item deleted successfully", item });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
