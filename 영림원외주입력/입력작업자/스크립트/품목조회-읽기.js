// 품목조회(500260) 읽기 → 폼 erp_items 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: await ylw.read.items('T' 또는 'all') — 스크립트가 조건 「품목상태」를 비우고(전체) 「조회」까지 한다(11-26).
//   ⚠ 조건 「품목상태」(id txtStatus_ul, 목록 = 빈칸·임시·사용·생산중지·거래중지·폐기)는 화면을 열면 「사용」 이다 → 그대로 조회하면 폐기 품목이 빠져
//     「영림원에 없음」(지울 후보)이 된다. 빈칸(첫 줄)으로 바꾸면 모든 상태가 나온다(11-26 화면: 빈칸 조회 34줄 = 폐기 34).
//   조회가 안 먹으면(0줄) 화면 「조회」를 손으로 누른 뒤 다시 부른다(500260 스크립트 click() 은 안 먹은 적 있음 — 마우스 동작 R.query 로 보냄).
//   ⚠ 1,500줄이 넘는다(11-01 사용 1,568개). 「전체」는 폼에 그만큼 문서가 생긴다 — 폼에서 「건수 먼저 보기」로 센 뒤 사장님이 고른다.
//   품명 조건에 글자를 넣고 조회하면 그것만 나온다(T 만 볼 때 조회 자체를 줄이려면 품명 조건 「T」 — 앞글자 찾기인지 포함 찾기인지는 확인 못 함. 거르기는 스크립트가 다시 한다).
// 칸(11-01 실제 화면, 시트 SS1): 품명=ItemName · 품번=ItemNo · 규격=Spec · 품목자산분류=AssetName · 기준단위=UnitName · 품목상태=SMStatusName ·
//   내외자구분=SMInOutKindName · 중요도=SMABCName · 품목소분류=ItemClassSName · 영문명=ItemEngName · 대표품목=IsSTDItem(체크 0/1).
//   그 밖 칸(관리부서·품목대/중분류·출고구분·세트품목·BOM등록·Lot 관리 …)은 폼에 칸이 없어 안 읽는다.
// ⚠ (폼 v340, 11-26) 폐기 품목도 읽어야 품목상태가 폼에 이어진다 — 조회 조건 「품목상태」 를 비우고(전체) 조회. 「사용」 만 조회하면 폐기 품목이 「영림원에 없음」 지울 후보가 된다(I.goneStop 이 막기 전에 확인).
// 확인: 2026-11-01 — 사용 1,568개, T 로 시작하는 품명 0개.
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500260';
  R.items = async (only) => {
    const w = await R.open(PAGE);
    const st = w.document.getElementById('txtStatus_ul');   // 조건 「품목상태」 — 빈칸(전체)으로
    if (!st) throw new Error('품목조회 조건 「품목상태」(txtStatus_ul) 없음');
    if (st.selectedIndex !== 0) { st.selectedIndex = 0; st.dispatchEvent(new Event('change', { bubbles: true })); }
    if (st.options[st.selectedIndex].text !== '') throw new Error('품목상태 조건을 못 비움');
    await R.query(PAGE, 4000);
    const sh = Y.sheet(PAGE, 'SS1');
    R.need(sh, ['품명', '품번', '규격', '품목자산분류', '기준단위', '품목상태', '내외자구분', '중요도', '품목소분류', '영문명', '대표품목']);
    const all = Y.rows(sh);
    if (!all.length) throw new Error('품목조회에 줄이 없음 — 화면 「조회」를 먼저');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.ItemName)).map((r) => ({
      name: R.s(r.ItemName), code: R.s(r.ItemNo), spec: R.s(r.Spec), eng: R.s(r.ItemEngName), asset: R.s(r.AssetName), state: R.s(r.SMStatusName),
      unit: R.s(r.UnitName), small: R.s(r.ItemClassSName), io: R.s(r.SMInOutKindName), imp: R.s(r.SMABCName), rep: R.bool(r.IsSTDItem),
      // 폼 v345(11-26) 새 칸 가운데 500260 에 보이는 것만(관리부서=부서 · 관리자=담당자 · 품목설명 · 기본구매처 · 부가세구분 · 판매단가에 부가세포함여부 · 출고구분 · Lot·Serial · 유통기한구분 · 세트품목).
      //   유통기간(화면 DataField SMLimitTermKind)은 값 꼴을 확인 못 해 안 읽음. 나머지 새 칸(Loss율·구매수량 …)은 이 화면에 없음.
      dept: R.s(r.DeptName), emp: R.s(r.EmpName), desc: R.s(r.Remark), buyVendor: R.s(r.PurCustName), vatKind: R.s(r.SMVatKindName), saleVat: R.bool(r.PriceInVat),
      outKind: R.s(r.SMOutKindName), lotYn: R.bool(r.IsLotMng), serialYn: R.bool(r.IsSerialMng), expKind: R.s(r.SMLimitTermKindName), setYn: R.bool(r.IsSet),
    }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: [], screen: '품목조회(품목상태 전체)',
      labels: { name: '품명', code: '품번', spec: '규격', eng: '영문명', asset: '품목자산분류', state: '품목상태', unit: '기준단위', small: '품목소분류', io: '내외자구분', imp: '중요도', rep: '대표품목',
        dept: '부서(관리부서)', emp: '담당자(관리자)', desc: '품목설명', buyVendor: '기본구매처', vatKind: '부가세구분', saleVat: '판매단가에 부가세포함여부', outKind: '출고구분', lotYn: 'Lot 관리 여부', serialYn: 'Serial 관리 여부', expKind: '유통기한구분', setYn: '세트품목여부' } };
  };
  return '품목조회 읽기 준비됨';
})();
