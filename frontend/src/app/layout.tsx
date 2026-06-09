import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthGuard from '../components/AuthGuard';
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
      <body className={`${inter.className} h-full min-h-screen text-gray-800`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
