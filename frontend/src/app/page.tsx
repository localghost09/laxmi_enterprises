'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, AlertTriangle, IndianRupee, Layers, Plus, RefreshCw, ChevronRight, Receipt } from 'lucide-react';
import { fetchDashboardStats, addStock, DashboardStats } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refillProductId, setRefillProductId] = useState<string | null>(null);
  const [refillQty, setRefillQty] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillProductId || refillQty <= 0) return;

    try {
      setSubmitting(true);
      await addStock(refillProductId, refillQty);
      setRefillProductId(null);
      // Reload stats after refill
      await loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to refill stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-gray-500">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
        <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={loadStats}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-700 transition"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">Dashboard</h2>
          <p className="text-sm font-medium text-gray-500">Real-time overview of Laxmi Hardware</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-150"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all duration-150"
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Products</p>
              <h3 className="mt-2 text-3xl font-black text-gray-900">{stats?.totalProducts}</h3>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-gray-500">
            <Link href="/products" className="flex items-center hover:text-blue-600">
              Manage items <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Total Stock Items */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Stock Items</p>
              <h3 className="mt-2 text-3xl font-black text-gray-900">{stats?.totalStockItems}</h3>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-gray-500">
            <span className="text-purple-600">Units in warehouse</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Sales</p>
              <h3 className="mt-2 text-3xl font-black text-gray-900">₹{stats?.todaySales.toLocaleString('en-IN')}</h3>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-gray-500">
            <Link href="/invoices" className="flex items-center hover:text-green-600">
              View sales history <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Low Stock Products</p>
              <h3 className="mt-2 text-3xl font-black text-red-600">{stats?.lowStockProducts.length}</h3>
            </div>
            <div className={`rounded-xl p-3 ${stats && stats.lowStockProducts.length > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-gray-500">
            <span className={stats && stats.lowStockProducts.length > 0 ? 'text-red-600' : 'text-gray-400'}>
              {stats && stats.lowStockProducts.length > 0 ? 'Urgent attention required' : 'Stock levels optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Section: Alerts Board */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Low Stock Panel */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Low Stock & Out of Stock Alerts</h3>
              <p className="text-xs text-gray-500">Products currently falling below the minimum threshold</p>
            </div>
            {stats && stats.lowStockProducts.length > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                {stats.lowStockProducts.length} Alert{stats.lowStockProducts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
            {stats && stats.lowStockProducts.length > 0 ? (
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Min Level</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3.5 font-semibold text-gray-900">{product.name}</td>
                      <td className="px-4 py-3.5 text-xs font-mono">{product.sku}</td>
                      <td className="px-4 py-3.5 font-medium">{product.minStockAlert}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          product.currentStock === 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {product.currentStock} left
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setRefillProductId(product._id);
                            setRefillQty(10);
                          }}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                        >
                          Quick Refill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-green-50 p-4 text-green-500">
                  <Package className="h-8 w-8" />
                </div>
                <h4 className="mt-4 font-bold text-gray-900">All Stock is Sufficient</h4>
                <p className="mt-1 text-sm text-gray-500">No items are currently running below their minimum limit.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Panel */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Shop Operations</h3>
            <p className="text-xs text-gray-500">Direct shortcuts to frequent business actions</p>

            <div className="mt-6 space-y-4">
              <Link
                href="/invoices/new"
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:bg-blue-50 hover:border-blue-100 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-600 p-2 text-white">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-gray-900">Create New Bill</h4>
                    <p className="text-xs text-gray-500">Draft an invoice for a customer</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:bg-purple-50 hover:border-purple-100 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-600 p-2 text-white">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-gray-900">Inventory Catalog</h4>
                    <p className="text-xs text-gray-500">Add or edit current stock options</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="rounded-xl bg-blue-50 p-4">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide">System Note</h4>
              <p className="mt-1 text-xs text-blue-600 leading-normal">
                When invoicing, items will be deducted from your stock counts in real time. Ensure your minimum stock alert parameters are set accurately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Refill Dialog Backdrop */}
      {refillProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900">Quick Refill Stock</h3>
            <p className="mt-1 text-xs text-gray-500">Enter purchase stock quantity to add</p>

            <form onSubmit={handleRefill} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={refillQty}
                  onChange={(e) => setRefillQty(Math.max(1, Number(e.target.value)))}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRefillProductId(null)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
