// 품목별공정흐름유형등록(500272) 읽기 → 폼 erp_itemflows 꼴 {name, code, spec, flow}. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 화면 조건을 비우고 「조회」(스크립트 click() 이 안 먹으면 손으로) → await ylw.read.itemflows('T' 또는 'all')
// 칸(11-01·11-04 실제 화면, 시트 SS): 품명=ItemName · 품번=ItemNo · 규격=Spec · 공정흐름유형=ProcTypeName. 한 줄 = 품목 하나 + 흐름 하나(폼 문서 하나).
// T 거르기: 품명 또는 품번이 T 로 시작.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500272';
  R.itemflows = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS');
    R.need(sh, ['품명', '품번', '규격', '공정흐름유형']);
    const all = Y.rows(sh).filter((r) => !r.WorkingTag || r.WorkingTag === 'U');
    if (!all.length) throw new Error('품목별공정흐름유형등록에 줄이 없음 — 화면 「조회」를 먼저');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.ItemName) || R.isT(r.ItemNo))
      .map((r) => ({ name: R.s(r.ItemName), code: R.s(r.ItemNo), spec: R.s(r.Spec), flow: R.s(r.ProcTypeName) }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '품목별공정흐름유형등록',
      labels: { name: '품명', code: '품번', spec: '규격', flow: '공정흐름유형' } };
  };
  return '품목별공정흐름유형등록 읽기 준비됨';
})();
