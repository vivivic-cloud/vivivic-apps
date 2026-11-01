// 품목대중소분류정의(502365) 읽기 → 폼 erp_classes 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(조회·읽기만).
// 쓰는 법: await ylw.read.classes('T' 또는 'all')  — 품목구분 제상품·자재 둘 다 읽는다(라디오를 바꾸고 「조회」까지 스크립트가 한다).
//   한 문서 = 소분류 하나 {kind:'제상품'|'자재', big, mid, name, use, ylwCode:'대코드/중코드/소코드'}. 소분류가 없는 대·중분류는 문서가 안 생긴다(결과 「소분류없음」에 적힘).
//   only 'T' = 대·중·소 중 하나라도 T 로 시작하는 줄만.
// 화면(11-01): 시트 셋 — SS1 대분류(ItemClassLName·MinorSort·IsUse·Remark·ItemClassLSeq) · SS2 중분류(…M…) · SS3 소분류(…S…).
//   품목구분 라디오 = optSMItemTypeName_optl 두 개(0 제상품 · 1 자재). 열린 대·중분류 이름 = txtItemClassLName_txt · txtItemClassMName_txt.
// 더블클릭 대신: SetActiveCell(행) + 시트 m_DblClickRow·ClickRow 에 행(0부터)을 넣고 kevent_dblclick({row, col:0}) → 아래 시트 조회(11-01 확인 — m_DblClickRow 를 안 넣으면 SS3 이 안 열림, col 이 없는 번호면 오류 알림).
// 확인: 2026-11-01 (읽기만).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '502365';
  const doc = () => Y.win(PAGE).document;
  const waitVal = async (id, want, ms) => {
    for (let t = 0; t < (ms || 6000); t += 200) { if (doc().getElementById(id).value === want) { await Y.sleep(400); return true; } await Y.sleep(200); }
    return false;
  };
  const open = async (sh, i, nameCol, txtId, name) => {
    sh.SetActiveCell(i, nameCol); sh.m_DblClickRow = i; sh.ClickRow = i;
    sh.kevent_dblclick({ row: i, col: 0 });   // col 은 그 시트 Data.Columns 번호 — 없는 번호면 「Cannot read properties of undefined (reading 'DataField')」 알림이 뜬다(11-01)
    if (!(await waitVal(txtId, name))) throw new Error('「' + name + '」 아래 표가 안 열림');
  };
  const query = async (kindIdx) => {
    const radios = doc().querySelectorAll('input[id="optSMItemTypeName_optl"]');
    radios[kindIdx].click();
    await Y.sleep(500);
    // 화면 「조회」 단추 — 툴바는 iframe 안의 A(글자가 정확히 「조회」). 바로 옆이 「저장」이니 글자로만 고른다.
    const btn = [...doc().querySelectorAll('a')].find((e) => e.offsetParent && /^\s*조회\s*$/.test(e.textContent));
    if (!btn) throw new Error('조회 단추를 못 찾음');
    btn.click();
    await Y.sleep(3000);
  };
  R.classes = async (only) => {
    await R.open(PAGE);
    const w = Y.win(PAGE), out = [], none = [];
    for (const [ki, kind] of [[0, '제상품'], [1, '자재']]) {
      await query(ki);
      R.need(w.SS1, ['대분류', '순서', '사용여부']);
      const L = Y.rows(w.SS1);
      for (let i = 0; i < L.length; i++) {
        const l = L[i];
        await open(w.SS1, +l.IDX_NO - 1, 'ItemClassLName', 'txtItemClassLName_txt', l.ItemClassLName);
        const M = Y.rows(w.SS2);
        if (!M.length) none.push(kind + ' ' + l.ItemClassLName);
        for (let j = 0; j < M.length; j++) {
          const m = M[j];
          await open(w.SS2, +m.IDX_NO - 1, 'ItemClassMName', 'txtItemClassMName_txt', m.ItemClassMName);
          const S = Y.rows(w.SS3);
          if (!S.length) none.push(kind + ' ' + l.ItemClassLName + ' > ' + m.ItemClassMName);
          for (const s of S) {
            const o = { kind, big: R.s(l.ItemClassLName), mid: R.s(m.ItemClassMName), name: R.s(s.ItemClassSName), use: R.bool(s.IsUse), ylwCode: [l.ItemClassLSeq, m.ItemClassMSeq, s.ItemClassSSeq].join('/') };
            if (only !== 'T' || R.isT(o.big) || R.isT(o.mid) || R.isT(o.name)) out.push(o);
          }
        }
      }
    }
    return { rows: out, 읽음: out.length, 확인못함: [], 소분류없음: none, screen: '품목대중소분류정의', labels: { kind: '품목구분', big: '대분류', mid: '중분류', name: '소분류', use: '사용여부' } };
  };
  return '분류정의 읽기 준비됨';
})();
