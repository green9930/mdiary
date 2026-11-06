# mdiary (Money Diary) 리뉴얼

구버전 mdiary(CRA + Firebase 가계부, `main` 브랜치)를 새로 기획해 다시 만드는 1인 프론트엔드 프로젝트.
개발 기록: AI(Claude)로 기획하고, 하네스로 제어하며 완성도를 높이는 과정을 남긴다.

## 작업 규칙

- **커밋·푸시 금지.** 사용자가 리뷰한 뒤 직접 진행한다. 사용자가 "커밋해"처럼 명시적으로 요청한 경우만 예외.
- **커밋 메시지는 한국어로 쓰고, `Co-Authored-By` 같은 AI 작성자 표시는 넣지 않는다.** 제목 한 줄로 무엇을 했는지 포괄적으로 쓴다 (예: `feat: 앱 레이아웃과 하단 탭 바 추가`). 세부 변경은 나열하지 않는다.
- **개인 계정만 쓴다.** 커밋 작성자는 `geuna0204@gmail.com`, GitHub은 `green9930`. 회사 계정 흔적이 남으면 안 된다. 커밋 전에 작성자 이메일을 확인한다. 새 기기 설정은 `docs/04-dev/2026-11-04-01-dev-commands.md` 1장.
- **브랜치는 `renewal-main` 하나로 작업한다.** 원본 보존이 필요한 경우(A/B 비교 등)에만 사용자에게 분기를 제안한다. 기록을 보여주려는 목적으로 브랜치를 쪼개지 않는다.
- **md 파일명은 `YYYY-MM-DD-NN-title.md`.** 작성일, 같은 날짜 안의 두 자리 순번, 영문 kebab-case 제목 순서다 (예: `2026-10-17-01-title.md`). 순번은 폴더마다 따로 매긴다. `README.md`, `CLAUDE.md`처럼 도구가 정한 이름은 예외.
- 결정 내용은 해당 단계의 명세 문서(기획서, 화면 구성안 등)에 바로 반영한다. 결정 과정이나 AI 제안과의 차이는 별도 문서로 남기지 않는다. 문서 본문에도 결정 결과만 쓰고, 이유·과정을 남기려면 먼저 사용자에게 묻는다.
- 보고는 짧게 한다. 결정이 필요하면 선택지와 추천안을 표로 정리한다. 화면을 바꾸면 스크린샷(라이트·다크)으로 직접 확인한다.
- `.env`는 읽지도 출력하지도 않는다. 구버전 `main`의 `.env` 커밋(d654047)도 열어 보지 않는다. 비밀값을 만드는 명령(`openssl rand` 등)은 대화에 출력되는 방식(`!` 명령)으로 돌리게 하지 않는다.
- 운영 Neon 브랜치(`production`)에 개발 마이그레이션을 직접 돌리지 않는다.
- 사용자가 띄운 개발 서버(3000 포트)는 끄지 않는다. 개발 서버는 한 폴더에 하나만 떠서 E2E·build를 막으므로, 필요하면 사용자에게 꺼 달라고 한다. Claude가 띄운 임시 서버는 쓰고 나서 끈다.
- 코드를 쓰기 전에 `docs/04-dev/2026-11-02-01-dev-setup.md` 3-1장(폴더 구조)과 4장(코드 규약)을 따른다.
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

5단계는 기능(F0~F12)마다 이렇게 진행한다: 사용자가 "다음 단계 세부계획 보고"를 요청 → 결정 사항 표와 추천안을 담아 계획 보고 → 승인 후 구현 → 검사 통과 후 사용자 리뷰 → "커밋해"를 받으면 커밋. 현재 진행 상황과 미뤄 둔 작업은 `docs/04-dev/2026-11-02-02-implementation-plan.md` 3장에 둔다.

MVP 이후 검토할 항목(TODO)은 `docs/01-product/2026-10-17-02-product-brief.md` 8장에 모은다. 6단계(배포·회고) 전에 다시 검토한다.

## 기술 스택

패키지는 LTS 버전을 쓴다. 지원 정책이 있으면 지원 중인 메이저를, 없으면 최신 메이저를 쓴다. 메이저를 바꿀 때는 사용자와 정하고, 그 밖에는 패치만 올린다.

- Node 24 (`.nvmrc`), pnpm 10 (`packageManager`)
- Next.js 16 (App Router, Turbopack), React 19, TypeScript 6 (7은 typescript-eslint 미지원)
- TanStack Query 5, Tailwind CSS 4, zod 4, ESLint 10
- Prettier 3, Vitest 5, Testing Library, Playwright 1, lefthook 2
- Prisma 7 (`@prisma/adapter-pg`) + Neon Postgres 18, Better Auth 1, Docker Postgres 18 (테스트)

## 명령어

설명이 붙은 전체 목록: `docs/04-dev/2026-11-04-01-dev-commands.md`

```bash
# 처음 (새 기기 포함). .env는 직접 옮긴다 (.env.example 참고)
nvm install && nvm use
pnpm install          # 패키지, git hook, Prisma 클라이언트
pnpm db:up            # 로컬 Postgres (Docker)

pnpm dev              # 개발 서버 (Neon development)
pnpm lint / typecheck / format
pnpm test             # 단위·컴포넌트
pnpm test:db          # DB 테스트 (로컬 mdiary_test를 비우고 시작)
pnpm test:e2e         # E2E (로컬 mdiary_e2e를 비우고 시작)
pnpm check:wireframes / check:tokens

pnpm db:migrate       # 스키마 변경 → 로컬에서 마이그레이션 만들기
pnpm db:deploy        # 마이그레이션을 Neon development에 적용
pnpm db:seed          # 개발 데이터 (테스트 사용자, Neon development)
```
