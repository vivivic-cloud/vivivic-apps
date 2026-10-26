// 벤더피아 로그인 화면을 로그인 칸만 있는 빈 페이지로 바꾼다.
// 입력값은 원래 로그인 폼에 그대로 넣어 제출하므로 어디에도 저장하지 않는다.
//
// ⚠ 이 글은 **벤더피아 모든 쪽에서** 돈다(불러오기.js 가 늘 넣는다). 로그인 칸이 없으면
//   아래 로그인 부분은 그냥 돌아선다. 그래서 **모든 쪽에 있어야 하는 화면전환 단추**를
//   여기에 둔다 — 새 글을 더하면 집 꼴(manifest)을 고쳐야 해서 사장님이 덮어쓰셔야 한다.

/* ⚠ 10-22: 아래 10-15 「화면전환 단추로 원래 모습 보기」 는 **지웠다**(다섯 번 안 돼서). 지금 그 자리 단추는 「벤더피아」 = 새 창 오리지널 (아래 세 번째 덩어리). 옛 말씀은 까닭으로만 남긴다. */
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
const VP_화면글판 = "0.34.64";   // ⚠ manifest.json 의 version 과 **같은 값**

/* ⚠⚠ 10-22 「벤더피아」 단추가 여는 **새 창 오리지널**의 표식을 보는 물음. 새 창(`window.name === "vp원본"`)과 그 안 모든 frame 에서는
   우리 글이 **하나도 돌지 않아야** 한다. 1차로 `불러오기.js`·`짚개.js`(확장 안)가 막고, 이 물음은 login.js 가 한 번 더 막는 안전망이다.
   ⚠ 이 창(우리 화면)에는 표식이 **없어야** 한다 — 여기서는 읽기만 하고 쓰지 않는다. */
window.VP원본창 = () => {
  try { if (window.top.name === "vp원본") return true; } catch (e) {}
  try { return sessionStorage.getItem("vp원본") === "1"; } catch (e) { return false; }
};

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
  if (window.VP원본창()) return;
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
  if (window.VP원본창()) return;
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
  if (window.VP원본창?.()) return;                    // 새 창 오리지널에서는 우리 단추도 없다

  /* ⚠⚠ **「벤더피아」 단추 = 새 창에 오리지널 벤더피아** (10-22, 0.34.40, 사장님 말씀 그대로):
       「원래화면 보기 버튼 여전히 벤더피아의 전체 화면이 안나오고 … 방법을 달리하자 그냥 원래화면 보기 버튼의
        기능은 모두 삭제하고 그자리에 벤더피아 라는 버튼을 만들어서 그걸 누르면 확장프로그램이 적용되지 않는
        오리지날 벤더피아 화면이 현재창을 유지한채 새로운 창에 뜨도록 해줘」
     ⚠ 예전 「원래 화면」/「← 우리 화면」(뒤집기·틀 띄우기·격 걷기·로고 올리기)은 **다섯 번 고쳐도 사장님 화면에서 안 돼 통째로 지웠다.**
       같은 화면 안에서 우리 글을 걷었다 덮는 길은 버렸다 — 이 창은 **손도 안 댄다.**
     ⚠ 새 창에서 우리 글이 안 돌게 하는 **표식**은 새 창의 `window.name` 이 `vp원본` 인 것이다 (`window.open(주소, "vp원본", "noopener")`).
       · 이 창에는 아무것도 적지 않는다 — 이름은 **새로 생기는 창**에만 붙고, noopener 라 이 창의 sessionStorage 도 건네지 않는다.
       · 틀 안쪽 frame 은 `window.top.name` 으로 본다(같은 출처라 읽힌다). 새 페이지로 가도 창 이름은 그대로다.
       · 보는 쪽은 **확장 안 글**(`불러오기.js`·`짚개.js`) — 거기서 멈춘다. 아래 `VP원본창` 은 같은 물음을 login.js 에서도 한다. */
  let 단추 = null;
  const 틀안인가 = () => { try { return window.top !== window && !!window.top.location.href; } catch (e) { return false; } };
  /* 열 주소 = 벤더피아 메인 틀(위·옆 메뉴가 둘러싼 맨 위 문서). 틀 안쪽이면 맨 위 문서, 아니면 이 문서가 메인이면 이 문서, 그 밖은 /index.aspx */
  const 원본주소 = () => {
    let 주소 = "";
    if (틀안인가()) { try { 주소 = window.top.location.href; } catch (e) {} }
    else if (/\/index\.aspx$/i.test(location.pathname)) 주소 = location.href;
    if (!주소) 주소 = location.origin + "/index.aspx";
    return 주소.split("#")[0];                              // # 뒤는 뗀다 (CS등록 따위가 저절로 열리지 않게)
  };
  const 열기 = () => {
    const 주소 = 원본주소();
    window.open(주소, "vp원본", "noopener");
    window.VP말?.("벤더피아:새 창 " + 주소);
  };

  /* 쪽 맨 위 빈 띠에 선다. 그 자리에 남의 것이 **겹쳐** 있으면 왼쪽으로 비켜 선다.
     ⚠ 띠는 `html.vp-위여백` 이 만든다(login.css). 띠가 밀어 주지 못하는 것은
       벤더피아가 `position:fixed` 로 띄워 둔 것뿐이다 — 그때만 비켜 선다.
       벤더피아 제 화면 꼴은 우리가 모른다. 그래서 **재서** 비킨다. */
  function 자리잡기() {
    if (!단추) return;
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

  function 단추달기() {
    if (단추) return;
    단추 = document.createElement("button");
    단추.type = "button";
    단추.id = "vp-바꾸기";
    단추.textContent = "벤더피아";
    단추.title = "확장 없는 오리지널 벤더피아를 새 창에 열기 (지금 창은 그대로)";
    /* 두 번 빠르게 누르면 **속엣말 딱지**를 켜고 끈다 (①). 그때는 새 창을 열지 않는다 —
       그래서 한 번 누른 뒤 0.35초를 기다려 두 번째가 안 오면 그때 연다(클릭 뒤 5초까지는 새 창이 막히지 않는다).
       ⚠ 바이글 안은 「길게 누르기」 였으나 그 손짓은 임자가 있다 — 짚기(손잡이)가
         0.5초 길게누름을 **창 캡처**로 먼저 잡고 뒤따르는 click 을 삼킨다
         (`shared/viggle.js` 292·301·374줄). 그래서 **두 번 누르기**로 갔다. */
    let 기다림 = null;
    단추.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      if (기다림) { clearTimeout(기다림); 기다림 = null; window.VP판보기토글?.(); return; }
      기다림 = setTimeout(() => { 기다림 = null; 열기(); }, 350);
    });
    document.documentElement.appendChild(단추);                // ⚠ 몸이 아니라 뿌리에
    /* 쪽 맨 위에 빈 띠를 만든다 — 단추가 설 자리다(login.css `html.vp-위여백`). */
    document.documentElement.classList.add("vp-위여백");
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
})();

/* ⚠⚠ 10-25 사장님: 「그냥 좌측상단에 현재버전 표시되게 해줘」 (앞: 「버전변경 안되잖아」 · 「벤더피아 연동화면에는 버전정보가 안나타나」).
   판 번호 딱지(#vp-판)는 10-15 에 숨겼다(`login.css`) — 그건 그대로 두고, **버전만** 좌측 상단에 작게 늘 보인다(#vp-버전).
   · 보이는 번호 = **지금 도는 화면글 판(`VP_화면글판`)** — 깃에서 새 글이 오면 바뀐다. 확장(깔림) 판이 다르면 `(확장 0.34.53)` 을 더한다.
     확장 안 글로 돌 때(깃에서 못 받음)는 `· 확장 안 글` 을 더한다 — 깔림 판은 딱지 글(`불러오기.js` 가 적음)에서 읽는다(안 건드림).
   · 우리 화면(`vp-clean`)이 뜬 틀에만, 아주 작은 틀은 뺀다. 새 창 오리지널(`VP원본창`)에는 없다. 자리 = 쪽 위 빈 띠 왼쪽(오른쪽은 「벤더피아」 단추). 뿌리에 단다(몸에 달면 vp-clean 이 감춘다). */
(() => {
  if (window.VP원본창?.()) return;
  let 칩 = null;
  const 글 = () => {
    let 말 = "v" + VP_화면글판;
    const 딱 = (document.getElementById("vp-판") || {}).textContent || "";
    const m = /벤더피아 보기 (?:깔림 )?(\d+(?:\.\d+)+)/.exec(딱);
    if (m && m[1] !== VP_화면글판) 말 += " (확장 " + m[1] + ")";
    const 어디 = /벤더피아 보기 [\d.]+(?: · 화면글 [\d.]+)? · ([^ ]+)/.exec(딱);
    if (어디 && 어디[1] === "확장") 말 += " · 확장 안 글";
    return 말;
  };
  const 새로 = () => { if (칩) { const g = 글(); if (칩.textContent !== g) 칩.textContent = g; } };
  function 달기() {
    if (칩 || innerWidth < 200 || innerHeight < 80) return;
    칩 = document.createElement("div");
    칩.id = "vp-버전";
    칩.title = "지금 도는 화면 글 판";
    칩.textContent = 글();
    document.documentElement.appendChild(칩);
    /* 딱지는 1.5초·4초에 다시 쓰인다 — 그때마다 확장 판·출처를 다시 읽는다 */
    [1600, 4200, 8000].forEach((ms) => setTimeout(새로, ms));
  }
  if (document.documentElement.classList.contains("vp-clean")) 달기();
  else {
    const 봄 = new MutationObserver(() => {
      if (document.documentElement.classList.contains("vp-clean")) { 달기(); 봄.disconnect(); }
    });
    봄.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setTimeout(() => 봄.disconnect(), 20000);
  }
})();

(() => {
  if (window.VP원본창()) return;                      // 새 창 오리지널에서는 로그인 화면도 벤더피아 그대로
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
