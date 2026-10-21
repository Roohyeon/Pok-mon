"use client";
import { useEffect, useRef } from "react";

const MIN_SWIPE_PX = 50;

/**
 * ← / → 키와 좌우 스와이프로 이전·다음을 호출하는 훅.
 * - 입력창에서 타이핑 중일 때는 무시
 * - `data-no-swipe` 영역(가로 스크롤 탭 등)에서 시작한 터치는 무시
 * - 세로 스크롤과 헷갈리지 않게, 가로 이동이 세로보다 확실히 클 때만 인정
 */
export function useSwipeKeys(onPrev?: () => void, onNext?: () => void) {
  // 리스너는 한 번만 등록하고, 최신 콜백은 ref로 읽음
  const handlers = useRef({ onPrev, onNext });
  useEffect(() => {
    handlers.current = { onPrev, onNext };
  });

  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTyping(e.target)) return;
      if (e.key === "ArrowLeft") handlers.current.onPrev?.();
      else if (e.key === "ArrowRight") handlers.current.onNext?.();
    };

    let start: { x: number; y: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      start =
        e.touches.length === 1 && !target?.closest("[data-no-swipe]")
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      start = null;
      if (Math.abs(dx) < MIN_SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      // 손가락을 왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전
      if (dx < 0) handlers.current.onNext?.();
      else handlers.current.onPrev?.();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
}
