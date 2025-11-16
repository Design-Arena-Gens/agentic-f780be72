import Link from 'next/link';

export default function Page() {
  const links = [
    { href: '/pos', label: 'POS' },
    { href: '/waiter', label: 'Waiter' },
    { href: '/tables', label: 'Tables' },
    { href: '/orders', label: 'Orders' },
    { href: '/menu', label: 'Menu' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/kot', label: 'KOT' },
    { href: '/settings', label: 'Settings' },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="border rounded-lg p-6 hover:shadow transition">
          <div className="text-xl font-semibold mb-2">{l.label}</div>
          <div className="text-gray-500 text-sm">Go to {l.label}</div>
        </Link>
      ))}
    </div>
  );
}
