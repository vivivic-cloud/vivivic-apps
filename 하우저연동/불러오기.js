/* 화면 글을 깃허브에서 바로 불러온다(벤더피아연동 `불러오기.js` 와 같은 방식). 고쳐도 확장을 덮어쓸 필요 없이 새로고침만 하면 된다.
   못 받으면 확장 안 같은 이름 파일로 돈다(bg.js). 그래도 안 되면 붉은 줄.
   ⚠ 하우저 아이디·비밀번호·쿠키는 읽지도 저장하지도 않는다. 이 글은 어느 화면에 어느 글을 보낼지만 정한다. */
(() => {
  const 길 = location.pathname.replace(/\/+$/, "") || "/";
  const 판 = chrome.runtime.getManifest().version;
  let 글 = [];
  if (길 === "/login") 글 = ["login.css", "login.js"];
  else if (길 === "/home" || 길 === "/" || 길 === "/order/all") 글 = ["menu.css", "menu.js"];
  else if (길 === "/storage/inventory/list") 글 = ["표.css", "표.js", "inventory.js"];
  else if (길 === "/product/home") 글 = ["표.css", "표.js", "product.js"];
  if (!글.length) return;
  document.documentElement.setAttribute("data-hw-판", 판);
  /* 0.6.0 다리: 페이지 쪽 글(product.js)이 벤더피아 자료를 달라고 하면 배경(bg.js)에 묻고 답을 돌려준다. 읽기만. */
  if (길 === "/product/home") window.addEventListener("message", (e) => {
    const m = e.data;
    if (e.source !== window || !m || m.__hw !== "벤더피아요청" || typeof m.id !== "string") return;
    chrome.runtime.sendMessage({ __hw: "벤더피아", 목록: Array.isArray(m.목록) ? m.목록 : [] }, (r) => {
      window.postMessage({ __hw: "벤더피아답", id: m.id, 답: (!chrome.runtime.lastError && r) || { ok: false, 까닭: "확장 배경이 답 없음" } }, "*");
    });
  });
  chrome.runtime.sendMessage({ __hw: "글", 목록: 글 }, (r) => {
    const 결과 = (!chrome.runtime.lastError && r && r.결과) || {};
    const 못 = 글.filter((f) => !/^(깃|이미|확장)/.test(결과[f] || ""));
    const 확장것 = 글.filter((f) => /^확장/.test(결과[f] || ""));
    document.documentElement.setAttribute("data-hw-어디", 확장것.length ? "확장" : "깃");
    if (!못.length) return;
    const 줄 = document.createElement("div");
    줄.textContent = "하우저 보기 — 화면 글을 못 불렀습니다 (" + 못.join(", ") + "). 바이글에게 알려 주세요.";
    줄.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#c92a2a;color:#fff;font:600 13px/1.5 sans-serif;padding:8px 12px;text-align:center";
    document.documentElement.appendChild(줄);
  });
})();
