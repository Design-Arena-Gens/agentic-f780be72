'use client';
import { usePosStore } from '@/store/usePosStore';
import { useMemo, useState } from 'react';
import { generateId, formatCurrency } from '@/lib/utils';

export default function POSPage() {
  const store = usePosStore();
  const { categories, menu, tables, orders, createOrder, addItemToOrder, updateOrderItem, removeOrderItem, sendToKitchen, takePayment, closeOrderIfPaid, settings } = store;
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  const currentOrder = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  const ensureOrder = (type: 'dine-in' | 'takeaway') => {
    if (currentOrder) return currentOrder.id;
    const id = createOrder({ tableId: type === 'dine-in' ? selectedTableId || null : null, type });
    setOrderId(id);
    return id;
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <section className="md:col-span-2 space-y-3">
        <div className="flex gap-2 items-center">
          <select className="border px-3 py-2 rounded" value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)}>
            <option value="">Takeaway</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
            ))}
          </select>
          <button className="px-3 py-2 border rounded" onClick={() => { const id = ensureOrder(selectedTableId ? 'dine-in' : 'takeaway'); }}>Start Order</button>
          {currentOrder && <span className="text-sm text-gray-600">Order: {currentOrder.id.slice(0,6)}</span>}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <div key={c.id} className="px-3 py-1 border rounded whitespace-nowrap">{c.name}</div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {menu.filter((m) => m.isAvailable).map((m) => (
            <button key={m.id} className="border rounded p-4 text-left hover:shadow" onClick={() => {
              const id = ensureOrder(selectedTableId ? 'dine-in' : 'takeaway');
              addItemToOrder(id, { menuItemId: m.id });
            }}>
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-gray-600">{formatCurrency(m.price, settings.currency)}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="border rounded p-4 space-y-3">
        <div className="font-semibold">Cart</div>
        <div className="space-y-2 max-h-[50vh] overflow-auto">
          {currentOrder?.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{it.name} <span className="text-xs text-gray-500">({it.status})</span></div>
                <div className="text-sm text-gray-600">{formatCurrency(it.price, settings.currency)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 border rounded" onClick={() => updateOrderItem(currentOrder.id, it.id, { quantity: Math.max(1, it.quantity - 1) })}>-</button>
                <div>{it.quantity}</div>
                <button className="px-2 py-1 border rounded" onClick={() => updateOrderItem(currentOrder.id, it.id, { quantity: it.quantity + 1 })}>+</button>
                <button className="text-red-600 text-sm" onClick={() => removeOrderItem(currentOrder.id, it.id)}>Remove</button>
              </div>
            </div>
          ))}
          {!currentOrder && <div className="text-gray-500">No items yet.</div>}
        </div>

        {currentOrder && (
          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(currentOrder.subtotal, settings.currency)}</span></div>
            <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(currentOrder.tax, settings.currency)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(currentOrder.total, settings.currency)}</span></div>

            <div className="flex gap-2">
              <button className="px-3 py-2 border rounded" onClick={() => sendToKitchen(currentOrder.id)}>Send to KOT</button>
              <button className="px-3 py-2 border rounded" onClick={() => {
                const amount = currentOrder.total;
                takePayment(currentOrder.id, { id: generateId('pay_'), amount, method: 'cash', paidAt: Date.now() });
                closeOrderIfPaid(currentOrder.id);
                setOrderId('');
              }}>Pay Cash</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
