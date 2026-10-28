// 배송관리(배송목록조회) 화면을 기간 + 검색창 하나로 바꾼다.
// 조회는 원래 화면의 검색 폼을 그대로 벤더피아에 보내고, 받은 결과에서 목록만 뽑아 보여준다.
(() => {
  /* 10-27 [새 지시 이동느림근본] 벤더피아 요청은 모두 공용 줄(vp-data.js `벤더피아받기`)로 — 하나씩·떠날 때 세움. 급: 사람(조회) · 보호(고객문의 등록 — 안 끊김) */
  const 벤더피아 = (주소, 옵션, 급 = "사람") => (typeof VP_DATA !== "undefined" && VP_DATA.받기 ? VP_DATA.받기(주소, 옵션, 급) : fetch(주소, 옵션));
  /* ⚠⚠ 10-24 사장님 (CS등록 다시 시작, 한 글자도 안 고침): 「배송관리의 모습이 보여지면 안되는곳이야 정확히 주문관리의 화면을
       보여줘야하는곳이야 일단 cs등록 들어갔을때 벤더피아의 주문관리 현재 목록이 그대로 보이게 해줘 여기서부터 다시 시작해야 겠다 -
       목록의 디자인 일관성을 유지해줘」
     → 주문관리(`/System/Sales/orderMst.aspx`)에서는 **그 페이지에 이미 그려진 주문관리 결과 표를 DOM 에서 그대로 읽어**
       우리 표 꼴로 다시 그린다(칸 이름·차례·값 모두 주문관리 것). 화면에는 「CS등록」 제목·← 메인·목록뿐이다.
     ⚠ 목록이 비어 있으면(조회를 눌러야 뜨는 화면) 그 페이지의 조회 단추와 **같은 기본값 그대로** 한 번만 조회한다(조회만).
     ⚠ 못 읽으면 빈 표 + 까닭 한 줄. 배송목록으로 대신하지 않는다.
     ⚠ 10-26 [새 지시 주문관리검색] 사장님(그대로): 「벤더피아 오리지날 주문관리 화면을 잘 살펴보고 이 페이지에 맞는 검색창 기능을
       배송관리의 검색창과 같은 멀티검색으로 만들어줘」 → 기간 + 검색창 하나(배송관리와 같은 꼴·같은 쓰임). 검색어를 주문관리 폼 칸
       (주문번호·상품코드·수취인·주문자·주소·상품명·수취인폰·주문자폰, 고르는 칸 여덟)에 나눠 **주문관리에** 묻는다(`plan`·`fetchList`).
       (10-22 0.34.39~0.34.46 의 「배송관리와 같은 화면 + 주문관리 조회」 길은 걷었다. 상담 판·이름 단추 코드는 배송관리가 쓴다.) */
  const CS전용 = /\/system\/sales\/ordermst\.aspx/i.test(location.pathname);
  const form = document.forms[0];
  const searchBtn = document.getElementById("btnSearch");
  const startDt = document.getElementById("dcStartDt");
  const endDt = document.getElementById("dcEndDt");
  if (CS전용 ? !form : (!form || !searchBtn || !startDt || !endDt)) return;

  const fieldNames = [...new FormData(form).keys()];
  const fullName = (id) => fieldNames.find((n) => n === id || n.endsWith("$" + id)) || id;

  // 검색어 한 단어가 목록 칸의 항목과 똑같으면 그 칸을 고른다 (앞에 있을수록 우선)
  const SELECTS = ["ddlDStatus", "ddlCSType", "ddlStoreGb", "ddlDeliveryCo", "ddlMall", "ddlStore",
    "ddlLoc", "ddl_RecallGb", "ddlStockType", "ddlInvoiceSendYn", "ddlSupplier"];
  /* 10-26 [새 지시 주문관리검색] 주문관리(orderMst) 폼의 고르는 칸 — 사장님 크롬에서 잰 id(배송상태·CS·주문상태·배송사·매출처·몰·권역·매입처) */
  const 주문SELECTS = ["ltbStatus", "ltbCSType", "ddlOrderStatus", "ddlDCo", "ddlStore", "ddlMall", "ddlLoc", "ddlSupplier"];
  const norm = (s) => s.replace(/^\d+\s+/, "").replace(/\s/g, "").toLowerCase();

  function matchSelect(token) {
    for (const id of CS전용 ? 주문SELECTS : SELECTS) {   // 주문관리 화면은 그 폼의 고르는 칸만 — 배송목록 칸과 섞지 않는다
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

      /* 주문관리: 전화 칸이 화면에 숨어 있어 받은 줄에서 못 거른다 → 벤더피아 수취인폰·주문자폰 칸으로 묻는다.
         벤더피아는 전화를 「010-1234-5678」 꼴로 두고 그 꼴로만 찾는다(숫자만 보내면 0건 — 재서 확인) → 줄표를 넣어 보낸다. */
      if (CS전용 && !variants && isPhone) {
        const 폰 = digits.replace(/^(02)(\d{3,4})(\d{4})$/, "$1-$2-$3").replace(/^(0\d{2})(\d{3,4})(\d{4})$/, "$1-$2-$3");
        variants = [["수취인폰", { tbRecipientMobile: 폰 }], ["주문자폰", { tbOrdererMobile: 폰 }]];
        continue;
      }
      if (variants || isPhone || isShortNumber) { local.push(token); continue; }

      if (CS전용) {
        /* 주문관리 폼 칸(10-26 잼): 주문번호 tbSOrderNo(몰 주문번호, 뒤 「주문번호」 칸) · 상품코드 tbSGoodsCd(일부만 쳐도 찾음) ·
           수취인 tbRecipient · 주문자 tbOrderer · 주소 tbAddr · 상품명 tbSGoodsNm. 송장번호·단품코드 칸은 없다. */
        if (isNumber) variants = [["주문번호", { tbSOrderNo: token }]];
        else if (/[A-Za-z]/.test(token) && !/[가-힣]/.test(token)) variants = [["상품코드", { tbSGoodsCd: token }]];
        else variants = [["수취인", { tbRecipient: token }], ["주문자", { tbOrderer: token }],
          ["주소", { tbAddr: token }], ["상품명", { tbSGoodsNm: token }]];
        continue;
      }
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

  /* 받은 글에서 머리줄(수취인 칸이 든 줄 — 주문관리는 칸이 가장 많은 머리줄)과 줄들을 뽑는다 */
  function 표뽑기(글, 머리찾기) {
    /* 10-26 [새 지시 뒤 요청·멈춤] — 읽는 데 필요 없는 것(숨은 입력칸 __VIEWSTATE 따위·스크립트·스타일)을 문자열에서 먼저 덜어 낸다.
       1.3MB 응답의 DOMParser 한 번이 화면을 멈추는 큰 몫이었다(덜어 내면 같은 응답이 1/3 빨리 읽힌다). 표·머리줄·건수 글은 그대로다. */
    const 가볍게 = 글.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<input\b[^>]*\btype=["']?hidden["']?[^>]*>/gi, "");
    const doc = new DOMParser().parseFromString(가볍게, "text/html");
    const count = (doc.body.textContent.match(/([\d,]+)\s*건/) || [])[1] || "0";
    const th = 머리찾기(doc);
    /* 까닭 적기 — 진짜 화면에서 왜 비는지 보이게(10-22): 응답 길이·로그인 칸·머리줄 칸 수·그 밖 줄 칸 수들 */
    const 칸수들 = {};
    for (const tr of doc.querySelectorAll("tr")) if (!tr.querySelector("th")) { const n = tr.children.length; 칸수들[n] = (칸수들[n] || 0) + 1; }
    const 몸 = { 길이: 글.length, 덜어낸뒤: 가볍게.length, 로그인칸: !!doc.querySelector("input[type=password]"), 틀: doc.querySelectorAll("frame,iframe").length,
      표수: doc.querySelectorAll("table").length, 칸수들: Object.entries(칸수들).sort((a, z) => z[1] - a[1]).slice(0, 4).map(([n, c]) => n + "칸×" + c).join(" "),
      제목: ((doc.querySelector("title") || {}).textContent || "").trim().slice(0, 30) };
    if (!th) return { count, heads: [], rows: [], 몸 };
    const heads = [...th.parentElement.children].map((c) => c.textContent.trim());
    const rows = [...doc.querySelectorAll("tr")]
      .filter((tr) => tr.children.length === heads.length && !tr.querySelector("th"))
      .map((tr) => [...tr.children].map((c) => c.textContent.trim()));
    return { count, heads, rows, 몸 };
  }
  let 마지막응답 = null;
  async function 보내기(틀, 이름, 몫, rowCnt) {
    const fd = new FormData(틀.form);
    for (const k of [...fd.keys()]) if (k.includes("chkItem")) fd.delete(k);
    if (틀.버튼) {
      if (틀.버튼.type === "image") { fd.append(틀.버튼.name + ".x", "5"); fd.append(틀.버튼.name + ".y", "5"); }
      else if (틀.버튼.name) fd.append(틀.버튼.name, 틀.버튼.value || "");
    }
    if (틀.행수칸) fd.set(틀.행수칸, rowCnt);
    for (const [id, v] of Object.entries(몫)) fd.set(이름(id), v);
    const res = await 벤더피아(틀.form.action, { method: "POST", body: fd, credentials: "include" });
    마지막응답 = { 상태: res.status, 넘어옴: res.redirected, 주소: (res.url || "").replace(/^https?:\/\/[^/]+/, "").slice(0, 60),
      보낸: [...fd.entries()].filter(([k, v]) => typeof v === "string" && v && !/^__|chkItem/.test(k)).map(([k, v]) => k.split("$").pop() + "=" + String(v).slice(0, 20)).slice(0, 8).join(" ") };
    return res.text();
  }

  /* ── CS등록: 주문관리 목록을 페이지에서 그대로 읽는다 (10-24) ──────────────
     ASP.NET GridView 는 th 머리줄일 수도 td 머리줄일 수도 있고 표가 여럿(겉틀·쪽 넘김 표)일 수 있다 → **너그럽게** 고른다:
       · 줄 안에 또 표가 든 줄(겉틀)은 세지 않는다
       · 칸 수가 같은 줄이 가장 많은 표 = 목록(줄 수 같으면 칸이 많은 쪽)
       · 머리줄 = 칸 수가 맞는 줄 가운데 th 가 든 첫 줄, 없으면 칸 수가 맞는 첫 줄 */
  const 칸글 = (c) => {
    let t = (c.textContent || "").replace(/\s+/g, " ").trim();
    if (!t) { const i = c.querySelector("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=image]):not([type=submit]):not([type=button])");
      if (i) t = String(i.value || "").trim(); }
    return t;
  };
  /* 주문관리(orderMst.aspx) 진짜 구조 (10-25, 사장님 크롬에서 잼): 목록 = Infragistics WebDataGrid `div#oGrid`.
     머리줄·몸줄이 **서로 다른 table** 에 있다 → 표 하나를 고르지 않고 #oGrid 안 tr 을 칸 수로 가른다:
       머리줄 = 칸이 60개 이상인 첫 tr(th 69칸) · 몸줄 = 그 뒤 같은 칸 수의 tr
     보이는 칸 = 머리 th 의 computed display 가 none 이 아닌 것(숨긴 th 는 class 에 생성 이름이 붙고 display:none, 칸 이름은 안 박음).
     ⚠ 같은 쪽의 날짜 달력 표(`igmc_Control` 9×7)는 목록이 아니다 — 「가장 큰 표 고르기」 는 0.34.51 에서 달력을 집었다. */
  function 목록고르기(doc) {
    const g = doc.getElementById("oGrid");
    if (!g) return null;
    const 전체 = [...g.querySelectorAll("tr")];
    const 머리줄 = 전체.find((tr) => tr.cells.length >= 60);
    if (!머리줄) return { heads: [], rows: [], 합계: "", 까닭: "#oGrid 는 있으나 칸 60개 이상인 머리줄이 없음(tr " + 전체.length + "줄)" };
    const n = 머리줄.cells.length;
    const win = doc.defaultView;
    const 보임 = (th) => win && win.getComputedStyle ? win.getComputedStyle(th).display !== "none" : !!(th.getAttribute("style") || "").match(/width/);
    /* 10-26 조회 응답(DOMParser)은 숨긴 칸에도 인라인 width 가 붙어 온다(69칸 중 67 — 사장님 크롬에서 잼) →
       머리 칸 이름이 지금 페이지와 같으면 **지금 페이지에서 보이는 칸**을 그대로 쓴다. */
    const 이름들 = [...머리줄.cells].map(칸글);
    const 쪽칸 = !win && 페이지보임칸();
    const 같은꼴 = 쪽칸 && 쪽칸.이름들.length === n && 쪽칸.이름들.every((x, i) => x === 이름들[i]);
    const 칸들 = [...머리줄.cells].map((th, i) => ({ i, 이름: 이름들[i], 보임: 같은꼴 ? 쪽칸.보임.has(i) : 보임(th) })).filter((c) => c.보임);
    const 몸 = 전체.filter((tr) => tr !== 머리줄 && tr.cells.length === n && !tr.querySelector("tr") && !tr.querySelector("th.igg_HeaderCaption"));
    /* 체크 칸(머리 글 없고 몸 칸에 체크상자)은 뺀다 */
    const 체크 = (c) => !c.이름 && 몸.length && 몸.every((tr) => tr.cells[c.i].querySelector("input[type=checkbox]"));
    const 쓸 = 칸들.filter((c) => !체크(c));
    const heads = 쓸.map((c) => c.이름);
    const rows = 몸.map((tr) => 쓸.map((c) => 칸글(tr.cells[c.i])));
    let 합계 = "";
    for (const e of doc.querySelectorAll("span,div,td,font,b,label")) {
      if (e.children.length || (e.closest && e.closest("#vp-root"))) continue;
      const t = (e.textContent || "").replace(/\s+/g, " ").trim();
      if (/주문수량\s*:/.test(t) && t.length < 150) { 합계 = t; break; }
    }
    return { heads, rows, 합계, 까닭: "머리 " + n + "칸 중 보임 " + 칸들.length + " · 몸줄 " + 몸.length };
  }
  /* 지금 페이지 #oGrid 머리의 칸 이름 전부와 보이는 칸 자리 — 조회 응답을 같은 칸으로 그리려고 */
  function 페이지보임칸() {
    const g = document.getElementById("oGrid");
    const 머리줄 = g && [...g.querySelectorAll("tr")].find((tr) => tr.cells.length >= 60);
    if (!머리줄) return null;
    const 보임 = new Set();
    [...머리줄.cells].forEach((th, i) => { if (getComputedStyle(th).display !== "none") 보임.add(i); });
    return { 이름들: [...머리줄.cells].map(칸글), 보임 };
  }
  /* 지금 페이지(와 같은 출처 iframe)에서 읽는다 */
  function 쪽에서읽기() {
    const docs = [document];
    for (const f of document.querySelectorAll("iframe,frame")) { try { if (f.contentDocument) docs.push(f.contentDocument); } catch (_) {} }
    let 낫 = null;
    for (const d of docs) { const r = 목록고르기(d); if (r && (!낫 || r.rows.length > 낫.rows.length)) 낫 = r; }
    return { r: 낫, docs };
  }
  /* 목록이 비어 있으면: 이 페이지의 조회 단추가 하는 것과 **같은 기본값 그대로** 한 번 조회(조회만) */
  async function 기본값조회() {
    const 단추들 = [...form.querySelectorAll("input[type=image],input[type=submit],button[type=submit]")];
    const 버튼 = 단추들.find((e) => /search|srch|조회|검색/i.test((e.name || "") + (e.id || "") + (e.value || "") + (e.alt || "")))
      || (단추들.length === 1 ? 단추들[0] : null);
    if (!버튼) return { 까닭: "조회 단추를 못 찾음(제출 단추 " + 단추들.length + "개" + (단추들.length ? "[" + 단추들.slice(0, 3).map((e) => (e.name || e.id || e.tagName).split("$").pop()).join(",") + "]" : "") + ") — __doPostBack 단추일 수 있음" };
    const 글 = await 보내기({ form, 버튼, 행수칸: "" }, (n) => n, {}, "");
    const doc = new DOMParser().parseFromString(글, "text/html");
    const r = 목록고르기(doc);
    return { r, doc, 까닭: "기본값 조회 HTTP" + (마지막응답 ? 마지막응답.상태 + (마지막응답.넘어옴 ? " 넘어옴→" + 마지막응답.주소 : "") : "?")
      + " 길이" + 글.length + (doc.querySelector("input[type=password]") ? " 로그인칸있음" : "") + " 표" + doc.querySelectorAll("table").length };
  }

  /* 이 화면의 폼으로 바로 묻는다 — 배송관리는 배송목록, CS등록은 주문관리(10-26 [새 지시 주문관리검색]) */
  async function fetchList(fields, rowCnt) {
    const 틀 = { form, 버튼: searchBtn, 행수칸: fullName("ddlRowCnt") };
    const 글 = await 보내기(틀, fullName, fields, rowCnt);
    if (CS전용) {
      /* 주문관리 응답 = 같은 쪽 → `목록고르기`(#oGrid) 로 읽는다. 전체 수 = 합계 글의 「행수: N건」 */
      const doc = new DOMParser().parseFromString(글.replace(/<script\b[\s\S]*?<\/script>/gi, ""), "text/html");
      const r = 목록고르기(doc) || { heads: [], rows: [], 합계: "" };
      const count = ((r.합계 || "").match(/행수\s*:\s*([\d,]+)/) || [])[1] || String(r.rows.length);
      return { count, heads: r.heads, rows: r.rows, 합계: r.합계 };
    }
    return 표뽑기(글, (doc) => [...doc.querySelectorAll("th")].find((c) => c.textContent.trim() === "수취인"));
  }

  /* ⚠⚠ 10-15 사장님 (배송관리를 짚으시고, 그대로):
       「불러온 데이터 가로스크롤로 실제 벤더피아의 모든 정보를 동일하게 볼 수 있게해줘」
     가로스크롤은 10-14 에 이미 됐다. 모자란 것은 **칸**이었다 —
     여기 여덟 개만 적어 두고 **그 여덟만 그리고 있었다.** 벤더피아가 준 나머지 칸은
     `fetchList` 가 **받아는 오는데**(`heads`) 그리지 않고 버렸다.
     → 이제 **벤더피아가 준 머리줄(`heads`)을 그대로** 그린다. 이름도 차례도 벤더피아 것이다.
     칸을 줄이지도 합치지도 않는다. 넘치면 **가로로 민다**(10-14 에 깐 그대로). */

  /* 화면에 작게 까닭을 적는다(CS등록만) — 사장님이 그대로 복사해 알려 주시면 된다 */
  let 진단칸 = null;
  function 진단적기(줄) {
    window.VP말?.("진단:" + 줄.slice(0, 80));
    if (진단칸) 진단칸.textContent = 줄;
  }

  /* ── 상담내용보기 = 벤더피아 CS→고객문의 목록 (10-27 [새 지시 상담내용보기]) ──────────────
     사장님(그대로): 「시에등록 헤더에 상담내용보기 버튼을 만들어서 벤더피아 실재 페이지의 CS-고객문의 페이지를 현재 표 디자인에 맞게
       보여주는 페이지가 나타나게 해줘」 「실재 벤더피아 페이지 확인하고 작업해」
     CS등록 머리의 「상담내용보기」 = 새 탭 `orderMst.aspx#vgInq`(확장이 search.js 를 보내는 쪽이라 덮어쓰기 없이 된다) → 여기서 갈라
     **`/System/CS/inquiryList.aspx` 를 조회만** 해 우리 표 꼴로 그린다. 요청·칸은 사장님 크롬에서 잰 것(CLAUDE.md 「고객문의 목록」).
     · 처음 = GET(기본 기간 한 달·27줄). 조회 = 받은 폼 그대로 + `btnSearch.x/.y` POST. 쪽 넘김 = 받은 폼 + `__EVENTTARGET`(PageNum 링크) 또는 그림 단추 `.x/.y`.
     · 숨은 칸(주문번호·ctCd·inquiryCd·매출처…주소·순번)은 표에 안 그리고, 줄을 누르면 판에 **모든 칸**(문의내용·답변내용 전문 포함)을 보인다.
     ⚠ 등록·삭제·엑셀 단추는 안 보낸다(그림 단추라 폼값에 안 들어간다). 벤더피아에는 조회만. */
  const 상담보기 = CS전용 && /(^|[#&])vgInq\b/i.test(location.hash || "");
  if (상담보기) { 상담내용보기(); return; }
  function 상담내용보기() {
    const 주소 = "/System/CS/inquiryList.aspx";
    const 숨은칸 = new Set(["", "주문번호", "ctCd", "inquiryCd", "매출처", "매출처주문번호", "매출처상품코드", "주문자", "주문자전화",
      "주문자핸드폰", "수취인", "수취인전화", "수취인휴대폰", "우편번호", "주소", "순번"]);
    const 긴칸 = new Set(["상품명", "제목", "문의내용", "답변내용"]);
    const 고르는칸 = ["ddlInqType", "ddlCallEndGb", "ddlMall", "ddlSupplier", "ddlInboundYn"];
    const 앞 = "ctl00$Contents$";
    const r = document.createElement("div");
    r.id = "vp-root";
    r.className = "vp-wide";
    r.innerHTML = `
    <div class="vp-search">
      <a class="vp-home" href="/index.aspx">← 메인</a>
      <h1>상담내용보기</h1>
      <form class="vp-bar">
        <input type="date" name="from" required>
        <span>~</span>
        <input type="date" name="to" required>
        <input name="q" class="vp-q" placeholder="문의자, 수취인, 주문자, 상품명, 제목, 문의내용, 매출처주문번호, 전화, 문의유형, 처리결과…">
        <button type="submit">조회</button>
      </form>
      <div class="vp-note">불러오는 중…</div>
      <div class="vp-table"></div>
      <div class="vp-쪽넘김"></div>
    </div>`;
    document.body.appendChild(r);
    document.documentElement.classList.add("vp-clean");
    const 막대 = r.querySelector(".vp-bar"), 알림 = r.querySelector(".vp-note"), 통 = r.querySelector(".vp-table"), 쪽칸 = r.querySelector(".vp-쪽넘김");
    let 처음문서 = null, 지금문서 = null, 차례 = 0;

    const 읽기 = (글) => new DOMParser().parseFromString(글.replace(/<script\b[\s\S]*?<\/script>/gi, ""), "text/html");
    /* 폼값 — 그림·제출 단추는 안 넣는다(등록·삭제가 섞여 갈 일이 없다) */
    function 폼값(doc) {
      const f = doc.forms[0], p = new URLSearchParams();
      if (!f) return p;
      for (const e of f.querySelectorAll("input[name],select[name],textarea[name]")) {
        const t = (e.type || "").toLowerCase();
        if (["image", "submit", "button", "file", "reset"].includes(t)) continue;
        if ((t === "checkbox" || t === "radio") && !e.checked) continue;
        if (e.tagName === "SELECT") { const o = e.querySelector("option[selected]") || e.options[0]; p.append(e.name, o ? o.value : ""); continue; }
        p.append(e.name, e.value || "");
      }
      return p;
    }
    async function 묻기(p) {
      const res = p ? await 벤더피아(주소, { method: "POST", body: p, credentials: "include" }) : await 벤더피아(주소, { credentials: "include" });
      return 읽기(await res.text());
    }
    const 칸글 = (td) => { const c = td.cloneNode(true); c.querySelectorAll("br").forEach((b) => b.replaceWith("\n")); c.querySelectorAll("input,script,style").forEach((x) => x.remove());
      const 글 = c.textContent.replace(/ /g, " ").trim(), 제목 = (td.getAttribute("title") || "").trim(); return 제목.length > 글.length ? 제목 : 글; };
    function 목록(doc) {
      const g = doc.getElementById("oGrid") || doc;
      const trs = [...g.querySelectorAll("tr")];
      const 머리줄 = trs.find((tr) => [...tr.cells].some((c) => c.textContent.trim() === "문의자"));
      if (!머리줄) return { heads: [], rows: [] };
      const n = 머리줄.cells.length;
      return { heads: [...머리줄.cells].map((c) => c.textContent.trim()),
        rows: trs.filter((tr) => tr !== 머리줄 && tr.cells.length === n && !tr.querySelector("tr") && !tr.querySelector("th")).map((tr) => [...tr.cells].map(칸글)) };
    }
    const 값 = (doc, 이름) => ((doc.querySelector(`[name="${앞}${이름}"]`) || {}).value || "");

    function 그리기(heads, rows) {
      통.replaceChildren();
      if (!heads.length) return;
      const 보일 = heads.map((h, i) => (숨은칸.has(h) ? -1 : i)).filter((i) => i >= 0);
      const t = document.createElement("table");
      const hr = t.createTHead().insertRow();
      보일.forEach((i, k) => { const th = hr.appendChild(document.createElement("th")); th.textContent = heads[i]; if (!k) th.className = "vp-first"; });
      const tb = t.createTBody();
      for (const row of rows) {
        const tr = tb.insertRow();
        tr.className = "vp-줄상담";
        보일.forEach((i, k) => { const td = tr.insertCell(); td.textContent = row[i] || ""; if (!k) td.className = "vp-first"; else if (긴칸.has(heads[i])) { td.className = "vp-긴글"; td.title = row[i] || ""; } });
        tr.addEventListener("click", () => 판열기(heads, row));
      }
      통.appendChild(t);
    }
    /* 쪽 넘김 = 벤더피아가 준 그대로(번호 링크 + 처음·이전·다음·끝 그림 단추) */
    function 쪽그리기(doc) {
      쪽칸.replaceChildren();
      if (!doc) return;
      const 지금 = 값(doc, "Pager1$hdCurrentPage") || (doc.getElementById("hdCurrentPage") || {}).value || "";
      const 글자 = { First: "«", Prev: "‹", Previous: "‹", Next: "›", Last: "»" };
      const 단추 = (글, 일, 이번) => { const b = 쪽칸.appendChild(document.createElement("button")); b.type = "button"; b.textContent = 글; if (이번) b.setAttribute("aria-current", "page"); b.addEventListener("click", 일); };
      const 그림 = [...doc.querySelectorAll("input[type=image]")].filter((e) => /Pager1\$/.test(e.name));
      const 그림단추 = (e) => 단추(글자[e.alt] || e.alt || "…", () => 넘기기({ [e.name + ".x"]: "5", [e.name + ".y"]: "5" }));
      그림.filter((e) => /^(First|Prev)/i.test(e.alt)).forEach(그림단추);
      for (const a of doc.querySelectorAll("a.PageNum")) {
        const m = (a.getAttribute("href") || "").match(/__doPostBack\('([^']+)'/);
        if (m) 단추(a.textContent.trim(), () => 넘기기({ __EVENTTARGET: m[1], __EVENTARGUMENT: "" }), a.textContent.trim() === 지금);
      }
      그림.filter((e) => !/^(First|Prev)/i.test(e.alt)).forEach(그림단추);
    }
    function 보이기(doc) {
      const { heads, rows } = 목록(doc);
      지금문서 = doc;
      그리기(heads, rows);
      쪽그리기(doc);
      const 전체 = 값(doc, "Pager1$ctl01"), 지금 = 값(doc, "Pager1$hdCurrentPage");
      알림.textContent = !heads.length ? "고객문의 목록을 읽지 못했습니다." : !rows.length ? "고객문의가 없습니다."
        : (전체 ? Number(전체).toLocaleString() + "건" : rows.length + "건") + (지금 ? " · " + 지금 + "쪽" : "");
    }
    async function 넘기기(더) {
      if (!지금문서) return;
      const 내차례 = ++차례;
      const p = 폼값(지금문서);
      p.set("__EVENTTARGET", ""); p.set("__EVENTARGUMENT", "");
      for (const [k, v] of Object.entries(더)) p.set(k, v);
      알림.textContent = "불러오는 중…";
      try { const doc = await 묻기(p); if (내차례 === 차례) 보이기(doc); }
      catch (e) { if (내차례 === 차례) 알림.textContent = "고객문의 목록을 읽지 못했습니다."; }
    }

    /* 검색어 나누기 — 고르는 칸 글자(문의유형·처리결과·몰·매입처·수발신) → 그 칸 / 전화·짧은 숫자 → 받은 줄에서 거름(숨은 전화 칸까지) /
       9자리↑ 숫자 → 매출처주문번호 / 그 밖 글 → 문의자·수취인·주문자·상품명·제목·문의내용 여섯으로 따로 묻고 합침(같은 문의 한 번) */
    function 나누기(말) {
      const 고름 = {}, 거름 = [];
      let 갈래 = null;
      for (const 낱 of 말.trim().split(/\s+/).filter(Boolean)) {
        let 맞음 = null;
        for (const id of 고르는칸) {
          const s = 처음문서 && 처음문서.querySelector(`select[name="${앞}${id}"]`);
          const o = s && [...s.options].find((x) => x.text.trim() !== "전체" && norm(x.text) === norm(낱));
          if (o) { 맞음 = [id, o.value]; break; }
        }
        if (맞음) { 고름[맞음[0]] = 맞음[1]; continue; }
        const 숫 = 낱.replace(/-/g, ""), 숫자 = /^[\d-]+$/.test(낱);
        if (갈래 || (숫자 && (/^0\d{8,10}$/.test(숫) || 숫.length <= 8))) { 거름.push(숫자 ? 숫 : 낱); continue; }
        갈래 = 숫자 ? [{ tbStoreOrderNo: 낱 }]
          : ["tbInquirer", "tbRecipient", "tbOrderer", "tbSGoodsNm", "tbTitle", "tbContent"].map((k) => ({ [k]: 낱 }));
      }
      return { 고름, 거름, 갈래 };
    }
    막대.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!처음문서) return;
      const fd = new FormData(막대), 말 = String(fd.get("q") || "");
      const { 고름, 거름, 갈래 } = 나누기(말);
      const 내차례 = ++차례;
      const 밑 = () => {
        const p = 폼값(처음문서);
        for (const k of [...p.keys()]) if (/\$tb\w+$/.test(k)) p.set(k, "");
        for (const id of 고르는칸) if (p.has(앞 + id)) p.set(앞 + id, "전체");
        p.set(앞 + "dcStartDt", fd.get("from")); p.set(앞 + "dcEndDt", fd.get("to"));
        for (const [k, v] of Object.entries(고름)) p.set(앞 + k, v);
        p.set("__EVENTTARGET", ""); p.set("__EVENTARGUMENT", "");
        p.set(앞 + "btnSearch.x", "5"); p.set(앞 + "btnSearch.y", "5");
        return p;
      };
      알림.textContent = "불러오는 중…";
      try {
        if (!갈래 && !거름.length) { const doc = await 묻기(밑()); if (내차례 === 차례) 보이기(doc); return; }
        /* 여러 칸으로 묻거나 받은 줄에서 거를 때는 한 번에 500줄 받아 합친다(쪽 넘김 없음) */
        const 묶음 = await Promise.all((갈래 || [{}]).map((k) => { const p = 밑(); p.set(앞 + "ddlRowCnt", "500");
          for (const [n, v] of Object.entries(k)) p.set(앞 + n, v); return 묻기(p); }));
        if (내차례 !== 차례) return;
        let heads = [], 줄들 = [];
        const 본 = new Set();
        for (const doc of 묶음) {
          const l = 목록(doc);
          if (l.heads.length) heads = l.heads;
          const 열쇠자리 = l.heads.indexOf("inquiryCd");
          for (const row of l.rows) { const 열쇠 = 열쇠자리 >= 0 ? row[열쇠자리] : row.join("\t"); if (본.has(열쇠)) continue; 본.add(열쇠); 줄들.push(row); }
        }
        if (거름.length) 줄들 = 줄들.filter((row) => 거름.every((w) => row.some((v) => String(v).includes(w) || String(v).replace(/-/g, "").includes(w))));
        지금문서 = null;
        그리기(heads, 줄들);
        쪽칸.replaceChildren();
        알림.textContent = !heads.length ? "고객문의 목록을 읽지 못했습니다." : 줄들.length + "건";
      } catch (err) { if (내차례 === 차례) 알림.textContent = "고객문의 목록을 읽지 못했습니다."; }
    });

    /* 줄 누름 = 그 문의의 모든 칸(문의내용·답변내용 전문) — 상담 판과 같은 꼴, 끌 수 있다. 보기만 한다. */
    let 판 = null;
    const 판닫기 = () => { if (판) { 판.remove(); 판 = null; } };
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") 판닫기(); });
    function 판열기(heads, row) {
      판닫기();
      const 칸 = (n) => { const i = heads.indexOf(n); return i >= 0 ? row[i] || "" : ""; };
      const 덮개 = document.createElement("div");
      덮개.className = "vp-상담덮개";
      덮개.innerHTML = `<div class="vp-상담판" role="dialog" aria-label="문의내용">
        <div class="vp-상담머리"><strong></strong><small></small>
          <button type="button" class="vp-상담닫기" aria-label="닫기">×</button></div>
        <div class="vp-상담목록"><div class="vp-상담줄"><small>문의내용</small><p class="vp-문의글"></p></div>
          <div class="vp-상담줄"><small>답변내용</small><p class="vp-답변글"></p></div>
          <div class="vp-상담줄 vp-문의칸"></div></div></div>`;
      덮개.querySelector("strong").textContent = 칸("제목") || "문의";
      덮개.querySelector("small").textContent = [칸("문의자"), 칸("문의유형"), 칸("처리결과"), 칸("문의접수일")].filter(Boolean).join(" · ");
      덮개.querySelector(".vp-문의글").textContent = 칸("문의내용") || "(없음)";
      덮개.querySelector(".vp-답변글").textContent = 칸("답변내용") || "(없음)";
      고객그리기(덮개.querySelector(".vp-문의칸"), row, heads.map((h) => (["ctCd", "inquiryCd", "순번", "제목", "문의내용", "답변내용"].includes(h) ? "" : h)));
      덮개.addEventListener("click", (e) => { if (e.target === 덮개 || e.target.closest(".vp-상담닫기")) 판닫기(); });
      r.appendChild(덮개);
      판 = 덮개;
      끌수있게(덮개);
    }

    (async () => {
      try {
        const doc = await 묻기(null);
        처음문서 = doc;
        막대.elements.from.value = 값(doc, "dcStartDt");
        막대.elements.to.value = 값(doc, "dcEndDt");
        if (!차례) 보이기(doc);
      } catch (e) { 알림.textContent = "고객문의 목록을 읽지 못했습니다."; }
    })();
  }

  const root = document.createElement("div");
  root.id = "vp-root";
  root.className = "vp-wide";
  root.innerHTML = CS전용 ? `
    <div class="vp-search">
      <a class="vp-home" href="/index.aspx">← 메인</a>
      <div class="vp-머리줄"><h1>CS등록</h1><a class="vp-머리단추" href="/System/Sales/orderMst.aspx#vgInq" target="_blank" rel="noopener">상담내용보기</a></div>
      <form class="vp-bar">
        <input type="date" name="from" required>
        <span>~</span>
        <input type="date" name="to" required>
        <input name="q" class="vp-q" placeholder="주문번호, 이름, 상품명, 상품코드, 주소, 전화번호, 배송상태, CS…">
        <button type="submit">조회</button>
      </form>
      <div class="vp-note"></div>
      <pre class="vp-진단"></pre>
      <div class="vp-table"></div>
    </div>` : `
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
  진단칸 = root.querySelector(".vp-진단");

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
    if (CS전용) return;                                // CS등록에는 거르개가 없다
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
  if (startDt && endDt) {
    bar.from.value = startDt.value;
    bar.to.value = endDt.value;
  }
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
    if (me && me.src) return me.src;
    /* 10-25 0.34.53 부터 화면 글은 배경 글이 MAIN 에 **인라인**으로 넣어 `currentScript` 가 src 없는 인라인 글이다 → 깃 주소 + 캐시표로 짓는다(0.34.50 이 이 길에서 못 불렀다). */
    return "https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/search.js?t=" + Math.floor(Date.now() / 60000);
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
    if (CS전용) { 뒷길로부르기(); return; }            // 주문관리에는 확장이 goods.js 를 안 보낸다 — 기다릴 일이 없다
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
  /* 10-25 CS등록(주문관리)도 이름 단추 — 확장(불러오기.js)은 주문관리에 goods.js 를 안 보내므로(덮어쓰기 필요) 여기서 바로 부른다. */
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
      /* ⚠ `ord`·`at` 도 같이 받는다 — **CS등록 판**이 「무슨 주문인지·언제인지」 를 보여야 한다
           (10-16 사장님 「cs등록 항목을 만들어줘」). `log` 는 안 받는다 — 길고 여기선 안 쓴다. */
      const 답 = await 상담읽기(상담뿌리()
        + "?pageSize=300&mask.fieldPaths=cnt&mask.fieldPaths=open&mask.fieldPaths=kind"
        + "&mask.fieldPaths=ord&mask.fieldPaths=at");
      if (!답.ok) { window.VP말?.("상담:셈못받음 " + 답.status); return; }
      let 연것 = 0;
      for (const d of (JSON.parse(답.글).documents || [])) {
        const 이름 = String(d.name || "").split("/").pop();
        const f = d.fields || {};
        상담셈.set(이름, { 수: 풀기(f.cnt) || 0, 열림: !!풀기(f.open), 종류: 풀기(f.kind) || "",
                          주문: 풀기(f.ord) || 이름, 때: Number(풀기(f.at)) || 0 });
        if (풀기(f.open)) 연것++;
      }
      window.VP말?.("상담:이력있는줄 " + 상담셈.size + "개 · 안끝난접수 " + 연것 + "건");
      for (const [칸, 주문] of 상담칸들) 상담점찍기(칸, 주문);
    } catch (e) {
      window.VP말?.("상담:셈못받음 " + (e && e.message ? e.message : e));
    }
  }

  /* ⚠ **접수 안 끝난 것은 더 또렷하게.** 사장님이 그걸 찾으시려고 쓰신다(바이글 10-15). */
  function 상담점찍기(칸, 주문) {
    const 알 = 칸.querySelector(".vp-상담알");
    if (!알) return;
    const 것 = 상담셈.get(상담열쇠(주문)) || { 수: 0, 열림: false, 종류: "" };
    알.classList.toggle("vp-있음", 것.수 > 0);
    알.classList.toggle("vp-열림", !!것.열림);
    알.textContent = 것.열림 ? (것.종류 || "접수") + " 접수중"
      : 것.수 > 0 ? "상담 " + 것.수 : "상담";
  }

  /* 주문번호 칸에 **작은 단추 하나**만 더한다 — 칸을 새로 내지 않는다.
     (배송관리 23칸을 밀어내지 않는다 — 사장님이 그 칸을 다 보셔야 한다) */
  function 상담단추(td, 주문, 상품명, 줄, 머리) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "vp-상담알";
    b.title = "상담 이력 · 교환 · 반품 · AS 접수";
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); 상담판열기(주문, 상품명, 줄, 머리); });
    td.appendChild(b);
    상담칸들.push([td, 주문]);
    상담점찍기(td, 주문);
  }

  /* ── 상담 판 ── */
  let 상담판 = null;
  function 상담판닫기() { if (상담판) { 상담판.remove(); 상담판 = null; } }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { 상담판닫기(); CS판닫기(); } });

  /* 10-24 사장님: 「현재 상담버튼 클릭시 나타나는 팝업화면을 이동 가능한 팝업화면으로 수정해 주세요」
     상담 판·CS등록 판의 **머리**(`.vp-상담머리`)를 잡고 끌면 판이 화면 안에서 움직인다.
     ⚠ 화면 밖으로 안 나간다(가로·세로 모두 판 전체가 안에 든다) — 창을 줄이거나 판 안이 길어져도 다시 안으로 당긴다.
     ⚠ 마우스·터치·펜 모두 포인터 이벤트 하나로(머리의 `touch-action: none`). 머리 안의 단추(닫기)는 끌기가 아니다.
     ⚠ 처음 잡을 때만 판을 `position: fixed` 로 바꾼다 — 잡기 전 자리(왼쪽/가운데)는 그대로라 튀지 않는다. */
  function 끌수있게(덮개) {
    const 판 = 덮개.querySelector(".vp-상담판"), 머리 = 덮개.querySelector(".vp-상담머리");
    if (!판 || !머리) return;
    머리.classList.add("vp-끌개");
    let 잡음 = null;
    const 안으로 = (x, y) => {
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return [Math.min(Math.max(0, x), Math.max(0, vw - 판.offsetWidth)),
              Math.min(Math.max(0, y), Math.max(0, vh - 판.offsetHeight))];
    };
    const 놓기 = (e) => { if (잡음 && e.pointerId === 잡음.id) { 잡음 = null; 판.classList.remove("vp-끄는중"); } };
    머리.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest && e.target.closest("button, input, a, select, textarea")) return;
      const r = 판.getBoundingClientRect();
      잡음 = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top };
      Object.assign(판.style, { position: "fixed", margin: "0", left: r.left + "px", top: r.top + "px", width: r.width + "px" });
      판.classList.add("vp-끄는중");
      try { 머리.setPointerCapture(e.pointerId); } catch (x) {}
      e.preventDefault();
    });
    머리.addEventListener("pointermove", (e) => {
      if (!잡음 || e.pointerId !== 잡음.id) return;
      const [x, y] = 안으로(e.clientX - 잡음.dx, e.clientY - 잡음.dy);
      판.style.left = x + "px"; 판.style.top = y + "px";
    });
    머리.addEventListener("pointerup", 놓기);
    머리.addEventListener("pointercancel", 놓기);
    머리.addEventListener("lostpointercapture", 놓기);
    const 다시안으로 = () => {
      if (!판.isConnected) { window.removeEventListener("resize", 다시안으로); return; }
      if (판.style.position !== "fixed") return;
      const [x, y] = 안으로(parseFloat(판.style.left) || 0, parseFloat(판.style.top) || 0);
      판.style.left = x + "px"; 판.style.top = y + "px";
    };
    window.addEventListener("resize", 다시안으로);
    if (window.ResizeObserver) new ResizeObserver(다시안으로).observe(판);
  }

  const 접수종류 = ["교환", "반품", "AS"];
  const CS등록종류 = ["교환", "반품", "AS", "취소"];   // 10-28 [새 지시 CS등록단품] 「접수」 아래 CS등록 — 이번 단계는 단품 고르기까지
  const 접수상태 = ["접수", "처리중", "끝"];

  /* ── CS등록 (10-16) ──────────────────────────────────────
     사장님: 「**cs등록 항목을 만들어줘**」(장부 a1792145842) — 메뉴 화면을 짚어 보내셨다.
     메뉴의 「CS등록」 은 배송관리로 오면서 `#vgCS` 를 달고 온다(`menu.js`). 그것을 보고 이 판을 연다.
     ⚠ **상담 판을 두 벌로 만들지 않는다.** 여기서는 **남긴 것을 모아 보여 주고**,
       누르면 배송관리 줄에서 여는 **그 상담 판**(`상담판열기`)을 그대로 연다.
     ⚠ 주문번호를 모르실 때는 배송관리 표에서 그 줄의 「상담」 단추로 여시면 된다 —
       여기에는 **주문번호로 바로 여는 길**을 둔다(치시거나 붙여 넣으시면 된다).
     ⚠ 사람 칸(수취인·전화·주소)은 **한 글자도 안 싣는다.** 창고에 담지도 않았다. */
  let CS판 = null;
  function CS판닫기() { if (CS판) { CS판.remove(); CS판 = null; } }

  /* 찾은 주문을 줄마다 보인다 — 이름·지역·전화·상품명·주문번호. 상품명을 누르면 그 주문의 상담 판이 열린다.
     ⚠ 보이기만 한다 — 창고에 싣지 않는다. */
  function CS결과그리기(칸, 줄들, 머리, 끝) {
    if (!줄들.length) { 칸.textContent = 끝 ? "찾은 주문이 없습니다." : "찾는 중…"; return; }
    const 자리 = (re) => 머리.findIndex((h) => re.test(String(h || "").replace(/\s/g, "")));
    const 값 = (줄, i) => (i < 0 || 줄[i] == null ? "" : String(줄[i]).trim());
    const 상 = 머리.indexOf("상품명"), 주 = 머리.indexOf("주문번호");
    const 받 = 머리.indexOf("수취인"), 시 = 자리(/^주문자/), 소 = 자리(/주소/);
    const 전 = 머리.map((h, i) => (/전화|연락|휴대|핸드폰|tel|hp/i.test(String(h || "")) ? i : -1)).filter((i) => i >= 0);
    const 만들기 = 줄들.map(({ 줄 }) => {
      const 주문 = 값(줄, 주);
      /* 10-24 줄은 상담 판을 여는 **줄 전체**, 그 안의 상품명은 상품관리의 이름 단추(누르면 상품 상세, 상담은 안 열림).
         단추 안에 단추를 넣을 수 없어 줄을 `div[role=button]` 으로 둔다. */
      const b = document.createElement("div");
      b.setAttribute("role", "button");
      b.tabIndex = 0;
      b.className = "vp-cs줄 vp-cs찾은";
      const 상품명 = 값(줄, 상);
      const 이름 = b.appendChild(document.createElement("strong"));
      이름.textContent = 상품명 || "(상품명 없음)";
      if (상품명) { 이름.dataset.vp이름 = 상품명; 상품칸채우기(이름, 상품명, "상품"); 상품칸들.push([이름, 상품명, "상품"]); }
      const 사람 = [값(줄, 받), 값(줄, 시) && 값(줄, 시) !== 값(줄, 받) ? "주문자 " + 값(줄, 시) : ""].filter(Boolean).join(" · ");
      const 번호들 = [...new Set(전.map((i) => 값(줄, i)).filter(Boolean))].join(" / ");
      const 가 = b.appendChild(document.createElement("small"));
      가.textContent = [사람, 번호들, 값(줄, 소), 주문 && "주문 " + 주문].filter(Boolean).join(" · ");
      const 접수 = 상담셈.get(상담열쇠(주문));
      if (접수 && (접수.수 > 0 || 접수.열림)) {
        const t = b.appendChild(document.createElement("small"));
        t.textContent = (접수.열림 ? (접수.종류 || "접수") + " 접수중 · " : "") + "상담 " + (접수.수 || 0);
        if (접수.열림) b.classList.add("vp-열림");
      }
      const 열기 = () => {
        if (!주문) return;
        CS판닫기();
        상담판열기(주문, 상품명, 줄, 머리);
      };
      b.addEventListener("click", (e) => {
        if (e.target.closest && e.target.closest(".vp-goods-list")) return;   // 이름 단추 = 상품 상세만
        열기();
      });
      b.addEventListener("keydown", (e) => { if (e.target === b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); 열기(); } });
      return b;
    });
    const 머릿글 = document.createElement("p");
    머릿글.className = "vp-cs없음";
    머릿글.textContent = 줄들.length + "건" + (끝 ? "" : " · 더 찾는 중…") + " — 상품명을 누르면 상담·접수 판이 열립니다.";
    칸.replaceChildren(머릿글, ...만들기);
  }

  async function CS판열기() {
    CS판닫기();
    const 덮개 = document.createElement("div");
    덮개.className = "vp-상담덮개 vp-cs덮개";
    덮개.innerHTML = `<div class="vp-상담판 vp-cs판" role="dialog" aria-label="CS등록">
      <div class="vp-상담머리"><strong>CS등록</strong><small></small>
        <button type="button" class="vp-상담닫기" aria-label="닫기">×</button></div>
      <form class="vp-cs찾기">
        <input type="text" placeholder="이름 · 지역 · 전화번호 · 주문상품명 · 주문번호 …">
        <button type="submit">찾기</button>
      </form>
      <div class="vp-cs결과" hidden></div>
      <div class="vp-cs목록">불러오는 중…</div></div>`;
    덮개.querySelector(".vp-상담닫기").addEventListener("click", CS판닫기);
    덮개.addEventListener("mousedown", (e) => { if (e.target === 덮개) CS판닫기(); });
    document.getElementById("vp-root")?.appendChild(덮개) || document.body.appendChild(덮개);
    CS판 = 덮개;
    끌수있게(덮개);

    const 칸 = 덮개.querySelector(".vp-cs찾기 input");
    const 결과칸 = 덮개.querySelector(".vp-cs결과");
    let 찾는번호 = 0;
    덮개.querySelector(".vp-cs찾기").addEventListener("submit", async (e) => {
      e.preventDefault();
      const 말 = 칸.value.trim();
      const 번호 = ++찾는번호;
      if (!말) { 결과칸.hidden = true; 결과칸.replaceChildren(); 칸.focus(); return; }
      결과칸.hidden = false;
      결과칸.textContent = "찾는 중…";
      const 줄들 = [];
      let 머리 = null;
      const 보이기 = (끝) => {
        if (번호 !== 찾는번호) return;
        CS결과그리기(결과칸, 줄들, 머리, 끝);
      };
      try {
        /* 검색어 나눠 보내기는 배송관리 검색창의 `plan`·`fetchList` 를 그대로 쓴다. */
        const { filters, variants, local } = plan(말);
        const 오늘 = new Date(), 먼저 = new Date(오늘.getTime() - 400 * 86400000);
        const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
          + "-" + String(d.getDate()).padStart(2, "0");
        const 날 = { dcStartDt: ymd(먼저), dcEndDt: ymd(오늘) };
        const 봤다 = new Set();
        for (const [이름, 칸들] of variants) {
          const r = await fetchList({ ...날, ...filters, ...칸들 }, 이름 === "전체" ? "600" : "100");
          if (번호 !== 찾는번호) return;
          if (!머리 && r.heads.length) 머리 = r.heads;
          for (const row of r.rows) {
            const 키 = row.join("\t");
            if (봤다.has(키)) continue;
            봤다.add(키);
            const 글 = row.join(" "), 숫자 = 글.replace(/\D/g, "");
            if (!local.every((w) => 글.includes(w) || (/^[\d-]+$/.test(w) && 숫자.includes(w.replace(/-/g, ""))))) continue;
            줄들.push({ 줄: row, 머리: r.heads });
          }
          보이기(false);
        }
        보이기(true);
      } catch (err) {
        if (번호 === 찾는번호) 결과칸.textContent = "조회에 실패했습니다. 다시 로그인한 뒤 시도해 주세요.";
        window.VP말?.("CS찾기:실패 " + (err && err.message ? err.message : err));
      }
    });
    setTimeout(() => 칸.focus(), 0);

    if (!상담셈.size) await 상담셈받기();
    const 목록 = 덮개.querySelector(".vp-cs목록");
    const 줄들 = [...상담셈.entries()]
      .filter(([, v]) => (v.수 || 0) > 0 || v.열림)
      .sort((a, z) => (z[1].때 || 0) - (a[1].때 || 0));
    덮개.querySelector(".vp-상담머리 small").textContent = "남긴 것 " + 줄들.length + "건";
    if (!줄들.length) {
      목록.replaceChildren(Object.assign(document.createElement("p"),
        { className: "vp-cs없음", textContent: "아직 남긴 것이 없습니다. 주문번호로 새로 남기십시오." }));
      return;
    }
    목록.replaceChildren(...줄들.map(([, v]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vp-cs줄" + (v.열림 ? " vp-열림" : "");
      b.appendChild(document.createElement("strong")).textContent = v.주문;
      const 적 = b.appendChild(document.createElement("small"));
      적.textContent = (v.열림 ? (v.종류 || "접수") + " 접수중 · " : "") + "상담 " + (v.수 || 0)
        + (v.때 ? " · " + new Date(v.때 * 1000).toLocaleDateString("ko-KR") : "");
      b.addEventListener("click", () => { CS판닫기(); 상담판열기(v.주문, ""); });
      return b;
    }));
  }

  /* 메뉴에서 「CS등록」 으로 들어오면 바로 연다. ⚠ 주소의 `#vgCS` 하나만 본다 —
     그 표가 없으면 배송관리는 **전과 똑같이** 뜬다. */
  function CS등록인가() { return /(^|[#&])vgCS\b/i.test(location.hash || ""); }
  /* ⚠ 주문관리 위(CS전용)에서는 화면 자체가 CS등록이다 — 위에 덮개를 또 열지 않는다(10-22) */
  if (!CS전용) {
    if (CS등록인가()) setTimeout(() => { CS판열기(); }, 400);
    window.addEventListener("hashchange", () => { if (CS등록인가()) CS판열기(); });
  }

  /* ── 고객정보 (10-21) ──────────────────────────────────
     사장님: 「cs등록할때 주문관리에 있는 모든 고객정보가 확인되게 해주세요」(장부 a1792555506)
     CS 판(상담 판)을 열면 그 주문의 **벤더피아 배송목록 한 줄을 머리줄과 짝지어 전부** 보인다
     (주문자·수취인·연락처·주소… 벤더피아가 준 칸 모두, 이름·차례 그대로).
     ⚠ 배송관리 표에서 열면 이미 받은 그 줄을, CS등록에서 주문번호로 열면 **그 자리에서 벤더피아에 조회**한다.
     ⚠ **보이기만 한다.** 창고(`vpcs_note`)에 싣지 않는다 — 늘 벤더피아에 바로 묻는다. 벤더피아에는 조회만. */
  async function 고객줄받기(주문) {
    const 오늘 = new Date(), 먼저 = new Date(오늘.getTime() - 400 * 86400000);
    const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
      + "-" + String(d.getDate()).padStart(2, "0");
    const r = await fetchList({ dcStartDt: ymd(먼저), dcEndDt: ymd(오늘), tbSOrderNo: 주문 }, "50");
    /* ⚠ 주문번호가 **똑같은 줄만** 쓴다 — 다른 사람 줄을 대신 보이면 안 된다. 없으면 없다고 알린다. */
    const 줄 = r.rows.find((x) => x.some((v) => String(v).trim() === String(주문).trim()));
    return 줄 ? { 줄, 머리: r.heads } : null;
  }
  function 고객그리기(칸, 줄, 머리) {
    칸.replaceChildren();
    const 틀 = 칸.appendChild(document.createElement("dl"));
    틀.className = "vp-고객목록";
    머리.forEach((이름, i) => {
      const 값 = 줄[i] === undefined || 줄[i] === null ? "" : String(줄[i]).trim();
      if (!이름 || !값) return;
      틀.appendChild(document.createElement("dt")).textContent = 이름;
      틀.appendChild(document.createElement("dd")).textContent = 값;
    });
    if (!틀.children.length) 칸.textContent = "고객정보가 비어 있습니다.";
  }

  async function 상담판열기(주문, 상품명, 받은줄, 받은머리) {
    상담판닫기();
    const 열쇠 = 상담열쇠(주문);
    if (!열쇠) return;
    const 덮개 = document.createElement("div");
    덮개.className = "vp-상담덮개";
    덮개.innerHTML = `<div class="vp-상담판" role="dialog" aria-label="상담 이력과 접수">
      <div class="vp-상담머리"><strong></strong><small></small>
        <button type="button" class="vp-상담닫기" aria-label="닫기">×</button></div>
      <div class="vp-고객정보">고객정보 불러오는 중…</div>
      <div class="vp-상담접수"></div>
      <div class="vp-상담목록">불러오는 중…</div>
      <form class="vp-상담적기">
        <div class="vp-상담고르기"><span class="vp-상담라벨">고객문의</span></div>
        <textarea rows="3" placeholder="오간 말을 적으십시오 (지울 수 없습니다 — 쌓입니다)"></textarea>
        <div class="vp-상담발"><span class="vp-상담알림"></span><button type="submit">접수</button></div>
      </form>
      <div class="vp-cs등록">
        <div class="vp-상담고르기">
          <span class="vp-상담라벨">CS등록</span>
          ${CS등록종류.map((k) => `<button type="button" class="vp-상담종류" data-k="${k}">${k}</button>`).join("")}
        </div>
        <div class="vp-cs단품" hidden></div>
        <div class="vp-cs단품검색" hidden>
          <input type="search" placeholder="단품관리 판매중 단품 검색 (주문된 단품이 위에 없을 때)" autocomplete="off">
          <div class="vp-cs검색목록" hidden></div>
          <div class="vp-cs단품 vp-cs검색고름" hidden></div>
        </div>
        <div class="vp-cs고른것" hidden></div>
        <div class="vp-cs메시지" hidden>
          <label class="vp-cs메시지켬"><input type="checkbox" checked> <span class="vp-상담라벨">출고 담당자에게 보낼 메시지</span></label>
          <textarea rows="3" maxlength="500" placeholder="출고 담당자에게 전할 말 (없으면 체크를 끄십시오)"></textarea>
          <div class="vp-상담발"><span class="vp-상담알림 vp-cs알림"></span><button type="button" class="vp-cs저장" disabled>CS등록 저장</button></div>
        </div>
      </div></div>`;
    덮개.querySelector("strong").textContent = 상품명 || "상담";
    덮개.querySelector(".vp-상담머리 small").textContent = "주문 " + 주문;
    덮개.querySelector(".vp-상담닫기").addEventListener("click", 상담판닫기);
    덮개.addEventListener("mousedown", (e) => { if (e.target === 덮개) 상담판닫기(); });
    document.getElementById("vp-root")?.appendChild(덮개) || document.body.appendChild(덮개);
    상담판 = 덮개;
    끌수있게(덮개);

    const 목록 = 덮개.querySelector(".vp-상담목록");
    const 접수칸 = 덮개.querySelector(".vp-상담접수");
    const 고객칸 = 덮개.querySelector(".vp-고객정보");
    if (받은줄 && 받은머리) 고객그리기(고객칸, 받은줄, 받은머리);
    else 고객줄받기(주문).then((답) => {
      if (답) 고객그리기(고객칸, 답.줄, 답.머리);
      else 고객칸.textContent = "벤더피아 배송목록에서 이 주문을 찾지 못했습니다.";
    }).catch((e) => {
      고객칸.textContent = "고객정보를 못 읽었습니다. 다시 로그인한 뒤 시도해 주세요.";
      window.VP말?.("고객정보:못읽음 " + (e && e.message ? e.message : e));
    });
    const 알림 = 덮개.querySelector(".vp-상담알림");
    const 적기 = 덮개.querySelector(".vp-상담적기");
    const 글칸 = 덮개.querySelector("textarea");
    let 쌓인것 = [], 지금접수 = null;
    /* 고객문의 원주문 고르기용 — 이 판을 연 줄의 상품 */
    const 줄값 = (이름) => { const i = 받은머리 ? 받은머리.indexOf(이름) : -1; return i >= 0 && 받은줄 ? String(받은줄[i] == null ? "" : 받은줄[i]).trim() : ""; };
    const 상품단서 = { 상품명: 상품명 || 줄값("상품명"), 상품코드: 줄값("상품코드") };

    /* 10-28 [새 지시 CS등록단품] CS등록 — 종류(교환·반품·AS·취소)를 누르면 이 주문 상품의 단품(상품명 상세의 단품 단추와 같은 것)을
       보이고, 어느 단품에 대한 접수인지 고른다(여럿 고를 수 있음). **여기까지만** — 벤더피아·우리 창고에 안 쓴다.
       고른 것은 `CS고름`(덮개.vpCS등록)에 들고 있다 — 다음 단계(실제 등록)가 쓴다. */
    const CS칸 = 덮개.querySelector(".vp-cs등록");
    const 단품칸 = CS칸.querySelector(".vp-cs단품");
    const 고른칸 = CS칸.querySelector(".vp-cs고른것");
    const CS고름 = { 종류: "", 단품: [] };
    덮개.vpCS등록 = CS고름;
    let 단품목록 = null, 단품받는중 = null;
    /* 10-28 [새 지시 고객주문변경] 단품을 고르면 「출고 담당자에게 보낼 메시지」(직접 입력, 체크 끄면 비활성·안 보냄) + 「CS등록 저장」 */
    const 메시지칸 = CS칸.querySelector(".vp-cs메시지");
    const 메시지켬 = 메시지칸.querySelector("input[type=checkbox]");
    const 메시지글 = 메시지칸.querySelector("textarea");
    const CS알림 = 메시지칸.querySelector(".vp-cs알림");
    const CS저장 = 메시지칸.querySelector(".vp-cs저장");
    let CS저장중 = false;
    const 저장단추그리기 = () => {
      메시지칸.hidden = !(CS고름.종류 && CS고름.단품.length);
      메시지글.disabled = !메시지켬.checked;
      CS저장.disabled = CS저장중 || !CS고름.종류 || !CS고름.단품.length;
    };
    메시지켬.addEventListener("change", 저장단추그리기);
    const 고른것그리기 = () => {
      for (const x of CS칸.querySelectorAll(".vp-상담종류"))
        x.setAttribute("aria-pressed", x.dataset.k === CS고름.종류 ? "true" : "false");
      검색고름그리기();
      for (const x of CS칸.querySelectorAll(".vp-cs단품 .vp-goods-list > button, .vp-cs검색목록 .vp-goods-list > button")) {
        const 고름 = CS고름.단품.some((d) => d.code === x.dataset.code);
        x.setAttribute("aria-pressed", 고름 ? "true" : "false");
        x.parentElement.classList.toggle("vp-고름", 고름);
      }
      고른칸.hidden = !CS고름.종류;
      고른칸.textContent = !CS고름.종류 ? ""
        : CS고름.종류 + " · " + (CS고름.단품.length
          ? CS고름.단품.map((d) => d.name + (d.n > 1 ? " ×" + d.n : "")).join(", ")
          : "단품을 고르십시오");
      저장단추그리기();
    };
    /* 10-28 [새 지시 CS단품단추] 단품 단추 = 배송관리 단품명 칸과 **같은 단추**(`VP단품단추` — 이름·코드·양품·네 점, 같은 통 `.vp-goods-list`).
       동작만 다르다: 왼쪽 누름 = CS등록용 고름/풂, 오른쪽 누름 = 「상세보기」 메뉴 → 다른 쪽과 같은 상세(goods.js).
       단품관리 이름표에 아직 없는 단품은 글자 단추(고름만)로 두고, 이름표가 늘면(`vp단품단추준비`·`VP단품찾기`) 다시 그린다. */
    /* 고름/풂 — 상품 단품은 상품 상세 차례, 단품 검색으로 고른 것은 그 뒤에(10-28 [새 지시 CS단품검색]) */
    const 단품토글 = (d) => {
      const 남 = CS고름.단품.some((x) => x.code === d.code)
        ? CS고름.단품.filter((x) => x.code !== d.code)
        : [...CS고름.단품, d];
      const 목록 = 단품목록 || [];
      CS고름.단품 = [...목록.filter((x) => 남.some((y) => y.code === x.code)), ...남.filter((y) => !목록.some((x) => x.code === y.code))];
      고른것그리기();
    };
    /* 단품 하나 = 통 `.vp-goods-list` + `VP단품단추`(없으면 글자 단추, 고름만). 단추를 못 만들었으면 false */
    const 단품통 = (칸, d) => {
      const 고르기 = () => 단품토글(d);
      const 통 = 칸.appendChild(document.createElement("div"));
      통.className = "vp-goods-list";
      let b = window.VP단품단추 ? window.VP단품단추(d.name, d.code, 고르기) : null;
      const 됨 = !!b;
      if (!b) {
        b = document.createElement("button");
        b.type = "button";
        b.textContent = d.name;
        b.title = d.code;
        b.addEventListener("click", (e) => { e.preventDefault(); 고르기(); });
      }
      b.dataset.code = d.code;
      통.appendChild(b);
      if (d.n > 1) 통.appendChild(Object.assign(document.createElement("small"), { className: "vp-cs개수", textContent: "×" + d.n }));
      return 됨;
    };
    /* 10-28 [새 지시 CS단품검색] 단품 검색 — 주문된 단품이 상품 구성(위 단추)에 없을 때(③ 주문 단품정보에 없는 단품).
       사용자가 글을 치면 단품관리의 판매중 단품을 단품관리 검색과 같은 방식으로 찾고(`VP단품검색`, goods.js), 결과는 스크롤 드롭다운에 같은 단품 단추로.
       왼쪽 누름 = 고름/풂(여럿), 오른쪽 누름 = 「상세보기」. 고른 것 중 위 단추에 없는 것은 검색칸 아래 같은 단추로 남는다(누르면 풂). */
    const 검색칸 = CS칸.querySelector(".vp-cs단품검색");
    const 검색글 = 검색칸.querySelector("input");
    const 검색목록 = 검색칸.querySelector(".vp-cs검색목록");
    const 검색고름칸 = 검색칸.querySelector(".vp-cs검색고름");
    const 검색최대 = 200;
    let 검색차례 = 0, 검색예약 = 0, 검색고름열쇠 = "";
    function 검색고름그리기() {
      const 목록 = 단품목록 || [];
      const 더 = CS고름.단품.filter((y) => !목록.some((x) => x.code === y.code));
      const 열쇠 = 더.map((d) => d.code + "\u0001" + d.name).join("\u0002");
      if (열쇠 === 검색고름열쇠) return;
      검색고름열쇠 = 열쇠;
      검색고름칸.replaceChildren();
      for (const d of 더) 단품통(검색고름칸, d);
      검색고름칸.hidden = !더.length;
    }
    const 검색닫기 = () => { 검색목록.hidden = true; };
    const 검색하기 = async () => {
      const 차례 = ++검색차례;
      const 글 = 검색글.value;
      if (!글.trim()) { 검색목록.replaceChildren(); 검색닫기(); return; }
      검색목록.hidden = false;
      검색목록.textContent = "단품 찾는 중…";
      try {
        for (let i = 0; !window.VP단품검색 && i < 50; i++) await new Promise((r) => setTimeout(r, 200));
        if (!window.VP단품검색) throw new Error("단품관리를 못 불러옴");
        const 답 = await window.VP단품검색(글);
        if (차례 !== 검색차례 || !덮개.isConnected) return;
        검색목록.replaceChildren();
        for (const d of 답.slice(0, 검색최대)) 단품통(검색목록, { code: d.code, name: d.name, n: 1 });
        if (!답.length) 검색목록.textContent = "판매중 단품에서 찾지 못했습니다.";
        else if (답.length > 검색최대) 검색목록.appendChild(Object.assign(document.createElement("small"), { className: "vp-cs검색더", textContent: 답.length.toLocaleString() + "개 중 " + 검색최대 + "개 — 더 좁혀 찾으십시오" }));
        고른것그리기();
      } catch (e) {
        if (차례 !== 검색차례) return;
        검색목록.textContent = "단품을 못 찾았습니다 — " + (e && e.message ? e.message : e);
        window.VP말?.("CS등록:단품검색못함 " + (e && e.message ? e.message : e));
      }
    };
    검색글.addEventListener("input", () => { clearTimeout(검색예약); 검색예약 = setTimeout(검색하기, 250); });
    검색글.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); clearTimeout(검색예약); 검색하기(); }
      if (e.key === "Escape" && !검색목록.hidden) { e.stopPropagation(); 검색닫기(); }
    });
    검색글.addEventListener("focus", () => { if (검색글.value.trim() && 검색목록.childNodes.length) 검색목록.hidden = false; });
    /* 목록 밖을 누르면 닫힌다(목록 안 단추·우클릭 메뉴를 누르는 동안은 열려 있다 — 여럿 고르기).
       ⚠ 누름이 끝난(click) 뒤에 닫는다 — 누르기 시작(pointerdown)에 닫으면 판 높이가 줄어 스크롤이 밀리고 누른 단추를 빗나간다. */
    덮개.addEventListener("click", (e) => {
      if (검색목록.hidden || 검색칸.contains(e.target) || e.target.closest?.(".vp-우클릭")) return;
      검색닫기();
    });
    const 단품그리기 = () => {
      단품칸.replaceChildren();
      let 모자람 = [];
      for (const d of 단품목록) {
        if (!단품통(단품칸, d)) 모자람.push({ 이름: d.name, 코드: d.code });
      }
      if (!단품목록.length) 단품칸.textContent = "이 상품의 단품 구성이 없습니다.";
      고른것그리기();
      if (모자람.length && window.VP단품표끝?.() && window.VP단품찾기) {
        모자람 = 모자람.filter((x) => !단품찾아봄.has(x.이름 + "\u0001" + x.코드));
        for (const x of 모자람) 단품찾아봄.add(x.이름 + "\u0001" + x.코드);
        if (모자람.length) window.VP단품찾기(모자람).then((늘) => { if (늘 && 덮개.isConnected) 단품그리기(); }).catch(() => {});
      }
    };
    const 단품찾아봄 = new Set();
    const 단품단추준비 = () => {
      if (!덮개.isConnected) { window.removeEventListener("vp단품단추준비", 단품단추준비); return; }
      if (단품목록 && 단품칸.querySelector(".vp-goods-list > button:not(:has(.vp-점))")) 단품그리기();
      const 글자단추 = ".vp-goods-list > button:not(:has(.vp-점))";
      if (검색고름칸.querySelector(글자단추)) { 검색고름열쇠 = ""; 고른것그리기(); }
      if (!검색목록.hidden && 검색목록.querySelector(글자단추)) 검색하기();
    };
    window.addEventListener("vp단품단추준비", 단품단추준비);
    const 단품받기 = async () => {
      if (단품목록) return;
      if (단품받는중) return 단품받는중;
      단품칸.textContent = "단품 불러오는 중…";
      단품받는중 = (async () => {
        try {
          for (let i = 0; !window.VP상품단품 && i < 50; i++) await new Promise((r) => setTimeout(r, 200));
          if (!window.VP상품단품) throw new Error("상품 상세를 못 불러옴");
          const 답 = await window.VP상품단품(상품단서.상품명, 상품단서.상품코드);
          if (!답) { 단품칸.textContent = "상품관리에서 이 상품(" + (상품단서.상품명 || "?") + ")을 찾지 못했습니다."; return; }
          단품목록 = 답;
          단품그리기();
        } catch (e) {
          단품칸.textContent = "단품을 못 읽었습니다 — " + (e && e.message ? e.message : e);
          window.VP말?.("CS등록:단품못읽음 " + (e && e.message ? e.message : e));
        } finally { 단품받는중 = null; }
      })();
      return 단품받는중;
    };
    for (const b of CS칸.querySelectorAll(".vp-상담종류")) {
      b.addEventListener("click", () => {
        CS고름.종류 = CS고름.종류 === b.dataset.k ? "" : b.dataset.k;   // 다시 누르면 꺼진다
        단품칸.hidden = !CS고름.종류;
        검색칸.hidden = !CS고름.종류;
        고른것그리기();
        if (CS고름.종류) 단품받기();
      });
    }
    /* 같은 주문·종류·단품·메시지는 한 번만 보낸다(두 번 눌러 두 번 저장되지 않게) — 저장 POST 를 안 보낸 실패만 다시 누를 수 있다 */
    CS저장.addEventListener("click", async () => {
      if (CS저장중 || !CS고름.종류 || !CS고름.단품.length) return;
      const 메시지 = 메시지켬.checked ? 메시지글.value.trim() : "";
      const 고름 = { 종류: CS고름.종류, 단품: CS고름.단품.map((d) => ({ ...d })) };
      const 열쇠글 = 주문 + "\n" + 고름.종류 + "\n" + 고름.단품.map((d) => d.code).sort().join("+") + "\n" + 메시지;
      if (올린변경.has(열쇠글)) { CS알림.textContent = "이미 보냈습니다 — 주문관리에서 확인하십시오"; return; }
      올린변경.add(열쇠글);
      CS저장중 = true; 저장단추그리기();
      CS알림.textContent = "벤더피아 CS등록 중…";
      try {
        await 주문변경올리기(주문, { ...고름, 메시지, 단서: 상품단서 });
        CS알림.textContent = "CS등록됨";
      } catch (err) {
        CS알림.textContent = "실패(" + (err && err.message ? err.message : err) + ")"
          + (/^③ 주문 단품정보에 없는 단품/.test(err && err.message ? err.message : "") ? " — 위 단품 검색으로 주문된 단품을 고르십시오" : "");
        if (!(err && err.보냄)) 올린변경.delete(열쇠글);
        window.VP말?.("고객주문변경:실패 " + (err && err.message ? err.message : err));
      }
      CS저장중 = false; 저장단추그리기();
    });

    const 접수그리기 = () => {
      접수칸.replaceChildren();
      if (!지금접수 || !지금접수.k) { 접수칸.hidden = true; return; }
      접수칸.hidden = false;
      const 줄 = 접수칸.appendChild(document.createElement("div"));
      줄.className = "vp-상담접수줄" + (지금접수.st !== "끝" ? " vp-열림" : "");
      const 이름 = 줄.appendChild(document.createElement("strong"));
      이름.textContent = 지금접수.k + " 접수";
      const 때 = 줄.appendChild(document.createElement("small"));
      때.textContent = 지금접수.at ? new Date(지금접수.at * 1000).toLocaleString("ko-KR") : "";
      const 고름 = 줄.appendChild(document.createElement("div"));
      고름.className = "vp-상담상태";
      for (const st of 접수상태) {
        const b = 고름.appendChild(document.createElement("button"));
        b.type = "button";
        b.textContent = st;
        b.setAttribute("aria-pressed", 지금접수.st === st ? "true" : "false");
        /* ⚠ 지우지 않는다 — 상태를 바꾸면 **새 줄로 쌓는다**(바이글 10-15). */
        b.addEventListener("click", () => 남기기({ 글: 지금접수.k + " 접수 → " + st,
                                                  종류: 지금접수.k, 상태: st }));
      }
    };

    const 그리기 = () => {
      접수그리기();
      if (!쌓인것.length) { 목록.textContent = "아직 남긴 것이 없습니다."; return; }
      목록.replaceChildren(...쌓인것.slice().reverse().map((x) => {
        const 줄 = document.createElement("div");
        줄.className = "vp-상담줄";
        const 머리 = 줄.appendChild(document.createElement("small"));
        const 때 = x.at ? new Date(x.at * 1000) : null;
        머리.textContent = (때 ? 때.toLocaleString("ko-KR") : "") + (x.by ? " · " + x.by : "");
        if (x.k) {
          const 표 = 머리.appendChild(document.createElement("b"));
          표.className = "vp-상담표";
          표.textContent = x.k;
        }
        const 몸 = 줄.appendChild(document.createElement("p"));
        몸.textContent = x.s || "";
        return 줄;
      }));
    };

    async function 남기기({ 글, 종류, 상태, 올리기 }) {
      const 단추 = 적기.querySelector("button[type=submit]");
      if (단추.disabled) return;                       // 두 번 눌러 두 번 가지 않게
      단추.disabled = true;
      알림.textContent = "남기는 중…";
      let 남김 = false;
      try {
        const 온것 = await 상담쓰기(열쇠, 주문, { 글, 종류, 상태, 앞것: 쌓인것, 앞접수: 지금접수 });
        쌓인것 = 온것.log;
        지금접수 = 온것.req;
        상담셈.set(열쇠, { 수: 쌓인것.length, 열림: 온것.open, 종류: (온것.req && 온것.req.k) || "" });
        for (const [칸, 주] of 상담칸들) 상담점찍기(칸, 주);
        글칸.value = "";
        알림.textContent = "남겼습니다";
        그리기();
        남김 = true;
      } catch (err) {
        /* ⚠ **조용히 지나가지 않는다.** 사장님께 글로 알리고 까닭도 적는다. */
        알림.textContent = "못 남겼습니다 — " + (err && err.message ? err.message : err);
        window.VP말?.("상담:못남김 " + (err && err.message ? err.message : err));
      }
      /* 우리 저장이 된 뒤에만 벤더피아 고객문의에도 올린다. 실패해도 우리 저장은 남는다. */
      const 열쇠글 = 열쇠 + "\n" + 글;
      if (남김 && 올리기 && !올린글.has(열쇠글)) {
        올린글.add(열쇠글);
        알림.textContent = "남겼습니다 · 벤더피아 등록 중…";
        try {
          await 벤더피아올리기(주문, { 글, 종류, 상태, 단서: 상품단서 });
          알림.textContent = "남겼습니다 · 벤더피아 등록됨";
        } catch (err) {
          알림.textContent = "남겼습니다 · 벤더피아 등록 실패(" + (err && err.message ? err.message : err) + ")";
          if (!(err && err.보냄)) 올린글.delete(열쇠글);   // 저장을 안 보냈으면 다시 눌러 올릴 수 있다
          window.VP말?.("고객문의:실패 " + (err && err.message ? err.message : err));
        }
      }
      단추.disabled = false;
    }

    try {
      const 답 = await 상담읽기(상담뿌리() + "/" + encodeURIComponent(열쇠));
      if (답.ok) {
        const f = JSON.parse(답.글).fields || {};
        쌓인것 = (풀기(f.log) || []).filter(Boolean);
        지금접수 = 풀기(f.req) || null;
      } else if (답.status !== 404) { 목록.textContent = "못 읽었습니다 (" + 답.status + ")"; return; }
      그리기();
    } catch (e) {
      목록.textContent = "못 읽었습니다";
      window.VP말?.("상담:읽기못함 " + (e && e.message ? e.message : e));
      return;
    }

    적기.addEventListener("submit", (e) => {
      e.preventDefault();
      const 글 = 글칸.value.trim();
      if (!글) return;
      /* 10-28 「접수」 = 고객문의 메시지 접수(우리 저장 + 벤더피아 고객문의 등록). 교환·반품·AS 는 아래 CS등록으로 옮겼다. */
      남기기({ 글, 종류: "", 상태: "", 올리기: true });
    });
    글칸.focus();
  }

  /* 한 줄 쌓기 — **앞 글을 그대로 두고 뒤에 더한다.** 지우지 않는다.
     ⚠ 쓰기는 **화면 쪽에서 바로** 보낸다. 확장 다리는 읽기만 지나가게 막혀 있고
       그 막음을 넓히지 않는다(10-15). */
  async function 상담쓰기(열쇠, 주문, { 글, 종류, 상태, 앞것, 앞접수 }) {
    const tok = await 상담표받기();
    const 이제 = Math.floor(Date.now() / 1000);
    const 적은 = 적은이();
    const 쌓기 = (앞것 || []).concat([{ s: 글, at: 이제, by: 적은, k: 종류 || "" }]);
    /* 접수 — 종류를 고르셨으면 새로 열고, 상태만 바뀌면 그 접수의 상태를 고친다.
       ⚠ 앞 줄은 **그대로 둔다.** 취소는 「끝」 으로 바꾸고 그 사실이 **새 줄로** 남는다. */
    let 접수 = 앞접수 || null;
    if (종류) 접수 = { k: 종류, at: (접수 && 접수.k === 종류 && 접수.at) || 이제,
                      by: (접수 && 접수.k === 종류 && 접수.by) || 적은,
                      st: 상태 || "접수" };
    const 열림 = !!(접수 && 접수.k && 접수.st !== "끝");
    const 주소 = 상담뿌리() + "/" + encodeURIComponent(열쇠)
      + "?updateMask.fieldPaths=ord&updateMask.fieldPaths=cnt&updateMask.fieldPaths=at"
      + "&updateMask.fieldPaths=log&updateMask.fieldPaths=req"
      + "&updateMask.fieldPaths=open&updateMask.fieldPaths=kind";
    const 몸 = JSON.stringify({ fields: {
      ord: 싸기(String(주문)), cnt: 싸기(쌓기.length), at: 싸기(이제), log: 싸기(쌓기),
      req: 접수 ? 싸기(접수) : { nullValue: null },
      open: { booleanValue: 열림 }, kind: 싸기((접수 && 접수.k) || "") } });
    /* ⚠⚠ **다리를 먼저** 쓴다 (10-15). 벤더피아 쪽 `connect-src` 는 받는 것만이 아니라
         **보내는 것도 같이 막는다** — `fetch` 는 읽기든 쓰기든 한 울타리다. 그래서
         「쓰기만 화면 쪽에서」 는 안 통한다(⑧ 수입정보가 안 됐던 그 까닭이다).
         다리는 그 CSP 에 안 묶인다. 다리가 없으면(확장이 옛 판) 전처럼 바로 보낸다.
       ⚠ 다리는 이 한 길만 받는다 — `vpcs_note` 의 한 문서 자리에 `PATCH`.
         `:commit`·`:batchWrite`·`DELETE`·딴 칸은 **계속 막혀 있다**(`불러오기.js`). */
    const 옵션 = { method: "PATCH",
      headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body: 몸 };
    let 길 = "바로", ok = false, 번호 = 0, 탈 = "";
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션);
      if (답 && 답.다리) { 길 = "다리"; ok = !!답.ok; 번호 = 답.status; 탈 = 답.탈 || ""; }
    }
    if (길 === "바로") {
      const r = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션));
      ok = r.ok; 번호 = r.status;
    }
    if (!ok) throw new Error("창고 " + 번호 + (탈 ? "/" + 탈 : "") + " (" + 길 + ")");
    window.VP말?.("상담:남김 " + 쌓기.length + "줄/" + 길
      + (열림 ? " · " + 접수.k + " " + 접수.st : ""));
    return { log: 쌓기, req: 접수, open: 열림 };
  }

  /* ── 벤더피아 고객문의 올리기 (10-26 [새 지시 CS업로드]) ─────────────
     사장님: 「만들어. 시험 등록할 주문은 내가 정해줄게」 — ⚠ **「벤더피아에서는 조회만」 의 예외는 이것과 아래 고객주문변경 저장(10-28) 둘뿐.**
     길: `System/CS/csDetl.aspx` GET → 원주문 숨은 칸(`hOrderNo`)을 채워 `btnReflash` 다시 보냄
         → 응답에 주문 정보(주문자·상품명·매출처)가 **차야** 이어진 것 → 문의자·제목·문의내용을 채워 `btnSaveInsert.x/.y` 로 POST.
     ⚠ 원주문이 안 이어지면 **저장 POST 를 보내지 않는다**(빈·엉뚱한 주문으로 올라가지 않게).
     10-27 [새 지시 원주문잇기] 사장님 크롬에서 잼: 「원주문 검색」 팝업(`ordersPopup.aspx`)은 몰 주문번호(`tb_SOrderNo`, 일부만 맞아도 걸림)로
     찾고, 고른 줄의 **벤더피아 안 번호**(7자리, 열 key `orderNo`)를 `getReturnValue` 가 `hOrderNo` 에 넣고 `btnReflash` 를 누른다.
     → 우리도 팝업 조회(조회만)로 몰 주문번호가 **똑같은** 줄을 찾아 그 안 번호를 넣는다. 여럿이면 상담 판을 연 줄과 같은 상품, 못 고르면 맨 위 줄. */
  const 원주문찾기주소 = "/System/CS/ordersPopup.aspx";
  /* 10-27 [새 지시 사람길] 사람 길 그대로 — 벤더피아 머리 「CS등록」(`#lnkCSReg`)이 여는 「고객주문변경_접수」 쪽.
     GET·잇기·저장 모두 이 주소(폼 action 도 `./csDetl.aspx?previousPage=first`) */
  const 고객문의주소 = "/System/CS/csDetl.aspx?previousPage=first";
  const 올린글 = new Set();                            // 주문+글 — 같은 글을 두 번 올리지 않는다
  const 올린변경 = new Set();                          // 주문+종류+단품+메시지 — 같은 고객주문변경을 두 번 저장하지 않는다
  const 문의값 = (doc, id) => { const el = doc.getElementById(id); return el ? String(el.value || "").trim() : ""; };
  /* `빈파일`: 브라우저는 고른 파일이 없어도 파일 칸을 빈 칸(filename="")으로 **늘** 보낸다 — csDetl(multipart)에서만 똑같이 */
  function 문의폼값(form, 빈파일 = false) {
    const fd = new FormData();
    for (const el of form.elements) {
      if (!el.name || el.disabled) continue;
      const t = String(el.type || "").toLowerCase();
      if (t === "file") { if (빈파일) fd.append(el.name, new File([], "", { type: "application/octet-stream" })); continue; }
      if (["image", "submit", "button", "reset"].includes(t)) continue;
      if ((t === "checkbox" || t === "radio") && !el.checked) continue;
      if (el.tagName === "SELECT") { const o = el.options[el.selectedIndex] || el.options[0]; if (o) fd.append(el.name, o.value); continue; }
      fd.append(el.name, el.value || "");
    }
    return fd;
  }
  async function 문의보내기(doc, 단추id, 채움) {
    const form = doc.getElementById("aspnetForm") || doc.forms[0];
    const 단추 = doc.getElementById(단추id);
    if (!form || !단추 || !단추.name) throw new Error(단추id + " 없음");
    const fd = 문의폼값(form, true);
    for (const [id, v] of Object.entries(채움)) {
      const el = doc.getElementById(id);
      if (el && el.name) fd.set(el.name, v);
    }
    if (String(단추.type).toLowerCase() === "image") { fd.append(단추.name + ".x", "5"); fd.append(단추.name + ".y", "5"); }
    else fd.append(단추.name, 단추.value || "");
    const 바탕 = new URL(고객문의주소, location.href);
    const res = await 벤더피아(new URL(form.getAttribute("action") || 바탕.href, 바탕).href,
      { method: "POST", body: fd, credentials: "include" }, "보호");
    const 글 = await res.text();
    return { res, 글, doc: new DOMParser().parseFromString(글, "text/html") };
  }
  /* 고르는 칸에서 글자가 같은 것을 고른다 — 없으면 그대로(벤더피아 기본값) */
  function 고를값(doc, id, 글자) {
    const el = doc.getElementById(id);
    const o = el && 글자 && [...el.options].find((x) => x.textContent.trim() === 글자);
    return o ? o.value : null;
  }
  /* 몰 주문번호 → 벤더피아 안 번호. 사장님 10-27: 「상담 판을 연 그 줄(같은 상품)로 이어줘. 못 고르면 맨 위 줄로.」 */
  async function 원주문찾기(주문, 단서 = {}) {
    const 몰번호 = String(주문).trim();
    const 첫 = await 벤더피아(원주문찾기주소, { credentials: "include" }, "보호");
    if (!첫.ok) throw new Error("원주문 검색 HTTP " + 첫.status);
    const doc = new DOMParser().parseFromString(await 첫.text(), "text/html");
    const form = doc.getElementById("aspnetForm") || doc.forms[0];
    const 칸 = (id) => doc.getElementById(id);
    if (!form || !칸("tb_SOrderNo") || !칸("btnSearch")) throw new Error("원주문 검색 쪽 모양이 다름");
    const 묻기 = async (시작일) => {
      const body = new URLSearchParams();
      for (const [k, v] of 문의폼값(form)) body.append(k, v);
      body.set(칸("tb_SOrderNo").name, 몰번호);
      if (시작일 && 칸("dcStartDt")) body.set(칸("dcStartDt").name, 시작일);
      body.append(칸("btnSearch").name + ".x", "5"); body.append(칸("btnSearch").name + ".y", "5");
      const res = await 벤더피아(new URL(form.getAttribute("action") || 원주문찾기주소, new URL(원주문찾기주소, location.href)).href,
        { method: "POST", body, credentials: "include" }, "보호");
      if (!res.ok) throw new Error("원주문 검색 HTTP " + res.status);
      const 글 = await res.text();
      const d = new DOMParser().parseFromString(글, "text/html");
      /* 배송상태 칸은 글자로 보이지만 팝업이 넘기는 값(`dStatus`)은 코드다 — 그 칸 고르개(`oGrid_ddlStatus`)의 [글자, 코드] 목록에서 바꾼다 */
      const 상태끝 = 글.indexOf('$get("oGrid_ddlStatus")');
      const 상태표 = 상태끝 < 0 ? {} : Object.fromEntries([...글.slice(글.lastIndexOf("$create(", 상태끝), 상태끝)
        .matchAll(/\[\[,,,,,"([^"]*)","([^"]*)"/g)].map((m) => [m[1].trim(), m[2]]));
      const 줄들 = [...d.querySelectorAll("#oGrid tr")];
      const 머리줄 = 줄들.find((tr) => tr.querySelector("th") && tr.cells.length >= 5
        && [...tr.cells].filter((c) => c.textContent.trim() === "주문번호").length >= 2);
      if (!머리줄) return [];
      const 머리 = [...머리줄.cells].map((c) => c.textContent.trim());
      const 번호칸 = 머리.reduce((a, h, i) => (h === "주문번호" ? a.concat(i) : a), []);
      const 자리 = (h) => 머리.indexOf(h);
      return 줄들.filter((tr) => tr !== 머리줄 && tr.cells.length === 머리.length).map((tr) => {
        const 값 = (i) => (i >= 0 && tr.cells[i] ? tr.cells[i].textContent.trim() : "");
        const 키 = (tr.getAttribute("data-rowkey") || "").replace(/[^\d]/g, "");
        const 상태글 = 값(자리("배송상태"));
        return { 안번호: 키 || 값(번호칸[0]), 몰번호: 값(번호칸[1]), 상품코드: 값(자리("상품코드")), 상품명: 값(자리("상품명")),
          상태코드: 상태글 ? (상태표[상태글] ?? "") : "", 가용수: 값(자리("가용수")).replace(/[^\d-]/g, "") };
      }).filter((x) => /^\d+$/.test(x.안번호) && x.몰번호 === 몰번호);
    };
    let 맞음 = await 묻기("");
    if (!맞음.length) 맞음 = await 묻기("2000-01-01");          // 기본 기간(1년) 밖 주문
    const 같은 = (a, b) => String(a || "").replace(/\s+/g, "").toLowerCase() === String(b || "").replace(/\s+/g, "").toLowerCase();
    const 고름 = (단서.상품코드 && 맞음.find((x) => 같은(x.상품코드, 단서.상품코드)))
      || (단서.상품명 && 맞음.find((x) => 같은(x.상품명, 단서.상품명))) || 맞음[0];
    window.VP말?.("고객문의:원주문 " + 맞음.length + "줄 → " + (고름 ? 고름.안번호 + (고름 === 맞음[0] ? "(맨위)" : "(같은상품)")
      + " 상태" + 고름.상태코드 + " 가용" + 고름.가용수 : "없음"));
    return 고름 || null;
  }
  /* 등록됐는지는 응답 꼴로 짐작하지 않고 **고객문의 목록을 조회해** 본다(조회만) — 오늘 접수 + 문의내용 한 토막 */
  async function 등록확인(글) {
    const 토막 = String(글).split(/[\r\n\[\]%_^'"]+/).map((x) => x.trim()).sort((a, b) => b.length - a.length)[0].slice(0, 20);
    if (!토막) return null;
    const 주소 = "/System/CS/inquiryList.aspx";
    const 첫 = await 벤더피아(주소, { credentials: "include" }, "보호");
    if (!첫.ok) return null;
    const doc = new DOMParser().parseFromString(await 첫.text(), "text/html");
    const form = doc.getElementById("aspnetForm") || doc.forms[0];
    const 칸 = (id) => doc.getElementById(id);
    if (!form || !칸("tbContent") || !칸("btnSearch")) return null;
    const body = new URLSearchParams();
    for (const [k, v] of 문의폼값(form)) body.append(k, v);
    body.set(칸("tbContent").name, 토막);
    const 오늘 = new Date(), z = (n) => String(n).padStart(2, "0");
    if (칸("dcStartDt")) body.set(칸("dcStartDt").name, 오늘.getFullYear() + "-" + z(오늘.getMonth() + 1) + "-" + z(오늘.getDate()));
    body.append(칸("btnSearch").name + ".x", "5"); body.append(칸("btnSearch").name + ".y", "5");
    const res = await 벤더피아(new URL(form.getAttribute("action") || 주소, new URL(주소, location.href)).href,
      { method: "POST", body, credentials: "include" }, "보호");
    if (!res.ok) return null;
    const d = new DOMParser().parseFromString(await res.text(), "text/html");
    return [...d.querySelectorAll("#oGrid td")].some((td) => td.textContent.replace(/\s+/g, "").includes(토막.replace(/\s+/g, "")));
  }
  /* ASP.NET 오류 쪽이면 그 까닭 한 줄(제목·h2) */
  const 오류글 = (doc) => ((doc.querySelector("h2 i") || doc.querySelector("h2") || doc.querySelector("title") || {}).textContent || "").trim().slice(0, 80);
  async function 벤더피아올리기(주문, { 글, 종류, 상태, 단서 }) {
    const 첫 = await 벤더피아(고객문의주소, { credentials: "include" }, "보호");
    if (!첫.ok) throw new Error("등록 쪽 HTTP " + 첫.status);
    const 첫글 = await 첫.text();
    let doc = new DOMParser().parseFromString(첫글, "text/html");
    if (doc.querySelector("input[type=password]")) throw new Error("로그인 필요");
    if (!doc.getElementById("tbContent") || !doc.getElementById("btnSaveInsert")) throw new Error("등록 쪽 모양이 다름");
    /* ① 원주문 잇기 — 사람이 팝업에서 줄을 고를 때(`getReturnValue`)와 똑같이 세 칸을 넣고 `btnReflash`
       (10-27 [새 지시 저장경로] 잼: `hOrderNo`=안 번호 · `hdStatusCd`=배송상태 **코드** · `tbUsableQty`=가용수) */
    const 고른줄 = await 원주문찾기(주문, 단서);
    if (!고른줄) throw new Error("① 원주문을 못 찾음 — 벤더피아 원주문 검색에 이 주문번호가 없습니다");
    const 잇기 = await 문의보내기(doc, "btnReflash", { hOrderNo: 고른줄.안번호, hdStatusCd: 고른줄.상태코드, tbUsableQty: 고른줄.가용수 });
    doc = 잇기.doc;
    const 이음 = { 주문번호: 문의값(doc, "tbSOrderNo"), 주문자: 문의값(doc, "tbOrderer"), 문의자: 문의값(doc, "tbInquirer"),
                  상품: 문의값(doc, "tbSGoodsNm"), 매출처: 문의값(doc, "tbStoreNm"), 숨은: 문의값(doc, "hOrderNo") };
    window.VP말?.("고객문의:잇기 HTTP" + 잇기.res.status + " " + JSON.stringify(이음).slice(0, 160));
    if (!잇기.res.ok || !doc.getElementById("btnSaveInsert"))
      throw new Error("② 원주문 잇기 HTTP " + 잇기.res.status + (잇기.res.ok ? "" : " · " + 오류글(잇기.doc)));
    /* 사람 길: 잇기 응답에서 서버가 탭을 「고객문의」(`hTab=INQUERY`)로 바꾸고 문의자를 채운다 — 아니면 저장하지 않는다 */
    if (문의값(doc, "hTab") !== "INQUERY" || !이음.문의자)
      throw new Error("② 잇기 뒤 고객문의 칸이 안 열림(탭 " + (문의값(doc, "hTab") || "없음") + (이음.문의자 ? "" : " · 문의자 빈칸") + ")");
    /* 잇기 뒤 `tbSOrderNo` = 「몰번호 / 안번호 / …」 꼴(10-27 잼) */
    if (!이음.주문번호.split("/").map((x) => x.trim()).includes(String(주문).trim()) || !(이음.주문자 || 이음.상품 || 이음.매출처))
      throw new Error("② 원주문을 못 이음");
    /* ③ 문의 채워 저장 — 문의자는 잇기 때 벤더피아가 채운 값 그대로(maxlength 10).
       사장님 10-27: 「제목에는 상담메세지에 남겼던 메세지의 앞 열글자 … 문의내용에 메세지에 남겼던 말」 — 제목 머리 「[종류]」 없음 */
    const 제목 = [...String(글).replace(/\s+/g, " ").trim()].slice(0, 10).join("").trim();
    const 채움 = { tbInquirer: 이음.문의자.slice(0, 10), tbTitle: 제목, tbContent: 글 };
    const 유형 = 고를값(doc, "ddlInqType", 종류);
    if (유형 !== null) 채움.ddlInqType = 유형;
    const 끝남 = 고를값(doc, "ddlCallEndGb", 상태 === "끝" ? "처리완료" : "");
    if (끝남 !== null) 채움.ddlCallEndGb = 끝남;
    /* 저장 POST 를 보낸 뒤의 탈은 「보냄」 — 그 글은 다시 안 올린다(이미 들어갔을 수 있다). 목록에 없다고 확인되면 다시 올릴 수 있다 */
    const 탈 = (m, 보냄 = true) => Object.assign(new Error(m), { 보냄 });
    let 저장;
    try { 저장 = await 문의보내기(doc, "btnSaveInsert", 채움); }
    catch (e) { throw 탈("③ 저장 응답 못 받음 — 고객문의 목록에서 확인"); }
    /* ⚠ 10-27 잼: csDetl 쪽 글에는 「문의자를 입력해주세요.」 같은 alert 가 **늘** 박혀 있다 — 빈 쪽(GET)에도 있던 알림은 뺀다 */
    const 알림뽑기 = (t) => [...t.matchAll(/alert\(\s*['"]([^'"]{1,120})['"]/g)].map((m) => m[1]);
    const 늘있는알림 = new Set(알림뽑기(첫글));
    const 알림들 = 알림뽑기(저장.글).filter((a) => !늘있는알림.has(a));
    /* ④ 진짜 들어갔나 — 고객문의 목록을 조회해 본다(응답 꼴은 아직 한 번도 못 봤다) */
    let 확인 = null;
    try { 확인 = await 등록확인(글); } catch (e) { 확인 = null; }
    window.VP말?.("고객문의:저장 HTTP" + 저장.res.status + " " + (저장.res.url || "").replace(/^https?:\/\/[^/]+/, "").slice(0, 50)
      + " 알림" + JSON.stringify(알림들).slice(0, 120) + " 목록확인:" + (확인 === null ? "못봄" : 확인 ? "있음" : "없음")
      + (저장.res.ok ? "" : " 오류[" + 오류글(저장.doc) + "]"));
    if (확인 === true) return;
    const 까닭 = !저장.res.ok ? "저장 HTTP " + 저장.res.status + (오류글(저장.doc) ? " · " + 오류글(저장.doc) : "")
      : 저장.doc.querySelector("input[type=password]") ? "로그인 필요"
      : 알림들.find((a) => /실패|오류|에러|입력해|없습니다|확인해|못/.test(a));
    if (확인 === false) {
      if (!까닭 && (/inquiryList\.aspx/i.test(저장.res.url || "") || 알림들.some((a) => /되었|완료|성공/.test(a)))) return;   // 됐다고 했으나 목록 조회에 안 걸림 — 됐다는 말을 믿는다
      throw 탈("③ 벤더피아가 저장 안 함 — " + (까닭 || (알림들[0] ? "알림 「" + 알림들[0] + "」" : "응답에 알림 없음")), false);
    }
    if (까닭) throw 탈("③ " + 까닭);
    if (/inquiryList\.aspx/i.test(저장.res.url || "") || 알림들.some((a) => /되었|완료|성공/.test(a))) return;
    throw 탈("④ 응답에 등록 표시 없음 — 고객문의 목록에서 확인");
  }

  /* ── 벤더피아 고객주문변경 저장 (10-28 [새 지시 고객주문변경]) ─────────────
     사장님이 이 지시로 허락한 **두 번째 쓰기** — 이 기능만. 사람 길 그대로:
     머리 「CS등록」 → `csDetl.aspx?previousPage=first`(고객주문변경_접수) → 원주문 고름(`getReturnValue` → `btnReflash`)
     → 「주문 단품정보」 단품표(`oGridOrderItem`)에서 고른 단품만 체크(`CHK`) → 「고객주문변경」 탭(`#li2`, `hTab=CS`)
     → 유형(`ddlCsType` 1 취소·2 반품·3 교환·4 AS·5 설치) = 고른 종류 → 상세사유(`tbReasonDetl`, 500자) = 출고 메시지(없으면 빈칸) → 위쪽 「저장」(`btnSaveInsert`).
     ⚠ 단품표는 Infragistics 그리드라 체크가 **그 쪽 JS(비동기 되보냄·clientState)** 로만 서버에 간다 → fetch 로 흉내 내지 않고
       **숨은 같은 출처 틀**에 진짜 쪽을 열어 그 쪽 JS 로 사람처럼 누른다. 틀은 `sandbox`(allow-modals 없음)라 벤더피아 alert 가 화면에 안 뜬다
       — 저장 전 alert 는 가로채 까닭으로 쓴다. 확인은 **주문관리 목록 조회**(맨 위 줄이 이 주문·이 종류인가). */
  const 쉼 = (ms) => new Promise((r) => setTimeout(r, ms));
  function 틀로드(틀, ms) {
    return new Promise((됨, 안됨) => {
      const 끝 = setTimeout(() => { 틀.removeEventListener("load", f); 안됨(new Error("시간 넘김")); }, ms);
      const f = () => { clearTimeout(끝); 됨(); };
      틀.addEventListener("load", f, { once: true });
    });
  }
  /* 틀 안 쪽의 XHR(그리드 비동기 되보냄)이 다 끝날 때까지 */
  function 틀바쁨(w) {
    if (w.__vp바쁨) return w.__vp바쁨;
    const s = { n: 0 }, X = w.XMLHttpRequest && w.XMLHttpRequest.prototype;
    if (X) { const 보냄 = X.send; X.send = function (...a) { s.n++; this.addEventListener("loadend", () => { s.n--; }, { once: true }); return 보냄.apply(this, a); }; }
    return (w.__vp바쁨 = s);
  }
  async function 틀잠잠(s, ms = 20000) {
    const 끝 = Date.now() + ms;
    await 쉼(300);
    while (s.n > 0 && Date.now() < 끝) await 쉼(150);
    await 쉼(200);
  }
  const 같은코드 = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  const CS글자 = (x) => String(x || "").replace(/[\s/]/g, "").toUpperCase();
  /* 저장 뒤 확인 — 판매관리→주문관리 목록(조회만) 맨 위 줄이 이 주문(몰 주문번호 = 뒤 「주문번호」 칸)·이 CS 인가 */
  async function 주문변경확인(주문, 종류) {
    const 주소 = "/System/Sales/orderMst.aspx";
    const res = await 벤더피아(주소, { credentials: "include" }, "보호");
    if (!res.ok) return { 맨위: false, 까닭: "주문관리 HTTP " + res.status };
    const d = new DOMParser().parseFromString(await res.text(), "text/html");
    const 줄들 = [...d.querySelectorAll("#oGrid tr")];
    const 머리줄 = 줄들.find((tr) => tr.querySelector("th") && tr.cells.length >= 20 && [...tr.cells].some((c) => c.textContent.trim() === "CS"));
    if (!머리줄) return { 맨위: false, 까닭: "주문관리 목록 못 읽음" };
    const 머리 = [...머리줄.cells].map((c) => c.textContent.trim());
    const 번호 = 머리.lastIndexOf("주문번호"), cs = 머리.indexOf("CS");
    const 몸 = 줄들.filter((tr) => tr !== 머리줄 && tr.cells.length === 머리.length);
    const 값 = (tr, i) => (i >= 0 && tr && tr.cells[i] ? tr.cells[i].textContent.trim() : "");
    const 맞나 = (tr) => 값(tr, 번호) === String(주문).trim() && CS글자(값(tr, cs)).includes(CS글자(종류));
    const 맨위 = !!몸[0] && 맞나(몸[0]);
    return { 맨위, 까닭: 맨위 ? "" : 몸.some(맞나) ? "목록에 있으나 맨 위 아님" : "맨 위 「" + 값(몸[0], 번호) + " " + 값(몸[0], cs) + "」" };
  }
  async function 주문변경올리기(주문, { 종류, 단품, 메시지, 단서 }) {
    const 말 = (m) => window.VP말?.("고객주문변경:" + m);
    const 탈 = (m, 보냄 = false) => Object.assign(new Error(m), { 보냄 });
    const 고른줄 = await 원주문찾기(주문, 단서);
    if (!고른줄) throw 탈("① 원주문을 못 찾음 — 벤더피아 원주문 검색에 이 주문번호가 없습니다");
    const 틀 = document.createElement("iframe");
    틀.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms");
    틀.setAttribute("aria-hidden", "true");
    틀.tabIndex = -1;
    틀.style.cssText = "position:fixed;left:-12000px;top:0;width:1280px;height:900px;border:0;visibility:hidden;pointer-events:none";
    const 열림 = 틀로드(틀, 60000);
    틀.src = new URL(고객문의주소, location.href).href;
    document.body.appendChild(틀);
    try {
      await 열림;
      let w = 틀.contentWindow, d = 틀.contentDocument;
      if (!d || d.querySelector("input[type=password]")) throw 탈("로그인 필요");
      if (typeof w.getReturnValue !== "function" || !d.getElementById("btnReflash")) throw 탈("① 고객주문변경_접수 쪽 모양이 다름");
      /* ② 원주문 잇기 — 사람이 원주문 검색 팝업에서 줄을 고를 때와 똑같이 `getReturnValue` */
      const 이어짐 = 틀로드(틀, 60000);
      w.getReturnValue({ orderNo: 고른줄.안번호, dStatusCd: 고른줄.상태코드, csUsableQty: 고른줄.가용수 });
      await 이어짐;
      w = 틀.contentWindow; d = 틀.contentDocument;
      const 이은번호 = (d.getElementById("tbSOrderNo") || {}).value || "";
      말("잇기 " + 고른줄.안번호 + " 주문칸[" + 이은번호.slice(0, 40) + "] 탭" + ((d.getElementById("hTab") || {}).value || "없음"));
      if (!이은번호.split("/").map((x) => x.trim()).includes(String(주문).trim())) throw 탈("② 원주문을 못 이음");
      /* ③ 「주문 단품정보」 — 고른 단품만 체크. 하나라도 못 찾으면 저장하지 않는다 */
      const 그리드 = w.$find && w.$find("oGridOrderItem");
      if (!그리드) throw 탈("③ 주문 단품정보 표(oGridOrderItem)가 없음");
      const 바쁨 = 틀바쁨(w);
      const 줄수 = () => 그리드.get_rows().get_length();
      const 줄 = (i) => 그리드.get_rows().get_row(i);
      const 코드들 = [];
      for (let i = 0; i < 줄수(); i++) 코드들.push(String(줄(i).get_cellByColumnKey("goodsCd").get_value() || "").trim());
      const 없음 = 단품.filter((x) => !코드들.some((c) => 같은코드(c, x.code)));
      말("단품표 " + JSON.stringify(코드들).slice(0, 160) + " 고름 " + 단품.map((x) => x.code).join("+"));
      if (없음.length) throw 탈("③ 주문 단품정보에 없는 단품: " + 없음.map((x) => x.name + "(" + x.code + ")").join(", ") + " · 표에는 " + (코드들.join(", ") || "없음"));
      for (let i = 0; i < 줄수(); i++) {
        const 켤것 = 단품.some((x) => 같은코드(x.code, 코드들[i]));
        const 칸 = () => 줄(i).get_cellByColumnKey("CHK");
        if (!!칸().get_value() === 켤것) continue;
        /* 사람처럼 그 칸의 체크 그림을 누른다 — 안 먹으면 그리드 API 로 */
        const 그림 = 칸().get_element() && 칸().get_element().querySelector("img, input[type=checkbox]");
        if (그림) for (const t of ["mousedown", "mouseup", "click"])
          그림.dispatchEvent(new w.MouseEvent(t, { bubbles: true, cancelable: true, view: w, button: 0 }));
        await 틀잠잠(바쁨);
        if (!!칸().get_value() !== 켤것) { 칸().set_value(켤것); await 틀잠잠(바쁨); }
        if (!!칸().get_value() !== 켤것) throw 탈("③ 단품 체크가 안 먹음(" + 코드들[i] + ")");
      }
      const 켠것 = [];
      for (let i = 0; i < 줄수(); i++) if (줄(i).get_cellByColumnKey("CHK").get_value()) 켠것.push(코드들[i]);
      말("체크 " + 켠것.join("+"));
      /* ④ 「고객주문변경」 탭 — 사람이 탭을 누르면 `hTab` 이 CS 가 된다 */
      d.getElementById("li2")?.click();
      await 쉼(200);
      if ((d.getElementById("hTab") || {}).value !== "CS") throw 탈("④ 고객주문변경 탭이 안 열림(탭 " + ((d.getElementById("hTab") || {}).value || "없음") + ")");
      /* ⑤ 유형 = 고른 종류 */
      const 유형칸 = d.getElementById("ddlCsType");
      const 유형 = 유형칸 && [...유형칸.options].find((o) => CS글자(o.textContent) === CS글자(종류));
      if (!유형) throw 탈("⑤ 유형에 「" + 종류 + "」 없음(" + (유형칸 ? [...유형칸.options].map((o) => o.textContent.trim()).join("·") : "칸 없음") + ")");
      유형칸.value = 유형.value;
      유형칸.dispatchEvent(new w.Event("change", { bubbles: true }));
      /* ⑥ 상세사유 = 출고 메시지(체크 해제·빈칸이면 빈칸) */
      const 사유칸 = d.getElementById("tbReasonDetl");
      if (!사유칸) throw 탈("⑥ 상세사유 칸 없음");
      사유칸.value = String(메시지 || "").slice(0, 500);
      사유칸.dispatchEvent(new w.Event("change", { bubbles: true }));
      /* ⑦ 위쪽 「저장」 — 저장 전 검사 alert 는 가로챈다(그러면 쪽이 안 넘어감 = 저장 안 보냄) */
      const 알림들 = [];
      w.alert = (m) => { 알림들.push(String(m)); };
      w.confirm = (m) => { 알림들.push(String(m)); return false; };
      let 떠남 = false;
      w.addEventListener("pagehide", () => { 떠남 = true; });
      w.addEventListener("beforeunload", () => { 떠남 = true; });
      const 저장단추 = d.getElementById("btnSaveInsert");
      if (!저장단추) throw 탈("⑦ 저장 단추 없음");
      const 알림뽑기 = (t) => [...t.matchAll(/alert\(\s*['"]([^'"]{1,120})['"]/g)].map((m) => m[1]);
      const 늘있는알림 = new Set(알림뽑기(d.documentElement.outerHTML));   // 쪽에 늘 박혀 있는 alert(검사 함수 안) — 뺀다
      const 저장됨 = 틀로드(틀, 60000);
      말("저장 누름 유형" + 유형.value + " 사유" + 사유칸.value.length + "자 탭" + d.getElementById("hTab").value);
      저장단추.click();
      for (let i = 0; i < 20 && !떠남; i++) await 쉼(100);
      if (!떠남) { 저장됨.catch(() => {}); throw 탈("⑦ 저장 안 됨 — " + (알림들[0] ? "벤더피아 알림 「" + 알림들[0] + "」" : "저장 단추가 안 먹음")); }
      try { await 저장됨; } catch (e) { throw 탈("⑦ 저장 응답 못 받음 — 주문관리에서 확인", true); }
      const 뒤 = 틀.contentDocument;
      const 뒤글 = 뒤 ? 뒤.documentElement.outerHTML : "";
      const 응답알림 = 알림뽑기(뒤글).filter((a) => !늘있는알림.has(a));
      말("저장 뒤 " + String(틀.contentWindow?.location?.pathname || "") + " 알림" + JSON.stringify(응답알림).slice(0, 120)
        + (뒤 && 뒤.querySelector("input[type=password]") ? " 로그인쪽" : "") + " 오류[" + (뒤 ? 오류글(뒤) : "") + "]");
      /* ⑧ 확인 — 주문관리 맨 위에 새 CS */
      let 확인 = null;
      try { 확인 = await 주문변경확인(주문, 종류); } catch (e) { 확인 = { 맨위: false, 까닭: "주문관리 조회 못함" }; }
      말("주문관리 " + (확인.맨위 ? "맨위 있음" : 확인.까닭));
      if (확인.맨위) return { 맨위: true };
      throw 탈("⑧ 주문관리 맨 위에 안 보임 — " + (응답알림.find((a) => /실패|오류|에러|없습니다|확인해|못/.test(a)) || 확인.까닭), true);
    } finally {
      틀.remove();
    }
  }

  let tbody = null;
  let currentSearch = 0;
  /* 상품명 칸들을 적어 둔다 — 목록이 늦게 와도 그때 단추로 바꿔 끼운다 */
  let 상품칸들 = [];
  let 상품칸자리 = -1;
  let 상품코드자리 = -1, 단품코드자리 = -1;
  let 단품칸자리 = -1;
  let 단추된것 = 0;
  /* 10-24 사장님: 「목록의 상품명/단품명 단품관리/상품관리에 있는 동일한 기능의 해당 명칭 버튼이 나타나게」
     상품명 칸 = 상품관리의 그 이름 단추, 단품명 칸 = 단품관리의 그 이름 단추 (`goods.js` 가 만들어 준다 — 상세를 두 벌로 만들지 않는다).
     단추는 단품관리·상품관리 표 첫 칸과 **같은 통** `div.vp-goods-list` 에 담아 같은 꼴(누르는 글자 + 아래 연동 점)이 된다.
     누르면 그 화면에서 누른 것처럼 상세가 열리고, **상담은 안 열린다**(단추가 누름을 가로챈다).
     ⚠ 이미 단추가 든 칸은 다시 안 채운다(`vp상품단추준비`·`vp단품단추준비` 가 늦게 와도 같은 단추를 두 번 만들지 않는다). */
  function 이름칸채우기(td, 이름, 종류, 코드) {
    if (td.querySelector(".vp-goods-list")) return false;
    const 만들기 = 종류 === "단품" ? window.VP단품단추 : window.VP상품단추;
    const b = 만들기 ? 만들기(이름, 코드) : null;
    if (!b) { if (td.textContent !== 이름) td.textContent = 이름; return false; }   // 단품관리·상품관리에 없는 이름 → 글자 그대로
    const 통 = document.createElement("div");
    통.className = "vp-goods-list";
    통.appendChild(b);
    td.replaceChildren(통);
    단추된것++;
    return true;
  }
  const 상품칸채우기 = (td, 이름, 종류 = "상품", 코드 = "") => 이름칸채우기(td, 이름, 종류, 코드);
  /* ⚠ 까닭 적기 — **그려 놓고 보니** 몇 칸이 단추가 됐나. 이것이 ⑤ 를 가른다:
       칸이 0개면 상품명 칸을 못 찾은 것, 칸은 있고 단추가 0개면 **이름이 하나도 안 맞은** 것. */
  const 상품칸셈적기 = () => window.VP말?.(
    "상품칸:" + 상품칸들.length + "개중 단추" + 단추된것 + "개 · 줄클릭 " + document.querySelectorAll("#vp-root tr.vp-줄상담").length + "줄"
    + (window.VP상품단추 ? "" : " · 이름단추:goods 못 불러옴")
    + 맨글자말());
  /* 10-25 단추가 안 된 칸(맨 글자)을 센다 — 상세가 정말 없는 것만 남아야 한다. 사용안함 이름은 따로 센다. */
  function 맨글자말() {
    if (!상품칸들.length || !(window.VP상품단추 && window.VP단품단추)) return "";
    const 맨 = 상품칸들.filter(([td]) => td.isConnected !== false && !td.querySelector(".vp-goods-list"));
    const 이름 = (종류) => new Set(맨.filter((x) => x[2] === 종류).map((x) => x[1]));
    const 안씀 = [...이름("단품"), ...이름("상품")].filter((n) => /\(\s*사용\s*안\s*함\s*\)/.test(n)).length;
    return " · 맨글자 " + 맨.length + "칸(상품" + 이름("상품").size + "가지·단품" + 이름("단품").size + "가지, 그중 사용안함 " + 안씀 + ")";
  }
  function 늦게채우기(종류) {
    let 바뀐것 = 0;
    for (const [td, 이름, 칸종류, 코드] of 상품칸들) if (칸종류 === 종류 && td.isConnected !== false && 상품칸채우기(td, 이름, 종류, 코드)) 바뀐것++;
    return 바뀐것;
  }
  /* 10-25 [새 지시 이름단추 느림] — 칸을 **쪼개서** 채운다: 한 번에 25ms 만 쓰고 쉰다(1,200칸을 한꺼번에 바꾸면 화면이 멈춘다).
     이름표(goods.js)가 아직 모자라면 칸은 글자 그대로 두고, 이름표가 늘 때마다(`vp상품단추준비`·`vp단품단추준비`) 처음부터 다시 훑는다.
     이름표가 다 모였는데도 안 붙는 이름은 **목록에 나온 것만** 그 이름·코드로 하나씩 찾아(`VP상품찾기`·`VP단품찾기`) 붙인다. */
  let 채울자리 = 0, 채우는중 = false, 채울종류 = new Set(), 바뀐셈 = { 상품: 0, 단품: 0 };
  const 찾아본것 = new Set();
  function 칸채우기예약(종류) {
    if (종류) 채울종류.add(종류); else { 채울종류.add("상품"); 채울종류.add("단품"); }
    채울자리 = 0;
    if (!채우는중) { 채우는중 = true; setTimeout(칸조각채우기, 0); }
  }
  function 칸조각채우기() {
    const 시작 = performance.now();
    while (채울자리 < 상품칸들.length) {
      const [td, 이름, 종류, 코드] = 상품칸들[채울자리++];
      if (채울종류.has(종류) && td.isConnected !== false && !td.querySelector(".vp-goods-list") && 상품칸채우기(td, 이름, 종류, 코드)) 바뀐셈[종류]++;
      if (performance.now() - 시작 > 25) { setTimeout(칸조각채우기, 0); return; }
    }
    채우는중 = false;
    const 종류들 = [...채울종류]; 채울종류 = new Set();
    for (const 종류 of 종류들) 모자란것찾기(종류);
    상품칸셈적기();
  }
  async function 모자란것찾기(종류) {
    const 끝 = 종류 === "단품" ? window.VP단품표끝 : window.VP상품표끝;
    const 찾기 = 종류 === "단품" ? window.VP단품찾기 : window.VP상품찾기;
    if (!끝 || !끝() || !찾기) return;
    const 모음 = new Map();
    for (const [td, 이름, 칸종류, 코드] of 상품칸들) {
      if (칸종류 !== 종류 || td.isConnected === false || td.querySelector(".vp-goods-list") || !String(이름).trim()) continue;
      const 열쇠 = 종류 + "\u0001" + 이름 + "\u0001" + 코드;
      if (찾아본것.has(열쇠) || 모음.has(열쇠)) continue;
      모음.set(열쇠, { 이름, 코드 });
    }
    if (!모음.size) return;
    for (const 열쇠 of 모음.keys()) 찾아본것.add(열쇠);
    let 늘 = 0;
    try { 늘 = await 찾기([...모음.values()]); } catch (e) { /* 못 찾으면 글자 그대로 */ }
    window.VP말?.("이름찾기:" + 종류 + " " + 모음.size + "가지 물음 · 이름표에 " + 늘 + "가지 더함");
    if (늘) 칸채우기예약(종류);
  }
  window.addEventListener("vp상품단추준비", () => {
    window.VP말?.("상품단추:준비 상품" + (window.VP상품목록몇개?.() ?? "?") + "가지");
    칸채우기예약("상품");
  });
  window.addEventListener("vp단품단추준비", () => {
    window.VP말?.("단품단추:준비 단품" + (window.VP단품목록몇개?.() ?? "?") + "가지");
    칸채우기예약("단품");
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
    단품칸자리 = heads.indexOf("단품명");
    상품코드자리 = heads.indexOf("상품코드");
    단품코드자리 = heads.indexOf("단품코드");
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

  function addRows(heads, rows, 더있다 = false) {
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
      const 주문 = 주문칸자리 >= 0 ? String(row[주문칸자리] == null ? "" : row[주문칸자리]).trim() : "";
      그린머리.forEach((c, i) => {
        const td = tr.insertCell();
        const 값 = row[i] === undefined ? "" : row[i];
        if ((i === 상품칸자리 || i === 단품칸자리) && String(값).trim()) {
          /* ⚠⚠ 10-24 사장님(한 글자도 안 고침): 「배송관리와 cs관리 등 벤더피아의 데이터 목록을 불러올때 목록의 상품명/단품명
               단품관리/상품관리에 있는 동일한 기능의 해당 명칭 버튼이 나타나게 해주세요. 목록의 줄 자체를 클릭했을때는 현재의 상담
               버튼 과 동일한 정보가 나타나야 하며 목록의 상품명/단품명 클릭시에는 단품관리/상품관리/재고관리의 해당 상품/단품명
               처럼 작동해야 합니다.」
             → 상품명 칸 = 상품관리의 그 이름 단추, 단품명 칸 = 단품관리의 그 이름 단추(누르면 그 상세). 상담은 **줄의 다른 곳**을
               누를 때(아래 `tr` 누름) — 이름 단추는 누름을 가로채 상담이 안 열린다.
             (옛 기록: 10-15 에 상품명 누름을 잡는 결로 가로채 상담 판을 같이 열었다가 상세를 덮어 「잘못된 작동」 이라 하셨다.
              지금은 같은 일이 안 생긴다 — 단추가 `stopPropagation` 하고, 줄의 누름은 단추·링크 위에서는 건너뛴다.) */
          const 종류 = i === 상품칸자리 ? "상품" : "단품";
          td.className = "vp-상품칸" + (종류 === "단품" ? " vp-단품칸" : "") + (i === 0 ? " vp-first" : "");
          const 코드자리 = 종류 === "단품" ? 단품코드자리 : 상품코드자리;
          const 코드 = 코드자리 >= 0 && row[코드자리] != null ? String(row[코드자리]).trim() : "";
          상품칸들.push([td, 값, 종류, 코드]);
          // 칸은 줄을 다 그린 뒤 쪼개서 채운다 (`칸채우기예약`)
          td.textContent = 값;
          return;
        }
        td.textContent = 값;
        if (i === 0) td.className = "vp-first";
        /* 상담 이력 단추 — **그 칸 안에** 작게 붙인다. 칸을 새로 내지 않는다
           (배송관리 23칸을 밀어내지 않는다 — 사장님이 그 칸을 다 보셔야 한다). */
        if (i === 주문칸자리 && String(값).trim()) {
          td.classList.add("vp-주문칸");
          상담단추(td, String(값).trim(),
                   상품칸자리 >= 0 ? String(row[상품칸자리] == null ? "" : row[상품칸자리]).trim() : "",
                   row, 그린머리);
        }
      });
      /* 10-24 줄 자체를 누르면 「상담」 단추와 **같은 판**(고객정보·이력·교환·반품·AS 접수)이 열린다.
         이름 단추·상담 단추·링크 위의 누름은 그것들이 따로 처리한다. 글자를 끌어 고르던 중이면 안 연다(복사하실 때). */
      if (주문) {
        tr.classList.add("vp-줄상담");
        tr.title = "줄을 누르면 상담 이력 · 교환 · 반품 · AS 접수";
        tr.addEventListener("click", (e) => {
          if (e.target.closest && e.target.closest("button, a, input, select, textarea, label")) return;
          if (String(window.getSelection ? window.getSelection() : "").trim()) return;
          상담판열기(주문, 상품칸자리 >= 0 ? String(row[상품칸자리] == null ? "" : row[상품칸자리]).trim() : "", row, 그린머리);
        });
      }
    }
    if (!더있다) {
      if (상품칸들.length) 칸채우기예약();
      상품칸셈적기();
    }
  }

  // 벤더피아에 매번 직접 조회한다 (항상 최신 상태).
  // 50줄을 먼저 받아 바로 보여주고, 더 있으면 600줄까지 이어서 받는다. 결과는 도착하는 대로 덧붙인다.
  if (bar) bar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchId = ++currentSearch;
    const { filters, variants, local } = plan(bar.q.value);
    const dates = { dcStartDt: bar.from.value, dcEndDt: bar.to.value };

    tbody = null; 그린머리 = null; 상품칸들 = []; 채울자리 = 0; 상품칸자리 = -1; 단품칸자리 = -1; 단추된것 = 0; 머리본것 = null;
    상담칸들.length = 0; 주문칸자리 = -1; 상담판닫기();
    table.replaceChildren();
    const seen = new Set();
    let shown = 0;
    let cut = false;

    const take = async (r) => {
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
      /* 10-26 [새 지시 뒤 요청·멈춤] — 600줄을 한꺼번에 그리지 않는다: 80줄씩 그리고 쉰다(한 번 멈춤 0.2초 이하). 새 조회가 시작되면 멈춘다. */
      /* 조각 사이에 브라우저가 반쯤 그린 표를 매번 다시 배치하면(600줄×30칸) 오히려 300ms 더 걸린다(재서 확인) → 줄이 많으면 표를 숨기고 그려 마지막에 한 번만 배치한다. */
      const 숨김 = fresh.length > 160 && table.style.display !== "none";
      if (숨김) table.style.display = "none";
      try {
        for (let i = 0; i < fresh.length; i += 150) {
          if (searchId !== currentSearch) return;
          addRows(r.heads, fresh.slice(i, i + 150), i + 150 < fresh.length);
          shown += Math.min(150, fresh.length - i);
          if (i + 150 < fresh.length) await new Promise((r) => setTimeout(r, 0));
        }
      } finally { if (숨김) table.style.display = ""; }
    };
    const status = (busy) => {
      window.VP조회중 = !!busy;       // 10-26 — goods.js 가 뒤 일(서류 자료)을 조회가 끝난 뒤로 미루려고 본다
      note.textContent = `${shown.toLocaleString()}건` +
        (busy ? " · 더 찾는 중…" : cut ? " · 결과가 많아 일부만 받아왔습니다. 기간을 좁혀 보세요." : "");
    };

    try {
      status(true);
      const more = [];
      for (const [, fields] of variants) {
        const r = await fetchList({ ...dates, ...알약값(), ...filters, ...fields }, "50");
        if (searchId !== currentSearch) return;
        await take(r);
        status(true);
        if (Number(r.count.replace(/,/g, "")) > r.rows.length) more.push(fields);
      }
      for (const fields of more) {
        const r = await fetchList({ ...dates, ...알약값(), ...filters, ...fields }, CS전용 ? "700" : "600");   // 주문관리 보기 칸에는 600 이 없다(…500·700)
        if (searchId !== currentSearch) return;
        await take(r);
        if (Number(r.count.replace(/,/g, "")) > r.rows.length) cut = true;
        status(true);
      }
      status(false);
      if (!shown) table.textContent = "결과가 없습니다.";
    } catch (err) {
      if (searchId === currentSearch) { window.VP조회중 = false; note.textContent = "조회에 실패했습니다. 다시 로그인한 뒤 시도해 주세요."; }
    }
  });

  /* ── CS등록 = 주문관리 목록 그대로 (10-24) ──────────────────────────
     1) 페이지에 이미 그려진 주문관리 표를 읽는다. AJAX·UpdatePanel 로 늦게 올 수 있어 0·1·2초에 본다.
     2) 끝내 비면 이 페이지 조회 단추와 같은 기본값으로 한 번만 조회(조회만).
     3) 그래도 못 읽으면 빈 표 + 까닭 한 줄(표 수·각 표 줄/칸·첫 줄 글·iframe 수). 배송목록으로 대신하지 않는다. */
  function CS목록그리기(heads, rows) {
    /* 10-25 사장님 「이미 34.53 이야」: 이름 단추·줄 클릭 상담·끌기가 CS등록에서도 되게 — 배송관리와 **같은 그리는 길**(`머리알기`+`addRows`)을 쓴다.
       (0.34.51 이 목록만 그리느라 이 길을 걷어 냈었다. 칸 이름·차례·값은 여전히 주문관리 것 그대로.) */
    tbody = null; 그린머리 = null; 상품칸들 = []; 채울자리 = 0; 단추된것 = 0; 머리본것 = null; 상담칸들.length = 0;
    머리알기(heads);
    addRows(heads, rows);
  }
  async function CS목록보이기() {
    const 기다림 = (ms) => new Promise((r) => setTimeout(r, ms));
    const 모양 = (docs) => "표 " + docs.reduce((n, d) => n + d.querySelectorAll("table").length, 0) + "개 "
      + (docs.some((d) => d.getElementById("oGrid")) ? "#oGrid 있음" : "#oGrid 없음") + " · iframe " + document.querySelectorAll("iframe,frame").length + "개";
    let 읽음 = null, 쪽 = null;
    try {
      for (const ms of [0, 1000, 1000]) {
        if (ms) await 기다림(ms);
        쪽 = 쪽에서읽기();
        if (쪽.r && 쪽.r.rows.length) { 읽음 = 쪽.r; break; }
      }
      let 까닭 = "";
      if (currentSearch) return;                         // 그사이 검색창으로 조회했으면 그 결과를 덮지 않는다
      if (읽음) {
        window.VP말?.("CS등록:쪽 표 읽음 칸" + 읽음.heads.length + " 줄" + 읽음.rows.length);
      } else {
        window.VP말?.("CS등록:쪽 표 비어 기본값 조회");
        const q = await 기본값조회();
        if (q.r && q.r.rows.length) 읽음 = q.r;
        else {
          읽음 = (q.r && q.r.heads.length ? q.r : null) || (쪽.r && 쪽.r.heads.length ? 쪽.r : null);
          까닭 = ((읽음 && 읽음.까닭) || "") + " " + (q.까닭 || "") + " · 지금 쪽 " + 모양(쪽.docs) + (q.doc ? " · 조회 응답 " + 모양([q.doc]) : "");
        }
      }
      if (currentSearch) return;
      if (읽음) CS목록그리기(읽음.heads, 읽음.rows);
      if (읽음 && 읽음.합계) note.textContent = 읽음.합계;      // 벤더피아 합계 글 그대로(주문수량 / 행수 / 매입금액)
      if (!읽음 || !읽음.rows.length) {
        note.textContent = (읽음 && 읽음.합계) || (읽음 ? "주문관리 목록에 줄이 없습니다." : "주문관리 목록을 읽지 못했습니다.");
        진단적기(까닭 || "");
      }
    } catch (err) {
      if (currentSearch) return;
      note.textContent = "주문관리 목록을 읽지 못했습니다.";
      진단적기("터짐: " + (err && err.message ? err.message : err) + (쪽 ? " · 지금 쪽 " + 모양(쪽.docs) : ""));
    }
  }
  if (CS전용) CS목록보이기();
})();
