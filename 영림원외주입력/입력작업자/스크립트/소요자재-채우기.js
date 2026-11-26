// 제품별공정별소요자재 — 폼 erp_itemmats 대기 처리. ★ 폼 v345(11-26)부터 = 500299 에 procs·mats 를 그대로(ylw.im.fillProcs → 「저장」 → ylw.im.fillMats → 「저장」). 옛 길: 일괄등록(525162) → 500299 대조·투입공정 고침 → 폼 완료. 먼저 공통.js → 불러오기-공통.js. 두 화면을 열어 둔다(Home.OpenPageSeq).
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
    for (let t = 0; t < 30; t++) {
      const ok = document.getElementById('msgBtnOk');   // 맨 위 문서 #messagePopup · input 단추
      if (ok && ok.getClientRects().length) { const box = document.getElementById('messageBoxInfo') || ok.parentElement.parentElement, msg = S(box.textContent).replace(/\s+/g, ' ').trim().slice(0, 80); ok.click(); await Y.sleep(600); return msg; }
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
    await alertOk();   // 글로 판정하지 않는다(#messageBoxInfo 는 숨은 시트 오류 틀 글도 담고 있다) — 다시 조회해 등록여부로 본다
    tool('525162', '조회'); await Y.sleep(2500);
    const after = Y.rows(sh).find((r) => r.ItemNo === code);
    if (!after || after.IsReg !== '1') throw new Error(code + ' 일괄등록 뒤 등록여부 꺼짐');
    return '일괄등록 됨';
  };
  const open = async (code, want) => {
    const w = Y.win('500299'), d = w.document;
    w.confirm = () => false;
    tool('500299', '신규'); await Y.sleep(1500);
    const el = d.getElementById('txtItemNo_txt'), ko = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
    el.focus(); el.value = code; el.dispatchEvent(new Event('input', { bubbles: true }));
    ['keydown', 'keypress', 'keyup'].forEach((t) => el.dispatchEvent(new KeyboardEvent(t, ko)));
    let t = 0; while (!(d.getElementById('txtItemName_txt').value && Y.rows(d.getElementById('SS1')).length) && t < 40) { await Y.sleep(250); t++; }
    await Y.sleep(1200);
    // 소요자재전체보기: 조회 뒤에는 켜져 있어도 고른 공정 것만 보인다. 칸 click() 은 자료를 안 불러온다 — 라벨(chkIsMatAll_lbl)을 마우스로 눌러 자재 수가 폼과 같아질 때까지(11-04)
    const lab = d.getElementById('chkIsMatAll_lbl'), s2 = d.getElementById('SS2');
    for (let i = 0; i < 4 && Y.rows(s2).length !== want; i++) { mouse(w, lab); await Y.sleep(1500); }
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
  // ── 폼 v345(11-26 사장님 「영림원과 맞춰주세요」): 문서 procs(13칸)·mats(15칸)를 500299 공정 표(SS1)·소요자재 표(SS2)에 그대로 넣는다(525162 일괄등록 대신).
  //   칸 = 화면 그대로(11-26 화면 칸 정의): SS1 공정순서 ProcNo · 공정 ProcName · 후속공정순서 ToProcNo · 워크센터 WorkCenterName · 시간단위 TimeUnitName(목록) · 표준 작업시간 WorkHour ·
  //     공정품명 AssyItemName · 공정품번 AssyItemNo · 규격 AssySpec · 단위 UnitName(보기만) · 공정검사여부 IsProcQC(체크) · 최종공정여부 IsLastProc(체크, 보기만) · 제조방법등록여부 IsItemProcMethod(보기만)
  //   SS2 표시순서 UserNo · 투입공정 ProcName · 자재명 MatItemName · 자재번호 MatItemNo · 규격 MatSpec · 투입단위 UnitName · 소요량(분자)·(분모) · 조달구분 SMDelvTypeName(목록) ·
  //     품목자산분류 AssetName(보기만) · 반제품공정차수 SubItemProcRevName · 내부Loss율 InLossRate · 외부Loss율 OutLossRate · 조립위치 Location · 특이사항 Remark
  //   여러 줄 = Y.pasteRows(\r\n). 이름·규격 코드도움 칸은 번호(공정품번·자재번호)만 붙여 창이 안 뜨게 한다(BOM 업로드와 같은 까닭). 저장은 누르지 않는다 → fillProcs → 「저장」 → fillMats → 모두맞음 → 「저장」 → check2 다시.
  //   ⚠ 11-26 스크립트만 — 500299 에 실제로 붙여 본 범위는 작업일지 11-26 「v345」 절(새 제품 고르기·저장은 시험 안 함).
  const yes = (x) => x === true || /^(1|true|y|예|✓)$/i.test(S(x).trim());
  const n0 = (x) => (S(x).trim() === '' ? 0 : Number(x));
  const P1 = (p) => ({ ProcNo: S(p.seq), ProcName: S(p.proc), ToProcNo: S(p.next), WorkCenterName: S(p.wc), TimeUnitName: S(p.tunit), WorkHour: S(p.time), AssyItemName: S(p.pname), AssyItemNo: S(p.pcode), AssySpec: S(p.pspec), UnitName: S(p.punit), IsProcQC: yes(p.insp) ? '1' : '0', IsLastProc: yes(p.last) ? '1' : '0', IsItemProcMethod: yes(p.method) ? '1' : '0' });
  const P2 = (m) => ({ UserNo: S(m.order), ProcName: S(m.proc), MatItemName: S(m.cname), MatItemNo: S(m.ccode), MatSpec: S(m.cspec), UnitName: S(m.inunit), NeedQtyNumerator: S(m.qn), NeedQtyDenominator: S(m.qd), SMDelvTypeName: S(m.supply), AssetName: S(m.asset), SubItemProcRevName: S(m.srev), InLossRate: S(m.inLoss), OutLossRate: S(m.outLoss), Location: S(m.pos), Remark: S(m.note) });
  const NUM = ['ProcNo', 'ToProcNo', 'WorkHour', 'UserNo', 'NeedQtyNumerator', 'NeedQtyDenominator', 'InLossRate', 'OutLossRate'], CHK = ['IsProcQC', 'IsLastProc', 'IsItemProcMethod'];
  // ⚠ 11-26 시험: 투입공정 코드도움은 **저장된 공정만** 찾는다 — 공정 표를 저장하기 전에 소요자재 표를 넣으면 투입공정 코드(ProcSeq)가 0 으로 남고
  //   「저장」 = 「[ 공정내부코드 ] 필수항목이 누락되었습니다.」 → 두 번에 나눈다: fillProcs → check2(공정 표) → 사람 「저장」 → fillMats → check2 → 사람 「저장」.
  const fillProcs = async (v) => {
    const d = Y.win('500299').document, s1 = d.getElementById('SS1'), s2 = d.getElementById('SS2');
    if (d.getElementById('txtItemNo_txt').value !== v.code) throw new Error('500299 머리 제품번호가 ' + v.code + ' 아님 — 「신규」 → 제품을 고른 뒤');
    if (Y.rows(s1).length || Y.rows(s2).length) throw new Error('500299 표가 비어 있지 않음(이미 등록된 제품?) — 넣지 않음');
    const A = (v.procs || []).map(P1);
    await Y.pasteRows(s1, 0, 'ProcNo', A.map((r) => [r.ProcNo, r.ProcName, r.ToProcNo, r.WorkCenterName]));
    await Y.pasteRows(s1, 0, 'TimeUnitName', A.map((r) => [r.TimeUnitName, r.WorkHour]));   // 워크센터를 고르면 「분 · 0」이 저절로 들어가므로 그 뒤에 한 번 더
    if (A.some((r) => r.AssyItemNo)) await Y.pasteRows(s1, 0, 'AssyItemNo', A.map((r) => [r.AssyItemNo]));
    A.forEach((r, i) => { if (r.IsProcQC === '1') Y.setChk(s1, i, 'IsProcQC', true); if (r.IsLastProc === '1') Y.setChk(s1, i, 'IsLastProc', true); });
    return check2(v, 'procs');
  };
  const fillMats = async (v) => {
    const d = Y.win('500299').document, s1 = d.getElementById('SS1'), s2 = d.getElementById('SS2');
    if (d.getElementById('txtItemNo_txt').value !== v.code) throw new Error('500299 머리 제품번호가 ' + v.code + ' 아님');
    if (!Y.rows(s1).length || Y.rows(s1).some((r) => r.WorkingTag || !+r.ProcSeq)) throw new Error('공정 표를 먼저 「저장」(투입공정은 저장된 공정만 잡힘)');
    if (Y.rows(s2).length) throw new Error('소요자재 표가 비어 있지 않음 — 넣지 않음');
    const B = (v.mats || []).map(P2);
    // ⚠ 11-26 시험: [표시순서, 투입공정] 를 여러 줄 한 번에 붙이면 둘째 줄부터 안 들어감(0·빈칸) → 이 덩이만 한 줄씩
    for (let i = 0; i < B.length; i++) await Y.paste(s2, i, 'UserNo', [B[i].UserNo, B[i].ProcName], 1500);
    await Y.pasteRows(s2, 0, 'MatItemNo', B.map((r) => [r.MatItemNo]));
    await Y.pasteRows(s2, 0, 'UnitName', B.map((r) => [r.UnitName, r.NeedQtyNumerator, r.NeedQtyDenominator, r.SMDelvTypeName]));
    await Y.pasteRows(s2, 0, 'NeedQtyNumerator', B.map((r) => [r.NeedQtyNumerator, r.NeedQtyDenominator]));   // 코드도움이 소요량을 되돌릴 때 대비(BOM 과 같은 꼴)
    if (B.some((r) => r.SubItemProcRevName || r.InLossRate || r.OutLossRate || r.Location || r.Remark)) await Y.pasteRows(s2, 0, 'SubItemProcRevName', B.map((r) => [r.SubItemProcRevName, r.InLossRate, r.OutLossRate, r.Location, r.Remark]));
    const bad = Y.rows(s2).filter((r) => !+r.ProcSeq).map((r) => r.IDX_NO);
    const c = check2(v);
    if (bad.length) { c.모두맞음 = false; c.틀린칸.push('소요자재 표 ' + bad.join('·') + '행 투입공정 코드(ProcSeq) 0 — 코드도움이 안 잡힘'); }
    return c;
  };
  // 화면 두 표의 보이는 칸 전부 ↔ 문서. 숫자는 수로(빈칸 = 0), 체크는 1/0. 보기만 칸(단위·품목자산분류·제조방법등록여부)도 문서 값과 맞춤(영림원이 채운 값).
  const check2 = (v, only) => {
    const d = Y.win('500299').document, bad = [];
    const one = (sh, want, name) => {
      const rows = Y.rows(sh);
      if (rows.length !== want.length) bad.push(name + ' 줄 수 문서 ' + want.length + ' / 화면 ' + rows.length);
      want.forEach((f, i) => { const r = rows.find((x) => +x.IDX_NO === i + 1) || {}; for (const k of Object.keys(f)) {
        const a = S(r[k]).trim(), b = f[k];
        const ok = CHK.includes(k) ? (yes(a) ? '1' : '0') === b : NUM.includes(k) ? n0(a) === n0(b) : a === b;
        if (!ok) bad.push(name + ' ' + (i + 1) + '행 ' + k + ': 문서 ' + (b || '(빈칸)') + ' / 화면 ' + (a || '(빈칸)'));
      } });
    };
    one(d.getElementById('SS1'), (v.procs || []).map(P1), '공정 표');
    if (only !== 'procs') one(d.getElementById('SS2'), (v.mats || []).map(P2), '소요자재 표');
    const unit = d.querySelector('select[id*=BizUnit],select[id*=Unit]');
    if (v.unit && unit && unit.selectedIndex >= 0 && unit.options[unit.selectedIndex].text !== v.unit) bad.push('사업단위 문서 ' + v.unit + ' / 화면 ' + unit.options[unit.selectedIndex].text);
    return { 모두맞음: !bad.length, 틀린칸: bad };
  };
  Y.im = {
    cmp, open, fillProcs, fillMats, check2,
    async go(code, again) {   // again = 진행중으로 멈춘 건 이어서(일괄등록이 이미 됐으면 건너뜀)
      const l = await Y.imp.list('erp_itemmats'), v = l.find((x) => x.code === code);
      if (!v || !(v.status === '대기' || (again && v.status === '진행중'))) throw new Error(code + ' 대기 아님: ' + (v && v.status));
      if (v.status === '대기') await Y.imp.patch('erp_itemmats', v.id, { status: '진행중' });
      const said = await reg(code);
      await open(code, v.mats.length);
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
        await open(code, v.mats.length);
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
