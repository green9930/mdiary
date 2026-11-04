# 데이터 아키텍처

다씀의 데이터 모델, 반복 기록 규칙, 서버 API, 집계, 인증, 구버전 데이터 이전을 정한 문서다. **정본**이다.

- 입력: 기획서(`docs/01-product/2026-10-17-02-product-brief.md`), 화면 기능 명세(`docs/02-screens/2026-10-19-01-page-spec.md`)의 "화면이 알아야 하는 정보"
- 견본: `2026-11-02-02-recurring-scenarios.html` (반복 기록이 생성·수정·삭제·연장으로 어떻게 바뀌는지 경우별 표)
- 참고만 한 자료: `docs/reference/legacy-renewal/` (이전 리뉴얼 시도의 설계. 그대로 따르지 않았다)
- Prisma 스키마는 이 문서의 7장 초안을 4단계에서 파일로 옮긴다

## 1. 결정 요약

| #   | 항목                              | 결정                                                                                                    |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| D1  | 서버 API                          | Next.js Route Handlers(REST) + 클라이언트 TanStack Query                                                |
| D2  | 인증                              | Better Auth, Google 로그인, DB 세션                                                                     |
| D3  | DB                                | Neon Postgres + Prisma 7. 운영은 `production` 브랜치, 개발은 `development` 브랜치                       |
| D4  | 반복 기록 저장                    | 모든 건을 행으로 만든다. "계속" 정기지출은 앞으로 24개월치만 만들고 자동 연장한다                       |
| D5  | 할부 총액                         | 등록할 때의 총액을 고정 저장한다. 회차를 수정·삭제해도 바뀌지 않는다                                    |
| D6  | 제목 추천 사용 횟수               | 반복 묶음은 1번으로 센다                                                                                |
| D7  | ID                                | UUID v7                                                                                                 |
| D8  | 검색 인덱스                       | 두지 않는다. 사용자·날짜 인덱스로 범위를 좁힌 뒤 부분 일치                                              |
| D9  | 구버전 이전                       | Firebase Admin SDK 내보내기 스크립트 → 이전 스크립트로 새 계정에 넣는다                                 |
| D10 | 탈퇴 안내 건수                    | 저장된 모든 행 (미리 만들어진 미래 반복 건 포함)                                                        |
| D11 | 범위 수정에서 날짜의 달을 바꿀 때 | 이후 전체는 Δ개월 뒤로 밀고(끝 달 포함), 이 건부터 N개월은 달을 바꿀 수 없다. 앞 달로는 이번 건만 (5-3) |

## 2. 스택과 연결

| 항목      | 내용                                                               |
| --------- | ------------------------------------------------------------------ |
| DB        | Neon Postgres 18 (서울과 가까운 리전)                              |
| ORM       | Prisma 7, `@prisma/adapter-pg` (개발·테스트·운영 같은 연결 방식)   |
| 인증      | Better Auth + Prisma 어댑터, Google 제공자                         |
| 서버      | Next.js 16 Route Handlers (`src/app/api/**/route.ts`), Node 런타임 |
| 검증      | 서버·클라이언트가 같은 스키마(zod)를 쓴다                          |
| 정기 작업 | Vercel Cron (Hobby: 하루 1번)                                      |

환경 변수(값은 저장소에 두지 않는다):

| 이름                                       | 쓰임                          |
| ------------------------------------------ | ----------------------------- |
| `DATABASE_URL`                             | 앱 연결 (풀링 주소)           |
| `DIRECT_URL`                               | 마이그레이션 연결 (직접 주소) |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`    | Better Auth                   |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google 로그인                 |
| `CRON_SECRET`                              | 정기 작업 호출 확인           |

- 개발: Neon `development` 브랜치를 쓴다. 운영 데이터가 필요하면 브랜치를 새로 따서 쓴다. 운영 `production` 브랜치에 개발 마이그레이션을 직접 돌리지 않는다.

## 3. 공통 규칙

### 3-1. 날짜와 시간대

- 지출 날짜는 Postgres `DATE`로 저장한다 (시각 없음).
- API는 날짜를 문자열 `YYYY-MM-DD`, 월을 `YYYY-MM`으로 주고받는다. 서버 코드에서 날짜를 JS `Date`로 다루지 않는다 (시간대 때문에 하루가 밀리는 것을 막는다). Prisma가 `DATE`를 `Date`로 돌려주는 곳은 변환 함수 하나로만 바꾼다.
- "오늘"·"이번 달"은 서버가 Asia/Seoul 기준으로 계산한다.
- `createdAt`·`updatedAt`은 `timestamptz`.

### 3-2. 값 검증

| 항목                   | 규칙                                                                          | 어디서                       |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| 제목                   | 앞뒤 공백 제거 후 1~25자. 글자 수는 화면에 보이는 글자 단위(`Intl.Segmenter`) | zod (서버·클라이언트)        |
| 내용                   | 0~200자, 줄바꿈 1개 = 1자. 빈 문자열은 `null`로 저장                          | zod                          |
| 금액                   | 정수 1 ~ 999,999,999                                                          | zod + DB CHECK               |
| 날짜                   | 실제 있는 날짜, 2099-12-31 이하                                               | zod                          |
| 카테고리               | enum 10개                                                                     | zod + DB enum                |
| 결제일                 | 1~31                                                                          | zod + DB CHECK               |
| 반복 개월 수·할부 회차 | 2~99                                                                          | zod                          |
| 범위 N                 | 1 ~ 남은 건수 (계속 반복은 1~99)                                              | 서버가 남은 건수로 다시 확인 |

- 서버는 클라이언트 검증을 믿지 않고 모든 요청을 다시 검증한다.
- 금액 합계는 Postgres에서 `bigint`로 나온다 (5년치는 32비트 정수를 넘을 수 있다). API는 합계를 숫자로 돌려주되, 9,007,199,254,740,991 이하이므로 JS 숫자로 안전하다.

### 3-3. 소유권

- 모든 조회·변경은 세션의 사용자 id로 범위를 정한다 (`WHERE userId = 세션 사용자`).
- 남의 기록 id를 넣으면 "없음"(404)으로 답한다. 있는지 없는지 알려주지 않는다.

## 4. 데이터 모델

### 4-1. 관계

```
User 1 ─── N Expense
User 1 ─── N Series
Series 1 ─── N Expense      (반복 기록만. 반복 없는 기록은 seriesId = null)
User 1 ─── N Session, Account   (Better Auth)
```

### 4-2. Expense (지출 한 건)

| 필드        | 타입        | 제약                               | 설명                                           |
| ----------- | ----------- | ---------------------------------- | ---------------------------------------------- |
| `id`        | uuid        | PK, v7                             | 시간순 정렬되는 id. 목록 커서의 마지막 정렬 키 |
| `userId`    | text        | FK → User, 삭제 시 CASCADE         |                                                |
| `date`      | date        | NOT NULL                           | 지출 날짜                                      |
| `title`     | text        | NOT NULL                           | 1~25자 (앱 검증)                               |
| `content`   | text        | NULL                               | 0~200자                                        |
| `category`  | Category    | NOT NULL                           |                                                |
| `amount`    | integer     | NOT NULL, CHECK 1~999,999,999      |                                                |
| `seriesId`  | uuid        | NULL, FK → Series, 삭제 시 CASCADE | 반복 묶음                                      |
| `seq`       | integer     | NULL                               | 반복 묶음 안 순번 (1부터). 할부는 회차         |
| `createdAt` | timestamptz | 기본 now()                         | 하루 목록 "등록 순" 정렬                       |
| `updatedAt` | timestamptz |                                    |                                                |

인덱스·제약:

| 이름                 | 대상                                           | 쓰임                             |
| -------------------- | ---------------------------------------------- | -------------------------------- |
| `expense_user_date`  | (`userId`, `date`)                             | 달력, 기간 집계, 목록, 검색 범위 |
| `expense_series_seq` | (`seriesId`, `seq`) UNIQUE                     | 범위 수정·삭제, 연장 중복 방지   |
| CHECK                | `seriesId`와 `seq`는 둘 다 NULL이거나 둘 다 값 |                                  |

### 4-3. Series (반복 묶음)

| 필드                     | 타입        | 제약                 | 설명                                               |
| ------------------------ | ----------- | -------------------- | -------------------------------------------------- |
| `id`                     | uuid        | PK, v7               |                                                    |
| `userId`                 | text        | FK → User, CASCADE   |                                                    |
| `type`                   | SeriesType  | NOT NULL             | `RECURRING` 정기지출 / `INSTALLMENT` 할부          |
| `billingDay`             | smallint    | NOT NULL, CHECK 1~31 | 원래 결제일 (말일 조정 전)                         |
| `isContinuous`           | boolean     | NOT NULL, 기본 false | "계속" 정기지출                                    |
| `totalCount`             | smallint    | NULL                 | 할부 총 회차, 정기 N개월이면 N. 계속이면 NULL      |
| `installmentTotal`       | integer     | NULL                 | 할부 등록 총액 (D5). 할부만                        |
| `generatedUntil`         | date        | NULL                 | 계속 반복이 행을 만들어 둔 마지막 달의 1일. 계속만 |
| `createdAt`, `updatedAt` | timestamptz |                      |                                                    |

- 묶음의 제목·카테고리·금액·내용은 Series에 두지 않는다. 각 행(Expense)이 정본이다. 연장할 때는 그 묶음의 마지막 행을 본뜬다 (5-4).
- 인덱스: (`userId`), (`isContinuous`, `generatedUntil`) — 정기 작업이 연장할 묶음을 찾는다.

### 4-4. Category enum

순서는 기획서 4-6을 따르고, 금액이 같을 때 정렬 순서로도 쓴다.

| 값          | 이름 |
| ----------- | ---- |
| `FOOD`      | 식비 |
| `APPLIANCE` | 가전 |
| `TRANSPORT` | 교통 |
| `MEDICAL`   | 의료 |
| `CLOTHING`  | 의류 |
| `BEAUTY`    | 미용 |
| `CULTURE`   | 문화 |
| `EDUCATION` | 교육 |
| `LIVING`    | 생활 |
| `ETC`       | 기타 |

### 4-5. 인증 테이블 (Better Auth)

Better Auth 기본 스키마(`user`, `session`, `account`, `verification`)를 Prisma 어댑터로 만든다. `user`가 위의 User다.

- User에서 화면이 쓰는 값은 `email`뿐이다 (SC-10).
- Expense·Series는 `user.id`를 참조하고, 사용자 삭제 시 함께 지워진다.

## 5. 반복 기록 규칙

견본(`2026-11-02-02-recurring-scenarios.html`)에 아래 규칙을 경우별로 그렸다.

### 5-1. 용어

- **묶음**: 같은 Series에 속한 행들. `seq` 순서로 나열한다.
- **이 건**: 사용자가 상세에서 고른 행 (`seq = k`).
- **남은 건수**: 이 건을 포함해 `seq ≥ k`인 행의 수. 계속 반복이면 "계속".
- **결제일 맞추기**: 그 달에 결제일이 없으면 말일로 한다. 원래 결제일(`billingDay`)은 바꾸지 않는다.

### 5-2. 생성

| 반복             | 만드는 행                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------- |
| 없음             | 1행, `seriesId = null`                                                                       |
| 정기 N개월       | 날짜의 달부터 N개 달에 1행씩. `seq` 1~N. 날짜는 각 달의 결제일(맞추기). `totalCount = N`     |
| 정기 계속        | 날짜의 달부터 **연장 끝 달**까지 1행씩. `isContinuous = true`, `generatedUntil = 연장 끝 달` |
| 할부 회차당 금액 | N개 달에 1행씩, 금액은 모두 같다. `installmentTotal = 금액 × N`                              |
| 할부 총액        | 회차 금액 = 총액 ÷ N (버림), 1회차 = 총액 − 회차 금액 × (N − 1). `installmentTotal = 총액`   |

- 결제일 = 날짜 필드의 일. 첫 행의 날짜는 입력한 날짜 그대로다.
- **연장 끝 달** = max(날짜의 달, 이번 달 + 24개월). 단 2099년 12월을 넘지 않는다.
- 묶음과 모든 행은 한 트랜잭션으로 만든다.

### 5-3. 수정 (SC-06 → SC-09)

수정 화면에서 바꿀 수 있는 값은 날짜·제목·카테고리·금액·내용이다. 반복 종류·기간·회차는 바꿀 수 없다. 범위의 기준은 오늘이 아니라 **사용자가 연 건(이 건)**이다. 이 건보다 앞선 건은 어떤 범위에서도 바뀌지 않는다.

| 범위            | 대상 행                      |
| --------------- | ---------------------------- |
| 이번 건만       | 이 건 1행                    |
| 이후 전체       | `seq ≥ k`인 모든 행          |
| 이 건부터 N개월 | `seq ≥ k`인 행 중 앞에서 N개 |

- 제목·카테고리·금액·내용은 대상 행 모두에 같은 값으로 덮어쓴다. 바꾸지 않은 필드는 건드리지 않는다.
- 할부 금액을 바꿔도 `installmentTotal`은 그대로다 (D5).
- 계속 반복에서 N이 만들어 둔 행보다 많으면 먼저 연장(5-4)하고 적용한다.

**날짜를 바꿨을 때** (Δ = 새 날짜의 달 − 이 건의 달)

| 범위            | Δ = 0 (같은 달)               | Δ > 0 (뒤 달)                                     | Δ < 0 (앞 달) |
| --------------- | ----------------------------- | ------------------------------------------------- | ------------- |
| 이번 건만       | 입력한 날짜로                 | 입력한 날짜로                                     | 입력한 날짜로 |
| 이후 전체       | 각 행의 일을 새 일로 (맞추기) | 각 행을 **Δ개월 뒤로 밀고** 일을 새 일로 (맞추기) | 고를 수 없다  |
| 이 건부터 N개월 | 각 행의 일을 새 일로 (맞추기) | 고를 수 없다                                      | 고를 수 없다  |

- 이후 전체에서 날짜를 바꾸면 묶음의 `billingDay`를 새 일로 바꾼다. 계속 반복이면 `generatedUntil`도 Δ개월 뒤로 옮긴다.
- 밀기는 건수를 유지한다. 기간이 정해진 반복과 할부는 끝 달도 Δ개월 뒤로 간다 (예: 12월~5월 6건 → 1월~6월 6건). 이 건의 원래 달은 비게 된다.
- "고를 수 없다": 앞선 건 또는 범위 밖의 건과 같은 달에 두 건이 생기기 때문이다. SC-09가 그 선택지를 비활성으로 보여주고, 서버도 400(`SCOPE_NOT_ALLOWED`)으로 거절한다.

### 5-4. 연장 (계속 정기지출)

- **언제**
  - 매일 1번 정기 작업: `generatedUntil < 이번 달 + 24개월`인 계속 묶음을 연장한다.
  - 조회 직전: 요청한 기간의 끝 달이 그 사용자의 계속 묶음 `generatedUntil`보다 뒤면 그 달까지 먼저 연장한다 (달력, 카테고리별, 검색의 직접 지정 기간, 범위 미리보기).
- **무엇으로**: 그 묶음에서 `seq`가 가장 큰 행의 제목·카테고리·금액·내용을 본뜨고, 날짜는 각 달의 `billingDay`(맞추기). `seq`는 이어서 매긴다.
- `generatedUntil` 다음 달부터 목표 달까지 만들고 `generatedUntil`을 옮긴다. 중간에 사용자가 지운 달은 다시 만들지 않는다 (`generatedUntil` 이전은 건드리지 않음).
- 묶음 행 잠금(`SELECT … FOR UPDATE`) 안에서 하고, (`seriesId`, `seq`) UNIQUE로 중복 생성을 막는다. 같은 연장이 두 번 돌아도 결과가 같다.

### 5-5. 삭제 (SC-08 → SC-09)

| 범위            | 지우는 행                    | 묶음 처리                                                                       |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| 반복 없음       | 그 1행                       | –                                                                               |
| 이번 건만       | 이 건 1행                    | 남은 행이 없고 계속 반복이 아니면 묶음도 지운다                                 |
| 이후 전체       | `seq ≥ k`인 모든 행          | 계속 반복이면 `isContinuous = false`(반복 종료). 남은 행이 없으면 묶음도 지운다 |
| 이 건부터 N개월 | `seq ≥ k`인 행 중 앞에서 N개 | 계속 반복은 그대로 계속                                                         |

- 할부 회차 표시(`2/3`)는 `seq/totalCount`라서 다른 회차를 지워도 번호가 바뀌지 않는다.
- 계속 반복의 "이후 전체" 삭제 확인 문구는 화면 명세대로 `이 건부터 반복이 종료됩니다. 삭제하시겠습니까?`.

### 5-6. 범위 미리보기 (SC-09)

| 값              | 계산                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 남은 건수       | `seq ≥ k`인 행 수. 계속 반복이면 "계속"                                                                                 |
| 이번 건만       | 1건, 이 건의 달                                                                                                         |
| 이후 전체       | 남은 건수, 이 건의 달 ~ 마지막 행의 달. 계속이면 `2026년 10월부터 계속`. 날짜를 뒤 달로 바꿨으면 Δ개월 민 달로 보여준다 |
| 이 건부터 N개월 | N건, 이 건의 달 ~ N번째 행의 달                                                                                         |

## 6. 조회·집계

목록은 50건씩 커서로 나눠 받는다. 커서는 정렬 키를 묶은 불투명 문자열이다.

| 화면  | 조회                            | 조건·정렬                                                                                                                   |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 공통  | 가장 오래된 기록의 연도         | `MIN(date)`. 기록이 없으면 올해                                                                                             |
| SC-03 | 날짜별 합계, 월 합계            | 그 달 `GROUP BY date`, `SUM(amount)`                                                                                        |
| SC-03 | 하루 목록                       | 그날, `createdAt ASC, id ASC` (등록 순)                                                                                     |
| SC-04 | 기간 총액·건수, 카테고리별 합계 | 기간 `GROUP BY category`. 금액 내림차순, 같으면 enum 순서                                                                   |
| SC-04 | 목록                            | 기간 + (카테고리). 최신순 `date DESC, id DESC` / 큰 금액순 `amount DESC, date DESC, id DESC`                                |
| SC-04 | 필터 카테고리의 합계·건수       | 카테고리별 합계에서 꺼낸다 (따로 조회하지 않음)                                                                             |
| SC-05 | 검색 목록                       | 기간 + (`title ILIKE` 또는 `content ILIKE` `%검색어%`), `date DESC, id DESC`. `%`·`_`·`\`는 이스케이프해 글자 그대로 찾는다 |
| SC-05 | 검색 결과 건수·합계             | 같은 조건 `COUNT`, `SUM` (불러온 50건이 아니라 전체)                                                                        |
| SC-06 | 제목 추천                       | 아래 표                                                                                                                     |
| SC-08 | 기록 1건 + 반복 정보            | 행 + 묶음(종류, 결제일, 계속 여부, 첫·마지막 행의 달, `seq`·`totalCount`, `installmentTotal`)                               |
| SC-09 | 범위 미리보기                   | 5-6                                                                                                                         |
| SC-10 | 이메일, 전체 기록 건수          | `COUNT(*)` 저장된 모든 행 (D10)                                                                                             |

- 기간은 시작 달 1일 ~ 끝 달 말일. 검색 "전체 기간"은 가장 오래된 기록 ~ 이번 달 말일.
- 대소문자 무시는 `ILIKE`가 맡는다. 일치 부분 강조와 "내용 일치 줄" 자르기는 클라이언트가 한다.

**제목 추천 목록** (등록 화면을 열 때 한 번 받는다. 앞부분·초성 일치는 클라이언트가 거른다)

| 값              | 계산                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| 제목            | 앞뒤 공백 제거한 제목 그대로 (대소문자 구분)                            |
| 사용 횟수       | 그 제목을 쓴 **묶음 수**: `COUNT(DISTINCT COALESCE(seriesId, id))` (D6) |
| 마지막 사용     | 그 제목을 쓴 행의 가장 늦은 `createdAt`                                 |
| 마지막 카테고리 | 마지막 사용 행의 카테고리                                               |
| 대상            | 사용 횟수 2 이상. 사용 횟수 → 마지막 사용 순으로 최대 300개             |

## 7. Prisma 스키마 초안

4단계에서 파일로 옮기며, Better Auth 테이블은 Better Auth CLI가 만드는 정의를 그대로 붙인다. CHECK 제약은 Prisma가 표현하지 못해 마이그레이션 SQL에 직접 쓴다.

```prisma
enum Category {
  FOOD
  APPLIANCE
  TRANSPORT
  MEDICAL
  CLOTHING
  BEAUTY
  CULTURE
  EDUCATION
  LIVING
  ETC
}

enum SeriesType {
  RECURRING
  INSTALLMENT
}

model Expense {
  id        String   @id @db.Uuid            // 앱에서 UUID v7 생성
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  title     String
  content   String?
  category  Category
  amount    Int
  seriesId  String?  @db.Uuid
  series    Series?  @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  seq       Int?
  createdAt DateTime @default(now()) @db.Timestamptz
  updatedAt DateTime @updatedAt @db.Timestamptz

  @@index([userId, date])
  @@unique([seriesId, seq])
}

model Series {
  id               String     @id @db.Uuid
  userId           String
  user             User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  type             SeriesType
  billingDay       Int        @db.SmallInt
  isContinuous     Boolean    @default(false)
  totalCount       Int?       @db.SmallInt
  installmentTotal Int?
  generatedUntil   DateTime?  @db.Date
  createdAt        DateTime   @default(now()) @db.Timestamptz
  updatedAt        DateTime   @updatedAt @db.Timestamptz
  expenses         Expense[]

  @@index([userId])
  @@index([isContinuous, generatedUntil])
}
```

```sql
-- 마이그레이션에 덧붙일 CHECK
ALTER TABLE "Expense" ADD CONSTRAINT expense_amount_range CHECK (amount BETWEEN 1 AND 999999999);
ALTER TABLE "Expense" ADD CONSTRAINT expense_series_pair CHECK (("seriesId" IS NULL) = (seq IS NULL));
ALTER TABLE "Series"  ADD CONSTRAINT series_billing_day CHECK ("billingDay" BETWEEN 1 AND 31);
```

## 8. API

모두 로그인이 필요하다. 세션이 없으면 401 → 화면은 `/login?next=…&reason=expired`로 보낸다(화면 명세 RT). 응답 본문은 JSON.

### 8-1. 목록

| 메서드 · 경로                 | 요청                                                                 | 응답                                                                       | 화면              |
| ----------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------- |
| `GET /api/me`                 | –                                                                    | `{ email, oldestYear, totalCount }`                                        | 공통, SC-10       |
| `DELETE /api/me`              | –                                                                    | 204                                                                        | SC-10 탈퇴        |
| `GET /api/calendar`           | `month=YYYY-MM`                                                      | `{ total, days: [{ date, total }] }`                                       | SC-03             |
| `GET /api/expenses`           | `date=YYYY-MM-DD`                                                    | `{ items }` (등록 순, 페이지 없음)                                         | SC-03 하루 목록   |
| `GET /api/expenses`           | `from`, `to`(YYYY-MM), `category?`, `sort=latest\|amount`, `cursor?` | `{ items, nextCursor }`                                                    | SC-04 목록        |
| `GET /api/stats`              | `from`, `to`                                                         | `{ total, count, categories: [{ category, total, count }] }`               | SC-04             |
| `GET /api/search`             | `q`, `from`·`to` 또는 `period=all`, `cursor?`                        | `{ items, nextCursor, summary: { total, count } }` (`summary`는 첫 장에만) | SC-05             |
| `GET /api/titles`             | –                                                                    | `{ titles: [{ title, uses, lastUsedAt, lastCategory }] }`                  | SC-06             |
| `GET /api/expenses/:id`       | –                                                                    | `{ expense, series? }`                                                     | SC-06 수정, SC-08 |
| `POST /api/expenses`          | 아래                                                                 | `{ id, date }`                                                             | SC-06 등록        |
| `PATCH /api/expenses/:id`     | 바꾼 필드 + `scope`                                                  | `{ updated }` (바뀐 건수)                                                  | SC-06 → SC-09     |
| `DELETE /api/expenses/:id`    | `scope`                                                              | `{ deleted }`                                                              | SC-08 → SC-09     |
| `GET /api/expenses/:id/scope` | `scope`, `n?`, `date?` (바꾼 날짜)                                   | `{ remaining, affected: { count, fromMonth, toMonth, continuous } }`       | SC-09 미리보기    |
| `POST /api/cron/extend`       | 헤더 `Authorization: Bearer CRON_SECRET`                             | `{ series, created }`                                                      | 정기 작업         |

- 목록 항목: `{ id, date, title, category, amount, content?, series?: { type, seq, totalCount } }`. 검색에는 `content`를 넣고, 다른 목록에는 넣지 않는다.
- `scope`: `{ type: "one" | "after" | "count", n? }`. 반복 없는 기록은 `one`만.

### 8-2. 등록 요청

```json
{
  "date": "2026-10-31",
  "title": "넷플릭스",
  "category": "LIVING",
  "amount": 13300,
  "content": null,
  "repeat": { "type": "recurring", "months": 6 }
}
```

- `repeat`: `{ "type": "none" }` · `{ "type": "recurring", "months": 2~99 }` · `{ "type": "recurring", "continuous": true }` · `{ "type": "installment", "count": 2~99, "basis": "perCount" | "total" }`
- 할부 총액 기준이면 `amount`가 총액이다. 총액 < 회차 수면 400.

### 8-3. 오류

| 상태 | 언제                       | 본문                                                       | 화면 처리                                                                 |
| ---- | -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| 400  | 검증 실패                  | `{ code: "VALIDATION", fields: { title: "REQUIRED", … } }` | 서버 검증은 클라이언트와 같아 평소 나오지 않는다. 나오면 저장 실패로 처리 |
| 400  | 고를 수 없는 범위 (5-3)    | `{ code: "SCOPE_NOT_ALLOWED" }`                            | 화면이 미리 막으므로 평소 나오지 않는다. 나오면 저장 실패로 처리          |
| 401  | 세션 없음·만료             | `{ code: "UNAUTHORIZED" }`                                 | 로그인으로                                                                |
| 404  | 없는 기록 (남의 기록 포함) | `{ code: "NOT_FOUND" }`                                    | "이미 삭제된 기록입니다"                                                  |
| 500  | 그 밖                      | `{ code: "INTERNAL" }`                                     | 저장·삭제 실패 다이얼로그, 조회 실패                                      |

### 8-4. 클라이언트 캐시 (TanStack Query)

| 쿼리 키                              | API                           |
| ------------------------------------ | ----------------------------- |
| `["me"]`                             | `/api/me`                     |
| `["calendar", month]`                | `/api/calendar`               |
| `["day", date]`                      | `/api/expenses?date=`         |
| `["stats", from, to]`                | `/api/stats`                  |
| `["list", from, to, category, sort]` | `/api/expenses?from=…` (무한) |
| `["search", q, period]`              | `/api/search` (무한)          |
| `["titles"]`                         | `/api/titles`                 |
| `["expense", id]`                    | `/api/expenses/:id`           |

- 등록·수정·삭제가 성공하면 `me`, `calendar`, `day`, `stats`, `list`, `search`, `titles`, `expense`를 모두 무효화한다. 범위 수정은 여러 달에 걸치므로 키를 골라 지우지 않는다.

## 9. 탈퇴

- `DELETE /api/me`: 한 트랜잭션에서 사용자를 지운다. Expense·Series·Session·Account는 CASCADE로 함께 지워진다. 일부만 지워진 상태는 생기지 않는다.
- 끝나면 세션 쿠키를 지우고 `/login?reason=withdrawn`으로 보낸다.
- Google 계정 연결 해제(토큰 취소)는 하지 않는다. 다시 로그인하면 새 계정이 만들어진다.

## 10. 구버전 데이터 이전 (D9)

**구버전 문서 형태** (Firestore `expend` 컬렉션)

| 필드       | 형태                    | 옮길 곳                                                         |
| ---------- | ----------------------- | --------------------------------------------------------------- |
| `title`    | 문자열                  | `title` (앞뒤 공백 제거)                                        |
| `content`  | 문자열 (빈 문자열 가능) | `content` (빈 문자열이면 `null`)                                |
| `category` | 한글 9종                | 학비 → `EDUCATION`, 문화생활 → `CULTURE`, 나머지 7개는 이름대로 |
| `date`     | `YYYY-MM-DD` 문자열     | `date`                                                          |
| `price`    | 숫자 문자열             | `amount` (정수로)                                               |
| `username` | 표시 이름               | 본인 문서를 고르는 데만 쓴다                                    |

**절차**

1. 새 서비스에 Google로 가입한다 (이전 대상 계정 생성).
2. **내보내기** (로컬에서 1번): Firebase Admin SDK로 `username == 본인 표시 이름`인 문서를 JSON으로 저장한다. 서비스 계정 키는 Firebase 콘솔에서 발급해 저장소 밖에 두고 경로를 환경 변수로 넘긴다. 결과 JSON도 저장소에 넣지 않는다.
3. **확인 실행**: 이전 스크립트를 `--dry-run`으로 돌려 건수, 월별 합계, 변환하지 못한 문서(금액이 숫자가 아님, 제목 25자 초과, 날짜 형식 오류 등)를 출력한다.
4. **이전**: 문제가 없으면 한 트랜잭션으로 넣는다. 모두 반복 없는 기록(`seriesId = null`)이다. 대상 계정에 이미 기록이 있으면 멈춘다 (두 번 넣지 않기).
5. **대조**: 구버전과 새 서비스의 월별 건수·합계를 비교한다.
6. 이전이 끝나면 구버전 Firebase 프로젝트를 닫거나 키를 교체한다 (구버전 `main` 브랜치에 `.env`가 커밋된 적이 있다).

스크립트는 `scripts/migrate-legacy/`에 두고 4단계에서 만든다.
