'use client';
import { usePosStore } from '@/store/usePosStore';
import { useState } from 'react';

export default function WaiterPage() {
  const { tables, menu, createOrder, addItemToOrder, sendToKitchen } = usePosStore();
  const [tableId, setTableId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  const start = () => {
    if (!tableId) return;
    const id = createOrder({ tableId, type: 'dine-in' });
    setOrderId(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <select className="border px-3 py-2 rounded" value={tableId} onChange={(e) => setTableId(e.target.value)}>
          <option value="">Select table</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
          ))}
        </select>
        <button className="px-3 py-2 border rounded" onClick={start}>Start Order</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menu.filter((m) => m.isAvailable).map((m) => (
          <button key={m.id} className="border rounded p-4 text-left" onClick={() => orderId && addItemToOrder(orderId, { menuItemId: m.id })}>
            <div className="font-medium">{m.name}</div>
            <div className="text-sm text-gray-600">${m.price.toFixed(2)}</div>
          </button>
        ))}
      </div>

      {orderId && (
        <div>
          <button className="bg-brand-600 text-white px-4 py-2 rounded" onClick={() => { sendToKitchen(orderId); setOrderId(''); }}>Send to KOT</button>
        </div>
      )}
    </div>
  );
}
