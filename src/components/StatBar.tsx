import { STAT_KO } from "@/lib/pokemon-meta";

// 종족값 최대치는 255. 막대를 15칸 "블록"으로 쪼개 게임 HP바처럼 표현
const MAX_STAT = 255;
const BLOCKS = 15;

export function StatBar({ statKey, value }: { statKey: string; value: number }) {
  const filled = Math.max(1, Math.round((value / MAX_STAT) * BLOCKS));

  return (
    <div className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-2 text-sm">
      <dt>{STAT_KO[statKey] ?? statKey}</dt>
      <dd className="text-right font-bold">{value}</dd>
      <dd
        className="flex gap-[2px]"
        role="meter"
        aria-label={`${STAT_KO[statKey] ?? statKey} ${value}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={MAX_STAT}
      >
        {Array.from({ length: BLOCKS }, (_, i) => (
          <span key={i} className={`h-3 flex-1 ${i < filled ? "bg-ink" : "bg-line"}`} />
        ))}
      </dd>
    </div>
  );
}
