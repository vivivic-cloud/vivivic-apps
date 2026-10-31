// 공정흐름유형등록(500228) 읽기 → 폼 erp_flows 꼴 {name, memo, rows:[{seq,proc,next,last}]}. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다.
// 쓰는 법: 화면을 열면 저절로 조회된다. → await ylw.read.flows('T' 또는 'all')
//   흐름마다 **스크립트가 상세를 연다** = 사람이 행 번호를 더블클릭한 것과 같은 함수(SS1.kevent_dblclick 에 {sheet, sheetName:'Sheet1', sheetArea:2(행 머리), row, col:0})를 부른다(11-01 확인).
//   오른쪽 위 공정흐름유형 칸(txtProcTypeName_txt)이 그 이름이 될 때까지 기다린 뒤 상세 SS2 를 읽는다(흐름 하나 약 1~2초).
// ⚠ 상세를 연 뒤에는 왼쪽 표에 붙여넣기가 안 먹는다(채우기 스크립트 함정) — 읽기 뒤 흐름을 **넣을** 일이 있으면 화면 탭을 닫고 다시 연다.
// 칸(11-01 실제 화면): 왼쪽 SS1 = 중단 · 공정흐름유형=ProcTypeName · 특이사항=Remark / 오른쪽 SS2 = 공정순서=ProcNo · 공정=ProcName · 후속공정순서=ToProcNo ·
//   최종공정여부=IsLastProc · 공정검사여부(회색, 공정등록 값 — 안 읽음).
// 확인: 2026-11-01 — 14줄(조립·가공·T 12개), 상세 공정순서 순으로 읽음.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500228';
  R.flows = async (only) => {
    const w = await R.open(PAGE), s1 = Y.sheet(PAGE, 'SS1'), s2 = Y.sheet(PAGE, 'SS2');
    R.need(s1, ['공정흐름유형', '특이사항']);
    R.need(s2, ['공정순서', '공정', '후속공정순서', '최종공정여부']);
    const all = Y.rows(s1).filter((r) => !r.WorkingTag);
    if (!all.length) throw new Error('공정흐름유형등록에 줄이 없음 — 화면 「조회」를 먼저');
    const opened = () => w.document.getElementById('txtProcTypeName_txt').value;
    const rows = [];
    for (const r of all) {
      if (only === 'T' && !R.isT(r.ProcTypeName)) continue;
      const row0 = +r.IDX_NO - 1;
      s1.SetActiveCell(row0, 'ProcTypeName');
      s1.kevent_dblclick({ sheet: s1.Sheet, sheetName: 'Sheet1', sheetArea: 2, row: row0, col: 0 });
      let t = 0;
      while (opened() !== r.ProcTypeName && t < 40) { await Y.sleep(250); t++; }
      await Y.sleep(600);
      if (opened() !== r.ProcTypeName) throw new Error('「' + r.ProcTypeName + '」 상세가 안 열림');
      const d = Y.rows(s2).map((x) => ({ seq: +x.ProcNo, proc: R.s(x.ProcName), next: +x.ToProcNo, last: R.bool(x.IsLastProc) })).sort((a, b) => a.seq - b.seq);
      rows.push({ name: R.s(r.ProcTypeName), memo: R.s(r.Remark), rows: d });
    }
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '공정흐름유형등록',
      labels: { name: '공정흐름유형', memo: '특이사항', seq: '공정순서', proc: '공정', next: '후속공정순서', last: '최종공정여부' } };
  };
  return '공정흐름유형등록 읽기 준비됨';
})();
