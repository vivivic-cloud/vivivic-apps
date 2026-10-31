// 거래처등록(500347) 칸 채우기·읽기 — 저장은 누르지 않는다.
// 쓰는 법: 영림원 맨 위 창(로그인된 탭)의 콘솔/스크립트 도구에서 이 파일 내용을 한 번 실행한 뒤
//   ylwFill({sangho, name, corp:'개인'|'법인', rep, tel, biztype, bizitem}) → 상호·거래처명·법인/개인·대표자·전화·업태·종목
//   ylwRead() → 화면 칸 값 + 거래처종류 표(rows: "…|Sel(6)|종류이름(7)|…")
//   ylwKinds(['외주가공거래처','국내매입거래처']) → 거래처종류 체크(표 SS1 의 Sel 을 SetText 로) — 화면 체크 표시까지 11-01 확인, **저장까지는 아직 안 해 봄**.
//     처음 쓸 때는 저장 뒤 거래처조회로 종류가 맞는지 꼭 보고, 안 맞으면 전처럼 체크 칸을 손으로 누른다(그리고 이 줄을 고친다).
//   ylwCheck(폼 자료) → 저장 전 대조표(모든 칸 + 체크된 종류). 폼 자료 = erp_vendors 문서({sangho,name,state,region,credit,corp,bizno,rep,tel,biztype,bizitem,kinds}).
// 스크립트로 못 넣는 것(사람처럼 눌러야 함): 사업자번호(틀 칸 — 칸을 누르고 Home → 숫자 10자리 타자). 순서는 ../화면별-요령.md 「거래처등록」.
// 화면 하나에 한 건씩이다(표 화면이 아님).
// 확인: 2026-10-31, T거래처 8건. 11-01 칸 id 모두 그대로인 것 확인(빈 신규 화면, 저장 없음).
window.ylwFill = function (v) {
  const m = document.getElementById('500347_iframe').contentDocument;
  const s = m.getElementById('502294_iframe_subform').contentDocument;
  const setv = (d, id, val) => {
    const e = d.getElementById(id); e.focus(); e.value = val;
    for (const t of ['input', 'keyup', 'change', 'blur']) e.dispatchEvent(new Event(t, { bubbles: true }));
    return e.value;
  };
  const r = {};
  r.full = setv(m, 'txtFullName_txt', v.sangho);
  r.name = setv(m, 'txtCustName_txt', v.name);
  const corp = s.getElementById('txtSMBizTypeName_ul');
  corp.value = v.corp === '개인' ? '4019002' : '4019001';
  corp.dispatchEvent(new Event('change', { bubbles: true }));
  r.owner = setv(s, 'txtOwner_txt', v.rep || '');
  r.tel = setv(s, 'txtTelNo_txt', v.tel || '');
  r.type = setv(s, 'txtBizType_txt', v.biztype || '');
  r.kind = setv(s, 'txtBizKind_txt', v.bizitem || '');
  return r;
};
window.ylwRead = function () {
  const m = document.getElementById('500347_iframe').contentDocument;
  const s = m.getElementById('502294_iframe_subform').contentDocument;
  const g = (d, id) => { const e = d.getElementById(id); return e.tagName === 'SELECT' ? e.options[e.selectedIndex].text : e.value; };
  const t = s.getElementById('SS1').GetAllData().Tables[0];
  return {
    full: g(m, 'txtFullName_txt'), name: g(m, 'txtCustName_txt'), state: g(m, 'txtSMCustStatus_ul'),
    dom: g(m, 'txtSMDomFor_ul'), cred: g(m, 'txtUMCredLevel_ul'), bizno: g(s, 'txtBizNo_msk'),
    corp: g(s, 'txtSMBizTypeName_ul'), owner: g(s, 'txtOwner_txt'), tel: g(s, 'txtTelNo_txt'),
    type: g(s, 'txtBizType_txt'), kind: g(s, 'txtBizKind_txt'),
    checked: t.Rows.filter(x => String(x[6]) === '1').map(x => x[7]),
  };
};
window.ylwKinds = function (names) {
  const s = document.getElementById('500347_iframe').contentDocument.getElementById('502294_iframe_subform').contentDocument;
  const g = s.getElementById('SS1');
  const t = g.GetAllData().Tables[0];
  t.Rows.forEach((x, i) => g.SetText(i, 'Sel', names.includes(x[7]) ? '1' : '0'));
  return g.GetAllData().Tables[0].Rows.filter((x) => String(x[6]) === '1').map((x) => x[7]);
};
window.ylwCheck = function (v) {
  const r = window.ylwRead();
  const bz = (x) => String(x || '').replace(/\D/g, '');
  const want = [...(v.kinds || [])].sort().join(','), got = [...r.checked].sort().join(',');
  const rows = [
    ['상호', v.sangho, r.full], ['거래처명', v.name, r.name], ['거래처상태', v.state, r.state], ['국내외구분', v.region, r.dom],
    ['신용등급', v.credit, r.cred], ['사업자번호', bz(v.bizno), bz(r.bizno)], ['법인/개인', v.corp, r.corp], ['대표자성명', v.rep || '', r.owner],
    ['전화번호', v.tel || '', r.tel], ['업태', v.biztype || '', r.type], ['종목', v.bizitem || '', r.kind], ['거래처종류', want, got],
  ].map(([칸, 폼, 화면]) => ({ 칸, 폼: String(폼 == null ? '' : 폼).trim(), 화면: String(화면 == null ? '' : 화면).trim() }));
  rows.forEach((x) => (x.맞음 = x.폼 === x.화면));
  return { 모두맞음: rows.every((x) => x.맞음), 틀린칸: rows.filter((x) => !x.맞음), 대조표: rows };
};
