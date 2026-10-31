// 거래처등록(500347) 칸 채우기·읽기 — 저장은 누르지 않는다.
// 쓰는 법: 영림원 맨 위 창(로그인된 탭)의 콘솔/스크립트 도구에서 이 파일 내용을 한 번 실행한 뒤
//   ylwFill({sangho, name, corp:'개인'|'법인', rep, tel, biztype, bizitem}) → 상호·거래처명·법인/개인·대표자·전화·업태·종목
//   ylwRead() → 화면 칸 값 + 거래처종류 표(rows: "…|Sel(6)|종류이름(7)|…")
// 스크립트로 못 넣는 것(사람처럼 눌러야 함): 사업자번호(틀 칸) · 거래처종류 체크. 순서는 ../화면별-요령.md 「거래처등록」.
// 확인: 2026-10-31, T거래처 8건.
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
