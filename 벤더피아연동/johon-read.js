// 조혼가구 프로그램 화면(깃 vivivic-apps/조혼가구)에서 돈다 (페이지와 같은 자리, MAIN).
// 그 화면이 불러온 엑셀(currentFullData)로 다음 둘을 만들어 확장 프로그램 쪽(johon-save.js)에 넘긴다.
//  parts: 모든 거래처 탭의 단품명 검색(ING단품명) 항목 [거래처, ING단품명, ing단품코드]
//  cards: 단품코드 → [[거래처, ING단품명, 부속들]] — 에이엠티 발주확정목록 부속카드와 같은 방식으로 모은 부속
//  jundo: 「전도방지」 공통부속 — 에이엠티 기본 재단도면이 잔재 자리에 함께 앉히는 부속
(() => {
  const TABS = ["조혼가구", "아인가구", "본사", "럭스디자인", "유한가구"];  // 조혼가구 프로그램의 거래처 탭 (ing발주처)
  const IDENTITY = ["대분류", "중분류", "소분류", "상품색상"];          // 에이엠티 IDENTITY_HEADERS
  const norm = (v) => (v == null || String(v).trim() === "" || String(v).trim() === "선택없음") ? "선택없음" : String(v).trim();
  const text = (v) => String(v ?? "").trim();

  function build(data) {
    const h = data[0];
    const at = (name) => h.indexOf(name);
    const rows = data.slice(1);
    // 거래처 탭은 조혼가구 화면의 것을 쓴다. 에이엠티 화면은 이 값이 비어 있어(같은 엑셀을 쓰지만 탭이 없다)
    // 그대로 쓰면 목록이 0개가 되어 저장된 값을 덮어쓴다 — 비었으면 정해 둔 거래처 탭을 쓴다.
    const fromPage = typeof pageToSupplierMap === "object" ? Object.values(pageToSupplierMap) : [];
    const tabs = fromPage.length ? fromPage : TABS;
    const parts = [];
    const cards = {};
    const seen = new Set();
    for (const r of rows) {
      const supplier = text(r[at("ing발주처")]);
      const name = text(r[0]);
      if (!name || !tabs.includes(supplier) || seen.has(supplier + "|" + name)) continue;
      seen.add(supplier + "|" + name);
      const code = text(r[at("ing단품코드")]);
      parts.push([supplier, name, code]);

      // 에이엠티 renderTlConfParts: 같은 거래처 + 대분류·중분류·소분류·상품색상이 같은 행이 부속 하나씩
      const id = IDENTITY.map((c) => norm(r[at(c)]));
      const same = rows.filter((x) => norm(x[at("ing발주처")]) === supplier && IDENTITY.every((c, i) => norm(x[at(c)]) === id[i]));
      const list = same.map((x) => {
        const edge = String(x[at("총엣지면")] || "").toLowerCase();
        const boring = x[at("보링수량")];
        return {
          name: text(x[at("부속명")]),
          plate: text(x[at("원장명")]),
          color: text(x[at("마감색상")]),
          finish: text(x[at("마감")]),
          w: parseFloat(x[at("재단W")]) || 0,
          d: parseFloat(x[at("재단D")]) || 0,
          edge: ["non", "x", ""].includes(edge) ? 0 : (parseFloat(edge) || 0),
          boring: String(boring || "").includes("입력대기") || parseFloat(boring) > 0,
          nc: String(x[at("NC유무")] || "").toUpperCase() === "O",
          perSet: parseFloat(x[at("세트별소모량")]) || 1,
          amt: norm(x[at("공급처")]) === "AMT",  // 조혼가구와 같은 잣대: 공급처가 AMT 인 부속
          // 에이엠티 엣지공정지시서 도면에 쓰는 값 (원장 그대로)
          grain: text(x[at("결보호")]),
          wEdge: text(x[at("W엣지면")]),
          dEdge: text(x[at("D엣지면")]),
          ura: text(x[at("우라홈")]),
          uraPos: text(x[at("우라홈위치")]),
        };
      });
      (cards[code.toLowerCase()] ||= []).push([supplier, name, list]);
    }
    // 에이엠티 _전도방지행 이 찾는 줄: 부속명 전도방지 · 공급처 공통부속
    const jundo = rows
      .filter((x) => text(x[at("부속명")]) === "전도방지" && norm(x[at("공급처")]) === "공통부속")
      .map((x) => ({
        plate: text(x[at("원장명")]),
        coating: text(x[at("마감")]),
        color: text(x[at("마감색상")]),
        w: parseFloat(x[at("재단W")]) || 0,
        d: parseFloat(x[at("재단D")]) || 0,
        grain: text(x[at("결보호")]),
      }));
    return { parts, cards, jundo };
  }

  // 엑셀은 로그인 뒤에 늦게 온다 — 올 때까지 기다렸다가, 바뀌면 다시 보낸다
  let sent = null;
  setInterval(() => {
    let data;
    try { data = currentFullData; } catch (e) { return; }  // eslint-disable-line no-undef
    if (!Array.isArray(data) || data.length < 2 || data === sent) return;
    sent = data;
    const built = build(data);
    if (!built.parts.length) return;  // 만들 것이 없으면 저장된 값을 건드리지 않는다
    window.postMessage({ type: "vp-johon", ...built }, location.origin);
  }, 2000);
})();
