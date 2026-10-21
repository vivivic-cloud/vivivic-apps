/* 화면 글을 **깃허브에서 바로** 불러온다 — 확장은 얇은 껍데기만 남는다.
   사장님 10-13: 「확장파일을 계속 수정시마다 덮어 써야되는거야?」 → 「1」.
   이제 화면 글을 고치면 **덮어쓰지 않아도** 새로고침만 하면 새것이 돈다.

   ⚠ 못 불러오면(벤더피아가 바깥 글을 막거나 인터넷이 끊기면) **확장 안의 것**으로 돈다.
      그래도 안 되면 붉은 줄을 띄운다 — 조용히 비는 것이 이 집에서 제일 나쁘다.
   ⚠ 글 차례를 지킨다. `vp-data.js` 가 `goods.js` 보다 먼저 돌아야 한다. */
(() => {
  const 깃 = "https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/";
  /* ⚠⚠ 10-15 사장님: 「이게 뭐야 … 드롭다운 목록으로 만들어 달라니까, 그리고, 송장전송필터링은
       필요없다고」 — **새 글은 올라가 있었는데 사장님 화면에는 옛 글이 돌고 있었다.**
     까닭: 여기서 깃허브 주소를 **아무 표 없이** 걸어 브라우저와 깃허브 CDN 이 **옛 글을 들고 있었다.**
     깃허브 페이지는 보통 10분쯤 캐시한다. 우리는 「새로고침만 하시면 됩니다」 라고 적어 왔는데,
     그 새로고침이 **옛 글을 다시 가져오고 있었던 것**이다.
     → 주소 뒤에 **1분마다 바뀌는 표**를 붙인다. 늦어도 1분이면 새 글이 간다.
       한 쪽을 여는 동안은 같은 표라 **두 번 받지 않는다.**
     ⚠ 이 줄은 **확장 안**이라 사장님이 **한 번 덮어쓰셔야** 먹는다. 그 한 번이면 다시는 안 겪는다.
       (바이글: 「덮어쓰기를 만들지 마십시오」 — 그런데 주소를 짓는 자리가 **여기뿐**이라
        덮어쓰기 없이는 못 고친다. 그래서 하고 적어 둔다.) */
  /* 표를 **둘** 붙인다 —
       `v=<집 꼴 판번호>`  판을 올릴 때마다 주소가 달라진다. 어느 판이 받아 갔는지도 보인다.
       `t=<분>`            ⚠ **이것이 핵심이다.** 화면 글만 고치는 날은 집 꼴 판이 안 바뀌어서
                           `v=` 만으로는 **또 옛 글을 받는다.** 분이 바뀌면 반드시 새로 받는다.
     한 쪽을 여는 동안은 같은 분이라 **두 번 받지 않는다.**
     ⚠ 여기 글넣기는 `fetch` 가 아니라 **`<script src>`·`<link>`** 다. 그래서
       `cache:"no-cache"` 를 걸 자리가 없다 — 표 두 개가 그 일을 대신한다. */
  const 캐시표 = () => {
    let 판 = "0";
    try { 판 = chrome.runtime.getManifest().version; } catch (e) {}
    return "?v=" + encodeURIComponent(판) + "&t=" + Math.floor(Date.now() / 60000);
  };
  const 길 = location.pathname.toLowerCase();
  const 있나 = (t) => 길.includes(t);

  const 글 = ["저장다리.js", "vp-data.js", "login.js"];       // 모든 화면
  const 꾸밈 = ["login.css"];
  if (있나("/index.aspx"))        { 글.push("menu.js");   꾸밈.push("menu.css"); }
  if (있나("firmdvlist.aspx")) {
    /* ⚠⚠ 10-15 — 배송관리에도 **`goods.js`·`goods.css` 를 보낸다.** 사장님 말씀 그대로:
         「**그러니까 난 안되니까 이거 확장프로그램 덮어씌어야 되는거 아니냐고**」
       배송관리 표의 상품명 칸을 **상품관리의 그 상품버튼**으로 바꾸는 데 그 글이 쓰인다.
       앞서 `search.js` 가 **제 주소로 형제를 불러오는 우회로**를 썼는데 사장님 화면에서
       안 돌았다. 우회로는 뒷길로 남겨 두었다(옛 판을 쓰시는 분) — `goods.js` 가 두 번
       돌지 않게 **스스로 막는다**.
       ⚠ `johon.js`·`amt-draw.js` 는 **안 보낸다.** 상품 단추가 안 쓴다
         (goods.js 60줄·512줄에서 둘 다 `typeof` 로 막혀 있다). **쓰는 것만** 보낸다.
       ⚠⚠ **꾸밈 차례를 지켜라 — `goods.css` 가 `search.css` 보다 먼저다.**
         둘 다 첫 줄이 `#vp-root.vp-wide { … }` 로 **같은 셀렉터**다. 셈이 같으니
         **뒤에 온 것이 이긴다.** goods.css 가 뒤에 오면 그 `display:block` 이
         search.css 의 쪽스크롤 없애기(`display:flex`)를 덮어 **③ 이 다시 깨진다.** */
    글.push("search.js", "goods.js");
    꾸밈.push("goods.css", "search.css");
  }
  /* ⚠⚠ 10-21 — 주문관리(`/System/Sales/orderMst.aspx`)에는 **CS 판만** 띄운다. 원래 화면은 가리지 않는다.
     `search.js`(CS 판·조회)와 `search.css`(판 꾸밈)만 보낸다. `goods.js` 는 안 보낸다(상품 단추 불필요).
     `search.js` 가 주소를 보고 스스로 CS 전용으로 돈다(`CS전용`). ⚠ 이 줄은 확장 안 — 덮어쓰기 필요. */
  if (있나("/system/sales/ordermst.aspx")) { 글.push("search.js"); 꾸밈.push("search.css"); }
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

  /* ── ⑧ **밖에서 받아 오는 다리** (10-15) ──────────────────────
     벤더피아 쪽 CSP(`connect-src`)가 창고로 나가는 것을 막아도, 확장 쪽 받아오기는
     그 CSP에 묶이지 않는다. 그래서 화면 글이 「이 주소 좀 받아 주십시오」 하면 여기서 받는다.
     ⚠⚠ **허락한 집은 둘뿐이다.** 아무 주소나 받아 주면 이 다리가 **구멍**이 된다.
       화면 글은 깃허브에서 오고, 벤더피아 쪽 글도 같은 창에서 돈다 — 둘 다 이 길을 쓸 수 있다.
       그러니 여기서 **집 이름으로 막는다.** 이 목록을 넓히지 마라.
     ⚠ 쿠키를 **안 싣는다**(`credentials: "omit"`). 벤더피아 로그인을 밖으로 내보내지 않는다.
     ⚠ 저장·등록이 아니다 — 창고에서 **읽기만** 한다(묻는 쪽이 그렇게 쓴다). */
  /* ──밖에다리시작── (자가 이 토막을 그대로 떼어 돌린다. 이 표를 지우지 마라) */
  const 허락한집 = ["https://firestore.googleapis.com", "https://identitytoolkit.googleapis.com"];
  /* ⚠⚠ **집만 묶으면 막음이 아니다.** 집은 둘로 묶었는데 「무엇을 하라는지」 를 안 묶으면
       이 창의 아무 글이나 `POST`·`PATCH`·`DELETE` 를 창고로 보내 **사장님 자료를 쓰거나
       지울 수 있다.** 「묻는 쪽이 읽기만 한다」 는 **막음이 아니다** — 여기서 막는다.
     · `GET` 은 받는다 — 창고에 `GET` 으로 쓰는 길은 없다.
     · `POST` 는 **창고 묻기(`:runQuery`)와 익명로그인(`accounts:signUp`) 길에서만** 받는다.
     · `PATCH` 는 **상담 이력 칸(`vpcs_note`) 한 문서 자리에만** 받는다 (아래 참조).
     · 그 밖은 다 거절. `:commit`·`:batchWrite`·`DELETE`·딴 칸 `PATCH` 는 **다 막힌다.**
     ⚠ 길은 `pathname` 으로 본다 — `?key=…` 가 붙어도 맞게 갈린다.
     ⚠ 이 목록을 넓히지 마라.

     ⚠⚠ **쓰기 한 길을 왜 여기로 내는가 (10-15)**
       사장님: 「상담할때 고객문의에 이력을 남기는데 이력남길수있게 해주세요」.
       처음엔 다리를 안 넓히려고 **쓰기만 화면 쪽에서** 보내려 했다. 그런데 그것이
       **앞뒤가 안 맞는다** — 벤더피아 쪽 `connect-src` 는 **받는 것만 막는 게 아니라
       보내는 것도 같이 막는다**(`fetch` 는 읽기든 쓰기든 한 울타리다). ⑧ 수입정보가
       안 됐던 까닭이 바로 그것이고, 그래서 이 다리를 지었다. 같은 창에서 쓰기만 통할 리가
       없다 — 바이글이 짚어 주었다. 그래서 **넓히지 않고 바늘구멍만** 낸다.

     ⚠⚠ **바늘구멍의 못 — 길이 이 자리로 「시작」해야 한다.**
       `startsWith` 가 아니라 **앞에서부터 통째로** 맞춰 본다. 그래야
       `…/vpcs_note/../product_master/x` 처럼 **빠져나가는 길**이 안 통한다.
       문서 이름 자리에는 `/` 도 `.` 도 안 받는다. */
  const 쓰는칸 = "vpcs_note";
  /* `/v1/projects/<집>/databases/(default)/documents/artifacts/<집>/public/data/vpcs_note/<문서>` */
  const 쓰는길 = new RegExp(
    "^/v1/projects/[\\w-]+/databases/\\([^)]+\\)/documents/artifacts/[\\w-]+/public/data/"
    + 쓰는칸 + "/[A-Za-z0-9_-]+$");
  const 허락한셈 = (집, 길, 셈) => {
    if (셈 === "GET") return true;
    if (집 === "https://identitytoolkit.googleapis.com")
      return 셈 === "POST" && /\/accounts:signUp$/.test(길);
    if (집 !== "https://firestore.googleapis.com") return false;
    if (셈 === "POST") return /:runQuery$/.test(길);
    if (셈 === "PATCH") return 쓰는길.test(길);          // ← 열린 길은 이것 하나뿐이다
    return false;                                       // :commit·:batchWrite·DELETE·그 밖
  };
  addEventListener("message", async (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "밖에") return;
    const 보내기 = (답) => window.postMessage({ __vp: "밖에답", 표: e.data.표, 답 }, location.origin);
    let 집 = "", 길 = "";
    try { const u = new URL(e.data.주소); 집 = u.origin; 길 = u.pathname; } catch (err) {}
    if (!허락한집.includes(집)) return 보내기({ 다리: true, ok: false, status: 0, 글: "", 탈: "안 허락한 집" });
    const 옛 = e.data.옵션 || {};
    const 셈 = String(옛.method || "GET").toUpperCase();
    if (!허락한셈(집, 길, 셈)) {
      try { window.VP말?.("밖에:안 허락한 셈 " + 셈); } catch (err) {}
      return 보내기({ 다리: true, ok: false, status: 0, 글: "", 탈: "안 허락한 셈 " + 셈 });
    }
    try {
      const r = await fetch(e.data.주소, {
        method: 셈,
        headers: 옛.headers || undefined,
        body: 옛.body || undefined,
        credentials: "omit",
      });
      보내기({ 다리: true, ok: r.ok, status: r.status, 글: await r.text() });
    } catch (err) {
      보내기({ 다리: true, ok: false, status: 0, 글: "", 탈: String(err && err.message || err) });
    }
  });
  /* ──밖에다리끝── */

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
    for (const f of 꾸밈) 꾸미기(깃 + encodeURIComponent(f) + 캐시표());
    const 판 = chrome.runtime.getManifest().version;
    딱지("벤더피아 보기 " + 판 + " · 부르는 중…");
    let 못온것 = [], 깃에서 = 0, 확장에서 = 0;
    for (const f of 글) {
      // 다리는 늘 확장 안의 것 — 인터넷이 끊겨도 길이 살아 있어야 한다
      if (f === "저장다리.js") { await 넣기(chrome.runtime.getURL(f)); continue; }
      if (await 넣기(깃 + encodeURIComponent(f) + 캐시표())) { 깃에서++; continue; }
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
