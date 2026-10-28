/* 10-28 [새 지시 고객주문변경] 을 재는 자 — 사장님 말씀 (한 글자도 안 고침):
   「자 이렇게 단품이 선택되면 1.출고 담당자에게 보낼 메세지를 작성해야 합니다. 이 메세지는 직접입력 하는 칸을 만들어 주세요. 메세지가 없을경우 체크 해제하여 입력칸을 비활성으로 만들어 주세요. …
    해당 페이지의 '주문 단품정보' 섹션의 단품표에서 위에서 선택한 단품만 체크되게 합니다. … 고객주문변경 시트를 선택 합니다. … 유형 칸에는 이전에 선택한 cs유형(교환,취소,반품,AS) 가 선택됩니다.
    출고담당자에게 보낼 메세지가 작성된 상태라면 이곳의 상세사유에 해당 메세지를 입력 합니다. 메세지가 비활성 이거나 없다면 빈칸으로 둡니다 . 이 단계까지 갔다면 해당페이지 상단의 저장 버튼 클릭 합니다. …」
   ㄱ) 단품을 고르기 전엔 메시지·저장 숨음/꺼짐 · 고르면 메시지 칸(체크 켜짐) + 「CS등록 저장」
   ㄴ) 체크 끄면 입력칸 비활성 → 상세사유 빈칸
   ㄷ) 저장 길: csDetl(previousPage=first) GET → getReturnValue(안번호·상태코드·가용수) → btnReflash → 고른 단품만 CHK(비동기 되보냄) → 탭 hTab=CS → ddlCsType=종류 → tbReasonDetl=메시지 → btnSaveInsert
   ㄹ) 주문관리 맨 위 확인 → 「CS등록됨」 · 두 번 눌러도 저장 POST 하나 · 벤더피아 alert 창 안 뜸(sandbox)
   ㅁ) 단품표에 없는 단품 → 저장 POST 0, 「실패(③ …)」 · 저장 전 검사 alert → 저장 POST 0, 「실패(⑦ … 알림 「…」)」
   ⚠ 진짜 vendorpia.com 이 아니다 — csDetl.aspx·ordersPopup.aspx·orderMst.aspx 를 **흉내**로 세운다(꼴은 10-28 사장님 크롬에서 잰 것). 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';

const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","모델번호","매출처상품명","옵션상품유무","등록일"];
const 상품들 = [
  ["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","경동택배(포천)","판매중","비스켓 800 몸통 + 비스켓 800 문","bis800_b + bis800_d","M-800","비스켓800","N","2026-01-05"],
  ["비스켓 1200 주방수납장","KLS-1200","나매출처","가매입처","가주문","판매중","비스켓 1200 몸통","bis1200_b","M-1200","비스켓1200","N","2026-02-11"],
];
const 단품머리 = ["단품명","단품코드","단품분류","매입처명","재고유형","발주유형","판매상태","바코드","등록일"];
const 단품들 = [
  ["비스켓 800 몸통","bis800_b","수납장","가매입처","재고","정상","판매중","880001","2026-01-05"],
  ["비스켓 800 문","bis800_d","수납장","가매입처","재고","정상","판매중","880002","2026-01-05"],
  ["비스켓 1200 몸통","bis1200_b","수납장","가매입처","재고","정상","판매중","880003","2026-02-11"],
];
const 배송머리 = ["주문번호","상품명","단품명","수취인","수량","배송사","송장번호","배송상태","CS구분","매출처"];
const 배송줄 = [
  ["20261015-1","비스켓 800 주방수납장","비스켓 800 몸통","가나다","1","경동택배(포천)","640001","배송완료","","가매출처"],
  ["20261015-2","비스켓 1200 주방수납장","비스켓 1200 몸통","가나다","2","가주문","640002","배송중","","나매출처"],
  ["20261015-3","이름이 상품관리에 없는 물건","이름이 단품관리에 없는 단품","가나다","1","가주문","640003","배송완료","","가매출처"],
];

const 표 = (머리, 줄) => `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 빈표 = '<html><body><span>총 0 건</span><table><tr><th>없음</th></tr></table></body></html>';
const 폼 = (액션, 칸들) => `<form name="aspnetForm" method="post" action="${액션}" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
${칸들}
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 쪽 = (제목, 액션, 칸들) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body id="body">${폼(액션, 칸들)}</body></html>`;
const 행수 = '<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>';
const 배송쪽 = (액션) => 쪽('배송목록조회', 액션, `<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option></select>${행수}`);
const 상품쪽 = 쪽('상품관리', '/System/Master/salesGoods.aspx', `<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중" selected>판매중</option></select>
<select name="ddlStore" id="ddlStore"><option value="전체">전체</option></select>${행수}<input name="tbSGoodsCd" id="tbSGoodsCd"><input name="tbGoodsNm" id="tbGoodsNm">
<input type="checkbox" name="cbOptionGoodsYn" id="cbOptionGoodsYn">`);
const 단품쪽 = 쪽('단품관리', '/System/Master/goods.aspx', `<select name="ddlSupplier" id="ddlSupplier"><option value="전체">전체</option></select>
<select name="ddlStockYn" id="ddlStockYn"><option value="전체">전체</option></select><select name="ddlOrderingType" id="ddlOrderingType"><option value="전체">전체</option></select>
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중">판매중</option></select>${행수}
<input name="tbGoodsCd" id="tbGoodsCd"><input name="tbGoodsNm" id="tbGoodsNm">`);


const C = (id) => 'ctl00$Contents$' + id;
/* 원주문 검색 팝업 흉내 (CS업로드.cjs 와 같은 꼴) */
const 팝업자료 = [
  { 안: '1230001', 몰: '20261015-1', 코드: 'KLS-800', 상품: '비스켓 800 주방수납장', 상태: '배송완료', 가용: '1' },
  { 안: '1230002', 몰: '20261015-2', 코드: 'KLS-1200', 상품: '비스켓 1200 주방수납장', 상태: '배송완료', 가용: '2' },
];
const 상태글 = `<script>Sys.Application.add_init(function() { $create(Infragistics.Web.UI.WebDropDown, {"id":"oGrid_ddlStatus"},[{'0':[[,,,,,"배송지시","1",1,,1,]],'4':[[,,,,,"배송완료","4",0,,0,]]}],[]]}, null, null, $get("oGrid_ddlStatus")); });</script>`;
const 팝업머리 = ['주문번호','CS','매출처','몰','','주문번호','배송사','배송상태','상품코드','상품명','가용수','주문자'];
const 팝업쪽 = (찾는것) => `<html><body><form name="aspnetForm" method="post" action="./ordersPopup.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="PV"><input name="${C('tb_SOrderNo')}" id="tb_SOrderNo" value="${찾는것 || ''}">
<input name="${C('dcStartDt')}" id="dcStartDt" value="2025-10-28"><input type="image" name="${C('btnSearch')}" id="btnSearch" src="s.gif">
<div id="oGrid"><table><tr>${팝업머리.map(h => `<th>${h}</th>`).join('')}</tr></table>
<table>${찾는것 ? 팝업자료.filter(x => x.몰.includes(찾는것)).map(x => `<tr data-rowkey="[${x.안}]">${
  [x.안, '', '가매출처', '몰', '', x.몰, '택배', x.상태, x.코드, x.상품, x.가용, '김가짜'].map(v => `<td>${v}</td>`).join('')}</tr>`).join('') : ''}</table></div>
</form>${상태글}</body></html>`;
/* 주문 단품정보(안 번호별) — 1230002 는 일부러 상품 단품과 다른 코드 */
const 단품표 = { '1230001': [['bis800_b', '비스켓 800 몸통'], ['bis800_d', '비스켓 800 문']], '1230002': [['other_x', '다른 단품']] };
const 유형들 = [['1', '취소'], ['2', '반품'], ['3', '교환'], ['4', 'AS'], ['5', '설치']];
/* csDetl.aspx 흉내 — 10-28 잼: 처음 hTab=CS·유형 취소만 · 잇기 뒤 hTab=INQUERY·li1 active·유형 다섯 · 단품표 oGridOrderItem(CHK·goodsCd·csQty, Infragistics → $find 흉내)
   CHK 를 누르면 비동기 되보냄(XHR) — 진짜 그리드 RowUpdating::2 처럼. 저장 단추 검사: li1 active 면 문의자·제목·문의내용, 아니면 tbQty·csQty(흉내 알림모드) */
const 변경쪽 = (o = {}) => `<html><head><meta charset="utf-8"><title>고객주문변경_접수</title></head><body>
<form name="aspnetForm" method="post" action="./csDetl.aspx?previousPage=first" id="aspnetForm" enctype="multipart/form-data">
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="VS">
<input type="image" name="${C('btnSaveInsert')}" id="btnSaveInsert" src="s.gif">
<input name="${C('tbSOrderNo')}" id="tbSOrderNo" value="${o.주문표 || ''}">
<input type="hidden" name="${C('hOrderNo')}" id="hOrderNo" value="${o.숨은 || ''}">
<input type="hidden" name="${C('hdStatusCd')}" id="hdStatusCd" value="">
<input type="hidden" name="${C('hTab')}" id="hTab" value="${o.탭 || 'CS'}">
<input type="hidden" name="oGridOrderItem_clientState" id="oGridOrderItem_clientState" value="">
<input type="submit" name="${C('btnReflash')}" id="btnReflash" value="" style="display:none">
<a href="#tab1" id="li1" class="nav-link${o.탭 === 'INQUERY' ? ' active' : ''}">고객문의</a> <a href="#tab2" id="li2" class="nav-link${o.탭 === 'INQUERY' ? '' : ' active'}">고객주문변경</a>
<div id="tab1"><input name="${C('tbInquirer')}" id="tbInquirer" value="${o.문의자 || ''}"><input name="${C('tbTitle')}" id="tbTitle"><textarea name="${C('tbContent')}" id="tbContent"></textarea></div>
<div id="tab2"><select name="${C('ddlCsType')}" id="ddlCsType">${(o.숨은 ? 유형들 : 유형들.slice(0, 1)).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>
<select name="${C('ddlReason')}" id="ddlReason"><option value="0">게시판취소</option><option value="1">단순변심</option></select>
<input name="${C('tbQty')}" id="tbQty" value="1"><input name="${C('tbUsableQty')}" id="tbUsableQty" value="${o.가용 || ''}">
<textarea name="${C('tbReasonDetl')}" id="tbReasonDetl"></textarea></div>
<div id="oGridOrderItem"><table>${(단품표[o.숨은] || []).map(([c, n], i) => `<tr data-rowkey="[${o.숨은},${i + 1}]"><td><img src="off.gif" alt="Unchecked"></td><td>${c}</td><td>${n}</td><td>0</td></tr>`).join('')}</table></div>
</form>
<script>
function getReturnValue(v) { document.getElementById('hOrderNo').value = v.orderNo; document.getElementById('hdStatusCd').value = v.dStatusCd;
  document.getElementById('tbUsableQty').value = v.csUsableQty; document.getElementById('btnReflash').click(); }
document.getElementById('li1').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('hTab').value = 'INQUERY'; this.classList.add('active'); document.getElementById('li2').classList.remove('active'); });
document.getElementById('li2').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('hTab').value = 'CS'; this.classList.add('active'); document.getElementById('li1').classList.remove('active'); });
var 켬 = {}, 줄들 = [].slice.call(document.querySelectorAll('#oGridOrderItem tr'));
function 바꿈(i, v) { 켬[i] = v; 줄들[i].cells[0].firstChild.alt = v ? 'Checked' : 'Unchecked';
  document.getElementById('oGridOrderItem_clientState').value = JSON.stringify(줄들.filter(function (_, j) { return 켬[j]; }).map(function (tr) { return tr.cells[1].textContent; }));
  var x = new XMLHttpRequest(); x.open('POST', './csDetl.aspx?previousPage=first&igcb=1'); x.send('CHK ' + 줄들[i].cells[1].textContent + ' ' + v); }
줄들.forEach(function (tr, i) { tr.cells[0].firstChild.addEventListener('click', function () { 바꿈(i, !켬[i]); }); });
window.$find = function (id) { if (id !== 'oGridOrderItem') return null; return { get_rows: function () { return { get_length: function () { return 줄들.length; },
  get_row: function (i) { return { get_cellByColumnKey: function (k) { return {
    get_value: function () { return k === 'CHK' ? !!켬[i] : k === 'goodsCd' ? 줄들[i].cells[1].textContent : k === 'csQty' ? 줄들[i].cells[3].textContent : null; },
    set_value: function (v) { if (k === 'CHK') 바꿈(i, !!v); }, get_element: function () { return 줄들[i].cells[k === 'CHK' ? 0 : 1]; } }; } }; } }; } }; };
document.getElementById('btnSaveInsert').addEventListener('click', function (e) {
  if (document.getElementById('li1').classList.contains('active')) { if (document.getElementById('tbTitle').value === '') { alert('제목을 입력해주세요.'); e.preventDefault(); } return; }
  if (${o.알림모드 ? 'true' : 'false'}) { alert('부분 반품/AS 처리시 상품수량을 공백으로 처리후 다시 시도해 주십시오.'); e.preventDefault(); }
});
function 검사() { alert('문의자를 입력해주세요.'); }
${o.저장됨 ? "alert('저장되었습니다.');" : ''}
</script></body></html>`;
/* 주문관리 흉내 — #oGrid 머리(CS·주문번호 둘), 맨 위 줄 = 마지막 저장 */
const 주문관리머리 = ['', 'Page', 'CS', 'CS주문번호', 'IMG', '주문번호', '블랙번호', '매출처코드', '단품분류', '매출처', '생산처', '몰', '계정', '주문번호', '상품코드', '상품명', '수량', '가용수량', '수취인', '배송상태', '등록일'];
const 주문관리쪽 = (맨위) => `<html><body><form id="aspnetForm"><div id="oGrid"><table><tr>${주문관리머리.map(h => `<th>${h}</th>`).join('')}</tr></table><table>${
  [맨위, { 몰: '20261001-9', CS: '' }].filter(Boolean).map(x => `<tr>${주문관리머리.map(h => `<td>${h === 'CS' ? x.CS : h === '주문번호' ? x.몰 : ''}</td>`).join('')}</tr>`).join('')}</table></div></form></body></html>`;
const 풀기 = (몸) => { const o = {}; for (const m of String(몸 || '').matchAll(/name="([^"]+)"(?:; filename="[^"]*")?\r\n(?:Content-Type:[^\r]*\r\n)?\r\n([\s\S]*?)\r\n--/g)) o[m[1]] = m[2]; return o; };
let 일 = null, 알림모드 = false;
const 흉내 = (r) => {
  const u = new URL(r.request().url()), 셈 = r.request().method(), html = (body) => (r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }), true);
  if (/ordersPopup\.aspx$/i.test(u.pathname)) {
    if (셈 === 'GET') return html(팝업쪽(''));
    const f = Object.fromEntries(new URLSearchParams(r.request().postData() || ''));
    일.찾기++;
    return html(팝업쪽(f[C('tb_SOrderNo')]));
  }
  if (/orderMst\.aspx$/i.test(u.pathname) && 셈 === 'GET') { 일.확인++; return html(주문관리쪽(일.맨위)); }
  if (/csDetl\.aspx$/i.test(u.pathname)) {
    일.주소.push(셈 + ' ' + u.search);
    if (셈 === 'GET') return html(변경쪽({ 알림모드 }));
    if (u.searchParams.get('igcb')) { 일.비동기.push(r.request().postData()); return (r.fulfill({ status: 200, body: 'ok' }), true); }
    const f = 풀기(r.request().postData());
    if (C('btnReflash') in f) {
      일.잇기.push(f);
      const x = 팝업자료.find((p) => p.안 === f[C('hOrderNo')]);
      return html(변경쪽({ 숨은: f[C('hOrderNo')], 주문표: x ? x.몰 + ' / ' + x.안 + ' / 1' : '', 탭: 'INQUERY', 문의자: '김가짜', 가용: f[C('tbUsableQty')], 알림모드 }));
    }
    if ((C('btnSaveInsert') + '.x') in f) {
      일.저장.push(f);
      const x = 팝업자료.find((p) => p.안 === f[C('hOrderNo')]);
      일.맨위 = { 몰: x ? x.몰 : '', CS: (유형들.find(([v]) => v === f[C('ddlCsType')]) || [])[1] || '' };
      return html(변경쪽({ 숨은: f[C('hOrderNo')], 탭: 'CS', 저장됨: true }));
    }
    일.모름.push(Object.keys(f).filter((k) => /btn/.test(k)).join());
    return html(변경쪽({}));
  }
  return false;
};

const 판값 = () => {
  const 덮 = document.querySelector('.vp-상담덮개:not(.vp-cs덮개)');
  const c = 덮.querySelector('.vp-cs등록'), m = c.querySelector('.vp-cs메시지');
  const s = (e) => { if (!e) return null; const x = getComputedStyle(e); return [x.fontSize, x.fontWeight, x.borderRadius, x.backgroundColor, x.color].join(' '); };
  return { 메시지숨음: m.hidden, 체크: m.querySelector('input[type=checkbox]').checked, 칸꺼짐: m.querySelector('textarea').disabled,
    라벨: m.querySelector('.vp-상담라벨')?.textContent, 저장: m.querySelector('.vp-cs저장').textContent, 저장꺼짐: m.querySelector('.vp-cs저장').disabled,
    알림: m.querySelector('.vp-cs알림').textContent, 접수꼴: s(덮.querySelector('.vp-상담적기 button[type=submit]')), 저장꼴: s(m.querySelector('.vp-cs저장')),
    글칸꼴: s(덮.querySelector('.vp-상담적기 textarea')), 메시지꼴: s(m.querySelector('textarea')), 틀: document.querySelectorAll('iframe[sandbox]').length,
    넘침: 덮.querySelector('.vp-상담판').getBoundingClientRect().right > innerWidth + 1 };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  const 그림칸 = path.join(__dirname, '그림'); fs.mkdirSync(그림칸, { recursive: true });
  const 탈 = [];
  const 세우기 = async (폭, 터치) => {
    const ctx = await b.newContext({ viewport: { width: 폭, height: 900 }, hasTouch: !!터치 });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
      const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop());
      const 자리 = path.join(확장, 이름);
      if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
      return r.fulfill({ status: 200, contentType: 이름.endsWith('.css') ? 'text/css' : 'text/javascript', body: fs.readFileSync(자리, 'utf8') });
    });
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (흉내(r)) return;
      const 길 = new URL(r.request().url()).pathname, html = (body) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
      if (r.request().method() === 'POST') {
        if (길.includes('salesGoods')) return html(표(상품머리, 상품들));
        if (길.includes('/Master/goods')) return html(표(단품머리, 단품들));
        if (길.includes('firmDvList') || 길.includes('orderMst')) return html(표(배송머리, 배송줄));
        return html(빈표);
      }
      if (길.endsWith('.js')) return r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* 손잡이 (흉내) */' });
      if (길.includes('salesGoods')) return html(상품쪽);
      if (길.includes('/Master/goods')) return html(단품쪽);
      if (길.includes('orderMst')) return html(배송쪽('/System/Sales/orderMst.aspx'));
      if (길.includes('firmDvList')) return html(배송쪽('/System/Delivery/firmDvList.aspx'));
      return html(`<html><body>${폼(길, 행수)}</body></html>`);
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 160)));
    return { ctx, page };
  };
  const 글넣기 = async (page, 확장에서, 전체) => {
    await page.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};' });
    for (const f of 전체.꾸밈) await page.addStyleTag({ url: 깃 + encodeURIComponent(f) });
    for (const f of 전체.글) await page.addScriptTag({ url: 깃 + encodeURIComponent(f) });
  };


  const 판열기 = async (폭, 줄) => {
    일 = { 찾기: 0, 확인: 0, 주소: [], 잇기: [], 저장: [], 비동기: [], 모름: [], 맨위: null, 창: 0, 쓰기: [] };
    const { ctx, page } = await 세우기(폭, 폭 < 500);
    page.on('dialog', (d) => { 일.창++; d.dismiss().catch(() => {}); });
    page.on('request', (q) => { const u = q.url(), m = q.method();
      if (/firestore/.test(u) && m !== 'GET' && !/:runQuery/.test(u)) 일.쓰기.push(m + ' ' + u); });
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await 글넣기(page, true, { 꾸밈: ['login.css', 'goods.css', 'search.css'], 글: ['vp-data.js', 'login.js', 'search.js', 'goods.js'] });
    await page.waitForTimeout(600);
    await page.click('.vp-bar button[type=submit]');
    await page.waitForTimeout(3500);
    await page.click('.vp-table tbody tr:nth-child(' + 줄 + ') td:last-child');
    await page.waitForTimeout(600);
    return { ctx, page };
  };
  const 기다림 = async (page, 참, ms = 15000) => { const 끝 = Date.now() + ms; while (Date.now() < 끝) { if (await page.evaluate(참)) return true; await page.waitForTimeout(150); } return false; };
  const 단품 = (n) => '.vp-cs단품 .vp-goods-list:nth-child(' + n + ') > button';
  const 말들 = (page) => page.evaluate(() => (window.__말 || []));
  const 말듣기 = (page) => page.evaluate(() => { window.__말 = []; const 옛 = window.VP말; window.VP말 = (m) => { window.__말.push(m); return 옛 && 옛(m); }; });

  /* A — 1280 교환 · 몸통만 · 메시지 있음 */
  for (const 폭 of [1280, 375]) {
    console.log('\n■ A 교환 · 몸통 하나 · 메시지 — ' + 폭 + 'px');
    const { ctx, page } = await 판열기(폭, 1);
    await 말듣기(page);
    let 판 = await page.evaluate(판값);
    console.log('  ㄱ 고르기 전 메시지·저장 숨음 ' + 못(판.메시지숨음 && 판.저장꺼짐));
    await page.click('.vp-cs등록 [data-k="교환"]');
    await page.waitForTimeout(2500);
    판 = await page.evaluate(판값);
    console.log('  ㄱ 종류만 고름 → 아직 숨음 ' + 못(판.메시지숨음 && 판.저장꺼짐));
    await page.click(단품(1));
    판 = await page.evaluate(판값);
    console.log('  ★ ㄱ 단품 고름 → 「' + 판.라벨 + '」 칸(체크 켜짐) + 「' + 판.저장 + '」 켜짐 ' + 못(!판.메시지숨음 && 판.체크 && !판.칸꺼짐
      && 판.라벨 === '출고 담당자에게 보낼 메시지' && 판.저장 === 'CS등록 저장' && !판.저장꺼짐));
    console.log('  ㄱ 꼴 = 고객문의 칸·「접수」 단추 ' + 못(판.저장꼴 === 판.접수꼴 && 판.메시지꼴 === 판.글칸꼴) + ' · 넘침 없음 ' + 못(!판.넘침));
    await page.fill('.vp-cs메시지 textarea', '문짝 흠 — 몸통 교체 출고 부탁');
    await page.screenshot({ path: path.join(그림칸, '고객주문변경-' + 폭 + '.png') });
    await page.click('.vp-cs저장');
    await page.click('.vp-cs저장', { force: true, timeout: 500 }).catch(() => {});   // 두 번 누름
    const 끝남 = await 기다림(page, () => /CS등록됨|실패/.test(document.querySelector('.vp-cs알림').textContent));
    판 = await page.evaluate(판값);
    const s = 일.저장[0] || {};
    console.log('  ★ ㄹ 「' + 판.알림 + '」 ' + 못(끝남 && 판.알림 === 'CS등록됨'));
    console.log('  ★ ㄷ 주소 모두 previousPage=first ' + JSON.stringify(일.주소.filter((x) => !/igcb/.test(x))) + ' ' + 못(일.주소.length && 일.주소.every((x) => /previousPage=first/.test(x))));
    console.log('  ★ ㄷ 잇기 hOrderNo 1230001·상태 4·가용 1 ' + 못(일.잇기.length === 1 && 일.잇기[0][C('hOrderNo')] === '1230001'
      && 일.잇기[0][C('hdStatusCd')] === '4' && 일.잇기[0][C('tbUsableQty')] === '1'));
    console.log('  ★ ㄷ 단품 체크 = 몸통만(비동기 ' + 일.비동기.length + ') ' + s.oGridOrderItem_clientState + ' ' + 못(s.oGridOrderItem_clientState === '["bis800_b"]' && 일.비동기.length === 1));
    console.log('  ★ ㄷ 탭 CS · 유형 3(교환) · 상세사유 = 메시지 ' + 못(s[C('hTab')] === 'CS' && s[C('ddlCsType')] === '3' && s[C('tbReasonDetl')] === '문짝 흠 — 몸통 교체 출고 부탁'));
    console.log('  ★ ㄹ 저장 POST 하나(두 번 눌러도) · 주문관리 확인 ' + 일.확인 + ' ' + 못(일.저장.length === 1 && 일.확인 >= 1));
    await page.click('.vp-cs저장').catch(() => {});
    await page.waitForTimeout(800);
    console.log('  ㄹ 다시 눌러도 저장 POST 그대로 하나 ' + 못(일.저장.length === 1));
    console.log('  ★ ㄹ 벤더피아 alert 창 안 뜸 · 숨은 틀 치움 · 창고 쓰기 0 ' + 못(일.창 === 0 && 판.틀 === 0 && !일.쓰기.length));
    const 말 = await 말들(page);
    console.log('  ㄹ VP말 단계 기록 ' + 못(['잇기', '단품표', '체크', '저장 누름', '저장 뒤', '주문관리'].every((k) => 말.some((m) => m.startsWith('고객주문변경:' + k)))));
    console.log('  모르는 단추 0 ' + 못(!일.모름.length));
    await ctx.close();
  }

  /* B — 체크 해제 → 비활성 · 상세사유 빈칸 · 반품 · 단품 둘 */
  {
    console.log('\n■ B 메시지 체크 해제 · 반품 · 단품 둘 — 375px');
    const { ctx, page } = await 판열기(375, 1);
    await page.click('.vp-cs등록 [data-k="반품"]');
    await page.waitForTimeout(2500);
    await page.click(단품(1)); await page.click(단품(2));
    await page.fill('.vp-cs메시지 textarea', '이 글은 안 가야 함');
    await page.click('.vp-cs메시지 input[type=checkbox]');
    let 판 = await page.evaluate(판값);
    console.log('  ★ ㄴ 체크 끔 → 입력칸 비활성 ' + 못(!판.체크 && 판.칸꺼짐 && !판.저장꺼짐));
    await page.click('.vp-cs저장');
    await 기다림(page, () => /CS등록됨|실패/.test(document.querySelector('.vp-cs알림').textContent));
    판 = await page.evaluate(판값);
    const s = 일.저장[0] || {};
    console.log('  ★ ㄴ 상세사유 빈칸 · 유형 2(반품) · 체크 둘 「' + 판.알림 + '」 ' + 못(일.저장.length === 1 && s[C('tbReasonDetl')] === ''
      && s[C('ddlCsType')] === '2' && s.oGridOrderItem_clientState === '["bis800_b","bis800_d"]' && 판.알림 === 'CS등록됨'));
    await ctx.close();
  }

  /* C — 단품표에 없는 단품 */
  {
    console.log('\n■ C 주문 단품정보에 고른 단품이 없음 — 1280px');
    const { ctx, page } = await 판열기(1280, 2);
    await 말듣기(page);
    await page.click('.vp-cs등록 [data-k="AS"]');
    await page.waitForTimeout(2500);
    await page.click(단품(1));
    const 실패보기 = async () => {
      await page.click('.vp-cs저장');
      await 기다림(page, () => /CS등록됨|실패|검색창/.test(document.querySelector('.vp-cs알림').textContent));
      await page.waitForTimeout(600);
    };
    const 강조값 = () => page.evaluate(() => {
      const 칸 = document.querySelector('.vp-cs단품검색'), 글 = 칸.querySelector('input'), cs = getComputedStyle(글), r = 글.getBoundingClientRect();
      return { 켬: 칸.classList.contains('vp-안내'), 보임: !칸.hidden, 포커스: document.activeElement === 글, 테: cs.borderTopWidth + ' ' + cs.borderTopColor,
        바탕: cs.backgroundColor, 깜빡: cs.animationName, 화면안: r.top >= 0 && r.bottom <= innerHeight };
    });
    await 실패보기();
    const 판 = await page.evaluate(판값);
    console.log('  ★ ㅁ 저장 POST 0 · 「' + 판.알림 + '」 ' + 못(!일.저장.length && 판.알림 === '검색창에 새로운 단품명을 고르세요' && !판.저장꺼짐));
    /* 10-28 [새 지시 단품안내강조] 짧은 글 · 검색칸 강조(고른 통과 같은 꼴)·스크롤·포커스 · 까닭은 딱지에만 */
    let 강 = await 강조값();
    console.log('  ★ ㅁ 검색칸 강조 ' + JSON.stringify(강) + ' ' + 못(강.켬 && 강.보임 && 강.포커스 && 강.화면안 && 강.테 === '2px rgb(55, 53, 47)' && 강.바탕 === 'rgb(241, 241, 239)' && 강.깜빡 === 'vp-안내깜빡'));
    const 말 = await page.evaluate(() => window.__말);
    console.log('  ★ ㅁ 까닭은 화면에 없고 딱지에만 ' + 못(!/bis1200_b|표에는/.test(await page.evaluate(() => document.querySelector('.vp-cs등록').innerText.replace(/비스켓 1200 몸통[\s\S]*?bis1200_b/, '')))
      && !/표에는|bis1200/.test(판.알림) && 말.some((m) => /^고객주문변경:실패 ③ 주문 단품정보에 없는 단품: 비스켓 1200 몸통\(bis1200_b\) · 표에는/.test(m))));
    await page.fill('.vp-cs단품검색 input', '비스');
    강 = await 강조값();
    console.log('  ★ ㅁ 검색칸에 글 치면 강조 꺼짐 ' + 못(!강.켬 && 강.깜빡 === 'none'));
    await page.fill('.vp-cs단품검색 input', '');
    await page.waitForTimeout(400);   // 빈 글 → 목록 닫힘
    await 실패보기();
    강 = await 강조값();
    await page.click(단품(1));   // 풂 — 강조 그대로
    const 강1 = await 강조값();
    await page.click(단품(1));   // 고름 — 강조 꺼짐
    const 강2 = await 강조값();
    console.log('  ★ ㅁ 다시 실패 → 강조, 풀면 그대로, 단품 고르면 꺼짐 ' + 못(강.켬 && 강1.켬 && !강2.켬));
    await ctx.close();
  }

  /* D — 저장 전 검사 alert */
  {
    console.log('\n■ D 벤더피아 저장 전 검사 알림 — 1280px');
    알림모드 = true;
    const { ctx, page } = await 판열기(1280, 1);
    await page.click('.vp-cs등록 [data-k="교환"]');
    await page.waitForTimeout(2500);
    await page.click(단품(2));
    await page.click('.vp-cs저장');
    await 기다림(page, () => /CS등록됨|실패/.test(document.querySelector('.vp-cs알림').textContent));
    const 판 = await page.evaluate(판값);
    console.log('  ★ ㅁ 저장 POST 0 · 「' + 판.알림.slice(0, 80) + '」 · 창 안 뜸 ' + 못(!일.저장.length && /^실패\(⑦ 저장 안 됨 — 벤더피아 알림 「부분 반품/.test(판.알림) && 일.창 === 0));
    알림모드 = false;
    await ctx.close();
  }
  if (탈.length) { console.log('  터진 말 ' + JSON.stringify([...new Set(탈)].slice(0, 3))); 빨강++; }
  await b.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
