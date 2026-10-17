# 데이터 아키텍처

## 기술 스택

- **ORM**: Prisma 7.x (`@prisma/client` + `@prisma/adapter-pg`)
- **Database**: PostgreSQL 16
- **Auth**: Google Firebase Authentication
- **Runtime**: Node.js v24+
- **Client 출력 경로**: `src/generated/prisma/` (gitignore 대상, `npx prisma generate`로 생성)

---

## ERD (Entity Relationship Diagram)

```
┌───────────────────────────────┐
│            User               │
├───────────────────────────────┤
│ id          String (PK)       │
│ email       String (UNIQUE)   │──────────────────────────────────────────────┐
│ name        String            │                                              │
│ createdAt   DateTime          │                                              │
│ updatedAt   DateTime          │                                              │
└───────────────────────────────┘                                              │
        │                                                                      │
        │ 1:N                                                                  │ 1:N
        ▼                                                                      ▼
┌───────────────────────────────┐       ┌───────────────────────────────────────────┐
│          Expense              │       │           ExpenseGroup                    │
├───────────────────────────────┤       ├───────────────────────────────────────────┤
│ id          String (PK)       │       │ id             String (PK)               │
│ title       String            │       │ type           GroupType (ENUM)           │
│ content     String?           │       │ title          String                    │
│ category    Category (ENUM)   │       │ content        String?                   │
│ date        DateTime          │       │ category       Category (ENUM)           │
│ amount      Int               │       │ amount         Int                       │
│ userId      String (FK→User)  │       │ billingDay     Int (1~31)                │
│ groupId     String? (FK→Group)│──────>│ totalCount     Int?                      │
│ installmentNumber  Int?       │       │ isContinuous   Boolean                   │
│ createdAt   DateTime          │       │ startDate      DateTime                  │
│ updatedAt   DateTime          │       │ endDate        DateTime?                 │
├───────────────────────────────┤       │ userId         String (FK→User)          │
│ INDEX: userId                 │       │ createdAt      DateTime                  │
│ INDEX: date                   │       │ updatedAt      DateTime                  │
│ INDEX: groupId                │       ├───────────────────────────────────────────┤
└───────────────────────────────┘       │ INDEX: userId                            │
                                        └───────────────────────────────────────────┘
```

### 관계 요약

| 관계 | 설명 |
|------|------|
| User 1 : N Expense | 한 유저가 여러 지출 내역을 가짐 |
| User 1 : N ExpenseGroup | 한 유저가 여러 정기지출/할부 그룹을 가짐 |
| ExpenseGroup 1 : N Expense | 하나의 그룹이 여러 개별 지출 레코드를 생성함 |

---

## Enum 정의

### Category (지출 카테고리)

```
APPLIANCE    가전
TRANSPORT    교통
CULTURE      문화생활
BEAUTY       미용
FOOD         식비
MEDICAL      의료
CLOTHING     의류
EDUCATION    교육
ETC          기타
```

### GroupType (그룹 유형)

```
RECURRING     정기 지출
INSTALLMENT   할부
```

---

## 모델 상세

### User

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | String | PK, `cuid()` | 고유 식별자 |
| `email` | String | UNIQUE | Google 계정 이메일 |
| `name` | String | NOT NULL | 계정명 (Account Setting에서 표시) |
| `createdAt` | DateTime | `now()` | 생성 시각 |
| `updatedAt` | DateTime | `@updatedAt` | 수정 시각 |

### Expense

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | String | PK, `cuid()` | 고유 식별자 |
| `title` | String | NOT NULL | 지출 제목 |
| `content` | String? | nullable | 지출 상세 내용 (선택 입력) |
| `category` | Category | NOT NULL | 지출 카테고리 (ENUM) |
| `date` | DateTime | NOT NULL | 지출 발생 일자 |
| `amount` | Int | NOT NULL | 지출 금액 (원 단위) |
| `userId` | String | FK → User.id | 지출 소유 유저 |
| `groupId` | String? | FK → ExpenseGroup.id, nullable | 소속 그룹 (null이면 일반 지출) |
| `installmentNumber` | Int? | nullable | 할부 현재 회차 (할부일 때만 사용) |
| `createdAt` | DateTime | `now()` | 생성 시각 |
| `updatedAt` | DateTime | `@updatedAt` | 수정 시각 |

### ExpenseGroup

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | String | PK, `cuid()` | 고유 식별자 |
| `type` | GroupType | NOT NULL | RECURRING(정기) 또는 INSTALLMENT(할부) |
| `title` | String | NOT NULL | 지출 제목 (소속 Expense에 복사됨) |
| `content` | String? | nullable | 지출 내용 |
| `category` | Category | NOT NULL | 지출 카테고리 |
| `amount` | Int | NOT NULL | 매월 지출 금액 |
| `billingDay` | Int | NOT NULL, 1~31 | 매달 결제일 |
| `totalCount` | Int? | nullable | 총 회차 (정기지출 n회 / 할부 총 회차) |
| `isContinuous` | Boolean | default: false | 계속 결제 여부 (true 시 10년간 생성) |
| `startDate` | DateTime | NOT NULL | 시작일 |
| `endDate` | DateTime? | nullable | 종료일 (계속 결제 시 startDate + 10년) |
| `userId` | String | FK → User.id | 소유 유저 |
| `createdAt` | DateTime | `now()` | 생성 시각 |
| `updatedAt` | DateTime | `@updatedAt` | 수정 시각 |

---

## 정기지출 / 할부 설계 상세

### 핵심 설계 결정: 실체화(Materialized) 방식

정기지출과 할부는 **ExpenseGroup을 템플릿으로, 개별 Expense 레코드를 실체화하여 생성**하는 방식을 사용한다.

```
[ExpenseGroup]                    [Expense 레코드들]
 type: INSTALLMENT                 ┌─ 1회차 (2026-03) ✓
 title: "노트북 할부"               ├─ 2회차 (2026-04) ✓
 amount: 200000                    ├─ 3회차 (2026-05)  ← 현재
 billingDay: 15                    ├─ ...
 totalCount: 12                    └─ 12회차 (2027-02)
```

#### 이 방식을 선택한 이유

| 요구사항 | 실체화 방식의 대응 |
|----------|---------------------|
| 캘린더에서 날짜별 지출 조회 | Expense 테이블을 date로 조회하면 끝 (추가 계산 불필요) |
| 개별 건 수정/삭제 | 독립된 레코드이므로 그대로 UPDATE/DELETE |
| "향후 결제 삭제" | `groupId`와 `date > now()`로 일괄 삭제 |
| 월별/연간 합산 | Expense 테이블만 SUM하면 됨 |
| 할부 회차 표시 | `installmentNumber` 필드로 바로 표시 |

#### 정기 지출 생성 흐름

1. 유저가 정기 지출 정보 입력 (매달 N일, M회 또는 계속 결제)
2. `ExpenseGroup` 레코드 생성 (type: RECURRING)
3. 지출 횟수만큼 `Expense` 레코드를 일괄 생성
   - 계속 결제: startDate 기준 10년치 (최대 120건)
   - N회 지정: N건 생성
4. 각 Expense의 `date`는 해당 월의 billingDay로 설정
   - 해당 월에 billingDay가 없는 경우 (예: 2월 30일) → 해당 월의 마지막 날로 설정

#### 할부 생성 흐름

1. 유저가 할부 정보 입력
2. `ExpenseGroup` 레코드 생성 (type: INSTALLMENT)
3. 총 회차만큼 `Expense` 레코드를 일괄 생성
   - 각 레코드에 `installmentNumber` (1, 2, 3, ...) 부여

#### 삭제 시나리오

| 시나리오 | 처리 |
|----------|------|
| 일반 지출 삭제 | 해당 Expense 1건 DELETE |
| 정기/할부 개별 건 삭제 | 해당 Expense 1건 DELETE (그룹은 유지) |
| 정기/할부 향후 전체 삭제 | `groupId = X AND date >= 선택일`인 Expense 일괄 DELETE |
| 정기/할부 전체 삭제 | 해당 groupId의 Expense 전체 DELETE + ExpenseGroup DELETE |

---

## 인덱스 전략

| 인덱스 | 테이블 | 용도 |
|--------|--------|------|
| `userId` | Expense | 유저별 지출 조회 |
| `date` | Expense | 날짜별/월별 캘린더 조회 |
| `groupId` | Expense | 그룹 소속 지출 일괄 조회/삭제 |
| `userId` | ExpenseGroup | 유저별 정기/할부 그룹 조회 |

---

## 외래 키 제약

| FK | ON DELETE | 이유 |
|----|-----------|------|
| Expense.userId → User.id | CASCADE | 회원 탈퇴 시 지출 내역 함께 삭제 |
| Expense.groupId → ExpenseGroup.id | SET NULL | 그룹 삭제 시 개별 지출은 일반 지출로 전환 |
| ExpenseGroup.userId → User.id | CASCADE | 회원 탈퇴 시 그룹도 함께 삭제 |

---

## PrismaClient 설정

`src/lib/prisma.ts`에서 싱글톤 패턴으로 관리:

- `@prisma/adapter-pg`를 사용하여 PostgreSQL에 직접 연결
- 개발 모드에서는 `globalThis`에 인스턴스를 저장하여 Next.js Hot Reload 시 중복 생성 방지
- 프로덕션에서는 매번 새 인스턴스 생성

---

## 주요 쿼리 패턴

### 캘린더 월별 조회

특정 월의 모든 지출을 조회하여 캘린더에 표시:

```
WHERE userId = ? AND date >= 월_시작 AND date < 다음월_시작
```

### 연간 지출액 (Account Setting)

접속일 기준 해당 연도 1/1부터 현재까지 합산:

```
WHERE userId = ? AND date >= 올해_1월1일 AND date <= 오늘
→ SUM(amount)
```

### 정기/할부 향후 삭제

```
WHERE groupId = ? AND date >= 선택일
→ DELETE
```
