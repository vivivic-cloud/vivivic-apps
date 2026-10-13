// 단품관리·상품관리·재고조회 화면을 VIVIVIC 디자인의 이름 버튼 목록으로 바꾼다.
// 목록은 벤더피아에서 받아 저장해 두고(새로고침·새 로그인 전까지), 필터는 받아온 목록에서 바로 적용한다.
// 버튼을 누르면 그 항목의 데이터를 보여준다.
(() => {
  const { PAGES, list: fetchList, ymd } = VP_DATA;
  const page = PAGES[location.pathname];
  if (!page) return;

  const startDt = document.getElementById("dcStartDt");
  const endDt = document.getElementById("dcEndDt");
  if (!document.forms[0] || !document.getElementById("btnSearch") || !document.getElementById("divGrid")) return;

  // 연결된 화면의 목록을 단품코드로 묶어 둔다
  //  상품관리 → 단품관리: 단품코드 → 단품 줄
  //  단품관리 → 상품관리: 단품코드 → 그 단품이 들어간 상품 줄들
  // 단품코드 뒤에 공백이 붙어 있거나 대소문자가 다른 경우가 있어 맞춰서 비교한다
  const codeKey = (code) => code.trim().toLowerCase();
  const toNumber = (text) => Number(String(text).replace(/,/g, "")) || 0;
  // 조혼가구 프로그램의 단품명 검색(모든 거래처 탭)과 연결된 단품 (ing단품코드 = 단품코드) → 버튼 아래 붉은 선
  // 목록은 조혼가구 프로그램을 크롬에서 열 때 받아 둔 것(vpJohon)을 쓰고, 아직 없으면 johon.js에 넣어 둔 목록을 쓴다
  const johon = new Map();  // 단품코드 → ["거래처: ING단품명", …]
  let johonCards = {};      // 단품코드 → [[거래처, ING단품명, 부속들]] (에이엠티 발주확정 부속카드)
  let johonOld = false;     // 엣지면·뒷판홈·전도방지 값이 없는 예전 자료 (조혼가구 프로그램을 다시 열면 새로 받는다)
  let johonJundo = [];      // 전도방지 공통부속 (기본 재단도면의 잔재 자리에 함께 앉힌다)
  function setJohon(parts) {
    johon.clear();
    for (const [supplier, name, code] of parts) {
      const key = codeKey(code);
      if (!johon.has(key)) johon.set(key, []);
      johon.get(key).push(`${supplier}: ${name}`);
    }
  }
  setJohon(typeof VP_JOHON_PARTS === "undefined" ? [] : VP_JOHON_PARTS);
  chrome.storage?.local.get("vpJohon", ({ vpJohon }) => {
    if (!vpJohon?.parts?.length) return;  // 비어 있는 자료면 johon.js 목록을 그대로 쓴다
    setJohon(vpJohon.parts);
    johonCards = vpJohon.cards || {};
    johonOld = (vpJohon.v || 1) < 3;
    johonJundo = vpJohon.jundo || [];
    for (const [name, group] of groups) labelGroup(name, group);
    if (panel.dataset.name) show(panel.dataset.name, ...panel._args);
  });
  function markJohon(b, codes) {
    const names = [...new Set(codes.flatMap((c) => johon.get(codeKey(c)) || []))];
    b.classList.toggle("vp-johon", names.length > 0);
    if (names.length) b.title = `조혼가구 프로그램 단품명\n${names.join("\n")}`;
    else b.removeAttribute("title");
  }

  // 단품명에 "(사용안함)"이 들어간 단품은 버튼을 만들지 않는다
  const unused = (name) => /\(\s*사용\s*안\s*함\s*\)/.test(name);
  const splitCodes = (cell) => cell.split("+").map(codeKey).filter(Boolean);
  let linked = null;  // { heads, byCode: Map }
  async function loadLinked() {
    const { url, status } = page.link;
    const cfg = PAGES[url];
    const byCode = new Map();
    let heads = [];
    await fetchList(cfg, url, status, { from: "2000-01-01" }, (h, rows) => {
      heads = h;
      const i = h.indexOf("단품코드");
      for (const row of rows) {
        if (cfg.nameCol === "단품명") { byCode.set(codeKey(row[i]), row); continue; }
        for (const code of new Set(splitCodes(row[i]))) {
          if (!byCode.has(code)) byCode.set(code, []);
          byCode.get(code).push(row);
        }
      }
    });
    linked = { heads, byCode };
    if (panel.dataset.name) show(panel.dataset.name, ...panel._args);
  }

  // 최근 3개월 배송수량이 많은 순서의 이름 목록 (undefined: 불러오는 중, null: 실패)
  let top;
  let shipped = new Set();  // 최근 3개월 배송수량이 1개 이상인 이름
  async function loadTop() {
    const { url, nameCol } = page.top;
    const today = new Date();
    const start = new Date(today);
    start.setMonth(start.getMonth() - 3);

    const qty = new Map();
    await fetchList({ nameCol, rowCnt: "500", passes: 1 }, url, "", { from: ymd(start), to: ymd(today) }, (h, rows) => {
      const n = h.indexOf(nameCol);
      const q = h.indexOf("배송수량");
      for (const row of rows) {
        const name = row[n].trim();
        // 벤더피아가 페이지를 넘길 때 같은 줄을 다시 줄 때가 있어 더하지 않고 큰 값을 쓴다
        if (name && name !== "총합계") qty.set(name, Math.max(qty.get(name) || 0, Number(row[q].replace(/,/g, "")) || 0));
      }
    });
    top = [...qty].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    shipped = new Set([...qty].filter(([, n]) => n > 0).map(([name]) => name));
    apply();
  }

  // 재고조회의 단품별 양품수 (단품코드 → 수량). 상태 전체, 단품별(창고 합계)로 받는다
  const STOCK_URL = "/System/Stock/StockList.aspx";
  let stockByCode = null;
  async function loadStock() {
    const cfg = { ...PAGES[STOCK_URL], fixed: { ddlSearchType: "ALL" } };
    const byCode = new Map();
    await fetchList(cfg, STOCK_URL, "전체", {}, (h, rows) => {
      const c = h.indexOf("단품코드");
      const q = h.indexOf("양품수");
      for (const row of rows) {
        if (!row[c].trim()) continue;
        const key = codeKey(row[c]);
        byCode.set(key, (byCode.get(key) || 0) + toNumber(row[q]));
      }
    });
    stockByCode = byCode;
    for (const [name, group] of groups) labelGroup(name, group);
    if (panel.dataset.name) show(panel.dataset.name, ...panel._args);
  }

  const root = document.createElement("div");
  root.id = "vp-root";
  root.className = "vp-wide";
  root.innerHTML = `
    <div class="vp-goods">
      <a class="vp-home" href="/index.aspx">← 메인</a>
      <h1>${page.title}</h1>
      <div class="vp-filters">
        <input name="q" class="vp-q" placeholder="${page.search.join(", ")}…">
        ${page.selects.map(([col, label, src]) =>
          `<select data-col="${col}" data-src="${src || ""}"><option value="">${label} 전체</option></select>`).join("")}
        <span class="vp-dates" ${page.noDates ? "hidden" : ""}><input type="date" name="from"><span>~</span><input type="date" name="to"></span>
      </div>
      <div class="vp-note">불러오는 중…</div>
      <div class="vp-cached"></div>
      <div class="vp-loc-tabs vp-chips" hidden>
        <button type="button" class="on" data-view="all">전체보기</button>
        <button type="button" data-view="place">현위치별 보기</button>
      </div>
      <div class="vp-goods-list"></div>
      <div class="vp-places-list" hidden></div>
      <div class="vp-more" hidden>
        <button type="button" class="vp-more-fold">접기</button>
        <button type="button" class="vp-more-next">더보기</button>
        <button type="button" class="vp-more-all">전체보기</button>
      </div>
      <div class="vp-goods-panel" hidden>
        <div class="vp-goods-panel-head"><strong></strong><button type="button" aria-label="닫기">×</button></div>
        <div class="vp-goods-panel-body"></div>
      </div>
      <div class="vp-modal" hidden>
        <div class="vp-modal-card">
          <div class="vp-goods-panel-head"><strong></strong><button type="button" aria-label="닫기">×</button></div>
          <div class="vp-modal-body"></div>
          <div class="vp-modal-foot"><a class="vp-goto"></a></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");

  const filters = root.querySelector(".vp-filters");
  const q = filters.querySelector(".vp-q");
  const selects = [...filters.querySelectorAll("select")];
  const from = filters.querySelector("[name=from]");
  const to = filters.querySelector("[name=to]");
  const note = root.querySelector(".vp-note");
  const cached = root.querySelector(".vp-cached");
  const list = root.querySelector(".vp-goods-list");
  const more = root.querySelector(".vp-more");
  const locTabs = root.querySelector(".vp-loc-tabs");
  const placesList = root.querySelector(".vp-places-list");
  // 보기: "all" 전체보기 / "place" 현위치별 보기
  // 현위치별 보기: 위치 이름이 토글 헤더. 펼치면 그 위치의 3개월 상위 50 제품 → [더보기]로 전부
  let view = "all";
  const openPlaces = new Set();   // 펼친 위치
  const fullPlaces = new Set();   // [더보기]를 누른 위치
  locTabs.hidden = !page.locationCol;
  locTabs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-view]");
    if (!b) return;
    view = b.dataset.view;
    locTabs.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    apply();
  });
  const moreNext = more.querySelector(".vp-more-next");
  const moreAll = more.querySelector(".vp-more-all");
  const moreFold = more.querySelector(".vp-more-fold");
  // 첫 화면 단계: 0 = 많이 나간 순 50개, 1 = 더보기(최근 3개월 1개라도 출고된 것 모두), 2 = 전체보기
  // 접기는 바로 전 단계로 돌아간다
  let stage = 0;
  const history = [];
  const go = (next) => { history.push(stage); stage = next; apply(); };
  moreNext.addEventListener("click", () => go(1));
  moreAll.addEventListener("click", () => go(2));
  moreFold.addEventListener("click", () => {
    stage = history.pop() ?? 0;
    apply();
    list.scrollIntoView({ block: "start" });
  });
  const panel = root.querySelector(".vp-goods-panel");
  const panelTitle = panel.querySelector("strong");
  const panelBody = panel.querySelector(".vp-goods-panel-body");
  from.value = startDt?.value || "";
  to.value = endDt?.value || "";
  panel.querySelector("button").addEventListener("click", () => { panel.hidden = true; delete panel.dataset.name; });

  const modal = root.querySelector(".vp-modal");
  const modalTitle = modal.querySelector("strong");
  const modalBody = modal.querySelector(".vp-modal-body");
  const modalGoto = modal.querySelector(".vp-goto");
  modal.querySelector("button").addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

  // 연결된 화면의 항목을 팝업으로 보여준다. "…로 가기"는 그 화면에서 이 항목만 보이게 연다
  function popup(title, heads, rows, findBy) {
    modalTitle.textContent = title;
    modalBody.replaceChildren(...rows.map((row) => detailFields(heads, row)));
    modalGoto.textContent = page.link.label;
    modalGoto.href = `${page.link.url}#vp-q=${encodeURIComponent(findBy)}`;
    modal.hidden = false;
  }

  // 모든 상세(단품·상품·재고, 패널과 팝업): 값이 있는 속성만 바로 보이고, 값이 빈 속성은 [전체속성 보기]에,
  // 금액 속성은 그 안의 [금액속성 보기]에 다시 숨긴다. 금액은 승인된 아이디만 볼 수 있다.
  // 금액 속성: 단가·수수료·원가·비용·금액·이익과 배송·설치 관련 비용 (선착불처럼 금액이 아닌 칸은 제외)
  const AMOUNT = /단가|수수료|원가|비용|금액|이익|선불비|착불비|설치비|유리비|제품비/;
  const APPROVED_IDS = [];  // 금액을 볼 수 있는 벤더피아 아이디 (아직 없음)
  const myId = decodeURIComponent((document.cookie.match(/VP_Cookie=([^;]*)/) || [])[1] || "")
    .match(/LOGON_EMP_NO=([^&]*)/)?.[1] || "";
  const canSeeAmounts = APPROVED_IDS.includes(myId);

  // 안내 팝업 (확인을 누르거나 바깥을 누르면 닫힌다)
  function notice(text) {
    const overlay = document.createElement("div");
    overlay.className = "vp-notice";
    overlay.innerHTML = `<div class="vp-notice-card"><p></p><button type="button">확인</button></div>`;
    overlay.querySelector("p").textContent = text;
    const close = () => overlay.remove();
    overlay.querySelector("button").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    root.appendChild(overlay);
    overlay.querySelector("button").focus();
  }

  // 에이엠티 발주확정목록의 부속카드 (renderTlConfParts)와 같은 모양. 발주가 없으니 수량은 1세트 기준
  const PROCESS_BASE_RATES = { 재단: 7.9366e-05, 엣지: 0.00032, 보링: 0.00025, NC: 0.00051333 };  // 에이엠티와 같은 값
  function processMinutes(p, qty) {
    const perimeter = p.w * 2 + p.d * 2;
    const cut = p.w > 0 && p.d > 0;
    return [
      ["재단", cut ? perimeter * qty * PROCESS_BASE_RATES.재단 : 0],
      ["NC", p.nc ? perimeter * qty * PROCESS_BASE_RATES.NC : 0],
      ["엣지", p.edge > 0 ? (p.w * p.edge + p.edge * p.d) * qty * PROCESS_BASE_RATES.엣지 : 0],
      ["보링", p.boring ? perimeter * qty * PROCESS_BASE_RATES.보링 : 0],
    ].filter(([, t]) => t > 0);
  }

  function partCards(entries) {
    const box = document.createElement("div");
    box.className = "vp-amt";
    for (const [supplier, name, parts] of entries) {
      const title = box.appendChild(document.createElement("div"));
      title.className = "vp-amt-title";
      title.textContent = `${supplier} · ${name}`;
      const head = box.appendChild(document.createElement("div"));
      head.className = "vp-amt-head";
      head.textContent = "기본 발주 부속";
      const grid = box.appendChild(document.createElement("div"));
      grid.className = "vp-amt-grid";
      if (!parts.length) grid.textContent = "발주할 부속이 없습니다.";
      for (const p of parts) {
        const qty = p.perSet;
        const card = grid.appendChild(document.createElement("button"));
        card.type = "button";
        // 에이엠티 제품(공급처 AMT, 조혼가구와 같은 잣대)은 아래 붉은 마킹
        card.className = "vp-amt-card" + (p.amt ? " vp-amt-mine" : "");
        card.title = p.amt ? "에이엠티 제품" : "에이엠티 외 공급처";
        card.addEventListener("click", () => edgePopup(name, p));
        card.innerHTML = `
          <div class="vp-amt-info">
            <span class="vp-amt-name"></span>
            <span class="vp-amt-sub"></span>
            <span class="vp-amt-sub"></span>
            <span class="vp-amt-size"></span>
            <div class="vp-amt-dots"></div>
          </div>
          <span class="vp-amt-qty"></span>`;
        const [nameEl, plateEl, finishEl] = card.querySelectorAll(".vp-amt-name, .vp-amt-sub");
        nameEl.textContent = p.name;
        plateEl.textContent = (p.plate || "원장정보없음") + (p.color ? ` · ${p.color}` : "");
        finishEl.textContent = p.finish || "마감정보없음";
        card.querySelector(".vp-amt-size").textContent = `${p.w} X ${p.d}`;
        card.querySelector(".vp-amt-qty").textContent = `${Math.round(qty)} EA`;
        const dots = card.querySelector(".vp-amt-dots");
        for (const [key, minutes] of processMinutes(p, qty)) {
          const dot = dots.appendChild(document.createElement("span"));
          dot.className = "vp-amt-dot";
          dot.dataset.hint = `${key} ${minutes.toFixed(1)}분`;
        }
      }
    }
    return box;
  }

  // 부속 박스를 누르면: 에이엠티 엣지공정지시서의 부속카드(도면 포함)를 팝업으로
  function edgePopup(productName, part) {
    if (typeof VP_AMT === "undefined") return;
    if (johonOld || part.wEdge === undefined) {
      notice("엣지·재단 도면 정보가 없는 예전 자료입니다. 크롬에서 조혼가구 프로그램을 한 번 열어 주세요.");
      return;
    }
    const overlay = document.createElement("div");
    overlay.className = "vp-notice vp-edge-pop";
    overlay.innerHTML = `<div class="vp-edge-card"><button type="button" class="vp-edge-close" aria-label="닫기">×</button></div>`;
    overlay.firstChild.insertAdjacentHTML("beforeend", VP_AMT.partDetailHtml(productName, part, johonJundo));
    const close = () => overlay.remove();
    overlay.querySelector(".vp-edge-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    root.appendChild(overlay);
  }

  function toggle(label, body) {
    const box = document.createElement("div");
    const b = box.appendChild(document.createElement("button"));
    b.type = "button";
    b.className = "vp-toggle";
    b.textContent = label;
    body.hidden = true;
    box.appendChild(body);
    b.addEventListener("click", () => { body.hidden = !body.hidden; b.classList.toggle("on", !body.hidden); });
    return box;
  }

  function detailFields(heads, row, linkCell) {
    const visible = [];
    const empty = [];
    const amounts = [];
    heads.forEach((h, i) => {
      if (!h || h === "Page") return;
      if (AMOUNT.test(h)) amounts.push(i);
      else if (row[i].trim() || (linkCell && h === linkCell.col)) visible.push(i);
      else empty.push(i);
    });
    const listOf = (idx) => fields(heads, row, linkCell, idx);

    const box = document.createElement("div");
    box.className = "vp-fields";
    const main = box.appendChild(listOf(visible));
    if (linkCell?.extra) {
      main.appendChild(document.createElement("dt")).textContent = linkCell.extra;
      main.appendChild(document.createElement("dd")).appendChild(linkCell.render(row));
    }

    const more = document.createElement("div");
    if (empty.length) more.appendChild(listOf(empty));
    if (amounts.length && canSeeAmounts) more.appendChild(toggle(`금액속성 보기 (${amounts.length})`, listOf(amounts)));
    else if (amounts.length) {
      // 승인되지 않은 아이디: 펼치지 않고 안내 팝업만 띄운다
      const b = more.appendChild(document.createElement("button"));
      b.type = "button";
      b.className = "vp-toggle";
      b.textContent = `금액속성 보기 (${amounts.length})`;
      b.addEventListener("click", () => notice("금액 속성은 승인된 아이디만 볼 수 있습니다."));
    }
    const partCode = !heads.includes("상품명") && heads.includes("단품코드") && codeKey(row[heads.indexOf("단품코드")]);
    if (partCode && johonCards[partCode]) box.appendChild(toggle("부속보기", partCards(johonCards[partCode])));
    box.appendChild(toggle(`전체속성 보기 (${empty.length + amounts.length})`, more));
    return box;
  }

  // only: 보여줄 칸 번호들 (없으면 모두)
  function fields(heads, row, linkCell, only) {
    const dl = document.createElement("dl");
    heads.forEach((h, i) => {
      if (!h || h === "Page" || (only && !only.includes(i))) return;
      dl.appendChild(document.createElement("dt")).textContent = h;
      const dd = dl.appendChild(document.createElement("dd"));
      if (linkCell && h === linkCell.col) dd.appendChild(linkCell.render(row));
      else dd.textContent = row[i];
    });
    if (linkCell?.extra && !only) {
      dl.appendChild(document.createElement("dt")).textContent = linkCell.extra;
      dl.appendChild(document.createElement("dd")).appendChild(linkCell.render(row));
    }
    return dl;
  }

  // 버튼 글자: 이름 + 작은 글씨의 코드 (같은 이름에 코드가 여러 개면 모두)
  // qty가 있으면(재고조회에 있는 단품) 양품수를 붙이고 연두색 버튼으로
  function labelButton(b, name, codes, qty) {
    const shown = [...new Set(codes.map((c) => c.trim()).filter(Boolean))];
    b.replaceChildren(name);
    if (shown.length) b.appendChild(Object.assign(document.createElement("small"), { className: "vp-code", textContent: shown.join(", ") }));
    b.classList.toggle("vp-instock", qty !== undefined);
    if (qty !== undefined) {
      b.appendChild(Object.assign(document.createElement("small"), { className: "vp-qty", textContent: `양품 ${qty.toLocaleString()}` }));
    }
  }

  // 목록 버튼의 재고 수량: 재고조회 화면은 창고별 줄의 양품수 합, 단품관리는 재고조회에서 찾은 값
  function stockQty(items) {
    if (page.stock === "self") return items.reduce((sum, row) => sum + toNumber(row[col("양품수")]), 0);
    if (page.stock === "link" && stockByCode) {
      const found = items.map((row) => stockByCode.get(codeKey(row[col(page.codeCol)]))).filter((q) => q !== undefined);
      return found.length ? found.reduce((a, b) => a + b, 0) : undefined;
    }
    return undefined;
  }

  function labelGroup(name, group) {
    const codes = group.items.map((r) => r[col(page.codeCol)]);
    labelButton(group.b, name, codes, stockQty(group.items));
    if (page.nameCol === "단품명") markJohon(group.b, codes);
  }

  const chipBox = () => Object.assign(document.createElement("div"), { className: "vp-chips" });
  const chip = (box, text, codes, onClick, qty, isPart) => {
    const b = box.appendChild(document.createElement("button"));
    b.type = "button";
    labelButton(b, text, codes, qty);
    if (isPart) markJohon(b, codes);
    b.addEventListener("click", onClick);
  };

  // 상품관리: 단품명 칸 "a+a+b" → 단품 버튼 [a ×2] [b]
  function partChips(heads, row) {
    const codes = splitCodes(row[heads.indexOf("단품코드")]);
    const names = row[heads.indexOf("단품명")].split("+");
    const parts = new Map();
    codes.forEach((code, i) => {
      if (!parts.has(code)) parts.set(code, { n: 0, name: names.length === codes.length ? names[i].trim() : code });
      parts.get(code).n++;
    });
    const box = chipBox();
    for (const [code, { n, name }] of parts) {
      const part = linked?.byCode.get(code);
      const label = part ? part[linked.heads.indexOf("단품명")] : name;
      if (unused(label)) continue;
      const shownCode = part ? part[linked.heads.indexOf("단품코드")] : code;
      chip(box, label + (n > 1 ? ` ×${n}` : ""), [shownCode], () => {
        const found = linked?.byCode.get(code);
        if (found) popup(found[linked.heads.indexOf("단품명")], linked.heads, [found], found[linked.heads.indexOf("단품코드")].trim());
        else alert(linked ? `단품관리에서 ${code}를 찾지 못했습니다.` : "단품 정보를 불러오는 중입니다. 잠시 뒤 다시 눌러 주세요.");
      }, stockByCode?.get(code), true);
    }
    return box;
  }

  // 단품관리: 이 단품이 들어간 상품 버튼
  function productChips(heads, row) {
    const box = chipBox();
    if (!linked) { box.textContent = "불러오는 중…"; return box; }
    const rows = linked.byCode.get(codeKey(row[heads.indexOf("단품코드")])) || [];
    const nameIdx = linked.heads.indexOf("상품명");
    const byName = new Map();
    for (const r of rows) {
      if (!byName.has(r[nameIdx])) byName.set(r[nameIdx], []);
      byName.get(r[nameIdx]).push(r);
    }
    if (!byName.size) { box.textContent = "없음"; return box; }
    const codeIdx = linked.heads.indexOf("상품코드");
    for (const [name, items] of byName) {
      chip(box, name, items.map((r) => r[codeIdx]), () => popup(name, linked.heads, items, name));
    }
    return box;
  }

  const linkCell = page.link && (page.nameCol === "상품명"
    ? { col: "단품명", render: (row) => partChips(heads, row) }
    : { extra: "관련 상품", render: (row) => productChips(heads, row) });

  function show(name, h, items) {
    panel.dataset.name = name;
    panel._args = [h, items];
    panelTitle.textContent = name;
    if (page.locationTabs) panelBody.replaceChildren(...locationView(h, items));
    else panelBody.replaceChildren(...items.map((row) => detailFields(h, row, linkCell)));
    panel.hidden = false;
  }

  // 재고조회 상세: 현위치(창고, 0.본사면 매입처) 탭 — 누른 위치의 상세만 보인다
  function locationView(h, items) {
    const placeOf = (row) => {
      const warehouse = row[h.indexOf("창고")].trim();
      return warehouse === "0.본사" ? (row[h.indexOf("매입처")].trim() || warehouse) : warehouse;
    };
    const places = new Map();
    for (const row of items) {
      const place = placeOf(row);
      if (!places.has(place)) places.set(place, []);
      places.get(place).push(row);
    }

    const box = document.createElement("div");
    box.className = "vp-places";
    box.appendChild(document.createElement("h3")).textContent = "현위치";
    const tabs = box.appendChild(document.createElement("div"));
    tabs.className = "vp-chips";
    const detail = document.createElement("div");

    const pick = (place, b) => {
      tabs.querySelectorAll("button.on").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      detail.replaceChildren(...places.get(place).map((row) => detailFields(h, row, linkCell)));
    };
    for (const place of places.keys()) {
      const b = tabs.appendChild(document.createElement("button"));
      b.type = "button";
      b.textContent = place;
      b.addEventListener("click", () => pick(place, b));
    }
    pick(places.keys().next().value, tabs.firstChild);
    return [box, detail];
  }

  let heads = [];
  const col = (name) => heads.indexOf(name);
  const groups = new Map();   // 이름 → { b: 버튼, items: 줄들 }
  const serverSel = page.serverSelect && selects.find((x) => x.dataset.col === page.serverSelect[0]);
  const localSelects = selects.filter((x) => x !== serverSel);
  let loading = false;
  let loadId = 0;

  // 필터에 맞는 항목이 하나라도 있는 버튼만 보여준다
  const apply = () => {
    const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const searchIdx = page.search.map(col).filter((i) => i >= 0);
    const dateIdx = col("등록일");
    const picked = localSelects.filter((s) => s.value).map((s) => [col(s.dataset.col), s.value]);
    const matches = (row) => {
      const text = searchIdx.map((i) => row[i]).join(" ").toLowerCase();
      if (!words.every((w) => text.includes(w))) return false;
      if (!picked.every(([i, v]) => row[i] === v)) return false;
      if (!page.serverDates && from.value && row[dateIdx] < from.value) return false;
      if (!page.serverDates && to.value && row[dateIdx] > to.value) return false;
      return true;
    };

    // 현위치별 보기
    if (page.locationCol && view === "place") {
      list.hidden = true;
      placesList.hidden = false;
      more.hidden = true;
      renderPlaces(matches, words.length || picked.length);
      return;
    }
    if (page.locationCol && placesList.hidden === false) {
      // 전체보기로 돌아오면 버튼을 원래 목록으로 되돌린다
      for (const { b } of groups.values()) list.appendChild(b);
      placesList.replaceChildren();
      placesList.hidden = true;
      list.hidden = false;
    }

    // 첫 화면(검색어·필터 없음): 단계(stage)에 따라 많이 나간 순으로 보여준다 (전체보기는 모든 버튼, 많이 나간 순서가 앞)
    if (page.top && top !== null && !words.length && !picked.length) {
      const ranked = (top || []).filter((name) => groups.has(name));
      const names = stage === 0 ? ranked.slice(0, 50)
        : stage === 1 ? ranked.filter((name) => shipped.has(name))
        : ranked;
      const rank = new Map(names.map((name, i) => [name, i]));
      for (const [name, { b }] of groups) {
        b.hidden = stage !== 2 && !rank.has(name);
        b.style.order = rank.has(name) ? rank.get(name) : ranked.length;
      }
      note.textContent = !top ? "최근 3개월 많이 나간 순서를 불러오는 중…"
        : stage === 2 ? `전체 ${groups.size.toLocaleString()}개 · 최근 3개월 많이 나간 순서가 앞에 있습니다`
        : stage === 1 ? `최근 3개월 1개 이상 출고된 ${names.length.toLocaleString()}개 · 많이 나간 순`
        : `최근 3개월 많이 나간 순 ${names.length}개 · 검색하거나 필터를 고르면 전체에서 찾습니다`;
      more.hidden = !top;
      moreFold.hidden = stage === 0;
      moreNext.hidden = stage !== 0;
      moreAll.hidden = stage === 2;
      return;
    }
    more.hidden = true;

    let count = 0;
    for (const { b, items } of groups.values()) {
      const on = items.some(matches);
      b.hidden = !on;
      b.style.order = "";
      if (on) count++;
    }
    note.textContent = `${count.toLocaleString()}개` + (loading ? " · 불러오는 중…" : "");
  };

  // 단품의 현위치 = 매입처
  const placeOf = (group) => (group.items[0][col(page.locationCol)] || "").trim() || "(없음)";

  // 현위치별 보기 — 위치 이름을 위에서 아래로. 최근 3개월 상위 50 제품이 많은 위치부터
  // (같으면 더 많이 나간 제품이 있는 곳, 그다음 이름순). 위치 이름은 누를 때마다 펼치고 접는 헤더다.
  function renderPlaces(matches, filtering) {
    const ranked = (top || []).filter((name) => groups.has(name));
    const rankOf = new Map(ranked.map((name, i) => [name, i]));
    const top50 = new Set(ranked.slice(0, 50));
    const byPlace = new Map();
    for (const [name, g] of groups) {
      if (filtering && !g.items.some(matches)) continue;
      const where = placeOf(g);
      if (!byPlace.has(where)) byPlace.set(where, []);
      byPlace.get(where).push(name);
    }
    const order = (a, b) => (rankOf.get(a) ?? Infinity) - (rankOf.get(b) ?? Infinity) || a.localeCompare(b, "ko");
    const places = [...byPlace].map(([where, names]) => {
      names.sort(order);
      return { where, names, best: names.filter((n) => top50.has(n)) };
    }).sort((a, b) => b.best.length - a.best.length
      || (rankOf.get(a.names[0]) ?? Infinity) - (rankOf.get(b.names[0]) ?? Infinity)
      || a.where.localeCompare(b.where, "ko"));

    placesList.replaceChildren();
    let shown = 0;
    for (const { where, names, best } of places) {
      const section = placesList.appendChild(document.createElement("div"));
      section.className = "vp-place";
      const head = section.appendChild(document.createElement("button"));
      head.type = "button";
      head.className = "vp-place-head";
      const open = openPlaces.has(where);
      head.classList.toggle("on", open);
      head.innerHTML = `<span></span><small></small>`;
      head.firstChild.textContent = where;
      head.lastChild.textContent = best.length ? `상위50 ${best.length} · 전체 ${names.length}` : `전체 ${names.length}`;
      head.addEventListener("click", () => {
        if (openPlaces.has(where)) openPlaces.delete(where); else openPlaces.add(where);
        apply();
      });
      if (!open) continue;

      // 상위 50 제품이 있으면 그것만 먼저, 없거나 [더보기]를 눌렀으면 전부
      const showAll = filtering || !best.length || fullPlaces.has(where);
      const body = section.appendChild(document.createElement("div"));
      body.className = "vp-goods-list";
      for (const name of showAll ? names : best) {
        const { b } = groups.get(name);
        b.hidden = false;
        b.style.order = "";
        body.appendChild(b);
        shown++;
      }
      if (!showAll) {
        const moreBtn = section.appendChild(document.createElement("button"));
        moreBtn.type = "button";
        moreBtn.className = "vp-place-more";
        moreBtn.textContent = `더보기 (${names.length - best.length})`;
        moreBtn.addEventListener("click", () => { fullPlaces.add(where); apply(); });
      }
    }
    note.textContent = !top ? "최근 3개월 많이 나간 순서를 불러오는 중…"
      : `현위치 ${places.length}곳 · 위치를 누르면 펼쳐집니다` + (shown ? ` · ${shown.toLocaleString()}개 보는 중` : "");
  }

  // 목록 칸의 항목은 받아온 데이터에 실제로 있는 값으로 채운다
  function fillSelects(rows) {
    for (const sel of localSelects) {
      const i = col(sel.dataset.col);
      const have = new Set([...sel.options].map((o) => o.value));
      const values = [...new Set(rows.map((r) => r[i]).filter((v) => v && !have.has(v)))];
      for (const v of values) sel.add(new Option(v, v));
      const sorted = [...sel.options].slice(1).sort((a, b) => a.text.localeCompare(b.text, "ko"));
      for (const o of sorted) sel.add(o);
    }
  }

  function addRows(rows) {
    for (const row of rows) {
      const name = row[col(page.nameCol)];
      if (!row[col(page.codeCol)]?.trim()) continue;  // 합계 줄 (코드 없음)
      if (page.nameCol === "단품명" && unused(name)) continue;
      if (groups.has(name)) {
        const group = groups.get(name);
        group.items.push(row);
        labelGroup(name, group);
        continue;
      }
      const b = document.createElement("button");
      b.type = "button";
      const group = { b, items: [row] };
      labelGroup(name, group);
      b.addEventListener("click", () => {
        list.querySelectorAll("button.on").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        show(name, heads, group.items);
      });
      list.appendChild(b);
      groups.set(name, group);
    }
  }

  async function load() {
    const id = ++loadId;
    groups.clear();
    list.replaceChildren();
    panel.hidden = true;
    loading = true;
    note.textContent = "불러오는 중…";
    const serverValue = serverSel ? (serverSel.value || "전체") : "";
    const dates = page.serverDates ? { from: from.value || "2000-01-01", to: to.value } : { from: "2000-01-01" };
    try {
      const got1 = await fetchList(page, location.pathname, serverValue, dates, (h, rows, got, total) => {
        heads = h;
        fillSelects(rows);
        addRows(rows);
        apply();
        note.textContent = `목록 불러오는 중… ${got.toLocaleString()} / ${total.toLocaleString()}`;
      }, () => id === loadId, document);
      if (id !== loadId) return;
      loading = false;
      cached.textContent = got1.cachedAt
        ? `${new Date(got1.cachedAt).toTimeString().slice(0, 5)}에 받아 둔 목록 · 새로고침하면 새로 받습니다` : "";
      apply();
    } catch (err) {
      if (id === loadId) { loading = false; note.textContent = "불러오지 못했습니다. 다시 로그인한 뒤 시도해 주세요."; }
    }
  }

  // 벤더피아에서 거르는 칸은 원래 화면의 항목을 그대로 쓰고, 바꾸면 새로 받아온다
  if (serverSel) {
    const src = document.getElementById(page.serverSelect[1]);
    for (const o of [...src.options].filter((o) => o.value !== "전체")) serverSel.add(new Option(o.text, o.value));
    serverSel.value = src.value === "전체" ? "" : src.value;
    serverSel.addEventListener("change", (e) => { e.stopPropagation(); load(); });
  }
  if (page.serverDates) {
    for (const d of [from, to]) {
      d.addEventListener("input", (e) => e.stopPropagation());
      d.addEventListener("change", (e) => { e.stopPropagation(); load(); });
    }
  }
  const linkedFrom = decodeURIComponent((location.hash.match(/vp-q=([^&]*)/) || [])[1] || "");
  if (linkedFrom) {
    q.value = linkedFrom;
    from.value = "";
  }
  // 그 밖의 칸은 원래 화면의 처음 값(예: 판매상태 판매중)을 그대로 따른다
  const firstValues = new Map(localSelects.filter((s) => s.dataset.src).map((s) => {
    const src = document.getElementById(s.dataset.src);
    return [s, src?.options[src.selectedIndex]?.text];
  }));

  filters.addEventListener("input", apply);
  filters.addEventListener("change", apply);
  load().then(() => {
    for (const [s, v] of firstValues) if (v && [...s.options].some((o) => o.value === v)) s.value = v;
    apply();
    // 첫 목록을 다 받은 뒤에 연결된 화면의 목록을 받는다 (벤더피아가 요청을 하나씩 처리해서, 동시에 받으면 첫 목록이 늦어진다)
    (page.top ? loadTop().catch(() => { top = null; apply(); }) : Promise.resolve())
      .then(() => (page.stock === "link" || page.stock === "parts") && loadStock().catch(() => {}))
      .then(() => page.link && loadLinked().catch(() => { linked = { heads: [], byCode: new Map() }; }))
      // 지금 화면의 목록을 다 받았으면 다른 메뉴가 쓸 목록을 뒤에서 받아 둔다
      .then(() => VP_DATA.prefetch());
  });
})();
