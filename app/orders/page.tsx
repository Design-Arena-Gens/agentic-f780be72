'use client';
import { usePosStore } from '@/store/usePosStore';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export default function OrdersPage() {
  const { orders, settings } = usePosStore();
  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Orders</div>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border rounded p-3 grid grid-cols-5 gap-2 items-center">
            <div className="font-mono text-xs">{o.id}</div>
            <div>{o.type}{o.tableId ? ` (${o.tableId.slice(0,4)})` : ''}</div>
            <div className={o.status === 'open' ? 'text-orange-600' : 'text-green-600'}>{o.status}</div>
            <div>{format(o.createdAt, 'PP p')}</div>
            <div className="justify-self-end">{formatCurrency(o.total, settings.currency)}</div>
          </li>
        ))}
        {orders.length === 0 && <div className="text-gray-500">No orders yet.</div>}
      </ul>
    </div>
  );
}
