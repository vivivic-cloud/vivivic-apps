// 자재조회(500261) 읽기 → 폼 erp_materials 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 자재조회 「자재정보」 탭에서 화면 「조회」를 **손(진짜 클릭)으로** 누른다(스크립트 click() 으로는 조회가 안 됐다, 11-02) → await ylw.read.materials('T' 또는 'all')
//   조건 「자재상태」 기본 「사용」 — 다른 상태까지 보려면 그 칸을 비우고 조회(11-02 비워도 71줄 그대로였다).
// 칸(11-02 실제 화면, 시트 SS1): 자재명=ItemName · 자재번호=ItemNo · 규격=Spec · 품목자산분류=AssetName · 기준단위=UnitName · 자재상태=SMStatusName ·
//   내외자구분=SMInOutKindName · 중요도=SMABCName · 자재대/중/소분류=ItemClassLName/MName/SName · 영문명=ItemEngName (그 밖 관리부서·출고구분·대표자재·BOM등록… 은 폼 칸이 없어 안 읽음).
//   폼 small 은 「대 > 중 > 소」 경로(폼 v26) → 세 분류 칸으로 만든다.
// 확인: 2026-11-02 — 71줄(원자재, 대분류 ed·fm·md·pb), T 로 시작하는 자재 0.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500261';
  R.materials = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS1');
    R.need(sh, ['자재명', '자재번호', '규격', '품목자산분류', '기준단위', '자재상태', '내외자구분', '중요도', '자재대분류', '자재중분류', '자재소분류', '영문명']);
    const all = Y.rows(sh);
    if (!all.length) throw new Error('자재조회에 줄이 없음 — 화면 「조회」를 먼저(손으로)');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.ItemName) || R.isT(r.ItemNo)).map((r) => ({
      name: R.s(r.ItemName), code: R.s(r.ItemNo), spec: R.s(r.Spec), eng: R.s(r.ItemEngName), asset: R.s(r.AssetName), state: R.s(r.SMStatusName),
      io: R.s(r.SMInOutKindName), imp: R.s(r.SMABCName), unit: R.s(r.UnitName),
      small: [r.ItemClassLName, r.ItemClassMName, r.ItemClassSName].map(R.s).join(' > '),
    }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '자재조회',
      labels: { name: '자재명', code: '자재번호', spec: '규격', eng: '영문명', asset: '품목자산분류', state: '자재상태', io: '내외자구분', imp: '중요도', unit: '기준단위', small: '자재소분류' } };
  };
  return '자재조회 읽기 준비됨';
})();
