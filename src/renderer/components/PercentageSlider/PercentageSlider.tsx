import { useCallback, useRef, useState, useEffect } from 'react';
import { useRangeStore } from '../../store/rangeStore';

export function PercentageSlider() {
  const sliderLow = useRangeStore((s) => s.sliderLow);
  const sliderHigh = useRangeStore((s) => s.sliderHigh);
  const applySlider = useRangeStore((s) => s.applySlider);
  const getPercentage = useRangeStore((s) => s.getPercentage);
  const range = useRangeStore((s) => s.range);

  const [localLow, setLocalLow] = useState(sliderLow);
  const [localHigh, setLocalHigh] = useState(sliderHigh);
  const [inputValue, setInputValue] = useState('');
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'low' | 'high' | null>(null);

  // Sync external slider values
  useEffect(() => {
    setLocalLow(sliderLow);
    setLocalHigh(sliderHigh);
  }, [sliderLow, sliderHigh]);

  const getPercentFromX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  }, []);

  const handleTrackMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const percent = getPercentFromX(e.clientX);
      // Determine which thumb to move
      const distLow = Math.abs(percent - localLow);
      const distHigh = Math.abs(percent - localHigh);

      if (distLow < distHigh || (localLow === localHigh && percent < localLow)) {
        draggingRef.current = 'low';
        setLocalLow(percent);
      } else {
        draggingRef.current = 'high';
        setLocalHigh(percent);
      }
    },
    [localLow, localHigh, getPercentFromX]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const percent = getPercentFromX(e.clientX);
      if (draggingRef.current === 'low') {
        setLocalLow(Math.min(percent, localHigh));
      } else {
        setLocalHigh(Math.max(percent, localLow));
      }
    };

    const handleMouseUp = () => {
      if (draggingRef.current) {
        draggingRef.current = null;
        applySlider(localLow, localHigh);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [localLow, localHigh, getPercentFromX, applySlider]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleInputSubmit = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        const val = parseFloat(inputValue);
        if (!isNaN(val) && val >= 0 && val <= 100) {
          setLocalHigh(val);
          setLocalLow(0);
          applySlider(0, val);
        }
      }
    },
    [inputValue, applySlider]
  );

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400 shrink-0">Top %</span>

        {/* Double slider track */}
        <div
          ref={trackRef}
          className="flex-1 relative h-6 cursor-pointer"
          onMouseDown={handleTrackMouseDown}
        >
          {/* Background track */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-zinc-700 rounded-full" />

          {/* Active range fill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2 bg-emerald-600 rounded-full"
            style={{
              left: `${localLow}%`,
              width: `${localHigh - localLow}%`,
            }}
          />

          {/* Low thumb */}
          {localLow > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-300 rounded-full shadow border-2 border-emerald-600 cursor-grab active:cursor-grabbing"
              style={{ left: `calc(${localLow}% - 8px)` }}
            />
          )}

          {/* High thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-emerald-600 cursor-grab active:cursor-grabbing"
            style={{ left: `calc(${localHigh}% - 8px)` }}
          />
        </div>

        {/* Percentage labels */}
        <div className="flex items-center gap-1 shrink-0">
          {localLow > 0 && (
            <>
              <span className="text-xs font-mono-poker text-zinc-400">{localLow}%</span>
              <span className="text-xs text-zinc-600">-</span>
            </>
          )}
          <span className="text-xs font-mono-poker text-emerald-400 font-bold">
            {localHigh}%
          </span>
        </div>

        {/* Direct input */}
        <input
          type="text"
          className="w-14 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs font-mono-poker text-zinc-300 text-center focus:outline-none focus:border-zinc-500"
          placeholder="%"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
        />
      </div>
    </div>
  );
}
