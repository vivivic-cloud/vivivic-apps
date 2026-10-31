// 공정흐름유형등록(500228) 채우기 — 저장은 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: 폼 erp_flows 대기 자료 [{name, memo, rows:[{seq, proc, next, last}]}] (폼 v19 가 seq·next·last 를 채워 둔다).
// 두 단계다(새 유형은 저장해야 상세가 열린다 — 화면별-요령):
//   1) 화면을 **새로** 열고(상세를 연 적 없는 상태) → await ylw.flow.fillHeads(목록) → 대조표 모두맞음 → 「저장」 → 「조회」 → ylw.flow.verifyHeads(목록)
//   2) 흐름마다: 왼쪽 그 행 **번호를 더블클릭**(사람 손 — 스크립트로 못 엶) → await ylw.flow.fillRows(흐름 하나)
//      → 대조표 모두맞음 → 「저장」 → 「조회」 → 다시 더블클릭 → ylw.flow.verifyRows(흐름 하나)
//   fillRows 는 오른쪽 위 「공정흐름유형」 칸(txtProcTypeName_txt)이 그 흐름 이름이 아니면 아무것도 안 넣고 멈춘다(엉뚱한 흐름에 넣기 막기).
//   상세에 이미 줄이 있으면 멈춘다(기존 흐름에 덧붙이지 않음).
// 시트: 왼쪽 SS1(붙이는 칸: 공정흐름유형부터 [이름, 특이사항]) · 오른쪽 SS2(공정순서부터 [공정순서, 공정, 후속공정순서] — 공정은 이름으로 ProcSeq 가 잡힘,
//   최종공정여부는 체크 칸이라 Y.setChk). 상세 공정검사여부는 회색(공정등록 값 표시)이라 넣지도 대조하지도 않는다.
// 확인: 2026-11-01 — 머리는 저장 없이 시험(「조회」로 버림). 상세 붙여넣기는 11-01 실제 저장 때 손 붙여넣기로 같은 칸 순서 확인(5ab8b2c),
//   상세(fillRows·verifyRows)는 11-01 실제 12흐름(1~5줄)에 써서 저장 전·조회 뒤 대조 모두 맞음. 멈춤 검사 두 가지(열린 흐름 이름·상세 있음)도 11-01 확인.
// ⚠ 상세를 한 번이라도 연 뒤에는 「조회」를 눌러도 왼쪽 표에 붙여넣기가 안 먹는다(11-01) → 머리를 넣을 때는 **화면 탭을 닫고 다시 연다**(Home.OpenPageSeq(500228)).
//   그래서 순서: 화면을 새로 열고 fillHeads(전부) → 저장 → 흐름마다 더블클릭 → fillRows → 저장(한 흐름씩).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500228';
  const HEAD = [
    { col: 'IsStop', label: '중단', kind: 'chk' },
    { col: 'ProcTypeName', label: '공정흐름유형' },
    { col: 'Remark', label: '특이사항' },
  ];
  const ROW = [
    { col: 'ProcNo', label: '공정순서' },
    { col: 'ProcName', label: '공정', code: 'ProcSeq' },
    { col: 'ToProcNo', label: '후속공정순서' },
    { col: 'IsLastProc', label: '최종공정여부', kind: 'chk' },
  ];
  const hexp = (f) => ({ IsStop: '0', ProcTypeName: f.name, Remark: f.memo || '' });
  const rexp = (r) => ({ ProcNo: r.seq, ProcName: r.proc, ToProcNo: r.next, IsLastProc: r.last ? '1' : '0' });
  const opened = () => Y.win(PAGE).document.getElementById('txtProcTypeName_txt').value;
  Y.flow = {
    HEAD, ROW, opened,
    async fillHeads(list) {
      const sh = Y.sheet(PAGE, 'SS1');
      const have = new Set(Y.rows(sh).map((r) => r.ProcTypeName));
      const table = [], skipped = [], put = [];
      for (const f of list) {
        if (have.has(f.name)) { skipped.push(f.name + '(이미 있음)'); continue; }
        const row0 = Y.nextRow(sh);
        await Y.paste(sh, row0, 'ProcTypeName', [f.name, f.memo || '']);
        table.push(...Y.check(sh, row0 + 1, HEAD, hexp(f)));
        put.push(f.name);
        have.add(f.name);
      }
      return Y.report(table, { 넣은것: put, 건너뜀: skipped });
    },
    verifyHeads(list) {
      const sh = Y.sheet(PAGE, 'SS1');
      const rows = Y.rows(sh), table = [];
      for (const f of list) {
        const r = rows.find((x) => x.ProcTypeName === f.name);
        if (!r) { table.push({ 행: '-', 칸: f.name, 폼: '있어야 함', 화면: '없음', 맞음: false }); continue; }
        table.push(...Y.check(sh, +r.IDX_NO, HEAD, hexp(f)));
        if (r.WorkingTag) table.push({ 행: r.IDX_NO, 칸: '저장', 폼: '저장됨', 화면: '저장 안 됨(' + r.WorkingTag + ')', 맞음: false });
      }
      return Y.report(table, { 행번호: rows.filter((r) => list.some((f) => f.name === r.ProcTypeName)).map((r) => r.ProcTypeName + '=' + r.IDX_NO + '행') });
    },
    async fillRows(f) {
      const now = opened();
      if (now !== f.name) return Y.report([{ 행: '-', 칸: '열린 흐름', 폼: f.name, 화면: now || '(안 열림)', 맞음: false }], { 멈춤: '왼쪽 「' + f.name + '」 행 번호를 더블클릭한 뒤 다시' });
      const sh = Y.sheet(PAGE, 'SS2');
      if (Y.rows(sh).length) return Y.report([{ 행: '-', 칸: '상세', 폼: '비어 있어야 함', 화면: Y.rows(sh).length + '줄 있음', 맞음: false }], { 멈춤: '이미 상세가 있다 — 덧붙이지 않음' });
      const table = [];
      for (const r of f.rows) {
        const row0 = Y.nextRow(sh);
        await Y.paste(sh, row0, 'ProcNo', [r.seq, r.proc, r.next], 1200);
        if (r.last) Y.setChk(sh, row0, 'IsLastProc', true);
        table.push(...Y.check(sh, row0 + 1, ROW, rexp(r)));
      }
      return Y.report(table, { 흐름: f.name });
    },
    verifyRows(f) {
      const now = opened();
      if (now !== f.name) return Y.report([{ 행: '-', 칸: '열린 흐름', 폼: f.name, 화면: now || '(안 열림)', 맞음: false }]);
      const sh = Y.sheet(PAGE, 'SS2');
      const rows = Y.rows(sh), table = [];
      if (rows.length !== f.rows.length) table.push({ 행: '-', 칸: '줄 수', 폼: String(f.rows.length), 화면: String(rows.length), 맞음: false });
      for (const r of f.rows) {
        const x = rows.find((y) => String(y.ProcNo) === String(r.seq));
        if (!x) { table.push({ 행: '-', 칸: '공정순서 ' + r.seq, 폼: '있어야 함', 화면: '없음', 맞음: false }); continue; }
        table.push(...Y.check(sh, +x.IDX_NO, ROW, rexp(r)));
        if (x.WorkingTag) table.push({ 행: x.IDX_NO, 칸: '저장', 폼: '저장됨', 화면: '저장 안 됨(' + x.WorkingTag + ')', 맞음: false });
      }
      return Y.report(table, { 흐름: f.name });
    },
  };
  return '공정흐름유형등록 준비됨';
})();
