'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { Package, Search, Plus, Edit2, Trash2, ArrowUpRight, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, addStock, Product } from '../../utils/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showStockModal, setShowStockModal] = useState<string | null>(null);

  // Form states
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [stockAmount, setStockAmount] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const { name, sku, purchasePrice, sellingPrice, gstPercent, currentStock, minStockAlert } = currentProduct;
      
      if (!name || !sku || purchasePrice === undefined || sellingPrice === undefined) {
        throw new Error('Please fill in all required fields');
      }

      await createProduct({
        name,
        sku: sku.toUpperCase(),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        gstPercent: Number(gstPercent ?? 18),
        currentStock: Number(currentStock ?? 0),
        minStockAlert: Number(minStockAlert ?? 5),
      });

      setShowAddModal(false);
      setCurrentProduct({});
      loadProducts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct._id) return;
    
    setFormError(null);
    setSubmitting(true);

    try {
      const { _id, name, sku, purchasePrice, sellingPrice, gstPercent, currentStock, minStockAlert } = currentProduct;
      
      if (!name || !sku || purchasePrice === undefined || sellingPrice === undefined) {
        throw new Error('Please fill in all required fields');
      }

      await updateProduct(_id, {
        name,
        sku: sku.toUpperCase(),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        gstPercent: Number(gstPercent),
        currentStock: Number(currentStock),
        minStockAlert: Number(minStockAlert),
      });

      setShowEditModal(false);
      setCurrentProduct({});
      loadProducts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setSubmitting(true);
      await deleteProduct(id);
      setShowDeleteConfirm(null);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStockModal || stockAmount <= 0) return;

    try {
      setSubmitting(true);
      await addStock(showStockModal, stockAmount);
      setShowStockModal(null);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">Inventory</h2>
          <p className="text-sm font-medium text-gray-500">Manage products, pricing, tax rates, and current warehouse levels</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Reload
          </button>
          <button
            onClick={() => {
              setCurrentProduct({ gstPercent: 18, currentStock: 0, minStockAlert: 5 });
              setFormError(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by Name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm outline-none placeholder-gray-400 bg-transparent text-gray-800"
        />
      </div>

      {/* Products Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-semibold">Fetching catalog...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Product details</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Purchase Price</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">GST</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isLowStock = product.currentStock <= product.minStockAlert;
                  const isOutOfStock = product.currentStock === 0;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-md">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">₹{product.purchasePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-blue-600">₹{product.sellingPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{product.gstPercent}%</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isOutOfStock ? (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            ) : isLowStock ? (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            {product.currentStock} Units
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">Min Alert: {product.minStockAlert}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => {
                              setShowStockModal(product._id);
                              setStockAmount(10);
                            }}
                            title="Add Stock"
                            className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" /> +Stock
                          </button>
                          <button
                            onClick={() => {
                              setCurrentProduct(product);
                              setFormError(null);
                              setShowEditModal(true);
                            }}
                            title="Edit Product"
                            className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product._id)}
                            title="Delete Product"
                            className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-10 w-10 text-gray-300" />
            <h3 className="mt-4 font-bold text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Try checking spelling or create a new item.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-900">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500 text-xl font-bold">×</button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Motor 2HP"
                  value={currentProduct.name || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">SKU (Unique ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELEC-MOT-001"
                  value={currentProduct.sku || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">GST % *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={currentProduct.gstPercent ?? 18}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, gstPercent: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Purchase Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={currentProduct.purchasePrice ?? ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, purchasePrice: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={currentProduct.sellingPrice ?? ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, sellingPrice: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={currentProduct.currentStock ?? 0}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, currentStock: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Min Stock Alert</label>
                <input
                  type="number"
                  min="0"
                  placeholder="5"
                  value={currentProduct.minStockAlert ?? 5}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, minStockAlert: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end sm:col-span-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-900">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500 text-xl font-bold">×</button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">Product Name *</label>
                <input
                  type="text"
                  required
                  value={currentProduct.name || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">SKU (Unique ID) *</label>
                <input
                  type="text"
                  required
                  value={currentProduct.sku || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">GST % *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={currentProduct.gstPercent ?? 18}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, gstPercent: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Purchase Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={currentProduct.purchasePrice ?? ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, purchasePrice: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={currentProduct.sellingPrice ?? ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, sellingPrice: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Current Stock</label>
                <input
                  type="number"
                  min="0"
                  value={currentProduct.currentStock ?? 0}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, currentStock: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Min Stock Alert</label>
                <input
                  type="number"
                  min="0"
                  value={currentProduct.minStockAlert ?? 5}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, minStockAlert: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end sm:col-span-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
            <p className="mt-2 text-sm text-gray-500 leading-normal">
              Are you sure you want to delete this product? This action is permanent and cannot be undone.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(showDeleteConfirm)}
                disabled={submitting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Refill Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900">Add Purchase Stock</h3>
            <p className="mt-1 text-xs text-gray-500">Increase inventory count for this product</p>

            <form onSubmit={handleAddStock} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Refill Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAmount}
                  onChange={(e) => setStockAmount(Math.max(1, Number(e.target.value)))}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(null)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
