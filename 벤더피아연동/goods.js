// 단품관리·상품관리·재고조회 화면을 VIVIVIC 디자인의 이름 버튼 목록으로 바꾼다.
// 목록은 벤더피아에서 받아 저장해 두고(새로고침·새 로그인 전까지), 필터는 받아온 목록에서 바로 적용한다.
// 버튼을 누르면 그 항목의 데이터를 보여준다.
(() => {
  const { PAGES, list: fetchList, ymd } = VP_DATA;
  /* ④ **곁다리 모드** — 사장님 10-15: 「이곳에 도착하는 상품명을 상품관리와 동일한
       상품버튼으로 변경해 주세요. 이버튼으로 나타나는 동작은 상품관리의 상품버튼과 동일 합니다.」
       (장부 a1792028003 아래 · 짚으신 곳은 배송관리 표의 상품명 칸)
     배송관리(`search.js`)가 이 글을 **불러** 쓸 때가 그때다. 그러면 이 글은
     **상품관리와 똑같이** 돈다 — `PAGES` 의 상품관리 칸을 그대로 쓴다.
     ⚠ 상품관리 코드를 **베끼지 않는다.** 단추 꼴(`labelButton`)도 누른 뒤 하는 일(`show`)도
       상품관리가 쓰는 **그 하나**를 부른다. 두 벌이 되면 갈라진다.
     ⚠ 곁다리일 때는 제 화면(검색칸·목록)을 **그리지 않는다** — 상세 판과 창만 쓴다
       (`search.css` 의 `.vp-곁다리` 가 몸통을 감춘다). */
  const 곁다리길 = "/System/Master/salesGoods.aspx";
  /* 곁다리로 부른 표 둘 — 어느 쪽이든 받는다.
     ㄱ) `search.js` 가 세운 `window.VP상품단추요청` (뒷길로 불렀을 때)
     ㄴ) **배송관리 길 그 자체** — 10-15 부터 `불러오기.js` 가 이 글을 거기에도 보낸다.
         차례에 안 기대려고 길도 본다(search.js 가 먼저 안 돌아도 선다). */
  const 배송관리인가 = /firmdvlist\.aspx/i.test(location.pathname);
  const page = PAGES[location.pathname]
    || ((window.VP상품단추요청 || 배송관리인가) ? PAGES[곁다리길] : null);
  if (!page) return;
  /* ⚠⚠ **두 번 돌지 않는다.** 10-15 부터 이 글이 배송관리에 **두 길로** 올 수 있다 —
     `불러오기.js` 가 보내는 것과 `search.js` 의 뒷길. 두 번 돌면 곁다리 통이 둘이 되고
     벤더피아에 같은 조회를 두 번 보낸다. 여기서 한 번만 돌게 막는다. */
  if (window.__vp굿즈돌았나) return;
  window.__vp굿즈돌았나 = true;
  const 곁다리 = !PAGES[location.pathname];
  const 내길 = 곁다리 ? 곁다리길 : location.pathname;

  const startDt = document.getElementById("dcStartDt");
  const endDt = document.getElementById("dcEndDt");
  if (!document.forms[0] || !document.getElementById("btnSearch") || !document.getElementById("divGrid")) return;

  // 연결된 화면의 목록을 단품코드로 묶어 둔다
  //  상품관리 → 단품관리: 단품코드 → 단품 줄
  //  단품관리 → 상품관리: 단품코드 → 그 단품이 들어간 상품 줄들
  // 단품코드 뒤에 공백이 붙어 있거나 대소문자가 다른 경우가 있어 맞춰서 비교한다
  const codeKey = (code) => code.trim().toLowerCase();
  /* ② **맞댈 때만 쓰는 열쇠** (바이글 10-15 가 정했다) — 서류관리와 코드 꼴이 달라
       조용히 안 맞던 것을 잡는다:
         벤더피아연동  `code.trim().toLowerCase()`            (소문자로 만든다)
         서류관리      `replace(밑줄꼴, "_")`                  (소문자로 안 만든다)
       어느 쪽도 다른 쪽을 품지 못한다. 그래서 셋을 다 한다 —
       **앞뒤 빈칸 털기 → 밑줄 꼴과 `-` 를 `_` 하나로 → 소문자.**
     ⚠ **저장된 값은 안 고친다.** 화면에 보이는 코드는 서류에 적힌 그대로다.
       이 열쇠는 **맞대는 순간에만** 씌운다.
     ⚠ 서류관리의 `코드열쇠`(그쪽 `js/parse.js`)를 **고치지 마라** — 딴 작업자 자리다.
     ⚠⚠ `-` 를 `_` 로 함께 보는 것은 **바이글이 정한 것**이고, 서류관리 쪽 주석과 어긋난다:
       거기엔 「`-`(U+002D) 는 **넣지 마십시오** — 진짜로 다른 제품입니다」 라고 적혀 있다.
       바이글에게 그 글귀를 그대로 올렸다. 되돌리려면 아래 묶음에서 `\u002D` 만 빼면 된다. */
  const 맞대기열쇠 = (v) => String(v == null ? "" : v).trim()
    .replace(/[\u005F\u2581\uFF3F\u2017\u002D]/g, "_").toLowerCase();
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
  // 깃허브에서 온 글은 확장 저장소에 바로 못 닿는다 — 다리(VP저장)를 먼저 본다.
  const 창고 = window.VP저장 || (typeof chrome !== 'undefined' ? chrome.storage?.local : null);
  Promise.resolve(창고 && 창고.get("vpJohon")).then((받은 = {}) => {
    const vpJohon = 받은 && 받은.vpJohon;
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
      <div class="vp-ing-note" hidden></div>
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
  if (곁다리) {
    /* 배송관리 화면의 `#vp-root` **안**에 넣는다. 그래야 ㄱ) `goods.css` 의 `#vp-root …`
       규칙이 그대로 먹고 ㄴ) 전환 단추가 우리 것을 숨길 때 **같이 숨고**
       ㄷ) `vp-clean` 의 「몸의 자식은 숨긴다」 규칙에 걸리지 않는다.
       ⚠ 겹친 `id` 를 쓰지만 `getElementById` 는 **앞엣것**(배송관리 것)을 돌려준다. */
    root.classList.add("vp-곁다리");
    (document.getElementById("vp-root") || document.body).appendChild(root);
  } else {
    document.body.appendChild(root);
    document.documentElement.classList.add("vp-clean");
  }

  const filters = root.querySelector(".vp-filters");
  const q = filters.querySelector(".vp-q");
  const selects = [...filters.querySelectorAll("select")];
  const from = filters.querySelector("[name=from]");
  const to = filters.querySelector("[name=to]");
  const note = root.querySelector(".vp-note");
  const cached = root.querySelector(".vp-cached");
  const list = root.querySelector(".vp-goods-list");
  const ingNote = root.querySelector(".vp-ing-note");
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

  /* ⚠⚠ 10-14 사장님 (단품 상세 팝업을 짚으시고): 「상세팝업 외부바탕화면 클릭시 상세팝업 닫히게 해줘」
     팝업이 넷인데 **상세 창만** 바깥 닫기가 없었다 —
       .vp-modal(연결된 항목) · .vp-notice(안내) · .vp-edge-pop(부속 도면) → 이미 있었다
       .vp-goods-panel(상세 창)                                          → **없었다. 여기에 넣는다.**
     상세 창은 어두운 뒤바탕이 없는 **떠 있는 카드**라, 「바깥을 눌렀다」 를 이렇게 가린다 —
       ㄱ) 누르기 시작한 자리와 뗀 자리가 **둘 다 상세 창 바깥**일 때만 닫는다
           (카드 안을 누르다 끌어서 밖에서 뗀 것에 안 닫힌다. 카드 속을 눌러 닫히면 더 나쁘다.)
       ㄴ) ⚠ **0.5초 넘게 누른 것은 짚어서 지시하기다** — 그때는 안 닫는다.
           사장님이 꾹 눌러 짚으시면 손을 뗄 때 click 이 떨어지는데, 그것으로 닫히면 안 된다.
           (`shared/viggle.js` 도 같은 탈을 겪어 거기서는 click 하나를 흘려보내 풀었다.)
       ㄷ) 위에 다른 팝업(연결·안내·부속)이 떠 있으면 그 뒤바탕을 누른 것이니 상세 창은 그대로 둔다. */
  const 안에있나 = (el, 고르개) => !!(el && el.closest && el.closest(고르개));
  const 상세밖인가 = (t) => !panel.hidden && !(panel.contains && panel.contains(t))
    && !안에있나(t, ".vp-modal, .vp-notice");
  let 누른때 = 0, 밖에서눌렀다 = false;
  addEventListener("mousedown", (e) => {
    누른때 = Date.now(); 밖에서눌렀다 = 상세밖인가(e.target);
  }, true);
  addEventListener("mouseup", (e) => {
    if (!밖에서눌렀다) return;
    밖에서눌렀다 = false;
    if (Date.now() - 누른때 >= 500) return;            // 꾹 누른 것 = 짚어서 지시하기
    if (!상세밖인가(e.target)) return;                 // 뗀 자리가 상세 창 안이면 안 닫는다
    panel.hidden = true; delete panel.dataset.name;
  }, true);

  /* ESC 로도 닫는다 — **맨 위의 것 하나만.** (넷 다 같은 꼴이 되게) */
  const 맨위팝업 = () => {
    const 덮개 = [...root.querySelectorAll(".vp-notice")].pop();   // 안내·부속 (나중 것이 맨 위)
    if (덮개) return () => 덮개.remove();
    if (!modal.hidden) return () => { modal.hidden = true; };
    if (!panel.hidden) return () => { panel.hidden = true; delete panel.dataset.name; };
    return null;
  };
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const 닫기 = 맨위팝업(); if (!닫기) return;
    e.preventDefault(); 닫기();
  });

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
  /* ⚠ 10-16 사장님: 「**FOB는 가격정보로서 이 상세의 규칙에 따라 값을 볼 수 있는 사용자를
       제한 해 주어야 합니다**」(장부 a1792135808) — 새 규칙을 만들지 않고 **이 규칙에 한 낱말만** 더했다.
       이러면 승인 안 된 아이디에게는 값이 **글 속에 아예 안 들어간다**(아래 `detailFields` 가
       승인 때만 `listOf(amounts)` 를 부른다). */
  const AMOUNT = /단가|수수료|원가|비용|금액|이익|선불비|착불비|설치비|유리비|제품비|FOB/;
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

  /* ── ② 수입정보 (서류관리 자료) ──────────────────────────
     사장님 10-15: 「단품코드와 서류관리프로그램에서 사용되는 코드와 일치시 서류관리
       프로그램의 해당코드에 대한 상세정보가 본 단품버튼의 상세팝업에서 수입정보 버튼을
       누르면 나타나게 해줘」 (장부 a1792025546)
     읽는 곳 — `artifacts/vivivic-4b7ef/public/data/docs_files` 의 **`cipl` 칸만**.
       서류관리(`vivivic-docs`)의 앱스 스크립트가 잔액서류(CI&PL) 엑셀을 읽어 적어 둔 것이다.
       ⚠ **읽기만 한다. 한 글자도 안 쓴다.** 서류관리 코드는 한 줄도 건드리지 않았다.
       ⚠ `cipl` 만 받는다 — 파일 이름·경로·거래처 칸은 **받지도 않는다**(사람 칸이 샐 틈을 없앤다).
       ⚠ **거래처 이름을 조건에 박지 않는다.** 코드가 맞으면 뜨고, 안 맞으면 단추가 안 생긴다.
         그래서 다음 거래처가 들어와도 그대로 된다.
     ⚠ 표(토큰)는 손잡이가 쓰는 `vg.tok` 칸을 **같이 쓴다**. `shared/viggle.js` 는
       고치지 않기로 되어 있어 거기서 꺼내 쓸 수 없다. */
  const 서류 = {
    KEY: "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs",
    PROJ: "vivivic-4b7ef",
    /* ⚠⚠ 10-16 사장님 (수입정보 상세 창을 짚어 보내신 말씀, 그대로):
         「**단품코드/상품명/색상/포장규격/입수/CBM/FOB 순으로 표기를 해주고 지금 언급한 표기는
           공통정보로 한번만 표기해 주면됩니다. … 수량과 서류날짜는 부분은 삭제하고**」
         ⚠ 차례를 바꾸지 마라. ⚠ **수량·서류 날짜는 여기 넣지 않는다** — 차수 박스로 갈 것이다. */
    머리: ["단품코드", "상품명", "색상", "포장규격", "입수", "CBM", "FOB"],
  };
  /* ⚠⚠ **밖으로 나가는 길을 둘 둔다 (10-15).** 사장님 PC 에서 수입정보 단추가 **아예 안
       생겼다** — 403 길의 모습과 같았다. 벤더피아 쪽 **CSP `connect-src`** 가 창고로 나가는
       것을 막으면 화면 글이 아무리 애써도 못 받는다.
     그래서 **확장 다리(`window.VP밖에`)를 먼저** 쓴다 — 확장 쪽 받아오기는 그 CSP에 안 묶인다.
     다리가 없으면(확장이 옛 판) 전처럼 **제가 바로** 받는다.
     ⚠ 어느 길로 됐는지 **까닭에 적는다** — 다음에 또 모르면 안 된다. */
  let 어느길 = "";
  async function 밖에서(주소, 옵션) {
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션 || null);
      if (답 && 답.다리) { 어느길 = "다리"; return 답; }
      어느길 = "다리무응답";                           // 다리가 답을 안 줬다 — 제가 받아 본다
    }
    const r = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션 || {}));
    if (!어느길 || 어느길 === "다리무응답") 어느길 = window.VP밖에 ? "다리무응답→바로" : "바로";
    return { ok: r.ok, status: r.status, 글: await r.text(), 다리: false };
  }

  async function 서류표() {
    try {
      const 둔것 = JSON.parse(localStorage.getItem("vg.tok") || "null");
      if (둔것 && 둔것.until > Date.now() + 60000) return 둔것.tok;
    } catch (e) {}
    const r = await 밖에서(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${서류.KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true }) });
    if (!r.ok) throw new Error("표 " + r.status + (r.탈 ? "/" + r.탈 : ""));   // 익명 로그인이 막혔나
    const d = JSON.parse(r.글);
    if (!d.idToken) throw new Error("표 없음");
    try { localStorage.setItem("vg.tok", JSON.stringify({ tok: d.idToken, until: Date.now() + 3300000 })); } catch (e) {}
    return d.idToken;
  }
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
  let 수입 = null;            // 맞대기열쇠 → [줄] · null 이면 아직 안 받았다/못 받았다
  async function 수입받기() {
    const tok = await 서류표();
    const 주소 = `https://firestore.googleapis.com/v1/projects/${서류.PROJ}/databases/(default)`
      + `/documents/artifacts/${서류.PROJ}/public/data:runQuery`;
    const 물음 = { structuredQuery: {
      from: [{ collectionId: "docs_files" }],
      /* 표를 이미 읽어 둔 줄만 받는다 — 나머지는 품목이 없어 받을 것이 없다 */
      where: { fieldFilter: { field: { fieldPath: "cipl.v" }, op: "GREATER_THAN_OR_EQUAL",
                              value: { integerValue: "1" } } },
      select: { fields: [{ fieldPath: "cipl" }] } } };   // ⚠ `cipl` 만. 사람 칸은 받지 않는다
    const r = await 밖에서(주소, { method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok },
      body: JSON.stringify(물음) });
    if (!r.ok) throw new Error("창고 " + r.status + (r.탈 ? "/" + r.탈 : ""));  // 창고가 막았나(403)
    const 칸 = new Map();
    for (const 한줄 of JSON.parse(r.글)) {
      const cipl = 풀기(한줄?.document?.fields?.cipl);
      for (const it of (cipl && cipl.items) || []) {
        const 코드 = String(it.code == null ? "" : it.code).trim();
        if (!코드) continue;
        const 열쇠 = 맞대기열쇠(코드);
        /* ⚠ 칸은 **모두 글자**여야 한다. `detailFields` 가 `row[i].trim()` 을 부른다 —
             숫자를 그대로 넣으면 상세가 **한 줄도 안 그려진다**(10-15 재서 잡았다). */
        const 글자 = (v) => (v === null || v === undefined || v === "" ? "" : String(v));
        const 줄 = [코드, 글자(it.name), (it.colors || []).join(" · "), 글자(it.size),
                    글자(it.perCtn), 글자(it.cbm), 글자(it.price)];
        const 둔것 = 칸.get(열쇠) || [];
        /* 같은 코드가 서류 여러 장에 오면 **다 보여 드린다** — 다만 똑같은 줄은 한 번만 */
        if (!둔것.some((x) => x.join("\u0001") === 줄.join("\u0001"))) 둔것.push(줄);
        칸.set(열쇠, 둔것);
      }
    }
    수입 = 칸;
    /* 늦게 왔으면 열려 있는 상세를 다시 그려 단추를 끼운다 */
    if (!panel.hidden && panel.dataset.name && panel._args) show(panel.dataset.name, ...panel._args);
  }

  /* 이 단품(들)에 맞는 서류 줄 — 없으면 빈 배열. 거래처 이름은 아무 데도 안 쓴다. */
  function 수입찾기(h, items) {
    if (!수입) return [];
    const 본것 = new Set();
    const 모음 = [];
    for (const row of items) {
      for (const 코드 of String(row[h.indexOf(page.codeCol)] || "").split("+")) {
        const 열쇠 = 맞대기열쇠(코드);
        if (!열쇠 || 본것.has(열쇠)) continue;
        본것.add(열쇠);
        모음.push(...(수입.get(열쇠) || []));
      }
    }
    return 모음;
  }

  /* 여러 장에서 온 줄을 **한 벌로** 모은다 — 사장님: 「공통정보로 한번만 표기」.
     ⚠ 장마다 값이 다르면 **버리지 않고** 가운뎃점으로 잇는다(없는 것으로 보이면 안 된다). */
  function 공통한벌(줄들) {
    return 서류.머리.map((_, i) => {
      const 본것 = [];
      for (const 줄 of 줄들) {
        const v = String(줄[i] == null ? "" : 줄[i]).trim();
        if (v && !본것.includes(v)) 본것.push(v);
      }
      return 본것.join(" · ");
    });
  }

  function 수입창(이름, 줄들) {
    modalTitle.textContent = 이름 + " · 수입정보";
    /* ⚠ 차수마다 되풀이하지 않는다 — **한 벌만** 그린다 (10-16 분부) */
    modalBody.replaceChildren(detailFields(서류.머리, 공통한벌(줄들)));
    modalGoto.textContent = "";                    // 「…로 가기」 는 둘 곳이 없다
    modalGoto.removeAttribute("href");
    modal.hidden = false;
  }

  /* 상세 맨 위에 놓는 「수입정보」 단추. **맞는 것이 없으면 아무것도 안 만든다**(분부). */
  function 수입단추(h, items) {
    const 줄들 = 수입찾기(h, items);
    if (!줄들.length) return null;
    const 통 = document.createElement("div");
    통.className = "vp-수입";
    const b = 통.appendChild(document.createElement("button"));
    b.type = "button";
    b.textContent = "수입정보";
    b.appendChild(Object.assign(document.createElement("small"),
      { textContent: 줄들.length > 1 ? 줄들.length + "건" : "" }));
    b.addEventListener("click", (e) => {
      e.preventDefault();
      수입창(items[0][h.indexOf(page.nameCol)] || "", 줄들);
    });
    return 통;
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

  /* ⚠⚠ 10-14 사장님 (상품관리 상세를 짚으시고): 「상품관리 상세에 나타나는 내용을
       매출처명 차이로 중복 나열하지말고 매출처버튼으로 필터링 시켜줘」
     한 상품이 벤더피아에 **매출처마다 한 줄**로 들어 있다. 그래서 상세를 열면 같은 상품이
     매출처 수만큼 통째로 겹쳐 나왔다(짚으신 자리에 「매출처명 협찬 · 매출처코드 1014」 가 보였다).
     → 매출처 **알약**을 상세 창 위에 두고, 고른 매출처의 줄만 보인다. 처음에는 **첫 매출처** 하나만.
       「전부」 를 누르면 전처럼 다 보인다 — **값을 지운 것이 아니라 가린 것뿐이다.**
     ⚠ 줄 하나하나는 전처럼 `detailFields` 가 그대로 그린다 — 금액 칸 숨기기·전체속성 보기·
       연결된 단품 단추·부속보기가 한 톨도 안 바뀐다.
     ⚠ 매출처가 **하나뿐**이면 알약 줄을 **아예 안 그린다** (자리만 먹는다). */
  function 매출처별로(h, items) {
    const i매출처 = h.indexOf("매출처명");
    const 묶음 = [];                                   // [[매출처명, 줄], …] — 받은 차례 그대로
    for (const row of items) 묶음.push([(i매출처 >= 0 ? (row[i매출처] || "") : "").trim() || "(없음)", row]);
    const 이름들 = [...new Set(묶음.map(([n]) => n))];
    const 그릇 = document.createElement("div");
    const 줄판 = [];
    for (const [n, row] of 묶음) {
      const 칸 = 그릇.appendChild(document.createElement("div"));
      칸.className = "vp-store-one";
      칸.dataset.store = n;
      칸.appendChild(detailFields(h, row, linkCell));   // ← 전과 똑같이 그린다
      줄판.push(칸);
    }
    if (i매출처 < 0 || 이름들.length < 2) return [그릇];  // 매출처가 하나뿐 — 알약을 안 그린다
    let 고른것 = 이름들[0];                             // 처음에는 첫 매출처만 (겹쳐 보이지 않게)
    const 알약칸 = document.createElement("div");
    알약칸.className = "vp-store-pills";
    const 다시그리기 = () => {
      알약칸.replaceChildren();
      for (const [값, 글] of [["", "전부"], ...이름들.map((n) => [n, n])]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "vp-store-pill";
        b.textContent = 글;
        b.setAttribute("aria-pressed", 고른것 === 값 ? "true" : "false");
        b.addEventListener("click", () => { 고른것 = 값; 다시그리기(); });
        알약칸.appendChild(b);
      }
      for (const 칸 of 줄판) 칸.hidden = !!고른것 && 칸.dataset.store !== 고른것;
    };
    다시그리기();
    return [알약칸, 그릇];
  }

  /* ② 상세에 **그 상품의 inghome 페이지 링크**를 건다 (맞은 상품에만) */
  function ing링크(name) {
    const 것 = ing맞은것.get(name);
    if (!것 || !것.u) return null;
    const 줄 = document.createElement("div");
    줄.className = "vp-ing-link";
    const a = 줄.appendChild(document.createElement("a"));
    a.href = 것.u;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "inghome 에서 보기";
    const 작게 = 줄.appendChild(document.createElement("small"));
    작게.textContent = 것.꼴 === "그대로" ? " 이름이 그대로 맞습니다" : " 이름이 거의 맞습니다 — " + 것.t;
    return 줄;
  }

  function show(name, h, items) {
    panel.dataset.name = name;
    panel._args = [h, items];
    panelTitle.textContent = name;
    if (page.locationTabs) panelBody.replaceChildren(...locationView(h, items));
    else if (page.nameCol === "상품명")
      panelBody.replaceChildren(...[ing링크(name), ...매출처별로(h, items)].filter(Boolean));
    else panelBody.replaceChildren(...[수입단추(h, items),
      ...items.map((row) => detailFields(h, row, linkCell))].filter(Boolean));
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
        /* ⚠⚠ 10-14 사장님: 「선택된버튼이 검게 변한후 다른선택시 해제되지않고
             모든 선택된버튼이 검은상태로 유지되는 현상 수정해줘」
           까닭 — 이름 단추를 담는 통이 **둘**이다. [전체보기] 는 `list`(.vp-goods-list) 하나지만,
           [현위치별 보기] 는 **현위치마다 제 통**을 만들고(renderPlaces 의 `body`, 같은 class)
           **같은 단추를 그리로 옮겨 담는다.** 그런데 여기서는 `list` 안에서만 `.on` 을 뗐다.
           그래서 현위치별 보기에서는 앞의 것이 안 풀려 누른 것이 **다 검게 쌓였다.**
           (재서 확인: 전체보기 1개 · 현위치별 보기 **3개**)
           → 통을 가리지 않고 **이름 단추 통 전부**에서 뗀다.
           ⚠ `.vp-place-head`(현위치 펼침)와 보기 탭도 `.on` 을 쓰지만 **그것들은 이 통 밖**이라
             건드리지 않는다 — 현위치를 여럿 펼쳐 두신 것은 그대로 남아야 한다. */
        root.querySelectorAll(".vp-goods-list button.on").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        show(name, heads, group.items);
      });
      list.appendChild(b);
      groups.set(name, group);
    }
  }

  /* ⚠⚠ 10-14 사장님 (상품관리를 짚으시고): 「상품관리 - 상품버튼의 명칭과 inghome 카탈로그
       작업자 프로그램의 inghome 스크랩된 모든 제품명을 비교하여 연결지을수 있는지 확인하고
       어느정도 연결점을 찾을 수 있다면 상세에 해당 상품의 페이지링크를 걸고
       이렇게 링크가 걸린 상품박스 한단에 붉은색 마킹해줘」
     사장님이 차례를 정해 주셨다 — **① 먼저 맞춰 보고 확인**, 그다음에 링크·붉은 줄.
     그런데 벤더피아 상품명은 **사장님 컴퓨터에만** 있다(클라우드에서는 벤더피아에 못 들어간다).
     그래서 **① 세기를 프로그램이 제 손으로** 한다 — 사장님 화면에 숫자만 적는다.
     ⚠ 아직 **링크도 붉은 줄도 걸지 않는다.** 숫자를 보고 정한다. */
  const ING깃 = "https://vivivic-cloud.github.io/vivivic-apps/inghome%EC%B9%B4%ED%83%88%EB%A1%9C%EA%B7%B8/data/";
  /* 맞은 것만 담는다 — 상품명 → { u(그 상품 페이지 주소), t(inghome 이름), 꼴("그대로"/"거의") }
     ⚠ 남의 회사 **그림은 안 가져온다.** 주소(링크)만 쓴다. */
  const ing맞은것 = new Map();
  const 맞춤 = (t) => String(t || "").trim().toLowerCase();        // 이 집의 비교 방식
  const 바짝 = (t) => String(t || "").toLowerCase()
    .replace(/\([^)]*\)/g, " ")                                   // 괄호 꼬리말 (색상 따위)
    .replace(/[^0-9a-z가-힣]/g, "");                                // 빈칸·기호 다 지움
  async function ing맞춰보기() {
    if (page.nameCol !== "상품명") return;                         // 상품관리에서만
    const 적기 = (글, 나쁨) => { ingNote.hidden = false; ingNote.textContent = 글;
      ingNote.classList.toggle("vp-ing-bad", !!나쁨); };
    let 목록 = [];
    try {
      const 쪽들 = await Promise.all([0, 1, 2, 3].map((i) =>
        fetch(ING깃 + "p" + i + ".json", { cache: "no-store" }).then((r) => r.ok ? r.json() : [])));
      목록 = 쪽들.flat();
    } catch (e) { return 적기("inghome 목록을 못 받았습니다 — " + (e.message || "알 수 없음"), true); }
    if (!목록.length) return 적기("inghome 목록을 못 받았습니다 (빈 목록)", true);
    const 그대로 = new Set(목록.map((o) => 맞춤(o.t)).filter(Boolean));
    const 줄여서 = new Set(목록.map((o) => 바짝(o.t)).filter(Boolean));
    /* 어느 줄에 걸지 고를 수 있게 이름 → 줄 로 담아 둔다.
       ⚠ **바짝 줄이면 겹치는 이름이 있다**(쟀다: 684개 중 14개 이름이 32줄로 겹친다).
         겹치는 이름은 어디에 걸지 고를 수 없으니 **아예 안 건다.** 엉뚱한 데로 보내면 더 나쁘다. */
    const 그대로줄 = new Map(), 줄인줄 = new Map(), 줄인겹침 = new Set();
    for (const o of 목록) {
      const a = 맞춤(o.t), b = 바짝(o.t);
      if (a && !그대로줄.has(a)) 그대로줄.set(a, o);
      if (b) { if (줄인줄.has(b)) 줄인겹침.add(b); else 줄인줄.set(b, o); }
    }
    const 이름들 = [...groups.keys()];
    let 딱 = 0, 거의 = 0;
    ing맞은것.clear();
    for (const n of 이름들) {
      const a = 맞춤(n), b = 바짝(n);
      if (그대로.has(a)) { 딱++; ing맞은것.set(n, { ...그대로줄.get(a), 꼴: "그대로" }); }
      else if (줄여서.has(b) && !줄인겹침.has(b)) { 거의++; ing맞은것.set(n, { ...줄인줄.get(b), 꼴: "거의" }); }
      else if (줄여서.has(b)) 거의++;                 // 겹쳐서 못 거는 것 — 세기는 센다
    }
    /* ③ 링크가 걸린 상품 단추 **한 단에 붉은색 마킹** (조혼가구 붉은 줄과 같은 색·같은 꼴) */
    for (const [n, g] of groups) g.b.classList.toggle("vp-ing", ing맞은것.has(n));
    if (panel.dataset.name) show(panel.dataset.name, ...panel._args);   // 열려 있으면 상세도 새로
    적기(`inghome 맞춰보기 — 우리 상품 ${이름들.length}개 · inghome ${목록.length}개 · `
       + `이름이 그대로 맞는 것 ${딱}개 · 거의 맞는 것 ${거의}개`
       + ` (합쳐 ${딱 + 거의}개, ${이름들.length ? Math.round((딱 + 거의) * 100 / 이름들.length) : 0}%)`
       + ` · 링크를 건 것 ${ing맞은것.size}개 — 그 단추 밑에 붉은 줄이 그어집니다`);
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
      const got1 = await fetchList(page, 내길, serverValue, dates, (h, rows, got, total) => {
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
      /* 목록이 다 들어온 뒤에 한 번만 맞춰 본다 (상품관리에서만) */
      ing맞춰보기();
    } catch (err) {
      if (id === loadId) { loading = false; note.textContent = "불러오지 못했습니다. 다시 로그인한 뒤 시도해 주세요."; }
    }
  }

  // 벤더피아에서 거르는 칸은 원래 화면의 항목을 그대로 쓰고, 바꾸면 새로 받아온다
  if (serverSel) {
    /* ⚠ 곁다리로 돌 때는 이 화면(배송관리)에 `ddlStatus` 같은 칸이 **없다.**
       없으면 그냥 넘긴다 — 여기서 터지면 상품 단추가 아예 안 온다. */
    const src = document.getElementById(page.serverSelect[1]);
    if (src) {
      for (const o of [...src.options].filter((o) => o.value !== "전체")) serverSel.add(new Option(o.text, o.value));
      serverSel.value = src.value === "전체" ? "" : src.value;
    }
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
    /* ④ 목록이 들어왔다고 알린다 — 배송관리가 이미 그려 둔 상품명 칸을 그때 단추로 바꾼다.
       ⚠ `load()` 를 또 부르지 않는다. 이미 있는 이 차례에 얹는다. */
    if (곁다리) window.dispatchEvent(new Event("vp상품단추준비"));
    // 첫 목록을 다 받은 뒤에 연결된 화면의 목록을 받는다 (벤더피아가 요청을 하나씩 처리해서, 동시에 받으면 첫 목록이 늦어진다)
    (page.top ? loadTop().catch(() => { top = null; apply(); }) : Promise.resolve())
      .then(() => (page.stock === "link" || page.stock === "parts") && loadStock().catch(() => {}))
      .then(() => page.link && loadLinked().catch(() => { linked = { heads: [], byCode: new Map() }; }))
      /* ② 단품관리에서만 — 서류관리 자료를 뒤에서 조용히 받는다.
         ⚠ 못 받아도 화면은 그대로 돌아야 한다. 그때는 단추가 안 생길 뿐이다. */
      .then(() => (page.nameCol === "단품명"
        ? 수입받기()
            .then(() => window.VP말?.("수입정보:코드" + (수입 ? 수입.size : 0) + "가지/" + 어느길))
            /* ⚠ 까닭을 적는다 (10-15) — 사장님 PC 에서 단추 자체가 안 생겼다.
                 403 인지, CSP 로 막힌 것인지, 표를 못 받은 것인지 **글로** 남긴다. */
            .catch((e) => { 수입 = null;
              window.VP말?.("수입정보:못받음 " + (e && e.message ? e.message : e)
                + " · 길" + (어느길 || (window.VP밖에 ? "다리있음" : "다리없음")));
              console.warn("수입정보", e); })
        : Promise.resolve()))
      // 지금 화면의 목록을 다 받았으면 다른 메뉴가 쓸 목록을 뒤에서 받아 둔다
      .then(() => VP_DATA.prefetch());
  });

  /* ④ 곁다리 — 배송관리가 쓸 **상품 단추 한 개**를 만들어 준다.
     ⚠ 없는 이름에는 **`null`** 을 돌려준다. 사장님 분부대로 그 칸은 **글자 그대로** 둔다 —
       가짜 단추를 만들지 않는다. */
  if (곁다리) {
    window.VP상품단추 = (이름) => {
      const 이것 = groups.get(String(이름 == null ? "" : 이름).trim());
      if (!이것) return null;
      const b = document.createElement("button");
      b.type = "button";
      /* 상품관리의 `labelGroup` 이 하는 것과 **같은 것을 부른다** */
      labelButton(b, 이름, 이것.items.map((r) => r[col(page.codeCol)]), stockQty(이것.items));
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        /* 누른 단추만 검게 — 상품관리와 같은 결 */
        document.querySelectorAll("#vp-root .vp-상품칸 button.on").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        show(이름, heads, 이것.items);        // ← 상품관리가 쓰는 **그 상세**를 그대로 연다
      });
      return b;
    };
    window.VP상품목록몇개 = () => groups.size;
    window.VP말?.("곁다리:섬");                      // ⚠ 까닭 적기 (10-15)
  }
})();
