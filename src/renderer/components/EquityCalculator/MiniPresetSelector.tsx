import { useState } from 'react';
import { useRangeLibraryStore } from '../../store/rangeLibraryStore';

interface MiniPresetSelectorProps {
  onSelect: (notation: string) => void;
}

export function MiniPresetSelector({ onSelect }: MiniPresetSelectorProps) {
  const [open, setOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const getActivePresets = useRangeLibraryStore(s => s.getActivePresets);

  const activePresets = getActivePresets();

  const handleSelect = (notation: string) => {
    onSelect(notation);
    setOpen(false);
    setExpandedCat(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1.5 rounded text-[10px] font-semibold bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-zinc-200 transition-colors"
        title="Charger un range prédéfini"
      >
        Presets
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setExpandedCat(null); }} />
          <div className="absolute right-0 top-full mt-1 z-50 w-60 max-h-72 overflow-y-auto bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl">
            {activePresets.length === 0 && (
              <div className="px-3 py-2 text-[10px] text-zinc-600">Aucun preset actif. Activez-les dans l'onglet Ranges.</div>
            )}
            {activePresets.map((cat, ci) => (
              <div key={ci}>
                <button
                  onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
                  className="w-full text-left px-3 py-1.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-zinc-600 text-[10px] ml-1">{expandedCat === ci ? '−' : '+'}</span>
                </button>
                {expandedCat === ci && (
                  <div className="bg-zinc-900/50">
                    {cat.presets.map((preset, pi) => (
                      <button
                        key={pi}
                        onClick={() => handleSelect(preset.notation)}
                        className="w-full text-left px-5 py-1 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
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
