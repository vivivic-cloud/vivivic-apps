/* 11-07 [새 지시 단품등록] 을 재는 자 — 사장님 말씀 (한 글자도 안 고침):
   「단품관리에 단품등록 메뉴를 만들고 벤더피아 논리에 따라 단품이 등록될 수 있는 페이지를 만들어주세요. 단품코드생성시 참고할 수 있도록 상품명/단품명 등의 검색을 통해 비슷한 종류의 단품코드와 단품명이 검색되어 참고가 용이하도록 해주세요. 일단 만들고 수정합니다」
   ⚠ 진짜 vendorpia.com 이 아니다 — goodsDetl.aspx·categoryPopup.aspx·goods.aspx 를 **흉내**로 세운다(꼴은 11-07 사장님 크롬에서 읽기만 해서 잰 것). 자료는 전부 가짜.
   맥: VP_EXE 에 크로미움 경로, NODE_PATH 에 playwright 깐 곳. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';

const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","모델번호","매출처상품명","옵션상품유무","등록일"];
const 상품들 = [["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","가배송","판매중","비스켓 800 몸통 + 비스켓 800 문","bis800_b + bis800_d","M-800","비스켓800","N","2026-01-05"]];
const 단품머리 = ["단품명","단품코드","단품분류","매입처명","재고유형","발주유형","판매상태","바코드","등록일"];
const 처음단품 = [
  ["비스켓 800 몸통","bis800_b","리빙룸","가매입처","자사","구매발주","판매중","880001","2026-01-05"],
  ["비스켓 800 문","bis800_d","리빙룸","가매입처","자사","구매발주","판매중","880002","2026-01-05"],
  ["토리 침대 5","tori5","베드룸","나매입처","자사","구매발주","중지","880011","2026-03-01"],
];
let 단품들 = 처음단품.slice();
const 표 = (머리, 줄) => `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 행수 = '<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>';
const 단품쪽 = `<html><head><meta charset="utf-8"><title>단품관리</title></head><body id="body"><form name="aspnetForm" method="post" action="/System/Master/goods.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlSupplier" id="ddlSupplier"><option value="전체">전체</option></select><select name="ddlStockYn" id="ddlStockYn"><option value="전체">전체</option></select>
<select name="ddlOrderingType" id="ddlOrderingType"><option value="전체">전체</option></select><select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option></select>${행수}
<input name="tbGoodsCd" id="tbGoodsCd"><input name="tbGoodsNm" id="tbGoodsNm"><input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
const 상품쪽 = 단품쪽.replace('/System/Master/goods.aspx', '/System/Master/salesGoods.aspx').replace('단품관리', '상품관리');
const 분류쪽 = `<html><body><div id="oTree"><a id="oTreet0">분류</a><a id="oTreet1" title="2|1">리빙룸</a><a id="oTreet2" title="6|1">베드룸</a></div></body></html>`;
const P = 'ctl00$Contents$';
const 글칸 = (id, v = '', m = '') => `<input name="${P}${id}" id="${id}" value="${v}" ${m ? `maxlength="${m}"` : ''}>`;
const 고칸 = (id, 값들, 기본) => `<select name="${P}${id}" id="${id}">${값들.map(([v, t]) => `<option value="${v}" ${v === 기본 ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
const 등록쪽 = () => `<html><head><meta charset="utf-8"><title>VendorPia</title></head><body>
<form name="aspnetForm" method="post" action="./goodsDetl.aspx" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="x">
<input name="${P}tbCategoryCd" id="tbCategoryCd" readonly><input name="${P}tbCategoryNm" id="tbCategoryNm" readonly>
<input type="hidden" name="bGoodCdChecked" id="bGoodCdChecked"><input type="hidden" name="hdmajorBizYn" id="hdmajorBizYn">
${글칸('tbGoodsCd', '07142911', 20)}${고칸('ddlWarehouseNm', [['선택하세요','선택하세요'],['100','0.본사'],['200','1.창고']], '100')}${글칸('tbGoodsNm')}${글칸('tbThankUgoods','',20)}${글칸('tbModelNo','',30)}
${고칸('ddlBundleYn',[['1','가능'],['0','불가능']],'1')}${글칸('tbPackUnit','0',3)}${고칸('ddlTaxYn',[['1','과세'],['0','면세']],'1')}${고칸('ddlDCo',[['선택하세요','선택하세요'],['202','가배송']],'선택하세요')}
${고칸('ddlStockType',[['1','자사'],['0','타사']],'1')}${고칸('ddlOrderingType',[['1','구매발주'],['0','생산발주']],'1')}${고칸('ddlSalesStatus',[['1','판매중'],['2','중지'],['3','품절']],'1')}
<input type="checkbox" name="${P}cbAddGoodsYn" id="cbAddGoodsYn">${고칸('ddlDCostGb',[['1','선불'],['2','착불']],'1')}
${['tbBoxQty','tbDeliveryCost','tbPostPayment','tbDeliveryCost2','tbPostPayment2','tbCountryDCost','tbCountryPostPay','tbCountryDCost2','tbCountryPostPay2'].map((x)=>글칸(x)).join('')}${글칸('tbCellNm','0')}${글칸('tbBoxCd','0')}
<textarea name="${P}tbMemo" id="tbMemo"></textarea>
<input type="image" name="${P}btnExist" id="btnExist" src="e.gif">
<input type="image" name="${P}btnSave" id="btnSave" src="s.gif" onclick="return isFieldValid();">
<div id="가격"></div><input type="hidden" name="가격값" id="가격값">
</form><script>
var 값={}; var 동=document.createElement('input');동.type='radio';동.id='rdbRadio';document.getElementById('가격').appendChild(동);
var 표={get_rows:function(){return{get_length:function(){return 1},get_row:function(){return{get_cellByColumnKey:function(k){return{get_element:function(){return document.getElementById('가격')},set_value:function(v){값[k]=v;document.getElementById('가격값').value=JSON.stringify(값)},get_value:function(){return 값[k]}}}}}}}};
function $find(i){return i==='oGrid'?표:null}
function getReturnValue(o){document.getElementById('tbCategoryCd').value=o.categoryCd;document.getElementById('tbCategoryNm').value=o.categoryNm;}
document.getElementById('btnExist').addEventListener('click',function(e){e.preventDefault();var c=document.getElementById('tbGoodsCd').value;
 fetch('/System/WebService.asmx/GetGoodCdYN?c='+encodeURIComponent(c)).then(function(r){return r.text()}).then(function(t){if(t==='Y'){alert('사용중인 단품코드 입니다.');document.getElementById('bGoodCdChecked').value='false'}else{document.getElementById('bGoodCdChecked').value='true';alert('사용가능한 단품코드 입니다.')}})});
function isFieldValid(){var g=function(i){return document.getElementById(i).value.trim()};
 if(window.__검사막기){alert('벤더피아 검사 막음');return false}
 if(!g('tbCategoryCd')){alert('단품분류를 선택해주세요.');return false} if(!g('tbGoodsCd')){alert('단품코드를 선택해주세요.');return false}
 if(g('bGoodCdChecked')!=='true'){alert('단품코드 중복여부를 체크해주세요.');return false} if(!g('tbGoodsNm')){alert('단품명을 선택해주세요.');return false}
 if(!동.checked){alert('주거래여부를 선택해 주세요.');return false} return true}
${'/*검사막기*/'}
</script></body></html>`;

let 일;
const 풀기 = (t) => { const o = {}; for (const [k, v] of new URLSearchParams(t || '')) o[k.replace(P, '')] = v; return o; };
const 흉내 = (r) => {
  const u = new URL(r.request().url()), 셈 = r.request().method();
  const html = (body) => (r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }), true);
  if (/GetGoodCdYN/.test(u.pathname)) { 일.중복++; const c = (u.searchParams.get('c') || '').toLowerCase(); return (r.fulfill({ status: 200, body: 일.사용중.has(c) || 단품들.some((x) => x[1].toLowerCase() === c) ? 'Y' : 'N' }), true); }
  if (/categoryPopup\.aspx$/i.test(u.pathname)) return html(분류쪽);
  if (/goodsDetl\.aspx$/i.test(u.pathname)) {
    if (셈 === 'GET') return html(등록쪽().replace('/*검사막기*/', 일.검사막기 ? 'window.__검사막기=true' : ''));
    const f = 풀기(r.request().postData());
    일.저장.push(f);
    if (!일.안들어감) 단품들 = [...단품들, [f.tbGoodsNm, f.tbGoodsCd, '리빙룸', '기타', '자사', '구매발주', '판매중', '', '2026-11-07']];
    return html(등록쪽());
  }
  return false;
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  const 그림칸 = path.join(__dirname, '그림'); fs.mkdirSync(그림칸, { recursive: true });
  const 탈 = [];
  const 세우기 = async (폭) => {
    const ctx = await b.newContext({ viewport: { width: 폭, height: 900 } });
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://vendorpia.com' });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
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
        return html('<html><body><span>총 0 건</span><table><tr><th>없음</th></tr></table></body></html>');
      }
      if (길.endsWith('.js')) return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
      if (길.includes('salesGoods')) return html(상품쪽);
      return html(단품쪽);
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 160)));
    page.on('dialog', (d) => { 일.창++; d.dismiss(); });
    await page.goto('https://vendorpia.com/System/Master/goods.aspx');
    await page.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};window.말들=[];window.VP말=(m)=>말들.push(m);' });
    for (const f of ['login.css', 'goods.css']) await page.addStyleTag({ url: 깃 + encodeURIComponent(f) });
    for (const f of ['vp-data.js', 'goods.js']) await page.addScriptTag({ url: 깃 + encodeURIComponent(f) });
    await page.waitForSelector('button.vp-등록단추');
    await page.waitForFunction(() => document.querySelector('.vp-note') && !/불러오는/.test(document.querySelector('.vp-note').textContent), null, { timeout: 15000 });
    return { ctx, page };
  };
  const 열기 = async (page) => { await page.click('button.vp-등록단추'); await page.waitForSelector('[data-칸="tbGoodsNm"]'); };
  const 채우기 = async (page, 코드, 이름 = '시험단품') => {
    await page.selectOption('[data-칸="분류"]', '2');
    await page.fill('[data-칸="tbGoodsCd"]', 코드);
    await page.fill('[data-칸="tbGoodsNm"]', 이름);
  };
  const 결과글 = (page) => page.textContent('.vp-등록결과');
  const 결과기다림 = (page, 글) => page.waitForFunction((g) => new RegExp(g).test(document.querySelector('.vp-등록결과').textContent), 글, { timeout: 15000 });
  const 새판 = (o = {}) => { 단품들 = 처음단품.slice(); 일 = { 저장: [], 중복: 0, 창: 0, 사용중: new Set(), ...o }; };
  const 잠깐 = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const 폭 of [1280, 375]) {
    console.log('\n■ 등록 · ' + 폭 + 'px');
    새판();
    const { ctx, page } = await 세우기(폭);
    console.log(못(await page.isVisible('button.vp-등록단추')), '단품관리에 단품등록 단추');
    await 열기(page);
    console.log(못(await page.isHidden('.vp-goods:not(.vp-등록쪽)')), '누르면 목록 대신 등록 쪽');
    const 칸들 = await page.$$eval('.vp-등록칸들 .vp-등록칸 > span:first-child', (x) => x.map((e) => e.textContent));
    console.log(못(['단품분류명*','단품코드','창고명*','단품명*','포장단위*','메모','매입단가'].every((n) => 칸들.includes(n))), '칸·필수 표시 ' + 칸들.length);
    console.log(못(await page.inputValue('[data-칸="ddlWarehouseNm"]') === '100' && await page.inputValue('[data-칸="tbPackUnit"]') === '0' && await page.inputValue('[data-칸="tbGoodsCd"]') === '07142911'), '처음 값 = 벤더피아 처음 값');
    console.log(못((await page.$$eval('[data-칸="분류"] option', (x) => x.map((o) => o.value))).join() === ',2,6'), '분류 = 트리 코드');
    console.log(못(await page.$eval('[data-칸="tbGoodsCd"]', (e) => e.maxLength) === 20), '코드 20자');
    console.log(못(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)), '가로 넘침 없음');
    await page.screenshot({ path: path.join(그림칸, `단품등록-${폭}.png`), fullPage: true });
    // 빈칸 검사
    await page.click('.vp-등록저장');
    console.log(못(/단품분류를 선택해주세요/.test(await 결과글(page)) && 일.저장.length === 0), '분류 빈칸 → 벤더피아 글, 저장 0');
    await 채우기(page, 'new001');
    await page.click('.vp-등록저장');
    console.log(못(/단품코드 중복여부를 체크해주세요/.test(await 결과글(page)) && 일.저장.length === 0), '중복체크 전 저장 막음');
    await page.click('.vp-등록중복'); await 결과기다림(page, '사용가능');
    console.log(못(일.중복 === 1 && 일.저장.length === 0), '중복체크 = 쪽의 것(저장 0)');
    await page.fill('[data-칸="tbGoodsCd"]', 'new002');
    await page.click('.vp-등록저장');
    console.log(못(/중복여부를 체크/.test(await 결과글(page))), '코드 바꾸면 다시 체크');
    await page.fill('[data-칸="tbGoodsCd"]', 'new001');
    await page.click('.vp-등록중복'); await 결과기다림(page, '사용가능');
    await page.fill('[data-가격="purchaseAmt"]', '1,234');
    await page.fill('[data-칸="tbMemo"]', '메모글');
    // 두 번 눌러도 하나
    await page.evaluate(() => { const b = document.querySelector('.vp-등록저장'); b.click(); b.click(); });
    await 결과기다림(page, '등록됨|실패');
    const f = 일.저장[0] || {};
    console.log(못(/등록됨/.test(await 결과글(page))), '결과 ' + await 결과글(page));
    console.log(못(일.저장.length === 1), '두 번 눌러도 저장 POST ' + 일.저장.length);
    console.log(못(f.tbCategoryCd === '2' && f.tbCategoryNm === '리빙룸' && f.tbGoodsCd === 'new001' && f.tbGoodsNm === '시험단품' && f.tbMemo === '메모글' && f.ddlWarehouseNm === '100' && f.tbPackUnit === '0' && f.bGoodCdChecked === 'true'), '보낸 칸');
    console.log(못(JSON.parse(f.가격값 || '{}').purchaseAmt === 1234), '가격 칸 = 표에');
    console.log(못(일.창 === 0), '벤더피아 알림 창 안 뜸');
    console.log(못(await page.isDisabled('.vp-등록저장')), '등록 뒤 저장 잠김');
    console.log(못(await page.evaluate(() => !document.querySelector('iframe') && 말들.some((m) => /단품등록:목록확인 있음/.test(m)))), '틀 치움·VP말 단계');
    await page.click('.vp-등록뒤');
    console.log(못(await page.isVisible('.vp-goods:not(.vp-등록쪽)')), '← 단품관리로 돌아감');
    await ctx.close();
  }

  console.log('\n■ 실패 길');
  새판();
  let s = await 세우기(1280);
  await 열기(s.page); await 채우기(s.page, 'bis800_b');
  await s.page.click('.vp-등록중복'); await 결과기다림(s.page, '사용중');
  console.log(못(일.저장.length === 0), '사용중인 코드 → 벤더피아 글');
  await s.page.click('.vp-등록저장');
  console.log(못(/중복여부를 체크/.test(await 결과글(s.page)) && 일.저장.length === 0), '사용중이면 저장 안 감');
  await s.ctx.close();

  새판({ 안들어감: true });
  s = await 세우기(1280);
  await 열기(s.page); await 채우기(s.page, 'new003');
  await s.page.click('.vp-등록중복'); await 결과기다림(s.page, '사용가능');
  await s.page.click('.vp-등록저장'); await 결과기다림(s.page, '실패');
  console.log(못(/⑥/.test(await 결과글(s.page)) && 일.저장.length === 1), '저장 뒤 목록에 없음 → ' + await 결과글(s.page));
  단품들 = [...단품들, ['시험단품', 'new003', '리빙룸', '기타', '자사', '구매발주', '판매중', '', '2026-11-07']];
  await s.page.click('.vp-등록저장'); await 결과기다림(s.page, '①');
  console.log(못(일.저장.length === 1), '응답 뒤늦게 들어간 코드 → 다시 눌러도 저장 0 · ' + await 결과글(s.page));
  await s.ctx.close();

  새판({ 검사막기: true });
  s = await 세우기(1280);
  await 열기(s.page); await 채우기(s.page, 'new004');
  await s.page.click('.vp-등록중복'); await 결과기다림(s.page, '사용가능');
  await s.page.click('.vp-등록저장'); await 결과기다림(s.page, '실패');
  console.log(못(/벤더피아 검사 막음/.test(await 결과글(s.page)) && 일.저장.length === 0 && 일.창 === 0), '쪽 검사 alert → 까닭으로, 저장 0');
  await s.ctx.close();

  console.log('\n■ 코드 참고 검색');
  새판();
  s = await 세우기(1280);
  await 열기(s.page);
  const 찾기 = async (글) => { await s.page.fill('.vp-등록찾기', 글); await 잠깐(900); return s.page.$$eval('.vp-등록복사', (x) => x.map((e) => e.textContent)); };
  await s.page.waitForFunction(() => true);
  console.log(못((await 찾기('비스켓 문')).join() === 'bis800_d'), '단품명 낱말 나눔');
  console.log(못((await 찾기('TORI')).join() === 'tori5'), '코드·대소문자 무시·중지도 나옴');
  await 잠깐(3000);
  console.log(못((await 찾기('주방수납장')).join() === 'bis800_b,bis800_d'), '상품명으로 찾음');
  console.log(못(/비스켓 800 주방수납장/.test(await s.page.textContent('.vp-등록찾은것'))), '어느 상품인지 보임');
  await s.page.click('.vp-등록복사');
  console.log(못(await s.page.evaluate(() => navigator.clipboard.readText()) === 'bis800_b'), '코드 누르면 복사');
  console.log(못(await s.page.$eval('.vp-등록찾은것', (e) => /auto|scroll/.test(getComputedStyle(e).overflowY))), '스크롤 목록');
  console.log(못((await 찾기('없는말xyz')).length === 0 && /^0개/.test(await s.page.textContent('.vp-등록찾은수'))), '없으면 0개');
  await s.page.screenshot({ path: path.join(그림칸, '단품등록-참고.png') });
  await s.ctx.close();

  console.log(못(탈.length === 0), 'JS 탈 ' + JSON.stringify(탈.slice(0, 3)));
  await b.close();
  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
