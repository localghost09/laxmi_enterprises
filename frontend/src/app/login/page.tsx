'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Hammer, AlertCircle } from 'lucide-react';
import { login, getToken } from '../../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (getToken()) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username.trim(), password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 px-4">
      {/* Background visual effect */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-950 to-slate-950 opacity-90" />

      {/* Login Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-md animate-scale-up">
        
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Hammer className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-black tracking-tight text-white uppercase">Laxmi Enterprises</h2>
          <p className="mt-1.5 text-xs font-semibold text-slate-400">Admin Control Panel Security</p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-950/40 bg-red-950/20 p-4 text-xs font-semibold text-red-400 leading-normal">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Admin Username</label>
            <div className="relative mt-1.5 flex items-center rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 focus-within:border-blue-500">
              <User className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder-slate-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Security Password</label>
            <div className="relative mt-1.5 flex items-center rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 focus-within:border-blue-500">
              <Lock className="h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder-slate-600"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer help */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600">
            Authorized admin access only. All actions are logged.
          </p>
        </div>

      </div>
    </div>
  );
}
