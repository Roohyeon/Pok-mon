import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SpriteViewer } from "@/components/SpriteViewer";
import { SwipeNav } from "@/components/SwipeNav";
import { StatBar } from "@/components/StatBar";
import { TypeBadge } from "@/components/TypeBadge";
import { DEX_LIMIT, getPokemonDetail } from "@/lib/pokeapi";
import { formatNo, spriteSrc } from "@/lib/pokemon-meta";

// 빌드할 때 1~151번 상세 페이지를 미리 만들어 둠(정적 생성).
// 152번 이후(진화 계열로 연결되는 포켓몬)는 첫 방문 때 만들어지고 이후엔 캐시에서 제공.
export async function generateStaticParams() {
  return Array.from({ length: DEX_LIMIT }, (_, i) => ({ id: String(i + 1) }));
}

export async function generateMetadata({ params }: PageProps<"/pokemon/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await getPokemonDetail(Number(id));
  if (!p) return { title: "찾을 수 없음" };
  return { title: `${formatNo(p.id)} ${p.nameKo}`, description: p.flavorKo };
}

export default function PokemonPage(props: PageProps<"/pokemon/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PokemonDetailView params={props.params} />
    </Suspense>
  );
}

async function PokemonDetailView({ params }: Pick<PageProps<"/pokemon/[id]">, "params">) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const p = await getPokemonDetail(Number(rawId));
  if (!p) notFound();

  const prevId = p.id > 1 ? p.id - 1 : null;
  const nextId = p.id < DEX_LIMIT ? p.id + 1 : null;
  const total = p.stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <article className="flex flex-col gap-6">
      <SwipeNav prevHref={prevId ? `/pokemon/${prevId}` : null} nextHref={nextId ? `/pokemon/${nextId}` : null} />
      <nav className="flex items-center justify-between text-sm">
        <Link href={`/dex?p=${p.id}`} className="btn">◀ 진열장</Link>
        <div className="flex gap-2">
          {prevId && <Link href={`/pokemon/${prevId}`} className="btn">← {formatNo(prevId)}</Link>}
          {nextId && <Link href={`/pokemon/${nextId}`} className="btn">{formatNo(nextId)} →</Link>}
        </div>
      </nav>
      <p className="-mt-4 text-right text-caption text-muted">← → 키·좌우 스와이프로도 넘길 수 있어요</p>

      {/* 상단: 이미지 + 기본 정보 */}
      <section className="card grid gap-6 p-3 md:grid-cols-[auto_1fr]">
        <SpriteViewer id={p.id} name={p.nameKo} />

        <div className="flex flex-col gap-4 md:py-3 md:pr-3">
          <div>
            <p className="text-sm text-muted">{formatNo(p.id)}</p>
            <h1 className="text-lg font-bold">{p.nameKo}</h1>
            <p className="text-sm text-muted capitalize">{p.nameEn} · {p.genusKo}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.types.map((t) => <TypeBadge key={t} type={t} size="md" />)}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <InfoCell label="키" value={`${p.heightM} m`} />
            <InfoCell label="몸무게" value={`${p.weightKg} kg`} />
            <div className="col-span-2 rounded-btn border border-line px-3 py-2">
              <dt className="text-muted">특성</dt>
              <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-bold">
                {p.abilities.map((a) => (
                  <span key={a.nameKo}>
                    {a.nameKo}
                    {a.isHidden && <span className="tag ml-1 font-normal">숨겨진 특성</span>}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 도감 설명: 게임 대화창 스타일 */}
      {p.flavorKo && (
        <section className="card relative border-ink px-4 py-3 pr-8">
          <h2 className="sr-only">도감 설명</h2>
          <p>{p.flavorKo}</p>
          <span aria-hidden className="blink absolute right-3 bottom-2 text-sm">▼</span>
        </section>
      )}

      {/* 종족값 */}
      <section className="card p-3">
        <h2 className="mb-3 font-bold">종족값 <span className="text-sm font-normal text-muted">합계 {total}</span></h2>
        <dl className="flex flex-col gap-2">
          {p.stats.map((s) => <StatBar key={s.key} statKey={s.key} value={s.value} />)}
        </dl>
      </section>

      {/* 진화 */}
      {p.evolution.length > 1 && (
        <section className="card p-3">
          <h2 className="mb-3 font-bold">진화</h2>
          <ol className="flex flex-wrap items-center gap-2">
            {p.evolution.map((stage, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-muted">▶</span>}
                <div className="flex flex-wrap gap-2">
                  {stage.map((m) => (
                    <Link
                      key={m.id}
                      href={`/pokemon/${m.id}`}
                      aria-current={m.id === p.id ? "page" : undefined}
                      className={`flex flex-col items-center rounded-card border px-2 py-1 text-sm ${m.id === p.id ? "border-ink font-bold" : "border-transparent hover:border-line"}`}
                    >
                      <Image src={spriteSrc(m.id, "pixel")} alt="" width={96} height={96} unoptimized className="pixelated size-24" />
                      {m.nameKo}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-btn border border-line px-3 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="card mt-10 grid place-items-center p-16 text-center">
      <p>불러오는 중<span className="blink">...</span></p>
    </div>
  );
}
