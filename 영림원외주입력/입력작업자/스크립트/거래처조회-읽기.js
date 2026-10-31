// 거래처조회(500373) 읽기 → 폼 erp_vendors 꼴. 먼저 공통.js → 불러오기-공통.js. 영림원에 저장하지 않는다(읽기만).
// 쓰는 법: 거래처조회 화면에서 조건 **등록일 시작 칸을 x 로 비우고** 화면 「조회」 단추 → await ylw.read.vendors('T' 또는 'all')
//   (등록일 시작이 차 있으면 최근 등록분만 나와서 멈춘다. 거래처상태 조건은 기본 「정상」 — 휴업·폐업까지 보려면 비우고 조회.)
// 돌려줌 {rows:[{sangho,name,state,credit,bizno,rep,tel,biztype,bizitem,kinds}], 읽음, 확인못함, screen, labels}
// 칸(11-01 실제 화면, 시트 SS1): 거래처=CustName · 상호=FullName · 거래처상태=SMCustStatusName · 신용등급=UMCredLevelName · 사업자번호=BizNo ·
//   대표자성명=Owner · 업태=BizType · 종목=BizKind · 전화번호=TelNo · 거래처종류=UMCustKindName(「국내매입거래처, 외주가공거래처」처럼 쉼표로 이음).
// ⚠ 이 화면에는 폼의 **국내외구분·법인/개인** 칸이 없다 → 읽지 않고 비교도 안 한다(불러온 문서에도 그 칸은 없다). 「국가」 칸은 있지만 국내외구분과 같은 칸인지 확인 못 함.
// 확인: 2026-11-01 — 정상 184곳(T 9곳: T경기·T럭스·T로앤·T아인·T에이엠티·T우정·T이룸·T조혼·T진아).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.read || !Y.read.cols) throw new Error('먼저 공통.js → 불러오기-공통.js');
  const R = Y.read, PAGE = '500373';
  // 시트 원자료 BizNo 는 숫자 10자리(화면만 000-00-00000 으로 보임, 11-01) → 폼 저장 꼴(폼 v12 bizNorm)과 같게 하이픈을 넣는다
  const biz = (v) => { const d = R.s(v).replace(/\D/g, ''); return d.length === 10 ? d.slice(0, 3) + '-' + d.slice(3, 5) + '-' + d.slice(5) : R.s(v); };
  R.vendors = async (only) => {
    const w = await R.open(PAGE), sh = Y.sheet(PAGE, 'SS1');
    const fr = w.document.getElementById('txtRegDateFr_dat');
    if (fr && fr.value) throw new Error('거래처조회 등록일 시작(' + fr.value + ')을 x 로 비우고 화면 「조회」를 누른 뒤 다시');
    R.need(sh, ['거래처', '상호', '거래처상태', '신용등급', '사업자번호', '대표자성명', '업태', '종목', '전화번호', '거래처종류']);
    const all = Y.rows(sh);
    if (!all.length) throw new Error('거래처조회에 줄이 없음 — 화면 「조회」를 먼저');
    const rows = all.filter((r) => only !== 'T' || R.isT(r.CustName)).map((r) => ({
      sangho: R.s(r.FullName), name: R.s(r.CustName), state: R.s(r.SMCustStatusName), credit: R.s(r.UMCredLevelName),
      bizno: biz(r.BizNo), rep: R.s(r.Owner), tel: R.s(r.TelNo), biztype: R.s(r.BizType), bizitem: R.s(r.BizKind),
      kinds: R.s(r.UMCustKindName).split(/\s*,\s*/).filter(Boolean),
    }));
    return { rows, 읽음: rows.length, 화면전체: all.length, 확인못함: ['국내외구분', '법인/개인'], screen: '거래처조회',
      labels: { sangho: '상호', name: '거래처명', state: '거래처상태', credit: '신용등급', bizno: '사업자번호', rep: '대표자성명', tel: '전화번호', biztype: '업태', bizitem: '종목', kinds: '거래처종류' } };
  };
  return '거래처조회 읽기 준비됨';
})();
