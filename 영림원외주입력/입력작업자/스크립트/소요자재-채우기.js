// 제품별공정별소요자재 — 폼 erp_itemmats 대기 처리. 일괄등록(525162) → 500299 대조·투입공정 고침 → 폼 완료. 먼저 공통.js → 불러오기-공통.js. 두 화면을 열어 둔다(Home.OpenPageSeq).
// 요령 = 화면별-요령.md 「일괄등록·500299 실제 시험」 · 순서 = AGENTS.md 3-5. ⚠ 「BOM에서 가져오기」·일괄삭제(btn_del_btn)는 절대 안 누른다.
// 쓰는 법: await ylw.im.go('T-al-p03') 한 번 = 대기 확인 → 진행중 → 일괄등록 → 500299 조회 → 투입공정 고침·저장 → 다시 조회·대조 → 폼 완료. 틀리면 throw(폼 진행중으로 남음, 멈춰서 사람이 본다).
//   한 건 약 20초 — 도구 시간 제한(45초) 때문에 go 는 window.__g 에 결과를 두는 꼴로 돌린다: ylw.im.bg(['품번',…]) 뒤 window.__g 를 읽는다.
// 일괄등록은 공정 = 흐름 전부 · 투입공정 = 모두 최종 공정 · 워크센터 빈칸. 소요자재 표는 「소요자재전체보기」를 켜야 다 보인다.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.imp) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const S = (x) => (x == null ? '' : String(x));
  const mouse = (w, b) => { const r = b.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: w, clientX: r.x + 5, clientY: r.y + 5, button: 0 }; for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) b.dispatchEvent(new (t.startsWith('pointer') ? w.PointerEvent : w.MouseEvent)(t, o)); };
  const tool = (page, name) => { const w = Y.win(page), b = [...w.document.querySelectorAll('a')].find((e) => new RegExp('^\\s*' + name + '\\s*$').test(e.textContent)); if (!b) throw new Error(page + ' ' + name + ' 단추 없음'); mouse(w, b); };
  // 영림원 알림(화면 맨 위 문서) 글을 읽고 「확인」
  const alertOk = async () => {
    let t = 0;
    for (; t < 30; t++) {
      for (const d of [document, Y.win('525162').document, Y.win('500299').document]) {
        const ok = [...d.querySelectorAll('button,a')].find((e) => e.getClientRects().length && /^\s*확인\s*$/.test(e.textContent));   // 알림 창은 position:fixed — offsetParent 가 null
        if (ok) { const box = ok.closest('[role=dialog],.modal,.modal-content') || ok.parentElement.parentElement; const msg = S(box.textContent).replace(/\s+/g, ' ').trim().slice(0, 80); mouse(d.defaultView, ok); await Y.sleep(600); return msg; }
      }
      await Y.sleep(300);
    }
    return '';
  };
  const reg = async (code) => {
    const w = Y.win('525162'), d = w.document, sh = d.getElementById('SS1'), el = d.getElementById('txtItemNo_txt');
    w.confirm = (m) => { throw new Error('확인창: ' + m); };
    el.focus(); el.value = code; ['input', 'keyup', 'change', 'blur'].forEach((t) => el.dispatchEvent(new Event(t, { bubbles: true })));
    tool('525162', '조회'); await Y.sleep(2500);
    const rows = Y.rows(sh), i = rows.findIndex((r) => r.ItemNo === code);
    if (rows.length !== 1 || i < 0) throw new Error(code + ' 일괄등록 표 ' + rows.map((r) => r.ItemNo).join(','));
    if (rows[i].IsReg === '1') return '이미 등록(일괄등록 안 함)';
    Y.setChk(sh, i, 'Select', true); await Y.sleep(400);
    if (Y.rows(sh)[i].Select !== '1') throw new Error(code + ' 선택 안 됨');
    mouse(w, d.getElementById('btn_proc_btn')); await Y.sleep(1500);
    const m = await alertOk();
    if (!/완료/.test(m)) throw new Error(code + ' 일괄등록 알림: ' + m);
    return m;
  };
  const open = async (code) => {
    const w = Y.win('500299'), d = w.document;
    w.confirm = () => false;
    tool('500299', '신규'); await Y.sleep(1500);
    const el = d.getElementById('txtItemNo_txt'), ko = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
    el.focus(); el.value = code; el.dispatchEvent(new Event('input', { bubbles: true }));
    ['keydown', 'keypress', 'keyup'].forEach((t) => el.dispatchEvent(new KeyboardEvent(t, ko)));
    let t = 0; while (!(d.getElementById('txtItemName_txt').value && Y.rows(d.getElementById('SS1')).length) && t < 40) { await Y.sleep(250); t++; }
    await Y.sleep(1200);
    const c = d.getElementById('chkIsMatAll_input'); if (!c.checked) { c.click(); await Y.sleep(1500); }
    if (!c.checked) throw new Error('소요자재전체보기 안 켜짐');
  };
  // 폼 문서 ↔ 화면. proc = 투입공정까지 볼지
  const cmp = (v, withProc) => {
    const d = Y.win('500299').document, r1 = Y.rows(d.getElementById('SS1')), r2 = Y.rows(d.getElementById('SS2')), bad = [];
    if (d.getElementById('txtItemNo_txt').value !== v.code) bad.push('다른 품목 ' + d.getElementById('txtItemNo_txt').value);
    const sel = (i) => { const e = d.getElementById(i); return e.options[e.selectedIndex].text; };
    if (sel('cmbProcRev_ul') !== S(v.rev)) bad.push('공정차수 ' + sel('cmbProcRev_ul'));
    if (r1.length !== v.procs.length) bad.push('공정 줄 수 폼 ' + v.procs.length + ' / 화면 ' + r1.length);
    v.procs.forEach((p) => { const r = r1.find((x) => +x.ProcNo === +p.seq); if (!r) { bad.push('공정 ' + p.seq + ' 없음'); return; } if (S(r.ProcName) !== p.proc || +r.ToProcNo !== +p.next || (S(r.IsLastProc) === '1') !== !!p.last) bad.push('공정 ' + p.seq + ': 폼 ' + p.proc + '/' + p.next + '/' + p.last + ' · 화면 ' + r.ProcName + '/' + r.ToProcNo + '/' + r.IsLastProc); });
    if (r2.length !== v.mats.length) bad.push('자재 줄 수 폼 ' + v.mats.length + ' / 화면 ' + r2.length);
    v.mats.forEach((m) => {
      const r = r2.find((x) => S(x.MatItemNo) === m.ccode); if (!r) { bad.push(m.ccode + ' 없음'); return; }
      const pairs = [['표시순서', r.UserNo, m.order], ['자재명', r.MatItemName, m.cname], ['규격', r.MatSpec, m.cspec], ['투입단위', r.UnitName, m.inunit], ['조달구분', r.SMDelvTypeName, m.supply], ['반제품공정차수', r.SubItemProcRevName, m.srev]];
      if (withProc) pairs.push(['투입공정', r.ProcName, m.proc]);
      pairs.forEach(([n, a, b]) => { if (S(a) !== S(b)) bad.push(m.ccode + ' ' + n + ': 폼 ' + b + ' / 화면 ' + a); });
      if (+r.NeedQtyNumerator !== +m.qn || +r.NeedQtyDenominator !== +m.qd) bad.push(m.ccode + ' 소요량 ' + m.qn + '/' + m.qd + ' / ' + r.NeedQtyNumerator + '/' + r.NeedQtyDenominator);
    });
    return { bad, 자재: r2.map((r) => [r.UserNo, r.ProcName, r.MatItemNo, r.NeedQtyNumerator + '/' + r.NeedQtyDenominator, r.UnitName, r.SMDelvTypeName, r.SubItemProcRevName].join(' ')), 공정: r1.map((r) => [r.ProcNo, r.ProcName, r.ToProcNo, r.WorkCenterName, r.AssyItemNo, r.IsLastProc].join('/')) };
  };
  Y.im = {
    cmp, open,
    async go(code, again) {   // again = 진행중으로 멈춘 건 이어서(일괄등록이 이미 됐으면 건너뜀)
      const l = await Y.imp.list('erp_itemmats'), v = l.find((x) => x.code === code);
      if (!v || !(v.status === '대기' || (again && v.status === '진행중'))) throw new Error(code + ' 대기 아님: ' + (v && v.status));
      if (v.status === '대기') await Y.imp.patch('erp_itemmats', v.id, { status: '진행중' });
      const said = await reg(code);
      await open(code);
      const a = cmp(v, false);
      if (a.bad.length) throw new Error(code + ' 일괄등록 뒤 대조 틀림: ' + a.bad.join(' · '));
      const d = Y.win('500299').document, sh = d.getElementById('SS2'), wrong = [];
      const rows = Y.rows(sh);
      for (const m of v.mats) { const i = rows.findIndex((x) => S(x.MatItemNo) === m.ccode); if (S(rows[i].ProcName) !== m.proc) wrong.push([i, m]); }
      const before = a.자재.slice();
      if (wrong.length) {
        for (const [i, m] of wrong) await Y.paste(sh, i, 'ProcName', [m.proc], 1500);
        const b = cmp(v, true);
        if (b.bad.length) throw new Error(code + ' 고친 뒤 저장 전 대조 틀림(저장 안 함): ' + b.bad.join(' · '));
        tool('500299', '저장'); await Y.sleep(2500);
        if (Y.rows(sh).some((r) => r.WorkingTag)) throw new Error(code + ' 저장 안 됨');
        tool('500299', '조회'); await Y.sleep(2500);
        await open(code);
      }
      const c = cmp(v, true);
      if (c.bad.length) throw new Error(code + ' 저장 뒤 대조 틀림: ' + c.bad.join(' · '));
      await Y.imp.patch('erp_itemmats', v.id, { status: '완료', agentNote: '일괄등록(525162)' + (wrong.length ? ' 뒤 500299 투입공정 ' + wrong.length + '줄 고침' : '') + ' · 공정·소요자재·공정차수 ' + v.rev + ' 대조 맞음(11-04) · 워크센터 빈칸(10단계)' });
      return { code, said, 고침: wrong.length, 일괄등록뒤: before, 대조뒤: c.자재, 공정: c.공정 };
    },
    bg(list, again) {
      window.__g = { 끝: false, 결과: [] };
      (async () => { for (const c of list) { try { window.__g.결과.push(await Y.im.go(c, again)); } catch (e) { window.__g.오류 = String(e.message || e); break; } } window.__g.끝 = true; })();
      return '시작 ' + list.length + '건';
    },
  };
  return '소요자재 준비됨';
})();
