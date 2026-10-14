/* 화면 글을 **깃허브에서 바로** 불러온다 — 확장은 얇은 껍데기만 남는다.
   사장님 10-13: 「확장파일을 계속 수정시마다 덮어 써야되는거야?」 → 「1」.
   이제 화면 글을 고치면 **덮어쓰지 않아도** 새로고침만 하면 새것이 돈다.

   ⚠ 못 불러오면(벤더피아가 바깥 글을 막거나 인터넷이 끊기면) **확장 안의 것**으로 돈다.
      그래도 안 되면 붉은 줄을 띄운다 — 조용히 비는 것이 이 집에서 제일 나쁘다.
   ⚠ 글 차례를 지킨다. `vp-data.js` 가 `goods.js` 보다 먼저 돌아야 한다. */
(() => {
  const 깃 = "https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/";
  const 길 = location.pathname.toLowerCase();
  const 있나 = (t) => 길.includes(t);

  const 글 = ["저장다리.js", "vp-data.js", "login.js"];       // 모든 화면
  const 꾸밈 = ["login.css"];
  if (있나("/index.aspx"))        { 글.push("menu.js");   꾸밈.push("menu.css"); }
  if (있나("firmdvlist.aspx"))    { 글.push("search.js"); 꾸밈.push("search.css"); }
  if (있나("goods.aspx") || 있나("salesgoods.aspx") || 있나("stocklist.aspx"))
                                  { 글.push("johon.js", "amt-draw.js", "goods.js"); 꾸밈.push("goods.css"); }
  /* ⚠ 짚개.js 는 여기서 안 넣는다 — **틀(frameset) 안쪽까지** 붙어야 해서 제 자리로 뺐다
     (집 꼴의 all_frames). 10-13 「메인화면에서는 영역만 짚어진다」 가 그 탈이었다. */

  /* ── 저장소 다리 — 바깥에서 온 글이 chrome.storage 를 쓰게 해 준다 ── */
  addEventListener("message", async (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "저장") return;
    let 답 = null;
    try {
      const 통 = chrome.storage.local;
      if (e.data.일 === "get") 답 = await 통.get(e.data.열쇠);
      else if (e.data.일 === "set") { await 통.set(e.data.값); 답 = true; }
      else if (e.data.일 === "remove") { await 통.remove(e.data.열쇠); 답 = true; }
    } catch (err) {}
    window.postMessage({ __vp: "저장답", 표: e.data.표, 답 }, location.origin);
  });

  const 넣기 = (주소) => new Promise((풀) => {
    const s = document.createElement("script");
    s.src = 주소; s.async = false;
    s.onload = () => 풀(true); s.onerror = () => 풀(false);
    (document.head || document.documentElement).appendChild(s);
  });
  const 꾸미기 = (주소) => { const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = 주소; (document.head || document.documentElement).appendChild(l); };

  /* 판번호 딱지 — 사장님 10-13: 「수정된건 프로그램에 버전표시해줘」.
     무엇이 돌고 있는지 **화면에서 바로** 보이게 한다. 적는 것 —
       판번호 · 화면 글이 어디서 왔나(깃/확장) · 짚어서 지시가 **어디까지 갔나**(짚개·기억·손잡이·꾸밈).
     이것만 보면 「덮어썼나 안 썼나」 와 「왜 짚기가 안 되나」 가 한눈에 갈린다. */
  /* ⚠ 틀(frameset) 안에서는 이 글이 **틀마다** 돈다. 작은 틀(가름줄·숨은 틀)에까지
     딱지를 붙이면 화면이 지저분해진다. 사람이 보는 크기일 때만 붙인다. */
  /* ⚠ 10-14 — 전에는 작은 틀에 딱지를 안 붙였다. 그래서 사장님이 보시는 화면에서
     딱지가 아예 안 뜨는 일이 생겼다. 이제 **아주 작은 틀만** 뺀다. */
  const 볼만한틀 = () => (innerWidth >= 200 && innerHeight >= 80);
  function 딱지(글자, 나쁨) {
    if (!볼만한틀()) return;
    const d = document.getElementById("vp-판") || document.createElement("div");
    d.id = "vp-판"; d.textContent = 글자;
    d.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:2147483646;"
      + "background:" + (나쁨 ? "#c92a2a" : "rgba(0,0,0,.55)") + ";color:#fff;"
      + "font:600 11px/1.4 sans-serif;padding:3px 7px;border-radius:9px;pointer-events:none";
    if (!d.parentNode) (document.body || document.documentElement).appendChild(d);
  }

  /* ⚠⚠ 10-14 사장님: 판번호는 0.33.0 이 맞는데 **왼쪽 아래 딱지가 안 보인다**.
     딱지는 화면에 그리는 것이라 남의 CSS·틀·크기에 얼마든지 가려진다.
     그래서 **아무도 못 가리는 자리**에 표를 남긴다 — **창 제목(탭 글자)**이다.
     제목은 맨 위 문서의 것이고 CSS 와 상관없다. 탭에 「·짚기v0.33.1」 이 보이면
     확장이 그 화면까지 **닿은 것**이고, 안 보이면 **아예 안 닿은 것**이다. 이것으로 갈린다.
     ⚠ 틀 문서(FRAMESET)에서 돌아서기 **전에** 찍는다 — 틀 문서가 바로 그 맨 위 창이다. */
  try {
    const 꼭 = window.top || window;
    if (꼭.document && !/·짚기v/.test(꼭.document.title || "")) {
      꼭.document.title = (꼭.document.title || "벤더피아") + " ·짚기v" + chrome.runtime.getManifest().version;
    }
  } catch (e) {}

  if (!document.body || document.body.tagName === "FRAMESET") return;   // 틀 문서엔 아무것도 안 그려진다

  (async () => {
    for (const f of 꾸밈) 꾸미기(깃 + encodeURIComponent(f));
    const 판 = chrome.runtime.getManifest().version;
    딱지("벤더피아 보기 " + 판 + " · 부르는 중…");
    let 못온것 = [], 깃에서 = 0, 확장에서 = 0;
    for (const f of 글) {
      // 다리는 늘 확장 안의 것 — 인터넷이 끊겨도 길이 살아 있어야 한다
      if (f === "저장다리.js") { await 넣기(chrome.runtime.getURL(f)); continue; }
      if (await 넣기(깃 + encodeURIComponent(f))) { 깃에서++; continue; }
      if (await 넣기(chrome.runtime.getURL(f))) { 확장에서++; continue; }   // 바깥이 막히면 확장 안의 것
      못온것.push(f);
    }
    /* ⚠⚠ 10-14 — 전에는 `.vg-hint` 가 **있나**만 보고 「짚기 ✓」 를 찍었다. 그것이 **거짓 초록**이었다.
       손잡이 꾸밈(<style>)이 거부되는 꼴을 세워 재 보니, 붉은 테도 지시판도 안 보이는데
       딱지는 그대로 「짚기 ✓」 를 찍었다 (잰 값: outline 이 `0px none` 인데 ✓).
       그 딱지로 사장님께 여쭈면 **틀린 답**을 받는다. 그래서 **넷을 따로 재서** 적는다 —
         짚개   짚개.js 가 그 문서에서 돌았나 (같은 세상이라 바로 보인다)
         기억   손잡이를 켜는 기억(vg기억장)이 적혔나
         손잡이 손잡이 글이 붙었나
         꾸밈   손잡이 꾸밈이 **실제로 먹었나** — 버리는 칸에 vg-mark 를 달아 outline 을 읽는다
       한 줄, 짧게. 길면 사장님이 못 읽으신다. */
    const 기억적혔나 = () => { try {
      return !!sessionStorage.getItem("vg기억장:" + location.pathname); } catch (e) { return false; } };
    const 꾸밈먹었나 = () => { try {
      const p = document.createElement("div");
      p.className = "vg-mark";
      p.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px";
      /* ⚠ 몸이 아니라 **뿌리**에 단다 — vp-clean 이 몸의 바로 밑 자식을 감춘다 */
      document.documentElement.appendChild(p);
      const 굵기 = parseFloat(getComputedStyle(p).outlineWidth) || 0;
      p.remove();
      return 굵기 > 0;
    } catch (e) { return false; } };
    const 그리기 = () => {
      const 어디 = 확장에서 ? (깃에서 ? "깃+확장" : "확장") : "깃";
      const 못 = [["짚개", !!window.__vp짚개], ["기억", 기억적혔나()],
                  ["손잡이", !!window.__vp손잡이붙음], ["꾸밈", 꾸밈먹었나()]];
      딱지("벤더피아 보기 " + 판 + " · " + 어디 + " · " + 못.map(([n, 참]) => n + (참 ? "✓" : "✗")).join(" "),
           !!못온것.length || 못.some(([, 참]) => !참));
    };
    setTimeout(그리기, 1500);
    /* 손잡이는 깃허브에서 온다 — 느리면 1.5초에 ✗ 가 찍힌다. 그것도 거짓이다. 한 번 더 고쳐 적는다. */
    setTimeout(그리기, 4000);
    if (!못온것.length) return;
    for (const f of 꾸밈) 꾸미기(chrome.runtime.getURL(f));
    const 줄 = document.createElement("div");
    줄.textContent = "벤더피아 보기 — 화면 글을 못 불렀습니다 (" + 못온것.join(", ") + "). 바이글에게 알려 주세요.";
    줄.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#c92a2a;"
      + "color:#fff;font:600 13px/1.5 sans-serif;padding:8px 12px;text-align:center";
    (document.body || document.documentElement).appendChild(줄);
  })();
})();
