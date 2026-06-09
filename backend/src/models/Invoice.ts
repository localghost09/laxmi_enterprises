import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoiceItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  sellingPrice: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customer: {
    name: string;
    mobileNumber: string;
  };
  items: IInvoiceItem[];
  taxableAmount: number;
  totalGst: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true, min: 0 },
  gstPercent: { type: Number, required: true, min: 0 },
  gstAmount: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customer: {
      name: { type: String, required: true, trim: true },
      mobileNumber: { type: String, required: true, trim: true },
    },
    items: [invoiceItemSchema],
    taxableAmount: { type: Number, required: true, min: 0 },
    totalGst: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
