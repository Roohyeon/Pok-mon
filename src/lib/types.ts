// 브라우저(클라이언트)와 서버가 함께 쓰는 "가공된 데이터" 타입.
// PokeAPI 원본 응답 구조는 서버 전용 파일(pokeapi.ts) 안에만 있고,
// 화면에는 필요한 필드만 골라 만든 이 타입들만 전달됩니다.

export type PokemonTypeName =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

/** 목록(그리드)에 필요한 최소 정보 */
export interface PokemonSummary {
  id: number;
  nameKo: string;
  nameEn: string;
  types: PokemonTypeName[];
}

/** 진화 계열 하나 = 진열장 카드 한 장. stages는 진화 단계별 멤버 (분기 진화는 한 단계에 여러 마리) */
export interface PokemonFamily {
  id: number; // 계열의 첫 포켓몬 번호 (카드 식별용)
  stages: PokemonSummary[][];
}

export interface PokemonStat {
  key: string; // "hp", "attack" ...
  value: number;
}

export interface PokemonAbility {
  nameKo: string;
  isHidden: boolean;
}

export interface EvolutionMember {
  id: number;
  nameKo: string;
}

/** 상세 페이지에 필요한 정보 */
export interface PokemonDetail extends PokemonSummary {
  genusKo: string;     // 예: "씨앗포켓몬"
  flavorKo: string;    // 도감 설명
  heightM: number;     // 미터
  weightKg: number;    // 킬로그램
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  /** 진화 단계별 멤버. [[이상해씨], [이상해풀], [이상해꽃]] 형태 (분기 진화는 한 단계에 여러 마리) */
  evolution: EvolutionMember[][];
}

export type SpriteVariant = "pixel" | "animated" | "animated-shiny" | "default";
