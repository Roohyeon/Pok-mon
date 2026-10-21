const SEGMENTS = 12;

/**
 * TV 화면 위를 덮는 "NOW LOADING" 화면.
 * progress(0~1)를 주면 그만큼 칸이 차고, 없으면 칸이 왕복하며 기다리는 표시를 함
 */
export function TvLoading({ progress }: { progress?: number }) {
  const filled = progress === undefined ? null : Math.round(progress * SEGMENTS);

  return (
    <div role="status" className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-[#16285f]/85 text-white">
      <p className="text-2xl font-bold tracking-widest sm:text-3xl">
        NOW LOADING<span className="blink">...</span>
      </p>
      <div className="flex gap-1 border-[3px] border-white p-1.5" aria-hidden>
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={`h-5 w-3 sm:w-4 ${filled === null ? "loading-cell" : i < filled ? "bg-white" : "bg-white/15"}`}
            style={filled === null ? { animationDelay: `${i * 80}ms` } : undefined}
          />
        ))}
      </div>
      <p className="text-sm text-[#cfe0f9]">
        {filled === null ? "포켓몬을 불러오는 중" : `포켓몬을 불러오는 중 ${Math.round((progress ?? 0) * 100)}%`}
      </p>
    </div>
  );
}
