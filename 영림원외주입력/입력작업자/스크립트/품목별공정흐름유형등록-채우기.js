// 품목별공정흐름유형등록(500272) 채우기 — 표 SS 에 한 줄씩 붙여넣는다(일괄업로드 화면 없음). 저장은 누르지 않는다. 먼저 공통.js → 불러오기-공통.js → 품목별공정흐름유형등록-읽기.js.
// 받는 것: 폼 erp_itemflows 대기 문서 배열 [{name, code, spec, flow}] (한 문서 = 표 한 줄).
// 쓰는 법: 화면 탭을 앞으로 → 「조회」로 같은 품번+흐름이 없는지 본다 → 「신규」(빈 표) → await ylw.itemFlow.fill(목록) → 모두맞음 → 「저장」 → await ylw.itemFlow.verify(목록).
// 줄마다 붙여넣기 둘(11-04 확인): ItemNo [품번] → 코드도움이 품명·규격·ItemSeq 를 채움 / ProcTypeName [흐름 전체 이름] → ProcTypeSeq 잡힘(앞이 같은 흐름이 있어도 전체 이름이면 창이 안 뜸).
//   품명·규격은 붙이지 않는다(코드도움 칸이라 고르기 창이 뜰 수 있음). 저장하면 줄 머리 A → 숫자, 오류 문구 없음.
// 흐름 코드 대조: seq = {흐름 이름: ProcTypeSeq} — 공정흐름유형등록(500228) 표에서 만든다(R.query 뒤). 없으면 0 이 아닌지만 본다.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500272', S = (x) => (x == null ? '' : String(x).trim());
  const flowSeq = () => { try { return Object.fromEntries(Y.rows(Y.sheet('500228', 'SS1')).map((r) => [S(r.ProcTypeName), S(r.ProcTypeSeq)])); } catch (e) { return {}; } };
  Y.itemFlow = {
    async fill(list) {
      const sh = Y.sheet(PAGE, 'SS');
      if (Y.rows(sh).length) throw new Error('표가 비어 있지 않음 — 「신규」로 비우고 다시');
      for (let i = 0; i < list.length; i++) {
        await Y.paste(sh, i, 'ItemNo', [list[i].code], 1500);
        await Y.paste(sh, i, 'ProcTypeName', [list[i].flow], 1500);
      }
      return this.check(list);
    },
    check(list) {
      const rows = Y.rows(Y.sheet(PAGE, 'SS')), seq = flowSeq(), bad = [];
      if (rows.length !== list.length) bad.push('줄 수 폼 ' + list.length + ' / 화면 ' + rows.length);
      list.forEach((v, i) => {
        const r = rows.find((x) => +x.IDX_NO === i + 1) || {};
        for (const [k, a, b] of [['품명', r.ItemName, v.name], ['품번', r.ItemNo, v.code], ['규격', r.Spec, v.spec], ['공정흐름유형', r.ProcTypeName, v.flow]])
          if (S(a) !== S(b)) bad.push((i + 1) + '행 ' + k + ': 폼 ' + S(b) + ' / 화면 ' + S(a));
        if (!(+r.ItemSeq > 0)) bad.push((i + 1) + '행 ItemSeq 안 잡힘');
        if (!(+r.ProcTypeSeq > 0) || (seq[v.flow] && seq[v.flow] !== S(r.ProcTypeSeq))) bad.push((i + 1) + '행 흐름 코드 ' + S(r.ProcTypeSeq));
      });
      return { 모두맞음: !bad.length, 틀린것: bad, 줄: rows.length };
    },
    // 저장 뒤: 화면 「조회」(R.query) → 품번 + 흐름으로 찾아 대조. 같은 품번 줄이 하나인지도 본다.
    async verify(list) {
      await Y.read.query(PAGE, 3500);
      const rows = Y.rows(Y.sheet(PAGE, 'SS')), bad = [];
      for (const v of list) {
        const hit = rows.filter((x) => S(x.ItemNo) === v.code);
        if (hit.length !== 1) bad.push(v.code + ' 줄 수 ' + hit.length);
        const r = hit.find((x) => S(x.ProcTypeName) === v.flow);
        if (!r) { bad.push(v.code + ' 흐름 ' + v.flow + ' 없음'); continue; }
        if (S(r.ItemName) !== S(v.name)) bad.push(v.code + ' 품명: 폼 ' + v.name + ' / 영림원 ' + r.ItemName);
        if (S(r.Spec) !== S(v.spec)) bad.push(v.code + ' 규격: 폼 ' + v.spec + ' / 영림원 ' + r.Spec);
      }
      return { 모두맞음: !bad.length, 틀린것: bad, 화면전체: rows.length };
    },
  };
  return '품목별공정흐름유형등록 채우기 준비됨';
})();
