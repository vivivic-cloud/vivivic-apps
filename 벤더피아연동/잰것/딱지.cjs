/* 딱지에 **화면글 판**이 같이 찍히는지 재는 자.
   사장님 10-15: 「새로고침해도 버전정보가 변하지 않는데?」
   ⚠ 진짜 확장은 못 돌린다 — `불러오기.js` 를 **진짜 그대로** 돌리고 chrome 만 흉내 낸다.
     그러면 딱지도 진짜처럼 1.5초·4초에 **다시 쓰인다**. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깔린판 = '0.34.5';                                  // 사장님이 지금 깔아 두신 판 (덮어쓰기 전)
const 쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body>
<div id="벤더피아제화면">벤더피아 원래 화면</div>
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 크롬흉내 = `
window.chrome = window.chrome || {};
chrome.runtime = { getManifest: () => ({ version: ${JSON.stringify(깔린판)} }),
                   getURL: (f) => "https://vendorpia.com/__확장__/" + encodeURIComponent(f) };
(() => { const 통 = {}; chrome.storage = { local: {
  get: async (k) => { const ks = Array.isArray(k) ? k : (typeof k === 'string' ? [k] : Object.keys(k || {}));
    const o = {}; for (const x of ks) if (x in 통) o[x] = 통[x]; return o; },
  set: async (o) => { Object.assign(통, o); }, remove: async (k) => { for (const x of [].concat(k)) delete 통[x]; } } }; })();`;
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  /* 깃허브는 막는다 — 확장 안의 것으로 가게 (사장님 꼴에 가깝다) */
  await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
  await ctx.route('**://vendorpia.com/**', (r) => {
    const u = new URL(r.request().url());
    const 길 = decodeURIComponent(u.pathname);
    if (길.startsWith('/__확장__/')) {
      const f = 길.slice('/__확장__/'.length);
      const 자리 = path.join(확장, f);
      if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: '' });
      return r.fulfill({ status: 200, contentType: f.endsWith('.css') ? 'text/css' : 'text/javascript',
                         body: fs.readFileSync(자리) });
    }
    if (r.request().method() === 'POST')
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
        body: '<html><body><span>총 0 건</span></body></html>' });
    return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 쪽 });
  });
  const page = await ctx.newPage();
  /* 깃허브로 나가는 주소를 모두 적어 둔다 — **캐시 표(?t=)가 붙는지** 보려고 */
  const 깃주소 = [];
  page.on('request', (r) => { if (r.url().includes('github.io')) 깃주소.push(r.url()); });
  await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
  await page.addScriptTag({ content: 크롬흉내 });
  await page.addScriptTag({ content: fs.readFileSync(path.join(확장, '불러오기.js'), 'utf8') });  // 진짜 그대로
  /* ⚠ 꾸밈을 손으로 넣는다. 불러오기.js 는 CSS 를 **깃에서만** 걸고, 글이 확장에서 와 버리면
     (못온것이 비어) **확장 CSS 뒷길을 안 탄다.** 그건 이 자의 일이 아니라 불러오기.js 의 일이다 —
     바이글에게 따로 올린다. 여기서는 꾸밈이 있는 꼴로 잰다. */
  await page.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') });
  await page.waitForTimeout(5200);                       // 1.5초·4초 다시쓰기까지 지나가게

  const v = await page.evaluate(() => {
    const d = document.getElementById('vp-판');
    const 보임 = (el) => { if (!el) return false; const r = el.getBoundingClientRect();
      return r.width > 2 && r.height > 2 && getComputedStyle(el).display !== 'none'; };
    return { 있나: !!d, 글: d ? d.textContent : null, 보이나: 보임(d),
             단추: !!document.getElementById('vp-바꾸기') };
  });
  const 표붙은것 = 깃주소.filter((u) => /\?t=\d+$/.test(u));
  console.log('\n■ 깃허브로 나간 주소 ' + 깃주소.length + '개 · **캐시 표(?t=) 붙은 것 ' + 표붙은것.length + '개**');
  if (깃주소.length) console.log('  보기: ' + 깃주소[0].replace(/^.*벤더피아연동\//, '…/').slice(0, 70));
  console.log('\n■ 딱지에 화면글 판이 찍히나 (깔린 판 ' + 깔린판 + ')');
  console.log('  ★ 딱지 글 : 「' + v.글 + '」');
  console.log('     길이 ' + (v.글 || '').length + '자 · 보이나 ' + v.보이나);
  console.log('     「깔림」 들었나 ' + (v.글 || '').includes('깔림 ' + 깔린판)
            + ' · 「화면글」 들었나 ' + /화면글 \d+\.\d+\.\d+/.test(v.글 || ''));
  console.log('     두 번 붙지 않았나 : ' + (((v.글 || '').match(/화면글/g) || []).length === 1));
  /* 전환 단추를 눌렀을 때 딱지가 같이 숨나 */
  if (v.단추) {
    await page.click('#vp-바꾸기'); await page.waitForTimeout(400);
    const 뒤 = await page.evaluate(() => { const d = document.getElementById('vp-판');
      const r = d && d.getBoundingClientRect();
      return { 보이나: !!(d && r.width > 2 && getComputedStyle(d).display !== 'none') }; });
    console.log('  전환 단추를 눌렀을 때 딱지가 숨나 : ' + (뒤.보이나 ? '안 숨는다 ✗' : '숨는다 ✓'));
  } else console.log('  (전환 단추가 없다 — login.js 를 안 넣은 자다)');
  await b.close();
})();
