import { Request, Response } from 'express';
import { Product } from '../models/Product';

// Get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, purchasePrice, sellingPrice, gstPercent, currentStock, minStockAlert } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: `Product with SKU ${sku} already exists` });
    }

    const newProduct = new Product({
      name,
      sku: sku.toUpperCase(),
      purchasePrice,
      sellingPrice,
      gstPercent,
      currentStock: currentStock || 0,
      minStockAlert: minStockAlert || 5,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, purchasePrice, sellingPrice, gstPercent, currentStock, minStockAlert } = req.body;

    // Check if other product already uses the new SKU
    if (sku) {
      const existingProduct = await Product.findOne({
        sku: sku.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingProduct) {
        return res.status(400).json({ message: `Product with SKU ${sku} already exists` });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        sku: sku?.toUpperCase(),
        purchasePrice,
        sellingPrice,
        gstPercent,
        currentStock,
        minStockAlert,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Add Stock (Purchasing stock for existing product)
export const addStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid stock quantity' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.currentStock += Number(quantity);
    const updatedProduct = await product.save();

    res.status(200).json({
      message: 'Stock updated successfully',
      product: updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};
