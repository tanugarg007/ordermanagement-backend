"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProducts = exports.createProduct = void 0;
const productmodel_1 = __importDefault(require("../models/productmodel"));
const createProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || !description || !price) {
            return res.status(400).json({
                message: "Name, description and price are required"
            });
        }
        const imageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : "";
        if (!imageUrl) {
            return res.status(400).json({
                message: "Image is required"
            });
        }
        const newProduct = new productmodel_1.default({
            name,
            description,
            price,
            imageUrl
        });
        await newProduct.save();
        res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creating product",
            error
        });
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const products = await productmodel_1.default.find();
        res.status(200).json({
            message: "Products retrieved successfully",
            products: products
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error retrieving products",
            error
        });
    }
};
exports.getProducts = getProducts;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, imageUrl } = req.body;
        const updatedProduct = await productmodel_1.default.findByIdAndUpdate(id, { name, description, price, imageUrl }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await productmodel_1.default.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.js.map