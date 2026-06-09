'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { getToken } from '../utils/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    const isLoginPage = pathname === '/login';

    if (!token && !isLoginPage) {
      setIsAuthenticated(false);
      router.push('/login');
    } else if (token && isLoginPage) {
      setIsAuthenticated(true);
      router.push('/');
    } else {
      setIsAuthenticated(!!token);
    }
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';

  // Return a loading spinner during the token validation check to prevent rendering flash
  if (isAuthenticated === null && !isLoginPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-gray-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Standalone fullscreen layout for the Login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Dashboard / Operations sidebar layout
  return (
    <div className="flex h-full min-h-screen w-full flex-col md:flex-row text-gray-800 bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
