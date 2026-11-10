// svgr(next.config.ts)이 SVG를 React 컴포넌트로 바꾼다
declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  const Icon: FC<SVGProps<SVGSVGElement>>;
  export default Icon;
}
