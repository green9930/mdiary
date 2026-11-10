# 개발 명령어

개발 환경을 준비하고 개발 서버를 띄우는 데 필요한 명령어 모음. 모두 저장소 루트에서 실행한다.

## 1. 처음 준비 (새 기기 포함)

필요한 것: nvm, Docker Desktop, Python 3, GitHub CLI(`gh`), `.env` 파일(저장소에 없다. 직접 옮기거나 `.env.example`을 보고 채운다).

| 순서 | 명령                                    | 하는 일                                                                                     |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1    | `nvm install && nvm use`                | `.nvmrc`의 Node 24를 설치하고 쓴다                                                          |
| 2    | `corepack enable`                       | `package.json`에 적힌 pnpm 10을 쓰게 한다 (처음 한 번)                                      |
| 3    | `pnpm install`                          | 패키지 설치. git hook(lefthook)과 Prisma 클라이언트도 함께 만든다                           |
| 4    | Docker Desktop 실행                     | 로컬 DB를 띄우기 전에 켜 둔다                                                               |
| 5    | `pnpm db:up`                            | 로컬 Postgres 18을 띄운다 (`mdiary_dev`·`mdiary_test`·`mdiary_e2e`). 준비될 때까지 기다린다 |
| 6    | `pnpm test:db`                          | DB 테스트가 통과하면 로컬 DB 준비 완료                                                      |
| 7    | `pnpm exec playwright install chromium` | E2E용 브라우저 설치 (처음 한 번)                                                            |

개인 계정 설정 (저장소를 받은 뒤 한 번). 커밋과 push가 회사 계정으로 남지 않게 저장소에만 적용한다:

```bash
gh auth login                       # green9930 계정으로 로그인 (이미 있으면 생략)
git config user.name geuna
git config user.email geuna0204@gmail.com
git config credential.https://github.com.helper ''
git config --add credential.https://github.com.helper '!f() { test "$1" = get && echo username=green9930 && echo "password=$(gh auth token -u green9930)"; }; f'
```

VS Code로 열면 권장 확장 Tailwind CSS IntelliSense 설치 안내가 뜬다. 설치하면 `.vscode/settings.json` 설정으로 CSS 파일을 Tailwind 문법으로 읽어서 `@theme`·`@utility` 경고가 없어지고 토큰 자동완성이 된다.

Neon development에는 이미 테이블과 개발 데이터가 있으므로 새 기기에서 다시 넣을 필요가 없다.

## 2. 개발 서버

| 명령         | 하는 일                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| `nvm use`    | 터미널을 새로 열었으면 Node 24로 맞춘다                                                  |
| `pnpm dev`   | 개발 서버 (http://localhost:3000). DB는 Neon development. 환경 변수가 틀리면 뜨지 않는다 |
| `pnpm build` | 운영 빌드. 빌드 오류 확인용                                                              |
| `pnpm start` | `pnpm build` 결과를 운영 모드로 띄운다                                                   |

- 휴대폰에서 보려면 같은 Wi-Fi에서 `pnpm dev`가 출력하는 Network 주소(`http://192.168.x.x:3000`)로 연다. `next.config.ts`의 `allowedDevOrigins`가 `192.168.*.*`를 허용한다. 공통 컴포넌트 견본 `/dev/components`는 로그인 없이 열린다.
- 개발 서버는 한 폴더에 하나만 뜬다. "Another next dev server is already running"이 나오면 안내된 `kill <PID>`로 기존 서버를 끈다.
- 개발 데이터는 테스트 사용자(`test@mdiary.local`)의 것이다. `pnpm dev` 화면에서는 Google 계정으로 로그인하므로 개발 데이터가 보이지 않는다.

## 3. 로컬 DB (Docker)

| 명령           | 하는 일                                |
| -------------- | -------------------------------------- |
| `pnpm db:up`   | 로컬 Postgres를 띄운다                 |
| `pnpm db:down` | 로컬 Postgres를 끈다 (데이터는 남는다) |

로컬 DB는 마이그레이션을 만들 때와 DB 테스트에만 쓴다. 언제 지워도 된다: `docker compose down -v`.

## 4. 스키마 변경 (Prisma)

| 순서 | 명령                        | 하는 일                                                                          |
| ---- | --------------------------- | -------------------------------------------------------------------------------- |
| 1    | `prisma/schema.prisma` 수정 |                                                                                  |
| 2    | `pnpm db:migrate`           | 로컬 `mdiary_dev`에서 마이그레이션 파일을 만들고 적용한다 (`prisma/migrations/`) |
| 3    | `pnpm test:db`              | 새 마이그레이션으로 DB 테스트                                                    |
| 4    | `pnpm db:deploy`            | 마이그레이션을 Neon development에 적용한다. 데이터는 지우지 않는다               |

| 명령                           | 하는 일                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `pnpm db:seed`                 | 개발 데이터를 Neon development에 넣는다. 테스트 사용자 데이터만 지우고 다시 넣는다 |
| `DB_TARGET=local pnpm db:seed` | 같은 데이터를 로컬 `mdiary_dev`에 넣는다                                           |
| `pnpm prisma generate`         | Prisma 클라이언트를 다시 만든다 (`pnpm install` 때 자동)                           |
| `pnpm prisma migrate status`   | Neon development에 적용 안 된 마이그레이션이 있는지 본다                           |

- CLI가 붙는 DB: `DB_TARGET` 없음 → Neon development(`.env`의 `DIRECT_URL`), `local` → 로컬 `mdiary_dev`, `test` → 로컬 `mdiary_test`, `e2e` → 로컬 `mdiary_e2e`.
- 운영(`production`) 브랜치에는 개발 중에 마이그레이션을 돌리지 않는다.

## 5. 테스트

| 명령            | 하는 일                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm test`     | 단위·컴포넌트 테스트 (`*.test.ts`, `*.test.tsx`)                                                                |
| `pnpm test:db`  | DB 테스트 (`src/server/**/*.db.test.ts`). 로컬 `mdiary_test`를 비우고 시작                                      |
| `pnpm test:e2e` | E2E 테스트 (Playwright, 모바일 화면). 개발 서버를 3100 포트에 띄워 돌린다. DB는 로컬 `mdiary_e2e`를 비우고 시작 |

- `test:db`·`test:e2e`는 로컬 Docker DB가 떠 있어야 한다 (`pnpm db:up`).
- 개발 서버는 한 폴더에 하나만 뜨므로, `pnpm dev`를 켜 둔 채로는 `test:e2e`가 돌지 않는다. 개발 서버를 끄고 돌린다.

## 6. 코드 점검

| 명령                    | 하는 일                                     |
| ----------------------- | ------------------------------------------- |
| `pnpm lint`             | ESLint                                      |
| `pnpm typecheck`        | TypeScript 타입 검사                        |
| `pnpm format`           | Prettier로 전체 정리                        |
| `pnpm format:check`     | 정리가 필요한 파일이 있는지만 본다          |
| `pnpm check:wireframes` | 와이어프레임 규칙 점검                      |
| `pnpm check:tokens`     | 토큰 문서 ↔ `globals.css`·견본 html 값 비교 |

## 7. 자동으로 도는 검사

| 시점                         | 실행                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `git commit`                 | 커밋할 파일만 Prettier 확인·ESLint. 화면 문서가 있으면 와이어프레임 점검, 토큰 파일이 있으면 토큰 점검 |
| `git push`                   | `typecheck`, `test`                                                                                    |
| GitHub push (`renewal-main`) | CI: `lint`, `format:check`, `typecheck`, `test`, `test:db`, `build`, 와이어프레임·토큰 점검            |
| PR, Actions 수동 실행        | 위 CI + `test:e2e`                                                                                     |
| Claude가 파일을 고친 직후    | Prettier 정리, 화면 문서·토큰 파일이면 해당 점검 결과를 Claude에게 전달                                |

검사에 걸리면 커밋·푸시가 멈춘다. 고친 뒤 다시 실행한다.
