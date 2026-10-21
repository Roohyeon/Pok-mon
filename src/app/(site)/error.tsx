"use client";
// PokeAPI 응답 실패 등 예상치 못한 오류가 났을 때 보여줄 화면
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card mt-10 flex flex-col items-center gap-3 p-12 text-center">
      <p className="text-lg font-bold">데이터를 불러오지 못했어요.</p>
      <p className="text-sm text-muted">잠시 후 다시 시도해 주세요.</p>
      <button type="button" onClick={reset} className="btn btn-primary">
        다시 시도
      </button>
    </div>
  );
}
