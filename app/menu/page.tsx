'use client';
import { usePosStore } from '@/store/usePosStore';
import { useState } from 'react';

export default function MenuPage() {
  const { categories, menu, addCategory, deleteCategory, addMenuItem, updateMenuItem, deleteMenuItem } = usePosStore();
  const [catName, setCatName] = useState('');
  const [newItem, setNewItem] = useState({ name: '', categoryId: '', price: 0, taxRate: 0.05 });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section>
        <h2 className="text-lg font-semibold mb-2">Categories</h2>
        <div className="flex gap-2 mb-3">
          <input className="border px-3 py-2 rounded w-full" value={catName} placeholder="New category name" onChange={(e) => setCatName(e.target.value)} />
          <button className="bg-brand-600 text-white px-4 py-2 rounded" onClick={() => { if (catName.trim()) { addCategory(catName.trim()); setCatName(''); } }}>Add</button>
        </div>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="border rounded p-3 flex items-center justify-between">
              <div>{c.name}</div>
              <button className="text-red-600 text-sm" onClick={() => deleteCategory(c.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Menu Items</h2>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input className="border px-3 py-2 rounded" placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          <select className="border px-3 py-2 rounded" value={newItem.categoryId} onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input className="border px-3 py-2 rounded" type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value || '0') })} />
          <input className="border px-3 py-2 rounded" type="number" step="0.01" placeholder="Tax rate (e.g., 0.05)" value={newItem.taxRate} onChange={(e) => setNewItem({ ...newItem, taxRate: parseFloat(e.target.value || '0') })} />
          <button className="bg-brand-600 text-white px-4 py-2 rounded col-span-2" onClick={() => {
            if (!newItem.name || !newItem.categoryId) return;
            addMenuItem({ name: newItem.name, categoryId: newItem.categoryId, price: newItem.price, taxRate: newItem.taxRate });
            setNewItem({ name: '', categoryId: '', price: 0, taxRate: 0.05 });
          }}>Add Item</button>
        </div>
        <ul className="space-y-2">
          {menu.map((m) => (
            <li key={m.id} className="border rounded p-3 grid grid-cols-6 gap-2 items-center">
              <div className="col-span-2 font-medium">{m.name}</div>
              <div className="text-sm text-gray-600">${m.price.toFixed(2)}</div>
              <div className="text-sm">{categories.find((c) => c.id === m.categoryId)?.name}</div>
              <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={m.isAvailable} onChange={(e) => updateMenuItem(m.id, { isAvailable: e.target.checked })} /> Available</label>
              <button className="text-red-600 text-sm justify-self-end" onClick={() => deleteMenuItem(m.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
