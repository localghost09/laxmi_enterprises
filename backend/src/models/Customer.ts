import { Schema, model, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  mobileNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Customer = model<ICustomer>('Customer', customerSchema);
