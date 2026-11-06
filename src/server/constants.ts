// 서버에서만 쓰는 상수. 화면에서도 쓰는 정책값은 src/shared에 둔다.

const DAY = 60 * 60 * 24;

/** 세션: 30일 동안 쓰지 않으면 만료, 쓰는 동안은 하루에 한 번 만료일을 늘린다 (데이터 아키텍처 4-5). 초 단위 */
export const SESSION_EXPIRES_IN = 30 * DAY;
export const SESSION_UPDATE_AGE = DAY;
