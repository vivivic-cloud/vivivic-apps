// 벤더피아 목록 받기 — 단품관리·상품관리·재고조회 화면과 메인 화면(미리 받기)이 함께 쓴다.
// 한 번 받은 목록은 크롬 안에 저장해 두고, 새로고침하거나 새로 로그인하기 전까지 다시 받지 않는다.
const VP_DATA = (() => {
  // 화면별 설정
  //  reset: 전체 목록을 받을 때 비우는 원래 검색칸 / selects: [표의 칸, 이름, 처음 값을 가져올 원래 검색칸]
  //  serverSelect: 양이 많아 벤더피아에서 거르는 칸 [표의 칸, 원래 검색칸] — 바꾸면 그 조건으로 새로 받아온다
  //  serverDates: 등록기간도 벤더피아에서 거른다 (표의 등록일에 연도가 없는 화면)
  //  noDates: 등록기간이 없는 화면
  //  stock: 단품 버튼에 재고조회의 양품수를 표시하고 연두색으로 (재고는 단품으로만 관리한다)
  //         "self": 이 화면의 줄에서, "link": 재고조회에서 단품코드로 찾아서, "parts": 상품 상세의 단품 버튼만
  //  cols: 목록 표의 칸 (첫 칸은 늘 이름 버튼). 글자 = 줄 칸 이름 그대로, 객체 = {name, col|place|sum|ing}
  //  pill: 검색칸 아래 거르개 알약 {label, col} — col 은 줄 칸 이름, place 는 재고조회의 현위치(창고, 0.본사면 매입처)
  //  fixed: 받을 때 항상 넣는 검색칸 값
  //  splits: 한 번에 700줄을 넘으면 나눠 받는 기준 (앞에서부터). "date"는 등록기간을 반씩, 그 밖은 그 검색칸의 항목별
  //          벤더피아는 페이지를 넘길 때 줄 순서가 일정하지 않아 줄이 빠지거나 겹치므로, 페이지를 넘기지 않고 나눠 받는다
  const PAGES = {
    "/System/Master/goods.aspx": {
      title: "단품관리",
      nameCol: "단품명",
      codeCol: "단품코드",
      // 현위치 = 매입처. 검색칸 아래 거르개 알약으로 (10-21: [전체보기] [현위치별 보기] 탭을 없앴다)
      pill: { label: "현위치", col: "매입처명" },
      cols: ["단품분류", { name: "현위치", col: "매입처명" }, "재고유형", "발주유형", "판매상태"],
      stock: "link",
      // 10-25 이름표(배송관리·CS등록 이름 단추) — 이름·코드로 하나만 찾을 때 채우는 검색칸
      lookup: { name: "tbGoodsNm", code: "tbGoodsCd" },
      resetSelects: ["ddlSupplier", "ddlStockYn", "ddlOrderingType", "ddlStatus"],
      resetTexts: ["tbSupplierNm", "tbCategoryNm", "tbCategoryCd", "tbGoodsCd", "tbGoodsNm", "tbModelNo",
        "tbFrPurchaseAmt", "tbToPurchaseAmt"],
      selects: [["단품분류", "단품분류"], ["재고유형", "재고유형"],
        ["발주유형", "발주유형"], ["판매상태", "판매상태", "ddlStatus"]],
      search: ["단품명", "단품코드", "바코드", "단품분류", "매입처명"],
      splits: ["date", "ddlStatus", "ddlSupplier"],
      // 첫 화면: 최근 3개월 배송수량이 많은 순 50개 (배송현황관리 › 단품별)
      top: { url: "/System/SResult/prePostDeliveryList4.aspx", nameCol: "단품명" },
      // 상세에 이 단품이 들어간 상품 버튼을 보여준다 (상품관리의 판매중 상품에서 찾는다)
      link: { url: "/System/Master/salesGoods.aspx", status: "1", label: "상품관리로 가기" },
    },
    "/System/Master/salesGoods.aspx": {
      title: "상품관리",
      nameCol: "상품명",
      codeCol: "상품코드",
      stock: "parts",
      lookup: { name: "tbSGoodsNm", code: "tbSGoodsCd" },
      resetSelects: ["ddlStore", "ddlSupplier", "ddlStatus", "ddlUser", "ddlDCo"],
      resetTexts: ["tbSGoodsCd", "tbSGoodsNm", "tbSupplierNm", "tbGoodsCd", "tbGoodsNm", "tbModelNo"],
      uncheck: ["cbOptionGoodsYn"],
      // 매출처는 검색칸 아래 거르개 알약으로 (10-21) — 한 상품이 매출처마다 한 줄이어도 표에는 한 줄만
      pill: { label: "매출처", col: "매출처명" },
      cols: [{ name: "매출처", col: "매출처명" }, "매입처명", "배송사명", "판매상태", "옵션상품유무",
        { name: "상품정보", ing: true }],
      selects: [["매입처명", "매입처"], ["배송사명", "배송사"],
        ["판매상태", "판매상태", "ddlStatus"], ["옵션상품유무", "옵션상품"]],
      serverSelect: ["판매상태", "ddlStatus"],
      serverDates: true,
      // 첫 화면: 최근 3개월 배송수량이 많은 순 50개 (배송현황관리 › 상품별)
      top: { url: "/System/SResult/prePostDeliveryList2.aspx", nameCol: "상품명" },
      // 단품명 칸("a+a+b")을 단품 버튼으로 바꾼다. 단품 정보는 단품관리에서 단품코드로 찾는다
      link: { url: "/System/Master/goods.aspx", status: "", label: "단품관리로 가기" },
      search: ["상품명", "상품코드", "매출처상품명", "단품명", "단품코드", "모델번호", "매입처명"],
      // 매입처는 상품 하나에 여럿일 수 있어 겹치므로 쓰지 않는다
      splits: ["date", "ddlStore"],
    },
    "/System/Stock/StockList.aspx": {
      title: "재고조회",
      nameCol: "단품명",
      codeCol: "단품코드",
      stock: "self",
      // 상세: 창고별 줄을 현위치 탭으로 나눠 하나씩 본다 (창고가 0.본사면 매입처로 나눈다)
      locationTabs: true,
      // 거르개 알약: 현위치. 표에는 같은 단품이 한 줄만 (현위치가 여럿이면 한 칸에 모아 적는다)
      pill: { label: "현위치", place: true },
      cols: ["분류명", { name: "현위치", place: true }, { name: "양품수", sum: "양품수" }],
      // 첫 화면: 최근 3개월 배송수량이 많은 순 50개 (배송현황관리 › 단품별, 단품관리와 같음)
      top: { url: "/System/SResult/prePostDeliveryList4.aspx", nameCol: "단품명" },
      // 원래 화면처럼 창고별로 받는다 (버튼은 단품명마다, 상세에 창고별 재고)
      resetSelects: ["ddlCategory", "ddlWarehouse", "ddlSupplier"],
      resetTexts: ["tbGoodsCd", "tbGoodsNm", "tbBarcode", "tbMemo"],
      selects: [["창고", "창고"], ["분류명", "분류"], ["매입처", "매입처"], ["판매상태", "판매상태", "ddlStatus"]],
      // 표에 판매상태 칸이 없어 벤더피아에서 거른다
      serverSelect: ["판매상태", "ddlStatus"],
      noDates: true,
      search: ["단품명", "단품코드", "박스코드", "매입처", "분류명", "비고"],
      // 재고조회는 조회 한 번이 2초 넘게 걸려 나눠 받지 않고, 페이지를 넘겨 받은 뒤 건수를 확인한다
      splits: [],
    },
  };
  const PAGES_ = PAGES;

  // 받은 화면(doc)의 폼 값을 그대로 담는다 (다음 페이지를 요청할 때 필요)
  function formData(doc) {
    const fd = new FormData();
    for (const el of doc.forms[0].elements) {
      if (!el.name || el.disabled || el.name.includes("chkItem")) continue;
      if (["submit", "image", "button", "file"].includes(el.type)) continue;
      if ((el.type === "checkbox" || el.type === "radio") && !el.checked) continue;
      if (el.tagName === "SELECT") {
        const opt = el.options[el.selectedIndex];
        if (opt) fd.append(el.name, opt.value);
      } else {
        fd.append(el.name, el.value);
      }
    }
    return fd;
  }

  function parse(html, nameCol) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const th = [...doc.querySelectorAll("th")].find((c) => c.textContent.trim() === nameCol);
    const heads = th ? [...th.parentElement.children].map((c) => c.textContent.trim()) : [];
    const rows = [...doc.querySelectorAll("tr")]
      .filter((tr) => tr.children.length === heads.length && !tr.querySelector("th"))
      .map((tr) => [...tr.children].map((c) => c.textContent.trim()));
    const pages = new Map([...doc.querySelectorAll("a")]
      .filter((a) => /^\d+$/.test(a.textContent.trim()))
      .map((a) => [Number(a.textContent.trim()), (a.getAttribute("href") || "").match(/__doPostBack\('([^']+)'/)?.[1]]));
    const total = Number(((doc.body.textContent.match(/총\s*([\d,]+)\s*건/) || [])[1] || "0").replace(/,/g, ""));
    return { doc, heads, rows, pages, total };
  }

  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dayNum = (s) => Math.round(Date.UTC(...s.split("-").map((x, i) => Number(x) - (i === 1 ? 1 : 0))) / 864e5);
  const dayStr = (n) => new Date(n * 864e5).toISOString().slice(0, 10);

  // cfg 화면(url)의 목록을 모두 받아온다. 받을 때마다 onPage(heads, rows, 받은 수, 전체 수)를 부른다.
  // src: 그 화면의 처음 문서(검색 폼) / serverValue: serverSelect 칸에 넣을 값
  // isCurrent: 더 받을지 (다른 조건으로 다시 받기 시작하면 멈춘다)
  // 한 번에 받을 수 있는 줄 수(limit)를 넘으면 cfg.splits 기준으로 조건을 나눠 받는다. 몇 건인지는 가벼운 조회로 먼저 센다.
  // 지금 화면이 받는 중인 목록 수. 뒤에서 받기(미리 받기)는 이것이 0 일 때만 벤더피아에 요청한다
  // (벤더피아는 한 사람의 요청을 하나씩 처리해서, 같이 보내면 지금 화면이 그만큼 늦어진다).
  let foreground = 0;
  const idle = async () => { while (foreground > 0) await new Promise((r) => setTimeout(r, 150)); };

  async function fetchAll(cfg, url, src, serverValue, dates, onPage, isCurrent, background = false) {
    // 검색칸은 id가 화면마다 달라(예: 재고조회의 목록 수 칸) 이름 끝으로도 찾는다
    const field = (id) => src.getElementById(id) || [...src.forms[0].elements].find((e) => e.name?.endsWith("$" + id));
    const nameOf = (id) => field(id)?.name || id;
    const post = async (fd) => (background && await idle(),
      parse(await (await fetch(url, { method: "POST", body: fd, credentials: "include" })).text(), cfg.nameCol));
    const btn = src.getElementById("btnSearch").name;
    const rowOptions = [...(field("ddlRowCnt")?.options || [])].map((o) => Number(o.value));
    const fewRows = String(Math.min(...rowOptions));
    const manyRows = cfg.rowCnt || "700";
    const limit = Number(manyRows);

    const query = (cond, rowCnt) => {
      const fd = formData(src);
      for (const id of cfg.resetSelects || []) fd.set(nameOf(id), "전체");
      for (const id of cfg.resetTexts || []) fd.set(nameOf(id), "");
      for (const id of cfg.uncheck || []) fd.delete(nameOf(id));
      if (cfg.serverSelect) fd.set(nameOf(cfg.serverSelect[1]), serverValue);
      if (!cfg.noDates) {
        fd.set(nameOf("dcStartDt"), cond.from);
        fd.set(nameOf("dcEndDt"), cond.to);
      }
      for (const [id, v] of Object.entries({ ...cfg.fixed, ...cond.sel })) fd.set(nameOf(id), v);
      fd.set(nameOf("ddlRowCnt"), rowCnt);
      fd.append(btn + ".x", "5");
      fd.append(btn + ".y", "5");
      return post(fd);
    };

    let total = null;
    let got = 0;
    const emit = (res) => {
      got += res.rows.length;
      onPage(res.heads, res.rows, got, total);
    };

    // 나눌 기준이 더 없을 때만: 페이지를 넘겨 받는다. 줄이 빠지거나 겹칠 수 있어,
    // 건수(n)만큼 다른 줄이 모일 때까지 처음부터 다시 넘겨 받는다 (최대 cfg.passes번, 기본 5번)
    async function paginate(cond, n) {
      const seen = new Set();
      n ??= Infinity;
      // 페이지마다 끼어 있는 합계 줄(이름이 비었거나 "합계")은 세지 않는다
      const fresh = (r) => {
        const i = r.heads.indexOf(cfg.nameCol);
        return { ...r, rows: r.rows.filter((row) => !["", "합계"].includes(row[i].trim())
          && !seen.has(row.join("\t")) && seen.add(row.join("\t"))) };
      };
      for (let pass = 0; pass < (cfg.passes || 5) && seen.size < n; pass++) {
        let res = await query(cond, manyRows);
        if (!isCurrent()) return;
        if (total === null) total = res.total;
        if (n === Infinity) n = res.total;
        emit(fresh(res));
        for (let page = 2, pageGot = res.rows.length; pageGot < res.total && seen.size < n; page++) {
          const target = res.pages.get(page);
          if (!target) break;
          const next = formData(res.doc);
          next.set("__EVENTTARGET", target);
          next.set("__EVENTARGUMENT", "");
          res = await post(next);
          if (!isCurrent()) return;
          if (!res.rows.length) break;
          pageGot += res.rows.length;
          emit(fresh(res));
        }
      }
    }

    async function split(cond, level) {
      if (!isCurrent()) return;
      // 나눌 기준이 없는 화면은 건수를 따로 세지 않고 바로 페이지를 넘겨 받는다
      if (!(cfg.splits || []).length) return paginate(cond, null);
      const n = (await query(cond, fewRows)).total;
      if (total === null) total = n;
      if (!n || !isCurrent()) return;
      if (n <= limit) {
        const res = await query(cond, manyRows);
        if (isCurrent()) emit(res);
        return;
      }
      const by = (cfg.splits || [])[level];
      if (!by) return paginate(cond, n);
      if (by === "date") {
        if (cond.from === cond.to) return split(cond, level + 1);
        const mid = Math.floor((dayNum(cond.from) + dayNum(cond.to)) / 2);
        await split({ ...cond, to: dayStr(mid) }, level);
        await split({ ...cond, from: dayStr(mid + 1) }, level);
        return;
      }
      const options = [...(field(by)?.options || [])].filter((o) => o.value !== "전체");
      if (!options.length) return split(cond, level + 1);
      for (const o of options) await split({ ...cond, sel: { ...cond.sel, [by]: o.value } }, level + 1);
    }

    await split({ from: dates.from, to: dates.to || ymd(new Date()), sel: {} }, 0);
  }


  // ── 저장해 두기 ────────────────────────────────────────────────────
  // 새로고침이면 저장해 둔 목록을 모두 버린다 (그 화면이 새 목록을 받는다).
  // 메뉴를 옮겨 다니는 것(보통 이동·뒤로 가기)은 그대로 쓴다.
  const PREFIX = "vpCache:";
  // 깃허브에서 온 글은 확장 저장소에 바로 못 닿는다 — 다리(VP저장)를 먼저 본다.
  // 확장 안에서 돌 때(옛 길)는 chrome.storage 를 그대로 쓴다. 둘 다 같은 곳에 담긴다.
  const store = window.VP저장 || (typeof chrome !== 'undefined' ? chrome.storage?.local : null);
  async function clearCache() {
    if (!store) return;
    const all = await store.get(null);
    await store.remove(Object.keys(all).filter((k) => k.startsWith(PREFIX)));
  }
  const ready = performance.getEntriesByType("navigation")[0]?.type === "reload" ? clearCache() : Promise.resolve();

  // cfg 화면(url)의 목록 전체. 저장해 둔 것이 있으면 그것을 한 번에 onPage 로 넘기고 { cachedAt } 을 돌려준다.
  // 없으면 벤더피아에서 받으며 onPage 를 부르고, 끝까지 다 받았으면 저장한다.
  // src: 그 화면의 처음 문서(검색 폼). 없으면 그 화면을 새로 열어 쓴다.
  // background: 뒤에서 받기 — 지금 화면이 받는 동안은 기다렸다가 받는다
  const 받는중 = new Map();   // 저장 열쇠 → 받는 동안 서 있는 약속
  async function list(cfg, url, serverValue, dates, onPage, isCurrent = () => true, src = null, background = false) {
    const to = dates.to || ymd(new Date());
    const key = PREFIX + [url, cfg.nameCol, JSON.stringify(cfg.fixed || {}), serverValue,
      cfg.noDates ? "" : dates.from, cfg.noDates ? "" : to].join("|");
    await ready;
    /* 10-24 — 같은 목록을 **이미 받는 중이면** 그것이 끝나길 기다렸다 저장된 것을 쓴다.
       배송관리·CS등록은 상품관리 한 벌과 단품관리 한 벌(goods.js)을 같이 돌려, 서로 쓰는 목록(단품·상품)을 동시에 받으려 한다 — 벤더피아에 같은 조회를 두 번 보내지 않는다. */
    while (받는중.has(key)) await 받는중.get(key);
    const hit = store && (await store.get(key))[key];
    if (hit) {
      if (isCurrent()) onPage(hit.heads, hit.rows, hit.rows.length, hit.rows.length);
      return { cachedAt: hit.at };
    }
    if (!background) foreground++;
    let 끝냄; 받는중.set(key, new Promise((r) => { 끝냄 = r; }));
    try {
      if (background) await idle();
      src ||= new DOMParser().parseFromString(await (await fetch(url, { credentials: "include" })).text(), "text/html");
      let heads = [];
      const rows = [];
      let whole = true;
      await fetchAll(cfg, url, src, serverValue, { from: dates.from, to }, (h, part, got, total) => {
        heads = h;
        rows.push(...part);
        onPage(h, part, got, total);
      }, () => (isCurrent() ? true : (whole = false)), background);
      if (whole && isCurrent() && heads.length && store) await store.set({ [key]: { at: Date.now(), heads, rows } });
      return { cachedAt: null };
    } finally {
      if (!background) foreground--;
      받는중.delete(key); 끝냄();
    }
  }

  // ── 미리 받기 ──────────────────────────────────────────────────────
  // 지금 화면의 목록을 다 받은 뒤(메인 화면은 바로) 다른 메뉴가 쓸 목록을 뒤에서 조용히 받아 둔다. 각 화면이 처음 열 때 쓰는 것과 같은 조건이라
  // 그 화면을 열면 저장해 둔 것이 바로 나온다. 벤더피아가 요청을 하나씩 처리해서 차례로 받는다.
  let prefetching = null;  // 한 화면에서 두 번 시작하지 않는다
  function prefetch() {
    prefetching ||= prefetchAll();
    return prefetching;
  }
  async function prefetchAll() {
    const GOODS = "/System/Master/goods.aspx", SALES = "/System/Master/salesGoods.aspx", STOCK = "/System/Stock/StockList.aspx";
    const today = new Date();
    const start = new Date(today);
    start.setMonth(start.getMonth() - 3);
    const three = { from: ymd(start), to: ymd(today) };
    const open = async (url) => (await idle(), new DOMParser().parseFromString(await (await fetch(url, { credentials: "include" })).text(), "text/html"));
    const noop = () => {};
    const steps = [
      // 단품관리 (상품관리 상세의 단품 버튼도 이것을 쓴다)
      () => list(PAGES[GOODS], GOODS, "", { from: "2000-01-01" }, noop, undefined, null, true),
      // 최근 3개월 단품별 순위 (단품관리·재고조회 첫 화면)
      () => list({ nameCol: "단품명", rowCnt: "500", passes: 1 }, "/System/SResult/prePostDeliveryList4.aspx", "", three, noop, undefined, null, true),
      // 재고조회 단품별 양품수 (연두색 단품 버튼)
      () => list({ ...PAGES[STOCK], fixed: { ddlSearchType: "ALL" } }, STOCK, "전체", {}, noop, undefined, null, true),
      // 상품관리 — 원래 화면의 처음 조건(판매상태·등록기간) 그대로
      async () => {
        const doc = await open(SALES);
        const status = doc.getElementById("ddlStatus")?.value || "전체";
        const from = doc.getElementById("dcStartDt")?.value || "2000-01-01";
        const to = doc.getElementById("dcEndDt")?.value;
        return list(PAGES[SALES], SALES, status, { from, to }, noop, undefined, doc, true);
      },
      // 최근 3개월 상품별 순위 (상품관리 첫 화면)
      () => list({ nameCol: "상품명", rowCnt: "500", passes: 1 }, "/System/SResult/prePostDeliveryList2.aspx", "", three, noop, undefined, null, true),
      // 재고조회 — 원래 화면의 처음 판매상태 그대로
      async () => {
        const doc = await open(STOCK);
        return list(PAGES[STOCK], STOCK, doc.getElementById("ddlStatus")?.value || "전체", { from: "2000-01-01" }, noop, undefined, doc, true);
      },
      // 단품관리 상세의 관련 상품 (판매중 상품 전체 기간)
      () => list(PAGES[SALES], SALES, "1", { from: "2000-01-01" }, noop, undefined, null, true),
    ];
    for (const step of steps) {
      try { await step(); } catch (e) { /* 하나가 안 돼도 다음 것을 받는다 */ }
    }
  }

  // ── 이름표 (10-25 [새 지시 이름단추 느림]) ───────────────────────────
  // 배송관리·CS등록의 이름 단추는 상품·단품의 **이름과 코드만** 있으면 된다. 전체 목록(수십 번 요청·큰 HTML·저장)을 받는 대신
  //  화면에 보인 이름만 그 이름·코드로 하나씩 찾는다(`하나찾기`) — 전체 이름 모으기(`이름받기`)는 10-25 [새 지시 보인 이름만] 에 없앴다.
  // ⚠ 큰 HTML 읽기(DOMParser)는 한 번에 한 쪽씩, 쪽 사이에 쉰다(`쉬기`) — 화면이 한꺼번에 오래 멈추지 않게.
  // ⚠ 여기서 받은 줄은 이름·코드 두 칸만 남기고 버린다(금액·사람 칸을 담지 않는다). 저장하는 쪽(goods.js)도 두 칸만 저장한다.
  const 쉬기 = () => new Promise((r) => setTimeout(r, 0));
  const 처음문서들 = new Map();   // 주소 → 그 화면의 처음 문서(검색 폼) 약속. 쪽을 연 동안 한 번만 받는다
  function 처음문서(url) {
    if (!처음문서들.has(url)) {
      const 약속 = fetch(url, { credentials: "include" }).then((r) => r.text())
        .then(async (t) => (await 쉬기(), new DOMParser().parseFromString(t, "text/html")));
      처음문서들.set(url, 약속);
      약속.catch(() => 처음문서들.delete(url));
    }
    return 처음문서들.get(url);
  }
  // 벤더피아 검색 폼을 채워 한 번 묻는 틀 (fetchAll 의 query 와 같은 채움: 원래 검색칸 비우기 → 기간 → 고정값)
  function 질문틀(cfg, url, src, serverValue) {
    const field = (id) => src.getElementById(id) || [...src.forms[0].elements].find((e) => e.name?.endsWith("$" + id));
    const nameOf = (id) => field(id)?.name || id;
    const btn = src.getElementById("btnSearch").name;
    const rowOptions = [...(field("ddlRowCnt")?.options || [])].map((o) => Number(o.value));
    const fewRows = String(Math.min(...rowOptions));
    const query = async (cond, rowCnt, texts = {}) => {
      const fd = formData(src);
      for (const id of cfg.resetSelects || []) fd.set(nameOf(id), "전체");
      for (const id of cfg.resetTexts || []) fd.set(nameOf(id), "");
      for (const id of cfg.uncheck || []) fd.delete(nameOf(id));
      if (cfg.serverSelect) fd.set(nameOf(cfg.serverSelect[1]), serverValue);
      if (!cfg.noDates) {
        fd.set(nameOf("dcStartDt"), cond.from);
        fd.set(nameOf("dcEndDt"), cond.to);
      }
      for (const [id, v] of Object.entries({ ...cfg.fixed })) fd.set(nameOf(id), v);
      for (const [id, v] of Object.entries(texts)) fd.set(nameOf(id), v);
      fd.set(nameOf("ddlRowCnt"), rowCnt);
      fd.append(btn + ".x", "5");
      fd.append(btn + ".y", "5");
      const html = await (await fetch(url, { method: "POST", body: fd, credentials: "include" })).text();
      await 쉬기();
      return parse(html, cfg.nameCol);
    };
    return { query, fewRows, manyRows: cfg.rowCnt || "700" };
  }
  // 이름·코드로 **하나만** 찾는다 (조회만). 코드가 있으면 코드로, 못 찾으면 이름으로. 맞는 줄(전체 칸)들을 돌려준다 — 상세를 열 때 쓴다.
  async function 하나찾기(cfg, url, serverValue, { name, code, 먼저, 가볍게 }) {
    foreground++;
    try {
      const src = await 처음문서(url);
      const 틀 = 질문틀(cfg, url, src, serverValue);
      const L = cfg.lookup || {};
      const 열쇠 = (t) => String(t || "").trim().toLowerCase();
      const 시도 = [];
      if (code && L.code) 시도.push([{ [L.code]: code }, "code"]);
      const 공백 = (t) => String(t || "").replace(/\s+/g, " ").trim();
      if (name && L.name) {
        시도.push([{ [L.name]: name }, "name"]);
        if (공백(name) !== name) 시도.push([{ [L.name]: 공백(name) }, "name"]);   // 목록에 빈칸이 겹쳐 적힌 이름 — 한 칸으로 줄여 다시
      }
      if (먼저 === "name") 시도.reverse();   // 상세를 열 때: 같은 이름의 줄을 모두 받으려고 이름 먼저
      for (const [texts, 종류] of 시도) {
        /* 가볍게(10-26 [새 지시 뒤 요청·멈춤]): 이름 단추만 붙일 때는 맞는 줄 하나면 되니 10줄만 받는다(700줄 응답은 1~2초·수백 KB).
           10줄에 없고 더 있으면 그때 700줄로 다시. 맞는 줄이 일부만 온 답(`전부:false`)은 상세용으로 쓰지 않는다. */
        const 맞는줄 = (res) => {
          const n = res.heads.indexOf(cfg.nameCol), c = res.heads.indexOf(cfg.codeCol);
          return res.rows.filter((r) => (종류 === "code" ? c >= 0 && 열쇠(r[c]) === 열쇠(code) : n >= 0 && 공백(r[n]) === 공백(name)));
        };
        let res = await 틀.query({ from: "2000-01-01", to: ymd(new Date()), sel: {} }, 가볍게 ? 틀.fewRows : 틀.manyRows, texts);
        let rows = 맞는줄(res);
        let 전부 = true;
        if (가볍게) {
          전부 = res.total <= res.rows.length;
          if (!rows.length && !전부) { res = await 틀.query({ from: "2000-01-01", to: ymd(new Date()), sel: {} }, 틀.manyRows, texts); rows = 맞는줄(res); 전부 = true; }
        }
        if (rows.length) return { heads: res.heads, rows, 전부 };
      }
      return null;
    } finally {
      foreground--;
    }
  }

  return { PAGES: PAGES_, list, ymd, prefetch, clearCache, 하나찾기 };
})();
