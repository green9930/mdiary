# DB Setting Guide

> **Tech Stack**: Prisma 7.x + PostgreSQL 16 + Next.js 16
>
> **Node.js 요구사항**: v24+ (Prisma 7.x 내부 패키지의 ESM 모듈 호환 필요)

---

## 0. Node.js 버전 설정 (필수)

Prisma 7.x는 내부적으로 ESM-only 패키지(`zeptomatch`)를 사용하므로 **Node.js v24 이상**이 필요하다.
v24 미만에서는 `npx prisma studio` 실행 시 `ERR_REQUIRE_ESM` 에러가 발생한다.

### 프로젝트별 버전 고정 (.nvmrc)

이 프로젝트는 `.nvmrc`로 Node.js 버전을 고정한다:

```bash
# Node.js 24 설치 (최초 1회)
nvm install 24

# 프로젝트 디렉토리에서 버전 적용
nvm use
# → Found '.nvmrc' with version <24>
# → Now using node v24.x.x

# 버전 확인
node -v  # v24.x.x
```

> 터미널을 새로 열 때마다 프로젝트 디렉토리에서 `nvm use`를 실행해야 한다.

---

## 1. 프로젝트 구조

```
mdiary-renewal/
├── .env                      # DATABASE_URL (git 제외됨)
├── prisma.config.ts          # Prisma CLI 설정 (DB 접속 URL 관리)
├── prisma/
│   ├── schema.prisma         # 스키마 정의 (모델/테이블)
│   └── migrations/           # 마이그레이션 히스토리
└── src/
    ├── generated/prisma/     # 자동 생성 (git 제외됨)
    └── lib/
        └── prisma.ts         # PrismaClient 싱글톤
```

---

## 2. 세팅 과정 (순차)

### 2-1. PostgreSQL 설치 및 DB 생성

```bash
# PostgreSQL 설치 (macOS)
brew install postgresql@16
brew services start postgresql@16

# PATH 등록 (~/.zshrc에 추가)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# DB 생성
createdb mdiary

# 확인
psql -l
```

### 2-2. Prisma 패키지 설치

```bash
pnpm add -D prisma dotenv
pnpm add @prisma/client
```

| 패키지 | 구분 | 역할 |
|--------|------|------|
| `prisma` | devDependency | CLI 도구 (migrate, generate 등) |
| `dotenv` | devDependency | prisma.config.ts에서 .env 로드 |
| `@prisma/client` | dependency | 런타임 DB 쿼리 클라이언트 |

### 2-3. Prisma 초기화

```bash
npx prisma init
```

생성되는 파일:
- `prisma/schema.prisma` — 스키마 정의
- `prisma.config.ts` — Prisma CLI 설정
- `.env` — 환경변수

### 2-4. 환경변수 설정

`.env` 파일에 DATABASE_URL 설정:

```env
DATABASE_URL="postgresql://geuna@localhost:5432/mdiary?schema=public"
```

**URL 형식**:
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]?schema=[SCHEMA]
```

- 로컬 macOS PostgreSQL은 기본적으로 OS 사용자명으로 접속, 비밀번호 불필요
- 클라우드 DB는 제공되는 URL을 그대로 사용

### 2-5. 설정 파일 확인

**prisma.config.ts** — Prisma 7.x에서 DB 접속 URL을 관리하는 핵심 파일:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

**prisma/schema.prisma** — 모델(테이블) 정의:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

> Prisma 7.x에서는 schema.prisma에 `url` 속성을 넣지 않는다.
> DB 접속 URL은 `prisma.config.ts`에서만 관리한다.

### 2-6. Prisma Client 생성

```bash
npx prisma generate
```

- `src/generated/prisma/` 에 타입 안전한 Client 코드가 생성됨
- `.gitignore`에 포함되어 있으므로 매번 `generate` 실행 필요

### 2-7. PrismaClient 싱글톤 설정

`src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- Next.js Hot Reload 시 PrismaClient가 중복 생성되는 것을 방지
- `globalThis`에 인스턴스를 저장하여 개발 모드에서 재사용

### 2-8. DB 연결 확인

```bash
npx prisma db push
```

`The database is already in sync with the Prisma schema.` 메시지가 나오면 연결 성공.

---

## 3. 자주 사용하는 명령어

| 명령어 | 설명 | 사용 시점 |
|--------|------|-----------|
| `npx prisma generate` | Client 코드 생성 | 스키마 변경 후 |
| `npx prisma migrate dev --name [name]` | 마이그레이션 생성 + 적용 | 스키마 변경을 DB에 반영할 때 |
| `npx prisma migrate deploy` | 마이그레이션 적용만 | 프로덕션 배포 시 |
| `npx prisma db push` | 마이그레이션 없이 스키마 반영 | 프로토타이핑/테스트 |
| `npx prisma studio` | 브라우저에서 DB GUI (localhost:5555) | 데이터 확인/수정 |
| `npx prisma db pull` | 기존 DB에서 스키마 가져오기 | 기존 DB 연동 시 |

### Prisma Studio — 로컬 DB 확인

```bash
# 1. PostgreSQL 서비스 실행 확인
brew services list | grep postgresql

# 2. Node.js 버전 확인 (v24 이상이어야 함)
node -v

# 3. Prisma Studio 실행
npx prisma studio
# → Prisma Studio is up on http://localhost:5555
```

브라우저에서 `http://localhost:5555` 접속하면 DB 테이블을 GUI로 확인/수정할 수 있다.

> **주의**: Node.js 버전이 v24 미만이면 `ERR_REQUIRE_ESM` 에러가 발생한다. `nvm use`로 버전을 먼저 전환한다.

---

## 4. 로컬 vs 배포 환경 비교

### 4-1. 환경별 설정 차이

| 항목 | 로컬 (개발) | 배포 (프로덕션) |
|------|-------------|-----------------|
| **PostgreSQL** | `brew services start postgresql@16` | 클라우드 DB 서비스 |
| **DATABASE_URL** | `postgresql://geuna@localhost:5432/mdiary` | 클라우드 제공 URL |
| **URL 설정 위치** | `.env` 파일 | 호스팅 플랫폼 환경변수 |
| **마이그레이션** | `npx prisma migrate dev` | `npx prisma migrate deploy` |
| **Prisma Client** | Hot Reload 싱글톤 필요 | 단일 인스턴스 |
| **Prisma Studio** | 사용 가능 | 사용하지 않음 |

### 4-2. 클라우드 DB 서비스 옵션

| 서비스 | 특징 | 무료 티어 |
|--------|------|-----------|
| **Supabase** | PostgreSQL 기반, 대시보드 제공 | 500MB, 2개 프로젝트 |
| **Neon** | 서버리스 PostgreSQL, 자동 스케일링 | 512MB |
| **Vercel Postgres** | Vercel 배포 시 자동 연동 (Neon 기반) | 256MB |

### 4-3. 배포 시 변경 사항

코드 변경은 없고 환경변수만 교체하면 된다:

```env
# 로컬
DATABASE_URL="postgresql://geuna@localhost:5432/mdiary?schema=public"

# Supabase (예시)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres"

# Neon (예시)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 4-4. 배포 체크리스트

```bash
# 1. 호스팅 플랫폼에 DATABASE_URL 환경변수 등록
# 2. 빌드 시 Prisma Client 생성
npx prisma generate

# 3. 프로덕션 마이그레이션 적용
npx prisma migrate deploy

# 4. 앱 빌드
pnpm build
```

> `migrate dev`는 개발 전용 (스키마 변경 감지 + 마이그레이션 생성).
> 프로덕션에서는 반드시 `migrate deploy`를 사용한다.

---

## 5. PostgreSQL 로컬 관리 명령어

```bash
# 서비스 시작/중지/재시작
brew services start postgresql@16
brew services stop postgresql@16
brew services restart postgresql@16

# DB 생성/삭제
createdb [DB_NAME]
dropdb [DB_NAME]

# psql 접속
psql mdiary
```
