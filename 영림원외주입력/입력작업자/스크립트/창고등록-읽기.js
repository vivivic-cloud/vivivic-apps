// 창고등록(501081) 읽기 — **참고용**(폼에 창고 단계가 없다 → 불러오기 요청 대상 아님, 폼에 넣지 않는다). 먼저 공통.js → 불러오기-공통.js.
// 쓰는 법: 화면을 열면 조건 사업단위 본사로 저절로 조회된다(11-01) → await ylw.read.warehouses('T' 또는 'all') → [{name, group, dept, cust, consign, emp, type, notUse}]
// 칸(11-01 실제 화면, 시트 SS1): 창고명=WHName · 창고그룹=CostWHName · 현장부서=DeptName · 외주거래처=OutCustName · 위탁거래처=ConsignCustName ·
//   담당자=EmpName · 창고구분=WHTypeName · 사용안함=IsNotUse · 최종작업일시 · 최종작업자.
// 확인: 2026-11-01 — 28줄.
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
    return { rows, 읽음: rows.length, screen: '창고등록' };
  };
  return '창고등록 읽기 준비됨';
})();
