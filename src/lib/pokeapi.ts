// ─────────────────────────────────────────────────────────────
// PokeAPI 데이터 계층 (서버 전용)
//
// 1) `import "server-only"`
//    이 파일을 실수로 클라이언트 컴포넌트('use client')에서 import 하면
//    빌드 단계에서 에러가 나도록 막아주는 안전장치입니다.
//    → API 주소·호출 로직이 브라우저용 JS 번들에 섞여 들어갈 수 없습니다.
//
// 2) API 주소는 환경변수(POKEAPI_BASE_URL)로 받습니다.
//    이름에 NEXT_PUBLIC_ 접두사가 없으므로 Next.js가 브라우저로 보내지 않습니다.
//
// 3) "use cache" + cacheLife("days")
//    한 번 받아온 응답을 서버에 저장해 두고 하루 동안 재사용합니다.
//    PokeAPI 공정 사용 정책("Locally cache resources whenever you request them")을
//    지키는 동시에, 사용자 수가 늘어나도 PokeAPI 호출 수는 늘지 않습니다.
// ─────────────────────────────────────────────────────────────
import "server-only";
import { cacheLife } from "next/cache";
import type {
  EvolutionMember,
  PokemonDetail,
  PokemonFamily,
  PokemonSummary,
  PokemonTypeName,
} from "./types";

const API_BASE = (process.env.POKEAPI_BASE_URL ?? "https://pokeapi.co/api/v2").replace(/\/$/, "");

/** 도감 목록에 보여줄 범위 (1세대 관동 151마리) */
export const DEX_LIMIT = 151;
/** 상세 페이지에서 허용할 최대 번호 (진화 계열이 2세대 이후로 이어지는 경우 대비) */
export const MAX_POKEMON_ID = 1025;

// ── 동시 요청 수 제한 ─────────────────────────────────────────
// 빌드할 때 151마리를 한꺼번에 요청하면 PokeAPI에 순간 부하를 줍니다.
// 동시에 최대 6개까지만 보내고 나머지는 줄을 세웁니다.
const MAX_CONCURRENT = 6;
let active = 0;
const waiting: Array<() => void> = [];

async function withLimit<T>(task: () => Promise<T>): Promise<T> {
  if (active < MAX_CONCURRENT) active++;
  else await new Promise<void>((resolve) => waiting.push(resolve));
  try {
    return await task();
  } finally {
    const next = waiting.shift();
    if (next) next(); // 자리를 다음 대기자에게 바로 넘김
    else active--;
  }
}

class NotFoundError extends Error {}

async function fetchJson<T>(path: string, retries = 2): Promise<T> {
  return withLimit(async () => {
    const res = await fetch(`${API_BASE}/${path}/`, {
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) throw new NotFoundError(path);
    if (!res.ok) {
      if (retries > 0) return fetchJson<T>(path, retries - 1);
      throw new Error(`PokeAPI request failed: ${res.status}`);
    }
    return (await res.json()) as T;
  });
}

/** ".../pokemon-species/25/" → 25 */
function idFromUrl(url: string) {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : NaN;
}

type Named = { name: string; url: string };
type LocalizedName = { name: string; language: Named };

function pickKo<T extends { language: Named }>(list: T[]) {
  return list.find((x) => x.language.name === "ko");
}

// ── PokeAPI 원본 응답 중 실제로 쓰는 필드만 정의 ───────────────
interface RawPokemon {
  id: number;
  name: string;
  height: number; // 데시미터
  weight: number; // 헥토그램
  types: { slot: number; type: Named }[];
  stats: { base_stat: number; stat: Named }[];
  abilities: { is_hidden: boolean; ability: Named }[];
}

interface RawSpecies {
  id: number;
  name: string;
  names: LocalizedName[];
  genera: { genus: string; language: Named }[];
  flavor_text_entries: { flavor_text: string; language: Named }[];
  evolution_chain: { url: string } | null;
}

interface RawChainLink {
  species: Named;
  evolves_to: RawChainLink[];
}

// ── 캐시되는 개별 요청들 ─────────────────────────────────────
// 원본 응답은 기술 배치 정보 등이 포함돼 수백 KB에 달하므로,
// 필요한 값만 추려서 캐시에 저장합니다(메모리·전송량 절약).

async function getSpecies(id: number) {
  "use cache";
  cacheLife("days");
  const s = await fetchJson<RawSpecies>(`pokemon-species/${id}`);
  const koFlavors = s.flavor_text_entries.filter((f) => f.language.name === "ko");
  const latestFlavor = koFlavors.at(-1)?.flavor_text ?? "";
  return {
    id: s.id,
    nameEn: s.name,
    nameKo: pickKo(s.names)?.name ?? s.name,
    genusKo: pickKo(s.genera)?.genus ?? "",
    // 게임 원문에 섞인 줄바꿈(\n)·페이지넘김(\f) 문자를 공백으로 정리
    flavorKo: latestFlavor.replace(/[\n\f\r]+/g, " ").trim(),
    evolutionChainId: s.evolution_chain ? idFromUrl(s.evolution_chain.url) : null,
  };
}

async function getPokemon(id: number) {
  "use cache";
  cacheLife("days");
  const p = await fetchJson<RawPokemon>(`pokemon/${id}`);
  return {
    id: p.id,
    heightM: p.height / 10,
    weightKg: p.weight / 10,
    types: [...p.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name as PokemonTypeName),
    stats: p.stats.map((s) => ({ key: s.stat.name, value: s.base_stat })),
    abilities: p.abilities.map((a) => ({ id: idFromUrl(a.ability.url), fallback: a.ability.name, isHidden: a.is_hidden })),
  };
}

async function getAbilityNameKo(id: number, fallback: string) {
  "use cache";
  cacheLife("days");
  const a = await fetchJson<{ names: LocalizedName[] }>(`ability/${id}`);
  return pickKo(a.names)?.name ?? fallback;
}

async function getEvolution(chainId: number): Promise<EvolutionMember[][]> {
  "use cache";
  cacheLife("days");
  const { chain } = await fetchJson<{ chain: RawChainLink }>(`evolution-chain/${chainId}`);

  // 트리 구조를 "단계별 배열"로 펼치기 (너비 우선 탐색)
  const stages: number[][] = [];
  let level: RawChainLink[] = [chain];
  while (level.length > 0) {
    stages.push(level.map((l) => idFromUrl(l.species.url)));
    level = level.flatMap((l) => l.evolves_to);
  }
  return Promise.all(
    stages.map((ids) =>
      Promise.all(ids.map(async (id) => ({ id, nameKo: (await getSpecies(id)).nameKo }))),
    ),
  );
}

// ── 페이지에서 사용하는 공개 함수 ─────────────────────────────

/** 도감 목록: 1~151번의 이름(한/영)과 타입 */
export async function getPokemonList(): Promise<PokemonSummary[]> {
  "use cache";
  cacheLife("days");
  const ids = Array.from({ length: DEX_LIMIT }, (_, i) => i + 1);
  return Promise.all(
    ids.map(async (id) => {
      const [species, pokemon] = await Promise.all([getSpecies(id), getPokemon(id)]);
      return { id, nameKo: species.nameKo, nameEn: species.nameEn, types: pokemon.types };
    }),
  );
}

/**
 * 진화 계열별로 묶은 도감 목록. 1~151번만 포함하고, 계열의 첫 번호 순서로 정렬.
 * (예: 이상해씨·이상해풀·이상해꽃 → 카드 1장. 피츄처럼 2세대 이후 포켓몬은 제외)
 */
export async function getPokemonFamilies(): Promise<PokemonFamily[]> {
  "use cache";
  cacheLife("days");
  const list = await getPokemonList();
  const byId = new Map(list.map((p) => [p.id, p]));
  const chainIds = await Promise.all(list.map(async (p) => (await getSpecies(p.id)).evolutionChainId));

  // 같은 계열은 한 번만 요청
  const uniqueChains = [...new Set(chainIds.filter((c): c is number => c !== null))];
  const chains = new Map(
    await Promise.all(uniqueChains.map(async (c) => [c, await getEvolution(c)] as const)),
  );

  const families: PokemonFamily[] = [];
  const seen = new Set<number>();
  list.forEach((p, i) => {
    const chainId = chainIds[i];
    if (chainId === null) {
      families.push({ id: p.id, stages: [[p]] });
      return;
    }
    if (seen.has(chainId)) return;
    seen.add(chainId);
    const stages = chains
      .get(chainId)!
      .map((stage) => stage.flatMap((m) => byId.get(m.id) ?? []))
      .filter((stage) => stage.length > 0);
    families.push({ id: stages[0][0].id, stages });
  });
  return families;
}

/** 상세 정보. 존재하지 않는 번호면 null */
export async function getPokemonDetail(id: number): Promise<PokemonDetail | null> {
  "use cache";
  cacheLife("days");
  if (!Number.isInteger(id) || id < 1 || id > MAX_POKEMON_ID) return null;

  try {
    const [species, pokemon] = await Promise.all([getSpecies(id), getPokemon(id)]);
    const [abilities, evolution] = await Promise.all([
      Promise.all(
        pokemon.abilities.map(async (a) => ({
          nameKo: await getAbilityNameKo(a.id, a.fallback),
          isHidden: a.isHidden,
        })),
      ),
      species.evolutionChainId ? getEvolution(species.evolutionChainId) : Promise.resolve([]),
    ]);

    return {
      id,
      nameKo: species.nameKo,
      nameEn: species.nameEn,
      genusKo: species.genusKo,
      flavorKo: species.flavorKo,
      types: pokemon.types,
      heightM: pokemon.heightM,
      weightKg: pokemon.weightKg,
      stats: pokemon.stats,
      abilities,
      evolution,
    };
  } catch (e) {
    if (e instanceof NotFoundError) return null;
    throw e;
  }
}
