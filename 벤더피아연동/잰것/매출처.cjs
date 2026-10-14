/* 상품 상세의 **매출처 알약**을 재는 자.
   사장님 10-14: 「상품관리 상세에 나타나는 내용을 매출처명 차이로 중복 나열하지말고
   매출처버튼으로 필터링 시켜줘」  ⚠ 자료는 전부 가짜. 진짜 vendorpia.com 은 못 닿는다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-vivivic-apps/459edaf4-304e-56e1-9eb8-ad6dc33034a4/scratchpad/PAGES.json','utf8'));
const 원래 = `<html><head><meta charset="utf-8"><title>상품관리</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="salesGoods.aspx">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 머리 = ["상품코드","상품명","매출처명","매출처코드","매입처명","배송사명","판매상태","옵션상품유무","단품코드","단품명","배송수량","양품수","단가"];
/* 「가나다 세트」 는 매출처 셋(가매출처·나매출처·협찬), 「라마바 장」 은 매출처 하나 */
const 줄들 = [
  ["KLS-1","가나다 세트","가매출처","1010","가매입처","○○택배","판매중","N","ING-1a","가나다 단품","10","5","100000"],
  ["KLS-1","가나다 세트","나매출처","1011","가매입처","○○택배","판매중","N","ING-1b","가나다 단품","10","5","110000"],
  ["KLS-1","가나다 세트","협찬","1014","가매입처","○○택배","판매중","N","ING-1c","가나다 단품","10","5","0"],
  ["KLS-2","라마바 장","가매출처","1010","가매입처","○○택배","판매중","N","ING-2a","라마바 단품","7","3","90000"],
];
const VP흉내 = `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    cb(${JSON.stringify(머리)}, ${JSON.stringify(줄들)}, ${줄들.length}, ${줄들.length}); return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };
var VP_JOHON_PARTS = [];`;

const 본다 = () => {
  const p = document.querySelector("#vp-root .vp-goods-panel");
  const 알약 = [...document.querySelectorAll("#vp-root .vp-store-pill")];
  const 칸들 = [...document.querySelectorAll("#vp-root .vp-store-one")];
  return { 열렸나: !!p && !p.hidden,
    알약수: 알약.length, 알약글: 알약.map(b => b.textContent),
    켜진알약: 알약.filter(b => b.getAttribute("aria-pressed") === "true").map(b => b.textContent),
    줄칸수: 칸들.length, 보이는줄: 칸들.filter(c => !c.hidden).length,
    보이는매출처: 칸들.filter(c => !c.hidden).map(c => c.dataset.store),
    금액숨김단추: document.querySelectorAll("#vp-root .vp-goods-panel .vp-toggle").length,
    /* 전뒤를 같은 자로 재려고 — 「매출처명」 칸이 **눈에 몇 번** 보이나 */
    매출처칸보임: [...document.querySelectorAll("#vp-root .vp-goods-panel dt")]
      .filter(d => d.textContent.trim() === "매출처명" && d.offsetParent !== null).length,
    상세덩이: document.querySelectorAll("#vp-root .vp-goods-panel-body dl").length };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
  await ctx.route('**://vendorpia.com/**', (r) => {
    const u = new URL(r.request().url());
    if (u.pathname.endsWith('.css')) return r.fulfill({ status:200, contentType:'text/css',
      body: fs.readFileSync(path.join(확장, path.basename(u.pathname))) });
    return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 원래 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
  await page.goto('https://vendorpia.com/System/Master/salesGoods.aspx');
  await page.addStyleTag({ content: fs.readFileSync(path.join(확장,'login.css'),'utf8')
                                  + fs.readFileSync(path.join(확장,'goods.css'),'utf8') });
  await page.addScriptTag({ content: VP흉내 });
  await page.addScriptTag({ content: fs.readFileSync(process.env.GOODS || path.join(확장,'goods.js'),'utf8') });
  await page.waitForTimeout(900);

  const 누르기 = async (글) => { await page.evaluate((t) => {
      const b = [...document.querySelectorAll("#vp-root .vp-goods-list button")]
        .find(x => (x.textContent||"").startsWith(t)); b && b.click(); }, 글);
    await page.waitForTimeout(300); };
  const 알약누르기 = async (글) => { await page.evaluate((t) => {
      const b = [...document.querySelectorAll("#vp-root .vp-store-pill")].find(x => x.textContent === t);
      b && b.click(); }, 글);
    await page.waitForTimeout(250); };

  console.log('\n■ 상품 상세 매출처 거르기');
  console.log('  넣은 것 — 「가나다 세트」 는 매출처 **셋**(가매출처·나매출처·협찬), 「라마바 장」 은 **하나**');
  await 누르기('가나다 세트');
  let v = await page.evaluate(본다);
  console.log('\n  [매출처 셋인 상품] 열렸나 ' + v.열렸나 + ' · 알약 ' + v.알약수 + '개 ' + JSON.stringify(v.알약글));
  console.log('    켜진 알약 ' + JSON.stringify(v.켜진알약) + ' · 줄칸 ' + v.줄칸수 + '개 중 보이는 줄 ' + v.보이는줄 + '개 ' + JSON.stringify(v.보이는매출처));
  console.log('    ★ **「매출처명」 칸이 눈에 보이는 횟수: ' + v.매출처칸보임 + '번** (상세 덩이 ' + v.상세덩이 + '개)');
  await 알약누르기('협찬');
  v = await page.evaluate(본다);
  console.log('    「협찬」 누름 → 보이는 줄 ' + v.보이는줄 + '개 ' + JSON.stringify(v.보이는매출처) + ' · 켜진 ' + JSON.stringify(v.켜진알약));
  await 알약누르기('전부');
  v = await page.evaluate(본다);
  console.log('    「전부」 누름 → 보이는 줄 ' + v.보이는줄 + '개 · ★ 「매출처명」 보이는 횟수 ' + v.매출처칸보임 + '번');
  console.log('    금액/전체속성 단추 ' + v.금액숨김단추 + '개 (그대로 있어야 맞다)');

  await 누르기('라마바 장');
  v = await page.evaluate(본다);
  console.log('\n  [매출처 하나인 상품] 알약 ' + v.알약수 + '개 (0이어야 맞다 — 자리만 먹는다) · 보이는 줄 ' + v.보이는줄 + '개');
  if (탈.length) console.log('\n  터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2)));
  await b.close();
})();
