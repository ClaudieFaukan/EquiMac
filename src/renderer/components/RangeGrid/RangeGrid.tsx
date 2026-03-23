import React, { useCallback, useRef, useState } from 'react';
import { RANKS } from '../../engine/constants';
import { useRangeStore } from '../../store/rangeStore';
import { HandCell } from './HandCell';
import { SuitSubGrid } from './SuitSubGrid';

export function RangeGrid() {
  const range = useRangeStore((s) => s.range);
  const paintCell = useRangeStore((s) => s.paintCell);
  const toggleCell = useRangeStore((s) => s.toggleCell);
  const pushUndo = useRangeStore((s) => s.pushUndo);

  const [isDragging, setIsDragging] = useState(false);
  const paintValueRef = useRef<number>(1);
  const [subGrid, setSubGrid] = useState<{
    row: number;
    col: number;
    position: { x: number; y: number };
  } | null>(null);

  const handleMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      if (e.button === 2) return; // right click handled by context menu
      e.preventDefault();
      pushUndo();
      // Toggle: if currently selected, paint 0; else paint 1
      const newValue = range[row][col] > 0 ? 0 : 1;
      paintValueRef.current = newValue;
      paintCell(row, col, newValue);
      setIsDragging(true);
    },
    [range, paintCell, pushUndo]
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isDragging) {
        paintCell(row, col, paintValueRef.current);
      }
    },
    [isDragging, paintCell]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleContextMenu = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.preventDefault();
      setSubGrid({
        row,
        col,
        position: { x: e.clientX, y: e.clientY },
      });
    },
    []
  );

  return (
    <div
      className="select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Column headers */}
      <div className="grid grid-cols-[20px_repeat(13,1fr)] gap-0">
        <div />
        {RANKS.map((rank) => (
          <div
            key={rank}
            className="text-center text-[10px] text-zinc-500 font-mono-poker font-bold pb-0.5"
          >
            {rank}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="grid grid-cols-[20px_repeat(13,1fr)] gap-0">
        {Array.from({ length: 13 }, (_, row) => (
          <React.Fragment key={row}>
            {/* Row header */}
            <div className="flex items-center justify-center text-[10px] text-zinc-500 font-mono-poker font-bold pr-0.5">
              {RANKS[row]}
            </div>
            {/* Cells */}
            {Array.from({ length: 13 }, (_, col) => (
              <HandCell
                key={`${row}-${col}`}
                row={row}
                col={col}
                weight={range[row][col]}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onContextMenu={handleContextMenu}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Suit sub-grid popup */}
      {subGrid && (
        <SuitSubGrid
          row={subGrid.row}
          col={subGrid.col}
          position={subGrid.position}
          onClose={() => setSubGrid(null)}
        />
      )}
    </div>
  );
}
