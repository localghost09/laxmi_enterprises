import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product';
import { Invoice } from './models/Invoice';
import { Customer } from './models/Customer';

dotenv.config();

const sampleProducts = [
  {
    name: 'Electric Motor 2HP',
    sku: 'ELEC-MTR-2HP',
    purchasePrice: 4200,
    sellingPrice: 5800,
    gstPercent: 18,
    currentStock: 25,
    minStockAlert: 5,
  },
  {
    name: 'Heavy Duty Hammer',
    sku: 'TOOL-HAM-HD',
    purchasePrice: 180,
    sellingPrice: 320,
    gstPercent: 12,
    currentStock: 50,
    minStockAlert: 8,
  },
  {
    name: 'PVC Pipe 4-Inch (10ft)',
    sku: 'PIPE-PVC-4IN',
    purchasePrice: 220,
    sellingPrice: 380,
    gstPercent: 18,
    currentStock: 120,
    minStockAlert: 15,
  },
  {
    name: 'Steel Screws Box (100pcs)',
    sku: 'SCRW-STL-100',
    purchasePrice: 45,
    sellingPrice: 90,
    gstPercent: 18,
    currentStock: 200,
    minStockAlert: 20,
  },
  {
    name: 'Adjustable Wrench 12-Inch',
    sku: 'TOOL-WRN-12IN',
    purchasePrice: 280,
    sellingPrice: 450,
    gstPercent: 12,
    currentStock: 3, // Low stock on startup to test alert system!
    minStockAlert: 5,
  },
  {
    name: 'Brass Gate Valve 1-Inch',
    sku: 'PLUM-VAL-BRS',
    purchasePrice: 350,
    sellingPrice: 520,
    gstPercent: 18,
    currentStock: 0, // Out of stock on startup to test alerts!
    minStockAlert: 5,
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hardwareshop';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding...');

    // Clear existing collections
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    await Customer.deleteMany({});
    console.log('Cleared existing collection documents.');

    // Insert new products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${inserted.length} catalog products successfully.`);

    console.log('Database seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
