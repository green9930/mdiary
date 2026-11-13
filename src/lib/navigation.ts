/**
 * 페이지를 새로 불러오며 이동한다. 로그아웃·세션 만료처럼 화면에 남은 데이터(조회 캐시 등)를
 * 모두 버려야 할 때 쓴다. 그 밖의 이동은 Next의 router를 쓴다
 */
export const hardNavigate = (path: string) => {
  window.location.assign(path);
};
