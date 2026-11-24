// 부서등록(2720412) 채우기 — 저장은 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: 폼 v333 「1 부서등록」(erp_depts) 대기 문서 값 그대로 [{name, short, eng, engShort, start, end, level, type, tel, fax, tax, unit, local, email, memo, sort}].
// 쓰는 법: 화면 열고 「조회」 → await ylw.dept.fill(목록) → 모두맞음 확인 → 「저장」 → 「조회」 → ylw.dept.verify(목록).
// 시트: SS1. 붙이는 칸 = 부서명부터 화면 차례 [부서명, 부서약명, 영문부서명, 영문부서약명, 시작일, 종료일, (코스트센터 회색 — 빈칸), 부서레벨, 부서구분,
//   부서전화번호, 부서팩스번호, 사업자번호명, 사업단위, 지방세사업장, 이메일, 비고, 순서]. 드롭다운(부서레벨·부서구분·사업자번호명·사업단위)은 글자로 코드가 잡히는지 대조로 본다.
// ⚠ 11-24 화면만 봄 — 붙여넣기·저장 시험 안 함. 첫 등록 때 회색 코스트센터 칸에서 붙여넣기가 밀리는지 먼저 한 줄로 확인한다.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '2720412';
  const SPEC = [
    { col: 'DeptName', label: '부서명' },
    { col: 'AbrDeptName', label: '부서약명' },
    { col: 'EngDeptName', label: '영문부서명' },
    { col: 'AbrEngDeptName', label: '영문부서약명' },
    { col: 'BegDate', label: '시작일', kind: 'date' },
    { col: 'EndDate', label: '종료일', kind: 'date' },
    { col: 'UMDeptAttrName', label: '부서레벨', code: 'UMDeptAttr' },
    { col: 'SMDeptTypeName', label: '부서구분', code: 'SMDeptType' },
    { col: 'DeptPhone', label: '부서전화번호' },
    { col: 'DeptFax', label: '부서팩스번호' },
    { col: 'TaxName', label: '사업자번호명', code: 'TaxUnit' },
    { col: 'BizUnitName', label: '사업단위', code: 'BizUnit' },
    { col: 'LocalBizName', label: '지방세사업장' },
    { col: 'Email', label: '이메일' },
    { col: 'Remark', label: '비고' },
    { col: 'DispSeq', label: '순서' },
  ];
  const exp = (v) => ({ DeptName: v.name, AbrDeptName: v.short || '', EngDeptName: v.eng || '', AbrEngDeptName: v.engShort || '', BegDate: v.start || '', EndDate: v.end || '',
    UMDeptAttrName: v.level || '', SMDeptTypeName: v.type || '', DeptPhone: v.tel || '', DeptFax: v.fax || '', TaxName: v.tax || '', BizUnitName: v.unit || '',
    LocalBizName: v.local || '', Email: v.email || '', Remark: v.memo || '', DispSeq: v.sort || '' });
  const cells = (v) => [v.name, v.short, v.eng, v.engShort, v.start, v.end, '', v.level, v.type, v.tel, v.fax, v.tax, v.unit, v.local, v.email, v.memo, v.sort];
  Y.dept = {
    SPEC,
    async fill(list) {
      const sh = Y.sheet(PAGE, 'SS1');
      const have = new Set(Y.rows(sh).map((r) => r.DeptName));
      const table = [], skipped = [], put = [];
      for (const v of list) {
        if (have.has(v.name)) { skipped.push(v.name + '(이미 있음)'); continue; }
        const row0 = Y.nextRow(sh);
        await Y.paste(sh, row0, 'DeptName', cells(v), 1200);
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
        const r = rows.find((x) => x.DeptName === v.name);
        if (!r) { table.push({ 행: '-', 칸: v.name, 폼: '있어야 함', 화면: '없음', 맞음: false }); continue; }
        table.push(...Y.check(sh, +r.IDX_NO, SPEC, exp(v)));
        if (r.WorkingTag) table.push({ 행: r.IDX_NO, 칸: '저장', 폼: '저장됨', 화면: '저장 안 됨(' + r.WorkingTag + ')', 맞음: false });
      }
      return Y.report(table);
    },
  };
  return '부서등록 준비됨';
})();
