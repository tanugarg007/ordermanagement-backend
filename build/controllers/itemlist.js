"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItemList = exports.updateItemList = exports.getItemList = exports.getItemLists = exports.createItemList = void 0;
const itemlistmodel_1 = __importDefault(require("../models/itemlistmodel"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deleteImageFile = (imagePath) => {
    if (!imagePath)
        return;
    try {
        const abs = path_1.default.isAbsolute(imagePath) ? imagePath : path_1.default.resolve(imagePath);
        if (fs_1.default.existsSync(abs))
            fs_1.default.unlinkSync(abs);
    }
    catch {
        /* ignore */
    }
};
const resolveImageUrl = (req, filename, fallbackImage) => {
    if (filename) {
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
        const host = req.headers["x-forwarded-host"] ||
            req.headers.host ||
            "localhost:5000";
        return `${protocol}://${host}/uploads/${filename}`;
    }
    return fallbackImage || "";
};
const createItemList = async (req, res) => {
    try {
        const { name, price, quantity, category, status } = req.body;
        const fallbackImage = req.body.image;
        if (!name ||
            price === undefined ||
            price === null ||
            price === "" ||
            quantity === undefined ||
            quantity === null ||
            quantity === "" ||
            !category ||
            !status) {
            deleteImageFile(req.file?.path);
            return res.status(400).json({
                message: "All fields (name, price, quantity, category, status) are required",
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
        if (Number.isNaN(numericPrice) ||
            Number.isNaN(numericQty) ||
            numericPrice < 0 ||
            numericQty < 0) {
            deleteImageFile(req.file?.path);
            return res.status(400).json({
                message: "Price and quantity must be non-negative numbers",
            });
        }
        const newItem = new itemlistmodel_1.default({
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
    }
    catch (error) {
        deleteImageFile(req.file?.path);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.createItemList = createItemList;
const getItemLists = async (req, res) => {
    try {
        const { category, status, search, sortBy = "createdAt", order = "desc", limit, page, } = req.query;
        const filter = {};
        if (category)
            filter.category = String(category);
        if (status)
            filter.status = String(status);
        if (search) {
            filter.$or = [
                { name: { $regex: String(search), $options: "i" } },
                { category: { $regex: String(search), $options: "i" } },
            ];
        }
        const sortOrder = String(order).toLowerCase() === "asc" ? 1 : -1;
        const sort = { [String(sortBy)]: sortOrder };
        let query = itemlistmodel_1.default.find(filter).sort(sort);
        const limitNum = limit ? Number(limit) : undefined;
        const pageNum = page ? Number(page) : undefined;
        if (limitNum && !Number.isNaN(limitNum) && limitNum > 0) {
            const skip = pageNum && !Number.isNaN(pageNum) && pageNum > 0
                ? (pageNum - 1) * limitNum
                : 0;
            query = query.skip(skip).limit(limitNum);
        }
        const [items, total] = await Promise.all([
            query.exec(),
            itemlistmodel_1.default.countDocuments(filter),
        ]);
        return res.status(200).json({
            count: items.length,
            total,
            items,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getItemLists = getItemLists;
const getItemList = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid item id" });
        }
        const item = await itemlistmodel_1.default.findById(id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        return res.status(200).json({ item });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getItemList = getItemList;
const updateItemList = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            deleteImageFile(req.file?.path);
            return res.status(400).json({ message: "Invalid item id" });
        }
        const item = await itemlistmodel_1.default.findById(id);
        if (!item) {
            deleteImageFile(req.file?.path);
            return res.status(404).json({ message: "Item not found" });
        }
        const { name, price, quantity, category, status, image } = req.body;
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
        if (quantity !== undefined &&
            quantity !== null &&
            String(quantity).length > 0) {
            const q = Number(quantity);
            if (Number.isNaN(q) || q < 0) {
                deleteImageFile(req.file?.path);
                return res.status(400).json({ message: "Invalid quantity" });
            }
            item.quantity = q;
        }
        if (category !== undefined && category !== null)
            item.category = String(category);
        if (status !== undefined && status !== null)
            item.status = String(status);
        if (req.file?.filename) {
            const newImage = resolveImageUrl(req, req.file.filename);
            const oldUrl = item.image;
            item.image = newImage;
            if (oldUrl && oldUrl.includes("/uploads/")) {
                const oldName = oldUrl.split("/uploads/").pop();
                if (oldName) {
                    deleteImageFile(path_1.default.resolve(process.env.UPLOAD_DIR || "uploads", oldName));
                }
            }
        }
        else if (typeof image === "string" && image.length > 0) {
            item.image = image;
        }
        await item.save();
        return res.status(200).json({
            message: "Item updated successfully",
            item,
        });
    }
    catch (error) {
        deleteImageFile(req.file?.path);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.updateItemList = updateItemList;
const deleteItemList = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid item id" });
        }
        const item = await itemlistmodel_1.default.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        if (item.image && item.image.includes("/uploads/")) {
            const oldName = item.image.split("/uploads/").pop();
            if (oldName) {
                deleteImageFile(path_1.default.resolve(process.env.UPLOAD_DIR || "uploads", oldName));
            }
        }
        return res
            .status(200)
            .json({ message: "Item deleted successfully", item });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.deleteItemList = deleteItemList;
//# sourceMappingURL=itemlist.js.map