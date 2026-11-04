# mdiary (Money Diary) 리뉴얼

구버전 mdiary(CRA + Firebase 가계부, `main` 브랜치)를 새로 기획해 다시 만드는 1인 프론트엔드 프로젝트.
개발 기록: AI(Claude)로 기획하고, 하네스로 제어하며 완성도를 높이는 과정을 남긴다.

## 작업 규칙

- **커밋·푸시 금지.** 사용자가 리뷰한 뒤 직접 진행한다. 사용자가 "커밋해"처럼 명시적으로 요청한 경우만 예외.
- **커밋 메시지는 한국어로 쓰고, `Co-Authored-By` 같은 AI 작성자 표시는 넣지 않는다.**
- **브랜치는 `renewal-main` 하나로 작업한다.** 원본 보존이 필요한 경우(A/B 비교 등)에만 사용자에게 분기를 제안한다. 기록을 보여주려는 목적으로 브랜치를 쪼개지 않는다.
- **md 파일명은 `YYYY-MM-DD-NN-title.md`.** 작성일, 같은 날짜 안의 두 자리 순번, 영문 kebab-case 제목 순서다 (예: `2026-10-17-01-title.md`). 순번은 폴더마다 따로 매긴다. `README.md`, `CLAUDE.md`처럼 도구가 정한 이름은 예외.
- 결정 내용은 해당 단계의 명세 문서(기획서, 화면 구성안 등)에 바로 반영한다. 결정 과정이나 AI 제안과의 차이는 별도 문서로 남기지 않는다.
- `docs/reference/`는 참고 자료일 뿐 정본이 아니다. 채택한 내용은 해당 단계 문서에 다시 쓴다.
- 화면 명세·와이어프레임(`docs/02-screens/`)을 쓰거나 고칠 때는 `docs/02-screens/README.md`의 규칙을 따르고, 고친 뒤 `python3 scripts/check-wireframes.py`를 돌려 결과를 보고한다.

## 진행 단계

0. 하네스 세팅
1. 서비스 기획 → `docs/01-product/`
2. 화면별 구성안 → `docs/02-screens/`
3. 데이터 아키텍처 → `docs/03-data/`
4. 개발 준비 (테스트·포맷터·CI·hook 보강, 구현 계획) → `docs/04-dev/`
5. 기능 단위 개발 반복 (스펙 → 계획 → TDD → 리뷰)
6. 배포·회고

앞 단계 산출물이 사용자 검토를 거친 뒤 다음 단계로 넘어간다.

MVP 이후 검토할 항목(TODO)은 `docs/01-product/2026-10-17-02-product-brief.md` 8장에 모은다. 6단계(배포·회고) 전에 다시 검토한다.

## 기술 스택

패키지는 LTS 버전을 쓴다. 지원 정책이 있으면 지원 중인 메이저를, 없으면 최신 메이저를 쓴다. 메이저를 바꿀 때는 사용자와 정하고, 그 밖에는 패치만 올린다.

- Node 24 (`.nvmrc`), pnpm 10 (`packageManager`)
- Next.js 16 (App Router, Turbopack), React 19, TypeScript 6 (7은 typescript-eslint 미지원)
- TanStack Query 5, Tailwind CSS 4, zod 4, ESLint 10
- Prettier 3, Vitest 5, Testing Library, Playwright 1, lefthook 2
- 추가 예정 (4단계, `docs/04-dev/2026-11-02-01-dev-setup.md`): Prisma 7 + Neon, Better Auth

## 명령어

```bash
nvm use
pnpm install
pnpm dev
pnpm lint
pnpm build
```
