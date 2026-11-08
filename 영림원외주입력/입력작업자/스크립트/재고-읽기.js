// 재고 읽기 — 영림원 재고 조회 화면의 표를 내려받기 없이 읽는다. 공통.js 먼저. 읽기만, 저장·삭제 없음.
// 화면(11-08 확인): 창고별 재고조회 501179 · 창고별 수불집계조회 501187 · 재공재고조회 501186 · 창고별 재고원장조회 501181.
// 쓰는 법: 화면에서 조건(기준일·재고기준·품목자산분류·품번 등)을 넣고 「조회」를 누른 뒤
//   ylw.stock.read(501187)            → [{품목자산분류, 품번, 창고, 이월수량, 입고수량, 출고수량, 재고수량, …}]
//   ylw.stock.read(501179, {wh:true}) → 창고별 재고조회는 줄이 「품목 × 창고」로 들어 있다. 창고는 번호(TITLE_IDX0_SEQ)뿐이라
//                                      창고 이름은 501187 의 창고·창고코드로 맞춘다(ylw.stock.whMap()).
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
      const map = o.wh ? Y.stock.whMap() : null;
      return Y.stock.raw(p).map((r) => {
        const x = {};
        for (const [k, v] of Object.entries(r)) if (!skip.test(k) && title[k]) x[title[k] in x ? title[k] + '_' + k : title[k]] = v;
        if (map) x['창고'] = map[r.TITLE_IDX0_SEQ] || '확인 못 함(' + r.TITLE_IDX0_SEQ + ')';
        return x;
      });
    },
    // 창고코드 → 창고 이름. 창고별 수불집계조회 501187 을 먼저 조회해 둔다.
    whMap: () => Object.fromEntries(Y.stock.raw(501187).map((r) => [r.WHSeq, r.WHName])),
  };
})();
