export const API_BASE_URL = 'http://localhost:5000/api';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
  currentStock: number;
  minStockAlert: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id?: string;
  name: string;
  mobileNumber: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: Customer;
  items: InvoiceItem[];
  taxableAmount: number;
  totalGst: number;
  totalAmount: number;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStockItems: number;
  todaySales: number;
  lowStockProducts: Product[];
}

// Authentication Helpers
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const logoutAdmin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// Generic authenticated fetch helper
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers = {
    ...options.headers,
  } as Record<string, string>;

  // Append Content-Type by default unless it is explicitly omitted or overridden
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && endpoint !== '/auth/login') {
    logoutAdmin();
    throw new Error('Session expired. Please log in again.');
  }

  return res;
};

// Login API Operation
export const login = async (username: string, password: string): Promise<{ token: string; user: any }> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed. Please check credentials.');
  }

  const data = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

// Product API Operations
export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetchWithAuth('/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

export const createProduct = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const res = await fetchWithAuth('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create product');
  }
  return res.json();
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const res = await fetchWithAuth(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update product');
  }
  return res.json();
};

export const deleteProduct = async (id: string): Promise<{ message: string; id: string }> => {
  const res = await fetchWithAuth(`/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
};

export const addStock = async (id: string, quantity: number): Promise<{ message: string; product: Product }> => {
  const res = await fetchWithAuth(`/products/${id}/add-stock`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add stock');
  }
  return res.json();
};

// Invoice API Operations
export const fetchInvoices = async (): Promise<Invoice[]> => {
  const res = await fetchWithAuth('/invoices');
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
};

export const fetchInvoiceByNumber = async (invoiceNumber: string): Promise<Invoice> => {
  const res = await fetchWithAuth(`/invoices/${invoiceNumber}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Invoice not found');
  }
  return res.json();
};

export const createInvoice = async (invoiceData: {
  customer: Customer;
  items: { productId: string; quantity: number }[];
}): Promise<Invoice> => {
  const res = await fetchWithAuth('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to process invoice');
  }
  return res.json();
};

// Dashboard API Operations
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await fetchWithAuth('/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
};
