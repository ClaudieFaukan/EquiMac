import { useState, useCallback, useEffect } from 'react';
import { useRangeStore } from '../../store/rangeStore';
import { useT } from '../../hooks/useT';

export function RangeStats() {
  const t = useT();
  const getCombos = useRangeStore((s) => s.getCombos);
  const getPercentage = useRangeStore((s) => s.getPercentage);
  const getNotation = useRangeStore((s) => s.getNotation);
  const importNotation = useRangeStore((s) => s.importNotation);
  const clearRange = useRangeStore((s) => s.clearRange);
  const range = useRangeStore((s) => s.range);

  const combos = getCombos();
  const percentage = getPercentage();
  const notation = getNotation();

  const [textInput, setTextInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Sync notation to textInput when not editing
  useEffect(() => {
    if (!isEditing) {
      setTextInput(notation);
    }
  }, [notation, isEditing]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setTextInput(value);
      // Debounced import
      const timeout = setTimeout(() => {
        importNotation(value);
      }, 200);
      return () => clearTimeout(timeout);
    },
    [importNotation]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(notation);
  }, [notation]);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-mono-poker text-amber-400 font-bold">
          {combos} combos
        </span>
        <span className="text-zinc-400">|</span>
        <span className="font-mono-poker text-emerald-400 font-bold">
          {percentage.toFixed(1)}%
        </span>
        <div className="flex-1" />
        <button
          onClick={clearRange}
          className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500"
        >
          Clear
        </button>
        <button
          onClick={handleCopy}
          className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500"
        >
          Copy
        </button>
      </div>

      {/* Range notation text */}
      <textarea
        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs font-mono-poker text-zinc-300 resize-none focus:outline-none focus:border-zinc-500"
        rows={2}
        value={isEditing ? textInput : notation}
        onChange={handleTextChange}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        placeholder={t('enter_range')}
        spellCheck={false}
      />
    </div>
  );
}
