import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";

// Next가 이름을 정한 파일 (개발 준비 4장 파일 이름 규칙의 예외)
const NEXT_FILES =
  "src/app/**/{page,layout,loading,error,not-found,template,default,global-error,global-not-found,icon,apple-icon,opengraph-image,twitter-image}.tsx";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // 파일 이름: 컴포넌트(.tsx)는 PascalCase, 그 밖의 .ts는 camelCase (개발 준비 4장)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/generated/**", NEXT_FILES, "src/instrumentation-client.ts"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "src/**/*.ts": "CAMEL_CASE", "src/**/*.tsx": "PASCAL_CASE" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  // 함수는 화살표 함수로 선언한다. 컴포넌트도 화살표 함수 + 파일 아래 export default (개발 준비 4장)
  {
    rules: {
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
