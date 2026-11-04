// BOM등록(500145) 등록된 BOM 에 줄 더하기 — 폼 erp_boms 수정대기(edit.added) 처리. 저장은 사람이 누른다(또는 도구 진짜 클릭). 먼저 공통.js → 불러오기-공통.js.
// 요령 = 화면별-요령.md 「등록된 BOM 에 줄 더하기 — 실제 시험」 · 처리 순서 = AGENTS.md 3-4-엣지.
// 쓰는 법: 500145 탭을 앞으로 → await ylw.bomAdd.prep('품번') (대기 확인·영림원 값 ↔ edit.before 대조·진행중·줄 붙여넣기·저장 전 대조, 틀리면 throw)
//   → 툴바 「저장」 → 알림 「확인」 → 「조회」 → await ylw.bomAdd.done('품번') (옛 줄 그대로·새 줄·상위 공정 대조 뒤 폼 완료, 틀리면 throw — 폼은 진행중으로 남고 사람이 본다).
// ⚠ 공정 칸은 건드리지 않는다. T엣지 는 BOM 에 안 남고 9단계 투입공정 값.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.imp) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const W = () => Y.win('500145'), D = () => W().document, SH = () => D().getElementById('SSNew');
  const S = (x) => (x == null ? '' : String(x)), N = (x) => Number(x);
  const skip = /^(Selected|Status|DataSeq|IDX_NO)$/;
  let held = {};
  const doc = async (code) => (await Y.imp.list('erp_boms')).find((x) => x.pcode === code);
  const open = async (code) => {
    const d = D(), el = d.getElementById('txtItemNoTree_txt'), ko = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
    el.focus(); el.value = code; el.dispatchEvent(new Event('input', { bubbles: true }));
    ['keydown', 'keypress', 'keyup'].forEach((t) => el.dispatchEvent(new KeyboardEvent(t, ko)));
    let t = 0; while (d.getElementById('txtItemNo_txt').value !== code && t < 40) { await Y.sleep(250); t++; }
    await Y.sleep(1500);
    if (d.getElementById('txtItemNo_txt').value !== code) throw new Error(code + ' 안 열림');
  };
  // 한 줄 = 화면 칸 대조(폼 칸은 폼 값, 나머지는 빈칸/0, 자동 칸 제외)
  const badRow = (r, a) => {
    const want = { UserSeq: a.order, SubItemName: a.cname, SubItemNo: a.ccode, Spec: a.cspec, UnitName: a.inunit, NeedQtyNumerator: a.qn, NeedQtyDenominator: a.qd }, bad = [];
    for (const c of Y.read.cols(SH())) {
      const got = S(r[c.field]);
      if (c.field in want) { if (!(got === S(want[c.field]) || (got !== '' && N(got) === N(want[c.field])))) bad.push(c.title + ': 폼 ' + want[c.field] + ' / 화면 ' + got); }
      else if (got !== '' && N(got) !== 0 && !['AssetName', 'StkUnitName', 'SubItemBomRevName'].includes(c.field)) bad.push(c.title + ': 빈칸이어야 함 / 화면 ' + got);
    }
    return bad;
  };
  Y.bomAdd = {
    async prep(code) {
      const b = await doc(code);
      if (!b || b.status !== '수정대기') throw new Error(code + ' 수정대기 아님: ' + (b && b.status));
      const add = (b.edit && b.edit.added) || [], before = b.edit.before.rows;
      if (!add.length || !add.every((a) => /^T/i.test(a.ccode))) throw new Error(code + ' 더할 줄 이상');
      await open(code);
      const sh = SH(), rows = Y.rows(sh), d = D();
      if (rows.some((r) => r.WorkingTag)) throw new Error(code + ' 화면에 저장 안 한 줄');
      if (rows.length !== before.length || !before.every((p, i) => { const r = rows.find((x) => S(x.SubItemNo) === p.ccode); return r && N(r.NeedQtyNumerator) === N(p.qn) && N(r.NeedQtyDenominator) === N(p.qd) && S(r.UserSeq) === S(p.order); })) throw new Error(code + ' 영림원 값이 edit.before 와 다름');
      const proc = d.getElementById('txtProcName_txt').value;
      if (proc !== before[0].proc) throw new Error(code + ' 상위 공정 다름: ' + proc);
      held[code] = { rows: JSON.parse(JSON.stringify(rows)), proc };
      await Y.imp.patch('erp_boms', b.id, { status: '진행중' });
      for (let i = 0; i < add.length; i++) {
        const row0 = rows.length + i, a = add[i];
        await Y.paste(sh, row0, 'SubItemNo', [a.ccode], 2000);
        await Y.paste(sh, row0, 'NeedQtyNumerator', [a.qn, a.qd], 1200);
        await Y.paste(sh, row0, 'UserSeq', [a.order], 1000);
      }
      const now = Y.rows(sh), bad = [];
      add.forEach((a) => { const r = now.find((x) => S(x.SubItemNo) === a.ccode); if (!r) bad.push(a.ccode + ' 줄 없음'); else bad.push(...badRow(r, a)); });
      if (now.length !== rows.length + add.length) bad.push('줄 수 ' + now.length);
      held[code].rows.forEach((o) => { const r = now.find((x) => x.Serl === o.Serl); if (!r) bad.push('옛 줄 없음 Serl ' + o.Serl); else Object.keys(o).forEach((k) => { if (!skip.test(k) && S(o[k]) !== S(r[k])) bad.push('옛 줄 ' + k + ' 바뀜'); }); });
      if (d.getElementById('txtProcName_txt').value !== proc) bad.push('상위 공정 바뀜');
      if (bad.length) throw new Error(code + ' 저장 전 대조 틀림(저장 안 함, 폼 진행중): ' + bad.join(' · '));
      return code + ' 저장 전 대조 맞음 · 더할 줄 ' + add.map((a) => a.ccode + ' ' + a.qn + '/' + a.qd + a.inunit).join(', ');
    },
    async done(code) {
      const b = await doc(code), h = held[code];
      if (!b || b.status !== '진행중' || !h) throw new Error(code + ' 진행중 아님');
      await open(code);
      const now = Y.rows(SH()), add = b.edit.added, bad = [], d = D();
      if (d.getElementById('txtItemNo_txt').value !== code) bad.push('다른 품목 화면');
      if (now.length !== h.rows.length + add.length) bad.push('줄 수 ' + now.length);
      if (now.some((r) => r.WorkingTag)) bad.push('저장 안 된 줄');
      h.rows.forEach((o) => { const r = now.find((x) => x.Serl === o.Serl); if (!r) bad.push('옛 줄 없음'); else Object.keys(o).forEach((k) => { if (!skip.test(k) && S(o[k]) !== S(r[k])) bad.push('옛 줄 ' + k + ': ' + o[k] + ' → ' + r[k]); }); });
      add.forEach((a) => { const r = now.find((x) => S(x.SubItemNo) === a.ccode); if (!r) bad.push(a.ccode + ' 없음'); else { bad.push(...badRow(r, a)); if (S(r.SubItemBomRevName) !== '00') bad.push('차수 ' + r.SubItemBomRevName); } });
      if (d.getElementById('txtProcName_txt').value !== h.proc) bad.push('상위 공정 바뀜');
      if (bad.length) throw new Error(code + ' 저장 뒤 대조 틀림(폼 진행중): ' + bad.join(' · '));
      const e = b.edit, note = '영림원 수정함(11-04): BOM등록(500145) 필름 줄 추가 · 공정 ' + h.proc + ' 그대로 — T엣지는 9단계 투입공정 · 대조 맞음';
      await Y.imp.patch('erp_boms', b.id, { status: '완료', agentNote: note, edit: null, editLog: (b.editLog || []).concat([{ at: new Date().toISOString(), kind: '완료', changed: e.changed, before: e.before, after: e.after, note }]) });
      return code + ' 완료 · 화면 ' + now.length + '줄 · Serl ' + now.map((r) => r.Serl).join(',');
    },
  };
  return 'BOM 줄 추가 준비됨';
})();
