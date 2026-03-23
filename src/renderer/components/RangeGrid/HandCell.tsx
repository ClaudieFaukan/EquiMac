import React, { useCallback } from 'react';
import { getHandLabel, getHandType, type HandType } from '../../engine/constants';

interface HandCellProps {
  row: number;
  col: number;
  weight: number;
  onMouseDown: (row: number, col: number, e: React.MouseEvent) => void;
  onMouseEnter: (row: number, col: number) => void;
  onContextMenu: (row: number, col: number, e: React.MouseEvent) => void;
}

const TYPE_BG: Record<HandType, string> = {
  pair: 'bg-amber-900/40',
  suited: 'bg-rose-900/30',
  offsuit: 'bg-sky-900/20',
};

const TYPE_SELECTED: Record<HandType, string> = {
  pair: 'rgb(217, 119, 6)',    // amber
  suited: 'rgb(220, 38, 38)',   // red
  offsuit: 'rgb(37, 99, 235)',  // blue
};

export const HandCell = React.memo(function HandCell({
  row,
  col,
  weight,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
}: HandCellProps) {
  const label = getHandLabel(row, col);
  const type = getHandType(row, col);
  const isSelected = weight > 0;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => onMouseDown(row, col, e),
    [row, col, onMouseDown]
  );
  const handleMouseEnter = useCallback(
    () => onMouseEnter(row, col),
    [row, col, onMouseEnter]
  );
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => onContextMenu(row, col, e),
    [row, col, onContextMenu]
  );

  const selectedColor = TYPE_SELECTED[type];
  const bgStyle = isSelected
    ? { backgroundColor: selectedColor, opacity: 0.3 + weight * 0.7 }
    : undefined;

  return (
    <div
      className={`
        relative flex items-center justify-center
        text-[10px] font-mono-poker font-semibold select-none cursor-pointer
        border border-zinc-700/50 transition-colors duration-75
        ${!isSelected ? TYPE_BG[type] : ''}
        hover:brightness-125
      `}
      style={bgStyle}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onContextMenu={handleContextMenu}
    >
      <span className={isSelected ? 'text-white drop-shadow-sm' : 'text-zinc-400'}>
        {label}
      </span>
      {weight > 0 && weight < 1 && (
        <span className="absolute bottom-0 right-0.5 text-[7px] text-white/70">
          {Math.round(weight * 100)}
        </span>
      )}
    </div>
  );
});
