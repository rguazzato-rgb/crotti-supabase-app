'use client';

import { useState } from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);

  return (
    <ProtectedRoute onUser={setUser}>
      <div className="app-shell">
        <Header user={user} />
        <AdminDashboard user={user} />
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
