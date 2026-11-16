/* 단품받기.html(화면 없는 문서)의 앞 글 — vp-data.js 가 이 문서에서도 단품관리 화면과 똑같이 돌게 두 가지를 맞춘다. (11-16 [단품다리], 0.35.0)
   ① vp-data.js 는 벤더피아 주소를 `/System/…` 처럼 앞을 떼고 묻는다(벤더피아 쪽에서 돌기 때문). 여기는 확장 문서라
      앞이 `/` 인 주소만 `https://vendorpia.com` 을 붙여 묻는다. 쿠키는 vp-data.js 가 시키는 대로(`credentials:"include"`) — 사장님 크롬의 벤더피아 로그인 그대로.
   ② 이 문서에는 chrome.storage 가 없다(화면 없는 문서는 chrome.runtime 만). 그래서 저장다리.js 와 같은 모양의 `window.VP저장` 을
      배경 글(bg.js)에 묻는 것으로 만든다 → 단품관리 화면과 **같은 열쇠·같은 꼴**(`vpCache:…`)로 같은 곳에 담긴다. */
(() => {
  const 벤더피아 = "https://vendorpia.com";
  const 원래 = window.fetch.bind(window);
  window.fetch = (주소, 옵션) => 원래(typeof 주소 === "string" && 주소.startsWith("/") && !주소.startsWith("//") ? 벤더피아 + 주소 : 주소, 옵션);
  const 묻기 = (일, 열쇠, 값) => new Promise((풀) => {
    try {
      chrome.runtime.sendMessage({ __vp: "단품받기저장", 일, 열쇠, 값 }, (답) => { void chrome.runtime.lastError; 풀(답 == null ? null : 답); });
    } catch (e) { 풀(null); }
  });
  window.VP저장 = {
    get: (열쇠) => 묻기("get", 열쇠 === undefined ? null : 열쇠).then((r) => r || {}),
    set: (값) => 묻기("set", null, 값),
    remove: (열쇠) => 묻기("remove", 열쇠),
  };
})();
