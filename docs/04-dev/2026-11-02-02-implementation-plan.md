# 구현 계획

5단계(기능 단위 개발)의 기능 순서와 완료 기준이다. 개발 준비(`2026-11-02-01-dev-setup.md`)가 끝난 뒤 시작한다.

## 1. 진행 방식

기능마다 CLAUDE.md의 순서를 따른다.

1. **스펙**: 화면 명세·와이어프레임·데이터 아키텍처에서 그 기능의 범위를 뽑아 확인받는다
2. **계획**: 작업 단위와 테스트 목록. 테스트는 스펙에서 뽑은 명세 항목마다 만든다
3. **TDD**: 테스트 먼저, 구현, 리팩터링
4. **리뷰**: 명세 대조(스펙 문서와 변경 코드를 나란히 놓고 확인) → 사용자 리뷰 → 커밋 (사용자 요청 시)

모든 기능의 공통 완료 기준: `lint`, `typecheck`, `test`(해당 시 `test:db`) 통과, 라이트·다크 모두 확인, 와이어프레임의 모든 상태(빈·로딩·오류 포함) 구현.

## 2. 기능 순서

| 순서 | 기능                  | 화면                | 완료 기준                                                                                                                                      |
| ---- | --------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| F0   | 앱 틀                 | SC-01, CG, CM       | 레이아웃, 탭 바(＋ 버튼), 헤더, 공통 컴포넌트(버튼 8종·입력·시트·다이얼로그·드롭다운·칩·세그먼트), 공통 상태(스켈레톤·조회 실패·띠), 다크 모드 |
| F1   | 로그인·세션           | SC-02, RT           | Google 로그인, 로그아웃, 세션 만료 리다이렉트(`next`, `reason`), 401 처리                                                                      |
| F2   | 지출 등록 (반복 없음) | SC-06               | 등록·검증(글자 수·금액)·제목 추천, 저장 완료 알림 후 폼 초기화                                                                                 |
| F3   | 월간 달력             | SC-03               | 6줄 달력, 날짜별·월 합계, 금액 축약, 스와이프·연월 선택·[오늘], 하루 목록, 선택 가능 연도                                                      |
| F4   | 상세·수정·삭제        | SC-08, SC-06 수정   | 상세 시트(`?expense=`), 수정, 삭제 확인, 404 처리                                                                                              |
| F5   | 계산기                | SC-07               | 사칙·1/n·끝전 처리, 계산식 내용 기록, 200자 초과 처리                                                                                          |
| F6   | 반복 기록             | SC-06, SC-08, SC-09 | 정기·할부 생성, 범위 수정·삭제(D11 포함), 미리보기, 연장(조회 직전 + 정기 작업 `/api/cron/extend`)                                             |
| F7   | 카테고리별            | SC-04               | 기간 드롭다운·기간 시트, 비중 막대, 필터 칩, 정렬, 무한 스크롤                                                                                 |
| F8   | 검색                  | SC-05               | 자동 검색, 기간, 강조·내용 일치 줄, 결과 요약, 무한 스크롤                                                                                     |
| F9   | 설정·탈퇴             | SC-10               | 화면 모드, 로그아웃, 탈퇴(건수 안내·확인·트랜잭션)                                                                                             |
| F10  | 404·오프라인·PWA      | SC-11, CM           | 404, 오프라인 띠·저장 비활성, manifest·아이콘·서비스 워커                                                                                      |
| F11  | 구버전 데이터 이전    | –                   | 내보내기·확인 실행·이전·월별 대조 스크립트 (데이터 아키텍처 10장)                                                                              |
| F12  | 배포                  | –                   | Vercel, Neon `production` 브랜치 마이그레이션, Cron, OAuth 운영 주소, 구버전 Firebase 정리 안내                                                |

- F0은 세 단계로 나눠 단계마다 스펙 → 계획 → TDD → 리뷰를 거친다: F0-1 레이아웃·탭 바·다크 모드 기반, F0-2 공통 컴포넌트, F0-3 공통 상태.
- F2~F4를 먼저 끝내면 반복 없는 기록으로 기본 흐름이 처음부터 끝까지 동작한다. 반복 기록(F6)은 그 위에 올린다.
- 각 기능의 세부 계획은 그 기능을 시작할 때 이 문서에 이어 쓰지 않고, 기능 스펙 확인 단계에서 사용자와 정한다.

## 3. 진행 상황

- [x] F0-1 레이아웃·탭 바·다크 모드 기반 (`(tabs)` 레이아웃, `TabBar`, `PageHeader`, 화면 모드 쿠키, 탭별 마지막 주소 기억, [뒤로]는 앱 안 이동 기록이 없으면 달력으로)
- [x] F0-2 공통 컴포넌트
  - [x] F0-2a 기본 조각 (`Button`·`IconButton`·`Spinner`, `TextInput`·`TextArea`·`NumberInput`, `Segment`·`Chip`·`Checkbox`·`Radio`, `lib/text.ts`·`lib/cn.ts`, 견본 화면 `/dev/components`)
  - [x] F0-2b 겹쳐 뜨는 것·목록 (`BottomSheet`·`Dialog`·`Dropdown`, `ListItem`·`Badge`, 뒤로 가기 공통 처리 `useHistoryLayer`)
- [x] F0-3 공통 상태 (`components/states/`의 스켈레톤·`LoadError`·`RefreshErrorBar`·`LoadMoreStatus`·`EmptyState`, `AlertDialog`, TanStack Query 연결 `states/tanstackQuery/`의 `QueryProvider`·`queryClient.ts`, 영역 상태 판단 `lib/queryView.ts`의 `getQueryView`)
- [x] F1 로그인·세션 (SC-02 로그인 화면 `LoginForm`·`Logo`, 안내 문구 `lib/authUtils.ts`의 `handleLoginNotice`, 공통 요청 `api/apiClient.ts`의 `apiFetch`·`ApiError`, 401이면 QueryClient가 `/login?reason=expired`로, 임시 [로그아웃] `SignOutButton`)
- [x] F2 지출 등록 (SC-06 등록 폼 `ExpenseForm`·`CategoryGrid`·`DatePickerSheet`·`TitleSuggestions`, 6줄 달력 격자 `MonthGrid`, 카테고리 아이콘 `CategoryIcon`, 폼 상태 `useExpenseForm`·작성 중 나가기 `useLeaveGuard`, 제목 추천 비교 `lib/hangul.ts`, `POST /api/expenses`(반복 없음)·`GET /api/titles`, 검증 `shared/expenseSchema.ts`)
- [x] F3 월간 달력 (SC-03 `CalendarView`·`CalendarHeader`·`DayExpenseList`, 연·월 선택 `MonthPickerSheet`·`MonthPickerGrid`(날짜 선택 시트와 같이 씀), 칸 금액 `lib/amount.ts`의 `formatCalendarAmount`, URL 상태 `useCalendarQuery`·쿼리 정리 `lib/resolveCalendarQuery.ts`, 스와이프 `useMonthSwipe`, `GET /api/calendar`·`GET /api/expenses?date=`·`GET /api/me`)
- [x] F4 상세·수정·삭제 (SC-08 상세 시트 `ExpenseDetailSheet`(쿼리 `expense`, `useExpenseSheetQuery`), 반복 정보 `lib/expenseDetailUtils.ts`, SC-06 수정 `/expenses/[id]/edit`·`EditExpenseView`, 바꾼 필드만 보내기 `lib/updateExpense.ts`, `GET`·`PATCH`·`DELETE /api/expenses/:id`(범위는 이 건만), 무효화 공통 `invalidateExpenseQueries`, 404는 다시 시도하지 않음)
- [x] F5 계산기 (SC-07 `CalculatorSheet`, 식·끝전 처리·계산식 줄 `lib/calculatorUtils.ts`(분수 BigInt 계산), 상태 `useCalculator`, 금액 칸 [계산] `TextInput`의 `action`, 규칙 `CALCULATOR_RULES`)
- [x] F6 반복 기록
  - [x] F6-1 반복 등록·연장 (SC-06 반복 입력 `RepeatFields`·미리보기, 달·결제일·할부 금액 `lib/seriesUtils.ts`, `POST /api/expenses`의 `repeat`, 연장 `server/seriesService.ts`의 `extendContinuousSeries`(달력·하루 목록 조회 직전), 정기 작업 `GET /api/cron/extend`, 수정 화면 반복 잠금, 규칙 `SERIES_RULES`)
  - [x] F6-2 범위 수정·삭제 (SC-09 `ScopeFields`·상태 `useScopeSelection`, 수정 `ScopeEditSheet`, 삭제는 상세 시트 안에서 전환, 달 차이 판단·미리보기 문구 `lib/scopeUtils.ts`, `server/scopeService.ts`의 범위 수정(D11)·삭제·미리보기, `GET /api/expenses/:id/scope`·`useScopePreview`, 반복 문구 `REPEAT_TEXTS` 하나로 정리)
- [ ] F7 카테고리별
  - [x] F7-1 기간·요약·비중 (SC-04 `CategoriesView`, 기간 드롭다운 `PeriodDropdown`·기간 선택 시트 `PeriodPickerSheet`(SC-05와 같이 씀, 월 격자는 `MonthPickerGrid`의 기간 표시), 빠른 선택·라벨·한도 `lib/periodUtils.ts`, 쿼리 정리·비중 `lib/categoriesUtils.ts`, URL 상태 `useCategoriesQuery`, 비중 그래프 `CategoryShareChart`, `GET /api/stats`·`server/statsService.ts`(조회 직전 연장), 규칙 `CATEGORY_PERIOD_RULES`·`LIST_RULES`, 기간 문구 `PERIOD_TEXTS`)
  - [ ] F7-2 필터 칩·목록·정렬·무한 스크롤 ← 다음
- [ ] F8 ~ F12

미뤄 둔 작업:

| 시점              | 작업                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| F7-2·F8           | 카테고리별 목록·검색(직접 지정 기간) 조회 전에 `extendContinuousSeries({ userId, untilMonth })`로 그 기간의 끝 달까지 연장한다 (데이터 아키텍처 5-4) |
| F12               | Vercel Cron에 `GET /api/cron/extend`를 하루 1번으로 등록한다                                                                                         |
| F10               | 오프라인이면 등록 폼 [저장]을 막는다                                                                                                                 |
| F9                | 설정 화면의 임시 [로그아웃](`SignOutButton`)을 SC-10 배치로 옮긴다                                                                                   |
| F10               | 오프라인 띠를 `(tabs)` 레이아웃의 자리 표시 주석 위치에 넣는다                                                                                       |
| F12               | pnpm 12로 올릴지 정한다 (Vercel·GitHub Actions 지원 확인 후. pnpm 10 지원은 2027년 4월까지)                                                          |
| 견본 화면 삭제 시 | `/dev/components`를 없앨 때 로그인 없이 여는 처리도 지운다: `PATHS.devComponents`, `proxy.ts`의 통과 조건, `proxy.test.ts`의 해당 테스트             |
| 사용자            | `.env`의 Neon 주소 두 개를 `sslmode=verify-full`로 바꾸면 `pg`의 SSL 경고가 없어진다                                                                 |
