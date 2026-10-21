import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center px-4">
      <div className="card mx-auto flex w-full max-w-[1200px] flex-col items-center gap-3 p-12 text-center">
        <div aria-hidden className="checker size-24 rounded-card border border-ink" style={{ "--checker": "24px" } as React.CSSProperties} />
        <p className="text-lg font-bold">야생의 404가 나타났다!</p>
        <p className="text-sm text-muted">도감에 등록되지 않은 페이지예요.</p>
        <Link href="/dex" className="btn btn-primary">도감으로 돌아가기</Link>
      </div>
    </main>
  );
}
