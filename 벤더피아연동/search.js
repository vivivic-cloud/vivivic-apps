// 배송관리(배송목록조회) 화면을 기간 + 검색창 하나로 바꾼다.
// 조회는 원래 화면의 검색 폼을 그대로 벤더피아에 보내고, 받은 결과에서 목록만 뽑아 보여준다.
(() => {
  const form = document.forms[0];
  const searchBtn = document.getElementById("btnSearch");
  const startDt = document.getElementById("dcStartDt");
  const endDt = document.getElementById("dcEndDt");
  if (!form || !searchBtn || !startDt || !endDt) return;

  const fieldNames = [...new FormData(form).keys()];
  const fullName = (id) => fieldNames.find((n) => n === id || n.endsWith("$" + id)) || id;

  // 검색어 한 단어가 목록 칸의 항목과 똑같으면 그 칸을 고른다 (앞에 있을수록 우선)
  const SELECTS = ["ddlDStatus", "ddlCSType", "ddlStoreGb", "ddlDeliveryCo", "ddlMall", "ddlStore",
    "ddlLoc", "ddl_RecallGb", "ddlStockType", "ddlInvoiceSendYn", "ddlSupplier"];
  const norm = (s) => s.replace(/^\d+\s+/, "").replace(/\s/g, "").toLowerCase();

  function matchSelect(token) {
    for (const id of SELECTS) {
      const sel = document.getElementById(id);
      if (!sel) continue;
      const opt = [...sel.options].find((o) => o.text !== "전체" && norm(o.text) === norm(token));
      if (opt) return { id, value: opt.value, label: opt.text };
    }
    return null;
  }

  // 검색어를 벤더피아 검색칸에 나눠 담는다
  function plan(query) {
    const filters = {};      // 목록 칸 (모든 조회에 함께 적용)
    let variants = null;     // 벤더피아에 보낼 조회들 (결과를 칸별로 나눠 보여줌)
    const local = [];        // 받아온 목록 안에서 거르는 말 (전화번호 등)

    for (const token of query.trim().split(/\s+/).filter(Boolean)) {
      const sel = matchSelect(token);
      if (sel) { filters[sel.id] = sel.value; continue; }

      const digits = token.replace(/-/g, "");
      const isNumber = /^[\d-]+$/.test(token);
      const isPhone = isNumber && /^0\d{8,10}$/.test(digits);
      const isShortNumber = isNumber && digits.length <= 8;

      if (variants || isPhone || isShortNumber) { local.push(token); continue; }

      if (isNumber) {
        variants = [["송장번호", { tbInvoiceNo: token }], ["주문번호", { tbSOrderNo: token }]];
      } else if (/[A-Za-z]/.test(token) && !/[가-힣]/.test(token)) {
        variants = [["단품코드", { tbGoodsCd: token }]];
      } else {
        // 서버 응답이 빠른 칸부터 (상품명이 가장 느림)
        variants = [["수취인", { tbRecipient: token }], ["주문자", { tbOrderer: token }],
          ["주소", { tbAddr0: token }], ["상품명", { tbSGoodsNm: token }]];
      }
    }
    return { filters, variants: variants || [["전체", {}]], local };
  }

  async function fetchList(fields, rowCnt) {
    const fd = new FormData(form);
    for (const k of [...fd.keys()]) if (k.includes("chkItem")) fd.delete(k);
    fd.append(searchBtn.name + ".x", "5");
    fd.append(searchBtn.name + ".y", "5");
    fd.set(fullName("ddlRowCnt"), rowCnt);
    for (const [id, v] of Object.entries(fields)) fd.set(fullName(id), v);

    const res = await fetch(form.action, { method: "POST", body: fd, credentials: "include" });
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const count = (doc.body.textContent.match(/([\d,]+)\s*건/) || [])[1] || "0";
    const th = [...doc.querySelectorAll("th")].find((c) => c.textContent.trim() === "수취인");
    if (!th) return { count, heads: [], rows: [] };
    const heads = [...th.parentElement.children].map((c) => c.textContent.trim());
    const rows = [...doc.querySelectorAll("tr")]
      .filter((tr) => tr.children.length === heads.length && !tr.querySelector("th"))
      .map((tr) => [...tr.children].map((c) => c.textContent.trim()));
    return { count, heads, rows };
  }

  /* ⚠⚠ 10-15 사장님 (배송관리를 짚으시고, 그대로):
       「불러온 데이터 가로스크롤로 실제 벤더피아의 모든 정보를 동일하게 볼 수 있게해줘」
     가로스크롤은 10-14 에 이미 됐다. 모자란 것은 **칸**이었다 —
     여기 여덟 개만 적어 두고 **그 여덟만 그리고 있었다.** 벤더피아가 준 나머지 칸은
     `fetchList` 가 **받아는 오는데**(`heads`) 그리지 않고 버렸다.
     → 이제 **벤더피아가 준 머리줄(`heads`)을 그대로** 그린다. 이름도 차례도 벤더피아 것이다.
     칸을 줄이지도 합치지도 않는다. 넘치면 **가로로 민다**(10-14 에 깐 그대로). */

  const root = document.createElement("div");
  root.id = "vp-root";
  root.className = "vp-wide";
  root.innerHTML = `
    <div class="vp-search">
      <a class="vp-home" href="/index.aspx">← 메인</a>
      <h1>배송관리</h1>
      <form class="vp-bar">
        <input type="date" name="from" required>
        <span>~</span>
        <input type="date" name="to" required>
        <input name="q" class="vp-q" placeholder="송장번호, 주문번호, 이름, 상품명, 주소, 전화번호, 배송상태…">
        <button type="submit">조회</button>
      </form>
      <div class="vp-pills"></div>
      <div class="vp-note"></div>
      <div class="vp-table"></div>
    </div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");

  const bar = root.querySelector(".vp-bar");
  const note = root.querySelector(".vp-note");
  const table = root.querySelector(".vp-table");
  const 알약칸 = root.querySelector(".vp-pills");

  /* ⚠⚠ 10-14 사장님 (배송관리 화면에서 짚어 보내신 말씀, 그대로):
       「벤더피아 배송관리의 실제 필터들을 확인하여 필터를 버튼형식으로 페이지상단에 보여주세요」
     벤더피아 진짜 폼의 고르는 칸은 **열하나**다 (위 SELECTS 줄). 그 가운데 **넷**을 알약으로 깐다.
     나머지 일곱은 지금처럼 검색창에 그 말을 치면 그대로 잡힌다(matchSelect).
     ⚠ **고를 수 있는 값은 짐작하지 않는다** — 그 화면의 <select> 에 든 <option> 을 그때그때 읽는다.
       화면에 없는 칸이나, 「전체」 말고 고를 것이 없는 칸은 **아예 안 그린다.**
     ⚠ 칸 이름(한글)은 id 에서 미루어 적은 것이다. 진짜 화면 글자와 다르면 여기만 고치면 된다. */
  /* ⚠⚠ 10-15 사장님 (배송관리 거르개를 짚으시고, 그대로):
       「지금 형태의 필터링 버튼을 나열하기 보다 각 필터링제목 즉 배송상태 배송사 매출처 별
         드롭다운 해당 선택 하게 해줘 , 송장전송 필터링은 없어도 됨」
     10-14 에 깐 **알약 나열**을 이 말씀이 고쳐 쓰신다 → **제목별 드롭다운 셋.**
     · 제목 단추에 **고른 값이 함께 보인다** (보기: 「배송사 · 경동택배(포천)」).
     · **송장전송은 뺀다** — 사장님이 「없어도 됨」 하셨다.
     · 「전부」 는 갈래마다 맨 앞에 그대로 둔다 (끄는 길).
     ⚠ **거르는 셈은 한 글자도 안 바꿨다** — 바뀐 것은 고르는 **모습**뿐이다. */
  const 거르개들 = [
    ["ddlDStatus", "배송상태"],
    ["ddlDeliveryCo", "배송사"],
    ["ddlStore", "매출처"],
    /* ⑤ CS — 사장님 10-15: 「cs버튼을 추가하여 해당 필터 선택시 cs열값에 값이 있는 목록만
         보이게 해주세요」 (장부 a1792028103)
       ⚠ 이것만은 **벤더피아에 보내는 거르개가 아니다.** 벤더피아에도 `ddlCSType` 칸이
         있으나 그것은 「**어느** CS 인가」 를 고르는 칸이라 「**값이 있는 것만**」 을
         한 번에 못 묻는다. 그래서 **받아 온 줄을 우리가 거른다.**
       ⚠ 받아 온 줄만 거른다 — 「결과가 많아 일부만 받아왔습니다」 가 뜬 조회에서는
         안 받아 온 줄의 CS 는 셈에 안 든다. 기간을 좁히시면 다 든다.
       ⚠ 이름이 `__` 로 시작하는 것은 **벤더피아로 안 보낸다**(`알약값`). */
    ["__cs", "CS", [["", "전부"], ["있음", "CS 있는 것만"]]],
  ];
  const 고른것 = {};                                   // { 칸id: 고른 값 } — 빈 값이면 「전부」

  /* 벤더피아가 준 머리줄에서 CS 칸이 몇 번째인가. -1 이면 그 화면엔 CS 칸이 없다.
     ⚠ 칸 이름을 코드에 박지 않는다 — 머리글에 「cs」 가 든 칸을 찾는다
       (「CS」·「CS구분」·「CS유형」 어느 꼴로 와도 받는다). */
  let cs칸 = -1;
  const cs찾기 = (heads) =>
    (heads || []).findIndex((h) => /cs/i.test(String(h == null ? "" : h).replace(/\s/g, "")));

  let 펼친것 = null;                                   // 지금 펼쳐 둔 갈래 (하나만 펼친다)
  function 알약그리기() {
    알약칸.replaceChildren();
    for (const [id, 이름, 제보기] of 거르개들) {
      let 보기;
      if (제보기) {
        /* 우리 것 (CS) — 머리줄에 그 칸이 **있을 때만** 둔다. 없는 화면에 두면
           눌러도 아무 일이 없는 **가짜 단추**가 된다. 첫 조회로 머리줄을 알면 다시 그린다. */
        if (cs칸 < 0) continue;
        보기 = 제보기;
      } else {
        const sel = document.getElementById(id);
        if (!sel) continue;                            // 그 화면에 없는 칸
        const 전체 = [...sel.options].find((o) => o.text.trim() === "전체");
        const 고를것 = [...sel.options].filter((o) => o !== 전체 && o.text.trim());
        if (고를것.length < 2) continue;               // 고를 것이 하나뿐이면 둘 까닭이 없다
        /* 끄는 길 — 「전부」 가 늘 맨 앞에 있다 */
        보기 = [[전체 ? 전체.value : "", "전부"], ...고를것.map((o) => [o.value, o.text.trim()])];
      }
      const 지금값 = 고른것[id] || "";
      const 지금글 = (보기.find(([값]) => (값 || "") === 지금값) || [, "전부"])[1];

      const 갈래 = document.createElement("div");
      갈래.className = "vp-drop" + (지금값 ? " vp-drop-on" : "");
      const 머리 = document.createElement("button");
      머리.type = "button";
      머리.className = "vp-drop-head";
      머리.setAttribute("aria-expanded", 펼친것 === id ? "true" : "false");
      머리.setAttribute("aria-pressed", 지금값 ? "true" : "false");
      머리.appendChild(Object.assign(document.createElement("span"),
        { className: "vp-drop-name", textContent: 이름 }));
      머리.appendChild(Object.assign(document.createElement("span"),
        { className: "vp-drop-value", textContent: 지금글 }));
      머리.appendChild(Object.assign(document.createElement("span"),
        { className: "vp-drop-arrow", textContent: "▾" }));
      머리.addEventListener("click", (e) => {
        e.stopPropagation();
        펼친것 = 펼친것 === id ? null : id;
        알약그리기();
      });
      갈래.appendChild(머리);

      if (펼친것 === id) {
        const 판 = document.createElement("div");
        판.className = "vp-drop-list";
        for (const [값, 글] of 보기) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "vp-drop-item";
          b.textContent = 글;
          b.setAttribute("aria-pressed", (값 || "") === 지금값 ? "true" : "false");
          b.addEventListener("click", (e) => {
            e.stopPropagation();
            고른것[id] = 값 || "";
            펼친것 = null;
            알약그리기();
            bar.requestSubmit();                       // 고르면 그 조건으로 바로 다시 조회
          });
          판.appendChild(b);
        }
        갈래.appendChild(판);
      }
      알약칸.appendChild(갈래);
    }
  }
  /* 바깥을 누르면 펼친 것을 접는다 */
  document.addEventListener("click", () => { if (펼친것) { 펼친것 = null; 알약그리기(); } });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && 펼친것) { 펼친것 = null; 알약그리기(); }
  });

  /* 켜진 알약만 조회에 싣는다 (「전부」 는 안 싣는다 — 원래 폼 값 그대로 둔다) */
  const 알약값 = () => Object.fromEntries(Object.entries(고른것)
    .filter(([k, v]) => v && !k.startsWith("__")));    // `__` 로 시작하는 것은 우리끼리 쓰는 것
  알약그리기();
  bar.from.value = startDt.value;
  bar.to.value = endDt.value;
  bar.q.focus();

  /* ④ **상품명 칸을 상품관리의 그 상품버튼으로** — 사장님 10-15:
       「이곳에 도착하는 상품명을 상품관리와 동일한 상품버튼으로 변경해 주세요.
         이버튼으로 나타나는 동작은 상품관리의 상품버튼과 동일 합니다.」
     ⚠ 상품관리 코드를 **베끼지 않는다.** `goods.js` 를 **그대로 불러** 곁다리로 돌리고
       (`window.VP상품단추요청`), 단추는 그 글이 만들어 준다.
     ⚠ `불러오기.js`(확장 안)는 배송관리 쪽에 `goods.js` 를 안 보낸다. 거기를 고치면
       사장님이 **덮어쓰셔야** 한다. 그래서 **이 글이 온 그 주소**에서 형제 파일을 불러온다 —
       깃이든 확장이든, 캐시표(`?v=…&t=…`)까지 그대로 따라온다.
     ⚠ 상품관리에 **없는 이름**은 글자 그대로 둔다. 가짜 단추를 만들지 않는다. */
  const 내주소 = (() => {
    const me = document.currentScript
      || [...document.querySelectorAll("script[src]")].reverse()
           .find((x) => /search\.js(\?|$)/.test(x.src));
    return me ? me.src : null;
  })();
  const 형제 = (이름) => 내주소 && 내주소.replace(/search\.js(?=\?|$)/, 이름);
  function 상품단추불러오기() {
    /* ⚠⚠ 이것은 **뒷길**이다. 10-15 부터는 `불러오기.js`(확장)가 배송관리에도
       `goods.js`·`goods.css` 를 **제대로 보낸다.** 이 길은 확장이 옛 판인 분을 위해 남겨 둔다.
       ⚠ 확장이 이미 보냈으면 **또 넣지 않는다** — 넣으면 같은 글을 두 번 받는다.
         (그래도 `goods.js` 가 스스로 한 번만 돌게 막아 둔다 — 두 겹으로 막는다.) */
    window.VP상품단추요청 = true;                      // 뒤에 올 goods.js 에게 알리는 표
    /* ⚠⚠ **차례를 재서 잡았다 (10-15).** `불러오기.js` 는 `search.js` 를 **먼저** 넣고
         `goods.js` 를 **그 뒤에** 넣는다. 그래서 이 자리에서 `script[src*=goods.js]` 를
         찾아봐도 **아직 없다** — 그 검사는 영영 안 맞는다(재서 확인).
       그러니 **기다렸다가** 본다. 확장이 보냈으면 그동안 `goods.js` 가 돌아
         `__vp굿즈돌았나` 가 서니, 뒷길은 **아예 안 나선다**. 옛 판을 쓰시는 분 화면에서만 나선다. */
    setTimeout(() => {
      if (window.__vp굿즈돌았나 || window.VP상품단추) return;   // 확장이 이미 보냈다
      뒷길로부르기();
    }, 2500);
  }
  function 뒷길로부르기() {
    const js = 형제("goods.js");
    /* ⚠ 까닭을 적는다 (10-15) — 사장님 PC 에서 **조용히** 안 됐다 */
    if (!js) { window.VP말?.("상품단추:내주소못찾음"); return; }
    window.VP말?.("상품단추:부름 " + (js.split("/").pop() || "").slice(0, 24));
    const css = 형제("goods.css");
    if (css && !document.querySelector('link[href*="goods.css"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = css; l.dataset.vp = "goods.css";
      document.head.appendChild(l);
    }
    const sc = document.createElement("script");
    sc.src = js;
    sc.async = false;
    sc.addEventListener("error", () => window.VP말?.("상품단추:goods.js못받음"));
    sc.addEventListener("load", () => window.VP말?.("상품단추:goods.js받음"
      + (window.VP상품단추 ? "/셈있음" : "/**셈없음**")));
    document.head.appendChild(sc);
  }
  상품단추불러오기();

  /* ── 상담 이력 ──────────────────────────────────────────
     사장님 10-15: 「**상담할때 고객문의에 이력을 남기는데 이력남길수있게 해주세요**」
     (장부 a1792056118 · 짚은자리 `td.vp-상품칸`, 배송관리 표)

     ⚠⚠ **벤더피아에는 아무것도 안 쓴다.** 집 규칙 — 벤더피아에서는 **조회만**.
       「고객문의」 가 벤더피아 제 칸이면 거기에 안 쓰고, **우리 칸에 따로 쌓아** 그 줄에 보인다.
     ⚠⚠ **사람 칸을 담지 않는다.** 열쇠는 **주문번호** 하나뿐이고, 담는 것은
       **적으신 글 · 적은 때 · 적은이** 셋뿐이다. 수취인 이름·전화·주소는 **긁어 담지 않는다.**
       (사장님이 글 안에 손으로 적으시는 것은 사장님 뜻이다 — 그것까지 막지 않는다.)
     ⚠⚠ **지우는 길을 만들지 않는다.** 이력은 쌓이는 기록이다. 고치면 앞 글을 남기고
       새 줄을 쌓는다. 책임 기록이라 사장님도 저도 지우지 않는다(바이글 10-15).
     ⚠ 칸 이름에 `vp_` 를 쓰지 않는다 — 그 꼴은 사장님 uid 라야 손이 닿는다. `vpcs_note` 다.
     ⚠ 창고 칸 이름은 **아스키**로 둔다(`ord`·`cnt`·`at`·`log`). 주소에 실려 가는 이름이라
       한글은 번지수가 길어지고 가리기 쉽다. 화면에 보이는 말은 한글 그대로다. */
  const 상담칸 = "vpcs_note";
  const 상담 = {
    KEY: "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs",
    PROJ: "vivivic-4b7ef",
  };
  const 상담뿌리 = () => `https://firestore.googleapis.com/v1/projects/${상담.PROJ}`
    + `/databases/(default)/documents/artifacts/${상담.PROJ}/public/data/${상담칸}`;
  /* 주문번호를 문서 이름으로 쓴다. 창고가 못 받는 글자는 `_` 로 바꾼다. */
  const 상담열쇠 = (주문) => String(주문 == null ? "" : 주문).trim()
    .replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 180);

  /* 밖으로 나가는 길 — **읽기는 확장 다리를 먼저** 쓴다(벤더피아 쪽 CSP 에 안 묶인다).
     ⚠⚠ **쓰기는 다리로 보내지 않는다.** 다리는 읽기만 지나가게 막아 두었고
       (`불러오기.js` 의 `허락한셈`), 그 막음을 **넓히지 않는다.** 쓰기는 화면 쪽에서 바로 보낸다 —
       화면 쪽 받아오기는 원래 누구나 할 수 있는 것이라 확장 권한이 **안 넓어진다.**
       ⚠ 다만 벤더피아 쪽 CSP(`connect-src`)가 막으면 **쓰기가 안 된다.** 그때는 조용히
         지나가지 않고 **까닭을 적고 화면에 알린다**(아래 `상담쓰기`). */
  let 상담표 = null;
  async function 상담로그인() {
    try {
      const 둔것 = JSON.parse(localStorage.getItem("vg.tok") || "null");
      if (둔것 && 둔것.until > Date.now() + 60000) return 둔것.tok;
    } catch (e) {}
    const 주소 = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${상담.KEY}`;
    const 옵션 = { method: "POST", headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({ returnSecureToken: true }) };
    let 글 = null;
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션);
      if (답 && 답.다리 && 답.ok) 글 = 답.글;
    }
    if (글 === null) {
      const r = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션));
      if (!r.ok) throw new Error("표 " + r.status);
      글 = await r.text();
    }
    const d = JSON.parse(글);
    if (!d.idToken) throw new Error("표 없음");
    try { localStorage.setItem("vg.tok", JSON.stringify({ tok: d.idToken, until: Date.now() + 3300000 })); } catch (e) {}
    return d.idToken;
  }
  const 상담표받기 = async () => (상담표 = 상담표 || await 상담로그인());

  async function 상담읽기(주소) {                      // GET — 다리를 먼저
    const tok = await 상담표받기();
    const 옵션 = { headers: { Authorization: "Bearer " + tok } };
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션);
      if (답 && 답.다리) return { ok: 답.ok, status: 답.status, 글: 답.글 };
    }
    const r = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션));
    return { ok: r.ok, status: r.status, 글: await r.text() };
  }

  /* 창고 꼴 ↔ 보통 값 */
  const 풀기 = (v) => {
    if (!v) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("nullValue" in v) return null;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(풀기);
    if ("mapValue" in v) {
      const o = {};
      for (const [k, x] of Object.entries(v.mapValue.fields || {})) o[k] = 풀기(x);
      return o;
    }
    return null;
  };
  const 싸기 = (v) => {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === "number") return Number.isInteger(v)
      ? { integerValue: String(v) } : { doubleValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(싸기) } };
    if (typeof v === "object") return { mapValue: { fields:
      Object.fromEntries(Object.entries(v).map(([k, x]) => [k, 싸기(x)])) } };
    return { stringValue: String(v) };
  };

  /* 적은이 — 벤더피아에 들어와 계신 아이디. 손님 칸이 아니라 **우리 쪽 사람**이다. */
  const 적은이 = () => decodeURIComponent((document.cookie.match(/VP_Cookie=([^;]*)/) || [])[1] || "")
    .match(/LOGON_EMP_NO=([^&]*)/)?.[1] || "";

  const 상담셈 = new Map();                            // 열쇠 → 쌓인 줄 수
  let 주문칸자리 = -1;
  const 상담칸들 = [];                                 // [칸, 주문번호] — 늦게 와도 점을 찍는다

  /* 어느 줄에 이력이 있나 — **셈만** 받는다(`mask`). 글까지 받으면 쌓일수록 무거워진다. */
  async function 상담셈받기() {
    try {
      const 답 = await 상담읽기(상담뿌리() + "?pageSize=300&mask.fieldPaths=cnt");
      if (!답.ok) { window.VP말?.("상담:셈못받음 " + 답.status); return; }
      for (const d of (JSON.parse(답.글).documents || [])) {
        const 이름 = String(d.name || "").split("/").pop();
        상담셈.set(이름, 풀기(d.fields && d.fields.cnt) || 0);
      }
      window.VP말?.("상담:이력있는줄 " + 상담셈.size + "개");
      for (const [칸, 주문] of 상담칸들) 상담점찍기(칸, 주문);
    } catch (e) {
      window.VP말?.("상담:셈못받음 " + (e && e.message ? e.message : e));
    }
  }

  function 상담점찍기(칸, 주문) {
    const 알 = 칸.querySelector(".vp-상담알");
    if (!알) return;
    const 수 = 상담셈.get(상담열쇠(주문)) || 0;
    알.classList.toggle("vp-있음", 수 > 0);
    알.textContent = 수 > 0 ? "상담 " + 수 : "상담";
  }

  /* 주문번호 칸에 **작은 단추 하나**만 더한다 — 칸을 새로 내지 않는다.
     (배송관리 23칸을 밀어내지 않는다 — 사장님이 그 칸을 다 보셔야 한다) */
  function 상담단추(td, 주문) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "vp-상담알";
    b.title = "상담 이력 남기기 · 보기";
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); 상담판열기(주문); });
    td.appendChild(b);
    상담칸들.push([td, 주문]);
    상담점찍기(td, 주문);
  }

  /* ── 상담 판 ── */
  let 상담판 = null;
  function 상담판닫기() { if (상담판) { 상담판.remove(); 상담판 = null; } }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") 상담판닫기(); });

  async function 상담판열기(주문) {
    상담판닫기();
    const 열쇠 = 상담열쇠(주문);
    if (!열쇠) return;
    const 덮개 = document.createElement("div");
    덮개.className = "vp-상담덮개";
    덮개.innerHTML = `<div class="vp-상담판" role="dialog" aria-label="상담 이력">
      <div class="vp-상담머리"><strong></strong><button type="button" class="vp-상담닫기" aria-label="닫기">×</button></div>
      <div class="vp-상담목록">불러오는 중…</div>
      <form class="vp-상담적기">
        <textarea rows="3" placeholder="오간 말을 적으십시오 (지울 수 없습니다 — 쌓입니다)"></textarea>
        <div class="vp-상담발"><span class="vp-상담알림"></span><button type="submit">남기기</button></div>
      </form></div>`;
    덮개.querySelector("strong").textContent = "상담 이력 · " + 주문;
    덮개.querySelector(".vp-상담닫기").addEventListener("click", 상담판닫기);
    덮개.addEventListener("mousedown", (e) => { if (e.target === 덮개) 상담판닫기(); });
    document.getElementById("vp-root")?.appendChild(덮개) || document.body.appendChild(덮개);
    상담판 = 덮개;

    const 목록 = 덮개.querySelector(".vp-상담목록");
    const 알림 = 덮개.querySelector(".vp-상담알림");
    const 적기 = 덮개.querySelector(".vp-상담적기");
    const 글칸 = 덮개.querySelector("textarea");
    let 쌓인것 = [];

    const 그리기 = () => {
      if (!쌓인것.length) { 목록.textContent = "아직 남긴 것이 없습니다."; return; }
      목록.replaceChildren(...쌓인것.slice().reverse().map((x) => {
        const 줄 = document.createElement("div");
        줄.className = "vp-상담줄";
        const 머리 = 줄.appendChild(document.createElement("small"));
        const 때 = x.at ? new Date(x.at * 1000) : null;
        머리.textContent = (때 ? 때.toLocaleString("ko-KR") : "") + (x.by ? " · " + x.by : "");
        const 몸 = 줄.appendChild(document.createElement("p"));
        몸.textContent = x.s || "";
        return 줄;
      }));
    };

    try {
      const 답 = await 상담읽기(상담뿌리() + "/" + encodeURIComponent(열쇠));
      if (답.ok) 쌓인것 = (풀기(JSON.parse(답.글).fields?.log) || []).filter(Boolean);
      else if (답.status !== 404) { 목록.textContent = "못 읽었습니다 (" + 답.status + ")"; return; }
      그리기();
    } catch (e) {
      목록.textContent = "못 읽었습니다";
      window.VP말?.("상담:읽기못함 " + (e && e.message ? e.message : e));
      return;
    }

    적기.addEventListener("submit", async (e) => {
      e.preventDefault();
      const 글 = 글칸.value.trim();
      if (!글) return;
      const 단추 = 적기.querySelector("button");
      단추.disabled = true;
      알림.textContent = "남기는 중…";
      try {
        await 상담쓰기(열쇠, 주문, 글, 쌓인것);
        쌓인것 = 쌓인것.concat([{ s: 글, at: Math.floor(Date.now() / 1000), by: 적은이() }]);
        상담셈.set(열쇠, 쌓인것.length);
        for (const [칸, 주] of 상담칸들) 상담점찍기(칸, 주);
        글칸.value = "";
        알림.textContent = "남겼습니다";
        그리기();
      } catch (err) {
        /* ⚠ **조용히 지나가지 않는다.** 사장님께 글로 알리고 까닭도 적는다. */
        알림.textContent = "못 남겼습니다 — " + (err && err.message ? err.message : err);
        window.VP말?.("상담:못남김 " + (err && err.message ? err.message : err));
      } finally {
        단추.disabled = false;
      }
    });
    글칸.focus();
  }

  /* 한 줄 쌓기 — **앞 글을 그대로 두고 뒤에 더한다.** 지우지 않는다.
     ⚠ 쓰기는 **화면 쪽에서 바로** 보낸다. 확장 다리는 읽기만 지나가게 막혀 있고
       그 막음을 넓히지 않는다(10-15). */
  async function 상담쓰기(열쇠, 주문, 글, 앞것) {
    const tok = await 상담표받기();
    const 이제 = Math.floor(Date.now() / 1000);
    const 쌓기 = (앞것 || []).concat([{ s: 글, at: 이제, by: 적은이() }]);
    const 주소 = 상담뿌리() + "/" + encodeURIComponent(열쇠)
      + "?updateMask.fieldPaths=ord&updateMask.fieldPaths=cnt"
      + "&updateMask.fieldPaths=at&updateMask.fieldPaths=log";
    const 몸 = JSON.stringify({ fields: {
      ord: 싸기(String(주문)), cnt: 싸기(쌓기.length), at: 싸기(이제), log: 싸기(쌓기) } });
    const r = await fetch(주소, { method: "PATCH", credentials: "omit",
      headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body: 몸 });
    if (!r.ok) throw new Error("창고 " + r.status);
    window.VP말?.("상담:남김 " + 쌓기.length + "줄");
  }

  let tbody = null;
  let currentSearch = 0;
  /* 상품명 칸들을 적어 둔다 — 목록이 늦게 와도 그때 단추로 바꿔 끼운다 */
  let 상품칸들 = [];
  let 상품칸자리 = -1;
  let 단추된것 = 0;
  function 상품칸채우기(td, 이름) {
    const 만들기 = window.VP상품단추;
    const b = 만들기 ? 만들기(이름) : null;
    if (!b) { td.textContent = 이름; return false; }   // 상품관리에 없는 이름 → 글자 그대로
    td.replaceChildren(b);
    단추된것++;
    return true;
  }
  /* ⚠ 까닭 적기 — **그려 놓고 보니** 몇 칸이 단추가 됐나. 이것이 ⑤ 를 가른다:
       칸이 0개면 상품명 칸을 못 찾은 것, 칸은 있고 단추가 0개면 **이름이 하나도 안 맞은** 것. */
  const 상품칸셈적기 = () => window.VP말?.(
    "상품칸:" + 상품칸들.length + "개중 단추" + 단추된것 + "개");
  window.addEventListener("vp상품단추준비", () => {
    let 바뀐것 = 0;
    for (const [td, 이름] of 상품칸들) if (상품칸채우기(td, 이름)) 바뀐것++;
    window.VP말?.("상품단추:준비 상품" + (window.VP상품목록몇개?.() ?? "?")
      + "가지 · 늦게바꾼칸 " + 바뀐것 + "개");
    상품칸셈적기();
  });

  let 그린머리 = null;                                 // 지금 그려 둔 머리줄 (벤더피아가 준 그대로)
  /* ⚠⚠ **머리줄 배우기는 줄 수와 떼어 놓는다 (10-15).**
       전에는 이 일이 `addRows` 안에 있었다. 그런데 `addRows` 는 첫 줄이
       `if (!rows.length) return;` 이다 — **줄이 하나도 없으면 바로 돌아선다.**
       그러면 머리줄을 영영 못 배우고 **CS 거르개가 끝내 안 선다.**
       줄이 0 이 되는 길이 셋이나 있다:
         ㄱ) 벤더피아가 「총 0 건」 을 줄 때
         ㄴ) 검색어로 우리가 거른 뒤 하나도 안 남을 때
         ㄷ) 「CS 있는 것만」 으로 거른 뒤 하나도 안 남을 때
       그래서 **받자마자**(`take` 맨 앞) 머리줄만 따로 배운다. 거르기 전이다.
       사장님 10-15: CS 단추가 안 섰다 — 바이글이 이 길을 짚어 주었다. */
  let 머리본것 = null;
  function 머리알기(heads) {
    if (!heads || !heads.length) {
      /* `fetchList` 는 머리줄을 **「수취인」 칸으로** 찾는다. 그 칸이 없으면 아무것도 못 읽는다. */
      window.VP말?.("머리줄:못읽음(수취인칸없음)");
      return;
    }
    const 글 = heads.join("\u0001");
    if (머리본것 === 글) return;                       // 같은 머리줄은 한 번만
    머리본것 = 글;
    /* ⑤ CS 칸이 있으면 거르개 줄에 CS 를 내놓는다 */
    const 찾은것 = cs찾기(heads);
    if (찾은것 !== cs칸) { cs칸 = 찾은것; 알약그리기(); }
    /* ④ 상품명 칸이 몇 번째인가 — 그 칸만 단추로 바꾼다 */
    상품칸자리 = heads.indexOf("상품명");
    /* 상담 이력 — 열쇠는 **주문번호** 하나뿐이다(사람 칸은 안 쓴다).
       ⚠ 사장님 화면에는 「주문번호」 가 **두 칸** 있다. 앞엣것을 쓴다 — `indexOf` 가 그렇게 집는다. */
    주문칸자리 = heads.indexOf("주문번호");
    if (주문칸자리 < 0) window.VP말?.("상담:주문번호칸없음");
    else if (!상담셈.size) 상담셈받기();
    /* ⚠ 까닭을 적는다 — 못 찾았으면 **벤더피아가 준 칸 이름 그대로** 적는다.
         그래야 「CS」 인지 「CS구분」 인지 「cs상태」 인지 사장님 화면에서 보인다. */
    window.VP말?.("칸" + heads.length + "개 CS자리" + cs칸 + " 상품명자리" + 상품칸자리);
    if (cs칸 < 0 || 상품칸자리 < 0)
      window.VP말?.("머리줄:" + heads.slice(0, 12).join(","));
  }

  function addRows(heads, rows) {
    if (!rows.length) return;
    if (!tbody) {
      그린머리 = heads.slice();                        // ⚠ 벤더피아 칸을 **하나도 안 빼고** 그대로
      const t = document.createElement("table");
      const head = t.createTHead().insertRow();
      그린머리.forEach((c, i) => {
        const th = head.appendChild(document.createElement("th"));
        th.textContent = c;
        if (i === 0) th.className = "vp-first";        // 첫 칸은 가로로 밀어도 붙어 있는다
      });
      tbody = t.createTBody();
      table.replaceChildren(t);
    }
    for (const row of rows) {
      const tr = tbody.insertRow();
      그린머리.forEach((c, i) => {
        const td = tr.insertCell();
        const 값 = row[i] === undefined ? "" : row[i];
        if (i === 상품칸자리 && String(값).trim()) {
          td.className = "vp-상품칸" + (i === 0 ? " vp-first" : "");
          상품칸들.push([td, 값]);
          상품칸채우기(td, 값);
          return;
        }
        td.textContent = 값;
        if (i === 0) td.className = "vp-first";
        /* 상담 이력 단추 — **그 칸 안에** 작게 붙인다. 칸을 새로 내지 않는다
           (배송관리 23칸을 밀어내지 않는다 — 사장님이 그 칸을 다 보셔야 한다). */
        if (i === 주문칸자리 && String(값).trim()) {
          td.classList.add("vp-주문칸");
          상담단추(td, String(값).trim());
        }
      });
    }
    상품칸셈적기();
  }

  // 벤더피아에 매번 직접 조회한다 (항상 최신 상태).
  // 50줄을 먼저 받아 바로 보여주고, 더 있으면 600줄까지 이어서 받는다. 결과는 도착하는 대로 덧붙인다.
  bar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchId = ++currentSearch;
    const { filters, variants, local } = plan(bar.q.value);
    const dates = { dcStartDt: bar.from.value, dcEndDt: bar.to.value };

    tbody = null; 그린머리 = null; 상품칸들 = []; 상품칸자리 = -1; 단추된것 = 0; 머리본것 = null;
    상담칸들.length = 0; 주문칸자리 = -1; 상담판닫기();
    table.replaceChildren();
    const seen = new Set();
    let shown = 0;
    let cut = false;

    const take = (r) => {
      /* ⚠ **거르기 전에** 머리줄부터 배운다 — 거른 뒤 하나도 안 남아도 거르개는 서야 한다 */
      머리알기(r.heads);
      if (!r.rows.length) window.VP말?.("조회:벤더피아가 0줄");
      /* ⑤ 「CS 있는 것만」 — 받아 온 줄에서 CS 칸이 빈 줄을 버린다.
         칸을 못 찾으면(-1) 아무것도 안 거른다 — 빈 표를 보여 드리는 것이 더 나쁘다. */
      const cs만 = (고른것.__cs || "") === "있음";
      const cs자리 = cs만 ? cs찾기(r.heads) : -1;
      const fresh = r.rows.filter((row) => {
        const key = row.join("\t");
        if (seen.has(key)) return false;
        seen.add(key);
        if (cs자리 >= 0 && !String(row[cs자리] == null ? "" : row[cs자리]).trim()) return false;
        const text = row.join(" ");
        const digits = text.replace(/\D/g, "");
        return local.every((w) => text.includes(w) || (/^[\d-]+$/.test(w) && digits.includes(w.replace(/-/g, ""))));
      });
      addRows(r.heads, fresh);
      shown += fresh.length;
    };
    const status = (busy) => {
      note.textContent = `${shown.toLocaleString()}건` +
        (busy ? " · 더 찾는 중…" : cut ? " · 결과가 많아 일부만 받아왔습니다. 기간을 좁혀 보세요." : "");
    };

    try {
      status(true);
      const more = [];
      for (const [, fields] of variants) {
        const r = await fetchList({ ...dates, ...알약값(), ...filters, ...fields }, "50");
        if (searchId !== currentSearch) return;
        take(r);
        status(true);
        if (Number(r.count.replace(/,/g, "")) > r.rows.length) more.push(fields);
      }
      for (const fields of more) {
        const r = await fetchList({ ...dates, ...알약값(), ...filters, ...fields }, "600");
        if (searchId !== currentSearch) return;
        take(r);
        if (Number(r.count.replace(/,/g, "")) > r.rows.length) cut = true;
        status(true);
      }
      status(false);
      if (!shown) table.textContent = "결과가 없습니다.";
    } catch (err) {
      if (searchId === currentSearch) note.textContent = "조회에 실패했습니다. 다시 로그인한 뒤 시도해 주세요.";
    }
  });
})();
