// 제품별공정별워크센터등록(500865) — 소요자재(500299)가 끝난 품목의 나머지 우선순위 줄 넣기(11-28).
// 먼저 공통.js → 불러오기-공통.js → 소요자재-채우기.js → 워크센터등록-품목별-채우기.js (ylw.iw.open·pick·cmp 를 씀).
// 왜: 500865 코드도움에는 500299 가 저장된 품목만 나온다(품목별공정흐름 500272 만으로는 안 나옴, 11-28 확인).
//     500299 를 넣는 방(11 소요자재)이 공정마다 우선순위 1 워크센터를 함께 저장 → 500865 에 1번 줄이 저절로 생김 → 여기선 2·3번 등 없는 줄만 붙임.
// 쓰는 법: await __ready() = 소요자재 완료 · 워크센터 대기 남은 품번 → __runItems(품번들) → window.__g 읽기(품목 하나 약 40초, 첫 오류에서 멈춤).
// 한 품목: 폼 대기 → 진행중 → 500865 신규·제품번호 Enter → 공정 수 = 소요자재 procs 수 → 공정마다(뒤 공정부터) 폼에 없는 줄 있으면 멈춤 → 없는 줄 붙임 → 대조 → 저장
//   → 「조회」 → 공정마다 다시 대조 → 폼 완료(agentNote). 저절로 되풀이하지 않는다(사장님 규칙) — 사람이 한 번씩 부른다.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.iw) throw new Error('먼저 공통.js → 불러오기-공통.js → 소요자재-채우기.js → 워크센터등록-품목별-채우기.js');
  const S = (x) => (x == null ? '' : String(x));
  const popup = () => { const ok = document.getElementById('msgBtnOk'); if (!ok || !ok.getClientRects().length) return ''; const b = document.getElementById('messagePopup') || ok.parentElement.parentElement; return S(b.textContent).replace(/\s+/g, ' ').trim(); };
  const tool = (name) => { const W = Y.win('500865'), D = W.document; const b = [...D.querySelectorAll('a')].find((e) => new RegExp('^\\s*' + name + '\\s*$').test(e.textContent)); const r = b.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: W, clientX: r.x + 5, clientY: r.y + 5, button: 0 }; for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) b.dispatchEvent(new (t.startsWith('pointer') ? W.PointerEvent : W.MouseEvent)(t, o)); };
  window.__item = async function (code) {
    const all = (await Y.imp.list('erp_itemwcs')).filter((x) => x.code === code);
    const im = (await Y.imp.list('erp_itemmats')).find((x) => x.code === code);
    if (!im || im.status !== '완료') throw new Error(code + ' 소요자재 완료 아님');
    const l = all.filter((x) => x.status === '대기'); if (!l.length) return code + ' 대기 없음';
    for (const v of l) if (im.procs.some((p) => +p.seq === +v.seq && p.proc === v.proc)) await Y.imp.patch('erp_itemwcs', v.id, { status: '진행중' });
    Home.OpenPageSeq(500865); await Y.sleep(1800);
    await Y.iw.open(code);
    const G = (k) => Y.win('500865').document.getElementById(k);
    if (Y.rows(G('SS1')).length !== im.procs.length) throw new Error(code + ' 공정 수 폼 ' + im.procs.length + ' / 화면 ' + Y.rows(G('SS1')).length);
    const procs = [...im.procs].sort((a, b) => b.seq - a.seq), done = [];
    for (const p of procs) {
      const list = all.filter((x) => +x.seq === +p.seq && x.proc === p.proc).sort((a, b) => a.rank - b.rank); if (!list.length) continue;
      await Y.iw.pick(p.seq, p.proc);
      const sh = G('SS2'), have = Y.rows(sh), extra = have.filter((r) => !list.some((v) => v.wc === S(r.WorkCenterName)));
      if (extra.length) throw new Error(code + ' ' + p.proc + ' 폼에 없는 줄: ' + extra.map((r) => r.WorkCenterName).join());
      const add = list.filter((v) => !have.some((r) => S(r.WorkCenterName) === v.wc));
      for (let i = 0; i < add.length; i++) { const v = add[i], r0 = have.length + i; await Y.paste(sh, r0, 'WorkCenterName', [v.wc], 1500); await Y.paste(sh, r0, 'TimeUnitName', [v.tunit, S(v.time), S(v.rank)], 1200); }
      const bad = Y.iw.cmp(list); if (bad.length) throw new Error(code + ' ' + p.proc + ' 저장 전 대조 틀림(저장 안 함): ' + bad.join(' · '));
      if (add.length) { tool('저장'); await Y.sleep(2500); const m = popup(); if (m) throw new Error(code + ' ' + p.proc + ' 저장 알림: ' + m); if (Y.rows(sh).some((r) => r.WorkingTag)) throw new Error(code + ' ' + p.proc + ' 저장 안 됨'); }
      done.push(p.proc + ':' + add.length + '/' + list.length);
    }
    tool('조회'); await Y.sleep(2500);
    for (const p of procs) { const list = all.filter((x) => +x.seq === +p.seq && x.proc === p.proc); if (!list.length) continue; await Y.iw.pick(p.seq, p.proc); const bad = Y.iw.cmp(list); if (bad.length) throw new Error(code + ' ' + p.proc + ' 저장 뒤 대조 틀림: ' + bad.join(' · ')); }
    const inProc = (x) => im.procs.some((p) => +p.seq === +x.seq && p.proc === x.proc);
    for (const v of all.filter((x) => x.status !== '완료')) {
      if (inProc(v)) await Y.imp.patch('erp_itemwcs', v.id, { status: '완료', agentNote: '영림원 제품별공정별워크센터등록 저장·다시 조회 대조 맞음' });
      else await Y.imp.patch('erp_itemwcs', v.id, { status: '오류', agentNote: '영림원에 안 넣음 — 공정 「' + v.seq + ' ' + v.proc + '」 이 소요자재(500299)·품목별공정흐름에 없음(옛 줄로 보임). 지금 공정 = ' + im.procs.map((p) => p.seq + ' ' + p.proc).join(', ') });
    }
    return code + ' ' + done.join(' ');
  };
  window.__runItems = function (codes) { window.__g = { 끝: false, 결과: [] }; (async () => { for (const c of codes) { try { window.__g.결과.push(await window.__item(c)); } catch (e) { window.__g.오류 = String(e.message || e); break; } } window.__g.끝 = true; })(); return '시작 ' + codes.length; };
  window.__ready = async () => { const im = (await Y.imp.list('erp_itemmats')).filter((x) => x.status === '완료').map((x) => x.code); const w = await Y.imp.list('erp_itemwcs'); return im.filter((c) => w.some((x) => x.code === c && x.status === '대기')); };
  return '나머지순위 준비됨';
})();
