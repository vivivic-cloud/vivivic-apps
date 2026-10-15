/* **까닭 적기**를 재는 자 — 「조용히 안 되는 것」을 말하게 만들었나.
   10-15 사장님이 진짜 PC 에서 보시고: 「cs단추없음 / 상품단추 전혀안됨 / 수입정보 단추자체가 없음」.
   셋 다 **아무 말 없이** 안 됐다. 그래서 까닭을 딱지(`#vp-판`)에 한 토막씩 적게 했다.
   ⚠ 딱지는 평소 숨어 있다 — 주소에 `?vg판=1` 일 때만 보인다(①).
   보아야 하는 것 — ㄱ) 잘 될 때 무엇이 적히나 ㄴ) **막혔을 때** 까닭이 적히나
     ㄷ) 못 받은 글·터진 말이 저절로 적히나 ㄹ) 딱지를 다시 써도 **안 지워지나**
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';
const PAGES = require('./본보기/PAGES.cjs');

/* 사장님 화면의 **진짜 칸 이름** (10-15 장부 짚은자리에서 그대로 옮겼다) */
const 참머리 = ["CS","CS주문번호","IMG","매출처","주문번호","주문번호2","가용수량","상품명","몰","주문자",
  "수취인","배송사","송장번호","배송상태","비고"];
/* CS 칸 이름이 아주 다른 꼴 — 못 찾았을 때 **칸 이름이 적히나** 보려고 */
const 딴머리 = ["접수","접수번호","IMG","매출처","주문번호","주문번호2","가용수량","품목","몰","주문자",
  "수취인","배송사","송장번호","배송상태","비고"];
const 줄 = (머리) => Array.from({length:6},(_,i)=>머리.map((c,j)=>
  j === 0 ? (i % 2 ? "교환요청" : "") : c + "-" + i));

const 폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option>
<option value="V2">배송중</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option>
<option value="V2">경동택배(포천)</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option>
<option value="V2">나매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">${폼}</body></html>`;
const 상품쪽 = `<html><head><meta charset="utf-8"><title>상품관리</title></head><body id="body">
<form name="aspnetForm" method="post" action="/System/Master/salesGoods.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중" selected>판매중</option></select>
<select name="ddlStore" id="ddlStore"><option value="전체">전체</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","등록일"];
const 상품들 = [["CS-0 상품","KLS-1","가매출처","가매입처","가주문","판매중","몸통","b1","2026-01-01"]];
const 표 = (머리, 줄들) => `<html><body><span>총 ${줄들.length} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄들.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;

/* `불러오기.js` 가 하는 것과 같은 꼴로 딱지를 세운다 (그 파일은 확장 안이라 못 고친다) */
const 불러오기흉내 = (판) => `
document.documentElement.classList.add("vp-clean");
window.__vp딱지다시 = function (글) {
  var d = document.getElementById("vp-판") || document.createElement("div");
  d.id = "vp-판"; d.textContent = 글;
  d.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:2147483646;background:rgba(0,0,0,.55);"
    + "color:#fff;font:600 11px/1.4 sans-serif;padding:3px 7px;border-radius:9px;pointer-events:none";
  if (!d.parentNode) document.body.appendChild(d);
};
window.__vp딱지다시("벤더피아 보기 ${판} · 확장 · 짚개✓ 기억✓ 손잡이✓ 꾸밈✓");`;

const 딱지읽기 = () => {
  const d = document.getElementById('vp-판');
  return d ? d.textContent : null;
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ 까닭 적기 — 「조용히 안 되는 것」을 말하게 만들었나');
  console.log('  ⚠ 자료는 전부 가짜. 머리줄은 사장님 장부 짚은자리에서 옮긴 **진짜 칸 이름**.');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  /* 세 가지 판 — ① 다 잘 될 때 ② goods.js 를 못 받을 때(CSP 흉내) ③ CS·상품명 칸이 없을 때 */
  for (const 판 of ['잘됨', 'goods막힘', '칸없음']) {
    const 머리 = 판 === '칸없음' ? 딴머리 : 참머리;
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
      const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop());
      if (판 === 'goods막힘' && 이름 === 'goods.js')
        return r.abort('blockedbyclient');            // CSP·막힘 흉내
      const 자리 = path.join(확장, 이름);
      if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
      return r.fulfill({ status: 200, contentType: 이름.endsWith('.css') ? 'text/css' : 'text/javascript',
        body: fs.readFileSync(자리, 'utf8') });
    });
    await ctx.route('**://vendorpia.com/**', (r) => {
      const 길 = new URL(r.request().url()).pathname;
      if (r.request().method() === 'POST') {
        if (길.includes('salesGoods')) return r.fulfill({ status:200,
          contentType:'text/html; charset=utf-8', body: 표(상품머리, 상품들) });
        if (길.includes('firmDvList')) return r.fulfill({ status:200,
          contentType:'text/html; charset=utf-8', body: 표(머리, 줄(머리)) });
        return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
          body: '<html><body><span>총 0 건</span><table><tr><th>없음</th></tr></table></body></html>' });
      }
      if (길.endsWith('.js')) return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 (흉내) */' });
      if (길.includes('salesGoods')) return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 상품쪽 });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 배송쪽 });
    });
    const page = await ctx.newPage();
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx?vg판=1');
    await page.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"0.34.18"}),getURL:f=>"/"+f};'
      + 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};' });
    await page.addScriptTag({ content: 불러오기흉내('0.34.18') });
    for (const f of ['login.css','search.css']) await page.addStyleTag({ url: 깃 + encodeURIComponent(f) });
    for (const f of ['vp-data.js','login.js','search.js'])
      await page.addScriptTag({ url: 깃 + encodeURIComponent(f) });
    await page.waitForTimeout(500);
    await page.click('.vp-bar button[type=submit]').catch(()=>{});
    await page.waitForTimeout(2600);

    const 글 = await page.evaluate(딱지읽기);
    const 토막 = (글 || '').split('‖').slice(1).map(x => x.trim());
    console.log('\n  ◆ ' + 판);
    console.log('    딱지 : ' + 글);
    console.log('    적힌 까닭 ' + 토막.length + '토막 ' + JSON.stringify(토막) + ' '
      + 못(토막.length > 0));
    console.log('    화면글 판이 그대로 남았나 ' + 못(/화면글 0\.34\.18/.test(글 || '')));

    if (판 === '잘됨') {
      console.log('    상품단추 부름·받음·준비가 적혔나 '
        + 못(토막.some(x=>/상품단추:부름/.test(x)) && 토막.some(x=>/goods\.js받음/.test(x))
             && 토막.some(x=>/상품단추:준비/.test(x))));
      console.log('    칸 자리가 적혔나 (CS 0 · 상품명 7) '
        + 못(토막.some(x=>/CS자리0 상품명자리7/.test(x))));
      console.log('    CS 거르개가 섰나 '
        + 못(await page.evaluate(() =>
            [...document.querySelectorAll('.vp-drop .vp-drop-name')].some(x=>x.textContent==='CS'))));
    }
    if (판 === 'goods막힘') {
      console.log('    ★ **못 받았다고 적혔나** '
        + 못(토막.some(x=>/못받음:goods\.js|goods\.js못받음/.test(x))));
      console.log('    그래도 CS 거르개는 섰나(따로 산다) '
        + 못(await page.evaluate(() =>
            [...document.querySelectorAll('.vp-drop .vp-drop-name')].some(x=>x.textContent==='CS'))));
    }
    if (판 === '칸없음') {
      console.log('    ★ **CS 칸이 없다고 적혔나** (자리 -1) '
        + 못(토막.some(x=>/CS자리-1/.test(x))));
      console.log('    ★ **진짜 칸 이름이 적혔나** '
        + 못(토막.some(x=>/머리줄:/.test(x) && /접수/.test(x))));
    }

    /* 딱지를 다시 써도(불러오기.js 가 1.5초·4초에 그렇게 한다) 까닭이 안 지워지나 */
    await page.evaluate(() => window.__vp딱지다시("벤더피아 보기 0.34.18 · 확장 · 짚개✓ 기억✓ 손잡이✓ 꾸밈✓"));
    await page.waitForTimeout(300);
    const 다시 = await page.evaluate(딱지읽기);
    console.log('    딱지를 다시 써도 까닭이 남나 (' + (다시||'').split('‖').length + '토막) '
      + 못((다시 || '').includes('‖') && /화면글 0\.34\.18/.test(다시 || '')));
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
