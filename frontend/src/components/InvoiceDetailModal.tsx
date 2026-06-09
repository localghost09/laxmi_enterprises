'use strict';
'use client';

import React from 'react';
import { X, Printer, Download, Hammer } from 'lucide-react';
import { Invoice } from '../utils/api';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={props.width || 16}
    height={props.height || 16}
    className={props.className}
    style={props.style}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.416 1.46 5.867 0 10.642-4.775 10.645-10.643.001-2.843-1.1-5.516-3.102-7.52C17.502 4.446 14.832 3.35 12.008 3.35c-5.874 0-10.65 4.776-10.654 10.645-.001 1.902.497 3.761 1.442 5.378l-1.022 3.73 3.824-1.002zm12.354-7.51c-.33-.165-1.951-.963-2.251-1.072-.3-.11-.518-.165-.736.165-.218.33-.846 1.072-1.037 1.292-.19.22-.38.242-.71.077-1.15-.578-1.996-1.01-2.793-2.378-.21-.362.21-.336.6-.113.35.2.783.9.783.9.23.39.23.67.11.9-.12.23-.74 1.8-1.01 2.455-.262.632-.527.535-.724.525-.19-.01-.41-.01-.63-.01-.22 0-.58.08-.88.41-.3.33-1.15 1.127-1.15 2.75 0 1.62 1.18 3.19 1.34 3.41.16.22 2.322 3.545 5.625 4.973.785.34 1.398.543 1.88.697.79.25 1.51.214 2.078.13.633-.095 1.95-.797 2.223-1.566.273-.77.273-1.43.19-1.566-.083-.136-.3-.218-.63-.383z" />
  </svg>
);

export default function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('Your browser will now open the print layout. Please select "Save as PDF" to download the PDF invoice.');
    window.print();
  };

  const handleShareWhatsApp = () => {
    let cleanMobile = invoice.customer.mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length === 10) {
      cleanMobile = `91${cleanMobile}`;
    }

    const itemsText = invoice.items.map((item, idx) => {
      return `${idx + 1}. *${item.productName}* x ${item.quantity}\n   Rate: ₹${item.sellingPrice.toFixed(2)} | GST: ${item.gstPercent}%\n   Total: ₹${item.totalAmount.toFixed(2)}`;
    }).join('\n');

    const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    const message = `*TAX INVOICE - LAXMI ENTERPRISES*
--------------------------------------------
*Invoice No:* ${invoice.invoiceNumber}
*Date:* ${formattedDate}
*Customer:* ${invoice.customer.name}
--------------------------------------------
*Items Purchased:*
${itemsText}

--------------------------------------------
*Tax Summary:*
- Taxable Amount: ₹${invoice.taxableAmount.toFixed(2)}
- CGST (Central Tax): ₹${(invoice.totalGst / 2).toFixed(2)}
- SGST (State Tax): ₹${(invoice.totalGst / 2).toFixed(2)}
- Total GST: ₹${invoice.totalGst.toFixed(2)}
--------------------------------------------
*Grand Total: ₹${invoice.totalAmount.toFixed(2)}*
--------------------------------------------
*Payment Status:* PAID IN FULL

Thank you for shopping with Laxmi Enterprises!
For warranty claims, returns, or support:
Phone: +91 XXXXX XXXXX
Email: support@laxmienterprises.com`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanMobile}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide all page content by default */
          body * {
            visibility: hidden !important;
          }
          /* Reveal only the printable invoice content box and its elements */
          #printable-invoice-content, 
          #printable-invoice-content * {
            visibility: visible !important;
          }
          /* Format and center the invoice on the printed page */
          #printable-invoice-content {
            position: fixed !important;
            left: 50% !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 48rem !important;
            height: auto !important;
            z-index: 9999999 !important;
            background: white !important;
            padding: 32px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 16px !important;
          }
          /* Force colors, backgrounds and borders to print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Ensure margins and layout overflow are optimized for document page flow */
          ::-webkit-scrollbar { display: none !important; }
          html, body {
            overflow: visible !important;
            height: auto !important;
            background: white !important;
          }
        }
      `}} />
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
          <div id="printable-invoice-content" className="space-y-5 text-sm text-gray-600 bg-white">

            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
                  <Hammer className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base uppercase">LAXMI ENTERPRISES</h4>
                  <p className="text-xs text-gray-500 font-semibold">Deoria Dhush Chhuraha, Deoria, Uttar Pradesh</p>
                  <p className="text-[10px] text-gray-500">Mobile: +91 9555487247</p>
                  <div className="mt-1 space-y-0.5 text-[10px] text-gray-400">
                    <div>GSTIN: <span className="font-semibold text-gray-700 font-mono">27ABCDE1234F1Z5</span></div>
                    <div>PAN: <span className="font-semibold text-gray-700 font-mono">ABCDE1234F</span></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-black text-blue-600 tracking-tight leading-none">TAX INVOICE</h2>
                <p className="text-xs font-bold text-gray-700 mt-1">{invoice.invoiceNumber}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Customer Information */}
            <div className="grid grid-cols-2 gap-4 border border-gray-100 rounded-xl p-3 bg-gray-50/30">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Billed To:</p>
                <h5 className="font-bold text-gray-900 text-sm mt-0.5">{invoice.customer.name}</h5>
                <p className="text-xs text-gray-500 mt-0.5">Mobile: +91 {invoice.customer.mobileNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Payment Status:</p>
                <span className="mt-1 inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-800">
                  PAID IN FULL
                </span>
              </div>
            </div>

            {/* Items Table with CGST/SGST Breakdown */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-gray-200 text-center w-8">#</th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-gray-200 text-left">Item Description</th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-gray-200 text-right">Selling Price</th>
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-gray-200 text-center w-12">Qty</th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-gray-200 text-right">Taxable Val</th>
                    <th colSpan={2} className="py-1 px-2 border-b border-r border-gray-200 text-center">CGST</th>
                    <th colSpan={2} className="py-1 px-2 border-b border-r border-gray-200 text-center">SGST</th>
                    <th rowSpan={2} className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                  <tr className="bg-gray-50 text-gray-500 uppercase font-bold text-[9px]">
                    <th className="py-1 px-1 border-r border-gray-200 text-center w-10">Rate</th>
                    <th className="py-1 px-1.5 border-r border-gray-200 text-right w-16">Amount</th>
                    <th className="py-1 px-1 border-r border-gray-200 text-center w-10">Rate</th>
                    <th className="py-1 px-1.5 border-r border-gray-200 text-right w-16">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {invoice.items.map((item, idx) => {
                    const taxableVal = item.sellingPrice * item.quantity;
                    const cgstPercent = item.gstPercent / 2;
                    const sgstPercent = item.gstPercent / 2;
                    const cgstAmount = item.gstAmount / 2;
                    const sgstAmount = item.gstAmount / 2;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 border-r border-gray-200 text-center">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-gray-200 font-semibold text-gray-900">{item.productName}</td>
                        <td className="py-2.5 px-3 border-r border-gray-200 text-right">₹{item.sellingPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-2 border-r border-gray-200 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 border-r border-gray-200 text-right">₹{taxableVal.toFixed(2)}</td>
                        <td className="py-2.5 px-1 border-r border-gray-200 text-center font-mono text-[10px]">{cgstPercent}%</td>
                        <td className="py-2.5 px-1.5 border-r border-gray-200 text-right font-mono text-[10px]">₹{cgstAmount.toFixed(2)}</td>
                        <td className="py-2.5 px-1 border-r border-gray-200 text-center font-mono text-[10px]">{sgstPercent}%</td>
                        <td className="py-2.5 px-1.5 border-r border-gray-200 text-right font-mono text-[10px]">₹{sgstAmount.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary calculation details */}
            <div className="flex justify-end">
              <div className="w-80 rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2 text-xs shadow-xs shrink-0">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Taxable Amount:</span>
                  <span className="font-semibold text-gray-800">₹{invoice.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 pl-4 border-l border-gray-200">
                  <span>CGST (Central Tax):</span>
                  <span>₹{(invoice.totalGst / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 pl-4 border-l border-gray-200">
                  <span>SGST (State Tax):</span>
                  <span>₹{(invoice.totalGst / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium pt-1 border-t border-gray-100">
                  <span>Total Tax (GST):</span>
                  <span className="font-semibold text-gray-800">₹{invoice.totalGst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-blue-700 text-lg font-black">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Subtle Divider before Footer */}
            <hr className="border-gray-200 my-2" />

            {/* Improved Footer Section */}
            <div className="text-center space-y-3 pt-2 pb-4">
              <p className="font-bold text-gray-700 text-xs">Thank you for shopping with Laxmi Enterprises.</p>
              
              <div className="text-gray-500 text-[10px] leading-relaxed">
                <span className="font-semibold text-gray-700">For warranty claims, returns, or support:</span><br />
                Phone: +91 XXXXX XXXXX &nbsp;|&nbsp; Email: support@laxmienterprises.com
              </div>
              
              <div className="text-[9px] text-gray-400 leading-relaxed font-semibold">
                Goods once sold will not be taken back without a valid invoice.<br />
                Subject to local jurisdiction.
              </div>
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
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition active:scale-95"
          >
            <WhatsappIcon className="h-4 w-4 text-white" /> Send to WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}
