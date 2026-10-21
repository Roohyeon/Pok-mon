import { CrtTv } from "@/components/CrtTv";
import { StartButton } from "@/components/StartButton";
import { DEX_LIMIT } from "@/lib/pokeapi";
import { TYPE_ORDER } from "@/lib/pokemon-meta";

// 랜딩: 오래된 CRT TV 화면 속 도트 하늘 + 구름 + 큰 픽셀 타이틀
export default function LandingPage() {
  return (
    <CrtTv>
      {/* absolute inset-0: 로딩 화면이 TV 화면 전체를 덮을 수 있도록 화면 크기와 맞춤 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 pb-[10%] text-center">
        <p className="text-caption font-bold tracking-widest text-[#1e3a9e] sm:text-sm">BY POKEAPI · FAN PROJECT</p>
        <p className="text-lg font-bold text-[#2a52c9] sm:text-2xl">introducing</p>
        <h1 className="landing-title">PIXEL DEX</h1>
        <p className="landing-sub">픽셀 포켓몬 도감</p>
        <p className="text-sm font-bold text-[#1e3a9e]">
          포켓몬 {DEX_LIMIT}마리 · {TYPE_ORDER.length}가지 종류
        </p>
        <div className="mt-4">
          <StartButton />
        </div>
        <p className="text-caption text-[#1e3a9e] sm:text-sm">ENTER 키를 눌러도 시작돼요</p>
      </div>
    </CrtTv>
  );
}
