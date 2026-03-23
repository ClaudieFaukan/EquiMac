interface ResultsBarProps {
  equities: number[];
  labels: string[];
}

const PLAYER_COLORS = [
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
  'bg-orange-500',
];

export function ResultsBar({ equities, labels }: ResultsBarProps) {
  if (equities.length === 0) return null;

  return (
    <div>
      <div className="flex h-5 rounded-full overflow-hidden bg-zinc-700">
        {equities.map((eq, i) => (
          <div
            key={i}
            className={`${PLAYER_COLORS[i % PLAYER_COLORS.length]} transition-all duration-300 flex items-center justify-center`}
            style={{ width: `${eq * 100}%` }}
          >
            {eq > 0.08 && (
              <span className="text-[10px] font-bold text-white">
                {(eq * 100).toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex mt-1 gap-3">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`} />
            <span className="text-[10px] text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
