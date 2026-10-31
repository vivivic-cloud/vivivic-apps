// 워크센터등록(500226) 읽기 → 폼 erp_workcenters 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만 — 등록 화면이지만 조회 표만 읽음).
// 쓰는 법: 화면을 열면 조건 「사업단위 본사」로 저절로 조회된다(11-01). 다른 조건을 넣었으면 비우고 「조회」 → await ylw.read.workcenters('T' 또는 'all')
// 칸(11-01 실제 화면을 오른쪽 끝까지, 시트 SS1): 워크센터=WorkCenterName · 생산부서=DeptName · 워크센터구분=SMWorkCenterTypeName · 외주거래처=CustName ·
//   Capa산정구분=SMCapatypeName · 시작일=StartDate · 종료일=EndDate · 자재출고창고=MatOutWhName · 제상품출고창고=GoodOutWHName · 납품창고=DelvWhName ·
//   현장창고=FieldWhName · 생산입고창고=ProdInWhName · 생산입고창고(반제품)=ProdInSemiWhName · 비고=Remark(폼에 칸 없음 — 안 읽음).
//   사업단위는 표에 칸이 없다 → 조회조건 사업단위(본사) 글자를 unit 으로 넣는다.
// ⚠ 시트 원본 정보(objOriSheetData)는 제상품출고창고·생산입고창고(반제품)를 「숨김」으로 적고 있지만 화면에는 보인다 → 보임 여부는 R.cols(Sheet) 로 본다.
// 확인: 2026-11-01 — 17줄(조립·가공·기존 외주 6곳·T 8곳 등).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500226';
  R.workcenters = async (only) => {
    const w = await R.open(PAGE), sh = Y.sheet(PAGE, 'SS1');
    R.need(sh, ['워크센터', '생산부서', '워크센터구분', '외주거래처', 'Capa산정구분', '시작일', '종료일', '자재출고창고', '제상품출고창고', '납품창고', '현장창고', '생산입고창고', '생산입고창고(반제품)']);
    const unit = R.s((w.document.getElementById('cmbBizUnitName_cmb') || {}).textContent);   // 조회조건 사업단위(11-01 「본사」)
    const all = Y.rows(sh);
    if (!all.length) throw new Error('워크센터등록에 줄이 없음 — 화면 「조회」를 먼저');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.WorkCenterName)).map((r) => ({
      unit, name: R.s(r.WorkCenterName), dept: R.s(r.DeptName), kind: R.s(r.SMWorkCenterTypeName), vendor: R.s(r.CustName),
      capa: R.s(r.SMCapatypeName), start: R.ymd(r.StartDate), end: R.ymd(r.EndDate), whMat: R.s(r.MatOutWhName), whProd: R.s(r.GoodOutWHName),
      whDeliv: R.s(r.DelvWhName), whSite: R.s(r.FieldWhName), whIn: R.s(r.ProdInWhName), whSemi: R.s(r.ProdInSemiWhName),
    }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '워크센터등록',
      labels: { name: '워크센터', dept: '생산부서', kind: '워크센터구분', vendor: '외주거래처', capa: 'Capa산정구분', start: '시작일', end: '종료일', whMat: '자재출고창고', whProd: '제상품출고창고', whDeliv: '납품창고', whSite: '현장창고', whIn: '생산입고창고', whSemi: '생산입고창고(반제품)' } };
  };
  return '워크센터등록 읽기 준비됨';
})();
