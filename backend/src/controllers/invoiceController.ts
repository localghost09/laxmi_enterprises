import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { Product } from '../models/Product';
import { Customer } from '../models/Customer';

// Helper to generate Invoice Number (e.g., INV-YYYYMMDD-XXXX)
const generateInvoiceNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Count invoices created today
  const count = await Invoice.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const seq = String(count + 1).padStart(4, '0');
  return `INV-${dateStr}-${seq}`;
};

// Create New Invoice
export const createInvoice = async (req: Request, res: Response) => {
  const { customer, items } = req.body;

  if (!customer || !customer.name || !customer.mobileNumber) {
    return res.status(400).json({ message: 'Customer name and mobile number are required' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one invoice item is required' });
  }

  try {
    // 1. Validate all products and stock levels
    const productUpdates: { productId: string; quantity: number; productName: string; currentStock: number }[] = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found with ID: ${item.productId}` });
      }

      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`
        });
      }

      productUpdates.push({
        productId: product._id.toString(),
        quantity: item.quantity,
        productName: product.name,
        currentStock: product.currentStock,
      });
    }

    // 2. Perform atomic decrements
    const completedDecrements: { productId: string; quantity: number }[] = [];
    for (const update of productUpdates) {
      const result = await Product.updateOne(
        { _id: update.productId, currentStock: { $gte: update.quantity } },
        { $inc: { currentStock: -update.quantity } }
      );

      if (result.modifiedCount === 0) {
        // Stock must have changed concurrently, rollback previous decrements
        for (const rollback of completedDecrements) {
          await Product.updateOne(
            { _id: rollback.productId },
            { $inc: { currentStock: rollback.quantity } }
          );
        }
        return res.status(400).json({
          message: `Stock level updated concurrently. Purchase failed for: ${update.productName}. Please try again.`
        });
      }
      completedDecrements.push({ productId: update.productId, quantity: update.quantity });
    }

    // 3. Upsert Customer details
    await Customer.findOneAndUpdate(
      { mobileNumber: customer.mobileNumber.trim() },
      { name: customer.name.trim() },
      { upsert: true, new: true }
    );

    // 4. Calculate invoice financial details
    let taxableAmount = 0;
    let totalGst = 0;
    let totalAmount = 0;

    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue; // Safety check, already validated

      const sellingPrice = product.sellingPrice;
      const gstPercent = product.gstPercent;
      
      // Calculate taxable base amount (sellingPrice is total price including or excluding GST? Usually excluding in hardware.
      // Let's assume sellingPrice is base price, and GST is added on top.
      // E.g., Item cost = 100, GST = 18%, Total = 118.
      // Taxable Amount = sellingPrice * quantity
      // GST Amount = Taxable Amount * (gstPercent / 100)
      // Total Amount = Taxable Amount + GST Amount
      const itemTaxable = sellingPrice * item.quantity;
      const itemGst = itemTaxable * (gstPercent / 100);
      const itemTotal = itemTaxable + itemGst;

      taxableAmount += itemTaxable;
      totalGst += itemGst;
      totalAmount += itemTotal;

      invoiceItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        sellingPrice: sellingPrice,
        gstPercent: gstPercent,
        gstAmount: Math.round(itemGst * 100) / 100,
        totalAmount: Math.round(itemTotal * 100) / 100,
      });
    }

    // Round values to 2 decimal places
    taxableAmount = Math.round(taxableAmount * 100) / 100;
    totalGst = Math.round(totalGst * 100) / 100;
    totalAmount = Math.round(totalAmount * 100) / 100;

    // 5. Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // 6. Create and Save Invoice
    const newInvoice = new Invoice({
      invoiceNumber,
      customer: {
        name: customer.name.trim(),
        mobileNumber: customer.mobileNumber.trim(),
      },
      items: invoiceItems,
      taxableAmount,
      totalGst,
      totalAmount,
    });

    const savedInvoice = await newInvoice.save();

    res.status(201).json(savedInvoice);
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing invoice', error: error.message });
  }
};

// Get all invoices (Sales History)
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

// Get Invoice by Number
export const getInvoiceByNumber = async (req: Request, res: Response) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await Invoice.findOne({ invoiceNumber: invoiceNumber.toUpperCase() });

    if (!invoice) {
      return res.status(404).json({ message: `Invoice ${invoiceNumber} not found` });
    }

    res.status(200).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: 'Error searching invoice', error: error.message });
  }
};
