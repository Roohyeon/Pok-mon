import type { PokemonTypeName, SpriteVariant } from "./types";

// 타입 한글명은 PokeAPI /type/{id} 응답의 names(ko) 값과 동일하게 맞췄습니다.
// (매번 API로 18개 타입을 다시 받아오지 않도록 상수로 고정)
// desc: 포켓몬을 잘 모르는 사람도 종류를 바로 이해할 수 있게 쓴 한 줄 설명
export const TYPE_META: Record<PokemonTypeName, { ko: string; color: string; desc: string }> = {
  normal:   { ko: "노말",   color: "#a8a77a", desc: "특별한 속성 없이 무난한 포켓몬. 주변 동물을 닮은 친구가 많아요." },
  fire:     { ko: "불꽃",   color: "#ee8130", desc: "몸에 불꽃을 품은 포켓몬. 뜨거운 불을 뿜어 싸워요." },
  water:    { ko: "물",     color: "#6390f0", desc: "물속이나 물가에 사는 포켓몬. 물줄기를 쏘아 싸워요." },
  electric: { ko: "전기",   color: "#e8c22c", desc: "전기를 만들어 내는 포켓몬. 피카츄가 대표적이에요." },
  grass:    { ko: "풀",     color: "#6fbf4a", desc: "식물을 닮은 포켓몬. 햇빛을 받아 힘을 얻어요." },
  ice:      { ko: "얼음",   color: "#7fd3d0", desc: "추운 곳에 사는 포켓몬. 눈과 냉기를 다뤄요." },
  fighting: { ko: "격투",   color: "#c22e28", desc: "몸을 단련한 무술가 같은 포켓몬. 주먹과 발차기가 특기예요." },
  poison:   { ko: "독",     color: "#a33ea1", desc: "몸에 독을 지닌 포켓몬. 함부로 만지면 위험해요." },
  ground:   { ko: "땅",     color: "#d6b55a", desc: "땅을 파고 흙과 모래를 다루는 포켓몬." },
  flying:   { ko: "비행",   color: "#a98ff3", desc: "하늘을 나는 포켓몬. 새를 닮은 친구가 많아요." },
  psychic:  { ko: "에스퍼", color: "#f95587", desc: "초능력을 쓰는 신비한 포켓몬. 머리가 좋아요." },
  bug:      { ko: "벌레",   color: "#a6b91a", desc: "곤충을 닮은 포켓몬. 빨리 자라 금방 진화해요." },
  rock:     { ko: "바위",   color: "#b6a136", desc: "바위처럼 단단한 몸을 가진 포켓몬." },
  ghost:    { ko: "고스트", color: "#735797", desc: "유령 같은 포켓몬. 어둠 속에서 장난치길 좋아해요." },
  dragon:   { ko: "드래곤", color: "#6f35fc", desc: "전설 속 용을 닮은 강력한 포켓몬. 만나기 어려워요." },
  dark:     { ko: "악",     color: "#705746", desc: "어둠을 틈타 꾀를 부리는 포켓몬." },
  steel:    { ko: "강철",   color: "#b7b7ce", desc: "금속처럼 단단한 몸을 가진 포켓몬." },
  fairy:    { ko: "페어리", color: "#d685ad", desc: "요정처럼 귀엽고 신비한 포켓몬." },
};

export const TYPE_ORDER = Object.keys(TYPE_META) as PokemonTypeName[];

// 능력치 한글명: PokeAPI /stat/{id} 의 names(ko) 값
export const STAT_KO: Record<string, string> = {
  hp: "HP",
  attack: "공격",
  defense: "방어",
  "special-attack": "특수공격",
  "special-defense": "특수방어",
  speed: "스피드",
};

/** 우리 서버의 이미지 프록시 주소. 브라우저는 이 주소만 알게 됩니다. */
export function spriteSrc(id: number, variant: SpriteVariant = "pixel") {
  return `/api/sprite/${variant}/${id}`;
}

export function formatNo(id: number) {
  return `No.${String(id).padStart(4, "0")}`;
}
