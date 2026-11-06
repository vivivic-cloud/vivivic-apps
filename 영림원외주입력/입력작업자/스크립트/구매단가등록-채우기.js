// 구매단가등록(501868) 채우기 — 저장은 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: erp_purprices 문서 [{vendor, code, name, spec, unit, io, cur, price, minqty, stepqty, from, memo, maker, days}]
// 쓰는 법: Home.OpenPageSeq(501868) → 화면 「조회」(겹침 확인) → await ylw.pp.fill(목록) → 모두맞음 확인 → 「저장」 → 「조회」 → ylw.pp.verify(목록).
// 시트: SS. 칸마다 한 번씩 붙여넣는다(구매거래처 → 품번 순서. 품명·규격·단위·통화 KRW 는 품번을 넣으면 저절로).
// 저장은 알림 없이 조용히 끝난다 → 줄 머리 A 가 번호로 바뀌고 적용종료일 99991231 이 차면 저장된 것.
// 확인: 2026-11-06 실제 2건 저장(서로 다른 품번·거래처 각 1줄씩, 한 번에 한 줄).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '501868';
  const sh = () => Y.sheet(PAGE, 'SS');
  const num = (v) => (v === '' || v == null ? '' : String(+String(v).replace(/,/g, '')));
  const SPEC = [
    ['CustName', 'vendor'], ['ItemNo', 'code'], ['ItemName', 'name'], ['Spec', 'spec'], ['UnitName', 'unit'],
    ['ImpTypeName', 'io'], ['CurrName', 'cur'], ['Price', 'price', 'n'], ['MinQty', 'minqty', 'n'], ['StepQty', 'stepqty', 'n'],
    ['StartDate', 'from', 'd'], ['Remark', 'memo'], ['MakerName', 'maker'], ['LeadTime', 'days', 'n'],
  ];
  const cmp = (r, v) => SPEC.map(([col, key, k]) => {
    const n = (x) => (k === 'n' ? (+x ? num(x) : '') : k === 'd' ? String(x == null ? '' : x).replace(/\D/g, '') : String(x == null ? '' : x).trim());
    const 폼 = n(v[key]), 화면 = n(r && r[col]);
    return { 품번: v.code, 칸: col, 폼, 화면, 맞음: 폼 === 화면 };
  });
  const find = (v) => Y.rows(sh()).find((r) => r.CustName === v.vendor && r.ItemNo === v.code && String(r.StartDate) === String(v.from).replace(/\D/g, ''));
  Y.pp = {
    fill: async (list) => {
      const s = sh(); const out = [];
      for (const v of list) {
        const seen = Y.rows(s).length;
        if (find(v)) throw new Error('겹침: ' + v.vendor + ' ' + v.code + ' ' + v.from);
        const put = (col, val, w) => (val === '' || val == null ? null : Y.paste(s, seen, col, [val], w));
        await put('CustName', v.vendor, 1500); await put('ItemNo', v.code, 2000);
        await put('ImpTypeName', v.io, 1000); await put('Price', v.price, 1000);
        await put('MinQty', v.minqty, 1000); await put('StepQty', v.stepqty, 1000);
        await put('StartDate', v.from, 1000); await put('Remark', v.memo, 1000);
        await put('MakerName', v.maker, 1000); await put('LeadTime', v.days, 1000);
        out.push(...cmp(find(v), v));
      }
      return Y.report(out);
    },
    verify: (list) => Y.report(list.flatMap((v) => cmp(find(v), v))),
  };
  return '구매단가 준비됨';
})();
