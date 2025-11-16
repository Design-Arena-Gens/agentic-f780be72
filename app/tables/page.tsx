'use client';
import { usePosStore } from '@/store/usePosStore';
import { useState } from 'react';

export default function TablesPage() {
  const { tables, addTable, updateTable } = usePosStore();
  const [draft, setDraft] = useState({ name: '', capacity: 2 });

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-2">
        <input className="border px-3 py-2 rounded" placeholder="Table name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className="border px-3 py-2 rounded" type="number" placeholder="Capacity" value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: parseInt(e.target.value || '0', 10) })} />
        <button className="bg-brand-600 text-white px-4 py-2 rounded" onClick={() => { if (draft.name && draft.capacity > 0) { addTable(draft); setDraft({ name: '', capacity: 2 }); } }}>Add Table</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map((t) => (
          <div key={t.id} className="border rounded p-4">
            <div className="font-semibold">{t.name} <span className="text-xs text-gray-500">({t.capacity})</span></div>
            <div className="text-sm mb-2">Status: <span className={t.status === 'free' ? 'text-green-600' : 'text-orange-600'}>{t.status}</span></div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded text-sm" onClick={() => updateTable(t.id, { status: 'free', currentOrderId: null })}>Free</button>
              <button className="px-3 py-1 border rounded text-sm" onClick={() => updateTable(t.id, { status: 'reserved' })}>Reserve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
