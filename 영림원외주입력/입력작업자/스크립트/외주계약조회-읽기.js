// 외주계약조회(501604) 읽기 → 폼 erp_contracts 꼴(외주거래처 하나 = 문서 하나, 계약 줄 = rows). 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다.
// 열기: 생산/외주 › [외주] 외주계약 › 외주계약조회 (메뉴 검색 「외주계약」). 화면 번호 501604.
// 쓰는 법: 조건 사업단위 본사·「최종계약」 체크(기본) 그대로 화면 「조회」 → await ylw.read.contracts('T' 또는 'all')
// 칸(11-01 실제 화면, 시트 SS1): 외주거래처=CustName · 품명=ItemName · 품번=ItemNo · 공정차수=ProcRevName · 공정=ProcName · 외주품명=AssyItemName ·
//   외주품번호=AssyItemNo · 외주품규격 · 통화명=CurrName · 정산기준=PriceTypeName · 외주단가=Price · 적용시작일=StartDate · 적용종료일 · 품목대/중/소분류.
// ⚠ 이 화면에는 폼의 **단위·부가세포함여부** 칸이 없다 → 읽지 않고 비교도 안 한다. 사업단위는 조회조건 값(본사)을 넣는다.
// 확인: 2026-11-01 — 테스트 서버에 계약 0줄(조회 결과 없음). 줄이 있는 화면으로는 아직 못 읽어 봄 → 처음 쓸 때 한 줄을 화면과 맞춰 볼 것.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '501604';
  R.contracts = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS1');
    R.need(sh, ['외주거래처', '품명', '품번', '공정차수', '공정', '외주품명', '외주품번호', '통화명', '정산기준', '외주단가', '적용시작일']);
    const all = Y.rows(sh), by = {};
    for (const r of all) {
      if (only === 'T' && !R.isT(r.CustName)) continue;
      const v = R.s(r.CustName);
      (by[v] = by[v] || { unit: '본사', vendor: v, rows: [] }).rows.push({
        prod: R.s(r.ItemName), pcode: R.s(r.ItemNo), seq: R.s(r.ProcRevName), proc: R.s(r.ProcName), oname: R.s(r.AssyItemName), ocode: R.s(r.AssyItemNo),
        cur: R.s(r.CurrName), basis: R.s(r.PriceTypeName), price: R.s(r.Price), from: R.ymd(r.StartDate),
      });
    }
    const rows = Object.values(by);
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: ['단위', '부가세포함여부'], screen: '외주계약조회',
      labels: { unit: '사업단위', vendor: '외주거래처', prod: '제품명', pcode: '제품번호', seq: '공정차수', proc: '공정', oname: '외주품명', ocode: '외주품번', cur: '통화', basis: '정산기준', price: '외주단가', from: '적용시작일' } };
  };
  return '외주계약조회 읽기 준비됨';
})();
