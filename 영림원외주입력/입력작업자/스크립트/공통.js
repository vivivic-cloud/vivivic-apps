// 공통 — 표(그리드) 화면 채우기 스크립트가 쓰는 도구. **다른 채우기 스크립트보다 먼저 한 번 실행한다.**
// 어디서: 영림원 맨 위 창(로그인된 탭)에서 실행(Claude in Chrome 이면 javascript_tool 에 파일 내용을 그대로).
// 하는 일: 시트(SS·SS1·SS2…)에 한 줄씩 「붙여넣기」를 스크립트로 보내고, 넣은 줄을 화면 칸 그대로 읽어 폼 값과 대조한다.
//   - 붙여넣기 = 사람이 Cmd+V 한 것과 같은 길이라 코드도움 칸(거래처·창고·공정·부서·드롭다운)이 이름으로 코드가 잡힌다.
//   - 저장·삭제·조회는 누르지 않는다(사람/작업자가 대조표를 보고 누른다).
// 확인: 2026-11-01 공정등록(500173)에서 — 붙여넣기 이벤트는 시트 안 contenteditable DIV 가 받는다.
//   SetFocus() → SetActiveCell(0부터 센 행, 열 이름) → 그 DIV 에 ClipboardEvent('paste') 를 보내면 그 칸부터 탭으로 나뉘어 들어간다.
//   ⚠ 여러 줄(\n·\r\n)을 한 번에 보내면 **아무것도 안 들어간다** → 한 줄씩 보낸다(줄마다 0.8초 기다림).
//   ⚠ 체크 칸은 붙여넣기(1·True)로 안 켜진다 → Y.setChk(시트, 행0, 열, true) = 시트 SetText(행0, 열, '1')(화면 체크도 켜짐 확인).
//     SetText 는 코드도움을 안 거치므로 **글·코드 칸에는 쓰지 않는다**(체크 칸 전용).
(function () {
  const Y = (window.ylw = window.ylw || {});
  Y.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  Y.win = (page) => {
    const f = document.getElementById(page + '_iframe');
    if (!f) throw new Error('화면 ' + page + ' 이 안 열림 — Home.OpenPageSeq(' + page + ') 뒤 조회부터');
    return f.contentWindow;
  };
  Y.open = async (page) => { Home.OpenPageSeq(page); await Y.sleep(2500); return Y.win(page); };
  Y.sheet = (page, name) => {
    const s = Y.win(page)[name];
    if (!s || typeof s.GetAllData !== 'function') throw new Error(page + ' 에 시트 ' + name + ' 없음');
    return s;
  };
  // 시트 줄 → {열이름: 값}. 빈 줄은 안 나온다. IDX_NO = 화면 행 번호(1부터).
  Y.rows = (sh) => {
    const t = sh.GetAllData().Tables[0];
    const c = t.Columns.map((x) => x.ColumnName || x);
    return t.Rows.map((r) => Object.fromEntries(c.map((k, i) => [k, r[i]])));
  };
  // 다음 빈 행(0부터 센 번호). 마지막으로 값이 있는 행 바로 아래.
  Y.nextRow = (sh) => Y.rows(sh).reduce((m, r) => Math.max(m, +r.IDX_NO || 0), 0);
  Y.cell = (v) => (v == null ? '' : String(v).replace(/[\t\r\n]+/g, ' '));
  // 한 줄 붙여넣기: row0 행(0부터)의 col 열부터 cells 를 탭으로 이어 넣는다.
  Y.paste = async (sh, row0, col, cells, wait = 800) => {
    const w = sh.ownerDocument.defaultView;
    const pd = sh.querySelector('[contenteditable]');
    if (!pd) throw new Error('붙여넣기 칸(contenteditable)을 못 찾음');
    sh.SetFocus();
    sh.SetActiveCell(row0, col);
    const dt = new w.DataTransfer();
    dt.setData('text/plain', cells.map(Y.cell).join('\t'));
    pd.dispatchEvent(new w.ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    await Y.sleep(wait);
  };
  // 체크 칸 켜기/끄기(행0 = 0부터 센 행)
  Y.setChk = (sh, row0, col, on) => { sh.SetText(row0, col, on ? '1' : '0'); };
  // 값 맞추기: chk = 체크(1/0), date = 숫자만(2016-01-01 ↔ 20160101), 나머지 = 앞뒤 공백 뺀 글.
  Y.norm = (v, kind) => {
    if (kind === 'chk') return v === true || /^(1|true|o|y|예)$/i.test(String(v == null ? '' : v).trim()) ? '1' : '0';
    const s = v == null ? '' : String(v).trim();
    return kind === 'date' ? s.replace(/\D/g, '') : s;
  };
  // 대조: spec = [{col, label, kind?, code?}] (화면에 보이는 칸 **전부**, 왼쪽→끝, 비고까지). exp = {col: 폼 값}(없으면 빈 값이어야 함).
  //   code = 코드도움 칸의 코드 열 — 폼 값이 있으면 코드가 0/빈 값이 아니어야 맞음.
  Y.check = (sh, idx, spec, exp) => {
    const r = Y.rows(sh).find((x) => +x.IDX_NO === idx);
    if (!r) return [{ 행: idx, 칸: '(행 없음)', 폼: '', 화면: '', 맞음: false }];
    const out = [];
    for (const s of spec) {
      const e = Y.norm(exp[s.col], s.kind), a = Y.norm(r[s.col], s.kind);
      out.push({ 행: idx, 칸: s.label, 폼: e, 화면: a, 맞음: e === a });
      if (s.code && e !== '') {
        const c = r[s.code];
        out.push({ 행: idx, 칸: s.label + '(코드)', 폼: '잡혀야 함', 화면: String(c), 맞음: c != null && c !== '' && String(c) !== '0' });
      }
    }
    return out;
  };
  Y.report = (table, extra) => Object.assign({ 모두맞음: table.every((x) => x.맞음), 틀린칸: table.filter((x) => !x.맞음), 대조표: table }, extra || {});
  // 파이어스토어 REST 문서({name, fields}) → 보통 객체(id 포함). 폼 자료를 그대로 넘길 때 쓴다.
  Y.fs = (doc) => {
    const val = (v) => {
      if (!v) return null;
      if ('stringValue' in v) return v.stringValue;
      if ('booleanValue' in v) return v.booleanValue;
      if ('integerValue' in v) return +v.integerValue;
      if ('doubleValue' in v) return v.doubleValue;
      if ('timestampValue' in v) return v.timestampValue;
      if ('nullValue' in v) return null;
      if ('arrayValue' in v) return (v.arrayValue.values || []).map(val);
      if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)]));
      return null;
    };
    const o = Object.fromEntries(Object.entries(doc.fields || {}).map(([k, x]) => [k, val(x)]));
    if (doc.name) o.id = doc.name.split('/').pop();
    return o;
  };
  return '공통 준비됨';
})();
