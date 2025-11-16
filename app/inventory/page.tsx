'use client';
import { usePosStore } from '@/store/usePosStore';
import { useState } from 'react';

export default function InventoryPage() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, adjustStock } = usePosStore();
  const [draft, setDraft] = useState({ name: '', unit: 'g', reorderLevel: 0 });

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-2">
        <input className="border px-3 py-2 rounded" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <select className="border px-3 py-2 rounded" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="pcs">pcs</option>
        </select>
        <input className="border px-3 py-2 rounded" type="number" placeholder="Reorder level" value={draft.reorderLevel} onChange={(e) => setDraft({ ...draft, reorderLevel: parseFloat(e.target.value || '0') })} />
        <button className="bg-brand-600 text-white px-4 py-2 rounded sm:col-span-3" onClick={() => {
          if (!draft.name) return;
          addIngredient({ name: draft.name, unit: draft.unit as any, reorderLevel: draft.reorderLevel });
          setDraft({ name: '', unit: 'g', reorderLevel: 0 });
        }}>Add Ingredient</button>
      </div>

      <ul className="space-y-2">
        {ingredients.map((ing) => (
          <li key={ing.id} className="border rounded p-3 grid grid-cols-6 gap-2 items-center">
            <div className="font-medium col-span-2">{ing.name}</div>
            <div>{ing.currentStock} {ing.unit}</div>
            <div className={ing.currentStock <= ing.reorderLevel ? 'text-red-600' : 'text-gray-600'}>
              Reorder at {ing.reorderLevel}
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="+/-" className="border px-2 py-1 rounded w-24" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseFloat((e.target as HTMLInputElement).value || '0');
                  if (!isNaN(val) && val !== 0) adjustStock(ing.id, val);
                  (e.target as HTMLInputElement).value = '';
                }
              }} />
              <button className="text-sm text-red-600" onClick={() => deleteIngredient(ing.id)}>Delete</button>
            </div>
            <input className="border px-2 py-1 rounded w-24 justify-self-end" type="number" value={ing.reorderLevel} onChange={(e) => updateIngredient(ing.id, { reorderLevel: parseFloat(e.target.value || '0') })} />
          </li>
        ))}
      </ul>
    </div>
  );
}
