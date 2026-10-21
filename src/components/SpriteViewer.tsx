"use client";
import Image from "next/image";
import { useState } from "react";
import { spriteSrc } from "@/lib/pokemon-meta";
import type { SpriteVariant } from "@/lib/types";

/** 움직이는 도트 + 이로치(색이 다른 개체) 전환. 이미지가 없으면 기본 이미지로 대체 */
export function SpriteViewer({ id, name }: { id: number; name: string }) {
  const [shiny, setShiny] = useState(false);
  const [failed, setFailed] = useState<Partial<Record<SpriteVariant, boolean>>>({});

  const wanted: SpriteVariant = shiny ? "animated-shiny" : "animated";
  const variant: SpriteVariant = failed[wanted] ? "default" : wanted;

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-card border border-ink md:w-80">
      {/* 원근감 있게 깔리는 체커보드 바닥 */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 [perspective:240px]">
        <div className="checker absolute -inset-x-1/2 -top-1/2 bottom-0 origin-bottom [transform:rotateX(55deg)]" />
      </div>

      <div className="relative grid h-full place-items-center pb-10">
        <div className="relative grid place-items-center">
          {/* 흐림 없는 평평한 그림자 */}
          <span aria-hidden className="absolute -bottom-1 h-3 w-28 rounded-[50%] bg-shade" />
          <Image
            key={variant}
            src={spriteSrc(id, variant)}
            alt={`${name}${shiny ? " (이로치)" : ""}`}
            width={96}
            height={96}
            unoptimized
            priority
            onError={() => setFailed((f) => ({ ...f, [variant]: true }))}
            // 작은 도트(약 96px)를 정수 배율로 키워야 픽셀이 균일하게 보임
            className="pixelated relative h-auto w-auto scale-[2] origin-bottom"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <button
          type="button"
          onClick={() => setShiny((s) => !s)}
          aria-pressed={shiny}
          className="btn px-2 py-0.5"
        >
          {shiny ? "★ 이로치" : "☆ 이로치"}
        </button>
      </div>
    </div>
  );
}
