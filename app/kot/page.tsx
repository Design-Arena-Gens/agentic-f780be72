'use client';
import { usePosStore } from '@/store/usePosStore';
import { useMemo, useState } from 'react';

export default function KOTPage() {
  const { kotTickets, orders, setTicketStatus, markItemsServed } = usePosStore();
  const [filter, setFilter] = useState<'all' | 'queued' | 'preparing' | 'ready'>('all');

  const visible = useMemo(() => kotTickets.filter((k) => filter === 'all' ? true : k.status === filter), [kotTickets, filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="text-lg font-semibold">Kitchen Tickets</div>
        <select className="border px-3 py-2 rounded" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="queued">Queued</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {visible.map((t) => {
          const order = orders.find((o) => o.id === t.orderId);
          const items = order?.items.filter((it) => t.itemIds.includes(it.id)) ?? [];
          return (
            <div key={t.id} className="border rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Ticket {t.id.slice(0,6)}</div>
                <div className="text-xs text-gray-500">Order {t.orderId.slice(0,6)}</div>
              </div>
              <ul className="space-y-1 mb-3">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between text-sm">
                    <span>{it.name} x {it.quantity}</span>
                    <span className="text-gray-500">{it.status}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                {t.status === 'queued' && (
                  <button className="px-3 py-1 border rounded" onClick={() => setTicketStatus(t.id, 'preparing')}>Start</button>
                )}
                {t.status === 'preparing' && (
                  <button className="px-3 py-1 border rounded" onClick={() => setTicketStatus(t.id, 'ready')}>Mark Ready</button>
                )}
                {t.status === 'ready' && (
                  <button className="px-3 py-1 border rounded" onClick={() => markItemsServed(t.orderId, t.itemIds)}>Serve</button>
                )}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && <div className="text-gray-500">No tickets.</div>}
      </div>
    </div>
  );
}
