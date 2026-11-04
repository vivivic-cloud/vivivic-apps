// 제품별공정별워크센터등록(500865) — 폼 erp_itemwcs 대기 처리. 먼저 공통.js → 불러오기-공통.js. 500865 를 열어 앞에 둔다.
// 쓰는 법: ylw.iw.bg(['품번',…], 이어하기) 뒤 window.__iw_g 를 읽는다(공정 하나 약 15초). 틀리면 그 품목에서 멈추고 폼은 진행중으로 남는다.
// 한 품목: 신규 → 제품번호 Enter → 공정마다 위 표(SS1) 행 번호 더블클릭 → 가운데 표(SS2)에 없는 업체만 우선순위 순서로 붙여넣기(워크센터 → 시간단위·표준작업시간·우선순위)
//   → 저장 전 대조 → 저장(알림 없음, 줄 머리 A → 숫자) → 다음 공정. 끝나면 조회 → 공정마다 다시 대조 → 폼 완료.
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
  Y.iw = {
    open, pick, cmp,
    async go(code, again) {
      const l = (await Y.imp.list('erp_itemwcs')).filter((x) => x.code === code && (x.status === '대기' || (again && x.status === '진행중')));
      if (!l.length) throw new Error(code + ' 대기 없음');
      for (const v of l) if (v.status === '대기') await Y.imp.patch('erp_itemwcs', v.id, { status: '진행중' });
      const by = {}; l.forEach((v) => { (by[v.seq + '|' + v.proc] = by[v.seq + '|' + v.proc] || []).push(v); });
      const keys = Object.keys(by).sort((a, b) => +b.split('|')[0] - +a.split('|')[0]), done = [];
      await open(code);
      if (Y.rows(G('SS1')).length !== keys.length) throw new Error(code + ' 공정 수 폼 ' + keys.length + ' / 화면 ' + Y.rows(G('SS1')).length);
      for (const k of keys) {
        const [seq, proc] = k.split('|'), list = by[k].sort((a, b) => a.rank - b.rank), sh = G('SS2');
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
        if (add.length) { tool('저장'); await Y.sleep(2500); if (Y.rows(sh).some((r) => r.WorkingTag)) throw new Error(code + ' ' + proc + ' 저장 안 됨'); }
        done.push(proc + ' ' + list.map((v) => v.wc + '#' + v.rank).join(','));
      }
      tool('조회'); await Y.sleep(2500);
      for (const k of keys) {
        const [seq, proc] = k.split('|');
        await pick(seq, proc);
        const bad = cmp(by[k]);
        if (bad.length) throw new Error(code + ' ' + proc + ' 저장 뒤 대조 틀림: ' + bad.join(' · '));
      }
      for (const v of l) await Y.imp.patch('erp_itemwcs', v.id, { status: '완료', agentNote: '제품별공정별워크센터등록(500865) 저장 · 조회 대조 맞음(11-04)' });
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
