// BOM등록업로드(500302) 채우기 — 저장은 누르지 않는다. 먼저 공통.js 실행(verify 는 불러오기-공통.js 도).
// ★ 사장님 말씀(11-03) 「BOM 등록에 대량업로드가 있는데?」 → **엑셀 일괄업로드가 기본 길**: ylw.bomUp.upload(b64, 파일이름) → ylw.bomUp.subFix(목록) → check → 「저장」 → verify.
//   엑셀은 `BOM업로드-엑셀만들기.py` 로 폼 대기 문서에서 만든다(공식 양식 꼴). 붙여넣기 fill 은 옛 길(11-03 부속 14건을 이 길로 넣었다가 사장님 지시로 지우고 다시 올림).
// 메뉴: 생산/외주 › [생산] 기본정보 맵 › BOM관리 › 「BOM업로드」.
// 받는 것: 폼 erp_boms 문서 배열 [{pname, pcode, pspec, pver, rows:[{proc, order, cname, ccode, cspec, cver, inunit, qn, qd, hasSub}]}].
//   영림원 꼴 = 한 줄에 하위 하나 + 모품목 4칸을 줄마다 되풀이. 폼 문서 한 건 = rows 수만큼 줄.
// (옛 길) 쓰는 법: 화면 열고 「신규」(빈 표) → await ylw.bomUp.fill(목록) → 대조표 모두맞음 → 「저장」 → ylw.bomUp.check(목록) 다시 → BOM등록(500145)·정전개로 확인.
// 줄마다: 모품목번호 → 모품목BOM차수 → [공정, 표시순서] → 하위품번 → (하위BOM차수) → [투입단위, 분자, 분모] → [분자, 분모] 한 번 더 → 하위유무 체크(HaveChild, 붙여넣기로는 안 켜짐 → Y.setChk). 모품목단위·기준단위·품목자산분류는 영림원이 채움.
// 대조: 보이는 칸 전부 — 폼 칸은 폼 값, 나머지(BOM조회용·Loss율·적용일·조립위치·비고…)는 빈칸/0. 자동 칸(모품목단위·기준단위·품목자산분류)은 값만 적어 보여 줌.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.paste) throw new Error('먼저 공통.js 를 실행');
  const PAGE = '500302';
  const AUTO = ['ItemUnitName', 'UnitName', 'AssetName'];
  const num = (x) => (x == null || x === '' ? '' : String(Number(x)));
  const lines = (list) => list.flatMap((b) => b.rows.map((r) => ({ b, r })));
  const formCols = ({ b, r }) => ({
    ItemName: b.pname, ItemNo: b.pcode, ItemSpec: b.pspec || '', ItemBomRevName: b.pver,
    ProcName: r.proc, UserSeq: num(r.order), SubItemName: r.cname, SubItemNo: r.ccode, SubItemSpec: r.cspec || '', SubItemBomRevName: r.cver || '',
    SubUnitName: r.inunit, NeedQtyNumerator: num(r.qn), NeedQtyDenominator: num(r.qd), HaveChild: r.hasSub ? '1' : '0',
  });
  const spec = (sh) => {
    const S = sh.Sheet, o = sh.objOriSheetData || [], out = [];
    for (let i = 0; i < S.getColumnCount(); i++) { if (!S.getColumnVisible(i) || !(S.getColumnWidth(i) > 0)) continue; out.push({ col: o[i] ? o[i].DataField : '', label: String(S.getValue(0, i, 1)) }); }
    return out;
  };
  const blank = (x) => x == null || x === '' || Number(x) === 0;
  const same = (a, b) => (/^-?\d+(\.\d+)?$/.test(a) && /^-?\d+(\.\d+)?$/.test(b) ? Number(a) === Number(b) : a === b);
  Y.bomUp = {
    // 엑셀 일괄업로드: 「파일선택」은 브라우저 파일 창을 열어 손을 못 댄다 → 화면 프레임의 input.click 을 바꿔 file input(FrmWPDBOMMulti_FileDialog_file)을 잡고
    //   DataTransfer 로 파일을 넣은 뒤 change → 파일명 칸에 들어감 → 「데이터가져오기」(btnGetData_btn) → 서버(File/UploadFileData)를 거쳐 표에 줄이 찬다.
    //   b64 = 엑셀 파일 base64(로컬에서 `base64 -i 파일 | tr -d '\n'`). 표가 비어 있어야 한다(「신규」).
    //   ⚠ 올린 직후 표의 공정코드(ProcSeq)·투입단위코드·모품목단위·품목자산분류는 0/빈칸이다 — 「저장」 때 영림원이 이름으로 채운다(11-03 BOM등록에서 공정·단위·원자재 확인).
    async upload(b64, name) {
      const W = Y.win(PAGE), d = W.document, sh = Y.sheet(PAGE, 'SSNew');
      if (Y.rows(sh).length) throw new Error('표가 비어 있지 않음 — 「신규」로 비우고 다시');
      const P = W.HTMLInputElement.prototype;
      if (!P.__origClick) { P.__origClick = P.click; P.click = function () { if (this.type === 'file') { W.__fileInput = this; return; } return P.__origClick.call(this); }; }
      W.__fileInput = null; d.getElementById('btnGetFile_btn').click(); await Y.sleep(800);
      const inp = W.__fileInput; if (!inp) throw new Error('file input 못 잡음');
      const dt = new W.DataTransfer(); dt.items.add(new W.File([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); await Y.sleep(1200);
      d.getElementById('btnGetData_btn').click();
      let t = 0; while (!Y.rows(sh).length && t < 40) { await Y.sleep(500); t++; }
      return { 파일명: d.getElementById('txtFileName_txt').value, 줄: Y.rows(sh).length };
    },
    // 공식 양식에는 하위유무(HaveChild) 칸이 없어(엑셀 끝에 붙여도 안 읽힘, 11-03) 표에서 켠다 — 폼 rows 순서 = 엑셀 줄 순서.
    subFix(list) { const sh = Y.sheet(PAGE, 'SSNew'), L = lines(list); Y.rows(sh).forEach((r, i) => Y.setChk(sh, i, 'HaveChild', !!(L[i] && L[i].r.hasSub))); return this.check(list); },
    async fill(list) {
      const sh = Y.sheet(PAGE, 'SSNew');
      if (Y.rows(sh).length) throw new Error('표가 비어 있지 않음 — 「신규」로 비우고 다시');
      const L = lines(list);
      for (let i = 0; i < L.length; i++) {
        const f = formCols(L[i]);
        // ⚠ 규격 칸(모품목규격·하위규격)은 붙이지 않는다 — 같은 규격(2440*1220) 자재가 많아 「BOM규격」 고르기 창이 뜨고, 닫으면 하위규격이 빈다(11-03).
        //   번호만 붙이면 코드도움이 이름·규격·단위를 채운다. 이름 칸도 안 붙인다(번호로 잡힘).
        await Y.paste(sh, i, 'ItemNo', [f.ItemNo], 1500);
        await Y.paste(sh, i, 'ItemBomRevName', [f.ItemBomRevName], 1200);
        await Y.paste(sh, i, 'ProcName', [f.ProcName, f.UserSeq], 1500);
        await Y.paste(sh, i, 'SubItemNo', [f.SubItemNo], 1500);
        if (f.SubItemBomRevName) await Y.paste(sh, i, 'SubItemBomRevName', [f.SubItemBomRevName], 1200);
        await Y.paste(sh, i, 'SubUnitName', [f.SubUnitName, f.NeedQtyNumerator, f.NeedQtyDenominator], 1500);
        await Y.paste(sh, i, 'NeedQtyNumerator', [f.NeedQtyNumerator, f.NeedQtyDenominator], 1200);   // ⚠ 코드도움이 분자·분모를 0 으로 되돌릴 때가 있다(11-03) → 한 번 더
        Y.setChk(sh, i, 'HaveChild', f.HaveChild === '1');
      }
      await Y.sleep(500);
      return this.check(list);
    },
    check(list) {
      const sh = Y.sheet(PAGE, 'SSNew'), rows = Y.rows(sh), cols = spec(sh), L = lines(list), table = [], auto = [];
      if (rows.length !== L.length) table.push({ 행: '-', 칸: '줄 수', 폼: String(L.length), 화면: String(rows.length) });
      L.forEach((x, i) => {
        const r = rows.find((y) => +y.IDX_NO === i + 1) || {}, f = formCols(x);
        for (const c of cols) {
          const got = r[c.col] == null ? '' : String(r[c.col]);
          if (AUTO.includes(c.col)) { auto.push(c.label + '=' + got); continue; }
          // 하위BOM차수: 폼이 빈칸(원장 자재)이면 영림원이 00 을 넣는다(11-03) → 00 도 맞음
          const ok = c.col === 'SubItemBomRevName' && !f[c.col] ? got === '' || got === '00' : c.col in f ? same(String(f[c.col]), got) : blank(got);
          if (!ok) table.push({ 행: i + 1, 칸: c.label, 폼: c.col in f ? String(f[c.col]) || '(빈칸)' : '(빈칸)', 화면: got });
        }
        for (const k of ['ItemSeq', 'SubItemSeq']) if (blank(r[k])) table.push({ 행: i + 1, 칸: k + '(코드)', 폼: '잡혀야 함', 화면: String(r[k]) });   // ProcSeq 는 업로드 길에서 저장 때 채워짐
      });
      return { 모두맞음: !table.length, 틀린칸: table, 줄: rows.length, 칸수: cols.length, 자동칸: [...new Set(auto)] };
    },
    // 저장 뒤: BOM등록(500145) 조건 「제품번호」(txtItemNoTree_txt)에 모품목번호 + Enter → 상위품목 공정·하위품목 SSNew 대조(BOM등록-읽기.js 와 같은 길)
    async verify(list) {
      const w = await Y.read.open('500145'), d = w.document, sh = Y.sheet('500145', 'SSNew'), bad = [], seen = [];
      const S = (x) => String(x == null ? '' : x), N = (x) => Number(x);
      for (const b of list) {
        const el = d.getElementById('txtItemNoTree_txt');
        el.focus(); el.value = b.pcode; el.dispatchEvent(new Event('input', { bubbles: true }));
        const ko = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
        el.dispatchEvent(new KeyboardEvent('keydown', ko)); el.dispatchEvent(new KeyboardEvent('keypress', ko)); el.dispatchEvent(new KeyboardEvent('keyup', ko));
        let t = 0; while (d.getElementById('txtItemNo_txt').value !== b.pcode && t < 40) { await Y.sleep(250); t++; }
        await Y.sleep(1500);
        if (d.getElementById('txtItemNo_txt').value !== b.pcode) { bad.push(b.pcode + ' 안 열림'); continue; }
        const proc = S(d.getElementById('txtProcName_txt').value), kids = Y.rows(sh);
        if (kids.length !== b.rows.length) bad.push(b.pcode + ' 줄 수 폼 ' + b.rows.length + ' / 영림원 ' + kids.length);
        b.rows.forEach((r) => {
          const k = kids.find((x) => S(x.SubItemNo) === r.ccode);
          if (!k) { bad.push(b.pcode + ' 하위 ' + r.ccode + ' 없음'); return; }
          const pairs = [['공정', proc, r.proc], ['표시순서', S(k.UserSeq), S(r.order)], ['하위품명', S(k.SubItemName), r.cname], ['하위규격', S(k.Spec), r.cspec || ''], ['투입단위', S(k.UnitName), r.inunit], ['하위유무', S(k.HaveChild), r.hasSub ? '1' : '0']];
          for (const [n, a, e] of pairs) if (a !== e) bad.push(b.pcode + '/' + r.ccode + ' ' + n + ': 폼 ' + e + ' / 영림원 ' + a);
          if (N(k.NeedQtyNumerator) !== N(r.qn) || N(k.NeedQtyDenominator) !== N(r.qd)) bad.push(b.pcode + '/' + r.ccode + ' 소요량 ' + r.qn + '/' + r.qd + ' / 영림원 ' + k.NeedQtyNumerator + '/' + k.NeedQtyDenominator);
          if (!(S(k.SubItemBomRevName) === S(r.cver) || (!r.cver && S(k.SubItemBomRevName) === '00'))) bad.push(b.pcode + '/' + r.ccode + ' 하위차수 ' + r.cver + ' / ' + k.SubItemBomRevName);
        });
        seen.push(b.pcode + '(' + kids.length + '줄, 공정 ' + proc + ')');
      }
      return { 모두맞음: !bad.length, 틀린것: bad, 본것: seen };
    },
  };
  return 'BOM업로드 준비됨';
})();
