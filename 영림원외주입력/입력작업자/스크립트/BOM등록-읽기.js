// BOM 읽기 — BOM등록조회-모품목기준(502519)에서 모품목 목록 → 모품목마다 BOM등록(500145)을 열어 하위품목을 읽는다 → 폼 erp_boms 꼴. 영림원에 저장하지 않는다.
// 먼저 공통.js → 불러오기-공통.js.
// 열기: 생산/외주 › [생산] 기본정보 맵 오른쪽 「BOM등록조회-모품목기준」(502519) · 맵 왼쪽 「BOM」 아이콘 = BOM등록(500145).
// 쓰는 법: ① 502519 조건 **최초작성일 두 칸을 x 로 비우고** 화면 「조회」(비우지 않으면 오늘 만든 것만 나온다) ② BOM등록(500145)을 열어 둔다(아무것도 고르지 않은 상태)
//   ③ await ylw.read.boms('T' 또는 'all') — 모품목마다 BOM등록 조건 「제품번호」 칸(txtItemNoTree_txt)에 품번을 넣고 Enter 를 보내 조회한다(사람이 품번 치고 Enter 한 것과 같은 길, 11-01 확인).
//      상위품목 품번(txtItemNo_txt)이 그 품번이 될 때까지 기다린 뒤 하위품목 SSNew 를 읽는다(모품목 하나 약 2~3초 — 552개 「전체」는 20분 넘게 걸린다).
// 칸(11-01 실제 화면): 502519 SS = 품목상태 · 모품목명=ItemName · 모품목번호=ItemNo · 규격=Spec · BOM차수=BOMRev · 차수등록사유 · 품목대/중/소분류 · 최초작성일·작성자 · 최종수정일·수정자.
//   500145 상위품목 = 품명·품번·규격·BOM차수·**공정(txtProcName_txt — 상위품목에 하나)**·차수등록사유·단위·품목자산분류 …
//   500145 하위품목 SSNew = 표시순서=UserSeq · BOM차수=SubItemBomRevName · 품명=SubItemName · 품번=SubItemNo · 규격=Spec · 투입단위=UnitName ·
//     소요량(분자)=NeedQtyNumerator · 소요량(분모)=NeedQtyDenominator · 하위유무=HaveChild · BOM조회용 · 사내Loss율 · 사외Loss율 · 적용시작일 · 적용종료일 · 조립위치 · 비고 · 기준단위 · 품목자산분류.
// ⚠ 폼은 행마다 「공정」 칸이 있지만 영림원 BOM등록은 **상위품목에 공정 하나**다 → 그 값을 모든 행 proc 에 넣는다(11-01 본 BOM 은 공정 빈칸).
// ⚠ BOM차수가 여러 개인 모품목은 BOM등록 조건 BOM차수(기본 00)의 것만 읽힌다 → 상위품목 BOM차수(cmbItemBomRev_cmb)가 502519 의 BOMRev 와 다르면 그 모품목은 건너뛰고 확인못함에 적는다.
//   (11-01 본 552개는 모두 00. 차수가 여럿인 모품목은 아직 못 봄.)
// 확인: 2026-11-01 — 502519 모품목 552개(T 0개). LS-aw10a(하위 19줄)·LS-aw10b(15줄)를 스크립트로 열어 읽음.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, LIST = '502519', PAGE = '500145';
  R.boms = async (only) => {
    const lw = await R.open(LIST), ls = Y.sheet(LIST, 'SS');
    R.need(ls, ['모품목명', '모품목번호', '규격', 'BOM차수']);
    const fr = lw.document.getElementById('txtRegDate_dat'), to = lw.document.getElementById('txtRegDateTo_dat');
    if ((fr && fr.value) || (to && to.value)) throw new Error('BOM등록조회-모품목기준 최초작성일 두 칸을 x 로 비우고 화면 「조회」를 누른 뒤 다시');
    const heads = Y.rows(ls).filter((r) => only !== 'T' || R.isT(r.ItemName));
    const w = await R.open(PAGE), d = w.document, sh = Y.sheet(PAGE, 'SSNew');
    R.need(sh, ['표시순서', 'BOM차수', '품명', '품번', '규격', '투입단위', '소요량(분자)', '소요량(분모)', '하위유무']);
    const rows = [], skipped = [];
    for (const h of heads) {
      const el = d.getElementById('txtItemNoTree_txt');
      el.focus(); el.value = h.ItemNo; el.dispatchEvent(new Event('input', { bubbles: true }));
      const ko = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
      el.dispatchEvent(new KeyboardEvent('keydown', ko)); el.dispatchEvent(new KeyboardEvent('keypress', ko)); el.dispatchEvent(new KeyboardEvent('keyup', ko));
      let t = 0;
      while (d.getElementById('txtItemNo_txt').value !== h.ItemNo && t < 40) { await Y.sleep(250); t++; }
      await Y.sleep(1200);
      if (d.getElementById('txtItemNo_txt').value !== h.ItemNo) { skipped.push(h.ItemNo + '(안 열림 — 같은 품번이 여럿이면 코드도움 창이 떴을 수 있음)'); continue; }
      const rev = R.s((d.getElementById('cmbItemBomRev_cmb') || {}).textContent);
      if (rev && R.s(h.BOMRev) && rev !== R.s(h.BOMRev)) { skipped.push(h.ItemNo + '(BOM차수 ' + h.BOMRev + ' — 화면은 ' + rev + ')'); continue; }
      const proc = R.s(d.getElementById('txtProcName_txt').value);
      const kids = Y.rows(sh);
      rows.push({
        pname: R.s(h.ItemName), pcode: R.s(h.ItemNo), pspec: R.s(h.Spec), pver: R.s(h.BOMRev),
        rows: kids.map((x) => ({
          proc, order: R.s(x.UserSeq), cname: R.s(x.SubItemName), ccode: R.s(x.SubItemNo), cspec: R.s(x.Spec), cver: R.s(x.SubItemBomRevName),
          inunit: R.s(x.UnitName), qn: R.s(x.NeedQtyNumerator), qd: R.s(x.NeedQtyDenominator), hasSub: R.bool(x.HaveChild),
        })),
      });
    }
    return { rows, 읽음: rows.length, 화면전체: Y.rows(ls).length, 확인못함: skipped, screen: 'BOM등록',
      labels: { pname: '모품목명', pcode: '모품목번호', pspec: '모품목규격', pver: '모품목BOM차수', proc: '공정', order: '표시순서', cname: '하위품명', ccode: '하위품번', cspec: '하위규격', cver: '하위BOM차수', inunit: '투입단위', qn: '소요량(분자)', qd: '소요량(분모)', hasSub: '하위유무' } };
  };
  return 'BOM 읽기 준비됨';
})();
