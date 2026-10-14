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

  const COLUMNS = ["주문번호", "상품명", "수취인", "휴대전화", "주소", "배송사", "송장번호", "상태"];

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
  const 알약칸들 = [
    ["ddlDStatus", "배송상태"],
    ["ddlDeliveryCo", "배송사"],
    ["ddlInvoiceSendYn", "송장전송"],
    ["ddlStore", "매출처"],
  ];
  const 고른것 = {};                                   // { 칸id: 고른 값 } — 빈 값이면 「전부」

  function 알약그리기() {
    알약칸.replaceChildren();
    for (const [id, 이름] of 알약칸들) {
      const sel = document.getElementById(id);
      if (!sel) continue;                              // 그 화면에 없는 칸
      const 전체 = [...sel.options].find((o) => o.text.trim() === "전체");
      const 고를것 = [...sel.options].filter((o) => o !== 전체 && o.text.trim());
      if (고를것.length < 2) continue;                 // 고를 것이 하나뿐이면 알약이 필요 없다
      const 줄 = document.createElement("div");
      줄.className = "vp-pill-row";
      const 딱지 = document.createElement("span");
      딱지.className = "vp-pill-name";
      딱지.textContent = 이름;
      줄.appendChild(딱지);
      const 담 = document.createElement("div");
      담.className = "vp-pill-list";
      /* 끄는 길 — 「전부」 가 늘 맨 앞에 있다 */
      const 보기 = [[전체 ? 전체.value : "", "전부"], ...고를것.map((o) => [o.value, o.text.trim()])];
      for (const [값, 글] of 보기) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "vp-pill";
        b.textContent = 글;
        const 켜짐 = (고른것[id] || "") === (값 || "");
        b.setAttribute("aria-pressed", 켜짐 ? "true" : "false");
        b.addEventListener("click", () => {
          고른것[id] = 값 || "";
          알약그리기();
          bar.requestSubmit();                         // 누르면 그 조건으로 바로 다시 조회
        });
        담.appendChild(b);
      }
      줄.appendChild(담);
      알약칸.appendChild(줄);
    }
  }
  /* 켜진 알약만 조회에 싣는다 (「전부」 는 안 싣는다 — 원래 폼 값 그대로 둔다) */
  const 알약값 = () => Object.fromEntries(Object.entries(고른것).filter(([, v]) => v));
  알약그리기();
  bar.from.value = startDt.value;
  bar.to.value = endDt.value;
  bar.q.focus();

  let tbody = null;
  let currentSearch = 0;

  function addRows(heads, rows) {
    if (!rows.length) return;
    if (!tbody) {
      const t = document.createElement("table");
      const head = t.createTHead().insertRow();
      for (const c of COLUMNS) head.appendChild(document.createElement("th")).textContent = c;
      tbody = t.createTBody();
      table.replaceChildren(t);
    }
    const idx = COLUMNS.map((c) => heads.indexOf(c));
    for (const row of rows) {
      const tr = tbody.insertRow();
      for (const i of idx) tr.insertCell().textContent = i >= 0 ? row[i] : "";
    }
  }

  // 벤더피아에 매번 직접 조회한다 (항상 최신 상태).
  // 50줄을 먼저 받아 바로 보여주고, 더 있으면 600줄까지 이어서 받는다. 결과는 도착하는 대로 덧붙인다.
  bar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchId = ++currentSearch;
    const { filters, variants, local } = plan(bar.q.value);
    const dates = { dcStartDt: bar.from.value, dcEndDt: bar.to.value };

    tbody = null;
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
