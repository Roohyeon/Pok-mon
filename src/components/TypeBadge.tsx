import { TYPE_META } from "@/lib/pokemon-meta";
import type { PokemonTypeName } from "@/lib/types";

// 알약 태그: 크림 바탕 + 검정 테두리. 타입 색은 작은 픽셀 칸으로만 표시
export function TypeBadge({ type, size = "sm" }: { type: PokemonTypeName; size?: "sm" | "md" }) {
  const meta = TYPE_META[type];
  return (
    <span className={`tag ${size === "md" ? "px-3 text-sm" : ""}`}>
      <span aria-hidden className="size-2 border border-ink" style={{ backgroundColor: meta.color }} />
      {meta.ko}
    </span>
  );
}
