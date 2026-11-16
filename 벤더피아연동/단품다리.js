/* 발주역입력 재단(vivivic-apps/발주역입력/) 쪽 다리 — 벤더피아연동 **단품관리 목록**을 그 페이지에 건넨다. (11-16 [단품다리], 0.35.0)
   사장님: 「벤더피아 아이디로 로그인하게 하고, 벤더피아연동의 단품관리 페이지에 따라서 연동되어 검색되도록 해 주세요.」
   · 확장이 다리를 갖고 있다는 표 `data-벤더피아단품="판"` 을 문서 뿌리에 단다(document_start — 페이지 글보다 먼저).
   · 페이지가 `postMessage({__vp:"단품목록", 표, 다시})` 로 물으면 배경 글(bg.js `단품목록주기`)에 물어
     `{__vp:"단품목록답", 표, 답}` 으로 건넨다. 답 = { 로그인, 까닭, 판, 받은때, 줄:[[단품코드, 단품명, 판매상태], …] }.
   ⚠ 건네는 것은 로그인 여부·까닭과 **단품 세 칸**뿐 — 쿠키·비밀번호·금액·매입처는 안 건넨다.
     자료는 사장님 크롬 안(확장 → 이 탭의 페이지)에서만 오간다. 페이지는 창고·바깥에 쓰지 않는다.
   ⚠ 이 파일은 확장 안이다. 고치면 판 올리고 **덮어쓰기 필요**. */
(() => {
  if (!decodeURIComponent(location.pathname).startsWith("/vivivic-apps/발주역입력/")) return;
  try { document.documentElement.setAttribute("data-벤더피아단품", chrome.runtime.getManifest().version); } catch (e) { return; }
  addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "단품목록") return;
    const 표 = e.data.표;
    const 답하기 = (답) => window.postMessage({ __vp: "단품목록답", 표, 답 }, location.origin);
    try {
      chrome.runtime.sendMessage({ __vp: "단품목록", 다시: !!e.data.다시 }, (답) => {
        const 탈 = chrome.runtime.lastError;
        답하기(답 || { 로그인: null, 까닭: 탈 ? "확장 답 없음" : "답 빔" });
      });
    } catch (err) {
      // 확장을 덮어쓴 뒤 새로고침 전이면 여기로 온다
      답하기({ 로그인: null, 까닭: "확장 새로고침 필요" });
    }
  });
})();
