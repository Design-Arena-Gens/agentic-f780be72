'use client';
import { usePosStore } from '@/store/usePosStore';

export default function SettingsPage() {
  const { settings, updateSettings, seedDemo, exportState, importState } = usePosStore();

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Settings</div>
      <div className="grid sm:grid-cols-3 gap-2 items-center">
        <label className="text-sm text-gray-600">Cafe Name</label>
        <input className="border px-3 py-2 rounded sm:col-span-2" value={settings.cafeName} onChange={(e) => updateSettings({ cafeName: e.target.value })} />

        <label className="text-sm text-gray-600">Currency</label>
        <input className="border px-3 py-2 rounded sm:col-span-2" value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} />

        <label className="text-sm text-gray-600">Tax Inclusive</label>
        <input type="checkbox" checked={settings.taxInclusive} onChange={(e) => updateSettings({ taxInclusive: e.target.checked })} />
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" onClick={seedDemo}>Seed Demo Data</button>
        <button className="px-3 py-2 border rounded" onClick={() => {
          const data = JSON.stringify(exportState(), null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'pos-backup.json'; a.click();
          URL.revokeObjectURL(url);
        }}>Export Data</button>
        <label className="px-3 py-2 border rounded cursor-pointer">
          Import Data
          <input type="file" accept="application/json" hidden onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            importState(JSON.parse(text));
          }} />
        </label>
      </div>
    </div>
  );
}
