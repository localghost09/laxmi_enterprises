'use strict';
'use client';

import React from 'react';
import { X, Printer, Download, Hammer } from 'lucide-react';
import { Invoice } from '../utils/api';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export default function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    // We create a temporary hidden iframe or we can style the document specifically for printing.
    // A clean way is to print the target div by opening a new window or trigger print with styles.
    const printContent = document.getElementById('printable-invoice-content');
    if (!printContent) return;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Pop-up blocker is preventing invoice printing');
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: sans-serif; background: white; padding: 20px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="max-w-3xl mx-auto border border-gray-200 p-8 rounded-lg">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleDownloadPDF = () => {
    // Direct trigger browser print to convert to PDF or display instructions
    // Standard approach for high-quality layout client-side is utilizing the native Print to PDF
    alert('Your browser will now open the print layout. Please select "Save as PDF" to download the PDF invoice.');
    handlePrint();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-gray-900">Invoice Details</h3>
            <p className="text-xs text-gray-500">Invoice Number: {invoice.invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 pr-1">
          <div id="printable-invoice-content" className="space-y-6 text-sm text-gray-600 bg-white">
            
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Hammer className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">LAXMI ENTERPRISES</h4>
                  <p className="text-xs text-gray-400 font-semibold">123, Hardware Lane, Iron Bazaar, Mumbai</p>
                  <p className="text-[10px] text-gray-400">Mobile: +91 98765 43210</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-black text-blue-600 tracking-tight">TAX INVOICE</h2>
                <p className="text-xs font-bold text-gray-700 mt-1">{invoice.invoiceNumber}</p>
                <p className="text-[10px] text-gray-400">Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Customer Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billed To:</p>
                <h5 className="font-bold text-gray-900 text-sm mt-1">{invoice.customer.name}</h5>
                <p className="text-xs text-gray-500 mt-0.5">Mobile: +91 {invoice.customer.mobileNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Status:</p>
                <span className="mt-1 inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                  PAID IN FULL
                </span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-2.5 px-3 font-bold">Item Description</th>
                  <th className="py-2.5 px-3 font-bold text-right">Selling Price</th>
                  <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">GST %</th>
                  <th className="py-2.5 px-3 font-bold text-right">GST Amt</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-gray-900">{item.productName}</td>
                    <td className="py-3 px-3 text-right">₹{item.sellingPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">{item.gstPercent}%</td>
                    <td className="py-3 px-3 text-right">₹{item.gstAmount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">₹{item.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Summary calculation details */}
            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal (Taxable):</span>
                  <span>₹{invoice.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Total Tax (GST):</span>
                  <span>₹{invoice.totalGst.toFixed(2)}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-sm font-black text-gray-950">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* T&C Footer */}
            <div className="border-t border-gray-100 pt-6 text-[10px] text-gray-400 text-center space-y-1">
              <p>Thank you for your business!</p>
              <p>Terms: Goods once sold will not be taken back. Subject to local jurisdiction.</p>
            </div>

          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-4 flex gap-3 justify-end border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}
