// 품목대중소분류정의(502365) 채우기 — 대 → 중 → 소 한 단계씩. 저장은 누르지 않는다(단계마다 사람이 「저장」). 먼저 공통.js 실행.
// 받는 것: 폼 erp_classes 대기 문서 하나 {kind:'제상품'|'자재', big, mid, name}. 사용여부는 늘 켠다(새 줄은 꺼진 채 나옴).
// 쓰는 법(11-02 T원자재 > T판재 > T화이트 로 실제 저장):
//   0) ⚠ 대분류를 넣기 전에 화면 탭을 닫고 다시 연다 — 아래(중·소) 표를 한 번 연 뒤에는 위(대) 표 붙여넣기가 안 먹을 수 있다(공정흐름유형과 같은 꼴).
//   1) await ylw.cls.kind(v)            → 품목구분 라디오(제상품/자재) + 「조회」
//   2) await ylw.cls.big(v)             → 대분류가 없으면 빈 줄에 붙여넣기 + 사용 ✓ → 대조표. 있으면 「있음」. → 모두맞음이면 「저장」
//   3) await ylw.cls.mid(v)             → 그 대분류를 열고(kevent_dblclick) 중분류 같은 방식 → 「저장」
//   4) await ylw.cls.small(v)           → 그 중분류를 열고 소분류 같은 방식 → 「저장」
//   5) await ylw.cls.verify(v)          → 「조회」 다시 → 대·중을 열어 세 단계 이름·코드·사용 확인 → 코드 「대/중/소」 돌려줌
// 시트: SS1 대(ItemClassLName·ItemClassLSeq) · SS2 중(…M…) · SS3 소(…S…). 열린 대·중 이름 = txtItemClassLName_txt · txtItemClassMName_txt.
// 저장 단추는 툴바 「저장」(전체 화면 좌표 x≈539 — 확대로 확인하고 누른다). 코드는 저장 때 영림원이 붙임(자재: 대 2006xxx · 중 2005xxx · 소 2004xxx / 제상품: 2003·2002·2001xxx).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '502365';
  const doc = () => Y.win(PAGE).document;
  const W = () => Y.win(PAGE);
  const L = { col: 'ItemClassLName', seq: 'ItemClassLSeq' }, M = { col: 'ItemClassMName', seq: 'ItemClassMSeq' }, S = { col: 'ItemClassSName', seq: 'ItemClassSSeq' };
  const spec = (c) => [{ col: c, label: '분류명' }, { col: 'MinorSort', label: '순서' }, { col: 'IsUse', label: '사용여부', kind: 'chk' }, { col: 'Remark', label: '비고' }];
  const open = async (sh, col, name, txtId) => {
    const i = Y.rows(sh).findIndex((r) => r[col] === name);
    if (i < 0) throw new Error('「' + name + '」 없음 — 먼저 저장');
    sh.SetActiveCell(i, col); sh.m_DblClickRow = i; sh.ClickRow = i; sh.kevent_dblclick({ row: i, col: 0 });
    await Y.sleep(2500);
    if (doc().getElementById(txtId).value !== name) throw new Error('「' + name + '」 아래 표가 안 열림');
  };
  const add = async (sh, c, name) => {
    if (Y.rows(sh).some((r) => r[c.col] === name)) return { 있음: name };
    const row0 = Y.nextRow(sh);
    await Y.paste(sh, row0, c.col, [name], 1200);
    Y.setChk(sh, row0, 'IsUse', true);
    await Y.sleep(300);
    const t = Y.check(sh, row0 + 1, spec(c.col), { [c.col]: name, MinorSort: '0', IsUse: '1', Remark: '' });
    const dirty = ['SS1', 'SS2', 'SS3'].map((k) => Y.rows(W()[k]).filter((r) => r.WorkingTag).length);
    return Y.report(t, { 저장안한줄: dirty });
  };
  Y.cls = {
    async kind(v) {
      const r = doc().querySelectorAll('input[id="optSMItemTypeName_optl"]');
      r[v.kind === '자재' ? 1 : 0].click();
      await Y.sleep(500);
      [...doc().querySelectorAll('a')].find((e) => e.offsetParent && /^\s*조회\s*$/.test(e.textContent)).click();
      await Y.sleep(3000);
      return Y.rows(W().SS1).map((x) => x.ItemClassLName);
    },
    big: (v) => add(W().SS1, L, v.big),
    async mid(v) { await open(W().SS1, L.col, v.big, 'txtItemClassLName_txt'); return add(W().SS2, M, v.mid); },
    async small(v) { await open(W().SS2, M.col, v.mid, 'txtItemClassMName_txt'); return add(W().SS3, S, v.name); },
    async verify(v) {
      await this.kind(v);
      const l = Y.rows(W().SS1).find((r) => r.ItemClassLName === v.big);
      await open(W().SS1, L.col, v.big, 'txtItemClassLName_txt');
      const m = Y.rows(W().SS2).find((r) => r.ItemClassMName === v.mid);
      await open(W().SS2, M.col, v.mid, 'txtItemClassMName_txt');
      const s = Y.rows(W().SS3).find((r) => r.ItemClassSName === v.name);
      const ok = !!(l && m && s) && [l, m, s].every((x) => String(x.IsUse) === '1');
      return { 모두맞음: ok, 코드: [l && l[L.seq], m && m[M.seq], s && s[S.seq]].join('/') };
    },
  };
  return '분류정의 채우기 준비됨';
})();
