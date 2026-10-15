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
const VP_화면글판 = "0.34.20";   // ⚠ manifest.json 의 version 과 **같은 값**

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
  const 짧게 = (t) => String(t == null ? "" : t).replace(/\s+/g, " ").slice(0, 60);
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
  function 뒤집기() {
    원래보는중 = !원래보는중;
    if (원래보는중) {
      document.documentElement.classList.remove("vp-clean");   // 가린 것을 걷는다
      for (const id of 우리것) { const el = document.getElementById(id); if (el) el.classList.add(숨김표); }
    } else {
      document.documentElement.classList.add("vp-clean");      // 다시 덮는다
      for (const id of 우리것) { const el = document.getElementById(id); if (el) el.classList.remove(숨김표); }
    }
    꼴맞추기();
    자리잡기();
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
