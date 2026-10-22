// 벤더피아 로그인 화면을 로그인 칸만 있는 빈 페이지로 바꾼다.
// 입력값은 원래 로그인 폼에 그대로 넣어 제출하므로 어디에도 저장하지 않는다.
//
// ⚠ 이 글은 **벤더피아 모든 쪽에서** 돈다(불러오기.js 가 늘 넣는다). 로그인 칸이 없으면
//   아래 로그인 부분은 그냥 돌아선다. 그래서 **모든 쪽에 있어야 하는 화면전환 단추**를
//   여기에 둔다 — 새 글을 더하면 집 꼴(manifest)을 고쳐야 해서 사장님이 덮어쓰셔야 한다.

/* ⚠⚠ 10-15 사장님 (배송관리를 짚으시고, 그대로):
     「모든 페이지에 실제 벤더피아의 화면으로돌아오는 화면전환 버튼이 필요하다
       이 화면 전환버튼 누를시 현재 확장프로그램으로 보여지는 화면에서 딱 이 화면전환 버튼만
       남겨둔채 벤더피아의 실제 모습이 모두 보여져야해」
   우리는 벤더피아 원래 화면을 **지운 것이 아니라 가리고** 있다(`html.vp-clean` 한 줄이
   몸의 바로 밑 자식을 다 감춘다). 그러니 **걷었다 다시 덮으면** 된다.
     · **새로고침하지 않는다** — 조회해 두신 결과가 날아가면 안 된다.
     · 원래 화면을 **지우지 않는다** — 숨겼다 되돌린다.
     · 단추는 **뿌리(documentElement)** 에 단다. 몸에 달면 `vp-clean` 이 그것까지 감춘다.
     · 우리 것 중 화면에 남는 것은 **이 단추 하나뿐** — 판번호 딱지(#vp-판)·붉은 줄(#vp-탈)도 같이 숨긴다.
     · 짚어서 지시하기는 **두 모습 다에서** 그대로 산다 — 손잡이는 문서에 붙어 있어 상관없다. */
/* ⚠⚠ 10-15 사장님: 「새로고침해도 버전정보가 변하지 않는데?」 — 사장님이 옳으시다.
   왼쪽 아래 딱지는 `chrome.runtime.getManifest().version` 을 찍는다. 그것은 **깔린 확장의 번호**라
   **덮어쓰기 전에는 안 바뀐다.** 그런데 새로고침으로 실제로 바뀌는 것은 **깃에서 오는 화면 글**이다.
   → **지금 돌고 있는 화면 글이 몇 판인지 보여 주는 자리가 아예 없었다.**
     우리가 「새로고침만 하시면 됩니다」 라고 적어 놓고 **왔는지 확인할 길을 안 드린 것**이다.
   그래서 **깃에서 바로 오는 이 글**이 제 판을 딱지에 덧붙인다 —
     「벤더피아 보기 **깔림** 0.34.5 · **화면글** 0.34.8 · 깃 · 짚개✓ …」
   둘이 다르면 덮어쓰면 맞춰진다는 뜻이고, **화면글 판이 올라가 있으면 새 글이 온 것**이다.
   ⚠ `불러오기.js`(확장 안)는 **안 건드린다** — 고치면 사장님이 덮어쓰셔야 한다.
     이 고침은 **새로고침만으로** 먹어야 한다. 그게 핵심이다. */
/* ⚠⚠ 화면글 판은 **여기 한 군데서만** 적는다. `manifest.json` 의 version 과 **늘 같이** 올려라
   (배포 차례에 적어 두었다). 두 군데서 적으면 반드시 어긋난다. */
const VP_화면글판 = "0.34.40";   // ⚠ manifest.json 의 version 과 **같은 값**

/* ⚠⚠ **까닭 적기** (10-15) — 사장님 PC 에서 CS 거르개·상품 단추·수입정보 셋이
     **조용히** 안 됐다. 사장님도 바이글도 **왜**인지를 못 봤다. 그것이 진짜 탈이었다.
   그래서 화면 글들이 「무엇이 안 됐나」 를 한 토막씩 여기에 적는다.
     `VP말("CS칸없음")` → 딱지 끝에 ` ‖ CS칸없음` 이 붙는다.
   ⚠ 딱지는 평소 **숨어 있다**(①). 그래서 사장님 화면을 더럽히지 않는다 —
     주소 끝에 **`&vg판=1`** 을 붙이시면 그때만 보인다.
   ⚠ `불러오기.js` 가 딱지를 1.5초·4초에 **다시 쓴다.** 그래서 적어 둔 토막을 들고 있다가
     다시 쓸 때마다 **또 붙인다**(아래 `봄`).
   ⚠ 터진 말과 **못 받은 글**(CSP 로 막힌 `<script src>` 따위)도 저절로 적는다. */
(() => {
  const 말들 = [];
  /* ⚠ 60자는 **너무 짧았다** — 10-16 에 「… padding-top 34」 가 「… 3」 으로 잘려
       잰 숫자가 거짓이 됐다. 딱지는 평소 숨어 있으니(①) 길어도 사장님 화면을 안 더럽힌다. */
  const 짧게 = (t) => String(t == null ? "" : t).replace(/\s+/g, " ").slice(0, 120);
  const 딱지글 = (옛글) => {
    if (!옛글) return null;
    let 글 = 옛글;
    if (!글.includes("화면글")) {
      const m = /^(벤더피아 보기 )([^ ·]+)([\s\S]*)$/.exec(글);
      if (!m) return null;
      글 = m[1] + "깔림 " + m[2] + " · 화면글 " + VP_화면글판 + m[3];
    }
    /* 적어 둔 토막을 뒤에 붙인다. 이미 붙어 있으면 그만. */
    for (const t of 말들) if (!글.includes(t)) 글 += " ‖ " + t;
    return 글 === 옛글 ? null : 글;
  };
  const 덧붙이기 = () => {
    const d = document.getElementById("vp-판");
    if (!d) return false;
    const 새글 = 딱지글(d.textContent);
    if (새글) d.textContent = 새글;
    return true;
  };
  window.VP말 = (t) => {
    const 토막 = 짧게(t);
    if (!토막 || 말들.includes(토막)) return;
    말들.push(토막);
    덧붙이기();
  };
  /* 터진 말 · 못 받은 글을 저절로 적는다 — 이것이 「왜 조용히 안 되나」 를 가른다 */
  addEventListener("error", (e) => {
    const el = e && e.target;
    if (el && el !== window && el.tagName) {                       // 글·꾸밈을 못 받았다
      const 주소 = String(el.src || el.href || "");
      window.VP말("못받음:" + (주소.split("/").pop() || el.tagName));
      return;
    }
    window.VP말("터짐:" + (e && e.message));
  }, true);
  addEventListener("unhandledrejection", (e) => {
    window.VP말("못끝냄:" + (e && e.reason && (e.reason.message || e.reason)));
  });
  /* 딱지는 `불러오기.js` 가 1.5초·4초에 **다시 쓴다.** 다시 쓰면 또 붙여야 한다. */
  const 봄 = new MutationObserver(() => 덧붙이기());
  const 붙자 = () => {
    const d = document.getElementById("vp-판");
    if (!d) return false;
    덧붙이기();
    봄.observe(d, { childList: true, characterData: true, subtree: true });
    return true;
  };
  if (!붙자()) {
    const 기다림 = new MutationObserver(() => { if (붙자()) 기다림.disconnect(); });
    기다림.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => 기다림.disconnect(), 20000);
  }
})();

/* ① 속엣말 감추기 — 사장님 10-15 「이 내부정보표기는 보이지 안도록해주세요」.
   딱지 자체는 `login.css` 가 감춘다. 여기서는 **보는 길**과 **탭 글자**를 맡는다.
   ⚠ 탭 글자의 「·짚기v…」 는 `불러오기.js`(확장 안)가 붙인 것이다. 거기를 고치면
     사장님이 덮어쓰셔야 하니, **화면 쪽에서 털어 낸다.** 판보기일 때는 그대로 둔다. */
(() => {
  /* ⚠ 주소에 적은 한글은 브라우저가 `%ED%8C%90` 꼴로 바꿔 둔다. **풀어서** 봐야 맞는다
       (10-15 재서 잡았다 — 안 풀면 `?vg판=1` 이 끝내 안 먹는다). */
  const 푼것 = (s) => { try { return decodeURIComponent(s || ""); } catch (e) { return s || ""; } };
  const 판보기인가 = () => {
    try {
      if (/[?&]vg판=1/.test(푼것(location.search))) return true;
      const 꼭 = window.top || window;
      if (꼭 !== window && /[?&]vg판=1/.test(푼것(꼭.location.search))) return true;
    } catch (e) {}                                    // 틀을 못 들여다보면 그냥 넘긴다
    return false;
  };
  if (판보기인가()) document.documentElement.classList.add("vp-판보기");

  function 제목털기() {
    if (document.documentElement.classList.contains("vp-판보기")) return;
    try {
      const 꼭 = window.top || window;
      const 옛 = 꼭.document.title || "";
      const 깎음 = 옛.replace(/\s*·짚기v[\d.]+/g, "");
      if (깎음 !== 옛) 꼭.document.title = 깎음;
    } catch (e) {}
  }
  제목털기();
  setTimeout(제목털기, 1500);                          // 딱지를 찍는 때와 같은 결
  setTimeout(제목털기, 4000);
  window.VP판보기토글 = () => {
    const 켬 = document.documentElement.classList.toggle("vp-판보기");
    if (!켬) 제목털기();
    return 켬;
  };
})();

(() => {
  const 우리것 = ["vp-root", "vp-판", "vp-탈"];
  let 단추 = null, 원래보는중 = false;
  const 숨김표 = "vp-숨김";

  /* ⚠⚠ **원래 화면 = 벤더피아 전체 화면 (10-21, 장부 a1792566604 — 두 번째 고침, 0.34.37).** 사장님: 「원래화면 보기시 벤더피아의
       전체화면이 보이지 않습니다 … 현 메뉴상태의 화면과 원래페이지의 전체가 보여야 한다 … 원래화면에서 우리화면으로 넘어오는 버튼이 작동하지 않고 있습니다」.
     ⚠ 0.34.36 이 사장님 화면에서 안 된 까닭 — 「틀 밖에서 틀로 **이동**」 하는 길이었다. 이동은 ㄱ) 가야 할 틀 주소를 **탭마다 따로인
       sessionStorage** 에만 적어 두어 새 탭·새 창이면 주소가 없고 ㄴ) 이동하면 페이지 변수(「우리 화면」 기억)가 다 사라지며
       ㄷ) 가서 벤더피아 제 메뉴를 눌러 여는 일이 메뉴 꼴(링크가 아닌 것·target)에 매여 있었다. 흉내는 그 셋이 늘 되게 지은 것이라 초록이었다.
     → 이제 **이동하지 않는다.** 지금 화면(우리 화면) **위에 벤더피아 전체 틀을 한 겹 더 띄운다**(같은 출처 iframe `#vp-원래틀`):
       ① 틀 주소는 sessionStorage 와 localStorage **둘 다**에 적는다(탭이 달라도 있다). 둘 다 비면 짐작하지 않고 제자리에서 걷는다.
       ② 그 틀이 뜨면 안쪽(같은 출처라 들여다 보인다)에서 **벤더피아 제 메뉴 줄**(우리 `.vp-btn` 말고)을 눌러 보던 쪽을 연다.
          줄이 링크가 아니면 안쪽에서 제일 큰 본문 틀을 보던 쪽으로 바꾼다.
       ③ 그 틀 안에서 도는 우리 글(이 파일, 불러오기가 틀마다 넣는다)은 `vp-clean`·단추를 **걷고 아무것도 안 덮는다** (`원래안`).
       ④ 「← 우리 화면」 은 그 겹을 **걷기만** 한다 — 아래 우리 화면은 그대로(조회 결과·펼친 것 그대로) 있다. 이동이 없으니 기억 문제가 없다.
       ⑤ 틀을 못 띄우면(막힘·못 읽음) 예전처럼 제자리에서 걷는다. */
  const 저장 = (열쇠, 값) => { try { sessionStorage.setItem(열쇠, 값); } catch (e) {} };
  const 읽기 = (열쇠) => { try { return sessionStorage.getItem(열쇠); } catch (e) { return null; } };
  const 길게저장 = (열쇠, 값) => { try { localStorage.setItem(열쇠, 값); } catch (e) {} };
  const 길게읽기 = (열쇠) => { try { return localStorage.getItem(열쇠); } catch (e) { return null; } };
  const 틀안인가 = () => { try { return window.top !== window && !!window.top.location.href; } catch (e) { return false; } };
  /* 내가 우리가 띄운 겹(`#vp-원래틀`) 안인가 — 조상 틀 중에 그 이름이 있으면 그렇다 */
  const 원래틀안인가 = () => {
    try { for (let w = window; w !== w.top; w = w.parent) { if (w.frameElement && w.frameElement.id === "vp-원래틀") return true; } } catch (e) {}
    return false;
  };
  const 원래안 = 원래틀안인가();
  if (!원래안) {                                     // ⚠ 겹 안에서는 적지 않는다 — 맨 위가 우리 화면이라 엉뚱한 주소가 적힌다
    let 틀 = null;
    if (틀안인가()) { try { 틀 = window.top.location.href; } catch (e) {} }
    else if (/\/index\.aspx$/i.test(location.pathname)) 틀 = location.href;   // 틀 없이 메인이 맨 위 창이면 그 메인이 둘레다
    if (틀) { 틀 = 틀.split("#")[0]; 저장("vp틀", 틀); 길게저장("vp틀", 틀); }
  }
  if (원래안) {
    const 뿌리 = document.documentElement;
    뿌리.classList.add("vp-원래안");
    /* ⚠ 없는 것을 remove 해도 class 속성이 다시 쓰여 이 관찰자가 끝없이 돈다 — 있을 때만 지운다 */
    const 걷기 = () => { for (const c of ["vp-clean", "vp-위여백"]) if (뿌리.classList.contains(c)) 뿌리.classList.remove(c); };
    걷기();
    new MutationObserver(걷기).observe(뿌리, { attributes: true, attributeFilter: ["class"] });
    return;                                           // 벤더피아 제 화면을 그대로 둔다 — 단추도 로고 손질도 없다
  }
  let 원래틀 = null;
  /* 이 화면이 **옆 틀 둘레**를 어떻게 가졌나 — 재서 딱지 끝에 적는다 */
  const 틀모습 = () => {
    if (!틀안인가()) return "틀:맨위(둘레 없음)";
    let 옆 = [];
    try { for (let i = 0; i < window.top.frames.length; i++) { const f = window.top.frames[i]; if (f === window) continue;
      try { 옆.push(f.location.pathname.split("/").pop() + (f.document.documentElement.classList.contains("vp-clean") ? "(덮임)" : "")); } catch (e) { 옆.push("?"); } } } catch (e) {}
    return "틀:안쪽 옆틀 " + (옆.join(",") || "없음");
  };
  /* 옆 틀에 우리가 덮은 것(vp-clean)을 걷거나 다시 덮는다 — 같은 출처 틀만 된다 */
  const 옆틀덮기 = (덮나) => {
    if (!틀안인가()) return;
    try { for (let i = 0; i < window.top.frames.length; i++) { const f = window.top.frames[i]; if (f === window) continue;
      try { const h = f.document.documentElement; if (덮나) { if (h.dataset.vp옆걷음) { h.classList.add("vp-clean"); delete h.dataset.vp옆걷음; } }
        else if (h.classList.contains("vp-clean")) { h.classList.remove("vp-clean"); h.dataset.vp옆걷음 = "1"; } } catch (e) {} } } catch (e) {}
  };
  const 경로 = (w) => { try { return w.location.pathname.toLowerCase(); } catch (e) { return null; } };
  const 창들모으기 = (w, 모음 = []) => { try { 모음.push(w); for (let i = 0; i < w.frames.length; i++) 창들모으기(w.frames[i], 모음); } catch (e) {} return 모음; };
  /* 겹이 뜬 뒤 안쪽에서 보던 쪽을 연다 — 0.25초마다 보며 최대 15초 */
  function 틀에서열기(f, 보던) {
    const 길 = 보던.split("?")[0].toLowerCase();
    let 눌렀나 = false, 횟수 = 0;
    const 시계 = setInterval(() => {
      if (원래틀 !== f) { clearInterval(시계); return; }
      횟수++;
      let 창들 = [];
      try { void f.contentDocument.documentElement; 창들 = 창들모으기(f.contentWindow); }
      catch (e) { if (횟수 >= 16) { clearInterval(시계); 틀닫기(); 제자리뒤집기(); } return; }   // 못 들여다본다 → 예전 길
      if (!창들.length) return;
      const 다읽음 = 창들.every((w) => { try { return w.document.readyState === "complete"; } catch (e) { return true; } });
      if (창들.some((w) => 경로(w) === 길 && (() => { try { return w.document.readyState === "complete"; } catch (e) { return false; } })())) { clearInterval(시계); window.VP말?.("원래화면:열림 " + 길); return; }
      if (!눌렀나 && 다읽음) {
        for (const w of 창들) {                                  // ② 벤더피아 제 메뉴 줄을 누른다 (조회만)
          let a = null;
          try { a = [...w.document.querySelectorAll("a[href]")].find((x) => {
            if (x.closest("#vp-root") || /(^|\s)vp-btn(\s|$)/.test(x.className) || /^_?(blank|new)$/i.test(x.target || "")) return false;
            try { return new URL(x.href, w.location.href).pathname.toLowerCase() === 길; } catch (e) { return false; } }); } catch (e) {}
          if (a) { 눌렀나 = true; a.click(); return; }
        }
        if (횟수 >= 10) {                                         // 줄이 링크가 아니다 → 제일 큰 본문 틀을 보던 쪽으로
          let 큰 = null, 넓이 = 0;
          for (const w of 창들.slice(1)) { try { const r = w.frameElement.getBoundingClientRect(); if (r.width >= 300 && r.height >= 200 && r.width * r.height > 넓이) { 큰 = w; 넓이 = r.width * r.height; } } catch (e) {} }
          눌렀나 = true;
          if (큰) 큰.location.replace(보던);
          else { clearInterval(시계); window.VP말?.("원래화면:본문 틀 못 찾음 " + 창들.map(경로).join(",")); }
        }
      }
      if (횟수 >= 60) clearInterval(시계);
    }, 250);
  }
  /* 지금 화면 위에 벤더피아 전체 틀을 한 겹 띄운다. 띄웠으면 참 */
  function 틀열기() {
    const 주소 = 읽기("vp틀") || 길게읽기("vp틀");
    if (!주소) return false;                                    // 둘레(틀·메인)를 한 번도 못 봤으면 짐작하지 않고 제자리에서 걷는다
    try { if (new URL(주소, location.href).origin !== location.origin) return false; } catch (e) { return false; }
    const 보던 = location.pathname + location.search;           // # 뒤는 뗀다 (CS등록 따위가 저절로 열리지 않게)
    const f = document.createElement("iframe");
    f.id = "vp-원래틀";
    /* ⚠ `sandbox` 를 걸지 않는다 — 재서 보니 샌드박스 안에서는 **옆 틀끼리** 못 눌러(위 메뉴 틀이 본문 틀을 여는 벤더피아 제 메뉴가 먹통) 쓸 수 없다. */
    f.src = 주소;
    document.documentElement.appendChild(f);                    // ⚠ 몸이 아니라 뿌리에 (vp-clean 이 몸 자식을 감춘다)
    document.documentElement.classList.add("vp-원래틀보임");
    원래틀 = f; 원래보는중 = true;
    꼴맞추기();
    window.VP말?.("원래화면:겹 " + 주소 + " → " + 보던);
    틀에서열기(f, 보던);
    return true;
  }
  function 틀닫기() {
    if (원래틀) { 원래틀.remove(); 원래틀 = null; }
    document.documentElement.classList.remove("vp-원래틀보임");
    원래보는중 = false;
    꼴맞추기();
    자리잡기();
  }

  function 꼴맞추기() {
    if (!단추) return;
    /* 사장님 10-15 「너무크고」 — 글을 짧게 줄였다. 긴 말은 손 올렸을 때만 뜬다. */
    단추.textContent = 원래보는중 ? "← 우리 화면" : "원래 화면";
    단추.title = 원래보는중 ? "우리 화면으로 돌아가기" : "벤더피아 원래 화면 보기";
    단추.setAttribute("aria-pressed", 원래보는중 ? "true" : "false");
  }

  /* 쪽 맨 위 빈 띠에 선다. 그 자리에 남의 것이 **겹쳐** 있으면 왼쪽으로 비켜 선다.
     ⚠ 띠는 `html.vp-위여백` 이 만든다(login.css). 띠가 밀어 주지 못하는 것은
       벤더피아가 `position:fixed` 로 띄워 둔 것뿐이다 — 그때만 비켜 선다.
       벤더피아 제 화면 꼴은 우리가 모른다. 그래서 **재서** 비킨다. */
  function 자리잡기() {
    if (!단추 || 원래틀) return;
    const 뿌리 = document.documentElement;
    /* 무엇이 깔려 있나 — 단추 네 귀를 찍어 본다. 깔린 것이 있으면 그것을 돌려준다. */
    const 걸린것 = () => {
      const r = 단추.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      const 점 = [[r.left + 2, r.top + 2], [r.right - 2, r.top + 2],
                  [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]];
      단추.style.pointerEvents = "none";          // 제 몸이 잡히지 않게
      let 걸림 = null;
      for (const [x, y] of 점) {
        const el = document.elementFromPoint(x, y);
        if (el && el !== 뿌리 && el !== document.body && !단추.contains(el)) { 걸림 = el; break; }
      }
      단추.style.pointerEvents = "";
      return 걸림;
    };
    /* 늘 처음 자리에서 다시 잰다 — 앞서 비켜선 것을 물려야 한다 */
    뿌리.style.removeProperty("--vp-위여백");
    단추.style.removeProperty("top");
    단추.style.right = "12px";
    /* ⚠ 원래 화면일 때는 **띠가 없다.** 그러면 단추 밑에 벤더피아 제 것이 늘 깔려 있어
         아래 ㄴ) 가 띠를 다시 벌리게 되고, 그것이 바로 10-15 의 탈이었다.
         그래서 원래 화면에서는 **옆으로만** 비켜 서고 띠는 안 벌린다. */
    const 띠쓰나 = 뿌리.classList.contains("vp-위여백");
    /* ⚠⚠ **원래 화면에서는 비키지 않는다 (10-15).** 띠가 없으니 단추 밑에 벤더피아 제 것이
         늘 깔려 있다. 그러면 비켜서기가 **끝까지 돌아** 좁은 화면에서 단추가 창 밖으로
         나가 버린다(390px 에서 오른쪽 452px → 안 보인다. 재서 잡았다).
       원래 화면에서는 **떠 있는 채로 둔다** — 반투명이라 밑이 비치고,
       살짝 겹쳐도 괜찮다(바이글 10-15). 비키기는 **우리 띠를 지킬 때만** 쓴다. */
    if (!띠쓰나) return;
    let 걸림 = 걸린것();
    if (!걸림) return;
    /* ㄱ) 옆으로 비켜 선다 */
    for (let i = 1; i <= 4 && 걸림; i++) {
      단추.style.right = (12 + i * 110) + "px";
      걸림 = 걸린것();
    }
    if (!걸림) return;
    /* ㄴ) 쪽 너비를 **다 덮은** 것(벤더피아가 `position:fixed` 로 붙여 둔 머리띠)은
          옆으로 못 피한다. 빈 띠를 그만큼 **더 벌려 그 아래**에 선다 —
          머리띠도 안 가리고 자료도 안 가린다. 겹친 넓이는 그대로 0 이다.
       ⚠ 쪽을 통째로 덮은 것(팝업 따위)에 끌려가지 않게 쪽 키의 1/3 까지만 받는다. */
    단추.style.right = "12px";
    const 밑 = Math.ceil(걸림.getBoundingClientRect().bottom);
    if (밑 > 0 && 밑 < innerHeight / 3) {
      뿌리.style.setProperty("--vp-위여백", (밑 + 26) + "px");
      단추.style.setProperty("top", (밑 + 3) + "px", "important");
    }
  }
  function 뒤집기() {
    if (원래틀) { 틀닫기(); return; }                          // 「← 우리 화면」 — 겹을 걷기만 한다
    /* 틀 밖(맨 위 창)에서 누르면 벤더피아 전체 틀을 한 겹 띄운다 (위 ⚠⚠). 틀 안쪽이면 아래 제자리 길이 둘레를 이미 보여 준다. */
    if (!원래보는중 && !틀안인가() && !/\/index\.aspx$/i.test(location.pathname) && 틀열기()) return;
    제자리뒤집기();
  }
  function 제자리뒤집기() {
    원래보는중 = !원래보는중;
    옆틀덮기(!원래보는중);
    window.VP말?.(틀모습());
    if (원래보는중) {
      document.documentElement.classList.remove("vp-clean");   // 가린 것을 걷는다
      for (const id of 우리것) { const el = document.getElementById(id); if (el) el.classList.add(숨김표); }
      /* ⚠⚠ **띠도 같이 걷는다 (10-15).** 사장님: 「이것을 위로 올려주세요 텍스트가 안보여요」
           — 벤더피아 제 로고(`#imglogo`)를 짚으셨다(장부 a1792059225).
         우리가 얹은 26px 띠가 **원래 화면에서도 남아** 벤더피아 제 머리칸을 아래로 밀고 있었다.
         원래 화면은 **벤더피아 것**이다. 우리가 밀 까닭이 없다 — 우리가 얹은 것만 치운다.
         (벤더피아 제 글·제 꼴은 한 군데도 안 고친다. 조회만 한다.)
         단추는 그때 **떠 있게** 둔다 — 반투명이라 밑이 비친다. */
      document.documentElement.classList.remove("vp-위여백");
      document.documentElement.style.removeProperty("--vp-위여백");
    } else {
      document.documentElement.classList.add("vp-clean");      // 다시 덮는다
      for (const id of 우리것) { const el = document.getElementById(id); if (el) el.classList.remove(숨김표); }
      document.documentElement.classList.add("vp-위여백");      // 우리 화면에는 띠를 다시 둔다
    }
    꼴맞추기();
    자리잡기();
    로고올리기();
  }
  /* ⚠⚠ **로고를 창 맨 위로 (10-16)** — 사장님: 「그림 이미지 위쪽으로 창의 제일 위쪽으로
       이동해주세요」(장부 a1792110677). 어제(10-15) 우리가 얹은 26px 띠를 걷었는데도
       **아직 낮다** 하신다. 그러면 남은 빈자리는 **벤더피아 제 것**이다.
     ⚠ 이 상자에서는 진짜 그 화면을 못 본다. 그래서 **짐작으로 꼴을 고치지 않는다** —
       사장님 화면에서 **그때그때 재서**, 로고 위에 **아무것도 없는 빈자리**(margin·padding)만
       걷는다. 앞에 **보이는 형제가 있으면 손대지 않고** 그 이름을 까닭에 적는다.
       그래야 그 집 글이나 단추를 우리가 지우는 일이 없다.
     ⚠ 우리 화면(`vp-clean`)일 때는 아무것도 안 한다 — 거기선 로고가 아예 안 보인다.
     ⚠ 되돌릴 수 있게 **고친 것을 적어 둔다.** 우리 화면으로 돌아가면 그대로 되돌린다. */
  const 로고고친것 = [];
  function 로고되돌리기() {
    for (const { el, 칸, 옛 } of 로고고친것.splice(0)) {
      if (옛) el.style.setProperty(칸, 옛); else el.style.removeProperty(칸);
    }
  }
  function 로고올리기() {
    if (document.documentElement.classList.contains("vp-clean")) { 로고되돌리기(); return; }
    const 그림 = document.getElementById("imglogo") || document.getElementById("divLogo");
    if (!그림) return;                                  // 그 화면엔 로고가 없다
    const 위 = () => Math.round(그림.getBoundingClientRect().top);
    const 처음 = 위();
    if (처음 <= 2) return;                              // 이미 맨 위다
    const 보이나 = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && getComputedStyle(el).display !== "none";
    };
    const 걷은것 = [];
    let 막은것 = null;
    for (let el = 그림; el && el !== document.documentElement; el = el.parentElement) {
      if (위() <= 2) break;
      /* ⚠⚠ **붙박이(fixed·sticky) 머리띠에서 멈춘다 (10-21, 장부 a1792566604).** 로고가 붙박이 띠 안에 있으면
           그 위 조상(몸)의 윗여백은 **띠 밑으로 밀려 내려간 본문 자리**다. 그것을 0 으로 걷으면
           본문이 띠 밑에 깔려 **가려진다**(재서 잡았다: 본문 55px → 0px, 띠 55px 에 55px 가려짐). */
      if (/^(fixed|sticky)$/.test(getComputedStyle(el).position)) { 막은것 = (el.id ? "#" + el.id : el.tagName.toLowerCase()) + "(붙박이)"; break; }
      /* 앞에 **보이는 형제**가 있으면 그 위는 빈자리가 아니다 — 손대지 않는다 */
      let 앞 = el.previousElementSibling;
      while (앞 && !보이나(앞)) 앞 = 앞.previousElementSibling;
      if (앞) { 막은것 = (앞.id ? "#" + 앞.id : 앞.tagName.toLowerCase()); break; }
      const cs = getComputedStyle(el);
      for (const 칸 of ["margin-top", "padding-top"]) {
        const 값 = parseFloat(cs.getPropertyValue(칸)) || 0;
        if (값 <= 0) continue;
        로고고친것.push({ el, 칸, 옛: el.style.getPropertyValue(칸) });
        el.style.setProperty(칸, "0px", "important");
        걷은것.push((el.id ? "#" + el.id : el.tagName.toLowerCase()) + " " + 칸 + " " + Math.round(값));
      }
    }
    window.VP말?.("로고:" + 처음 + "px→" + 위() + "px"
      + (걷은것.length ? " · 걷음 " + 걷은것.join(", ") : " · 걷을 빈자리 없음")
      + (막은것 ? " · 막은것 " + 막은것 : ""));
  }

  function 단추달기() {
    if (단추) return;
    단추 = document.createElement("button");
    단추.type = "button";
    단추.id = "vp-바꾸기";
    /* 두 번 빠르게 누르면 **속엣말 딱지**를 켜고 끈다 (①).
       ⚠ 바이글 안은 「길게 누르기」 였으나 그 손짓은 임자가 있다 — 짚기(손잡이)가
         0.5초 길게누름을 **창 캡처**로 먼저 잡고 뒤따르는 click 을 삼킨다
         (`shared/viggle.js` 292·301·374줄). 그래서 **두 번 누르기**로 갔다.
       두 번 누르면 화면은 두 번 뒤집혀 **제자리**로 돌아온다 — 보시던 것이 안 바뀐다. */
    let 앞선때 = 0;
    단추.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      뒤집기();
      const 이제 = Date.now();
      if (이제 - 앞선때 < 400) { 앞선때 = 0; window.VP판보기토글?.(); return; }
      앞선때 = 이제;
    });
    document.documentElement.appendChild(단추);                // ⚠ 몸이 아니라 뿌리에
    /* 쪽 맨 위에 빈 띠를 만든다 — 단추가 설 자리다(login.css `html.vp-위여백`).
       우리 화면·벤더피아 제 화면 **두 모습 다**에 두어야 어느 쪽도 안 가린다. */
    document.documentElement.classList.add("vp-위여백");
    꼴맞추기();
    자리잡기();
    addEventListener("resize", 자리잡기, { passive: true });
  }
  /* 우리 화면이 떠 있을 때만 단추를 단다. 화면 글이 늦게 붙어도 받아 준다. */
  if (document.documentElement.classList.contains("vp-clean")) 단추달기();
  else {
    const 봄 = new MutationObserver(() => {
      if (document.documentElement.classList.contains("vp-clean")) { 단추달기(); 봄.disconnect(); }
    });
    봄.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setTimeout(() => 봄.disconnect(), 20000);                  // 끝내 안 뜨면 그만 본다
  }

  /* ⚠ 로고가 있는 쪽은 **우리 화면이 아닌** 경우가 많다(거기엔 전환 단추가 없어
       `뒤집기` 가 안 돈다). 그래서 들어오자마자 한 번 보고, 늦게 그려지는 것을 받아
       두 번 더 본다. 우리 화면이면 `로고올리기` 가 제자리로 되돌려 놓고 돌아선다. */
  로고올리기();
  setTimeout(로고올리기, 1500);
  setTimeout(로고올리기, 4000);
})();

(() => {
  const form = document.getElementById("frmSign");
  const idInput = document.getElementById("txtID");
  const pwInput = document.getElementById("txtPWD");
  const loginBtn = document.getElementById("btnLogin");
  if (!form || !idInput || !pwInput || !loginBtn) return;

  const root = document.createElement("div");
  root.id = "vp-root";
  root.innerHTML = `
    <form class="box">
      <h1>벤더피아 로그인</h1>
      <input name="vpId" placeholder="아이디" autocomplete="username" required>
      <input name="vpPw" type="password" placeholder="비밀번호" autocomplete="current-password" required>
      <button type="submit">로그인</button>
    </form>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");

  const myForm = root.querySelector("form");
  myForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    idInput.value = myForm.vpId.value.trim();
    pwInput.value = myForm.vpPw.value;
    // 새로 로그인하면 저장해 둔 목록을 버린다 (로그인 뒤 새로 받는다)
    try { await VP_DATA.clearCache(); } catch (err) { /* 저장 목록을 못 지워도 로그인은 한다 */ }
    form.requestSubmit(loginBtn);
  });
  myForm.vpId.focus();
})();
