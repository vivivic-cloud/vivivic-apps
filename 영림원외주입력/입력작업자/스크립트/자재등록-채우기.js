// 자재등록(500251) 채우기·읽기 — 한 화면 한 건. 저장은 누르지 않는다. 먼저 공통.js 실행(자재조회 확인은 불러오기-공통.js·자재조회-읽기.js 도).
// 받는 것: 폼 erp_materials 문서 하나 {name, code, spec, eng, asset, state, io, imp, unit, small('대 > 중 > 소' 경로)}.
// 쓰는 법: 화면 「신규」 → ylw.mat.fill1(v) → 기준단위 칸에서 Enter → ylw.mat.fill2(v) → 자재소분류 칸에서 Enter → ylw.mat.check(v) 모두맞음이면 「저장」
//   → 자재조회(500261) 「조회」(손으로) → ylw.mat.verify(목록).
// 칸 id(11-03 실제 화면) = 품목등록(500215)과 같다: 자재명 txtItemName_txt · 자재번호 txtItemNo_txt · 규격 txtSpec_txt · 영문명 txtItemEngName_txt ·
//   품목자산분류 cmbAssetName_ul(원자재/부자재/재공품/저장품/소모품) · 자재상태 cmbSMStatusName_ul · 내외자구분 cmbSMInOutKindName_ul · 중요도 txtSMABCName_ul ·
//   기준단위 txtUnitName_txt(코드도움) · 자재소분류 txtItemClassSName_txt(코드도움 → 중·대 txtItemClassMName_txt·txtItemClassLName_txt 저절로) · 대표자재 chkIsSTDItem_input.
//   세트품목 칸은 없다. 오른쪽 구매정보 = 하위 화면 500252(시트 SS1 = 구매단가 표).
// 코드도움: 값은 스크립트로 넣고 Enter 만 키로 누른다(한글 타자는 글이 겹침). 소분류는 경로 마지막 이름으로 찾는다.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.rows) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500251';
  const doc = () => Y.win(PAGE).document;
  const setv = (id, val) => { const e = doc().getElementById(id); e.focus(); e.value = val == null ? '' : String(val); for (const t of ['input', 'keyup', 'change', 'blur']) e.dispatchEvent(new Event(t, { bubbles: true })); return e.value; };
  const sel = (id, text) => { const e = doc().getElementById(id); const o = [...e.options].find((x) => x.text === text); if (!o) throw new Error(id + ' 에 「' + text + '」 없음'); e.value = o.value; e.dispatchEvent(new Event('change', { bubbles: true })); };
  const get = (id) => { const e = doc().getElementById(id); if (!e) return '(칸 없음)'; if (e.tagName === 'SELECT') return e.selectedIndex >= 0 ? e.options[e.selectedIndex].text : ''; if (e.type === 'checkbox') return e.checked ? '1' : '0'; return e.value; };
  const put = (id, val) => { const e = doc().getElementById(id); e.focus(); e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); };
  const path = (v) => String(v.small || '').split(' > ');
  const S = (x) => String(x == null ? '' : x);
  Y.mat = {
    // 1단계: 글·목록 칸 + 기준단위 글자 넣고 초점 → Enter → fill2
    fill1(v) {
      setv('txtItemName_txt', v.name); setv('txtItemNo_txt', v.code); setv('txtSpec_txt', v.spec); setv('txtItemEngName_txt', v.eng);
      sel('cmbAssetName_ul', v.asset || '원자재'); sel('cmbSMStatusName_ul', v.state || '사용'); sel('cmbSMInOutKindName_ul', v.io || '내자'); sel('txtSMABCName_ul', v.imp || 'A등급');
      const c = doc().getElementById('chkIsSTDItem_input'); if (c.checked) c.click();
      put('txtUnitName_txt', v.unit);
      return '기준단위에 「' + v.unit + '」 — Enter 를 누른 뒤 fill2';
    },
    // 2단계: 자재소분류 글자 넣고 초점 → Enter → check
    fill2(v) { put('txtItemClassSName_txt', path(v).pop()); return '자재소분류에 「' + path(v).pop() + '」 — Enter 를 누른 뒤 check'; },
    // 저장 전 대조(화면 칸 전부 — 폼에 없는 칸은 빈칸/기본값이어야 함)
    check(v) {
      const p = path(v);
      const want = [
        ['자재명', 'txtItemName_txt', v.name], ['자재번호', 'txtItemNo_txt', v.code], ['규격', 'txtSpec_txt', v.spec], ['영문명', 'txtItemEngName_txt', v.eng],
        ['품목자산분류', 'cmbAssetName_ul', v.asset || '원자재'], ['자재상태', 'cmbSMStatusName_ul', v.state || '사용'], ['내외자구분', 'cmbSMInOutKindName_ul', v.io || '내자'], ['중요도', 'txtSMABCName_ul', v.imp || 'A등급'],
        ['대표자재명', 'txtSTDItemName_txt', ''], ['기준단위', 'txtUnitName_txt', v.unit], ['자재소분류', 'txtItemClassSName_txt', p[2]], ['자재중분류', 'txtItemClassMName_txt', p[1]], ['자재대분류', 'txtItemClassLName_txt', p[0]],
        ['대표자재', 'chkIsSTDItem_input', '0'],
      ];
      const table = want.map(([칸, id, 폼]) => { const 화면 = get(id); return { 칸, 폼: S(폼), 화면, 맞음: S(폼) === 화면 }; });
      const sub = doc().getElementById('500252_iframe_subform');
      if (sub) { const s1 = sub.contentWindow.SS1; const n = s1 ? Y.rows(s1).length : 0; table.push({ 칸: '구매단가 표 줄 수', 폼: '0', 화면: String(n), 맞음: n === 0 }); }
      const seq = doc().getElementById('fltItemSeq_flt');
      return Y.report(table, { 자재코드: seq ? seq.value : '(칸 없음)' });
    },
    // 자재조회(500261) 「조회」 뒤: 자재번호로 찾아 대조
    verify(list) {
      const rows = Y.rows(Y.win('500261').SS1), table = [];
      for (const v of list) {
        const hit = rows.filter((x) => S(x.ItemNo) === v.code), r = hit[0], p = path(v);
        if (!r) { table.push({ 자재번호: v.code, 칸: '(없음)', 맞음: false }); continue; }
        if (hit.length > 1) table.push({ 자재번호: v.code, 칸: '같은 자재번호 줄 수', 화면: String(hit.length), 맞음: false });
        const pairs = [['자재명', r.ItemName, v.name], ['규격', r.Spec, v.spec], ['영문명', r.ItemEngName, v.eng], ['품목자산분류', r.AssetName, v.asset || '원자재'], ['기준단위', r.UnitName, v.unit],
          ['자재상태', r.SMStatusName, v.state || '사용'], ['내외자구분', r.SMInOutKindName, v.io || '내자'], ['중요도', r.SMABCName, v.imp || 'A등급'],
          ['자재소분류', r.ItemClassSName, p[2]], ['자재중분류', r.ItemClassMName, p[1]], ['자재대분류', r.ItemClassLName, p[0]]];
        for (const [칸, a, b] of pairs) table.push({ 자재번호: v.code, 칸, 폼: S(b), 화면: S(a), 맞음: S(a) === S(b) });
        table.push({ 자재번호: v.code, 칸: 'ItemSeq', 폼: '', 화면: S(r.ItemSeq), 맞음: true });
      }
      return Y.report(table);
    },
  };
  return '자재등록 준비됨';
})();
