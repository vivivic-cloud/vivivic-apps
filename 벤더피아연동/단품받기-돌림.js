/* 단품받기.html 의 뒤 글 — 배경 글이 「받아라」 하면 단품관리 목록을 받는다. (11-16 [단품다리], 0.35.0)
   조건은 단품관리 미리 받기(vp-data.js `prefetchAll` 첫 줄)와 **같다**: PAGES["/System/Master/goods.aspx"], 판매상태 전체(""), 등록기간 2000-01-01 ~ 오늘.
   → 저장 열쇠도 같다(`vpCache:/System/Master/goods.aspx|단품명|{}||2000-01-01|<오늘>`). 단품관리 화면을 열면 이것이 바로 나온다(반대도).
   ⚠ 벤더피아에는 조회(GET·검색 POST)만 한다 — 단품관리 화면이 하는 그대로. 쓰지 않는다. */
chrome.runtime.onMessage.addListener((m, 보낸이, 답) => {
  if (!m || m.__vp !== "단품받기시작" || 보낸이.id !== chrome.runtime.id) return;
  const 주소 = "/System/Master/goods.aspx";
  (async () => {
    try {
      await VP_DATA.list(VP_DATA.PAGES[주소], 주소, "", { from: "2000-01-01" }, () => {}, undefined, null, false);
      답({ 됨: true });
    } catch (e) {
      답({ 됨: false, 까닭: String(e && e.message || e).slice(0, 80) });
    }
  })();
  return true;
});
