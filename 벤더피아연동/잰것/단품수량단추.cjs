/* 10-29 [새 지시 단품수량단추] 상품관리 상세 — 같은 단품이 둘 이상이면 「×2」 대신 수량만큼 같은 단품 단추.
   사장님(그대로) 「상품관리 - 상품명과 연결되는 단품이 같은 단품으로 2개 이상의 구성일때 단품버튼에 X2 표기가 아닌 수량에 맞는 단품버튼이 나타나도록 해주세요」
   ⚠ 자료는 전부 가짜. 창고(firestore)·깃허브는 막는다. 맥: VP_EXE 로 크로미움 길. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');
const 원래 = `<html><head><meta charset="utf-8"><title>상품관리</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="salesGoods.aspx">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 상품머리 = ["상품코드","상품명","매출처명","매출처코드","매입처명","배송사명","판매상태","옵션상품유무","단품코드","단품명","배송수량","양품수","단가"];
/* 「비스켓 세트」 = 몸통 ×2 + 문 ×3 + 다리 1 */
const 상품줄 = [
  ["KLS-1","비스켓 세트","가매출처","1010","가매입처","○○택배","판매중","N","bs-body+bs-body+bs-door+bs-door+bs-door+bs-leg","비스켓 몸통+비스켓 몸통+비스켓 문+비스켓 문+비스켓 문+비스켓 다리","10","5","100000"],
  ["KLS-2","라마바 장","가매출처","1010","가매입처","○○택배","판매중","N","rm-1","라마바 단품","7","3","90000"],
];
const 단품머리 = ["단품코드","단품명","단품분류","매입처명","재고유형","발주유형","판매상태","바코드"];
const 단품줄 = [
  ["bs-body","비스켓 몸통","장","가매입처","재고","발주","판매중",""],
  ["bs-door","비스켓 문","장","가매입처","재고","발주","판매중",""],
  ["bs-leg","비스켓 다리","장","가매입처","재고","발주","판매중",""],
  ["rm-1","라마바 단품","장","가매입처","재고","발주","판매중",""],
];
const 재고머리 = ["단품코드","단품명","창고","매입처","분류명","양품수"];
const 재고줄 = [["bs-body","비스켓 몸통","0.본사","가매입처","장","4"],["bs-door","비스켓 문","0.본사","가매입처","장","9"]];
const VP흉내 = `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    var u = String(url || "");
    var h = /StockList/.test(u) ? ${JSON.stringify(재고머리)} : /salesGoods/.test(u) ? ${JSON.stringify(상품머리)} : /goods\\.aspx/.test(u) ? ${JSON.stringify(단품머리)} : ${JSON.stringify(상품머리)};
    var r = /StockList/.test(u) ? ${JSON.stringify(재고줄)} : /salesGoods/.test(u) ? ${JSON.stringify(상품줄)} : /goods\\.aspx/.test(u) ? ${JSON.stringify(단품줄)} : ${JSON.stringify(상품줄)};
    cb(h, r, r.length, r.length); return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };
var VP_JOHON_PARTS = [];`;

let 초록 = 0, 빨강 = 0;
const 못 = (ok) => { ok ? 초록++ : 빨강++; return ok ? '✓' : '✗'; };

(async () => {
  for (const 너비 of [1280, 375]) {
    const b = await chromium.launch({ executablePath: EXE });
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://firestore.googleapis.com/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url());
      if (u.pathname.endsWith('.css')) return r.fulfill({ status:200, contentType:'text/css',
        body: fs.readFileSync(path.join(확장, path.basename(u.pathname))) });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 원래 });
    });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
    await page.goto('https://vendorpia.com/System/Master/salesGoods.aspx');
    await page.addStyleTag({ content: fs.readFileSync(path.join(확장,'login.css'),'utf8') + fs.readFileSync(path.join(확장,'goods.css'),'utf8') });
    await page.addScriptTag({ content: VP흉내 });
    await page.addScriptTag({ content: fs.readFileSync(path.join(확장,'goods.js'),'utf8') });
    await page.waitForTimeout(900);
    await page.evaluate(() => { const b = [...document.querySelectorAll("#vp-root .vp-goods-list button")].find(x => (x.textContent||"").startsWith("비스켓 세트")); b && b.click(); });
    await page.waitForTimeout(1500);
    const 칩 = () => page.evaluate(() => {
      const p = document.querySelector("#vp-root .vp-goods-panel");
      const bs = [...p.querySelectorAll(".vp-chips button")];
      const 꼴 = (b) => { const s = getComputedStyle(b); return [s.fontSize, s.fontWeight, s.color, Math.round(b.getBoundingClientRect().height)].join('/'); };
      return bs.map(b => ({ 글: b.textContent, 첫: (b.firstChild && b.firstChild.textContent) || '', 점: b.querySelectorAll('.vp-점 i').length,
        cls: b.className, 꼴: 꼴(b) }));
    });
    const 것 = await 칩();
    console.log(`\n■ ${너비} 상품관리 「비스켓 세트」 상세 단품 단추: ` + 것.map(x => x.글).join(' | '));
    const 몸 = 것.filter(x => x.글.startsWith('비스켓 몸통')), 문 = 것.filter(x => x.글.startsWith('비스켓 문')), 다리 = 것.filter(x => x.글.startsWith('비스켓 다리'));
    console.log('  ★ 몸통 단추 2개 ' + 못(몸.length === 2) + ' · 문 3개 ' + 못(문.length === 3) + ' · 다리 1개 ' + 못(다리.length === 1));
    console.log('  ★ 「×」 표기 없음 ' + 못(것.every(x => !/×\d/.test(x.글))));
    console.log('  ★ 같은 단품 단추끼리 글·점·꼴 같음 ' + 못([몸, 문].every(g => g.every(x => x.글 === g[0].글 && x.cls === g[0].cls && x.꼴 === g[0].꼴))));
    console.log('  ★ 다른 단품 단추와 꼴 같음 ' + 못(것.every(x => x.꼴 === 것[0].꼴)) + ' ' + 것[0].꼴);
    console.log('  ★ 차례: 몸통·몸통·문·문·문·다리 ' + 못(것.map(x => x.글.replace(/^비스켓 /,'').replace(/[a-z].*$/,'')).join(',').startsWith('몸통,몸통,문,문,문,다리')));
    console.log('  ★ 양품 딱지(몸통 4·문 9) 모두 ' + 못(몸.every(x => /4/.test(x.글.replace('비스켓 몸통',''))) && 문.every(x => /9/.test(x.글.replace('비스켓 문','')))));
    /* 두 번째 몸통 단추를 누르면 그 단품 상세 */
    await page.evaluate(() => { const bs = [...document.querySelectorAll("#vp-root .vp-goods-panel .vp-chips button")].filter(b => b.textContent.startsWith('비스켓 몸통')); bs[1] && bs[1].click(); });
    await page.waitForTimeout(500);
    const 뜬 = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-modal:not([hidden]) strong')].map(s => s.textContent).filter(Boolean));
    console.log('  ★ 둘째 몸통 단추 누름 → 단품 상세 ' + 못(뜬.some(t => t.includes('비스켓 몸통'))) + ' ' + JSON.stringify(뜬));
    console.log('  ★ 쪽 오류 0 ' + 못(!탈.length) + ' ' + 탈.join(' / '));
    await b.close();
  }
  console.log(`\n★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
