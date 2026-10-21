import { PixelCloud } from "./PixelCloud";

/**
 * 오래된 CRT TV 틀 + 도트 하늘 배경. 랜딩(/)과 진열장(/dex)이 같은 TV를 써서
 * START를 눌러 넘어갈 때 화면 안 내용만 바뀌는 것처럼 보이게 함.
 * children은 화면(.crt-screen)을 기준으로 absolute 배치하면 됨
 */
export function CrtTv({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 place-items-center bg-[#1d1d1f] p-3 sm:p-8">
      <div className="crt-bezel w-full max-w-5xl">
        <div className="crt-screen">
          {/* 하늘 */}
          <div aria-hidden className="landing-sky absolute inset-0" />

          {/* 떠다니는 작은 구름 */}
          <PixelCloud width={22} bumps={[{ x: 6, r: 4 }, { x: 12, r: 6 }, { x: 17, r: 4 }]} className="cloud-drift absolute top-[12%] left-[6%] w-28 sm:w-40" />
          <PixelCloud width={18} bumps={[{ x: 5, r: 3 }, { x: 10, r: 5 }, { x: 14, r: 3 }]} className="cloud-drift-slow absolute top-[6%] right-[14%] w-24 sm:w-32" />

          {/* 아래쪽 구름 둑 */}
          <PixelCloud
            width={96}
            bumps={[
              { x: 4, r: 14 }, { x: 16, r: 10 }, { x: 27, r: 7 }, { x: 38, r: 6 },
              { x: 48, r: 8 }, { x: 58, r: 6 }, { x: 69, r: 7 }, { x: 80, r: 10 }, { x: 92, r: 15 },
            ]}
            className="absolute inset-x-0 bottom-0 h-[38%] w-full"
          />

          {children}

          {/* 주사선 + 유리 반사 (클릭은 통과) */}
          <div aria-hidden className="crt-scanlines pointer-events-none absolute inset-0 z-50" />
        </div>
      </div>
    </main>
  );
}
