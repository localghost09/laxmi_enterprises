'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Receipt, User, Phone, CheckCircle, Package, AlertTriangle, ArrowLeft } from 'lucide-react';
import { fetchProducts, createInvoice, Product, Invoice } from '../../../utils/api';
import InvoiceDetailModal from '../../../components/InvoiceDetailModal';
import confetti from 'canvas-confetti';

interface BillingItem {
  product: Product;
  quantity: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  
  // Master lists
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invoice customer fields
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  // Items added to current invoice draft
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  
  // Selector controls
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState<number>(1);

  // Success flow
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        // Only show products that have some stock available in the dropdown selector
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    // Check if product is already in billing list
    const existingIndex = billingItems.findIndex((item) => item.product._id === product._id);
    
    // Calculate total quantity we would have in the bill
    const currentQtyInBill = existingIndex > -1 ? billingItems[existingIndex].quantity : 0;
    const targetQty = currentQtyInBill + selectedQty;

    // Validate stock
    if (product.currentStock < targetQty) {
      alert(`Cannot add. Stock is insufficient. Available: ${product.currentStock}, requested: ${targetQty}`);
      return;
    }

    if (existingIndex > -1) {
      const updated = [...billingItems];
      updated[existingIndex].quantity = targetQty;
      setBillingItems(updated);
    } else {
      setBillingItems([...billingItems, { product, quantity: selectedQty }]);
    }

    // Reset selector
    setSelectedProductId('');
    setSelectedQty(1);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...billingItems];
    updated.splice(index, 1);
    setBillingItems(updated);
  };

  const handleQtyChange = (index: number, newQty: number) => {
    const item = billingItems[index];
    if (newQty <= 0) return;
    
    if (item.product.currentStock < newQty) {
      alert(`Cannot update quantity. Only ${item.product.currentStock} units are available in stock.`);
      return;
    }

    const updated = [...billingItems];
    updated[index].quantity = newQty;
    setBillingItems(updated);
  };

  // Calculations for display
  const calculateBill = () => {
    let subtotal = 0;
    let totalTax = 0;
    
    billingItems.forEach((item) => {
      const price = item.product.sellingPrice;
      const taxRate = item.product.gstPercent;
      
      const itemTaxable = price * item.quantity;
      const itemGst = itemTaxable * (taxRate / 100);
      
      subtotal += itemTaxable;
      totalTax += itemGst;
    });

    const total = subtotal + totalTax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  };

  const billTotals = calculateBill();

  const handleCreateInvoice = async () => {
    if (!customerName.trim() || !customerMobile.trim()) {
      setFormError('Customer name and mobile number are required.');
      return;
    }
    
    if (customerMobile.trim().length !== 10 || isNaN(Number(customerMobile.trim()))) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (billingItems.length === 0) {
      setFormError('Please add at least one product to the invoice.');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        customer: {
          name: customerName.trim(),
          mobileNumber: customerMobile.trim(),
        },
        items: billingItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
      };

      const result = await createInvoice(payload);
      
      // Celebrate success!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setCreatedInvoice(result);
      
      // Clear fields
      setCustomerName('');
      setCustomerMobile('');
      setBillingItems([]);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit billing invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProductDetails = products.find((p) => p._id === selectedProductId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">Billing Desk</h2>
          <p className="text-sm font-medium text-gray-500">Draft a new tax invoice and calculate GST charges</p>
        </div>
      </div>

      {formError && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Customer & Item entry panel */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Customer Metadata Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">Customer details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <User className="h-3.5 w-3.5" /> Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <Phone className="h-3.5 w-3.5" /> Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="10-digit number"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Product Selector Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">Select Inventory Product</h3>
            
            <form onSubmit={handleAddItem} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Select Item</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} disabled={p.currentStock === 0}>
                      {p.name} (SKU: {p.sku}) {p.currentStock === 0 ? '- [Out of Stock]' : `- [Stock: ${p.currentStock}]`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show stock metrics for selected item */}
              {selectedProductDetails && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div className="text-xs">
                    <p className="font-bold text-blue-800">₹{selectedProductDetails.sellingPrice.toFixed(2)} + {selectedProductDetails.gstPercent}% GST</p>
                    <p className="text-blue-600 font-medium">In Stock: {selectedProductDetails.currentStock} units</p>
                  </div>
                </div>
              )}

              <div className="w-24">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedProductId}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 h-[38px] active:scale-95 transition"
              >
                Add Item
              </button>
            </form>
          </div>

          {/* Draft line items list */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">Line items</h3>
            
            {billingItems.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-right">Selling Price</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">GST %</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {billingItems.map((item, index) => {
                      const lineTaxable = item.product.sellingPrice * item.quantity;
                      const lineGst = lineTaxable * (item.product.gstPercent / 100);
                      const lineTotal = lineTaxable + lineGst;

                      return (
                        <tr key={item.product._id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            <div>{item.product.name}</div>
                            <div className="text-[10px] font-mono text-gray-400 mt-0.5">{item.product.sku}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-700">₹{item.product.sellingPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(index, Number(e.target.value))}
                              className="w-16 text-center rounded-lg border border-gray-200 py-1 text-sm font-semibold"
                            />
                            <div className="text-[10px] text-gray-400 mt-1">Stock: {item.product.currentStock}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{item.product.gstPercent}%</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">₹{lineTotal.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-10 w-10 text-gray-300" />
                <h4 className="mt-4 font-bold text-gray-900">Invoice is Empty</h4>
                <p className="mt-1 text-xs text-gray-500">Add products from the selector above to start drafting the bill.</p>
              </div>
            )}
          </div>
        </div>

        {/* Calculation summary panel */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-fit">
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">Bill Summary</h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Taxable Subtotal:</span>
                <span>₹{billTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Integrated GST (Tax):</span>
                <span>₹{billTotals.totalTax.toFixed(2)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-black text-gray-900">
                <span>Grand Total:</span>
                <span className="text-blue-600">₹{billTotals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 text-xs text-gray-500 space-y-2">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                <span>GST calculated automatically by item rate tiers.</span>
              </div>
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Submitting will finalize invoice inventory decrement.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              onClick={handleCreateInvoice}
              disabled={submitting || billingItems.length === 0}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 duration-150"
            >
              {submitting ? 'Generating Invoice...' : 'Generate Tax Invoice'}
            </button>
          </div>
        </div>

      </div>

      {/* Created Invoice Success Viewer Modal */}
      {createdInvoice && (
        <InvoiceDetailModal
          invoice={createdInvoice}
          onClose={() => {
            setCreatedInvoice(null);
            router.push('/invoices');
          }}
        />
      )}
    </div>
  );
}
