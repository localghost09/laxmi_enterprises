'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Receipt, FileText, Menu, X, Hammer } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/products', icon: Package },
    { name: 'Create Invoice', path: '/invoices/new', icon: Receipt },
    { name: 'Sales History', path: '/invoices', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2 font-semibold text-blue-600">
          <Hammer className="h-6 w-6" />
          <span className="text-lg tracking-wide uppercase font-extrabold text-gray-900">Laxmi Hardware</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white p-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col md:static`}
      >
        {/* Desktop Logo */}
        <div className="hidden h-16 items-center gap-3 border-b border-gray-100 px-2 md:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-gray-900">Laxmi Hardware</h1>
            <p className="text-xs font-medium text-gray-500">Billing & Inventory</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
          <p>© 2026 Laxmi Enterprises</p>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
        />
      )}
    </>
  );
}
