// 워크센터등록(500226) 채우기 — 저장은 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: 폼 erp_workcenters 대기 자료 배열 [{unit, name, dept, kind, vendor, capa, start, end, whMat, whProd, whDeliv, whSite, whIn, whSemi}].
//   unit(사업단위)은 표에 칸이 없다 — 위 조회조건(본사)을 따른다. 본사가 아니면 넣지 않고 건너뜀으로 돌려준다.
// 쓰는 법: 화면 열고 「조회」 → await ylw.wc.fill(목록) → 모두맞음 확인 → 「저장」 → 「조회」 → ylw.wc.verify(목록).
// 시트: SS1. 붙이는 칸: 워크센터부터 화면 순서 그대로 14칸(끝 비고는 빈 값). 생산부서·워크센터구분·외주거래처·Capa·창고 6칸은 이름으로 코드가 잡힌다.
// 숨은 원가센터(CCtrName)는 화면 칸이 없어 넣지 않는다(11-01 보니 저장된 T워크센터 8개는 영림원이 같은 이름 원가센터를 붙여 둠 — 대조 안 함).
// 확인: 2026-11-01 (저장 없이 시험, 「조회」로 버림).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500226';
  const SPEC = [ // 화면 칸 왼쪽→끝
    { col: 'WorkCenterName', label: '워크센터' },
    { col: 'DeptName', label: '생산부서', code: 'DeptSeq' },
    { col: 'SMWorkCenterTypeName', label: '워크센터구분', code: 'SMWorkCenterType' },
    { col: 'CustName', label: '외주거래처', code: 'CustSeq' },
    { col: 'SMCapatypeName', label: 'Capa산정구분', code: 'SMCapaType' },
    { col: 'StartDate', label: '시작일', kind: 'date' },
    { col: 'EndDate', label: '종료일', kind: 'date' },
    { col: 'MatOutWhName', label: '자재출고창고', code: 'MatOutWhSeq' },
    { col: 'GoodOutWHName', label: '제상품출고창고', code: 'GoodOutWHSeq' },
    { col: 'DelvWhName', label: '납품창고', code: 'DelvWhSeq' },
    { col: 'FieldWhName', label: '현장창고', code: 'FieldWhSeq' },
    { col: 'ProdInWhName', label: '생산입고창고', code: 'ProdInWhSeq' },
    { col: 'ProdInSemiWhName', label: '생산입고창고(반제품)', code: 'ProdInSemiWhSeq' },
    { col: 'Remark', label: '비고' },
  ];
  const line = (v) => [v.name, v.dept, v.kind, v.vendor, v.capa, v.start, v.end, v.whMat, v.whProd, v.whDeliv, v.whSite, v.whIn, v.whSemi, ''];
  const exp = (v) => Object.fromEntries(SPEC.map((s, i) => [s.col, line(v)[i] || '']));
  Y.wc = {
    SPEC,
    async fill(list) {
      const sh = Y.sheet(PAGE, 'SS1');
      const have = new Set(Y.rows(sh).map((r) => r.WorkCenterName));
      const table = [], skipped = [], put = [];
      for (const v of list) {
        if (have.has(v.name)) { skipped.push(v.name + '(이미 있음)'); continue; }
        if (v.unit && v.unit !== '본사') { skipped.push(v.name + '(사업단위 ' + v.unit + ' — 조회조건을 바꿔야 함)'); continue; }
        const row0 = Y.nextRow(sh);
        await Y.paste(sh, row0, 'WorkCenterName', line(v), 1500);
        table.push(...Y.check(sh, row0 + 1, SPEC, exp(v)));
        put.push(v.name);
        have.add(v.name);
      }
      return Y.report(table, { 넣은것: put, 건너뜀: skipped });
    },
    verify(list) {
      const sh = Y.sheet(PAGE, 'SS1');
      const rows = Y.rows(sh), table = [];
      for (const v of list) {
        const r = rows.find((x) => x.WorkCenterName === v.name);
        if (!r) { table.push({ 행: '-', 칸: v.name, 폼: '있어야 함', 화면: '없음', 맞음: false }); continue; }
        table.push(...Y.check(sh, +r.IDX_NO, SPEC, exp(v)));
        if (r.WorkingTag) table.push({ 행: r.IDX_NO, 칸: '저장', 폼: '저장됨', 화면: '저장 안 됨(' + r.WorkingTag + ')', 맞음: false });
      }
      return Y.report(table);
    },
  };
  return '워크센터등록 준비됨';
})();
