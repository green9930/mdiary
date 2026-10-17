# mdiary (Money Diary) 리뉴얼

구버전 mdiary(CRA + Firebase 가계부, `main` 브랜치)를 새로 기획해 다시 만드는 1인 프론트엔드 프로젝트.
목적은 포트폴리오: AI(Claude)로 기획하고, 하네스로 제어하며 완성도를 높이는 과정을 보여준다.

## 작업 규칙

- **커밋·푸시 금지.** 사용자가 리뷰한 뒤 직접 진행한다. 사용자가 "커밋해"처럼 명시적으로 요청한 경우만 예외.
- **커밋 메시지는 한국어로 쓰고, `Co-Authored-By` 같은 AI 작성자 표시는 넣지 않는다.**
- **브랜치는 `renewal-main` 하나로 작업한다.** 원본 보존이 필요한 경우(A/B 비교 등)에만 사용자에게 분기를 제안한다. 포트폴리오용으로 브랜치를 쪼개지 않는다.
- **md 파일명은 `YYYY-MM-DD-NN-title.md`.** 작성일, 같은 날짜 안의 두 자리 순번, 영문 kebab-case 제목 순서다 (예: `2026-10-17-01-title.md`). 순번은 폴더마다 따로 매긴다. `README.md`, `CLAUDE.md`처럼 도구가 정한 이름은 예외.
- 결정을 내리면 `docs/decisions/`에 기록한다. AI 제안과 최종 결정이 다르면 그 이유를 남긴다.
- `docs/reference/`는 참고 자료일 뿐 정본이 아니다. 채택한 내용은 해당 단계 문서에 다시 쓴다.

## 진행 단계

0. 하네스 세팅
1. 서비스 기획 → `docs/01-product/`
2. 화면별 구성안 → `docs/02-screens/`
3. 데이터 아키텍처 → `docs/03-data/`
4. 개발 준비 (테스트·포맷터·CI·hook 보강, 구현 계획)
5. 기능 단위 개발 반복 (스펙 → 계획 → TDD → 리뷰)
6. 배포·회고

앞 단계 산출물이 사용자 검토를 거친 뒤 다음 단계로 넘어간다.

## 기술 스택

아래 메이저 버전을 유지한다. 버전을 올릴 때는 메이저를 유지하고 패치만 올린다.

- Node 24 (`.nvmrc`), pnpm 10 (`packageManager`)
- Next.js 15 (App Router), React 19, TypeScript 5
- TanStack Query 5, Tailwind CSS 4, ESLint 9

## 명령어

```bash
nvm use
pnpm install
pnpm dev
pnpm lint
pnpm build
```
