// 품목등록업로드(500259) 채우기 — 표에 여러 건을 한 번에 붙여넣는다(엑셀 파일 받기·올리기 없음). 저장은 누르지 않는다. 먼저 공통.js 실행.
// 메뉴: 도입 › STEP1 거래처/품목/물류 초기설정 › 품목관리 「품목등록 업로드」.
// 받는 것: 폼 erp_items 문서 배열 [{name, code, spec, eng, asset, state, io, imp, unit, small('대 > 중 > 소' 경로)}].
// 쓰는 법: 화면 열고(빈 표) → await ylw.itemUp.fill(목록) → 대조표 모두맞음 → 「저장」 → 품목조회(500260) 「조회」 → ylw.itemUp.verify(목록).
// 줄마다 붙여넣기 둘: ItemName 부터 [품명, 품번, 규격, 영문명, 품목자산분류, 기준단위] + ItemClassSName 부터 [소분류 이름, 품목상태, 내외자구분, 중요도].
//   기준단위·소분류·자산분류·상태·내외자·중요도 모두 이름으로 코드가 잡히고 대·중분류는 저절로(11-01).
// 대조: 보이는 45칸 전부 — 폼 칸 10개는 폼 값, 나머지(세트품목여부·부서·담당자·부가세·소요량계산방식·출고구분 …)는 빈칸/0 이어야 맞음(폼에 없는 칸).
//   ⚠ 품목등록(500215)으로 넣으면 저장 때 부서 대표이사·담당자·과세·MRP·작업지시별 출고요청이 들어가지만, 이 표는 그 칸이 빈칸이다(11-01).
// 같은 화면 꼴이 BOM등록업로드에도 있다 — 열 이름만 바꿔 같은 방식으로 쓴다(공통.js 의 ylw.paste·ylw.check).
// 확인: 2026-11-01 T알렉스 18건.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500259';
  const path = (v) => String(v.small || '').split(' > ');
  const formCols = (v) => { const p = path(v); return { ItemName: v.name, ItemNo: v.code, Spec: v.spec || '', ItemEngName: v.eng || '', AssetName: v.asset, UnitName: v.unit, ItemClassLName: p[0], ItemClassMName: p[1], ItemClassSName: p[2], SMStatusName: v.state || '사용', SMInOutKindName: v.io || '내자', SMABCName: v.imp || 'A등급' }; };
  const spec = (sh) => {   // 화면에 보이는 칸 전부(왼쪽→끝)
    const S = sh.Sheet, o = sh.objOriSheetData || [], out = [];
    for (let i = 0; i < S.getColumnCount(); i++) { if (!S.getColumnVisible(i) || !(S.getColumnWidth(i) > 0)) continue; out.push({ col: o[i] ? o[i].DataField : '', label: String(S.getValue(0, i, 1)) }); }
    return out;
  };
  const blank = (x) => x == null || x === '' || String(x) === '0';
  Y.itemUp = {
    async fill(list) {
      const sh = Y.sheet(PAGE, 'SS1');
      if (Y.rows(sh).length) throw new Error('표가 비어 있지 않음 — 「신규」로 비우고 다시');
      for (let i = 0; i < list.length; i++) {
        const v = list[i];
        await Y.paste(sh, i, 'ItemName', [v.name, v.code, v.spec, v.eng, v.asset, v.unit], 1200);
        await Y.paste(sh, i, 'ItemClassSName', [path(v)[2], v.state || '사용', v.io || '내자', v.imp || 'A등급'], 1200);
      }
      return this.check(list);
    },
    check(list) {
      const sh = Y.sheet(PAGE, 'SS1'), rows = Y.rows(sh), cols = spec(sh), table = [];
      if (rows.length !== list.length) table.push({ 행: '-', 칸: '줄 수', 폼: String(list.length), 화면: String(rows.length), 맞음: false });
      list.forEach((v, i) => {
        const r = rows.find((x) => +x.IDX_NO === i + 1) || {}, f = formCols(v);
        for (const c of cols) {
          const want = c.col in f ? String(f[c.col]) : '', got = r[c.col] == null ? '' : String(r[c.col]);
          const ok = c.col in f ? want === got : blank(got);
          if (!ok) table.push({ 행: i + 1, 칸: c.label, 폼: want || '(빈칸)', 화면: got, 맞음: false });
        }
        for (const k of ['AssetSeq', 'UnitSeq', 'UMItemClassS', 'SMStatus']) if (blank(r[k])) table.push({ 행: i + 1, 칸: k + '(코드)', 폼: '잡혀야 함', 화면: String(r[k]), 맞음: false });
      });
      return { 모두맞음: !table.length, 틀린칸: table, 줄: rows.length, 칸수: cols.length };
    },
    // 품목조회(500260) 「조회」 뒤
    verify(list) {
      const rows = Y.rows(Y.win('500260').SS1), bad = [], seq = {};
      for (const v of list) {
        const r = rows.find((x) => String(x.ItemNo) === v.code), f = formCols(v);
        if (!r) { bad.push(v.code + ' 없음'); continue; }
        seq[v.code] = r.ItemSeq;
        for (const k of ['ItemName', 'Spec', 'AssetName', 'UnitName', 'ItemClassLName', 'ItemClassMName', 'ItemClassSName', 'SMStatusName', 'SMInOutKindName', 'SMABCName'])
          if (String(r[k] == null ? '' : r[k]) !== String(f[k])) bad.push(v.code + ' ' + k + ': 폼 ' + f[k] + ' / 영림원 ' + r[k]);
        if (String(r.ItemEngName || '') !== String(v.eng || '')) bad.push(v.code + ' 영문명');
      }
      return { 모두맞음: !bad.length, 틀린것: bad, ItemSeq: seq };
    },
  };
  return '품목등록업로드 준비됨';
})();
