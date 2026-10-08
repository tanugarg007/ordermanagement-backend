

import { Request, Response } from "express";
import Product from "../models/catalog-product";

export const createProduct = async (req: Request, res: Response) => {
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

        const newProduct = new Product({
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creating product",
            error
        });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            message: "Products retrieved successfully",
            products: products
        });

    } catch (error) {
        res.status(500).json({
            message: "Error retrieving products",
            error
        });
    }
};

export const updateProduct = async (req:Request, res:Response) => {
    try {
        const {id} = req.params;
        const {name, description, price, imageUrl} = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(id, {name, description, price, imageUrl}, {new: true});
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
}

export const deleteProduct = async (req:Request, res:Response) => {
    try {
        const {id} = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
}
