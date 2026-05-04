'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CrottiPortal from '@/components/CrottiPortal';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  return (
    <ProtectedRoute onUser={setUser}>
      {/* FIX: shell unica per mantenere layout dashboard coerente tra pagine protette. */}
      <div className="app-shell">
        <Header user={user} />
        <CrottiPortal user={user} />
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
