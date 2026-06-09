import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Invoice } from '../models/Invoice';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Products count
    const totalProducts = await Product.countDocuments();

    // 2. Total Stock items (Sum of currentStock)
    const stockAggregate = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$currentStock' },
        },
      },
    ]);
    const totalStockItems = stockAggregate.length > 0 ? stockAggregate[0].totalStock : 0;

    // 3. Today's Sales (Sum of totalAmount for invoices created today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const salesAggregate = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
        },
      },
    ]);
    const todaySales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

    // 4. Low stock products list (where currentStock <= minStockAlert)
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$currentStock', '$minStockAlert'] },
    }).sort({ currentStock: 1 });

    res.status(200).json({
      totalProducts,
      totalStockItems,
      todaySales: Math.round(todaySales * 100) / 100,
      lowStockProducts,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving dashboard statistics', error: error.message });
  }
};
