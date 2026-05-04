'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isAdminEmail } from '@/lib/adminConfig';
import { supabase } from '@/lib/supabaseClient';
import ShareModal from './ShareModal';
import ReadOnlyBanner from './ReadOnlyBanner';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/services', label: 'Servizi' },
  { href: '/eventi', label: 'Eventi' },
];

export default function Header({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  useEffect(() => {
    // Controllo client-side per evitare problemi di SSR con useSearchParams
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsReadOnly(params.get('readonly') === 'true');
    }
  }, []);
  const navItemsForUser = isAdminEmail(user?.email)
    ? [...navItems, { href: '/admin/dashboard', label: 'Gestione Aziendale' }]
    : navItems;

  const handleSignOut = async () => {
    sessionStorage.removeItem('role');
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <>
      {isReadOnly && <ReadOnlyBanner />}
      <div className="crotti-header-wrapper">
      <div className="top-bar">
        <div className="top-bar-content">
          <span className="contact-info">assistenza@crottisafety.it | +39 035 630 4701</span>
          <span className="user-actions">
            <span className="user-meta" style={{ marginRight: '10px' }}>{user?.email || 'Area cliente'}</span>
            <button type="button" className="link-button" onClick={() => setIsShareModalOpen(true)}>
              Condividi
            </button>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
            {user ? (
              <button type="button" className="link-button" onClick={handleSignOut}>
                Esci
              </button>
            ) : (
              <Link href="/login">Accedi</Link>
            )}
          </span>
        </div>
      </div>

      <header className="main-header">
        <div className="header-container">
          <Link className="logo" href="/dashboard" aria-label="Crotti Safety dashboard">
            <Image src="/crotti-logo.png" alt="Crotti Safety" width={154} height={42} priority />
            <span>Crotti Safety</span>
          </Link>

          <nav className="main-nav" aria-label="Navigazione principale">
            {navItemsForUser.map((item) => (
              <Link
                key={item.href}
                className={`nav-item ${pathname === item.href || (item.href === '/dashboard' && pathname === '/') ? 'active' : ''}`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </div>
    <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </>
  );
}
