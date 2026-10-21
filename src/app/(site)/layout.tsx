import Link from "next/link";
import { DEX_LIMIT } from "@/lib/pokeapi";

const MARQUEE_ITEMS = [`관동 지방 포켓몬 ${DEX_LIMIT}마리`, "종류별 메뉴로 한눈에", "← → 키·스와이프로 넘기기", "이로치 보기", "DATA BY POKEAPI"];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 상단 마키 바: 페이지에서 유일한 유채색 장식 */}
      <div className="marquee h-9 overflow-hidden text-sm leading-9 text-ink">
        <p className="sr-only">{MARQUEE_ITEMS.join(" · ")}</p>
        <div className="marquee-track" aria-hidden>
          {[0, 1].map((copy) => (
            <span key={copy} className="flex">
              {MARQUEE_ITEMS.map((item) => (
                <span key={item} className="px-6">★ {item}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <header className="border-b border-ink px-4">
        <div className="mx-auto flex h-11 max-w-[1200px] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            {/* 픽셀 십자 아이콘 */}
            <span aria-hidden className="grid grid-cols-3 gap-0">
              {[0, 1, 0, 1, 1, 1, 0, 1, 0].map((on, i) => (
                <span key={i} className={`size-1.5 ${on ? "bg-ink" : ""}`} />
              ))}
            </span>
            <span className="text-lg font-bold">PIXEL DEX</span>
          </Link>
          <Link href="/dex" className="text-sm font-bold">▶ 도감 진열장</Link>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-12">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>

      <footer className="border-t border-line px-4 py-4 text-sm">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <p>© PIXEL DEX 2026 · 비상업 팬 프로젝트</p>
          <div className="flex gap-6 font-bold">
            <a href="https://pokeapi.co" target="_blank" rel="noreferrer">POKEAPI</a>
            <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noreferrer">SPRITES</a>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-[1200px] text-caption text-muted">
          Pokémon 및 관련 명칭·이미지의 권리는 Nintendo / Creatures Inc. / GAME FREAK inc.에 있습니다.
          이 사이트는 학습·포트폴리오용 비상업 팬 프로젝트입니다.
        </p>
      </footer>
    </>
  );
}
