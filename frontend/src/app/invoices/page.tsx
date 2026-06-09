'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Search, Eye, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { fetchInvoices, Invoice } from '../../utils/api';
import InvoiceDetailModal from '../../components/InvoiceDetailModal';

export default function SalesHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Filter invoices based on search (by Invoice Number or Customer Mobile/Name)
  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customer.mobileNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">Sales History</h2>
          <p className="text-sm font-medium text-gray-500">Search and view past tax invoices generated for Laxmi Hardware</p>
        </div>
        <button
          onClick={loadInvoices}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Reload List
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Invoice number (e.g. INV-2026...), Customer Name, or Mobile Number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm outline-none placeholder-gray-400 bg-transparent text-gray-800"
        />
      </div>

      {/* Invoices List Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-semibold font-medium">Fetching history...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Taxable base</th>
                  <th className="px-6 py-4 text-right">GST Tax</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50/50 transition duration-150">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{invoice.customer.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">+91 {invoice.customer.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">₹{invoice.taxableAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-purple-600">₹{invoice.totalGst.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">₹{invoice.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-10 w-10 text-gray-300" />
            <h3 className="mt-4 font-bold text-gray-900">No invoices recorded</h3>
            <p className="mt-1 text-sm text-gray-500">Draft invoices at the billing desk to populate history.</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Viewer Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
