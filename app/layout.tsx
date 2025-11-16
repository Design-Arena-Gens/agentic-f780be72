import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Cafe POS',
  description: 'Modern cafe POS for web and mobile',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex gap-3 flex-wrap items-center">
            <Link className="font-semibold text-brand-700" href="/">Cafe POS</Link>
            <div className="text-sm text-gray-500">|</div>
            <div className="flex gap-4 text-sm overflow-x-auto">
              <Link href="/pos" className="hover:text-brand-600">POS</Link>
              <Link href="/waiter" className="hover:text-brand-600">Waiter</Link>
              <Link href="/tables" className="hover:text-brand-600">Tables</Link>
              <Link href="/orders" className="hover:text-brand-600">Orders</Link>
              <Link href="/menu" className="hover:text-brand-600">Menu</Link>
              <Link href="/recipes" className="hover:text-brand-600">Recipes</Link>
              <Link href="/inventory" className="hover:text-brand-600">Inventory</Link>
              <Link href="/kot" className="hover:text-brand-600">KOT</Link>
              <Link href="/settings" className="hover:text-brand-600">Settings</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
