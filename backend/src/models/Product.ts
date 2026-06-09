import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
  currentStock: number;
  minStockAlert: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, required: true, default: 18, min: 0 },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    minStockAlert: { type: Number, required: true, default: 5, min: 0 },
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct>('Product', productSchema);
