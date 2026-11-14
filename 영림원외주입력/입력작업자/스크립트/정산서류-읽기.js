// 구매 정산 서류 담기 (폼 v232, 11-14) — 영림원 화면 칸 값을 그대로 읽어 erp_purcalcdocs 에 담는다. 저장 단추는 누르지 않는다(읽기만).
// 먼저 공통.js · 불러오기-공통.js 를 싣는다(ylw.imp.patch 를 씀).
//   ylw.cdoc.calc(입고번호)  — 501596 에서 그 줄만 선택(체크)한 뒤. 전표정보 칸 + 그 줄
//   ylw.cdoc.slip()          — 그 줄 「전표처리」 로 연 「전표입력(자동전표)」 창(502268)에서. 머리 칸 + 추가정보 + 전표행 표
//   ylw.cdoc.tax()           — 527309 그 줄 「매입세금계산서」 로 연 527278 에서. 칸 + 세금계산서품목·입고품목 표
//   ylw.cdoc.img(input)      — 전표 「출력」 오즈 「회계전표」 그림 파일(file_upload 로 넣은 input) → data URL
//   ylw.cdoc.save(calcId, kind, doc) — erp_purcalcdocs/<calcId>_<kind> 에 씀. 셋 다 담은 뒤 ylw.cdoc.done(calcId)
// 꼴(파이어스토어는 배열 안 배열을 못 담는다): {groups:[{t, f:[{k,v}]}], sheets:[{t, cols:[…], rows:[{v:[…]}]}]}
// 11-14 확인: 527278 에는 출력 단추가 없다(조회·저장·행삭제·삭제뿐) · 501596 도 출력 없음 · 전표 창에만 「출력」(오즈 회계전표).
(() => {
  const Y = window.ylw;
  const C = (Y.cdoc = {});
  const vis = (e) => e && e.offsetWidth > 0;
  const sec = (e) => { const g = e.closest('.groupBox'); const t = g && g.querySelector('h2.title'); return t ? t.textContent.trim() : ''; };
  // 표 한 장: 숨은 칸(ControlKey HID) 빼고 화면 칸 이름 그대로
  C.sheet = (s, t) => {
    const cols = (s.objOriSheetData || []).filter((c) => !/HID/.test(c.ControlKey || '') && c.Title);
    const T = s.GetAllData().Tables[0];
    const rows = T.Rows.map((r) => ({ v: cols.map((c) => { const i = T.Columns.indexOf(c.DataField); const v = Array.isArray(r) ? r[i] : r[c.DataField]; return v == null ? '' : String(v); }) }));
    return { t: t == null ? sec(s) : t, cols: cols.map((c) => c.Title), rows };
  };
  // 머리 칸: 보이는 label → 가까운 입력칸 값. 「필수」 표시 글자는 뗀다. 묶음 제목(h2.title)별로
  C.head = (d, skip) => {
    const groups = [];
    [...d.querySelectorAll('label')].filter(vis).forEach((l) => {
      if (l.closest('#divSheetSearch')) return;
      let p = l.parentElement, inp = null;
      for (let i = 0; i < 4 && !inp; i++) { inp = [...p.querySelectorAll('input:not([type=checkbox]),textarea,select')].filter(vis)[0]; if (!inp) p = p.parentElement; }
      if (!inp) return;
      const t = sec(l);
      if (skip && skip.includes(t)) return;
      let g = groups.find((x) => x.t === t); if (!g) groups.push((g = { t, f: [] }));
      g.f.push({ k: l.textContent.trim().replace(/^필수/, ''), v: inp.tagName === 'SELECT' ? ((inp.options[inp.selectedIndex] || {}).text || '') : inp.value });
    });
    return groups;
  };
  const doc = (fid) => document.getElementById(fid).contentWindow;
  C.calc = (inNo) => {
    const w = doc('501596_iframe'), s = w.document.getElementById('SS1');
    const sh = C.sheet(s, '구매입고정산처리'), sel = sh.cols.indexOf('선택'), ci = sh.cols.indexOf('입고번호');
    const row = sh.rows.find((r) => r.v[ci] === inNo);
    if (!row) throw new Error('501596 에 ' + inNo + ' 줄 없음');
    const keep = sh.cols.map((c, i) => i).filter((i) => i !== sel);
    const groups = C.head(w.document).filter((g) => g.t === '전표정보');   // 그 줄만 선택해야 합계가 그 줄 값
    return { title: '구매입고정산처리', no: inNo, groups, sheets: [{ t: sh.t, cols: keep.map((i) => sh.cols[i]), rows: [{ v: keep.map((i) => row.v[i]) }] }] };
  };
  C.slip = () => {
    const w = doc('502268_iframe'), d = w.document;
    const groups = C.head(d);
    groups.forEach((g) => { if (!g.t) g.t = '전표'; });
    const no = ((groups.find((g) => g.t === '전표') || { f: [] }).f.find((x) => x.k === '전표번호') || {}).v || '';
    return { title: '전표입력(자동전표)', no, groups, sheets: [C.sheet(d.getElementById('SS_Row'), '전표행')] };
  };
  C.tax = () => {
    const w = doc('527278_iframe'), d = w.document;
    const groups = C.head(d);
    const no = ((groups.find((g) => g.t === '세금계산서정보') || { f: [] }).f.find((x) => x.k === '세금계산서번호') || {}).v || '';
    return { title: '매입세금계산서', no, groups, sheets: ['SS1', 'SS2'].map((id) => d.getElementById(id)).filter(vis).map((s) => C.sheet(s)) };
  };
  C.img = (input) => new Promise((ok, no) => { const f = input.files[0]; if (!f) return no(new Error('그림 파일 없음')); const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(f); });
  C.save = (calcId, kind, o) => Y.imp.patch('erp_purcalcdocs', calcId + '_' + kind, Object.assign({ calcId, kind, at: new Date().toISOString() }, o));
  C.done = (calcId) => Y.imp.patch('erp_purcalcs', calcId, { docs: { calc: 1, slip: 1, tax: 1 } });
})();
