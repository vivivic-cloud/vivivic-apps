// 창고등록(501081) 읽기 → 폼 erp_warehouses 꼴(폼 v325 「2 창고등록」 — 불러오기 요청 대상). 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 화면을 열면 조건 사업단위 본사로 저절로 조회된다(11-01) → await ylw.read.warehouses('T' 또는 'all') → [{name, group, dept, cust, consign, emp, type, notUse}]
// 칸(11-01 실제 화면, 시트 SS1): 창고명=WHName · 창고그룹=CostWHName · 현장부서=DeptName · 외주거래처=OutCustName · 위탁거래처=ConsignCustName ·
//   담당자=EmpName · 창고구분=WHTypeName · 사용안함=IsNotUse · 최종작업일시 · 최종작업자.
// 확인: 2026-11-01 — 28줄. 2026-11-22 — 6줄(아인가구·오케이물류·AMT·T경기·T에이엠티·T조혼), 칸 그대로.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '501081';
  R.warehouses = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS1');
    R.need(sh, ['창고명', '창고그룹', '현장부서', '외주거래처', '위탁거래처', '담당자', '창고구분', '사용안함']);
    const rows = Y.rows(sh).filter((r) => only !== 'T' || R.isT(r.WHName)).map((r) => ({
      name: R.s(r.WHName), group: R.s(r.CostWHName), dept: R.s(r.DeptName), cust: R.s(r.OutCustName), consign: R.s(r.ConsignCustName),
      emp: R.s(r.EmpName), type: R.s(r.WHTypeName), notUse: R.bool(r.IsNotUse),
    }));
    return { rows, 읽음: rows.length, 확인못함: [], screen: '창고등록',
      labels: { name: '창고명', group: '창고그룹', dept: '현장부서', cust: '외주거래처', consign: '위탁거래처', emp: '담당자', type: '창고구분', notUse: '사용안함' } };
  };
  return '창고등록 읽기 준비됨';
})();
