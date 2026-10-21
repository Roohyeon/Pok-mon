"use client";
// ─────────────────────────────────────────────────────────────
// TV 화면 속 포켓몬 진열장 (클라이언트 컴포넌트)
//
// - 카드 한 장 = 진화 계열 하나. 카드에는 기본형(예: 이상해씨)만, 진화형은 정보 창에서
// - 카드들이 원통 안쪽 벽에 붙은 것처럼 휘어져 배치됨 (가운데는 멀리, 양옆은 가까이)
// - ◀ ▶ 버튼, ← → 키, 스와이프, 마우스 드래그로 넘김
// - 가운데 카드를 누르면 정보 창, 옆 카드를 누르면 그 카드가 가운데로
// - 오른쪽 위 햄버거 메뉴에서 종류(타입)별로 골라 보기
// - 종류와 가운데 카드는 주소(?type=fire&p=4)에 저장
// ─────────────────────────────────────────────────────────────
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { formatNo, spriteSrc, STAT_KO, TYPE_META, TYPE_ORDER } from "@/lib/pokemon-meta";
import type { PokemonDetail, PokemonFamily, PokemonSummary, PokemonTypeName } from "@/lib/types";
import { useSwipeKeys } from "@/lib/use-swipe-keys";

// 가운데에서 몇 칸 떨어진 카드까지 그릴지 (나머지는 화면 밖이라 생략)
const VISIBLE_RANGE = 3;
// 카드 한 칸당 원통 회전 각도
const STEP_DEG = 28;

function isTypeName(v: string | null): v is PokemonTypeName {
  return v !== null && v in TYPE_META;
}

const membersOf = (f: PokemonFamily) => f.stages.flat();

/** 주소의 검색 파라미터를 읽는 버전 (Suspense 안에서 사용) */
export function TvCarouselFromUrl({ families }: { families: PokemonFamily[] }) {
  const searchParams = useSearchParams();
  return <TvCarousel families={families} searchParams={searchParams} />;
}

/** searchParams가 null이면 기본 상태(전체 · 첫 카드)로 그림 — 정적 HTML용 */
export function TvCarousel({
  families,
  searchParams,
}: {
  families: PokemonFamily[];
  searchParams: URLSearchParams | null;
}) {
  const rawType = searchParams?.get("type") ?? null;
  const type = isTypeName(rawType) ? rawType : null;
  const selectedId = Number(searchParams?.get("p")) || null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const totalPokemon = useMemo(() => families.reduce((n, f) => n + membersOf(f).length, 0), [families]);

  // 종류별 묶음: 계열 중 한 마리라도 그 타입이면 그 종류에 들어감
  const groups = useMemo(
    () =>
      TYPE_ORDER.map((t) => ({
        type: t,
        families: families.filter((f) => membersOf(f).some((p) => p.types.includes(t))),
        count: families.reduce((n, f) => n + membersOf(f).filter((p) => p.types.includes(t)).length, 0),
      })).filter((g) => g.families.length > 0),
    [families],
  );

  const list = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return families.filter((f) =>
      membersOf(f).some((p) => {
        if (type && !p.types.includes(type)) return false;
        if (!q) return true;
        return p.nameKo.includes(q) || p.nameEn.includes(q) || String(p.id) === q.replace(/^0+/, "");
      }),
    );
  }, [families, type, deferredQuery]);

  // p에 계열 중 어느 포켓몬 번호가 와도 그 계열 카드를 가운데로
  const index = Math.max(0, list.findIndex((f) => membersOf(f).some((p) => p.id === selectedId)));
  const current = list[index] as PokemonFamily | undefined;

  function updateUrl(next: { type?: PokemonTypeName | null; id?: number | null }) {
    const params = new URLSearchParams(searchParams?.toString());
    const nextType = next.type === undefined ? type : next.type;
    const nextId = next.id === undefined ? current?.id : next.id;
    if (nextType) params.set("type", nextType);
    else params.delete("type");
    if (nextId) params.set("p", String(nextId));
    else params.delete("p");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }

  function goTo(i: number) {
    const target = list[Math.min(Math.max(0, i), list.length - 1)];
    if (target && target.id !== current?.id) updateUrl({ id: target.id });
  }

  function selectType(t: PokemonTypeName | null) {
    setQuery("");
    setMenuOpen(false);
    updateUrl({ type: t, id: null });
  }

  useSwipeKeys(
    () => !menuOpen && goTo(index - 1),
    () => !menuOpen && goTo(index + 1),
  );

  // Esc로 열린 창 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setInfoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── 원통 크기: 화면 폭에 맞춰 계산 ──
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(960);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // 좁은 화면(휴대폰)에서는 카드 1장만 크게 보여 줌 (넘길 때만 옆 카드가 돌아 들어옴)
  const single = stageWidth < 640;
  const cardW = single ? Math.min(280, stageWidth * 0.74) : Math.min(260, Math.max(150, stageWidth * 0.26));
  const radius = cardW * 2.1;
  // 원통을 카메라 쪽으로 당겨서, 가운데 카드는 멀고 양옆 카드는 가깝게(크게) 보이도록
  const pull = radius * 0.72;

  // ── 마우스 드래그로 넘기기 (터치는 useSwipeKeys가 처리) ──
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const typeInfo = type ? TYPE_META[type] : null;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* ── 상단 바 ── */}
      <div className="relative z-30 flex items-start justify-between gap-3 p-4 sm:px-8 sm:pt-6">
        <div className="tv-label flex flex-col gap-0.5">
          <Link href="/" className="text-caption font-bold tracking-widest text-[#1e3a9e] hover:underline sm:text-sm">
            ◀ PIXEL DEX
          </Link>
          <p className="text-lg font-bold text-[#1e3a9e] sm:text-xl">
            {typeInfo ? `${typeInfo.ko} 타입` : deferredQuery ? `"${deferredQuery}" 검색` : "모든 포켓몬"}
          </p>
          <p className="text-caption text-[#1e3a9e] sm:text-sm">
            {list.length > 0 ? `카드 ${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}` : "0장"}
            {typeInfo && <span className="hidden sm:inline"> · {typeInfo.desc}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInfoOpen(false);
            setMenuOpen((o) => !o);
          }}
          aria-expanded={menuOpen}
          aria-controls="tv-menu"
          aria-label={menuOpen ? "종류 메뉴 닫기" : "종류 메뉴 열기"}
          className="tv-btn size-12 shrink-0 p-0"
        >
          <PixelIcon kind={menuOpen ? "close" : "menu"} />
        </button>
      </div>

      {/* ── 원통 진열장 ── */}
      <div
        ref={stageRef}
        className="tv-stage relative flex-1 touch-pan-y select-none"
        style={{ perspective: `${radius * 1.5}px` }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") drag.current = { x: e.clientX, moved: false };
        }}
        onPointerMove={(e) => {
          if (drag.current && Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d?.moved) return;
          suppressClick.current = true;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
        }}
        onPointerLeave={() => (drag.current = null)}
        onClickCapture={(e) => {
          // 드래그 끝에 따라오는 클릭은 무시
          if (suppressClick.current) {
            suppressClick.current = false;
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        {list.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center text-center text-[#1e3a9e]">
            <div>
              <p className="font-bold">앗, 찾는 포켓몬이 없어요!</p>
              <p className="mt-1 text-sm">오른쪽 위 메뉴에서 다른 종류를 골라 보세요.</p>
            </div>
          </div>
        ) : (
          // pointer-events-none: 3D 공간에서 ul의 면(z=0)이 원통 안쪽(z<0)에 있는 가운데 카드보다
          // 앞에 놓여 클릭을 가로채므로, 클릭은 카드(li)만 받도록 함
          <ul aria-label="포켓몬 진열장" className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
            {list.map((f, i) => {
              const offset = i - index;
              if (Math.abs(offset) > VISIBLE_RANGE) return null;
              const hidden = single ? offset !== 0 : Math.abs(offset) === VISIBLE_RANGE;
              return (
                <li
                  key={f.id}
                  className="tv-card-slot"
                  style={{
                    width: cardW,
                    height: cardW * 1.3,
                    marginLeft: -cardW / 2,
                    marginTop: -cardW * 0.65,
                    transform: `translateZ(${pull}px) rotateY(${-offset * STEP_DEG}deg) translateZ(${-radius}px)`,
                    opacity: hidden ? 0 : 1,
                    pointerEvents: hidden ? "none" : "auto",
                    zIndex: 10 - Math.abs(offset),
                  }}
                  aria-hidden={hidden || undefined}
                >
                  <FamilyCard
                    family={f}
                    isCenter={offset === 0}
                    tabIndex={hidden ? -1 : 0}
                    priority={Math.abs(offset) <= 1}
                    onClick={() => (offset === 0 ? setInfoOpen(true) : goTo(i))}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── 하단 조작부 ── */}
      <div className="relative z-30 flex items-center justify-center gap-3 p-4 pb-6">
        <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} className="tv-btn px-4 py-1.5" aria-label="이전 카드">
          ◀
        </button>
        <p className="tv-label text-center text-caption text-[#1e3a9e] sm:text-sm">가운데 카드를 누르면 정보가 나와요<br />← → 키 · 스와이프 · 드래그로 넘겨요</p>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index >= list.length - 1}
          className="tv-btn px-4 py-1.5"
          aria-label="다음 카드"
        >
          ▶
        </button>
      </div>

      {/* ── 햄버거 메뉴: 종류별 정리 ── */}
      {menuOpen && (
        <div id="tv-menu" data-no-swipe className="tv-window absolute top-20 right-3 bottom-3 z-40 flex w-[min(380px,calc(100%-24px))] flex-col sm:top-24 sm:right-8">
          <div className="flex items-center justify-between border-b-[3px] border-[#2a52c9] px-3 py-2">
            <h2 className="font-bold">종류별 메뉴</h2>
            <span className="text-caption text-[#4a6bc4]">진화하며 타입이 바뀌면 두 곳에 모두 있어요</span>
          </div>
          <div className="border-b-[3px] border-[#2a52c9] px-3 py-2">
            <label htmlFor="tv-search" className="sr-only">포켓몬 검색</label>
            <input
              id="tv-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                updateUrl({ id: null });
              }}
              placeholder="▶ 이름·번호로 찾기 (예: 피카츄, 25)"
              autoComplete="off"
              className="w-full border-2 border-[#2a52c9] bg-white px-2 py-1 text-sm outline-none placeholder:text-[#7c9ee6] focus-visible:outline-none"
            />
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            <li>
              <MenuItem
                active={type === null}
                onClick={() => selectType(null)}
                title="전체 보기"
                count={totalPokemon}
                desc="관동 지방 포켓몬을 번호 순서대로 모두 봐요."
                samples={families.slice(0, 3).map((f) => f.stages[0][0])}
              />
            </li>
            {groups.map((g) => (
              <li key={g.type}>
                <MenuItem
                  active={type === g.type}
                  onClick={() => selectType(g.type)}
                  color={TYPE_META[g.type].color}
                  title={`${TYPE_META[g.type].ko} 타입`}
                  count={g.count}
                  desc={TYPE_META[g.type].desc}
                  samples={g.families.slice(0, 3).map((f) => membersOf(f).find((p) => p.types.includes(g.type))!)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 정보 창 (계열이 바뀌면 처음 단계부터 다시 보여 주도록 key 지정) ── */}
      {infoOpen && current && <InfoWindow key={current.id} family={current} onClose={() => setInfoOpen(false)} />}
    </div>
  );
}

/** 진열장 카드 한 장: 계열의 기본형(첫 단계) 한 마리만 대표로 보여 줌. 진화형은 정보 창에서 */
function FamilyCard({
  family,
  isCenter,
  tabIndex,
  priority,
  onClick,
}: {
  family: PokemonFamily;
  isCenter: boolean;
  tabIndex: number;
  priority: boolean;
  onClick: () => void;
}) {
  const base = family.stages[0][0];
  const evolves = membersOf(family).length > 1;

  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onClick={onClick}
      aria-label={isCenter ? `${base.nameKo} 정보 보기` : `${base.nameKo} 카드로 이동`}
      aria-current={isCenter || undefined}
      className="tv-card"
      style={{ "--type": TYPE_META[base.types[0]].color } as React.CSSProperties}
    >
      <span className="flex items-center justify-between text-caption font-bold opacity-85">
        <span>{formatNo(base.id)}</span>
        {evolves && <span>진화 {family.stages.length}단계</span>}
      </span>
      <Image
        src={spriteSrc(base.id, "pixel")}
        alt=""
        width={96}
        height={96}
        unoptimized
        draggable={false}
        priority={priority}
        className="pixelated mx-auto w-[78%] max-w-none"
      />
      <span className="flex flex-col items-center gap-1">
        <span className="text-base font-bold leading-tight sm:text-lg">{base.nameKo}</span>
        <span className="flex gap-1">
          {base.types.map((t) => (
            <span key={t} className="tv-type">
              {TYPE_META[t].ko}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

/** 4×4px 칸으로 그린 픽셀 아이콘 (햄버거 / 닫기) */
function PixelIcon({ kind }: { kind: "menu" | "close" }) {
  const rows =
    kind === "menu"
      ? ["#######", ".......", "#######", ".......", "#######"]
      : ["#.....#", ".#...#.", "..#.#..", "...#...", "..#.#..", ".#...#.", "#.....#"];
  return (
    <svg aria-hidden viewBox={`0 0 7 ${rows.length}`} shapeRendering="crispEdges" className="mx-auto h-auto w-7">
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  );
}

function MenuItem({
  active,
  onClick,
  color,
  title,
  count,
  desc,
  samples,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  title: string;
  count: number;
  desc: string;
  samples: PokemonSummary[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2 border-2 p-2 text-left ${active ? "border-[#2a52c9] bg-[#dfe9fb]" : "border-transparent hover:border-[#9db8ee]"}`}
    >
      <span className="flex w-[84px] shrink-0 justify-center">
        {samples.map((p) => (
          <Image key={p.id} src={spriteSrc(p.id, "pixel")} alt="" width={96} height={96} unoptimized className="pixelated -mx-1.5 size-9" />
        ))}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          {color && <span aria-hidden className="size-2.5 border border-[#1e3a9e]" style={{ backgroundColor: color }} />}
          {title}
          <span className="font-normal text-[#4a6bc4]">{count}마리</span>
        </span>
        <span className="text-caption leading-normal text-[#4a6bc4]">{desc}</span>
      </span>
    </button>
  );
}

// 한 번 받은 정보는 다시 요청하지 않도록 모듈 단위로 보관
const detailCache = new Map<number, PokemonDetail | "error">();

/**
 * 진화 계열 정보 창. 위쪽 진화 줄에서 한 마리를 고르면 아래에 그 포켓몬의 정보가 나옴.
 * 모바일에서는 모든 내용이 한 줄로 세로로 쌓이고 창 전체가 아래로 스크롤됨
 */
function InfoWindow({ family, onClose }: { family: PokemonFamily; onClose: () => void }) {
  const members = membersOf(family);
  const [selectedId, setSelectedId] = useState(members[0].id);
  const summary = members.find((p) => p.id === selectedId) ?? members[0];

  const [, rerender] = useState(0);
  const detail = detailCache.get(summary.id);
  const [animatedFailed, setAnimatedFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (detailCache.has(summary.id)) return;
    const ctrl = new AbortController();
    fetch(`/api/pokemon/${summary.id}`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((d: PokemonDetail) => detailCache.set(summary.id, d))
      .catch((e) => {
        if (e?.name !== "AbortError") detailCache.set(summary.id, "error");
      })
      .finally(() => rerender((n) => n + 1));
    return () => ctrl.abort();
  }, [summary.id]);

  const color = TYPE_META[summary.types[0]].color;

  return (
    <div data-no-swipe className="absolute inset-0 z-40 flex items-center justify-center bg-[#16285f]/55 px-4 py-10 sm:p-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${summary.nameKo} 정보`}
        onClick={(e) => e.stopPropagation()}
        className="tv-window flex max-h-full w-full max-w-2xl flex-col"
      >
        <div className="flex shrink-0 items-center justify-between border-b-[3px] border-[#2a52c9] px-4 py-2">
          <p className="text-sm text-[#4a6bc4]">{members.length > 1 ? `진화 ${family.stages.length}단계 · ${members.length}마리` : formatNo(summary.id)}</p>
          <button type="button" onClick={onClose} aria-label="정보 창 닫기" className="tv-btn size-9 p-0" autoFocus>
            <PixelIcon kind="close" />
          </button>
        </div>

        {/* min-h-0 + overflow-y-auto: 내용이 창보다 길면 아래로 스크롤 */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* 진화 줄: 눌러서 보고 싶은 단계 고르기 */}
          {members.length > 1 && (
            <div role="group" aria-label="진화 단계 선택" className="flex flex-wrap items-center justify-center gap-1 border-b-[3px] border-[#2a52c9] px-2 py-2">
              {family.stages.map((stage, si) => (
                <Fragment key={si}>
                  {si > 0 && (
                    <span aria-hidden className="text-sm text-[#4a6bc4]">
                      ▶
                    </span>
                  )}
                  <span className="flex flex-col gap-1">
                    {stage.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        aria-pressed={p.id === summary.id}
                        className={`flex flex-col items-center border-2 px-1 pb-1 text-caption font-bold sm:text-sm ${p.id === summary.id ? "border-[#2a52c9] bg-[#dfe9fb]" : "border-transparent hover:border-[#9db8ee]"}`}
                      >
                        <Image src={spriteSrc(p.id, "pixel")} alt="" width={96} height={96} unoptimized className="pixelated size-12 sm:size-16" />
                        {p.nameKo}
                      </button>
                    ))}
                  </span>
                </Fragment>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4 p-4 sm:grid sm:grid-cols-[200px_1fr]">
            {/* 움직이는 도트 */}
            <div className="tv-card-mini grid aspect-[16/9] w-full place-items-center overflow-hidden sm:aspect-square sm:self-start" style={{ "--type": color } as React.CSSProperties}>
              <Image
                key={summary.id}
                src={spriteSrc(summary.id, animatedFailed[summary.id] ? "pixel" : "animated")}
                alt={summary.nameKo}
                width={96}
                height={96}
                unoptimized
                onError={() => setAnimatedFailed((f) => ({ ...f, [summary.id]: true }))}
                className="pixelated h-auto w-auto scale-[2.2]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-caption text-[#4a6bc4]">{formatNo(summary.id)}</p>
                <h2 className="text-xl font-bold sm:text-2xl">{summary.nameKo}</h2>
                <p className="text-sm text-[#4a6bc4] capitalize">
                  {summary.nameEn}
                  {detail && detail !== "error" && detail.genusKo && ` · ${detail.genusKo}`}
                </p>
              </div>

              <ul className="flex flex-col gap-1.5">
                {summary.types.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm">
                    <span className="tv-type shrink-0 text-white" style={{ backgroundColor: TYPE_META[t].color }}>
                      {TYPE_META[t].ko}
                    </span>
                    <span className="text-[#4a6bc4]">{TYPE_META[t].desc}</span>
                  </li>
                ))}
              </ul>

              {detail === undefined && (
                <p className="text-sm">
                  정보를 불러오는 중<span className="blink">...</span>
                </p>
              )}
              {detail === "error" && <p className="text-sm">정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
              {detail && detail !== "error" && (
                <>
                  {detail.flavorKo && <p className="border-2 border-[#2a52c9] px-3 py-2 text-sm leading-relaxed">{detail.flavorKo}</p>}
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-[#dfe9fb] px-3 py-1.5">
                      <dt className="text-caption text-[#4a6bc4]">키</dt>
                      <dd className="font-bold">{detail.heightM} m</dd>
                    </div>
                    <div className="bg-[#dfe9fb] px-3 py-1.5">
                      <dt className="text-caption text-[#4a6bc4]">몸무게</dt>
                      <dd className="font-bold">{detail.weightKg} kg</dd>
                    </div>
                  </dl>
                  <dl className="flex flex-col gap-1">
                    {detail.stats.map((s) => (
                      <div key={s.key} className="grid grid-cols-[4.5rem_2rem_1fr] items-center gap-2 text-sm">
                        <dt>{STAT_KO[s.key] ?? s.key}</dt>
                        <dd className="text-right font-bold">{s.value}</dd>
                        <dd className="flex gap-[2px]" aria-hidden>
                          {Array.from({ length: 15 }, (_, i) => (
                            <span key={i} className={`h-2.5 flex-1 ${i < Math.max(1, Math.round((s.value / 255) * 15)) ? "bg-[#2a52c9]" : "bg-[#dfe9fb]"}`} />
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
