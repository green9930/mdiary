import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import simpleImportSort from "eslint-plugin-simple-import-sort";

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
  // 공통 컴포넌트는 props를 하나씩 명시한다. className·HTML 속성 묶음·...props로 받지 않는다 (개발 준비 4장)
  {
    files: ["src/components/**/*.tsx"],
    ignores: ["src/components/**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "TSInterfaceDeclaration[id.name=/Props$/] TSPropertySignature[key.name='className']",
          message:
            "공통 컴포넌트는 className을 props로 받지 않는다. 쓰는 쪽에서 감싸서 위치를 정한다",
        },
        {
          selector:
            "TSInterfaceDeclaration[id.name=/Props$/] TSTypeReference[typeName.name=/HTMLAttributes$/]",
          message:
            "HTML 속성 묶음을 이어받지 않는다. 쓰는 속성만 props에 하나씩 적는다",
        },
        {
          selector: "ArrowFunctionExpression > ObjectPattern > RestElement",
          message:
            "props를 ...props로 넘기지 않는다. 쓰는 속성을 하나씩 받아서 넘긴다",
        },
      ],
    },
  },
  // src 안에서는 상대 경로 대신 @/ 경로로 import한다 (개발 준비 4장)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/generated/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^\\.\\.?/",
              message: "src 안에서는 @/ 경로로 import한다",
            },
          ],
        },
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
  // 상수 파일에는 타입을 두지 않는다. 여러 파일이 쓰는 타입은 src/types/ (개발 준비 4장)
  {
    files: ["**/*Constants.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSTypeAliasDeclaration, TSInterfaceDeclaration",
          message:
            "상수 파일에는 타입을 두지 않는다. src/types/{이름}Types.ts 또는 쓰는 파일로 옮긴다",
        },
      ],
    },
  },
  // 객체 모양 타입은 interface (컴포넌트 props는 {이름}Props), 그 밖의 type은 {이름}Type, 제네릭은 T{이름} (개발 준비 4장)
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["src/generated/**"],
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: { regex: "^[TI][A-Z]|(Type|Interface)$", match: false },
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          suffix: ["Type"],
          custom: { regex: "^T[A-Z]", match: false },
        },
        {
          selector: "typeParameter",
          format: null,
          custom: { regex: "^T([A-Z][A-Za-z]*)?$", match: true },
        },
      ],
    },
  },
  // import 순서: 외부 → @/ (assets는 맨 뒤) → 상대 경로 → 스타일. 묶음 사이는 한 줄 띄운다 (개발 준비 4장)
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^node:", "^@?\\w"],
            ["^@/(?!assets/)", "^@/assets/"],
            ["^\\.\\.(?!/?$)", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^\\u0000"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
