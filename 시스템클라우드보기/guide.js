// 로그인 뒤 SystemCloud 원래 화면을 숨기고, SystemCloud 실제 메뉴 순서대로 등록 단계를 정사각형 타일로 한 화면에 늘어놓는다
// (단계마다 한 줄). 긴 설명은 타일에 마우스를 올리면 보이고, 올린 내용은 팝업 표로 본다.
// 박스마다 그 단계의 엑셀 양식을 내려받고, 작성한 파일을 올려 볼 수 있다.
// 올린 내용은 이 브라우저(확장 프로그램 저장소)에만 둔다 — SystemCloud 에 등록하지는 않는다.
(() => {
  if (document.getElementById("btnLogin")) return;  // 로그인 화면에서는 띄우지 않는다
  if (window.top !== window) return;                 // 화면 안의 작은 창(iframe)에는 띄우지 않는다

  // { field 메뉴 위치, title 화면 이름, what 무엇을, note 참고(이미 있는 테스트 데이터 등),
  //   tpl 실제 SystemCloud 양식 파일(templates/) + 입력 시트, 또는 cols 화면의 칸(* 필수) / 둘 다 없으면 화면에서 직접 입력 }
  const STEPS = [
    { field: "도입 › STEP1 거래처/품목/물류 초기설정", title: "창고등록",
      what: "자재·제품을 둘 창고와 외주처 창고를 만듭니다.",
      note: "창고구분: 생산외주창고 / 기타관리창고 / 위탁창고. 외주처 창고는 외주거래처를 함께 지정합니다.",
      cols: ["창고명*", "창고그룹", "현장부서", "외주거래처", "위탁거래처", "담당자", "창고구분*", "사용안함"] },
    { field: "도입 › STEP1 거래처/품목/물류 초기설정", title: "초기거래처업로드",
      what: "매입처·외주처를 처음 한꺼번에 올립니다 (기본 칸만).",
      note: "SystemCloud 실제 양식 (DATA 시트에 작성).",
      tpl: { file: "RptWDAInitCustUpload.xlsx", sheet: "DATA" } },
    { field: "도입 › STEP1 거래처/품목/물류 초기설정", title: "거래처등록업로드",
      what: "거래처를 자세한 칸(국내외구분·담당자·주소 등)까지 올립니다.",
      note: "SystemCloud 실제 양식 (거래처등록(업로드) 시트에 작성).",
      tpl: { file: "RptWDACustUpload.xlsx", sheet: "거래처등록(업로드)" } },
    { field: "도입 › STEP1 거래처/품목/물류 초기설정", title: "초기품목업로드",
      what: "원자재·반제품·제품 품목을 처음 한꺼번에 올립니다 (기본 칸만).",
      note: "품목자산분류·품목소분류·기준단위가 먼저 있어야 합니다. 실제 양식 (DATA 시트).",
      tpl: { file: "RptWDAInitItemUpload.xlsx", sheet: "DATA" } },
    { field: "도입 › STEP1 거래처/품목/물류 초기설정", title: "품목등록업로드",
      what: "품목을 자세한 칸(내외자구분·생산유형·LOT 등)까지 올립니다.",
      note: "SystemCloud 실제 양식 (품목등록(업로드) 시트에 작성).",
      tpl: { file: "RptWDAItemUpload.xlsx", sheet: "품목등록(업로드)" } },
    { field: "도입 › STEP2 구매/수입 초기설정", title: "구매단가 업로드",
      what: "매입처·품목별 구매단가를 올립니다.",
      note: "SystemCloud 실제 양식 (DATA 시트).",
      tpl: { file: "RptWPUBaseBuyPriceUpload.xlsx", sheet: "DATA" } },
    { field: "도입 › STEP2 생산/품질 초기설정", title: "워크센터등록",
      what: "일하는 곳을 등록합니다. 자체생산 또는 사외외주.",
      note: "사외외주 워크센터는 외주거래처와 자재출고창고(외주처 창고)를 함께 지정합니다.",
      cols: ["워크센터*", "생산부서*", "워크센터구분*", "외주거래처", "Capa산정구분*", "시작일*", "종료일", "자재출고창고", "제상품출고창고", "납품창고"] },
    { field: "도입 › STEP2 생산/품질 초기설정", title: "공정등록",
      what: "일하는 단계를 등록합니다.",
      note: "",
      cols: ["공정명*", "특이사항", "공정검사여부", "중단"] },
    { field: "도입 › STEP2 생산/품질 초기설정", title: "공정흐름유형등록",
      what: "공정을 어떤 순서로 하는지 묶음(유형)을 만듭니다.",
      note: "유형 하나에 공정순서마다 한 줄씩.",
      cols: ["공정흐름유형*", "특이사항", "공정순서*", "공정*", "후속공정순서*", "최종공정여부", "공정검사여부"] },
    { field: "도입 › STEP2 생산/품질 초기설정", title: "품목별공정흐름유형등록",
      what: "품목마다 어느 공정흐름유형을 쓰는지 정합니다.",
      note: "품목과 공정흐름유형이 먼저 있어야 합니다.",
      cols: ["품명*", "품번", "규격", "공정흐름유형*"] },
    { field: "도입 › STEP2 생산/품질 초기설정", title: "BOM 업로드",
      what: "모품목 1개에 들어가는 하위품목과 소요량을 올립니다.",
      note: "SystemCloud 실제 양식 (BOM일괄업로드 시트). 조혼가구 엑셀의 세트별소모량이 소요량입니다.",
      tpl: { file: "RptWPDBOMMulti.xlsx", sheet: "BOM일괄업로드" } },
    { field: "도입 › STEP2 생산/품질 초기설정", title: "설비/금형 업로드",
      what: "기계(설비)·금형을 올립니다. 필요할 때만.",
      note: "SystemCloud 실제 양식 (Sheet1).",
      tpl: { file: "RptWPDToolMulti.xlsx", sheet: "Sheet1" } },
    { field: "도입 › STEP3 초기잔액 및 재고설정", title: "창고별기초재고업로드",
      what: "창고마다 지금 있는 품목 수량을 올립니다.",
      note: "SystemCloud 실제 양식 (DATA 시트).",
      tpl: { file: "RptWLGInitStockUpload.xlsx", sheet: "DATA" } },
    { field: "생산/외주 › 외주계약", title: "외주계약등록",
      what: "외주거래처마다 맡길 제품·공정과, 그때 보내는 소요자재를 등록합니다.",
      note: "정리용 양식은 소요자재마다 한 줄.",
      cols: ["외주거래처*", "제품명*", "제품번호", "공정차수*", "공정*", "외주품명", "외주품번", "통화*", "정산기준*", "부가세포함여부",
        "자재명*", "자재번호", "자재규격", "단위*", "소요량분자", "소요량분모*", "조달구분", "외부로스율", "유상사급여부"] },
    { field: "생산/외주 › 실제 업무 (화면에서 입력)", title: "주간생산계획 → 작업지시 / 외주발주",
      what: "주간생산계획입력 후, 자체생산은 작업지시, 외주는 외주발주입력.",
      note: "위 기준정보가 모두 있어야 막히지 않습니다." },
    { field: "생산/외주 › 실제 업무 (화면에서 입력)", title: "자재출고(외주)",
      what: "자재출고요청조회 → 자재출고입력. 외주처에 자재를 보냅니다.",
      note: "외주계약의 소요자재 × 발주수량만큼." },
    { field: "생산/외주 › 실제 업무 (화면에서 입력)", title: "외주활동",
      what: "외주납품조회 → 외주입고입력 → 자재투입처리 → 외주입고정산처리.",
      note: "입고되면 재고가 늘고 보낸 자재가 투입 처리됩니다." },
    { field: "생산/외주 › 실제 업무 (화면에서 입력)", title: "작업실적",
      what: "작업실적입력 → 생산입고입력. 자체생산 결과를 올립니다.",
      note: "" },
  ];

  // SystemCloud 현재 상태 — 각 화면을 조회해서 확인한 내용 (CHECKED 날짜 기준).
  // SystemCloud 조회 요청은 암호화되어 있어 확장 프로그램이 직접 다시 조회하지는 못한다.
  // level: done 등록됨 / part 일부 / empty 비어 있음 / unknown 확인 안 함 · todo: 무엇을 올리거나 입력할지
  const CHECKED = "2026-10-12";
  const STATE = {
    "창고등록": { level: "done", text: "19개 등록됨 — 경기산업·럭스디자인·아인가구·조혼가구·AMT·진아산업·이룸산업·로앤디자인 등 생산외주창고, 본사 창고 등 기타관리창고, 물류사 위탁창고.",
      todo: "새 창고가 생길 때만 창고등록 화면에서 한 줄 추가. SystemCloud에 창고 업로드 기능은 없습니다." },
    "초기거래처업로드": { level: "done", text: "거래처 173개 등록됨 (거래처조회, 상태 정상).",
      todo: "빠진 매입처·외주처가 있을 때만 DATA 시트에 한 줄씩 작성해 업로드." },
    "거래처등록업로드": { level: "done", text: "거래처 173개 등록됨 (거래처조회, 상태 정상).",
      todo: "담당자·주소 등 자세한 칸까지 한꺼번에 넣을 때만 사용." },
    "초기품목업로드": { level: "done", text: "품목 등록됨 — 공정흐름유형이 지정된 품목만 552개 (제품 17B-bk12 등, 부속, 원장, 엣지필름).",
      todo: "새 제품·부속·자재가 생길 때 DATA 시트에 작성해 업로드." },
    "품목등록업로드": { level: "done", text: "품목 등록됨 — 공정흐름유형이 지정된 품목만 552개.",
      todo: "내외자구분·생산유형 등 자세한 칸까지 넣을 때만 사용." },
    "구매단가 업로드": { level: "empty", text: "구매단가등록 조회 결과 없음.",
      todo: "원장(PB·MD 등)·엣지필름 같은 구매 자재마다 구매거래처·품목·단위·통화·단가·적용시작일을 DATA 시트에 작성해 업로드." },
    "워크센터등록": { level: "done", text: "8개 — 아인가구·AMT·경기산업·조혼가구·럭스디자인·진아산업(사외외주), 조립·가공(자체생산).",
      todo: "새 외주처가 생길 때만 한 줄 추가." },
    "공정등록": { level: "done", text: "2개 — 조립, 가공.",
      todo: "재단·엣지·보링 등으로 나눠 관리하려면 공정을 추가합니다. 지금 그대로 써도 됩니다." },
    "공정흐름유형등록": { level: "done", text: "2개 — 조립, 가공.",
      todo: "공정을 추가했다면 그 순서로 유형을 추가." },
    "품목별공정흐름유형등록": { level: "done", text: "552개 품목 지정됨 (제품 = 조립, 부속 = 가공).",
      todo: "새 품목을 등록하면 그 품목의 공정흐름유형을 지정." },
    "BOM 업로드": { level: "done", text: "BOM 있음 — 예: 17B-bk12 → 부속 → 원장(아이보리 18T 2440*1220) + 엣지필름.",
      todo: "새 제품이 생길 때 BOM일괄업로드 시트에 모품목·하위품목·소요량을 작성해 업로드." },
    "설비/금형 업로드": { level: "unknown", text: "확인 안 함.",
      todo: "설비를 관리할 때만. 생산·외주 진행에는 필요 없습니다." },
    "창고별기초재고업로드": { level: "empty", text: "기초재고 없음 — 창고별 재고조회에서 41개 품목, 원장·엣지 재고가 마이너스 (예: pb_18_ld_iv -21.63).",
      todo: "지금 창고마다 실제로 있는 원장·엣지·부속 수량을 DATA 시트(창고·품명·품번·규격·수량)에 작성해 업로드." },
    "외주계약등록": { level: "empty", text: "AMT: 등록대상 공정 499건 모두 미등록.",
      todo: "외주계약등록 화면에서 AMT 선택 → 「미등록공정 가져오기」 → 통화·정산기준 입력 → 「소요자재가져오기」 → 저장. 엑셀 없이 화면 버튼으로 채웁니다." },
    "주간생산계획 → 작업지시 / 외주발주": { level: "unknown", text: "확인 안 함.",
      todo: "외주계약이 끝난 뒤 주간생산계획입력 → 외주발주입력(AMT 등) / 작업지시(조립·가공)." },
    "자재출고(외주)": { level: "unknown", text: "확인 안 함.",
      todo: "외주발주 뒤 자재출고요청조회 → 자재출고입력." },
    "외주활동": { level: "unknown", text: "확인 안 함.",
      todo: "외주처 납품 뒤 외주납품조회 → 외주입고입력 → 자재투입처리 → 외주입고정산처리." },
    "작업실적": { level: "unknown", text: "확인 안 함.",
      todo: "자체생산(조립·가공) 뒤 작업실적입력 → 생산입고입력." },
  };
  const LEVEL = { done: "등록됨", part: "일부", empty: "비어 있음", unknown: "확인 안 함" };

  // 기존 자료를 가져올 SystemCloud 화면 (프로그램 번호, 목록 시트, 조회 전에 비울 조회조건).
  // map: 양식 칸 → 화면 목록의 칸. 실제 양식은 같은 항목코드끼리 자동으로 맞추고, 이름이 다른 것만 적는다.
  const ALIAS = { AddressBasic: "KorAddr1", BizAddressBasic: "BizAddr", UMCustClassName: "ChannelName", UMChannelName: "ChannelName",
    UMCustClassName1: "UMCountryName", MkCustName: "MKCustName", ItemRemark: "Remark" };
  const CUST = { seq: 500373, sheet: "SS1", screen: "거래처조회", clear: ["txtRegDateFr_dat"] };
  const ITEM = { seq: 500260, sheet: "SS1", screen: "품목조회" };
  const SOURCE = {
    "창고등록": { seq: 501081, sheet: "SS1", screen: "창고등록", map: { "창고명*": "WHName", "창고그룹": "CostWHName", "현장부서": "DeptName",
      "외주거래처": "OutCustName", "위탁거래처": "ConsignCustName", "담당자": "EmpName", "창고구분*": "WHTypeName", "사용안함": "IsNotUse" } },
    "초기거래처업로드": CUST,
    "거래처등록업로드": CUST,
    "초기품목업로드": ITEM,
    "품목등록업로드": ITEM,
    "구매단가 업로드": { seq: 501868, sheet: "SS", screen: "구매단가등록" },
    "워크센터등록": { seq: 500226, sheet: "SS1", screen: "워크센터등록", map: { "워크센터*": "WorkCenterName", "생산부서*": "DeptName",
      "워크센터구분*": "SMWorkCenterTypeName", "외주거래처": "CustName", "Capa산정구분*": "SMCapatypeName", "시작일*": "StartDate",
      "종료일": "EndDate", "자재출고창고": "MatOutWhName", "제상품출고창고": "GoodOutWHName", "납품창고": "DelvWhName" } },
    "공정등록": { seq: 500173, sheet: "SS", screen: "공정등록", map: { "공정명*": "ProcName", "특이사항": "Remark", "공정검사여부": "IsProcQc", "중단": "IsStop" } },
    "공정흐름유형등록": { seq: 500228, sheet: "SS1", screen: "공정흐름유형등록", map: { "공정흐름유형*": "ProcTypeName", "특이사항": "Remark" },
      note: "공정순서 등 상세 칸은 유형마다 따로 조회돼 비워 둡니다." },
    "품목별공정흐름유형등록": { seq: 500272, sheet: "SS", screen: "품목별공정흐름유형등록", map: { "품명*": "ItemName", "품번": "ItemNo", "규격": "Spec", "공정흐름유형*": "ProcTypeName" } },
  };
  // 기존 자료를 넣지 않는 양식과 그 까닭
  const NO_SOURCE = {
    "BOM 업로드": "BOM은 제품마다 따로 조회돼 빈 양식으로 내려받습니다.",
    "설비/금형 업로드": "빈 양식으로 내려받습니다.",
    "창고별기초재고업로드": "등록된 기초재고가 없어 빈 양식으로 내려받습니다.",
    "외주계약등록": "등록된 외주계약이 없어 빈 양식으로 내려받습니다.",
  };

  const box = document.createElement("div");
  box.id = "vp-guide";
  box.innerHTML = `<div class="vp-g-card"><div class="vp-g-head"><h1 class="vp-g-title">생산·외주 등록 순서</h1><button type="button" class="vp-g-reload">↻ 새로고침</button></div><p class="vp-g-sub">박스를 누르면 현재 상태와 올릴 내용이 보입니다. SystemCloud 상태는 ${CHECKED} 확인 기준.</p><div class="vp-g-list"></div></div>`;
  document.body.appendChild(box);
  document.documentElement.classList.add("vp-guide-on");
  const listEl = box.querySelector(".vp-g-list");
  box.querySelector(".vp-g-reload").addEventListener("click", () => location.reload());

  const fileName = (i) => `${String(i + 1).padStart(2, "0")}_${STEPS[i].title.replace(/[\\/:*?"<>|→]/g, "").replace(/\s+/g, "")}_양식.xlsx`;
  const storeKey = (i) => `vpGuideUpload${i + 1}`;
  const store = chrome.storage?.local;
  const tplUrl = (i) => chrome.runtime.getURL("templates/" + STEPS[i].tpl.file);
  const clean = (v) => String(v ?? "").replace(/\s*\(\d+\)\s*$/, "").replace(/\s+/g, " ").trim();
  const filled = (r) => r.some((v) => String(v).trim() !== "");
  const rowsOf = (sheet) => XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

  // SystemCloud 화면의 목록 읽기 (sc-read.js 에 부탁)
  let reqId = 0;
  function readScreen(src) {
    const id = ++reqId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { window.removeEventListener("message", on); reject(new Error("시간 초과")); }, 60000);
      function on(e) {
        if (e.source !== window || e.data?.vpg !== "readResult" || e.data.id !== id) return;
        clearTimeout(timer);
        window.removeEventListener("message", on);
        e.data.error ? reject(new Error(e.data.error)) : resolve(e.data);
      }
      window.addEventListener("message", on);
      window.postMessage({ vpg: "read", id, seq: src.seq, sheet: src.sheet, clear: src.clear }, location.origin);
    });
  }

  // 화면 목록을 양식 칸 순서의 줄들로: wants 는 [양식 칸, 화면 칸] 목록. 순번 칸은 1부터 번호.
  function pick(data, wants, key) {
    const idx = wants.map(([, code]) => data.columns.indexOf(code));
    const keyAt = data.columns.indexOf(key);
    return data.rows
      .filter((r) => keyAt < 0 || String(r[keyAt] ?? "").trim() !== "")
      .map((r, n) => wants.map(([want], k) => (/^(No|IDX_NO|순번)$/.test(want) ? n + 1 : idx[k] >= 0 ? r[idx[k]] ?? "" : "")));
  }

  // 양식 내려받기: SystemCloud 에 이미 등록된 자료를 채워서 내려받는다 (가져올 화면이 없으면 빈 양식)
  // 실제 양식은 원본 파일의 입력 시트 3줄부터 채우고, 정리용 양식은 2줄부터 채운다.
  async function download(i, noteEl) {
    const s = STEPS[i];
    const src = SOURCE[s.title];
    let data = null;
    if (src) {
      noteEl.textContent = `SystemCloud 「${src.screen}」에서 기존 자료를 불러오는 중…`;
      try { data = await readScreen(src); }
      catch (err) { noteEl.textContent = `기존 자료를 불러오지 못해 빈 양식으로 내려받습니다 (${err.message}).`; }
    }
    let rows = [];
    if (s.tpl) {
      const book = XLSX.read(await (await fetch(tplUrl(i))).arrayBuffer(), { type: "array" });
      if (data) {
        const sheet = book.Sheets[s.tpl.sheet];
        const [codes] = rowsOf(sheet);
        const wants = codes.map((c) => String(c).trim()).map((c) => [c, data.columns.includes(c) ? c : ALIAS[c] || c]);
        rows = pick(data, wants, wants.find(([, c]) => /Name$/.test(c) && data.columns.includes(c))?.[1]);
        // 양식에 들어 있던 예시 줄은 지우고 3줄부터 채운다
        const range = XLSX.utils.decode_range(sheet["!ref"]);
        for (const addr of Object.keys(sheet)) {
          if (addr[0] !== "!" && XLSX.utils.decode_cell(addr).r >= 2) delete sheet[addr];
        }
        range.e.r = 1;
        sheet["!ref"] = XLSX.utils.encode_range(range);
        if (rows.length) XLSX.utils.sheet_add_aoa(sheet, rows, { origin: 2 });
      }
      XLSX.writeFile(book, s.tpl.file);
    } else {
      if (data) rows = pick(data, s.cols.map((c) => [c, src.map[c]]), src.map[s.cols[0]]);
      const sheet = XLSX.utils.aoa_to_sheet([s.cols, ...rows]);
      sheet["!cols"] = s.cols.map((c) => ({ wch: Math.max(10, c.length * 2) }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, s.title.slice(0, 31));
      XLSX.writeFile(book, fileName(i));
    }
    if (data) noteEl.textContent = `SystemCloud 「${src.screen}」의 기존 자료 ${rows.length}줄을 넣어 내려받았습니다.${src.note ? " " + src.note : ""}`;
    else if (!src) noteEl.textContent = NO_SOURCE[s.title] || "";
  }

  // 올린 파일 확인
  // 실제 양식: 입력 시트의 1줄(항목코드)이 양식과 같아야 한다. 2줄은 칸 이름, 3줄부터 내용.
  // 화면 칸 양식: 첫 시트의 1줄이 칸 이름, 2줄부터 내용.
  async function upload(i, file, statusEl) {
    const s = STEPS[i];
    const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
    let head, body, missing;
    if (s.tpl) {
      const tpl = XLSX.read(await (await fetch(tplUrl(i))).arrayBuffer(), { type: "array", sheetRows: 2 });
      const [codes, names] = rowsOf(tpl.Sheets[s.tpl.sheet]);
      const want = codes.map((c) => String(c).trim()).filter(Boolean);
      const sheet = book.Sheets[s.tpl.sheet];
      if (!sheet) return bad(statusEl, `「${s.tpl.sheet}」 시트가 없습니다 — 받은 양식에 작성해 주세요`);
      const rows = rowsOf(sheet);
      const got = (rows[0] || []).map((c) => String(c).trim());
      missing = want.filter((c) => !got.includes(c)).map((c) => clean(names[codes.indexOf(c)]) || c);
      head = want.map((c) => clean(names[codes.indexOf(c)]) || c);
      const idx = want.map((c) => got.indexOf(c));
      body = rows.slice(2).filter(filled).map((r) => idx.map((k) => r[k] ?? ""));
    } else {
      const rows = rowsOf(book.Sheets[book.SheetNames[0]]).filter(filled);
      const got = (rows[0] || []).map((h) => String(h).trim());
      missing = s.cols.filter((c) => !got.includes(c));
      head = s.cols;
      const idx = s.cols.map((c) => got.indexOf(c));
      body = rows.slice(1).map((r) => idx.map((k) => r[k] ?? ""));
    }
    if (missing.length) return bad(statusEl, `양식과 칸이 다릅니다 — 없는 칸: ${missing.join(", ")}`);
    const saved = { name: file.name, at: Date.now(), head, body };
    await store?.set({ [storeKey(i)]: saved });
    showSaved(i, saved, statusEl);
  }

  function bad(statusEl, text) {
    statusEl.textContent = text;
    statusEl.classList.add("vp-g-bad");
  }

  function showSaved(i, saved, statusEl) {
    statusEl.classList.remove("vp-g-bad");
    statusEl.textContent = `✓ 올린 파일 ${saved.body.length}줄 · 보기`;
    statusEl.title = `${saved.name} · ${new Date(saved.at).toLocaleString("ko-KR")}`;
    statusEl.onclick = (e) => { e.stopPropagation(); openTable(i, saved); };
  }

  function popup(html) {
    const overlay = document.createElement("div");
    overlay.className = "vp-g-pop";
    overlay.innerHTML = `<div class="vp-g-pop-card">${html}</div>`;
    const close = () => overlay.remove();
    overlay.querySelector(".vp-g-x").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    box.appendChild(overlay);
    return overlay;
  }

  // 올린 내용 표
  function openTable(i, saved) {
    const overlay = popup(`<div class="vp-g-pop-head"><strong></strong><button type="button" class="vp-g-x" aria-label="닫기">×</button></div><div class="vp-g-pop-sub"></div><div class="vp-g-table"></div>`);
    overlay.querySelector("strong").textContent = `${i + 1}. ${STEPS[i].title}`;
    overlay.querySelector(".vp-g-pop-sub").textContent = `${saved.name} · ${saved.body.length}줄 · ${new Date(saved.at).toLocaleString("ko-KR")}`;
    const t = document.createElement("table");
    const hr = t.createTHead().insertRow();
    for (const h of saved.head) hr.appendChild(document.createElement("th")).textContent = h;
    const tb = t.createTBody();
    for (const r of saved.body) {
      const tr = tb.insertRow();
      saved.head.forEach((_, k) => { tr.insertCell().textContent = r[k] ?? ""; });
    }
    overlay.querySelector(".vp-g-table").appendChild(t);
  }

  // 양식의 칸 이름: 실제 양식은 입력 시트 2줄, 화면 칸 양식은 cols
  async function columnsOf(i) {
    const s = STEPS[i];
    if (!s.tpl) return s.cols || [];
    const tpl = XLSX.read(await (await fetch(tplUrl(i))).arrayBuffer(), { type: "array", sheetRows: 2 });
    const [, names = []] = rowsOf(tpl.Sheets[s.tpl.sheet]);
    return names.map(clean).filter(Boolean);
  }

  // 박스 상세: SystemCloud 현재 상태, 할 일, 양식 칸, 양식 내려받기 / 작성한 파일 올리기
  function openDetail(i, tileStatus) {
    const s = STEPS[i];
    const st = STATE[s.title] || { level: "unknown", text: "확인 안 함.", todo: s.what };
    const kind = s.tpl ? "SystemCloud 실제 양식" : s.cols ? "화면 칸으로 만든 정리용 양식 (SystemCloud에 바로 올릴 수 없음)" : "";
    const overlay = popup(`
      <div class="vp-g-pop-head"><strong></strong><button type="button" class="vp-g-x" aria-label="닫기">×</button></div>
      <div class="vp-g-pop-sub vp-g-path"></div>
      <section class="vp-g-sec"><h4>SystemCloud 현재 상태 <span class="vp-g-badge"></span></h4><p class="vp-g-now"></p></section>
      <section class="vp-g-sec"><h4>할 일</h4><p class="vp-g-todo"></p><p class="vp-g-note"></p></section>
      <section class="vp-g-sec vp-g-form"><h4>양식 <span class="vp-g-kind"></span></h4><div class="vp-g-cols">불러오는 중…</div>
        <div class="vp-g-actions">
          <button type="button" class="vp-g-down">양식 내려받기</button>
          <label class="vp-g-up">작성한 파일 올리기<input type="file" accept=".xlsx,.xls,.csv" hidden></label>
        </div>
        <p class="vp-g-note vp-g-dl"></p>
        <div class="vp-g-status"></div></section>`);
    overlay.querySelector("strong").textContent = `${String(i + 1).padStart(2, "0")}. ${s.title}`;
    overlay.querySelector(".vp-g-path").textContent = s.field;
    const badge = overlay.querySelector(".vp-g-badge");
    badge.textContent = LEVEL[st.level];
    badge.classList.add("vp-g-" + st.level);
    overlay.querySelector(".vp-g-now").textContent = `${st.text} (${CHECKED} 확인)`;
    overlay.querySelector(".vp-g-todo").textContent = st.todo;
    overlay.querySelector(".vp-g-note").textContent = s.note || "";
    const form = overlay.querySelector(".vp-g-form");
    if (!s.tpl && !s.cols) {
      form.innerHTML = `<h4>양식</h4><p class="vp-g-note">양식 없음 — SystemCloud 화면에서 직접 입력합니다.</p>`;
      return;
    }
    overlay.querySelector(".vp-g-kind").textContent = kind;
    columnsOf(i).then((cols) => {
      const el = overlay.querySelector(".vp-g-cols");
      el.replaceChildren(...cols.map((c) => Object.assign(document.createElement("span"), {
        className: c.endsWith("*") ? "vp-g-col vp-g-must" : "vp-g-col", textContent: c })));
    }).catch(() => { overlay.querySelector(".vp-g-cols").textContent = ""; });
    const statusEl = overlay.querySelector(".vp-g-status");
    const dlNote = overlay.querySelector(".vp-g-dl");
    dlNote.textContent = SOURCE[s.title] ? `내려받을 때 SystemCloud 「${SOURCE[s.title].screen}」의 기존 자료를 함께 넣습니다.` : NO_SOURCE[s.title] || "";
    const downBtn = overlay.querySelector(".vp-g-down");
    downBtn.addEventListener("click", async () => {
      downBtn.disabled = true;
      try { await download(i, dlNote); }
      catch (err) { dlNote.textContent = `내려받지 못했습니다 (${err.message}).`; }
      downBtn.disabled = false;
    });
    overlay.querySelector("input[type=file]").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      if (!file) return;
      statusEl.onclick = null;
      statusEl.textContent = "읽는 중…";
      try {
        await upload(i, file, statusEl);
        const got = await store?.get(storeKey(i));
        if (got?.[storeKey(i)]) showSaved(i, got[storeKey(i)], tileStatus);
      } catch (err) { bad(statusEl, "엑셀을 읽지 못했습니다"); }
    });
    store?.get(storeKey(i)).then((got) => { if (got[storeKey(i)]) showSaved(i, got[storeKey(i)], statusEl); });
  }

  // 단계(분야)마다 한 줄: 분야 이름 + 정사각형 타일들. 타일을 누르면 상세.
  let row = null;
  let lastField = "";
  STEPS.forEach((s, i) => {
    if (s.field !== lastField) {
      const section = listEl.appendChild(document.createElement("section"));
      section.className = "vp-g-row";
      section.appendChild(Object.assign(document.createElement("h2"), { className: "vp-g-field-head", textContent: s.field }));
      row = section.appendChild(document.createElement("div"));
      row.className = "vp-g-tiles";
      lastField = s.field;
    }
    const st = STATE[s.title] || { level: "unknown" };
    const tile = row.appendChild(document.createElement("article"));
    tile.className = "vp-g-step";
    if (!s.tpl && !s.cols) tile.classList.add("vp-g-screen");
    tile.tabIndex = 0;
    tile.innerHTML = `
      <div class="vp-g-top"><span class="vp-g-num"></span><span class="vp-g-badge"></span></div>
      <h3></h3>
      <p class="vp-g-what"></p>
      <div class="vp-g-foot"><span class="vp-g-kind"></span><div class="vp-g-status"></div></div>`;
    tile.querySelector(".vp-g-num").textContent = String(i + 1).padStart(2, "0");
    const badge = tile.querySelector(".vp-g-badge");
    badge.textContent = LEVEL[st.level];
    badge.classList.add("vp-g-" + st.level);
    tile.querySelector("h3").textContent = s.title;
    tile.querySelector(".vp-g-what").textContent = s.what;
    tile.querySelector(".vp-g-kind").textContent = s.tpl ? "실제 양식" : s.cols ? "정리용 양식" : "화면 입력";
    if (s.tpl) tile.querySelector(".vp-g-kind").classList.add("vp-g-real");
    const statusEl = tile.querySelector(".vp-g-status");
    tile.addEventListener("click", () => openDetail(i, statusEl));
    tile.addEventListener("keydown", (e) => { if (e.key === "Enter") openDetail(i, statusEl); });
    store?.get(storeKey(i)).then((got) => { if (got[storeKey(i)]) showSaved(i, got[storeKey(i)], statusEl); });
  });
})();
