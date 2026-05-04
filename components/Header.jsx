'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { isAdminEmail } from '@/lib/adminConfig';
import { supabase } from '@/lib/supabaseClient';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/services', label: 'Servizi' },
  { href: '/eventi', label: 'Eventi' },
];

export default function Header({ user }) {
  const pathname = usePathname();
  const router = useRouter();
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
    <div className="crotti-header-wrapper">
      <div className="top-bar">
        <div className="top-bar-content">
          <span className="contact-info">assistenza@crottisafety.it | +39 035 630 4701</span>
          <span className="user-actions">
            <span className="user-meta">{user?.email || 'Area cliente'}</span>
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
  );
}
