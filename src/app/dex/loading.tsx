import { CrtTv } from "@/components/CrtTv";
import { TvLoading } from "@/components/TvLoading";

// 진열장 데이터를 기다리는 동안 같은 TV 화면에 로딩 표시
export default function DexLoading() {
  return (
    <CrtTv>
      <TvLoading />
    </CrtTv>
  );
}
