'use client';
import { usePosStore } from '@/store/usePosStore';
import { useMemo, useState } from 'react';

export default function RecipesPage() {
  const { menu, ingredients, recipes, upsertRecipe } = usePosStore();
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const recipe = useMemo(() => recipes.find((r) => r.menuItemId === selectedMenuId), [recipes, selectedMenuId]);
  const [draft, setDraft] = useState<{ ingredientId: string; quantity: number } | null>(null);

  const items = recipe?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <select className="border px-3 py-2 rounded" value={selectedMenuId} onChange={(e) => setSelectedMenuId(e.target.value)}>
          <option value="">Select menu item</option>
          {menu.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <select className="border px-3 py-2 rounded w-full" value={draft?.ingredientId ?? ''} onChange={(e) => setDraft({ ingredientId: e.target.value, quantity: draft?.quantity ?? 0 })}>
            <option value="">Ingredient</option>
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
            ))}
          </select>
          <input className="border px-3 py-2 rounded w-28" type="number" placeholder="Qty" value={draft?.quantity ?? 0} onChange={(e) => setDraft({ ingredientId: draft?.ingredientId ?? '', quantity: parseFloat(e.target.value || '0') })} />
          <button className="bg-brand-600 text-white px-3 rounded" onClick={() => {
            if (!selectedMenuId || !draft?.ingredientId || draft.quantity <= 0) return;
            const merged = [...items.filter((i) => i.ingredientId !== draft.ingredientId), draft];
            upsertRecipe(selectedMenuId, merged);
            setDraft(null);
          }}>Add</button>
        </div>
      </div>

      {selectedMenuId && (
        <div>
          <h3 className="font-semibold mb-2">Recipe</h3>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.ingredientId} className="border rounded p-3 flex items-center justify-between">
                <div>
                  {ingredients.find((g) => g.id === it.ingredientId)?.name} - {it.quantity}
                  {ingredients.find((g) => g.id === it.ingredientId)?.unit}
                </div>
                <button className="text-red-600 text-sm" onClick={() => {
                  const rest = items.filter((i) => i.ingredientId !== it.ingredientId);
                  upsertRecipe(selectedMenuId, rest);
                }}>Remove</button>
              </li>
            ))}
            {items.length === 0 && <div className="text-gray-500">No ingredients yet.</div>}
          </ul>
        </div>
      )}
    </div>
  );
}
