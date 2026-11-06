// 제품별공정별소요자재일괄등록(525162) 「일괄삭제」 탭 읽기 → 폼 erp_itemmats 꼴 {name, code, spec, rev}. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 화면에서 「일괄삭제」 탭을 누르고 제품번호 조건(T 는 `T-al`)을 넣어 화면 「조회」 → await ylw.read.itemmats('T' 또는 'all').
//   ⛔ 이 화면 초록 단추는 「일괄등록」(탭을 바꾸면 일괄삭제). 조회와 탭만 누른다. 선택 칸도 누르지 않는다.
// 칸(11-06 실제 화면, 시트 SS2, 끝까지 봄): 선택=Select · 제품명=ItemName · 제품번호=ItemNo · 제품규격=Spec · 공정차수=ProcRev · 생산진행=IsProg(체크, 폼 칸 없음 — 안 읽음).
// ⚠ 이 표에 없는 폼 칸 = bomRev · flow · procs · mats → 확인못함에 적는다. 그래서 폼에 없는 품목은 이 칸 없이 문서가 생긴다(11-06 은 18건 모두 폼에 있어 넣음 0).
// 확인: 2026-11-06 T-al 18줄.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '525162';
  R.itemmats = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS2');
    R.need(sh, ['제품명', '제품번호', '제품규격', '공정차수']);
    const all = Y.rows(sh);
    if (!all.length) throw new Error('일괄삭제 탭에 줄이 없음 — 탭을 누르고 제품번호 조건을 넣어 화면 「조회」를 먼저');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.ItemName) || R.isT(r.ItemNo)).map((r) => ({ name: R.s(r.ItemName), code: R.s(r.ItemNo), spec: R.s(r.Spec), rev: R.s(r.ProcRev) }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: ['BOM차수', '공정흐름유형', '공정 표', '소요자재 표'], screen: '제품별공정별소요자재일괄등록', labels: { name: '제품명', code: '제품번호', spec: '제품규격', rev: '공정차수' } };
  };
  return '소요자재 읽기 준비됨';
})();
