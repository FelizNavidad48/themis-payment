'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavConnectButton } from './NavConnectButton';

export function AppNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
            Themis
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/request/create"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/request/create')
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Request
            </Link>
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/settings')
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Settings
            </Link>
            <div className="ml-2 pl-2 border-l border-white/20">
              <NavConnectButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
