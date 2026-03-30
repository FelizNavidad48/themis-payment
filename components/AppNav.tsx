'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavConnectButton } from './NavConnectButton';

export function AppNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-primary-600/30 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-white hover:text-primary-100 transition-colors">
            Themis
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/request/create"
              className={`text-white hover:text-primary-100 transition-colors font-medium ${
                isActive('/request/create') ? 'text-primary-100' : ''
              }`}
            >
              Request
            </Link>
            <Link
              href="/dashboard"
              className={`text-white hover:text-primary-100 transition-colors font-medium ${
                isActive('/dashboard') ? 'text-primary-100' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className={`text-white hover:text-primary-100 transition-colors font-medium ${
                isActive('/settings') ? 'text-primary-100' : ''
              }`}
            >
              Settings
            </Link>
            <NavConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
