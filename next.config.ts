import type { NextConfig } from "next";

// 환경 변수가 빠졌거나 틀리면 dev·build 시작 때 바로 실패한다
import "./src/env";

const nextConfig: NextConfig = {
  // 이미지 파일 import를 쓰지 않는다. 끄면 Next의 *.svg 타입(any)이 빠져
  // src/types/svg.d.ts의 컴포넌트 타입이 적용된다
  images: { disableStaticImages: true },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              // viewBox를 남겨 크기를 CSS(size-*)로 정한다
              dimensions: false,
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false } },
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
