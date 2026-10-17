# legacy-renewal (참고 자료)

> **정본 아님.** 2026년 3월에 진행하다 중단한 `mdiary-renewal` 프로젝트에서 가져온 자료다.
> 새 기획을 검토할 때 비교·참고용으로만 쓰고, 여기 적힌 결정을 그대로 따르지 않는다.
> 새 기획에서 채택한 내용은 해당 단계 문서에 다시 작성한다.

## 포함 파일

| 파일 | 원본 | 참고 시점 |
|---|---|---|
| `2026-03-22-01-data-architecture.md` | `claude/01-data-architecture.md` | 3단계 데이터 아키텍처 (ERD, 정기지출·할부 실체화 설계) |
| `schema.prisma` | `prisma/schema.prisma` | 3단계 데이터 아키텍처 |
| `2026-03-22-02-db-setting.md` | `db_setting.md` | 3단계 DB 선택 시 (Prisma 7 + PostgreSQL 16 + Node 24 세팅 노하우) |
| `globals.css` | `src/app/globals.css` | 2단계 디자인 토큰 (색상, 브레이크포인트, 폰트) |

## 기존 프로젝트에서 쓰던 백엔드 패키지

프론트엔드 패키지만 새 프로젝트로 옮겼다. 아래 패키지는 3단계에서 백엔드 방식을 정할 때 다시 검토한다.

- `prisma`, `@prisma/client`, `@prisma/adapter-pg` (7.x)
- `pg` (8.x), `@types/pg`
- `dotenv` (17.x)

## 함께 옮긴 에셋

- `src/assets/*.svg`: 카테고리·UI 아이콘
- `public/fonts/`: Pretendard Variable, Russo One
