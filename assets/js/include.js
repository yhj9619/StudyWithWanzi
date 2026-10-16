/**
 * Study with Wanzi - 사이트 전역 공통 인클루드 스크립트
 * - 네이버 애널리틱스 등 웹로그 수집 도구를 한곳에서 통합 관리합니다.
 * - 향후 구글 애널리틱스(GA4), 서치콘솔 등 추가 시 이 파일만 수정하면 모든 페이지에 자동 적용됩니다.
 */
(function () {
  // 로컬 파일(file://)로 열었을 때는 불필요한 네트워크 에러 방지
  if (typeof location !== 'undefined' && location.protocol === 'file:') return;

  // 1. 네이버 애널리틱스 (Naver Analytics)
  try {
    if (!window.wcs_add) window.wcs_add = {};
    window.wcs_add["wa"] = "1c8b0e30c10d180";

    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://wcs.pstatic.net/wcslog.js';
    s.onload = function () {
      if (window.wcs) {
        window.wcs_do();
      }
    };
    var target = document.head || document.documentElement;
    target.appendChild(s);
  } catch (e) {
    console.warn('Analytics loading error:', e);
  }
})();

