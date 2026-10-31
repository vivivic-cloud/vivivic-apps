// 창고등록(501081) 채우기 — 저장은 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: [{name, cust, type, group?, dept?, consign?, emp?}] — 창고명·외주거래처(거래처명)·창고구분(예 '생산외주창고').
//   폼에 창고 단계는 없다. T워크센터 규칙(사장님-규칙 「T워크센터 창고」)대로 업체 이름 = 창고명 = 외주거래처로 만든다.
// 쓰는 법: 화면 열고 「조회」 → await ylw.wh.fill(목록) → 모두맞음 확인 → 「저장」 → 「조회」 → ylw.wh.verify(목록).
// 시트: SS1. 붙이는 칸: 창고명부터 [창고명, 창고그룹, 현장부서, 외주거래처, 위탁거래처, 담당자, 창고구분] — 외주거래처·창고구분은 이름으로 코드가 잡힌다.
// 사업단위는 위 조회조건(본사). 최종작업일시·최종작업자는 저장 때 영림원이 채운다(대조 안 함).
// 확인: 2026-11-01 (저장 없이 시험, 「조회」로 버림).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '501081';
  const SPEC = [
    { col: 'WHName', label: '창고명' },
    { col: 'CostWHName', label: '창고그룹' },
    { col: 'DeptName', label: '현장부서', code: 'DeptSeq' },
    { col: 'OutCustName', label: '외주거래처', code: 'OutCustSeq' },
    { col: 'ConsignCustName', label: '위탁거래처', code: 'ConsignCustSeq' },
    { col: 'EmpName', label: '담당자', code: 'EmpSeq' },
    { col: 'WHTypeName', label: '창고구분', code: 'WHType' },
    { col: 'IsNotUse', label: '사용안함', kind: 'chk' },
  ];
  const exp = (v) => ({ WHName: v.name, CostWHName: v.group || '', DeptName: v.dept || '', OutCustName: v.cust || '', ConsignCustName: v.consign || '', EmpName: v.emp || '', WHTypeName: v.type || '', IsNotUse: '0' });
  Y.wh = {
    SPEC,
    async fill(list) {
      const sh = Y.sheet(PAGE, 'SS1');
      const have = new Set(Y.rows(sh).map((r) => r.WHName));
      const table = [], skipped = [], put = [];
      for (const v of list) {
        if (have.has(v.name)) { skipped.push(v.name + '(이미 있음)'); continue; }
        const row0 = Y.nextRow(sh);
        await Y.paste(sh, row0, 'WHName', [v.name, v.group, v.dept, v.cust, v.consign, v.emp, v.type], 1200);
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
        const r = rows.find((x) => x.WHName === v.name);
        if (!r) { table.push({ 행: '-', 칸: v.name, 폼: '있어야 함', 화면: '없음', 맞음: false }); continue; }
        table.push(...Y.check(sh, +r.IDX_NO, SPEC, exp(v)));
        if (r.WorkingTag) table.push({ 행: r.IDX_NO, 칸: '저장', 폼: '저장됨', 화면: '저장 안 됨(' + r.WorkingTag + ')', 맞음: false });
      }
      return Y.report(table);
    },
  };
  return '창고등록 준비됨';
})();
