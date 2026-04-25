'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0f172a] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                Dashboard
              </h1>
              <p className="text-gray-400 mt-2">Welcome to your secure portal</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">User Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-lg font-medium">{user?.email || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">User ID</p>
                  <p className="text-xs font-mono text-gray-400 break-all">{user?.id || 'Loading...'}</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">System Status</h3>
              <div className="flex items-center space-x-3 text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <p>Connected to Supabase</p>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Your session is encrypted and protected by Row Level Security.
              </p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
