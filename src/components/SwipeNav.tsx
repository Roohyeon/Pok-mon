"use client";
import { useRouter } from "next/navigation";
import { useSwipeKeys } from "@/lib/use-swipe-keys";

/** 화면에 보이지 않는 도우미: ← → 키·좌우 스와이프로 이전/다음 페이지로 이동 */
export function SwipeNav({ prevHref, nextHref }: { prevHref: string | null; nextHref: string | null }) {
  const router = useRouter();
  useSwipeKeys(
    () => prevHref && router.push(prevHref),
    () => nextHref && router.push(nextHref),
  );
  return null;
}
