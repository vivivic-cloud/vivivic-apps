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
     무엇이 돌고 있는지 **화면에서 바로** 보이게 한다. 세 가지를 적는다 —
       판번호 · 화면 글이 어디서 왔나(깃/확장) · 짚어서 지시 손잡이가 붙었나.
     이것만 보면 「덮어썼나 안 썼나」 와 「왜 짚기가 안 되나」 가 한눈에 갈린다. */
  /* ⚠ 틀(frameset) 안에서는 이 글이 **틀마다** 돈다. 작은 틀(가름줄·숨은 틀)에까지
     딱지를 붙이면 화면이 지저분해진다. 사람이 보는 크기일 때만 붙인다. */
  const 볼만한틀 = () => (innerWidth >= 320 && innerHeight >= 240);
  function 딱지(글자, 나쁨) {
    if (!볼만한틀()) return;
    const d = document.getElementById("vp-판") || document.createElement("div");
    d.id = "vp-판"; d.textContent = 글자;
    d.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:2147483646;"
      + "background:" + (나쁨 ? "#c92a2a" : "rgba(0,0,0,.55)") + ";color:#fff;"
      + "font:600 11px/1.4 sans-serif;padding:3px 7px;border-radius:9px;pointer-events:none";
    if (!d.parentNode) (document.body || document.documentElement).appendChild(d);
  }

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
    setTimeout(() => {
      const 짚기 = !!document.querySelector(".vg-hint");
      const 어디 = 확장에서 ? (깃에서 ? "깃+확장" : "확장") : "깃";
      딱지("벤더피아 보기 " + 판 + " · " + 어디 + (/firmdvlist/i.test(길) ? "" : (짚기 ? " · 짚기 ✓" : " · 짚기 ✗")),
           !!못온것.length || (!/firmdvlist/i.test(길) && !짚기));
    }, 1500);
    if (!못온것.length) return;
    for (const f of 꾸밈) 꾸미기(chrome.runtime.getURL(f));
    const 줄 = document.createElement("div");
    줄.textContent = "벤더피아 보기 — 화면 글을 못 불렀습니다 (" + 못온것.join(", ") + "). 바이글에게 알려 주세요.";
    줄.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#c92a2a;"
      + "color:#fff;font:600 13px/1.5 sans-serif;padding:8px 12px;text-align:center";
    (document.body || document.documentElement).appendChild(줄);
  })();
})();
