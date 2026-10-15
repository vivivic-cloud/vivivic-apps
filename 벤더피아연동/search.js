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
  ];
  const 고른것 = {};                                   // { 칸id: 고른 값 } — 빈 값이면 「전부」

  let 펼친것 = null;                                   // 지금 펼쳐 둔 갈래 (하나만 펼친다)
  function 알약그리기() {
    알약칸.replaceChildren();
    for (const [id, 이름] of 거르개들) {
      const sel = document.getElementById(id);
      if (!sel) continue;                              // 그 화면에 없는 칸
      const 전체 = [...sel.options].find((o) => o.text.trim() === "전체");
      const 고를것 = [...sel.options].filter((o) => o !== 전체 && o.text.trim());
      if (고를것.length < 2) continue;                 // 고를 것이 하나뿐이면 둘 까닭이 없다
      /* 끄는 길 — 「전부」 가 늘 맨 앞에 있다 */
      const 보기 = [[전체 ? 전체.value : "", "전부"], ...고를것.map((o) => [o.value, o.text.trim()])];
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
  const 알약값 = () => Object.fromEntries(Object.entries(고른것).filter(([, v]) => v));
  알약그리기();
  bar.from.value = startDt.value;
  bar.to.value = endDt.value;
  bar.q.focus();

  let tbody = null;
  let currentSearch = 0;

  let 그린머리 = null;                                 // 지금 그려 둔 머리줄 (벤더피아가 준 그대로)
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
        td.textContent = row[i] === undefined ? "" : row[i];
        if (i === 0) td.className = "vp-first";
      });
    }
  }

  // 벤더피아에 매번 직접 조회한다 (항상 최신 상태).
  // 50줄을 먼저 받아 바로 보여주고, 더 있으면 600줄까지 이어서 받는다. 결과는 도착하는 대로 덧붙인다.
  bar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchId = ++currentSearch;
    const { filters, variants, local } = plan(bar.q.value);
    const dates = { dcStartDt: bar.from.value, dcEndDt: bar.to.value };

    tbody = null; 그린머리 = null;
    table.replaceChildren();
    const seen = new Set();
    let shown = 0;
    let cut = false;

    const take = (r) => {
      const fresh = r.rows.filter((row) => {
        const key = row.join("\t");
        if (seen.has(key)) return false;
        seen.add(key);
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
