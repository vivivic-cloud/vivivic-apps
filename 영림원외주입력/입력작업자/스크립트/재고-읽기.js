// 재고 읽기 — 영림원 재고 조회 화면의 표를 내려받기 없이 읽는다. 공통.js 먼저. 읽기만, 저장·삭제 없음.
// 화면(11-08 확인): 창고별 재고조회 501179 · 창고별 수불집계조회 501187 · 재공재고조회 501186 · 창고별 재고원장조회 501181.
// 쓰는 법: 화면에서 조건(기준일·재고기준·품목자산분류·품번 등)을 넣고 「조회」를 누른 뒤
//   ylw.stock.read(501187)            → [{품목자산분류, 품번, 창고, 이월수량, 입고수량, 출고수량, 재고수량, …}]
//   ylw.stock.read(501179, {wh:true}) → 창고별 재고조회는 줄이 「품목 × 창고」로 들어 있다(StockQty·StockAmt = 그 창고 값,
//                                      StockQtyTot = 합계). 창고 이름은 화면 머리 SS1.Data.DynamicHeader[0] 의 {Title, TitleSeq} 로 맞춘다.
//   ylw.stock.cols(501187)            → [[시트 열 이름, 화면 제목], …]
// 표 = 화면 전역 SS1(div). SS1.GetAllData().Tables[0] = 행, SS1.Data.Columns[i] = {DataField, Title}. Object.keys(window) 로는 안 보인다(요소 id 전역).
(function () {
  const Y = window.ylw; if (!Y || !Y.win) throw new Error('공통.js 먼저');
  const sheet = (p) => { const s = Y.win(p).SS1; if (!s || typeof s.GetAllData !== 'function') throw new Error(p + ' 표 없음'); return s; };
  const skip = /^(WorkingTag|IDX_NO|DataSeq|Status|Selected|ROW_IDX|TABLE_NAME)$/;
  Y.stock = {
    cols: (p) => (sheet(p).Data.Columns || []).map((c) => [c.DataField, c.Title]),
    raw: (p) => Y.rows(sheet(p)).filter((r) => r.ItemNo),   // TOTAL 줄은 품번이 비어 빠진다
    read: (p, o = {}) => {
      const s = sheet(p);
      const title = {}; for (const c of s.Data.Columns || []) if (c.DataField && c.Title && !title[c.DataField]) title[c.DataField] = c.Title;
      title.TITLE_IDX0_SEQ = '창고코드';
      if (p === 501179) { title.StockQtyTot = '재고수량(합계)'; title.StockAmtTot = '추정재고금액(합계)'; title.StockQty = '재고수량'; title.StockAmt = '추정재고금액'; }
      const map = o.wh ? Y.stock.whMap(p) : null;
      return Y.stock.raw(p).map((r) => {
        const x = {};
        for (const [k, v] of Object.entries(r)) if (!skip.test(k) && title[k]) x[title[k] in x ? title[k] + '_' + k : title[k]] = v;
        if (map) x['창고'] = map[r.TITLE_IDX0_SEQ] || '확인 못 함(' + r.TITLE_IDX0_SEQ + ')';
        return x;
      });
    },
    // 폼 v102 「물류 · [물류] 재고현황」 불러오기 요청 처리(불러오기-공통.js 먼저). 501179 를 요청 basis·date 로 조회해 둔 뒤
    //   await ylw.stock.run(요청)   → erp_stocks 문서 9개(id = 재고기준_품목자산분류)를 통째로 덮어쓴다. 줄 없는 분류는 빈 rows.
    // count 요청은 세기만 한다. 영림원에는 아무것도 저장하지 않는다.
    CLS: ['상품', '제품', '반제품', '원자재', '부자재', '재공품', '저장품', '세트품', '소모품'],
    run: async (req) => {
      const I = Y.imp; if (!I || !I.patch) throw new Error('불러오기-공통.js 먼저');
      const basis = req.basis || '실재고', now = new Date().toISOString();
      await I.patch('erp_imports', req.id, { status: '진행중', agentNote: '' });
      try {
        let rows = Y.stock.read(501179, { wh: true });
        if (req.only === 'T') rows = rows.filter((r) => String(r['품번'] || '').startsWith('T'));
        const map = Y.stock.whMap(501179), whs = Object.values(map);
        const by = {}; for (const c of Y.stock.CLS) by[c] = [];
        const other = [];
        for (const r of rows) { delete r['창고코드']; (by[r['품목자산분류']] || other).push(r); }
        const cnt = Y.stock.CLS.map((c) => c + ' ' + by[c].length).join(' · ');
        if (req.mode === 'import') {
          for (const c of Y.stock.CLS) {
            const w = whs.filter((x) => by[c].some((r) => r['창고'] === x));
            await I.patch('erp_stocks', encodeURIComponent(basis + '_' + c), { basis, cls: c, date: req.date || '', whs: w, rows: by[c], only: req.only || 'all', importedAt: now, importId: req.id });
          }
        }
        const note = '창고별 재고조회 ' + basis + (req.date ? ' · 기준일 ' + req.date : '') + ': ' + rows.length + '줄 (' + cnt + ')' + (other.length ? ' · 분류 밖 ' + other.length + '줄 안 넣음' : '') + (req.mode === 'import' ? ' · 넣음' : ' · 세기만');
        await I.patch('erp_imports', req.id, { status: '완료', agentNote: note, result: { stocks: { 읽음: rows.length } }, doneAt: new Date().toISOString() });
        return note;
      } catch (e) {
        await I.patch('erp_imports', req.id, { status: '오류', agentNote: String(e.message || e) });
        return { 오류: String(e.message || e) };
      }
    },
    // 창고코드 → 창고 이름. 501179 는 화면 머리(DynamicHeader), 그 밖은 표의 창고코드·창고 칸.
    whMap: (p = 501179) => {
      const dh = (sheet(p).Data.DynamicHeader || [])[0];
      if (dh && dh.length) return Object.fromEntries(dh.map((h) => [h.TitleSeq, h.Title]));
      return Object.fromEntries(Y.stock.raw(p).map((r) => [r.WHSeq, r.WHName]));
    },
  };
})();
