import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 한글 픽셀 폰트 '갈무리11'(OFL 1.1) — 외부 CDN 없이 우리 서버에서 직접 제공
const galmuri = localFont({
  src: [
    { path: "./fonts/Galmuri11.woff2", weight: "400" },
    { path: "./fonts/Galmuri11-Bold.woff2", weight: "700" },
  ],
  variable: "--font-galmuri",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "PIXEL DEX · 픽셀 포켓몬 도감", template: "%s · PIXEL DEX" },
  description: "PokeAPI 데이터로 만든 2D 픽셀 스타일 포켓몬 도감 (비상업 팬 프로젝트)",
};

// 루트 레이아웃은 html/body만 담당. 헤더·푸터는 (site) 그룹 레이아웃에 있고,
// 랜딩 페이지(/)는 TV 화면만 꽉 차게 보여 줌
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${galmuri.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
