// 구매단가등록(501868) 읽기 → 폼 erp_purprices 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 화면을 열고 머리 「최종단가만조회」를 끈 뒤(켜 두면 품목마다 최종 단가만 나온다) → await ylw.read.purprices('T' 또는 'all')
// 입력 화면이다 — 저장·행삭제를 누르지 않는다. 스크립트는 「조회」만 누른다.
// 칸(11-08 실제 화면, 시트 SS): 구매거래처=CustName · 품명=ItemName · 품번=ItemNo · 규격=Spec · 단위=UnitName · 내외자구분=ImpTypeName ·
//   통화=CurrName · 단가=Price · 구매최소수량=MinQty · 구매간격수량=StepQty · 적용시작일=StartDate · 특이사항=Remark · 제조사=MakerName · 조달일수=LeadTime.
//   폼 칸 없음(안 읽음): 선택 · 중단여부 · 구매처번호 · 대표단가여부 · 적용종료일 · 품목자산분류·분류 · 중단사유 등.
// T 범위 = 구매거래처 또는 품번이 T 로 시작.
// 확인: 2026-11-08 — 4줄(모두 T).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '501868';
  const n = (v) => { const s = R.s(v).replace(/,/g, ''); return s === '' || +s === 0 ? '' : String(+s); };   // 영림원은 빈 칸을 0 으로 준다(11-08, 폼 빈칸과 가짜 차이)
  const d = (v) => { const s = R.s(v).replace(/\D/g, ''); return s.length === 8 ? s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6) : R.s(v); };
  R.purprices = async (only) => {
    await R.open(PAGE);
    const w = Y.win(PAGE), last = w.document.getElementById('chkIsLast_input');
    if (last && last.checked) throw new Error('구매단가등록 「최종단가만조회」가 켜져 있음 — 끄고 다시');
    const sh = Y.sheet(PAGE, 'SS');
    await R.query(PAGE);
    R.need(sh, ['구매거래처', '품명', '품번', '규격', '단위', '내외자구분', '통화', '단가', '구매최소수량', '구매간격수량', '적용시작일', '특이사항', '제조사', '조달일수']);
    const all = Y.rows(sh).filter((r) => r.ItemNo);
    const rows = all.filter((r) => only !== 'T' || R.isT(r.CustName) || R.isT(r.ItemNo)).map((r) => ({
      vendor: R.s(r.CustName), name: R.s(r.ItemName), code: R.s(r.ItemNo), spec: R.s(r.Spec), unit: R.s(r.UnitName),
      io: R.s(r.ImpTypeName), cur: R.s(r.CurrName), price: R.s(r.Price) === '' ? '' : String(+R.s(r.Price).replace(/,/g, '')), minqty: n(r.MinQty), stepqty: n(r.StepQty),
      from: d(r.StartDate), memo: R.s(r.Remark), maker: R.s(r.MakerName), days: n(r.LeadTime),
    }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '구매단가등록',
      labels: { vendor: '구매거래처', name: '품명', code: '품번', spec: '규격', unit: '단위', io: '내외자구분', cur: '통화', price: '단가', minqty: '구매최소수량', stepqty: '구매간격수량', from: '적용시작일', memo: '특이사항', maker: '제조사', days: '조달일수' } };
  };
  return '구매단가등록 읽기 준비됨';
})();
