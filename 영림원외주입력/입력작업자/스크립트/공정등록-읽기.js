// 공정등록(500173) 읽기 → 폼 erp_processes 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만 — 조회 표만 읽음).
// 쓰는 법: 화면을 열면 저절로 조회된다(11-01). → await ylw.read.processes('T' 또는 'all')
// 칸(11-01 실제 화면, 시트 SS): 중단=IsStop(폼 칸 없음 — 안 읽음) · 공정명=ProcName · 특이사항=Remark · 공정검사여부=IsProcQc · 첨부파일명·파일삭제(폼 칸 없음).
// ⚠ 조회 단추와 저장 단추가 붙어 있다 — 손으로 「조회」를 누를 때는 확대로 자리를 본다(11-01 잘못 저장 사례, 화면별-요령).
// 확인: 2026-11-01 — 9줄(조립·가공·T 7개).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500173';
  R.processes = async (only) => {
    await R.open(PAGE);
    const sh = Y.sheet(PAGE, 'SS');
    R.need(sh, ['공정명', '특이사항', '공정검사여부']);
    const all = Y.rows(sh);
    if (!all.length) throw new Error('공정등록에 줄이 없음 — 화면 「조회」를 먼저');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.ProcName)).map((r) => ({ name: R.s(r.ProcName), memo: R.s(r.Remark), inspect: R.bool(r.IsProcQc) }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '공정등록', labels: { name: '공정명', memo: '특이사항', inspect: '공정검사여부' } };
  };
  return '공정등록 읽기 준비됨';
})();
