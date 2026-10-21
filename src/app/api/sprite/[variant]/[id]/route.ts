// ─────────────────────────────────────────────────────────────
// 이미지 프록시: GET /api/sprite/{variant}/{id}
//
// 왜 필요한가?
//  PokeAPI 응답의 이미지 주소(raw.githubusercontent.com/...)를 그대로 <img>에 넣으면
//  개발자도구 Network 탭에 원본 출처가 그대로 보입니다.
//  이 라우트가 서버에서 대신 이미지를 받아 전달하므로, 브라우저는 우리 도메인만 보게 됩니다.
//
// 보안 포인트 (오픈 프록시 방지)
//  아무 URL이나 받아서 대신 요청해 주면 "남의 서버를 공격하는 통로"로 악용될 수 있습니다.
//  그래서 variant는 정해진 4가지만, id는 1~1025 숫자만 허용합니다.
// ─────────────────────────────────────────────────────────────
import type { NextRequest } from "next/server";
import type { SpriteVariant } from "@/lib/types";

const SPRITE_BASE = (
  process.env.POKEAPI_SPRITE_BASE_URL ??
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"
).replace(/\/$/, "");

const BW = "versions/generation-v/black-white";

// 허용 목록(allowlist): 여기 없는 값은 전부 404
const VARIANT_PATH: Record<SpriteVariant, (id: number) => string> = {
  pixel: (id) => `${BW}/${id}.png`, // 5세대(블랙·화이트) 도트
  animated: (id) => `${BW}/animated/${id}.gif`, // 움직이는 도트
  "animated-shiny": (id) => `${BW}/animated/shiny/${id}.gif`, // 이로치(색이 다른 개체)
  default: (id) => `${id}.png`, // 위 이미지가 없는 경우 대비
};

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/sprite/[variant]/[id]">) {
  const { variant, id: rawId } = await ctx.params;
  const id = Number(rawId);

  const toPath = VARIANT_PATH[variant as SpriteVariant];
  if (!toPath || !/^\d+$/.test(rawId) || id < 1 || id > 1025) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(`${SPRITE_BASE}/${toPath(id)}`);
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      // 브라우저는 1일, Vercel 같은 CDN은 1년 동안 캐시 → 같은 이미지는 원본에 다시 요청하지 않음
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
