// 외주발주(501617) — 업체별 한 장으로 저장. 공통.js 먼저.
// 받는 것: 외주거래처 이름, 줄 수, 작업지시번호를 고르는 정규식, (있으면) 조회에 쓸 작업지시번호는 화면에서 미리 넣는다.
// 규칙(사장님 11-08):
//   - 외주발주일 = 영림원에 저장하는 그날. 저장 전에 501617 을 닫고 다시 열어 오늘인지 읽고, 아니면 멈춘다.
//   - 업체별로 한 장. 같은 외주거래처 줄을 모두 골라 넘긴다.
//   - 납기일은 고치지 않는다. 막히면 멈추고 폼에 오류 + agentNote(폼에 없는 날짜를 넣지 않는다).
// 쓰는 법: await ylw.po.vendor('T이룸', 12, /^202611070001/)  → {no, 줄, 소요자재}
// 확인: 같은 흐름을 11-08 손·임시 스크립트로 5장 저장. 이 파일 그대로는 저장 시험 전이고, reopen · dateGuard 만 화면에서 봤다.
(function () {
  const Y = window.ylw; if (!Y || !Y.reopen) throw new Error('공통.js 먼저');
  const until = async (f, ms, what) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (f()) return; } catch (e) {} await Y.sleep(400); } throw new Error('시간초과 ' + what); };
  const btn = (page, text) => {
    const w = Y.win(page);
    const b = [...w.document.querySelectorAll('a')].find((e) => e.textContent.trim() === text) || [...w.document.querySelectorAll('button')].find((e) => e.textContent.trim() === text && e.getBoundingClientRect().width > 0);
    if (!b) throw new Error(page + ' 단추 없음 ' + text);
    const r = b.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: w, clientX: r.x + 5, clientY: r.y + 5, button: 0 };
    for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) b.dispatchEvent(new (t.startsWith('pointer') ? w.PointerEvent : w.MouseEvent)(t, o));
  };
  const items = (p) => Y.rows(p.SS1).filter((x) => x.ItemNo);
  Y.po = {
    vendor: async (vc, n, woRe) => {
      await Y.reopen(501617); Y.dateGuard(501617, 'datPODate_dat');
      Home.OpenPageSeq(501608); await Y.sleep(900); btn(501608, '조회'); await Y.sleep(3200);
      const s = Y.win(501608).SS1, rr = Y.rows(s);
      const idx = rr.map((x, i) => (woRe.test(x.WorkOrderNo) && x.CustName === vc && +x.POQty === 0 ? i : -1)).filter((i) => i >= 0);
      if (idx.length !== n) throw new Error('줄 수 ' + idx.length + '/' + n);
      for (const i of idx) { s.SetText(i, 'Sel', '1'); await Y.sleep(120); }
      await Y.sleep(300); btn(501608, '외주발주');
      await until(() => items(Y.win(501617)).filter((x) => x.WorkingTag === 'A').length === n, 20000, '발주 화면');
      const p = Y.win(501617); await Y.sleep(1800);
      Y.dateGuard(501617, 'datPODate_dat');
      if (p.document.getElementById('txtCustName_txt').value !== vc) throw new Error('업체 다름');
      const a = items(p);
      for (const x of a) {
        const src = rr.find((r) => r.WorkOrderNo === x.WorkOrderNo && r.ProcName === x.ProcName);
        if (!src || +x.Qty !== +src.OrderQty || x.WHName !== vc || !(+x.Price > 0)) throw new Error('대조 틀림 ' + [x.ItemNo, x.ProcName, x.Qty, x.WHName, x.Price]);
      }
      btn(501617, '저장');
      await until(() => items(p).every((x) => x.WorkingTag === ''), 15000, '첫 저장(시트 오류면 화면 문구를 폼에 오류로 적는다)');
      const no = [...p.document.querySelectorAll('input')].map((i) => i.value).find((v) => /^\d{12}$/.test(v));
      await Y.sleep(2200); btn(501617, '소요자재가져오기');
      await until(() => Y.rows(p.SS2).length > 0, 40000, '소요자재'); await Y.sleep(1500);
      const ms = Y.rows(p.SS2).map((x) => [x.MatItemNo, x.Qty, x.StockQty].join(' '));
      btn(501617, '저장');
      await until(() => Y.rows(p.SS2).every((x) => x.WorkingTag === ''), 15000, '둘째 저장');
      return { no, 줄: a.map((x) => [x.ItemNo, x.ProcName, x.WorkOrderNo, x.Price]), 소요자재: ms };
    },
  };
})();
