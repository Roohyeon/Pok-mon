import type { Metadata } from "next";
import { Suspense } from "react";
import { CrtTv } from "@/components/CrtTv";
import { TvCarousel, TvCarouselFromUrl } from "@/components/TvCarousel";
import { getPokemonFamilies } from "@/lib/pokeapi";

export const metadata: Metadata = { title: "도감 진열장" };

// 서버 컴포넌트: 이 코드는 서버(빌드 시점)에서만 실행됩니다.
// getPokemonFamilies()가 캐시되어 있어 결과가 정적 HTML에 포함되고,
// 브라우저는 PokeAPI를 호출하지 않고 완성된 화면을 바로 받습니다.
export default async function DexPage() {
  // 진화 계열 하나 = 카드 한 장
  const families = await getPokemonFamilies();

  return (
    <CrtTv>
      <h1 className="sr-only">포켓몬 진열장</h1>
      {/* 주소의 ?type=&p= 는 브라우저에서만 알 수 있어 Suspense로 감쌈.
          그 전까지는 기본 상태(전체 · 첫 카드)를 미리 그려 둔 HTML을 보여 줌 */}
      <Suspense fallback={<TvCarousel families={families} searchParams={null} />}>
        <TvCarouselFromUrl families={families} />
      </Suspense>
    </CrtTv>
  );
}
