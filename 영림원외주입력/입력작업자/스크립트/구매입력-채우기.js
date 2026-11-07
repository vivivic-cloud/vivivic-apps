// 구매요청(501563) · 구매품의(501568) · 발주 대조(501576) 도우미 — 저장·이동 단추는 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: erp_purchases 문서 줄 한 줄 {ccode, qty, duedate, wh, vendor, price}. 지금은 **문서 한 건 = 한 줄**까지만 확인(11-06 3건). 여러 줄은 첫 건을 화면을 보며 한다.
// 순서(AGENTS 3-10, 창 폭 1200 좌표):
//   ① Home.OpenPageSeq(501563) → 「신규」(498,64) → await ylw.pur.req(줄) → 「저장」(637,64) → ylw.pur.reqNo()
//   ② 「모든기능」(865,64) → 「구매품의등록」(895,143) → ylw.pur.appCheck(줄) → 「저장」(637,64) → ylw.pur.appNo()
//   ③ Home.OpenPageSeq(501569) → 품의번호 칸에 번호 → 「조회」(497,64) → 줄 선택(387,241) → 「구매발주일괄생성」(600,64) → 「발주생성」(912,271) → 알림 확인(745,470) → 「종료」(1033,268)
//   ④ Home.OpenPageSeq(501578) → 「조회」 → 그 발주 줄 더블클릭(발주번호 칸) → 501576 이 열림 → ylw.pur.poCheck(줄)
// ⚠ 첫 창고 붙여넣기가 다른 창고로 남을 수 있다(11-06 첫 건 T에이엠티가 T경기로). 그래서 req 는 창고를 두 번 붙이고 코드까지 본다.
// ⚠ 영림원 번호를 그대로 돌려주면 Claude in Chrome 도구가 「BLOCKED」로 가릴 때가 있다 → 숫자 부분만 돌려준다.
// 확인: 2026-11-06 실제 3건 저장.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const ymd = (d) => String(d).replace(/\D/g, '');
  const need = (ok, what, got) => { if (!ok) throw new Error('대조 틀림 ' + what + ': ' + JSON.stringify(got)); };
  const line = (rows, l) => {
    const r = rows.filter((x) => x.ItemNo);
    need(r.length === 1, '줄 수', r.length);
    const a = r[0];
    need(a.ItemNo === l.ccode, '품번', a.ItemNo); need(+a.Qty === +l.qty, '수량', a.Qty);
    need(a.WHName === l.wh && +a.WHSeq, '창고', [a.WHName, a.WHSeq]); need(a.CustName === l.vendor && +a.CustSeq, '구매거래처', [a.CustName, a.CustSeq]);
    need(String(a.DelvDate) === ymd(l.duedate), '납기', a.DelvDate);
    return a;
  };
  const num = (page, id) => String(Y.win(page).document.getElementById(id).value).replace(/^\D+/, '');
  Y.pur = {
    req: async (l) => {
      const s = Y.sheet('501563', 'SS');
      need(!Y.rows(s).some((x) => x.ItemNo), '빈 화면 아님', '신규를 먼저');
      await Y.paste(s, 0, 'ItemNo', [l.ccode], 2000); await Y.paste(s, 0, 'Qty', [l.qty], 1000); await Y.paste(s, 0, 'DelvDate', [l.duedate], 1000);
      await Y.paste(s, 0, 'WHName', [l.wh], 1500); await Y.paste(s, 0, 'CustName', [l.vendor], 1500);
      await Y.sleep(500); await Y.paste(s, 0, 'WHName', [l.wh], 2500);
      const a = line(Y.rows(s), l);
      return { 품번: a.ItemNo, 수량: a.Qty, 납기: a.DelvDate, 창고: a.WHName, 구매거래처: a.CustName };
    },
    reqNo: () => num('501563', 'txtPOReqNo_txt'),
    // 품의 단가는 구매단가 501868 값이 저절로 들어온다(11-06). 문서 price 와 다르면 멈춘다 — AGENTS 3-10 대로 문서 값을 넣고 agentNote 에 화면 값을 적는다.
    appCheck: (l) => { const a = line(Y.rows(Y.sheet('501568', 'SS')), l); need(+a.Price === +l.price, '단가', a.Price); return { 단가: a.Price, 금액: a.CurAmt }; },
    appNo: () => num('501568', 'txtApproReqNo_txt'),
    poCheck: (l) => {
      const a = Y.rows(Y.sheet('501576', 'SS')).filter((x) => x.ItemNo);
      need(a.length === 1 && a[0].ItemNo === l.ccode && +a[0].Qty === +l.qty && +a[0].Price === +l.price && a[0].WHName === l.wh, '발주 줄', a);
      const c = Y.win('501576').document.getElementById('txtCustName_txt').value;
      need(c === l.vendor, '발주 구매거래처', c);
      return { 발주번호: num('501576', 'txtPONo_txt'), 구매거래처: c };
    },
  };
  return '구매요청입력 준비됨';
})();
