import { useState, useRef } from 'react';
import { PRESET_RANGES } from '../../data/preset-ranges';
import { useRangeLibraryStore, type ExportData } from '../../store/rangeLibraryStore';
import { useRangeStore } from '../../store/rangeStore';
import { rangeToNotation } from '../../engine/ranges';
import { useT } from '../../hooks/useT';

export function RangeManager() {
  const t = useT();
  const {
    disabledCategories, customRanges, customCategories,
    toggleCategory, addCustomRange, deleteCustomRange, updateCustomRange,
    addCustomCategory, deleteCustomCategory, importRanges, exportRanges,
    getAllRanges,
  } = useRangeLibraryStore();

  const importNotation = useRangeStore(s => s.importNotation);
  const range = useRangeStore(s => s.range);
  const getNotation = useRangeStore(s => s.getNotation);

  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showNewRange, setShowNewRange] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newRangeName, setNewRangeName] = useState('');
  const [newRangeNotation, setNewRangeNotation] = useState('');
  const [newRangeCategory, setNewRangeCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotation, setEditNotation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allRanges = getAllRanges();
  const builtInNames = new Set(PRESET_RANGES.map(c => c.name));

  const handleLoadToGrid = (notation: string) => {
    importNotation(notation);
  };

  const handleSaveFromGrid = () => {
    const notation = getNotation();
    if (!notation) return;
    setNewRangeNotation(notation);
    setShowNewRange(true);
  };

  const handleCreateRange = () => {
    if (!newRangeName.trim() || !newRangeNotation.trim() || !newRangeCategory.trim()) return;
    addCustomRange(newRangeName.trim(), newRangeNotation.trim(), newRangeCategory.trim());
    setNewRangeName('');
    setNewRangeNotation('');
    setShowNewRange(false);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    addCustomCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const handleExport = () => {
    const data = exportRanges();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equimac-ranges.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ExportData;
        if (data.version === 1 && Array.isArray(data.ranges)) {
          importRanges(data);
        }
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim() && editNotation.trim()) {
      updateCustomRange(id, editName.trim(), editNotation.trim());
    }
    setEditingId(null);
  };

  const availableCategories = customCategories.length > 0 ? customCategories : ['My ranges'];

  return (
    <div className="flex flex-col gap-3">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('range_library')}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSaveFromGrid}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          {t('save_from_grid')}
        </button>
        <button
          onClick={() => setShowNewRange(true)}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
        >
          {t('new_range')}
        </button>
        <button
          onClick={() => setShowNewCategory(true)}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
        >
          {t('new_category')}
        </button>
        <div className="flex-1" />
        <button
          onClick={handleExport}
          disabled={customRanges.length === 0}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-30 transition-colors"
        >
          {t('export')}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
        >
          {t('import')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* New category form */}
      {showNewCategory && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{t('new_category_label')}</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('category_name_placeholder')}
              className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
              autoFocus
            />
            <button onClick={handleCreateCategory} className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500">OK</button>
            <button onClick={() => setShowNewCategory(false)} className="px-2 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-300">✕</button>
          </div>
        </div>
      )}

      {/* New range form */}
      {showNewRange && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{t('new_range_label')}</span>
          <input
            type="text"
            value={newRangeName}
            onChange={(e) => setNewRangeName(e.target.value)}
            placeholder={t('range_name_placeholder')}
            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
            autoFocus
          />
          <input
            type="text"
            value={newRangeNotation}
            onChange={(e) => setNewRangeNotation(e.target.value)}
            placeholder={t('range_notation_placeholder')}
            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs font-mono-poker text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
          />
          <select
            value={newRangeCategory}
            onChange={(e) => setNewRangeCategory(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="">{t('category_select')}</option>
            {availableCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={handleCreateRange} disabled={!newRangeName.trim() || !newRangeNotation.trim() || !newRangeCategory} className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40">{t('create')}</button>
            <button onClick={() => setShowNewRange(false)} className="px-2 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-300">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {allRanges.map((cat) => {
          const isBuiltIn = builtInNames.has(cat.name);
          const isDisabled = disabledCategories.has(cat.name);
          const isExpanded = expandedCat === cat.name;

          return (
            <div key={cat.name} className={`rounded-lg border transition-colors ${isDisabled ? 'border-zinc-800 opacity-50' : 'border-zinc-700'}`}>
              {/* Category header */}
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
                    isDisabled ? 'border-zinc-600 text-zinc-700' : 'border-emerald-600 bg-emerald-600 text-white'
                  }`}
                >
                  {!isDisabled && '✓'}
                </button>
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.name)}
                  className="flex-1 text-left text-[11px] font-semibold text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  {cat.name}
                  <span className="ml-1 text-zinc-600 font-normal">({cat.presets.length})</span>
                </button>
                <span className="text-[10px] text-zinc-600">{isExpanded ? '−' : '+'}</span>
                {!isBuiltIn && (
                  <button
                    onClick={() => { if (confirm(`Delete "${cat.name}" ${t('delete_category_confirm')}`)) deleteCustomCategory(cat.name); }}
                    className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
                    title={t('delete_category')}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Ranges list */}
              {isExpanded && (
                <div className="border-t border-zinc-800">
                  {cat.presets.length === 0 && (
                    <div className="px-5 py-2 text-[10px] text-zinc-600">{t('no_ranges')}</div>
                  )}
                  {cat.presets.map((preset, pi) => {
                    const customMatch = customRanges.find(r => r.name === preset.name && r.category === cat.name);
                    const isEditing = editingId === customMatch?.id;

                    if (isEditing && customMatch) {
                      return (
                        <div key={pi} className="px-4 py-2 space-y-1 bg-zinc-900/50">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-[11px] text-zinc-200 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editNotation}
                            onChange={(e) => setEditNotation(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-[11px] font-mono-poker text-zinc-200 focus:outline-none"
                          />
                          <div className="flex gap-1">
                            <button onClick={() => handleSaveEdit(customMatch.id)} className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white">OK</button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-0.5 rounded text-[10px] text-zinc-500">Cancel</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={pi} className="flex items-center gap-2 px-4 py-1.5 hover:bg-zinc-800/50 group">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-zinc-300 truncate">{preset.name}</div>
                          <div className="text-[10px] font-mono-poker text-zinc-600 truncate">{preset.notation}</div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => handleLoadToGrid(preset.notation)}
                            className="px-2 py-0.5 rounded text-[10px] bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                            title={t('load_to_grid')}
                          >
                            {t('load')}
                          </button>
                          {customMatch && (
                            <>
                              <button
                                onClick={() => { setEditingId(customMatch.id); setEditName(customMatch.name); setEditNotation(customMatch.notation); }}
                                className="px-2 py-0.5 rounded text-[10px] bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                              >
                                {t('edit')}
                              </button>
                              <button
                                onClick={() => deleteCustomRange(customMatch.id)}
                                className="px-1.5 py-0.5 rounded text-[10px] text-zinc-500 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
