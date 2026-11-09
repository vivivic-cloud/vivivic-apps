// 제품별공정별워크센터일괄수정(525145) 읽기 → 폼 erp_itemwcs 꼴 {name, code, spec, rev, proc, wc, tunit, time, rank}. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 화면을 열고 조건 사업단위 본사 그대로(나머지 빈칸) 화면 「조회」 → await ylw.read.itemwcs('T' 또는 'all'). 저장 단추는 누르지 않는다.
// 칸(11-10 실제 화면, 시트 SS, 끝까지 봄): 품목자산분류=AssetName · 품목대/중/소분류=ItemClassL/M/SName · 제품명=ItemName · 제품번호=ItemNo · 제품규격=Spec ·
//   공정차수=ProcRev · 최종차수여부=IsLastProcRev · 공정=ProcName · 공정품명=AssyItemName · 공정품번=AssyItemNo · 공정품규격=AssyItemSpec · 단위=UnitName ·
//   워크센터=WorkCenterName · 워크센터구분=SMWorkCenterTypeName · 외주거래처=CustName · 시간단위=TimeUnitName · 표준작업시간=StdWorkTime · 우선순위=Ranking · 검사여부=IsQC · 품목내부코드=AssyItemSeq.
// ⚠ 이 표에는 폼의 **공정순서(seq)** 칸이 없다 → 읽지 않고 비교도 안 한다(확인못함). 열쇠 = 품번|공정차수|공정|워크센터(불러오기-공통.js I.STEPS.itemwcs).
// T 거르기: 제품명 또는 제품번호가 T 로 시작. 확인: 2026-11-10 — 전체 637줄 · T 85줄.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '525145';
  R.itemwcs = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS');
    R.need(sh, ['제품명', '제품번호', '제품규격', '공정차수', '공정', '워크센터', '시간단위', '표준작업시간', '우선순위']);
    const all = Y.rows(sh);
    if (!all.length) throw new Error('제품별공정별워크센터일괄수정에 줄이 없음 — 화면 「조회」를 먼저');
    const num = (v) => { const s = R.s(v).replace(/,/g, ''); return s === '' ? '' : +s; };
    const rows = all.filter((r) => only !== 'T' || R.isT(r.ItemName) || R.isT(r.ItemNo)).map((r) => ({
      name: R.s(r.ItemName), code: R.s(r.ItemNo), spec: R.s(r.Spec), rev: R.s(r.ProcRev), proc: R.s(r.ProcName),
      wc: R.s(r.WorkCenterName), tunit: R.s(r.TimeUnitName), time: num(r.StdWorkTime), rank: num(r.Ranking),
    }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: ['공정순서'], screen: '제품별공정별워크센터일괄수정',
      labels: { name: '제품명', code: '제품번호', spec: '제품규격', rev: '공정차수', proc: '공정', wc: '워크센터', tunit: '시간단위', time: '표준작업시간', rank: '우선순위' } };
  };
  return '제품별공정별워크센터 읽기 준비됨';
})();
