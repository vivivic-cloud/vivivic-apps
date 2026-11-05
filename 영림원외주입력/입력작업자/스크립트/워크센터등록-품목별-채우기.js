// 제품별공정별워크센터등록(500865) — 폼 erp_itemwcs 대기 처리. 먼저 공통.js → 불러오기-공통.js. 500865 를 열어 앞에 둔다.
// 쓰는 법: ylw.iw.bg(['품번',…], 이어하기) 뒤 window.__iw_g 를 읽는다(공정 하나 약 15초). 틀리면 그 품목에서 멈추고 폼은 진행중으로 남는다.
// 한 품목: 신규 → 제품번호 Enter → 공정마다 위 표(SS1) 행 번호 더블클릭 → 가운데 표(SS2)에 없는 업체만 우선순위 순서로 붙여넣기(워크센터 → 시간단위·표준작업시간·우선순위)
//   → 저장 전 대조 → 저장(알림 없음, 줄 머리 A → 숫자) → 다음 공정. 끝나면 조회 → 공정마다 다시 대조 → 폼 완료.
// 공정 2개 이상 품목(11-05): 중간 공정은 먼저 500299 에 공정품 + 우선순위 1 워크센터·시간단위·표준작업시간을 한 번에 저장(mid) → 500865 에 1번 줄이 저절로 생김 → 나머지 업체만 넣음.
//   중간 공정 = erp_itemmats procs 에서 last 아닌 공정, 공정품 = erp_materials code 「{품번}_{공정순서}」 완료 문서. 그 문서가 완료가 아니면 그 품목은 손대지 않고 throw. ⚠ 500299 「BOM에서 가져오기」는 절대 안 누른다. 소요자재-채우기.js 도 먼저 실행(ylw.im.open).
// 코드 잡힘: 워크센터 이름 → WorkCenterSeq · 구분·외주거래처 저절로 · 시간단위 「분」→ TimeUnit 6050002. 우선순위 1 업체가 500299 공정 표 워크센터로 나온다(11-04).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.imp) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const PAGE = '500865', S = (x) => (x == null ? '' : String(x));
  const W = () => Y.win(PAGE), D = () => W().document, G = (k) => D().getElementById(k);
  const mouse = (w, b) => { const r = b.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: w, clientX: r.x + 5, clientY: r.y + 5, button: 0 }; for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) b.dispatchEvent(new (t.startsWith('pointer') ? w.PointerEvent : w.MouseEvent)(t, o)); };
  const tool = (name) => { const b = [...D().querySelectorAll('a')].find((e) => new RegExp('^\\s*' + name + '\\s*$').test(e.textContent)); if (!b) throw new Error(name + ' 단추 없음'); mouse(W(), b); };
  const open = async (code) => {
    tool('신규'); await Y.sleep(1500);
    const el = G('txtItemNo_txt'), ko = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
    if (el.value) throw new Error('화면이 안 비었음 ' + el.value);
    el.focus(); el.value = code; el.dispatchEvent(new Event('input', { bubbles: true }));
    ['keydown', 'keypress', 'keyup'].forEach((t) => el.dispatchEvent(new KeyboardEvent(t, ko)));
    let t = 0; while (!(G('txtItemName_txt').value && Y.rows(G('SS1')).length) && t < 40) { await Y.sleep(250); t++; }
    await Y.sleep(1200);
    if (G('txtItemNo_txt').value !== code) throw new Error(code + ' 안 열림: ' + G('txtItemNo_txt').value);
    const sel = G('cmbProcRev_ul'); if (sel.options[sel.selectedIndex].text !== '00') throw new Error(code + ' 공정차수 다름');
  };
  const pick = async (seq, proc) => {
    const s1 = G('SS1'), i = Y.rows(s1).findIndex((r) => +r.ProcNo === +seq && S(r.ProcName) === proc);
    if (i < 0) throw new Error('공정 ' + seq + ' ' + proc + ' 없음');
    s1.SetActiveCell(i, 'ProcNo'); s1.m_DblClickRow = i; s1.ClickRow = i; s1.kevent_dblclick({ sheet: s1.Sheet, sheetName: 'Sheet1', sheetArea: 2, row: i, col: 0 });
    let t = 0; while (G('txtProcName_txt').value !== proc && t < 20) { await Y.sleep(250); t++; }
    await Y.sleep(1200);
    if (G('txtProcName_txt').value !== proc) throw new Error('공정 ' + proc + ' 안 열림');
  };
  const cmp = (list) => {
    const rows = Y.rows(G('SS2')), bad = [];
    if (rows.length !== list.length) bad.push('줄 수 폼 ' + list.length + ' / 화면 ' + rows.length);
    list.forEach((v) => {
      const r = rows.find((x) => S(x.WorkCenterName) === v.wc); if (!r) { bad.push(v.wc + ' 없음'); return; }
      if (!(+r.WorkCenterSeq > 0)) bad.push(v.wc + ' 코드 안 잡힘');
      if (S(r.TimeUnitName) !== v.tunit || +r.StdWorkTime !== +v.time || +r.Ranking !== +v.rank) bad.push(v.wc + ': 폼 ' + v.tunit + '/' + v.time + '/' + v.rank + ' · 화면 ' + r.TimeUnitName + '/' + r.StdWorkTime + '/' + r.Ranking);
      if (!S(r.CustName) || !S(r.SMWorkCenterTypeName)) bad.push(v.wc + ' 외주거래처·구분 빈칸');
    });
    return bad;
  };
  // 알림 창(맨 위 문서) 글. 뜨면 누르지 않고 멈춘다.
  const popup = () => { const ok = document.getElementById('msgBtnOk'); if (!ok || !ok.getClientRects().length) return ''; const b = document.getElementById('messagePopup') || ok.parentElement.parentElement; return S(b.textContent).replace(/\s+/g, ' ').trim(); };
  // 500299
  const W9 = () => Y.win('500299'), D9 = () => W9().document, G9 = (k) => D9().getElementById(k);
  const tool9 = (name) => { const b = [...D9().querySelectorAll('a')].find((e) => new RegExp('^\\s*' + name + '\\s*$').test(e.textContent)); if (!b) throw new Error('500299 ' + name + ' 단추 없음'); mouse(W9(), b); };
  const OK1 = ['WorkingTag', 'WorkCenterName', 'WorkCenterSeq', 'TimeUnitName', 'TimeUnit', 'WorkHour', 'AssyItemName', 'AssyItemNo', 'AssyItemSeq', 'AssySpec', 'UnitName', 'UnitSeq'];
  const snap = (rows) => rows.map((r) => { const o = { ...r }; delete o.IDX_NO; delete o.DataSeq; return o; });
  // 바뀐 칸 — 줄은 key 칸으로 맞춘다. okRows = 바뀌어도 되는 줄(공정순서), okCols = 그 줄에서 바뀌어도 되는 칸. okAll = 모든 줄에서 바뀌어도 되는 칸
  const diff = (a, b, key, okRows, okCols, okAll) => {
    const bad = [];
    if (a.length !== b.length) bad.push('줄 수 ' + b.length + ' → ' + a.length);
    a.forEach((x) => {
      const y = b.find((q) => S(q[key]) === S(x[key])); if (!y) { bad.push(key + ' ' + x[key] + ' 없던 줄'); return; }
      Object.keys(x).forEach((k) => { if (S(x[k]) !== S(y[k]) && !(okRows.includes(+x[key]) && okCols.includes(k)) && !(okAll || []).includes(k)) bad.push(x[key] + '.' + k + ': ' + y[k] + ' → ' + x[k]); });
    });
    return bad;
  };
  const midCheck = (mids) => {
    const r = Y.rows(G9('SS1')), bad = [];
    mids.forEach((m) => {
      const x = r.find((q) => +q.ProcNo === +m.seq);
      if (!x) { bad.push('공정 ' + m.seq + ' 없음'); return; }
      [['공정', x.ProcName, m.proc], ['워크센터', x.WorkCenterName, m.v.wc], ['시간단위', x.TimeUnitName, m.v.tunit], ['공정품번', x.AssyItemNo, m.wip.code], ['공정품명', x.AssyItemName, m.wip.name], ['단위', x.UnitName, m.wip.unit]].forEach(([n, a, b]) => { if (S(a) !== S(b)) bad.push(m.proc + ' ' + n + ': 폼 ' + b + ' / 화면 ' + a); });
      if (+x.WorkHour !== +m.v.time) bad.push(m.proc + ' 표준작업시간 ' + x.WorkHour);
      if (+x.AssyItemSeq !== +m.wip.ylwCode) bad.push(m.proc + ' 공정품 코드 폼 ' + m.wip.ylwCode + ' / 화면 ' + x.AssyItemSeq);
      if (!(+x.WorkCenterSeq > 0)) bad.push(m.proc + ' 워크센터 코드 안 잡힘');
    });
    return bad;
  };
  // 500299 중간 공정 줄들 한 번에. 이미 다 들어 있으면 저장 안 함.
  const mid = async (code, rev, want, mids) => {
    Home.OpenPageSeq(500299); await Y.sleep(1800);
    await Y.im.open(code, want);
    const sel = G9('cmbProcRev_ul');
    if (G9('txtItemNo_txt').value !== code || sel.options[sel.selectedIndex].text !== S(rev)) throw new Error(code + ' 500299 안 열림');
    const s1 = G9('SS1'), s2 = G9('SS2');
    if (Y.rows(s2).length !== want) throw new Error(code + ' 소요자재 줄 수 폼 ' + want + ' / 화면 ' + Y.rows(s2).length);
    const b1 = snap(Y.rows(s1)), b2 = snap(Y.rows(s2)), rows = Y.rows(s1), todo = [];
    for (const m of mids) {
      const x = rows.find((q) => +q.ProcNo === +m.seq); if (!x) throw new Error(code + ' 공정 ' + m.seq + ' 없음');
      if (S(x.AssyItemNo) === m.wip.code && S(x.WorkCenterName) === m.v.wc) continue;
      if (S(x.AssyItemNo) || S(x.WorkCenterName)) throw new Error(code + ' ' + m.proc + ' 이미 다른 값: ' + x.AssyItemNo + ' / ' + x.WorkCenterName);
      todo.push(m);
    }
    if (!todo.length) { const bad0 = midCheck(mids); if (bad0.length) throw new Error(code + ' 500299 대조 틀림: ' + bad0.join(' · ')); return '이미 있음'; }
    for (const m of todo) {
      const i = Y.rows(s1).findIndex((q) => +q.ProcNo === +m.seq);
      await Y.paste(s1, i, 'WorkCenterName', [m.v.wc], 1500);
      await Y.paste(s1, i, 'TimeUnitName', [m.v.tunit, S(m.v.time)], 1200);
      await Y.paste(s1, i, 'AssyItemNo', [m.wip.code], 1800);
    }
    const nums = todo.map((m) => +m.seq);
    const bad = midCheck(mids).concat(diff(snap(Y.rows(s1)), b1, 'ProcNo', nums, OK1), diff(snap(Y.rows(s2)), b2, 'MatItemNo', [], []));
    if (bad.length) throw new Error(code + ' 500299 저장 전 대조 틀림(저장 안 함): ' + bad.join(' · '));
    tool9('저장'); await Y.sleep(2800);
    const msg = popup(); if (msg) throw new Error(code + ' 500299 저장 알림: ' + msg);
    if (Y.rows(s1).some((r) => r.WorkingTag)) throw new Error(code + ' 500299 저장 안 됨');
    await Y.im.open(code, want);
    const bad2 = midCheck(mids).concat(diff(snap(Y.rows(s1)), b1, 'ProcNo', nums, OK1), diff(snap(Y.rows(s2)), b2, 'MatItemNo', [], [], ['Level']));
    if (bad2.length) throw new Error(code + ' 500299 저장 뒤 대조 틀림: ' + bad2.join(' · '));
    return '저장';
  };
  Y.iw = {
    open, pick, cmp, mid,
    async go(code, again) {
      const all = (await Y.imp.list('erp_itemwcs')).filter((x) => x.code === code && x.status !== '오류');
      const l = all.filter((x) => x.status === '대기' || (again && x.status === '진행중'));
      if (!l.length) throw new Error(code + ' 대기 없음');
      const im = (await Y.imp.list('erp_itemmats')).find((x) => x.code === code && x.status === '완료');
      if (!im) throw new Error(code + ' 소요자재(공정차수) 완료 문서 없음');
      const by = {}; l.forEach((v) => { (by[v.seq + '|' + v.proc] = by[v.seq + '|' + v.proc] || []).push(v); });
      const keys = Object.keys(by).sort((a, b) => +b.split('|')[0] - +a.split('|')[0]), done = [];
      const mats = await Y.imp.list('erp_materials'), mids = [];
      for (const k of keys) {
        const [seq, proc] = k.split('|'), p = im.procs.find((x) => +x.seq === +seq);
        if (!p || p.proc !== proc) throw new Error(code + ' 공정 ' + k + ' 이 소요자재 문서에 없음');
        if (p.last) continue;
        const wip = mats.find((x) => x.code === code + '_' + seq);
        if (!wip || wip.status !== '완료' || !wip.ylwCode) throw new Error(code + ' 재공품 완료 먼저: ' + code + '_' + seq);
        const v = all.filter((x) => +x.seq === +seq && x.proc === proc).sort((a, b) => a.rank - b.rank)[0];
        if (+v.rank !== 1) throw new Error(code + ' ' + proc + ' 우선순위 1 문서 없음');
        mids.push({ seq: +seq, proc, wip, v });
      }
      for (const v of l) if (v.status === '대기') await Y.imp.patch('erp_itemwcs', v.id, { status: '진행중' });
      if (mids.length) done.push('500299 ' + (await mid(code, im.rev, im.mats.length, mids)));
      Home.OpenPageSeq(500865); await Y.sleep(1800);
      await open(code);
      if (Y.rows(G('SS1')).length !== im.procs.length) throw new Error(code + ' 공정 수 폼 ' + im.procs.length + ' / 화면 ' + Y.rows(G('SS1')).length);
      const whole = (seq, proc) => all.filter((x) => +x.seq === +seq && x.proc === proc).sort((a, b) => a.rank - b.rank);
      for (const k of keys) {
        const [seq, proc] = k.split('|'), list = whole(seq, proc), sh = G('SS2');
        await pick(seq, proc);
        const have = Y.rows(sh), extra = have.filter((r) => !list.some((v) => v.wc === S(r.WorkCenterName)));
        if (extra.length) throw new Error(code + ' ' + proc + ' 폼에 없는 줄: ' + extra.map((r) => r.WorkCenterName).join());
        const add = list.filter((v) => !have.some((r) => S(r.WorkCenterName) === v.wc));
        for (let i = 0; i < add.length; i++) {
          const v = add[i], row0 = have.length + i;
          await Y.paste(sh, row0, 'WorkCenterName', [v.wc], 1500);
          await Y.paste(sh, row0, 'TimeUnitName', [v.tunit, S(v.time), S(v.rank)], 1200);
        }
        const bad = cmp(list);
        if (bad.length) throw new Error(code + ' ' + proc + ' 저장 전 대조 틀림(저장 안 함): ' + bad.join(' · '));
        if (add.length) { tool('저장'); await Y.sleep(2500); const msg = popup(); if (msg) throw new Error(code + ' ' + proc + ' 저장 알림: ' + msg); if (Y.rows(sh).some((r) => r.WorkingTag)) throw new Error(code + ' ' + proc + ' 저장 안 됨'); }
        done.push(proc + ' ' + list.map((v) => v.wc + '#' + v.rank).join(',') + (add.length < list.length ? '(' + (list.length - add.length) + '줄 있음)' : ''));
      }
      tool('조회'); await Y.sleep(2500);
      for (const k of keys) {
        const [seq, proc] = k.split('|');
        await pick(seq, proc);
        const bad = cmp(whole(seq, proc));
        if (bad.length) throw new Error(code + ' ' + proc + ' 저장 뒤 대조 틀림: ' + bad.join(' · '));
      }
      for (const v of l) await Y.imp.patch('erp_itemwcs', v.id, { status: '완료', agentNote: '제품별공정별워크센터등록(500865) 저장 · 조회 대조 맞음(11-05)' });
      return code + ': ' + done.join(' / ');
    },
    bg(list, again) {
      window.__iw_g = { 끝: false, 결과: [] };
      (async () => { for (const c of list) { try { window.__iw_g.결과.push(await Y.iw.go(c, again)); } catch (e) { window.__iw_g.오류 = String(e.message || e); break; } } window.__iw_g.끝 = true; })();
      return '시작 ' + list.length + '건';
    },
  };
  return '워크센터 준비됨';
})();
