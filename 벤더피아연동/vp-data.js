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
  //  원래칸: 목록 표의 칸 = 벤더피아 원래 화면 목록이 **보이는 칸 그대로**(이름·차례). 11-17 [새 지시 모든표 통일] 사장님 크롬 원래 화면(`window.name="vp원본"`)에서
  //          머리 칸 넓이 > 0 인 것을 읽음(체크 칸 뺌). 같은 이름이 두 번이면 두 번 적는다(받은 자료의 같은 차례 칸). 받은 자료에 없는 이름은 빼고 그린다.
  //  덧칸: 원래 화면에 없는데 이 프로그램이 덧붙인 칸(맨 끝) {name, ing|place|sum} — 10-21 부터 있던 칸, 빼지 않았다(11-17 보고)
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
      pill: { label: "현위치", col: "매입처명", drop: true },   // drop: 알약 대신 고르는칸(10-26)
      원래칸: ["매입처명", "창고", "단품분류", "바코드", "단품코드", "단품명", "박스수", "매장판매단가", "수수료", "자재원가", "자재비용",
        "매입단가", "재고유형", "발주유형", "판매상태", "생산셀명", "포장박스코드", "총재고수량", "등록일", "옵션"],
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
      원래칸: ["매출처명", "상품코드", "상품명", "배송사명", "매입처명", "단품코드", "단품명", "판매금액", "공급금액", "매입금액", "매출이익",
        "선착불", "수도선불비", "수도착불비", "수도외곽선불비", "수도외곽착불비", "지방선불비", "지방착불비", "지방외곽선불비", "지방외곽착불비",
        "제주선불비", "제주착불비", "조립설치비", "유리비", "제품비", "상품메모", "판매상태", "등록일", "수정일"],
      덧칸: [{ name: "상품정보", ing: true }],
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
      원래칸: ["창고", "분류명", "매입처", "단품코드", "단품명", "옵션", "적정재고30", "20일", "10일", "단가", "양품수", "금액", "불량품", "금액",
        "미확정건", "출고예정", "입고예정", "가용재고", "가용금액", "비고", "이력"],
      덧칸: [{ name: "현위치", place: true }, { name: "양품수 합", sum: "양품수" }],
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
  /* ⚠ 10-27 [새 지시 오리지날느림] 사장님(그대로) 「오리지날 화면 보기 버튼도 한번 누르면 함흥차사야 - 이건그냥 벤더피아 화면 보여주는건데 왜이리 오래걸려」
     까닭: 벤더피아(ASP.NET)는 한 사람 요청을 하나씩 처리하고, 기다리는 요청은 0.5초마다 다시 줄을 선다.
       우리 화면이 뒤에서(이름 찾기·재고·미리 받기) 요청을 쉬지 않고 이어 보내면 새 창 오리지널의 요청이 계속 밀린다.
     → 「벤더피아」 단추(login.js)가 `VP원본쉼()` 을 부르면 그때부터 15초 동안 **여기서 나가는 벤더피아 요청을 모두 세운다**.
       localStorage 라 같은 벤더피아의 다른 우리 탭도 같이 쉰다. 이미 나간 요청은 그대로 끝난다. */
  /* ⚠⚠ 10-27 [새 지시 이동느림근본] 사장님(그대로) 「야 이거 상담내용 보거나 메인페이지로 가거나 아무튼 클릭으로 벤더피아의 다른 페이지 보여질때 너무 오래걸린다 뭔가 원론적인 문제가 있지 않을까?」
     까닭(사장님 크롬에서 잼, 조회 GET 만): 벤더피아는 한 로그인의 aspx 요청을 **하나씩** 처리하고, 못 들어간 요청은 0.5초마다 다시 잡아 본다.
       300ms 쪽 하나가 — 우리 뒤 요청이 하나라도 쉬지 않고 이어지면 4.5~8.5초, 둘이면 14.8초. 이어 보내는 우리 요청이 잠금을 늘 먼저 잡는다.
       누를 때 새 요청만 멈추면 0.4~0.8초. 이미 나간 요청을 끊는 것(Abort)은 소용없다 — 서버는 끝까지 처리한다(6개 끊어도 0.8~1.9초).
       뒤 요청 사이에 0.55초 틈을 두면 0.33초(혼자일 때와 같음), 0.3초 틈은 0.4~0.9초.
     → **벤더피아로 가는 우리 요청은 모두 이 줄(`벤더피아받기`)로만** 간다(search.js 도 `VP_DATA.받기`). 규칙:
       · 한 문서에서 한 번에 **하나만** 나간다(동시에 보내도 서버가 하나씩 하고 사이마다 놀아 더 늦다 — 4개 동시 1.8초 ↔ 차례로 1.0초).
         차례: 보호(고객문의 등록) → 사람(누른 것·조회) → 뒤(이름 찾기·미리 받기).
       · 이 쪽을 **떠날 때**(beforeunload) 보호 말고 새 요청을 세운다(15초 — 이동이 취소되면 그 뒤 다시 간다). pagehide 에 남은 것을 끊는다.
         다른 우리 문서(탭·틀)에도 알린다(localStorage `vp쉼`) → 그쪽 뒤 요청이 쉰다. 새 쪽이 뜨면(그 쪽 vp-data.js) 1.5초 뒤 풀린다.
       · 다른 쪽으로 가는 링크·벤더피아 제 단추를 **누르는 순간**(pointerdown·Enter) 2.5초 뒤 요청을 세운다 — 새 탭으로 열리는 것도 그 사이 잠금을 잡는다.
         (우리 화면 `#vp-root` 의 단추 — 조회·이름 단추 — 는 안 세운다: 세우면 이름 단추·점이 2.5초 늦게 붙는다. 시험 `상품단추` 가 잡음)
       · 화면에 **안 보이면** 뒤 요청은 멈추고, 안 보이거나 창이 딴 데 있으면(다른 창·오리지널 새 창) 사람 요청도 요청 사이 0.55초 틈을 둔다.
       · 「벤더피아」 단추(`VP원본쉼`)는 전처럼 15초 — 다른 우리 탭에도.
     ⚠ 새 벤더피아 요청 길을 만들면 **반드시 `벤더피아받기`/`VP_DATA.받기`** 를 쓴다. 맨 `fetch` 로 벤더피아에 묻지 마라. */
  const 쉼열쇠 = "vp쉼", 틈 = 550, 떠남동안 = 15000, 누름동안 = 2500, 원본동안 = 15000;
  const 나 = Math.random().toString(36).slice(2), 내탄생 = Date.now();
  let 쉼끝 = 0, 떠남끝 = 0, 마지막끝 = 0, 나감 = 0, 번호 = 0, 깨움 = 0;
  const 줄 = [], 나간것 = new Set(), 순위 = { 보호: 0, 사람: 1, 뒤: 2 };
  const 쉼읽기 = () => { try { return JSON.parse(localStorage.getItem(쉼열쇠) || "null"); } catch (e) { return null; } };
  const 쉼쓰기 = (v) => { try { localStorage.setItem(쉼열쇠, JSON.stringify(v)); } catch (e) {} };
  const 남의쉼끝 = () => { const v = 쉼읽기(); return v && v.누구 !== 나 && v.at >= 내탄생 ? v.끝 : 0; };
  const 보임 = () => !document.hidden;
  const 눈앞 = () => { try { return 보임() && window.top.document.hasFocus(); } catch (e) { return 보임() && document.hasFocus(); } };
  const 막힘 = (급, t) => {
    if (급 === "보호") return false;
    if (떠남끝 > t) return true;
    const 남의 = 남의쉼끝() > t;
    if (급 === "뒤" && (쉼끝 > t || 남의 || !보임())) return true;
    return (남의 || !눈앞()) && t < 마지막끝 + 틈;        // 다른 데서 벤더피아를 쓸 수 있을 때 — 잠금을 잡을 틈을 둔다
  };
  function 돌리기() {
    if (나감 || !줄.length) return;
    const t = Date.now();
    줄.sort((a, b) => 순위[a.급] - 순위[b.급] || a.n - b.n);
    const i = 줄.findIndex((x) => !막힘(x.급, t));
    if (i < 0) { if (!깨움) 깨움 = setTimeout(() => { 깨움 = 0; 돌리기(); }, 200); return; }
    const x = 줄.splice(i, 1)[0];
    나감++; 나간것.add(x);
    (x.일 ? Promise.resolve().then(x.일) : fetch(x.url, x.opt)).then(x.됨, x.안됨).finally(() => { 나감--; 나간것.delete(x); 마지막끝 = Date.now(); 돌리기(); });
  }
  const 벤더피아받기 = (url, opt = {}, 급 = "사람") => new Promise((됨, 안됨) => {
    const 끊개 = new AbortController();
    if (opt.signal) opt.signal.addEventListener("abort", () => 끊개.abort());
    줄.push({ url, opt: { ...opt, signal: 끊개.signal }, 급, n: 번호++, 끊개, 됨, 안됨 });
    돌리기();
  });
  /* [새 지시 비요크저장안됨] 줄을 통째로 잡고 일(async)을 돌린다 — 그동안 이 문서의 다른 벤더피아 요청은 안 나간다(보호 급, 이미 나간 것은 끝난 뒤).
     숨은 틀처럼 줄을 못 타는 요청(쪽이 직접 보내는 GET·저장 제출)이 우리 요청 뒤로 세션 잠금을 놓치지 않게. */
  const 잡기 = (일) => new Promise((됨, 안됨) => { 줄.push({ url: "", 일, opt: {}, 급: "보호", n: 번호++, 끊개: new AbortController(), 됨, 안됨 }); 돌리기(); });
  const 올리기 = (url) => { for (const x of 줄) if (x.url === url && x.급 === "뒤") x.급 = "사람"; 돌리기(); };   // 누른 것이 기다리는 뒤 요청은 사람으로
  const 끊기 = () => {
    for (const x of 줄.splice(0)) { if (x.급 === "보호") 줄.push(x); else x.안됨(new DOMException("떠남", "AbortError")); }
    for (const x of 나간것) if (x.급 !== "보호") x.끊개.abort();
  };
  window.VP원본쉼 = () => { 쉼끝 = Date.now() + 원본동안; 쉼쓰기({ at: Date.now(), 끝: Date.now() + 원본동안, 누구: 나 }); };
  if (typeof addEventListener === "function") {          // (시험이 node 에서 이 글을 읽기만 할 때는 없다)
  addEventListener("beforeunload", () => { const t = Date.now(); 떠남끝 = t + 떠남동안; 쉼쓰기({ at: t, 끝: t + 떠남동안, 누구: 나, 이동: 1 }); });
  addEventListener("pagehide", (e) => { if (!e.persisted) 끊기(); });
  addEventListener("pageshow", (e) => { if (e.persisted) { 떠남끝 = 0; 돌리기(); } });
  const 누름 = (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;
    /* 다른 쪽으로 가는 것만 — 진짜 주소 링크(어디든)·벤더피아 제 단추. 우리 화면(#vp-root)의 단추(조회·이름 단추)는 제 요청이 「사람」 이라 먼저 가니 안 세운다 */
    const 것 = e.target?.closest?.("a[href],area[href],button,input[type=submit],input[type=image],input[type=button],[onclick]");
    if (!것) return;
    const 링크 = 것.matches("a,area") && !/^(#|javascript:)/i.test(것.getAttribute("href") || "");
    if (링크 || !것.closest("#vp-root")) 쉼끝 = Math.max(쉼끝, Date.now() + 누름동안);
  };
  addEventListener("pointerdown", 누름, true);
  addEventListener("keydown", 누름, true);
  for (const 일 of ["visibilitychange", "focus", "pageshow"]) addEventListener(일, () => 돌리기());
  }
  { const v = 쉼읽기(); if (v && v.이동 && v.누구 !== 나 && v.끝 > Date.now()) 쉼쓰기({ ...v, 끝: Math.min(v.끝, Date.now() + 1500) }); }   // 새 쪽이 떴다
  let foreground = 0;
  const idle = async () => { while (foreground > 0) await new Promise((r) => setTimeout(r, 150)); };

  async function fetchAll(cfg, url, src, serverValue, dates, onPage, isCurrent, background = false) {
    // 검색칸은 id가 화면마다 달라(예: 재고조회의 목록 수 칸) 이름 끝으로도 찾는다
    const field = (id) => src.getElementById(id) || [...src.forms[0].elements].find((e) => e.name?.endsWith("$" + id));
    const nameOf = (id) => field(id)?.name || id;
    const post = async (fd) => (background && await idle(),
      parse(await (await 벤더피아받기(url, { method: "POST", body: fd, credentials: "include" }, background ? "뒤" : "사람")).text(), cfg.nameCol));
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
      src ||= new DOMParser().parseFromString(await (await 벤더피아받기(url, { credentials: "include" }, background ? "뒤" : "사람")).text(), "text/html");
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
    const open = async (url) => (await idle(), new DOMParser().parseFromString(await (await 벤더피아받기(url, { credentials: "include" }, "뒤")).text(), "text/html"));
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
  function 처음문서(url, 급) {
    if (!처음문서들.has(url)) {
      const 약속 = 벤더피아받기(url, { credentials: "include" }, 급).then((r) => r.text())
        .then(async (t) => (await 쉬기(), new DOMParser().parseFromString(t, "text/html")));
      처음문서들.set(url, 약속);
      약속.catch(() => 처음문서들.delete(url));
    }
    if (급 === "사람") 올리기(url);
    return 처음문서들.get(url);
  }
  // 벤더피아 검색 폼을 채워 한 번 묻는 틀 (fetchAll 의 query 와 같은 채움: 원래 검색칸 비우기 → 기간 → 고정값)
  function 질문틀(cfg, url, src, serverValue, 급) {
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
      const html = await (await 벤더피아받기(url, { method: "POST", body: fd, credentials: "include" }, 급)).text();
      await 쉬기();
      return parse(html, cfg.nameCol);
    };
    return { query, fewRows, manyRows: cfg.rowCnt || "700" };
  }
  // 이름·코드로 **하나만** 찾는다 (조회만). 코드가 있으면 코드로, 못 찾으면 이름으로. 맞는 줄(전체 칸)들을 돌려준다 — 상세를 열 때 쓴다.
  async function 하나찾기(cfg, url, serverValue, { name, code, 먼저, 가볍게 }) {
    foreground++;
    try {
      const 급 = 가볍게 ? "뒤" : "사람";     // 이름 단추 붙이기 = 뒤, 누른 단추 상세 = 사람
      const src = await 처음문서(url, 급);
      const 틀 = 질문틀(cfg, url, src, serverValue, 급);
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

  /* ── 발주역입력 실시간 단품 검색 (11-18 [새 지시 단품실시간]) ─────────────────────────────
     사장님: 재단 세부내역·이룸산업·로앤 출고내역의 「단품 추가」 검색을 창고 사본(`납품내역_단품목록`)이 아니라
            **벤더피아 단품관리에서 바로** — 확장을 다시 내려받지 않고.
     길: 깃 페이지(vivivic-cloud.github.io)가 `window.open` 으로 연 벤더피아 탭(이 글은 깃에서 받아 그 탭 MAIN 에서 돈다)과
         **창끼리 postMessage** 로 주고받는다. 깔린 확장(0.34.53~)의 `불러오기.js`·`bg.js` 가 이 글을 깃에서 넣으니 **덮어쓰기 없음**.
       · 이 탭 → 연 쪽(opener): `{__vp:"단품창"}` 인사(2초마다 · 물으면 바로). 받는 집은 `https://vivivic-cloud.github.io` 하나.
       · 연 쪽 → 이 탭: `{__vp:"단품찾기", 표, 낱말:[…]}` → 벤더피아 단품관리 검색 폼(단품명 `tbGoodsNm`, 없으면 단품코드 `tbGoodsCd`)에
         **조회 POST 한 번**(판매상태 전체·등록기간 2000-01-01~오늘·700줄) → `{__vp:"단품찾기답", 표, 로그인, 줄:[[단품코드, 단품명, 판매상태]], 낱말}`.
     ⚠ 건네는 것은 단품 **세 칸**과 로그인 여부뿐 — 쿠키·비밀번호·금액·매입처는 안 건넨다. 창고·바깥에 쓰지 않는다. 벤더피아에는 조회만.
     ⚠ 받는 집을 넓히지 마라. 요청은 `벤더피아받기` 줄(사람)로만 간다. */
  async function 단품검색(낱말들) {
    const url = "/System/Master/goods.aspx", cfg = PAGES[url];
    foreground++;
    try {
      const src = await 처음문서(url, "사람");
      if (!src.getElementById("btnSearch")) { 처음문서들.delete(url); return { 로그인: false, 줄: [] }; }
      const 틀 = 질문틀(cfg, url, src, "", "사람");
      const cond = { from: "2000-01-01", to: ymd(new Date()), sel: {} };
      const 시도 = [];
      for (const w of 낱말들.slice(0, 3)) {
        시도.push({ [cfg.lookup.name]: w });
        if (/^[A-Za-z0-9_-]{3,}$/.test(w)) 시도.push({ [cfg.lookup.code]: w });
      }
      let res = null, 쓴 = "";
      for (const texts of 시도) {
        res = await 틀.query(cond, 틀.manyRows, texts);
        if (!res.heads.length && res.doc.getElementById("txtID")) { 처음문서들.delete(url); return { 로그인: false, 줄: [] }; }
        쓴 = Object.values(texts)[0];
        if (res.rows.length) break;
      }
      const h = res ? res.heads : [], c = h.indexOf("단품코드"), n = h.indexOf("단품명"), s = h.indexOf("판매상태");
      const 줄 = c < 0 ? [] : res.rows.filter((r) => r[c]).map((r) => [r[c], n >= 0 ? r[n] : "", s >= 0 ? r[s] : ""]);
      return { 로그인: true, 줄, 쓴, 전체: res ? res.total : 0 };
    } finally {
      foreground--;
    }
  }
  if (typeof addEventListener === "function" && typeof location === "object" && /^https:\/\/(www\.)?vendorpia\.com$/.test(location.origin)) {
    const 깃집 = "https://vivivic-cloud.github.io";
    const 연쪽 = () => { try { const o = window.top.opener; return o && !o.closed ? o : null; } catch (e) { return null; } };
    const 인사 = () => { const o = 연쪽(); if (o) try { o.postMessage({ __vp: "단품창" }, 깃집); } catch (e) {} };
    인사(); setInterval(인사, 2000);
    addEventListener("message", (e) => {
      if (e.origin !== 깃집 || !e.data || !e.source) return;
      if (e.data.__vp === "단품안녕") { try { e.source.postMessage({ __vp: "단품창" }, 깃집); } catch (er) {} return; }
      if (e.data.__vp !== "단품찾기") return;
      const 표 = String(e.data.표 || "").slice(0, 40);
      const 낱말들 = (Array.isArray(e.data.낱말) ? e.data.낱말 : [e.data.낱말]).map((w) => String(w || "").trim().slice(0, 60)).filter(Boolean);
      const 답 = (x) => { try { e.source.postMessage({ __vp: "단품찾기답", 표, 낱말: 낱말들, ...x }, 깃집); } catch (er) {} };
      if (!낱말들.length) { 답({ 로그인: null, 줄: [] }); return; }
      단품검색(낱말들).then(답, (er) => 답({ 로그인: null, 줄: [], 까닭: String(er && er.message || er).slice(0, 80) }));
    });
  }

  return { PAGES: PAGES_, list, ymd, prefetch, clearCache, 하나찾기, 단품검색, 받기: 벤더피아받기, 잡기 };
})();

/* ── 공용 팝업 부품 `VP팝업(판, {머리, 몸})` (11-01 [새 지시 문의큰팝업]) ──
   사장님(그대로): 「…이팝업은 마우스 드레그 이동이 가능하게 해서 뒤 화면을 가리는것을 피해다닐 수 있게 해주고 백화면에 구애 받지 않고
   크기가 조절 되게 해주고 내용이 길어지면 스크롤되게 해줘 이런유형의 모든 팝업이 이런 모습 적용해 줘」
   ① 끌기: `머리`를 잡고 끌면 판이 `position: fixed` 로 움직인다(판 전체가 늘 화면 안). 머리 안 단추·입력은 끌기 아님.
   ② 크기: 판 가장자리(왼쪽·오른쪽·아래)와 아래 두 모서리를 잡고 끈다 — 뒤 화면과 상관없이, 화면 안에서만.
   ③ 스크롤: 머리 밖 내용은 `몸`(없으면 머리 밖 자식들을 `.vp-팝업몸` 으로 감싼다) 안에서 스크롤된다.
   ⚠ 이 글(vp-data.js)은 모든 벤더피아 화면에 search.js·goods.js 보다 **먼저** 실린다 — 그래서 여기 한 곳에 둔다. 팝업을 새로 만들면 이것을 쓴다.
   ⚠ 마우스·터치·펜 모두 포인터 이벤트 하나로. 꼴은 `<style id="vp-팝업꼴">` 한 벌(css 파일을 안 늘린다). */
if (typeof window !== "undefined" && typeof document !== "undefined" && !window.VP팝업) {
  window.VP팝업 = (() => {
    const 꼴 = `
.vp-팝업 > .vp-팝업몸 { flex: 1 1 auto; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.vp-팝업 .vp-끌개 { cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; }
.vp-팝업.vp-끄는중 .vp-끌개 { cursor: grabbing; }
.vp-팝업.vp-끄는중, .vp-팝업.vp-크기중 { user-select: none; -webkit-user-select: none; }
.vp-팝업 > .vp-팝업손 { position: absolute; z-index: 5; touch-action: none; }
.vp-팝업 > .vp-팝업손[data-d=e] { top: 14px; bottom: 14px; right: 0; width: 8px; cursor: ew-resize; }
.vp-팝업 > .vp-팝업손[data-d=w] { top: 14px; bottom: 14px; left: 0; width: 8px; cursor: ew-resize; }
.vp-팝업 > .vp-팝업손[data-d=s] { left: 14px; right: 14px; bottom: 0; height: 8px; cursor: ns-resize; }
.vp-팝업 > .vp-팝업손[data-d=se] { right: 0; bottom: 0; width: 18px; height: 18px; cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 52%, #c9c8c4 52%, #c9c8c4 58%, transparent 58%, transparent 68%, #c9c8c4 68%, #c9c8c4 74%, transparent 74%); }
.vp-팝업 > .vp-팝업손[data-d=sw] { left: 0; bottom: 0; width: 18px; height: 18px; cursor: nesw-resize; }`;
    const 최소 = { w: 260, h: 140 };
    const 창 = () => [document.documentElement.clientWidth || window.innerWidth, window.innerHeight || document.documentElement.clientHeight];
    const 꼴넣기 = () => {
      if (document.getElementById("vp-팝업꼴")) return;
      const st = document.createElement("style");
      st.id = "vp-팝업꼴";
      st.textContent = 꼴;
      (document.head || document.documentElement).appendChild(st);
    };
    const 숫자 = (v) => parseFloat(v) || 0;
    return function VP팝업(판, { 머리, 몸 } = {}) {
      if (!판 || 판.dataset.vp팝업) return 판;
      판.dataset.vp팝업 = "1";
      꼴넣기();
      판.classList.add("vp-팝업");
      const cs0 = getComputedStyle(판);
      if (cs0.position === "static") 판.style.position = "relative";
      /* 손잡이는 판 안(가장자리)에 붙고 스크롤은 몸만 — 판 자신은 안 넘치게. 블록 판(부속 도면 카드)은 세로 flex 로 */
      판.style.overflow = "hidden";
      if (cs0.display === "block") Object.assign(판.style, { display: "flex", flexDirection: "column" });
      머리 = 머리 || 판.firstElementChild;
      if (!몸) {
        몸 = document.createElement("div");
        몸.className = "vp-팝업몸";
        for (const n of [...판.childNodes]) if (n !== 머리 && !(n.nodeType === 1 && n.hasAttribute("data-팝업밖"))) 몸.appendChild(n);
        판.appendChild(몸);
      } else 몸.classList.add("vp-팝업몸");
      if (머리) 머리.classList.add("vp-끌개");
      /* 처음 잡을 때 지금 자리 그대로 `fixed` 로 — 튀지 않는다. 아래·오른쪽에 붙은 판(상세 창)은 높이도 지금 것으로 묶는다 */
      const 띄우기 = (높이도) => {
        const r = 판.getBoundingClientRect(), cs = getComputedStyle(판);
        const 높이묶기 = 높이도 || (cs.position === "fixed" && cs.bottom !== "auto" && !판.style.height);
        Object.assign(판.style, { position: "fixed", margin: "0", left: r.left + "px", top: r.top + "px", right: "auto", bottom: "auto",
          width: r.width + "px", maxWidth: "none" });
        if (높이묶기) Object.assign(판.style, { height: r.height + "px", maxHeight: "none" });
        return r;
      };
      const 안으로 = () => {
        if (판.style.position !== "fixed" || !판.isConnected) return;
        const [vw, vh] = 창();
        if (판.style.height && 숫자(판.style.height) > vh) 판.style.height = Math.max(최소.h, vh) + "px";
        if (숫자(판.style.width) > vw) 판.style.width = vw + "px";
        판.style.left = Math.min(Math.max(0, 숫자(판.style.left)), Math.max(0, vw - 판.offsetWidth)) + "px";
        판.style.top = Math.min(Math.max(0, 숫자(판.style.top)), Math.max(0, vh - 판.offsetHeight)) + "px";
      };
      let 잡음 = null;
      const 놓기 = (e) => { if (잡음 && e.pointerId === 잡음.id) { 잡음 = null; 판.classList.remove("vp-끄는중", "vp-크기중"); } };
      const 듣기 = (el) => {
        el.addEventListener("pointermove", (e) => {
          if (!잡음 || e.pointerId !== 잡음.id) return;
          const [vw, vh] = 창();
          const dx = e.clientX - 잡음.x, dy = e.clientY - 잡음.y, r = 잡음.r, d = 잡음.d;
          if (!d) {                                                   // 끌기
            판.style.left = Math.min(Math.max(0, r.left + dx), Math.max(0, vw - 판.offsetWidth)) + "px";
            판.style.top = Math.min(Math.max(0, r.top + dy), Math.max(0, vh - 판.offsetHeight)) + "px";
            return;
          }
          if (d.includes("e")) 판.style.width = Math.min(Math.max(최소.w, r.width + dx), vw - r.left) + "px";
          if (d.includes("w")) {
            const 왼 = Math.min(Math.max(0, r.left + dx), r.right - 최소.w);
            판.style.left = 왼 + "px"; 판.style.width = (r.right - 왼) + "px";
          }
          if (d.includes("s")) 판.style.height = Math.min(Math.max(최소.h, r.height + dy), vh - r.top) + "px";
        });
        el.addEventListener("pointerup", 놓기);
        el.addEventListener("pointercancel", 놓기);
        el.addEventListener("lostpointercapture", 놓기);
      };
      const 잡기 = (e, el, d) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const r = 띄우기(!!d);
        잡음 = { id: e.pointerId, x: e.clientX, y: e.clientY, r: 판.getBoundingClientRect(), d };
        if (!d) 잡음.r = { left: 숫자(판.style.left), top: 숫자(판.style.top) };
        판.classList.add(d ? "vp-크기중" : "vp-끄는중");
        try { el.setPointerCapture(e.pointerId); } catch (x) {}
        e.preventDefault();
        e.stopPropagation();
        return r;
      };
      if (머리) {
        머리.addEventListener("pointerdown", (e) => {
          if (e.target.closest && e.target.closest("button, input, a, select, textarea, label, .vp-goods-list")) return;
          잡기(e, 머리, "");
        });
        듣기(머리);
      }
      for (const d of ["e", "w", "s", "se", "sw"]) {
        const 손 = 판.appendChild(document.createElement("div"));
        손.className = "vp-팝업손";
        손.dataset.d = d;
        손.setAttribute("aria-hidden", "true");
        손.addEventListener("pointerdown", (e) => 잡기(e, 손, d));
        손.addEventListener("click", (e) => e.stopPropagation());
        듣기(손);
      }
      const 창바뀜 = () => { if (!판.isConnected) { window.removeEventListener("resize", 창바뀜); return; } 안으로(); };
      window.addEventListener("resize", 창바뀜);
      if (window.ResizeObserver) new ResizeObserver(() => 안으로()).observe(판);
      return 판;
    };
  })();
}

/* ── 공용 표 부품 `VP표` (11-17 [새 지시 모든표 통일]) ──
   사장님(그대로): 「벤더피아연동 데이터가 나타나는 모든 페이지 표의 형태를 배송관리의 표와 동일한 사이즈 셀구조로 변경해 주세요, 또한 각 페이지별
     벤더피아 원래 화면과 동일한 열이 나타나야 합니다. 특히 상품관리 메뉴는 원래화면에 나타나는 매입금액 배송비등이 나타나지 않고 있습니다.」
   기준 = 배송관리 표(`table.vp-촘촘`, 11-04 [새 지시 표촘촘히]). 11-17 사장님 크롬 배송관리 배포본(0.35.0)에서 잰 값:
     글 "Microsoft Sans Serif",돋움 11px · 머리 700·#f5f5f5·가운데·안여백 1px 2px 0·높이 25 · 몸 400·#000·글줄 20px·안여백 2px 3px·줄 25
     · 칸선 오른쪽·아래(머리는 위도) 1px #c0c0c0 · table-layout fixed·separate · 머리 sticky top 0 · 첫 칸 sticky left 0
     · 머리 칸 오른쪽 끝 7px 끌개(col-resize) · 몸 글 nowrap·ellipsis·overflow hidden · 표 통 안에서만 가로 스크롤(쪽 가로 0).
   ① `VP표.꼴넣기()` — 위 꼴을 `<style id="vp-표꼴">` 한 벌로 넣는다. search.css 「배송·CS 표 = 벤더피아 꼴」 과 **같은 숫자**다(그 파일이 없는
      단품·상품·재고 화면도 같은 꼴이 되게). 숫자를 바꾸려면 **둘 다** 바꿔라.
   ② `VP표.넓이틀(t, heads, 열쇠)` — `<colgroup>` + 머리 칸 끌개 + localStorage `열쇠`(`vp열넓이:…`) 기억 + 경계 두 번 누름 = 처음 넓이.
      돌려주는 판의 `맞춤(rows, 규칙)` 이 받은 줄 글에 맞춰 처음 넓이를 넓힌다(넓어지기만). search.js·goods.js 가 같이 쓴다.
   ⚠ 새 표를 만들면 **이 부품을 쓴다**(CLAUDE.md 「모든 표 = 배송관리 기준」). */
if (typeof window !== "undefined" && typeof document !== "undefined" && !window.VP표) {
  window.VP표 = (() => {
    const 표 = "#vp-root table.vp-촘촘";
    const 꼴 = `
#vp-root .vp-표통 { overflow: auto; max-height: calc(100vh - 200px); margin-top: 8px; background: #fff; scrollbar-color: #6f6d66 #e3e2e0; scrollbar-width: auto; }
#vp-root .vp-표통::-webkit-scrollbar { height: 26px; width: 18px; }
#vp-root .vp-표통::-webkit-scrollbar-track { background: #e3e2e0; border-radius: 13px; box-shadow: inset 0 0 0 1px #d3d2cf; }
#vp-root .vp-표통::-webkit-scrollbar-thumb { background: #6f6d66; border-radius: 13px; min-width: 56px; min-height: 56px; border: 3px solid #e3e2e0; }
#vp-root .vp-표통::-webkit-scrollbar-thumb:hover { background: #44423d; }
#vp-root .vp-표통::-webkit-scrollbar-corner { background: #e3e2e0; }
${표} { table-layout: fixed; width: auto; min-width: 0; margin: 0; border: 0; border-radius: 0; background: none;
  border-collapse: separate; border-spacing: 0; font: 11px/20px "Microsoft Sans Serif", 돋움, sans-serif; color: #000;
  text-indent: 0; letter-spacing: normal; text-transform: none; }
${표} th { position: sticky; top: 0; z-index: 1; height: 25px; padding: 1px 2px 0; box-sizing: border-box; overflow: hidden; text-overflow: clip;
  background: #f5f5f5; color: #000; font-size: 11px; font-weight: 700; line-height: normal; text-align: center; vertical-align: middle; white-space: nowrap;
  border: 0; border-top: 1px solid #c0c0c0; border-right: 1px solid #c0c0c0; border-bottom: 1px solid #c0c0c0; box-shadow: none; user-select: none; -webkit-user-select: none; }
${표} td { padding: 2px 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: none;
  color: #000; font-size: 11px; font-weight: 400; line-height: 20px; text-align: left; vertical-align: top;
  border: 0; border-right: 1px solid #c0c0c0; border-bottom: 1px solid #c0c0c0; }
${표} th.vp-first, ${표} td.vp-first { position: sticky; left: 0; border-left: 1px solid #c0c0c0; box-shadow: none; }
${표} th.vp-first { z-index: 3; font-weight: 700; }
${표} td.vp-first { z-index: 2; background: #fff; font-weight: 400; color: #000; }
${표} th .vp-열손 { position: absolute; top: 0; right: 0; bottom: 0; width: 7px; cursor: col-resize; touch-action: none; }
${표} th .vp-열손:hover, ${표} th .vp-열손.vp-끄는중 { background: rgba(0, 0, 0, .28); }
${표} td.vp-상품칸 .vp-goods-list { display: block; line-height: 13px; }
${표} td.vp-상품칸 .vp-goods-list button { position: relative; font-size: 11px; font-weight: 700; line-height: 13px; text-align: left; white-space: nowrap; vertical-align: top; }
${표} td.vp-상품칸 .vp-goods-list button .vp-점 { position: absolute; left: 0; top: 100%; margin-top: 1px; min-height: 0; }
${표} td.vp-상품칸 .vp-goods-list button .vp-점 i { width: 5px; height: 5px; }
${표} td.vp-상품칸 .vp-goods-list .vp-code, ${표} td.vp-상품칸 .vp-goods-list .vp-qty { font-size: 10px; font-weight: 500; margin-left: 3px; padding: 0 3px; }
${표} td.vp-상품칸 .vp-goods-list .vp-code.vp-코드줄 { display: block; margin-left: 0; }
#vp-root .vp-표통 table.vp-촘촘 td a { color: #e03e3e; font-weight: 700; text-decoration: underline; }
${표} td .vp-표단품들.vp-단품줄 { display: flex; flex-direction: column; align-items: flex-start; gap: 0; overflow: hidden; white-space: nowrap; }
${표} td .vp-표단품들.vp-단품줄 > * { flex: none; min-height: 20px; max-width: 100%; }
#vp-root .vp-떠밀대 { position: fixed; bottom: 0; overflow-x: scroll; overflow-y: hidden; z-index: 10; background: #e3e2e0;
  box-shadow: 0 -1px 0 #c0c0c0; scrollbar-color: #6f6d66 #e3e2e0; scrollbar-width: auto; }
#vp-root .vp-떠밀대[hidden] { display: none; }
#vp-root .vp-떠밀대 > div { height: 1px; }
#vp-root .vp-떠밀대::-webkit-scrollbar { height: 26px; }
#vp-root .vp-떠밀대::-webkit-scrollbar-track { background: #e3e2e0; border-radius: 13px; box-shadow: inset 0 0 0 1px #d3d2cf; }
#vp-root .vp-떠밀대::-webkit-scrollbar-thumb { background: #6f6d66; border-radius: 13px; min-width: 56px; border: 3px solid #e3e2e0; }
#vp-root .vp-떠밀대::-webkit-scrollbar-thumb:hover { background: #44423d; }`;
    const 글꼴 = '"Microsoft Sans Serif", 돋움, sans-serif';
    const 최소넓이 = 16, 여유 = 8;
    let 재는판 = null;
    function 꼴넣기() {
      if (document.getElementById("vp-표꼴")) return;
      const st = document.createElement("style");
      st.id = "vp-표꼴";
      st.textContent = 꼴;
      (document.head || document.documentElement).appendChild(st);
    }
    function 글너비(글, 굵게) {
      try {
        재는판 = 재는판 || document.createElement("canvas").getContext("2d");
        재는판.font = (굵게 ? "700 " : "") + "11px " + 글꼴;
        return Math.ceil(재는판.measureText(글).width);
      } catch (e) { return String(글).length * 9; }
    }
    const 긴칸 = /상품명|단품명|단품구성|옵션|메모|비고|내용|제목|주소/;
    const 기본규칙 = (i, h) => ({ 끝: 긴칸.test(h) ? 200 : 130, 더함: 여유, 굵게: false });
    function 넓이틀(t, heads, 열쇠) {
      꼴넣기();
      const 읽기 = () => { try { const v = JSON.parse(localStorage.getItem(열쇠) || "{}"); return v && typeof v === "object" ? v : {}; } catch (e) { return {}; } };
      const 본셈 = {}, 둔것 = 읽기();
      const 열쇠들 = heads.map((h) => { 본셈[h] = (본셈[h] || 0) + 1; return 본셈[h] > 1 ? h + "#" + 본셈[h] : h; });
      const 묶음 = document.createElement("colgroup");
      const cols = heads.map(() => 묶음.appendChild(document.createElement("col")));
      t.insertBefore(묶음, t.firstChild);
      const 자동 = heads.map((h) => 글너비(String(h), true) + 여유);
      const 둠 = 열쇠들.map((k) => Number(둔것[k]) >= 최소넓이);
      const 판 = { t, cols, 열쇠들, 자동, 둠, 자리: 열쇠들.map((k, i) => (둠[i] ? Math.round(둔것[k]) : 자동[i])) };
      판.입히기 = () => {
        let 합 = 0;
        cols.forEach((c, i) => {
          const w = 판.둠[i] ? 판.자리[i] : 판.자동[i];
          if (c.dataset.w !== String(w)) { c.dataset.w = w; c.style.width = w + "px"; }
          합 += w;
        });
        t.style.width = 합 + "px";
      };
      판.쓰기 = () => {
        const 값 = {};
        열쇠들.forEach((k, i) => { if (판.둠[i]) 값[k] = 판.자리[i]; });
        try { localStorage.setItem(열쇠, JSON.stringify(값)); } catch (e) {}
      };
      /* 받은 줄의 글에 맞춰 처음 넓이를 넓힌다 — 끝값까지만. 규칙(i, 머리) → {끝, 더함, 굵게} */
      판.맞춤 = (rows, 규칙 = 기본규칙) => {
        heads.forEach((h, i) => {
          const { 끝, 더함, 굵게 } = { ...기본규칙(i, h), ...(규칙(i, h) || {}) };
          let w = 판.자동[i];
          for (const row of rows) {
            if (w >= 끝) break;
            const 글 = row[i] == null ? "" : String(row[i]).trim();
            if (글) w = Math.max(w, Math.min(끝, 글너비(글.slice(0, 60), 굵게) + 더함));
          }
          판.자동[i] = w;
        });
        판.입히기();
      };
      [...t.tHead.rows[0].cells].forEach((th, i) => {
        const 손 = th.appendChild(document.createElement("span"));
        손.className = "vp-열손";
        손.title = "끌면 넓이 조정 · 두 번 누르면 처음 넓이로";
        손.addEventListener("pointerdown", (e) => {
          e.preventDefault(); e.stopPropagation();
          const x0 = e.clientX, w0 = 판.둠[i] ? 판.자리[i] : 판.자동[i];
          try { 손.setPointerCapture(e.pointerId); } catch (err) {}
          손.classList.add("vp-끄는중");
          const 움직 = (ev) => { 판.자리[i] = Math.max(최소넓이, Math.round(w0 + ev.clientX - x0)); 판.둠[i] = true; 판.입히기(); };
          const 끝 = () => {
            손.removeEventListener("pointermove", 움직); 손.removeEventListener("pointerup", 끝); 손.removeEventListener("pointercancel", 끝);
            손.classList.remove("vp-끄는중");
            if (판.둠[i]) 판.쓰기();
          };
          손.addEventListener("pointermove", 움직); 손.addEventListener("pointerup", 끝); 손.addEventListener("pointercancel", 끝);
        });
        손.addEventListener("dblclick", (e) => { e.stopPropagation(); 판.둠[i] = false; 판.입히기(); 판.쓰기(); });
      });
      판.입히기();
      /* 표 통(가로로 밀리는 부모)에 화면 아래 밀대를 붙인다 — 모든 표가 이 부품을 거치므로 여기 한 곳 */
      requestAnimationFrame(() => { if (t.parentElement) 밀대붙이기(t.parentElement); 다맞추기(); });
      return 판;
    }
    /* 11-17 [새 지시 단품줄바꿈·가로스크롤] 사장님(그대로): 「가로스크롤의 위치를 화면의 맨아래가 아닌 보고있는곳의 하단에서 스크롤이 항상 나타나게 해주세요」
       표 통의 제 가로 밀대는 통 맨 밑에 있어, 통 밑이 화면 밖이면(상품관리 등 — 쪽이 세로로 밀림) 안 보인다.
       → 그때만 **화면 맨 아래에 붙는 밀대**(`.vp-떠밀대`, position fixed, 통의 보이는 너비만큼)를 띄워 통과 scrollLeft 를 서로 맞춘다.
       통 밑이 화면 안이면(제 밀대가 보이면) 숨는다. 통 안이 가로로 안 넘치면 숨는다. 쪽 가로 스크롤은 안 생긴다(화면 너비 안에서만). */
    const 붙은통 = new WeakSet(), 맞추기들 = new Set();
    let 예약 = 0;
    const 다맞추기 = () => { if (예약) return; 예약 = requestAnimationFrame(() => { 예약 = 0; for (const f of 맞추기들) f(); }); };
    let 듣는중 = false;
    function 밀대붙이기(통) {
      if (!통 || 붙은통.has(통) || !통.parentNode) return;
      붙은통.add(통);
      꼴넣기();
      const 대 = document.createElement("div");
      대.className = "vp-떠밀대";
      대.hidden = true;
      대.setAttribute("aria-hidden", "true");
      const 속 = 대.appendChild(document.createElement("div"));
      통.after(대);
      대.addEventListener("scroll", () => { if (Math.abs(통.scrollLeft - 대.scrollLeft) > 0.5) 통.scrollLeft = 대.scrollLeft; }, { passive: true });
      통.addEventListener("scroll", () => { if (!대.hidden && Math.abs(통.scrollLeft - 대.scrollLeft) > 0.5) 대.scrollLeft = 통.scrollLeft; }, { passive: true });
      const 맞추기 = () => {
        if (!통.isConnected || !대.isConnected) { 대.hidden = true; return; }
        const r = 통.getBoundingClientRect(), 높이 = innerHeight;
        const 남는 = 통.scrollWidth - 통.clientWidth;
        const 띄움 = 남는 > 1 && r.width > 0 && r.bottom > 높이 + 1 && r.top < 높이 - 60;
        if (!띄움) { 대.hidden = true; return; }
        const 왼 = Math.max(0, r.left + 통.clientLeft), 오 = Math.min(innerWidth, r.left + 통.clientLeft + 통.clientWidth);
        if (오 - 왼 < 40) { 대.hidden = true; return; }
        대.style.left = 왼 + "px";
        대.style.width = (오 - 왼) + "px";
        대.hidden = false;
        속.style.width = (남는 + 대.clientWidth) + "px";
        if (Math.abs(통.scrollLeft - 대.scrollLeft) > 0.5) 대.scrollLeft = 통.scrollLeft;
      };
      맞추기들.add(맞추기);
      try {
        const 관찰 = new ResizeObserver(다맞추기);
        관찰.observe(통);
        const 표들보기 = () => { for (const c of 통.children) if (c !== 대) 관찰.observe(c); };
        표들보기();
        new MutationObserver(() => { 표들보기(); 다맞추기(); }).observe(통, { childList: true });
      } catch (e) {}
      if (!듣는중) {
        듣는중 = true;
        addEventListener("scroll", 다맞추기, { capture: true, passive: true });
        addEventListener("resize", 다맞추기, { passive: true });
      }
      다맞추기();
    }
    return { 꼴넣기, 넓이틀, 글너비, 밀대붙이기 };
  })();
}
