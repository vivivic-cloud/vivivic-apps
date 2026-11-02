/* 서류관리(vivivic-docs) 쪽 다리 — 「벤더피아에 로그인돼 있나 · 아이디 · 이름」 만 건넨다. (11-02 [새 지시 서류관리로그인])
   사장님: 「프로그램이 시작되면 벤더피아연동의 로그인이 되어야 서류관리 화면이 열리게 해주세요 …
            사용자의 이름이나 아이디를 헤더에 작게 표기하여 모든 로그인한 작업자가 어떤작업을 했는지 기록되게」.
   · 확장이 깔렸다는 표 `data-벤더피아연동="판"` 을 문서 뿌리에 단다(document_start — 서류관리 글보다 먼저).
   · 서류관리가 `postMessage({__vp:"서류누구"})` 로 물으면 배경 글(bg.js `벤더피아누구`)에 물어 답을 건넨다.
   ⚠ 건네는 것은 로그인 여부·아이디·이름·까닭뿐 — 쿠키·비밀번호·벤더피아 쪽 글은 안 건넨다.
   ⚠ 이 파일은 확장 안이다. 고치면 판 올리고 **덮어쓰기 필요**. */
(() => {
  try { document.documentElement.setAttribute("data-벤더피아연동", chrome.runtime.getManifest().version); } catch (e) { return; }
  addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "서류누구") return;
    const 표 = e.data.표;
    const 답하기 = (답) => window.postMessage({ __vp: "서류누구답", 표, 답 }, location.origin);
    try {
      chrome.runtime.sendMessage({ __vp: "벤더피아누구", 다시: !!e.data.다시 }, (답) => {
        const 탈 = chrome.runtime.lastError;
        답하기(답 || { 로그인: null, 까닭: 탈 ? "확장 답 없음" : "답 빔" });
      });
    } catch (err) {
      // 확장을 덮어쓴 뒤 새로고침 전이면 여기로 온다
      답하기({ 로그인: null, 까닭: "확장 새로고침 필요" });
    }
  });
})();
