import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hardware Shop Inventory & Billing',
  description: 'Manage products, track low stock, and generate invoices with automatic calculations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} flex h-full min-h-screen flex-col md:flex-row text-gray-800`}>
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
