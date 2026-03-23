import { useState } from 'react';
import { useRangeLibraryStore } from '../../store/rangeLibraryStore';
import { useRangeStore } from '../../store/rangeStore';
import { useT } from '../../hooks/useT';

export function PresetSelector() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const importNotation = useRangeStore((s) => s.importNotation);
  const getActivePresets = useRangeLibraryStore(s => s.getActivePresets);

  const activePresets = getActivePresets();

  const handleSelect = (notation: string) => {
    importNotation(notation);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1 rounded text-[10px] font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
      >
        {t('presets')}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-80 overflow-y-auto bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl">
            {activePresets.map((cat, ci) => (
              <div key={ci}>
                <button
                  onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
                  className="w-full text-left px-3 py-2 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-between"
                >
                  {cat.name}
                  <span className="text-zinc-600 text-[10px]">{expandedCat === ci ? '−' : '+'}</span>
                </button>
                {expandedCat === ci && (
                  <div className="bg-zinc-900/50">
                    {cat.presets.map((preset, pi) => (
                      <button
                        key={pi}
                        onClick={() => handleSelect(preset.notation)}
                        className="w-full text-left px-5 py-1.5 text-[11px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                        title={preset.notation}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
