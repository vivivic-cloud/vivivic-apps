// 소요자재 500299 직접 입력 도우미(11-28, 이 방 전용 — 소요자재-채우기.js 위에 얹음)
ylw.sleep = (ms) => { ms = Number.isFinite(ms) ? Math.min(ms, 60000) : 1500; return new Promise(res => { const end = performance.now() + ms; const ch = new MessageChannel(); ch.port1.onmessage = () => { if (performance.now() >= end) { ch.port1.close(); res(); } else ch.port2.postMessage(0); }; ch.port2.postMessage(0); }); };
const S = x => x == null ? '' : String(x), yes = x => x === true || /^(1|true|y|예|✓)$/i.test(S(x).trim());
const W = () => ylw.win('500299').document;
window.__onlyAsset = (c) => c.틀린칸.filter(t => !/^소요자재 표 \d+행 AssetName: 문서 \(빈칸\) \/ 화면 (원자재|재공품|반제품|부자재)$/.test(t));
window.__popClose = async () => { let n = 0; for (let k = 0; k < 3; k++) { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^(생산 품번|자재|공정|워크센터|품목|생산품번)$/.test(e.textContent.trim()) && e.getClientRects().length && e.getBoundingClientRect().top < 250 && e.getBoundingClientRect().left > 300); if (!t) break; let box = t; for (let j = 0; j < 10 && box; j++) { const x = [...box.querySelectorAll('a,button,span,i')].find(b => /close|닫기/i.test((b.className || '') + (b.title || '') + (b.getAttribute && b.getAttribute('aria-label') || '')) && b.getClientRects().length); if (x) { x.click(); n++; await ylw.sleep(1200); break; } box = box.parentElement; } } return n; };
window.__save = async (sid) => { sid = sid || 'SS2'; await __popClose(); const w = ylw.win('500299'), d = w.document, b = [...d.querySelectorAll('a')].find(e => /^\s*저장\s*$/.test(e.textContent));
  const click = () => { const r = b.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: w, clientX: r.x + 5, clientY: r.y + 5, button: 0 }; for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) b.dispatchEvent(new (t.startsWith('pointer') ? w.PointerEvent : w.MouseEvent)(t, o)); };
  for (let a = 0; a < 2; a++) { click(); for (let i = 0; i < 360; i++) { await ylw.sleep(500); const ok = document.getElementById('msgBtnOk'); if (ok && ok.getClientRects().length) { const msg = S((document.getElementById('messageBoxInfo') || {}).textContent).replace(/\s+/g, ' ').trim().slice(0, 200); ok.click(); await ylw.sleep(800); return { msg }; } if (!ylw.rows(d.getElementById(sid)).some(x => x.WorkingTag)) return { msg: '' }; } }
  return { msg: '' }; };
window.__discard = async () => {
  const b = document.querySelector('li[pgmseq="500299"] a.devBtnCloseOpenPage'); if (b) { const r = b.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: window, clientX: r.x + 3, clientY: r.y + 3, button: 0 }; for (const t of ['mousedown', 'mouseup', 'click']) b.dispatchEvent(new MouseEvent(t, o)); await ylw.sleep(2000); }
  if (document.getElementById('500299_iframe')) { const pop = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /변경된 내용이 반영되지 않습니다/.test(e.textContent) && e.getClientRects().length); if (!pop) throw new Error('닫기 확인창 못 찾음');
    let box = pop; for (let k = 0; k < 8 && box && ![...box.querySelectorAll('button,a,input')].some(x => /^\s*확인\s*$/.test(x.textContent || x.value)); k++) box = box.parentElement;
    [...box.querySelectorAll('button,a,input')].find(x => /^\s*확인\s*$/.test(x.textContent || x.value)).click(); await ylw.sleep(2000); }
  if (document.getElementById('500299_iframe')) throw new Error('500299 안 닫힘');
  Home.OpenPageSeq(500299); for (let i = 0; i < 40 && !document.getElementById('500299_iframe'); i++) await ylw.sleep(500); await ylw.sleep(5000); return 'reopened'; };
const waitRow = async (sh, i, test) => { let r; for (let w = 0; w < 360; w++) { r = ylw.rows(sh).find(x => +x.IDX_NO === i + 1) || {}; if (test(r)) return { r, ok: true }; await ylw.sleep(500); } return { r, ok: false }; };
window.__fillProcs = async (v) => {
  const d = W(), s1 = d.getElementById('SS1'), code = v.code;
  if (d.getElementById('txtItemNo_txt').value !== code) throw new Error(code + ' 머리 다름');
  if (ylw.rows(s1).length) throw new Error(code + ' 공정 표 비어 있지 않음');
  const good = p => r => +r.ProcNo === +p.seq && S(r.ProcName) === S(p.proc) && +r.ToProcNo === +p.next && S(r.WorkCenterName) === S(p.wc) && S(r.TimeUnitName) === S(p.tunit) && +r.WorkHour === +p.time && S(r.AssyItemNo) === S(p.pcode);
  for (let i = 0; i < v.procs.length; i++) { const p = v.procs[i]; let k;
    for (let t = 0; t < 3; t++) {
      const cur = ylw.rows(s1).find(x => +x.IDX_NO === i + 1) || {};
      if (!(+cur.ProcNo === +p.seq && S(cur.ProcName) === S(p.proc) && S(cur.WorkCenterName) === S(p.wc))) { await ylw.paste(s1, i, 'ProcNo', [S(p.seq), S(p.proc), S(p.next), S(p.wc)], 2800); await waitRow(s1, i, r => S(r.WorkCenterName) === S(p.wc)); }
      const c2 = ylw.rows(s1).find(x => +x.IDX_NO === i + 1) || {}; if (!(S(c2.TimeUnitName) === S(p.tunit) && +c2.WorkHour === +p.time)) await ylw.paste(s1, i, 'TimeUnitName', [S(p.tunit), S(p.time)], 1800);
      const c3 = ylw.rows(s1).find(x => +x.IDX_NO === i + 1) || {}; if (S(p.pcode) && S(c3.AssyItemNo) !== S(p.pcode)) await ylw.paste(s1, i, 'AssyItemNo', [S(p.pcode)], 2800);
      k = await waitRow(s1, i, good(p)); if (k.ok) break;
      await __popClose(); const ok = document.getElementById('msgBtnOk'); if (ok && ok.getClientRects().length) { ok.click(); await ylw.sleep(800); }
    }
    if (!k.ok) throw new Error(code + ' 공정 ' + (i + 1) + '행 세 번 넣어도 안 맞음: ' + [k.r.ProcNo, k.r.ProcName, k.r.ToProcNo, k.r.WorkCenterName, k.r.TimeUnitName, k.r.WorkHour, k.r.AssyItemNo].join('/'));
    if (yes(p.insp)) ylw.setChk(s1, i, 'IsProcQC', true); if (yes(p.last)) ylw.setChk(s1, i, 'IsLastProc', true);
  }
  await ylw.sleep(2500); await __popClose(); return ylw.im.check2(v, 'procs'); };
window.__fillMats = async (v) => {
  const d = W(), s1 = d.getElementById('SS1'), s2 = d.getElementById('SS2'), code = v.code;
  if (d.getElementById('txtItemNo_txt').value !== code) throw new Error(code + ' 머리 다름');
  if (!ylw.rows(s1).length || ylw.rows(s1).some(r => r.WorkingTag || !+r.ProcSeq)) throw new Error(code + ' 공정 표 먼저 저장');
  if (ylw.rows(s2).length) throw new Error(code + ' 소요자재 표 비어 있지 않음');
  const good = m => r => S(r.MatItemNo) === S(m.ccode) && +r.UserNo === +m.order && +r.NeedQtyNumerator === +m.qn && +r.NeedQtyDenominator === +m.qd && S(r.UnitName) === S(m.inunit) && S(r.SMDelvTypeName) === S(m.supply) && S(r.ProcName) === S(m.proc) && +r.ProcSeq;
  for (let i = 0; i < v.mats.length; i++) { const m = v.mats[i]; let k;
    for (let t = 0; t < 3; t++) {
      const cur = ylw.rows(s2).find(x => +x.IDX_NO === i + 1) || {};
      if (S(cur.MatItemNo) !== S(m.ccode)) { await ylw.paste(s2, i, 'MatItemNo', [S(m.ccode)], 3000); await waitRow(s2, i, r => S(r.MatItemNo) === S(m.ccode) && S(r.UnitName)); }
      await ylw.paste(s2, i, 'UserNo', [S(m.order), S(m.proc)], 2000);
      await ylw.paste(s2, i, 'UnitName', [S(m.inunit), S(m.qn), S(m.qd), S(m.supply)], 2000);
      if (S(m.srev) || S(m.inLoss) || S(m.outLoss) || S(m.pos) || S(m.note)) await ylw.paste(s2, i, 'SubItemProcRevName', [S(m.srev), S(m.inLoss), S(m.outLoss), S(m.pos), S(m.note)], 1500);
      k = await waitRow(s2, i, good(m)); if (k.ok) break;
      await __popClose(); const ok = document.getElementById('msgBtnOk'); if (ok && ok.getClientRects().length) { ok.click(); await ylw.sleep(800); }
    }
    if (!k.ok) throw new Error(code + ' 소요자재 ' + (i + 1) + '행 세 번 넣어도 안 맞음: ' + [k.r.UserNo, k.r.MatItemNo, k.r.ProcName, k.r.NeedQtyNumerator, k.r.NeedQtyDenominator, k.r.UnitName, k.r.SMDelvTypeName].join('/'));
  }
  await ylw.sleep(2000); return ylw.im.check2(v); };
const NOTE = v => '500299 직접 입력(폼 v345): 공정 ' + v.procs.length + '줄 저장 → 소요자재 ' + v.mats.length + '줄 저장 · 다시 열어 모든 칸 대조 맞음(품목자산분류는 보기 전용 — 영림원이 자재등록 값으로 채움) · 공정차수 ' + v.rev + ' (11-28)';
window.__done = async (v) => { const code = v.code; await ylw.im.open(code, v.mats.length); const bad = __onlyAsset(ylw.im.check2(v)); if (bad.length) throw new Error(code + ' 저장 뒤 대조: ' + bad.join(' · '));
  await ylw.imp.patch('erp_itemmats', v.id, { status: '완료', agentNote: NOTE(v) });
  const x = (await ylw.imp.list('erp_itemmats')).find(y => y.id === v.id); if (x.status !== '완료') throw new Error(code + ' 폼 동기화: 상태 ' + x.status); return code; };
window.__mats = async (v) => { const bad = __onlyAsset(await __fillMats(v)); if (bad.length) throw new Error(v.code + ' 소요자재 저장 전 대조: ' + bad.join(' · '));
  const s = await __save('SS2'); if (ylw.rows(W().getElementById('SS2')).some(r => r.WorkingTag)) throw new Error(v.code + ' 소요자재 저장 안 됨 ' + JSON.stringify(s)); return await __done(v); };
// 한 건: 대기 → 진행중 → 공정 → 저장 → 소요자재 → 저장 → 대조 → 완료. 진행중(공정만 저장된) 건은 이어서.
window.__one = async (code) => {
  const v = (await ylw.imp.list('erp_itemmats')).find(x => x.code === code);
  if (!v || !(v.status === '대기' || v.status === '진행중')) throw new Error(code + ' 대기 아님 ' + (v && v.status));
  if (v.wips && v.wips.length) throw new Error(code + ' wips 있음 — 손으로');
  if (v.status === '대기') await ylw.imp.patch('erp_itemmats', v.id, { status: '진행중' });
  await ylw.im.open(code, 0); const d = W();
  if (d.getElementById('txtItemNo_txt').value !== code) throw new Error(code + ' 제품 못 엶');
  const sel = i => { const e = d.getElementById(i); return e.options[e.selectedIndex].text; };
  if (sel('cmbProcRev_ul') !== v.rev) throw new Error(code + ' 공정차수 ' + sel('cmbProcRev_ul'));
  if (sel('cmbProcType_ul') !== v.flow) throw new Error(code + ' 공정흐름 화면 ' + sel('cmbProcType_ul') + ' / 문서 ' + v.flow);
  const s1 = d.getElementById('SS1'), s2 = d.getElementById('SS2');
  if (ylw.rows(s1).length) {   // 이미 공정 저장됨(앞서 멈춘 건)
    if (ylw.rows(s1).some(r => r.WorkingTag)) throw new Error(code + ' 공정 표 저장 안 된 줄');
    const bad = __onlyAsset(ylw.im.check2(v, 'procs')); if (bad.length) throw new Error(code + ' 저장된 공정 표 다름: ' + bad.join(' · '));
    if (ylw.rows(s2).length) { if (ylw.rows(s2).some(r => r.WorkingTag)) throw new Error(code + ' 소요자재 저장 안 된 줄'); return await __done(v); }
    return await __mats(v);
  }
  const bad = __onlyAsset(await __fillProcs(v)); if (bad.length) throw new Error(code + ' 공정 표 저장 전 대조: ' + bad.join(' · '));
  const s = await __save('SS1'); if (ylw.rows(s1).some(r => r.WorkingTag)) throw new Error(code + ' 공정 표 저장 안 됨 ' + JSON.stringify(s));
  return await __mats(v); };
window.__run = (list) => { window.__g = { 끝: false, 결과: [] }; (async () => { for (const c of list) { __g.cur = c; try { __g.결과.push(await __one(c)); } catch (e) { __g.오류 = S(e.message || e); try { await __discard(); __g.버림 = 1; } catch (e2) { __g.버림 = 'ERR ' + e2.message; } break; } } __g.끝 = true; })(); return '시작 ' + list.length; };
'도우미 준비됨';
