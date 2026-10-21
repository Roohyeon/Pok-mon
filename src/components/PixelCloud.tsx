// 도트 구름: 원 여러 개를 겹친 실루엣을 1칸짜리 막대(column)로 쪼개 SVG 사각형으로 그림.
// shape-rendering="crispEdges"라서 아무리 키워도 계단 모양이 그대로 유지됨
type Bump = { x: number; r: number };

const OUTLINE = "#7c9ee6";
const BODY = "#f5f8ff";
const SHADE = "#d3e1fa";

function columnHeights(width: number, bumps: Bump[]) {
  return Array.from({ length: width }, (_, col) => {
    const x = col + 0.5;
    let h = 0;
    for (const b of bumps) {
      const d = Math.abs(x - b.x);
      if (d < b.r) h = Math.max(h, Math.sqrt(b.r * b.r - d * d));
    }
    return Math.round(h);
  });
}

export function PixelCloud({
  width,
  bumps,
  className,
}: {
  width: number;
  bumps: Bump[];
  className?: string;
}) {
  const heights = columnHeights(width, bumps);
  const top = Math.max(...heights) + 1;
  // 바닥은 화면 아래로 이어지도록 여유 4칸
  const bottom = top + 4;

  return (
    <svg
      aria-hidden
      viewBox={`-1 0 ${width + 2} ${bottom}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      className={className}
    >
      {heights.map((h, col) => {
        if (h === 0) return null;
        const y = top - h;
        // 이웃 칸보다 높으면 옆면 테두리가 보이도록 위로 1칸 더 칠함
        const outlineH = Math.max(h, heights[col - 1] ?? 0, heights[col + 1] ?? 0) + 1;
        return (
          <g key={col}>
            <rect x={col} y={top - outlineH} width={1} height={bottom} fill={OUTLINE} />
            <rect x={col} y={y} width={1} height={bottom} fill={BODY} />
            <rect x={col} y={top - Math.ceil(h * 0.35)} width={1} height={bottom} fill={SHADE} />
          </g>
        );
      })}
    </svg>
  );
}
