/* 발주상품검색 — 조혼가구 「제품 발주」의 상품 찾기 · 고르기 · 부속 보기 논리를 한 벌로 뺀 것.

   사장님 11-01 말씀:
   「조혼가구 프로그램의 제품발주 입력논리를 이 입력폼으로 끌어들여야 하니 이 프로그램에서
     제품을 발주할때 사용하는 상품선택 논리와 해당 부속들의 정보가 나타나는 부분을 동일한
     루트로 사용할 수 있도록 품목페이지에 동일한 발주 상품검색 논리를 만들어봐」

   ⚠ 원본은 `조혼가구/조혼가구.html` 이다(11-01, 조혼가구 v1.9.4 기준 줄 번호):
       normalizeValue 2277 · buildDisplayName 2278 · IDENTITY_HEADERS·pageToSupplierMap 2266
       데이터 원천 initCloudDataSync 2401 · loadCloudExcelData 2413
       검색 handleSearch 3254 · 고르기 addOrderedProduct(직접검색) 3383 · 부속 카드 renderOrderParts 4783
     **조혼가구는 아직 이 파일을 부르지 않는다**(조혼가구 동작을 하나도 안 바꾸려고 베꼈다).
     둘 중 하나의 검색 규칙을 고치면 다른 쪽도 같이 고친다. 영림원외주입력(v28~) 이 이 파일을 쓴다.

   데이터 원천 — 조혼가구와 같다:
     파이어스토어 `artifacts/<appId>/public/data/excel_metadata` 중 timestamp 가 가장 늦은 문서의
     `downloadURL`(파이어베이스 스토리지의 원장 엑셀) → 첫 시트 → 줄 배열(1행 = 머리).
     익명 로그인으로 읽힌다(조혼가구도 익명).

   ⚠⚠ 이 파일은 화면을 그리지 않고, 쓰지 않는다. 금액 칸(CS기준원가·원장가격·엣지가공비 …)은 꺼내지 않는다
      (조혼가구 CLAUDE.md — 금액은 승인된 아이디만). */
(function (g) {
  'use strict';

  var IDENTITY_HEADERS = ['대분류', '중분류', '소분류', '상품색상'];
  /* 조혼가구 머리 탭 → ing발주처 값 (pageToSupplierMap 그대로) */
  var SUPPLIERS = [['조혼가구', '조혼가구'], ['아인가구', '아인가구'], ['ING', '본사'], ['럭스디자인', '럭스디자인'], ['유한가구', '유한가구']];
  /* 공통부속 판정 7항목(사장님) — 모두 같으면 같은 부속 */
  var SAME7 = ['원장명', '마감', '마감색상', '재단W', '재단D', 'W엣지면', 'D엣지면'];

  function normalizeValue(val) { if (val === null || val === undefined || String(val).trim() === '' || String(val).trim() === '선택없음') return '선택없음'; return String(val).trim(); }
  function buildDisplayName(v1, v2, v3, v4) { var n = (v1 !== '선택없음' ? v1 : '') + (v2 !== '선택없음' ? v2 : '') + (v3 !== '선택없음' ? v3 : ''); var c = (v4 !== '선택없음') ? '-' + v4 : ''; return (n + c) || '상품명 없음'; }

  function metaPath(appId) { return 'artifacts/' + (appId || 'vivivic-4b7ef') + '/public/data/excel_metadata'; }
  /* initCloudDataSync: 문서들 중 timestamp.seconds 가 가장 큰 것 */
  function latestMeta(docs) {
    if (!docs || !docs.length) return null;
    return docs.slice().sort(function (a, b) { return ((b.timestamp && b.timestamp.seconds) || 0) - ((a.timestamp && a.timestamp.seconds) || 0); })[0];
  }
  /* loadCloudExcelData: 첫 시트를 header:1 로 */
  function readSheet(XLSX, arrayBuffer) {
    var wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  }
  function col(h, name) { return h.indexOf(name); }
  function cell(h, row, name) { var i = col(h, name); return i < 0 ? undefined : row[i]; }

  /* handleSearch — 표시 이름(대+중+소-색상)에 검색어가 들어 있고 ing발주처 = 발주처 인 줄.
     같은 (ing단품명·대·중·소·색상) 은 한 번만. 목록에 보이는 글자는 ing단품명(r[0]). */
  function search(data, supplier, query) {
    if (!data || data.length < 2 || !String(query || '').trim()) return [];
    var h = data[0], q = String(query).toLowerCase(), seen = {}, out = [];
    data.slice(1).forEach(function (r) {
      if (!r) return;
      var name = buildDisplayName(normalizeValue(cell(h, r, '대분류')), normalizeValue(cell(h, r, '중분류')), normalizeValue(cell(h, r, '소분류')), normalizeValue(cell(h, r, '상품색상')));
      if (!(name.toLowerCase().indexOf(q) >= 0 && normalizeValue(cell(h, r, 'ing발주처')) === supplier)) return;
      var key = r[0] + '|' + cell(h, r, '대분류') + '|' + cell(h, r, '중분류') + '|' + cell(h, r, '소분류') + '|' + cell(h, r, '상품색상');
      if (seen[key]) return; seen[key] = 1;
      out.push({ code: r[0], v1: cell(h, r, '대분류'), v2: cell(h, r, '중분류'), v3: cell(h, r, '소분류'), v4: cell(h, r, '상품색상') });
    });
    return out;
  }

  /* addOrderedProduct(직접검색) — code 로 첫 줄을 찾아 대·중·소·색상을 정하고,
     발주처·code·대·중·소가 같고 (상품색상이 같거나 마감색상 any) 인 줄이 그 상품의 부속이다. */
  function pick(data, supplier, code) {
    if (!data || data.length < 2 || !code) return null;
    var h = data[0], body = data.slice(1);
    var first = body.filter(function (r) { return r && normalizeValue(cell(h, r, 'ing발주처')) === supplier && normalizeValue(r[0]) === code; })[0];
    if (!first) return null;
    var v1 = normalizeValue(cell(h, first, '대분류')), v2 = normalizeValue(cell(h, first, '중분류')), v3 = normalizeValue(cell(h, first, '소분류')), v4 = normalizeValue(cell(h, first, '상품색상'));
    var rows = [];
    data.forEach(function (r, i) {
      if (i === 0 || !r) return;
      var ok = normalizeValue(cell(h, r, 'ing발주처')) === supplier && normalizeValue(r[0]) === code &&
        normalizeValue(cell(h, r, '대분류')) === v1 && normalizeValue(cell(h, r, '중분류')) === v2 && normalizeValue(cell(h, r, '소분류')) === v3 &&
        (normalizeValue(cell(h, r, '상품색상')) === v4 || normalizeValue(cell(h, r, '마감색상')).toLowerCase() === 'any');
      if (ok) rows.push(i);
    });
    return { code: code, ingCode: String(cell(h, first, 'ing단품코드') || ''), supplier: supplier, criteria: [v1, v2, v3, v4],
      displayName: buildDisplayName(v1, v2, v3, v4), rowIndexes: rows };
  }

  /* renderOrderParts 의 부속 카드 한 장에 들어가는 값 + 영림원에 쓸 코드 칸(금액 칸은 없음).
     기본 발주 부속 = 공급처 AMT, AMT 외 공급처 부속 = 그 밖(조혼가구 첫 화면 규칙). 수량 = 세트별소모량 × 1 */
  function part(data, rowIndex) {
    var h = data[0], row = data[rowIndex]; if (!row) return null;
    var s = function (n) { var v = cell(h, row, n); return v == null ? '' : String(v); };
    var sup = normalizeValue(cell(h, row, '공급처'));
    return {
      rowIndex: rowIndex, 부속명: s('부속명'), 원장명: s('원장명') || '원장정보없음', 마감: s('마감') || '마감정보없음', 마감색상: s('마감색상'),
      w: parseFloat(cell(h, row, '재단W')), d: parseFloat(cell(h, row, '재단D')), 수량: parseFloat(cell(h, row, '세트별소모량')) || 0,
      공급처: sup, isAmt: sup === 'AMT',
      W엣지면: s('W엣지면'), D엣지면: s('D엣지면'), 총엣지면: s('총엣지면'), 보링수량: s('보링수량'), NC유무: s('NC유무'),
      부속코드2: s('부속코드2'), 재단부속코드: s('재단부속코드'), 엣지부속코드: s('엣지부속코드'), 보링부속코드: s('보링부속코드'), NC부속코드: s('NC부속코드'), 조립부속코드: s('조립부속코드'),
      same7: same7Key(data, rowIndex)
    };
  }
  function same7Key(data, rowIndex) {
    var h = data[0], row = data[rowIndex];
    return SAME7.map(function (n) { return normalizeValue(cell(h, row, n)); }).join('|');
  }
  /* 공통부속 단서 — 7항목 키 → 그 키를 쓰는 상품(ing단품명) 목록. 모든 발주처를 본다. */
  function same7Index(data) {
    var idx = {};
    if (!data || data.length < 2) return idx;
    for (var i = 1; i < data.length; i++) {
      var r = data[i]; if (!r || !r[0]) continue;
      var k = same7Key(data, i), c = normalizeValue(r[0]);
      (idx[k] = idx[k] || {})[c] = 1;
    }
    Object.keys(idx).forEach(function (k) { idx[k] = Object.keys(idx[k]); });
    return idx;
  }

  g.발주상품검색 = { IDENTITY_HEADERS: IDENTITY_HEADERS, SUPPLIERS: SUPPLIERS, SAME7: SAME7,
    normalizeValue: normalizeValue, buildDisplayName: buildDisplayName,
    metaPath: metaPath, latestMeta: latestMeta, readSheet: readSheet,
    search: search, pick: pick, part: part, same7Index: same7Index };
})(window);
