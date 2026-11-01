// 품목등록(500215) 채우기·읽기 — 한 화면 한 건. 저장은 누르지 않는다. 먼저 공통.js 실행.
// 받는 것: 폼 erp_items 문서 하나 {name, code, spec, eng, asset, state, io, imp, unit, small('대 > 중 > 소' 경로), rep}.
// 쓰는 법: 화면 「신규」 → await ylw.item.fill(v) → 돌려준 대조표 모두맞음이면 「저장」 → 품목조회(500260) 「조회」 → ylw.item.verify(목록).
// 칸 id(11-01 실제 화면): 품명 txtItemName_txt · 품번 txtItemNo_txt · 규격 txtSpec_txt · 영문명 txtItemEngName_txt ·
//   품목자산분류 cmbAssetName_ul(상품/제품/반제품/세트품) · 품목상태 cmbSMStatusName_ul · 내외자구분 cmbSMInOutKindName_ul · 중요도 txtSMABCName_ul ·
//   기준단위 txtUnitName_txt(코드도움) · 품목소분류 txtItemClassSName_txt(코드도움 → 중·대분류 txtItemClassMName_txt·txtItemClassLName_txt 가 저절로) · 대표품목 chkIsSTDItem_input.
// 코드도움 칸: 글자를 넣고 Enter → 하나만 맞으면 바로 잡힌다(11-01 EA·T리빙룸_T수납장_T올화이트). 한글을 타자로 치면 글이 겹치므로 값은 스크립트로 넣고 Enter 만 키로.
//   ⚠ 소분류는 경로의 마지막 이름으로 찾는다 — 같은 이름이 여러 중분류에 있으면 창이 뜰 수 있다(그때는 경로와 같은 줄을 고른다, 아직 안 겪음). 잡힌 뒤 중·대분류가 경로와 같은지 대조표가 본다.
// 저장 때: 품번 그대로(자동으로 안 바뀜) · 판매단가 표를 비워도 저장됨 · 오류 문구 없음 · 관리부서(대표이사)·관리자(로그인 사용자)·부가세(과세·일반과세율)는 영림원 기본값 그대로(11-01 첫 건).
// 확인: 2026-11-01 T알렉스 18건.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.rows) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500215';
  const doc = () => Y.win(PAGE).document;
  const setv = (id, val) => { const e = doc().getElementById(id); e.focus(); e.value = val == null ? '' : String(val); for (const t of ['input', 'keyup', 'change', 'blur']) e.dispatchEvent(new Event(t, { bubbles: true })); return e.value; };
  const sel = (id, text) => { const e = doc().getElementById(id); const o = [...e.options].find((x) => x.text === text); if (!o) throw new Error(id + ' 에 「' + text + '」 없음'); e.value = o.value; e.dispatchEvent(new Event('change', { bubbles: true })); };
  const get = (id) => { const e = doc().getElementById(id); if (e.tagName === 'SELECT') return e.selectedIndex >= 0 ? e.options[e.selectedIndex].text : ''; if (e.type === 'checkbox') return e.checked ? '1' : '0'; return e.value; };
  // 코드도움 칸에 글자 넣기(Enter 는 사람이/키 도구로 누른다 — 아래 fill 이 돌려주는 「누를 칸」 차례대로)
  const put = (id, val) => { const e = doc().getElementById(id); e.focus(); e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); };
  const path = (v) => String(v.small || '').split(' > ');
  Y.item = {
    // 1단계: 글·목록 칸 채우기 + 기준단위 글자 넣고 초점. 그 다음 Enter 키를 누르고 fill2.
    fill1(v) {
      setv('txtItemName_txt', v.name); setv('txtItemNo_txt', v.code); setv('txtSpec_txt', v.spec); setv('txtItemEngName_txt', v.eng);
      sel('cmbAssetName_ul', v.asset); sel('cmbSMStatusName_ul', v.state || '사용'); sel('cmbSMInOutKindName_ul', v.io || '내자'); sel('txtSMABCName_ul', v.imp || 'A등급');
      const c = doc().getElementById('chkIsSTDItem_input'); if (!!v.rep !== c.checked) c.click();
      put('txtUnitName_txt', v.unit);
      return '기준단위에 「' + v.unit + '」 — Enter 를 누른 뒤 fill2';
    },
    // 2단계: 소분류 글자 넣고 초점. 그 다음 Enter 키를 누르고 check.
    fill2(v) { put('txtItemClassSName_txt', path(v).pop()); return '품목소분류에 「' + path(v).pop() + '」 — Enter 를 누른 뒤 check'; },
    // 저장 전 대조(화면 칸 전부 — 폼에 없는 칸은 기본값이어야 함)
    check(v) {
      const p = path(v);
      const want = [
        ['품명', 'txtItemName_txt', v.name], ['품번', 'txtItemNo_txt', v.code], ['규격', 'txtSpec_txt', v.spec || ''], ['영문명', 'txtItemEngName_txt', v.eng || ''],
        ['품목자산분류', 'cmbAssetName_ul', v.asset], ['품목상태', 'cmbSMStatusName_ul', v.state || '사용'], ['내외자구분', 'cmbSMInOutKindName_ul', v.io || '내자'], ['중요도', 'txtSMABCName_ul', v.imp || 'A등급'],
        ['대표품명', 'txtSTDItemName_txt', ''], ['기준단위', 'txtUnitName_txt', v.unit], ['품목소분류', 'txtItemClassSName_txt', p[2]], ['품목중분류', 'txtItemClassMName_txt', p[1]], ['품목대분류', 'txtItemClassLName_txt', p[0]],
        ['대표품목', 'chkIsSTDItem_input', v.rep ? '1' : '0'], ['세트품목', 'chkIsSet_input', '0'],
      ];
      const table = want.map(([칸, id, 폼]) => { const 화면 = get(id); return { 칸, 폼: String(폼 == null ? '' : 폼), 화면, 맞음: String(폼 == null ? '' : 폼) === 화면 }; });
      const sub = doc().getElementById('500216_iframe_subform');
      if (sub) { const s1 = sub.contentWindow.SS1; const n = s1 ? Y.rows(s1).length : 0; table.push({ 칸: '판매단가 표 줄 수', 폼: '0', 화면: String(n), 맞음: n === 0 }); }
      return Y.report(table, { 품목코드: doc().getElementById('fltItemSeq_flt').value });
    },
    // 품목조회(500260) 「조회」 뒤: 품번으로 찾아 대조
    verify(list) {
      const rows = Y.rows(Y.win('500260').SS1), table = [];
      for (const v of list) {
        const r = rows.find((x) => String(x.ItemNo) === v.code), p = path(v);
        if (!r) { table.push({ 품번: v.code, 칸: '(없음)', 맞음: false }); continue; }
        const pairs = [['품명', r.ItemName, v.name], ['규격', r.Spec, v.spec || ''], ['영문명', r.ItemEngName, v.eng || ''], ['품목자산분류', r.AssetName, v.asset], ['기준단위', r.UnitName, v.unit],
          ['품목상태', r.SMStatusName, v.state || '사용'], ['내외자구분', r.SMInOutKindName, v.io || '내자'], ['중요도', r.SMABCName, v.imp || 'A등급'],
          ['품목소분류', r.ItemClassSName, p[2]], ['품목중분류', r.ItemClassMName, p[1]], ['품목대분류', r.ItemClassLName, p[0]], ['대표품목', String(r.IsSTDItem), v.rep ? '1' : '0']];
        for (const [칸, a, b] of pairs) table.push({ 품번: v.code, 칸, 폼: String(b == null ? '' : b), 화면: String(a == null ? '' : a), 맞음: String(a == null ? '' : a) === String(b == null ? '' : b) });
        table.push({ 품번: v.code, 칸: 'ItemSeq', 폼: '', 화면: String(r.ItemSeq), 맞음: true });
      }
      return Y.report(table);
    },
  };
  return '품목등록 준비됨';
})();
