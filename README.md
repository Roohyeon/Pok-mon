# PIXEL DEX · 픽셀 포켓몬 도감

[PokeAPI](https://pokeapi.co/) 데이터로 만든 2D 도트 스타일 포켓몬 도감 (관동 151마리).

- CRT TV 랜딩 화면 → Press Start → NOW LOADING → TV 속 진열장
- 진열장: 진화 계열 하나 = 카드 한 장(기본형이 대표), 원통처럼 휘어진 카드 배치
- ◀ ▶ 버튼 · ← → 키 · 스와이프 · 마우스 드래그로 넘기기, 모바일은 카드 1장씩
- 카드를 누르면 정보 창: 진화 단계 선택, 움직이는 도트, 타입 설명, 도감 설명, 키·몸무게, 종족값
- 오른쪽 위 픽셀 햄버거 메뉴: 타입별 분류(포켓몬을 모르는 사람도 이해할 수 있는 한 줄 설명) + 이름·번호 검색
- 상세 페이지(`/pokemon/[id]`): 특성·진화·이로치 보기

## 기술 스택

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · 갈무리11 픽셀 폰트(OFL)

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 빌드할 때 PokeAPI에서 151마리 데이터를 받아 정적 페이지 생성
```

## API를 브라우저에 노출하지 않는 구조

```
브라우저 ──▶ 우리 서버(Next.js) ──▶ PokeAPI / 이미지 저장소
     (페이지·/api/sprite·/api/pokemon만 보임)   (서버에서만 호출, 결과 캐시)
```

| 장치 | 파일 | 역할 |
|---|---|---|
| `import "server-only"` | `src/lib/pokeapi.ts` | 이 파일이 클라이언트 번들에 들어가면 빌드 에러 |
| 서버 컴포넌트 | `src/app/dex/page.tsx`, `src/app/(site)/pokemon/[id]/page.tsx` | 데이터를 서버에서 받아 HTML로 전달 |
| 이미지 프록시 | `src/app/api/sprite/[variant]/[id]/route.ts` | 이미지 원본 주소 숨김, 허용 목록으로 오픈 프록시 방지 |
| 정보 API | `src/app/api/pokemon/[id]/route.ts` | 정보 창 데이터. 서버 캐시를 거쳐 전달 |
| 서버 전용 환경변수 | `.env.example` | `NEXT_PUBLIC_` 접두사 없음 → 브라우저로 전달 안 됨 |
| `"use cache"` + `cacheLife("days")` | `src/lib/pokeapi.ts` | PokeAPI 공정 사용 정책(로컬 캐시) 준수 |

> PokeAPI는 인증이 필요 없는 공개 API라서 숨겨야 할 "비밀 키"는 없습니다.
> 이 구조는 호출 경로를 감추고, 호출 수를 줄이고, 나중에 키가 필요한 API로 바꿔도 그대로 안전하게 쓰기 위한 것입니다.

## 배포 (Vercel)

1. GitHub에 push → Vercel에서 Import
2. 환경변수는 넣지 않아도 기본값으로 동작 (바꾸고 싶으면 `.env.example` 참고해 Vercel 설정에 추가)

## 저작권

데이터: PokeAPI · 이미지: PokeAPI/sprites.
Pokémon 및 관련 명칭·이미지의 권리는 Nintendo / Creatures Inc. / GAME FREAK inc.에 있으며, 이 프로젝트는 비상업 학습용 팬 프로젝트입니다.
