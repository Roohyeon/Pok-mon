"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { spriteSrc } from "@/lib/pokemon-meta";
import { TvLoading } from "./TvLoading";

const DEX_HREF = "/dex";
// 진열장 첫 화면에 바로 보이는 카드(이상해씨·파이리·꼬부기 계열)의 이미지를 미리 받아 둠
const PRELOAD_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// 로딩이 너무 빨리 끝나 깜빡이는 것처럼 보이지 않도록 최소 표시 시간
const MIN_LOADING_MS = 1200;

/** "Press Start" 버튼. 클릭 또는 Enter/Space → NOW LOADING 화면 → 진열장으로 이동 */
export function StartButton() {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setProgress(0);
    router.prefetch(DEX_HREF);

    const begin = performance.now();
    let loaded = 0;
    for (const id of PRELOAD_IDS) {
      const img = new window.Image();
      img.onload = img.onerror = () => loaded++;
      img.src = spriteSrc(id, "pixel");
    }

    // 이미지 로딩률과 경과 시간 중 느린 쪽을 진행률로 표시
    const timer = setInterval(() => {
      const p = Math.min(loaded / PRELOAD_IDS.length, (performance.now() - begin) / MIN_LOADING_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        router.push(DEX_HREF);
      }
    }, 80);
  }, [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 버튼에 포커스가 있으면 브라우저 기본 동작(클릭)에 맡김
      if (e.target instanceof HTMLElement && e.target.closest("a, button, input")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start]);

  return (
    <>
      <Link
        href={DEX_HREF}
        onClick={(e) => {
          e.preventDefault();
          start();
        }}
        className="start-btn"
      >
        <span aria-hidden className="blink">▶</span> Press Start Button
      </Link>
      {progress !== null && <TvLoading progress={progress} />}
    </>
  );
}
