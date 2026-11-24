// 부서등록(2720412) 읽기 → 폼 erp_depts 꼴(폼 v333 「1 부서등록」 — 불러오기 요청 대상). 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: await ylw.read.depts('T' 또는 'all') → [{name, short, eng, engShort, start, end, level, type, tel, fax, tax, unit, local, email, memo, sort}]
//   화면 「조회」를 다시 누른다(조회조건 부서사용기간 = 오늘~ · 사용여부 사용 — 화면 처음 값 그대로).
// 칸(11-24 실제 화면, 시트 SS1, 왼쪽→끝): 부서명=DeptName · 부서약명=AbrDeptName · 영문부서명=EngDeptName · 영문부서약명=AbrEngDeptName · 시작일=BegDate ·
//   종료일=EndDate · 코스트센터=CCtrName(회색) · 부서레벨=UMDeptAttrName · 부서구분=SMDeptTypeName · 부서전화번호=DeptPhone · 부서팩스번호=DeptFax ·
//   사업자번호명=TaxName · 사업단위=BizUnitName · 지방세사업장=LocalBizName · 이메일=Email · 비고=Remark · 순서=DispSeq · 현재사용여부=IsUse(회색).
// 확인: 2026-11-24 — 11줄(전사·고객관리·경영지원·기획·마케팅·웹온라인·웹디자인·해외영업·R&D·포천·대표이사), 칸 이름만 봄(이 스크립트로 불러오기는 아직 안 함).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '2720412';
  R.depts = async (only) => {
    await R.open(PAGE);
    await R.query(PAGE);
    const sh = Y.sheet(PAGE, 'SS1');
    R.need(sh, ['부서명', '부서약명', '영문부서명', '영문부서약명', '시작일', '종료일', '부서레벨', '부서구분', '부서전화번호', '부서팩스번호', '사업자번호명', '사업단위', '지방세사업장', '이메일', '비고', '순서']);
    const rows = Y.rows(sh).filter((r) => only !== 'T' || R.isT(r.DeptName)).map((r) => ({
      name: R.s(r.DeptName), short: R.s(r.AbrDeptName), eng: R.s(r.EngDeptName), engShort: R.s(r.AbrEngDeptName),
      start: R.ymd(r.BegDate), end: R.ymd(r.EndDate), level: R.s(r.UMDeptAttrName), type: R.s(r.SMDeptTypeName),
      tel: R.s(r.DeptPhone), fax: R.s(r.DeptFax), tax: R.s(r.TaxName), unit: R.s(r.BizUnitName), local: R.s(r.LocalBizName),
      email: R.s(r.Email), memo: R.s(r.Remark), sort: R.s(r.DispSeq),
    }));
    return { rows, 읽음: rows.length, 확인못함: [], screen: '부서등록',
      labels: { name: '부서명', short: '부서약명', eng: '영문부서명', engShort: '영문부서약명', start: '시작일', end: '종료일', level: '부서레벨', type: '부서구분', tel: '부서전화번호', fax: '부서팩스번호', tax: '사업자번호명', unit: '사업단위', local: '지방세사업장', email: '이메일', memo: '비고', sort: '순서' } };
  };
  return '부서등록 읽기 준비됨';
})();
