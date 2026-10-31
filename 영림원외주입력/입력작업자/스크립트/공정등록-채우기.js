// 공정등록(500173) 채우기 — 저장은 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: 폼 erp_processes 대기 자료 배열 [{name, memo, inspect}] (Y.fs(문서) 로 바꾼 것 그대로 넣어도 됨).
// 쓰는 법: 화면을 열고 「조회」 → await ylw.process.fill(목록) → 돌려준 대조표에서 모두맞음 확인 → 사람이 「저장」 → 「조회」 → await ylw.process.verify(목록).
// 시트: SS. 붙이는 칸: 공정명부터 [공정명, 특이사항]. 공정검사여부는 체크 칸이라 Y.setChk 로 켠다.
// 확인: 2026-11-01 (저장 없이 시험, 「조회」로 버림).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500173';
  const SPEC = [ // 화면 칸 왼쪽→끝 (파일삭제는 단추라 뺌)
    { col: 'IsStop', label: '중단', kind: 'chk' },
    { col: 'ProcName', label: '공정명' },
    { col: 'Remark', label: '특이사항' },
    { col: 'IsProcQc', label: '공정검사여부', kind: 'chk' },
    { col: 'FileName', label: '첨부파일명' },
  ];
  const exp = (p) => ({ IsStop: '0', ProcName: p.name, Remark: p.memo || '', IsProcQc: p.inspect ? '1' : '0', FileName: '' });
  Y.process = {
    SPEC,
    async fill(list) {
      const sh = Y.sheet(PAGE, 'SS');
      const have = new Set(Y.rows(sh).map((r) => r.ProcName));
      const table = [], skipped = [], put = [];
      for (const p of list) {
        if (have.has(p.name)) { skipped.push(p.name + '(이미 있음)'); continue; }
        const row0 = Y.nextRow(sh);
        await Y.paste(sh, row0, 'ProcName', [p.name, p.memo || '']);
        if (p.inspect) Y.setChk(sh, row0, 'IsProcQc', true);
        table.push(...Y.check(sh, row0 + 1, SPEC, exp(p)));
        put.push(p.name);
        have.add(p.name);
      }
      return Y.report(table, { 넣은것: put, 건너뜀: skipped });
    },
    // 저장·조회 뒤: 이름으로 찾아 다시 대조(행 번호는 저장 뒤 바뀔 수 있다)
    verify(list) {
      const sh = Y.sheet(PAGE, 'SS');
      const rows = Y.rows(sh), table = [];
      for (const p of list) {
        const r = rows.find((x) => x.ProcName === p.name);
        if (!r) { table.push({ 행: '-', 칸: p.name, 폼: '있어야 함', 화면: '없음', 맞음: false }); continue; }
        table.push(...Y.check(sh, +r.IDX_NO, SPEC, exp(p)));
        if (r.WorkingTag) table.push({ 행: r.IDX_NO, 칸: '저장', 폼: '저장됨', 화면: '저장 안 됨(' + r.WorkingTag + ')', 맞음: false });
      }
      return Y.report(table, { 공정코드: rows.filter((r) => list.some((p) => p.name === r.ProcName)).map((r) => r.ProcName + '=' + r.ProcSeq) });
    },
  };
  return '공정등록 준비됨';
})();
