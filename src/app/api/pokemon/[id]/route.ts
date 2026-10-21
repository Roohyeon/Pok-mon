// ─────────────────────────────────────────────────────────────
// 포켓몬 정보: GET /api/pokemon/{id}
//
// TV 진열장에서 카드를 눌렀을 때 정보 창에 보여줄 데이터.
// 브라우저는 PokeAPI를 직접 부르지 않고 이 주소만 호출합니다.
// getPokemonDetail()은 서버에 캐시되어 있어 PokeAPI 호출 수는 늘지 않습니다.
// ─────────────────────────────────────────────────────────────
import type { NextRequest } from "next/server";
import { getPokemonDetail, MAX_POKEMON_ID } from "@/lib/pokeapi";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/pokemon/[id]">) {
  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!/^\d+$/.test(rawId) || id < 1 || id > MAX_POKEMON_ID) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const detail = await getPokemonDetail(id);
  if (!detail) return Response.json({ error: "not found" }, { status: 404 });

  return Response.json(detail, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
