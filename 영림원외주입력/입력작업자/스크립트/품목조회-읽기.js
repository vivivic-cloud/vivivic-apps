// 품목조회(500260) 읽기 → 폼 erp_items 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 품목조회 「품목정보」 탭, 조건은 기본(품목상태 「사용」, 나머지 빈칸) 그대로 화면 「조회」 → await ylw.read.items('T' 또는 'all')
//   ⚠ 1,500줄이 넘는다(11-01 사용 1,568개). 「전체」는 폼에 그만큼 문서가 생긴다 — 폼에서 「건수 먼저 보기」로 센 뒤 사장님이 고른다.
//   품명 조건에 글자를 넣고 조회하면 그것만 나온다(T 만 볼 때 조회 자체를 줄이려면 품명 조건 「T」 — 앞글자 찾기인지 포함 찾기인지는 확인 못 함. 거르기는 스크립트가 다시 한다).
// 칸(11-01 실제 화면, 시트 SS1): 품명=ItemName · 품번=ItemNo · 규격=Spec · 품목자산분류=AssetName · 기준단위=UnitName · 품목상태=SMStatusName ·
//   내외자구분=SMInOutKindName · 중요도=SMABCName · 품목소분류=ItemClassSName · 영문명=ItemEngName · 대표품목=IsSTDItem(체크 0/1).
//   그 밖 칸(관리부서·품목대/중분류·출고구분·세트품목·BOM등록·Lot 관리 …)은 폼에 칸이 없어 안 읽는다.
// 확인: 2026-11-01 — 사용 1,568개, T 로 시작하는 품명 0개.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500260';
  R.items = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS1');
    R.need(sh, ['품명', '품번', '규격', '품목자산분류', '기준단위', '품목상태', '내외자구분', '중요도', '품목소분류', '영문명', '대표품목']);
    const all = Y.rows(sh);
    if (!all.length) throw new Error('품목조회에 줄이 없음 — 화면 「조회」를 먼저');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.ItemName)).map((r) => ({
      name: R.s(r.ItemName), code: R.s(r.ItemNo), spec: R.s(r.Spec), eng: R.s(r.ItemEngName), asset: R.s(r.AssetName), status: R.s(r.SMStatusName),
      unit: R.s(r.UnitName), small: R.s(r.ItemClassSName), io: R.s(r.SMInOutKindName), imp: R.s(r.SMABCName), rep: R.bool(r.IsSTDItem),
    }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '품목조회',
      labels: { name: '품명', code: '품번', spec: '규격', eng: '영문명', asset: '품목자산분류', status: '품목상태', unit: '기준단위', small: '품목소분류', io: '내외자구분', imp: '중요도', rep: '대표품목' } };
  };
  return '품목조회 읽기 준비됨';
})();
