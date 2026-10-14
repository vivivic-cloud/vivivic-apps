/* 상세 팝업이 **바깥을 누르면 닫히나** 를 재는 자.
   사장님 10-14 (단품 상세 팝업을 짚으시고 쓰신 말씀, 그대로):
   「상세팝업 외부바탕화면 클릭시 상세팝업 닫히게 해줘」
   ⚠ 진짜 vendorpia.com 은 못 닿는다. VP_DATA 를 흉내 내고 **진짜 goods.js** 를 돌린다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-vivivic-apps/459edaf4-304e-56e1-9eb8-ad6dc33034a4/scratchpad/PAGES.json','utf8'));
const 원래 = `<html><head><meta charset="utf-8"><title>단품관리</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="goods.aspx">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 머리 = ["단품코드","단품명","매입처명","단품분류","재고유형","발주유형","판매상태","배송수량","양품수","창고","바코드","비고","상품코드","상품명","매출처명","매출처코드"];
const 줄들 = Array.from({length: 4}, (_, i) => [
  "ING-" + String(i+1).padStart(3,'0'), "가나다 서랍장 " + (i+1), "가매입처", "서랍장", "재고", "발주",
  "판매중", String(50-i*5), String(10+i), "0.본사", "BC" + i, "", "KLS-" + (i+1), "가나다 세트 " + (i+1), "가매출처", "1014",
]);
const VP흉내 = `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) { cb(${JSON.stringify(머리)}, ${JSON.stringify(줄들)}, ${줄들.length}, ${줄들.length}); return { cachedAt: null }; },
  prefetch: function () {}, clearCache: async function () {} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };
var VP_JOHON_PARTS = [];`;

const 열렸나 = () => { const p = document.querySelector("#vp-root .vp-goods-panel"); return !!p && !p.hidden; };

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**://vendorpia.com/**', (r) => {
    const u = new URL(r.request().url());
    if (u.pathname.endsWith('.css')) return r.fulfill({ status:200, contentType:'text/css',
      body: fs.readFileSync(path.join(확장, path.basename(u.pathname))) });
    return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 원래 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String((e && e.stack) || e).split('\n').slice(0,3).join(' | ')));
  await page.goto('https://vendorpia.com/System/Master/goods.aspx');
  await page.addStyleTag({ content: fs.readFileSync(path.join(확장,'login.css'),'utf8')
                                  + fs.readFileSync(path.join(확장,'goods.css'),'utf8') });
  await page.addScriptTag({ content: VP흉내 });
  /* 고치기 전뒤를 같은 자로 재려고 다른 goods.js 를 넣을 수 있게 둔다 */
  await page.addScriptTag({ content: fs.readFileSync(process.env.GOODS || path.join(확장,'goods.js'),'utf8') });
  await page.waitForTimeout(700);

  const 살핌 = await page.evaluate(() => ({
    단추수: document.querySelectorAll("#vp-root .vp-goods-list button").length,
    보이는단추: [...document.querySelectorAll("#vp-root .vp-goods-list button")]
      .filter(b => { const r = b.getBoundingClientRect(); return r.width > 4; }).length,
    상세창있나: !!document.querySelector("#vp-root .vp-goods-panel"),
    알림글: (document.querySelector("#vp-root .vp-note") || {}).textContent || "",
  }));
  console.log('  [살핌] ' + JSON.stringify(살핌));
  const 열기 = async () => {
    const 탈말 = await page.evaluate(() => {
      const b = document.querySelector("#vp-root .vp-goods-list button");
      if (!b) return "단추가 없다";
      try { b.click(); } catch (e) { return String(e && e.stack).split("\n").slice(0,3).join(" | "); }
      return null;
    });
    if (탈말) console.log('    [열다 터짐] ' + 탈말);
    await page.waitForTimeout(250);
    const 꼴 = await page.evaluate(() => { const p = document.querySelector("#vp-root .vp-goods-panel");
      return { hidden속성: p.hasAttribute("hidden"), hidden값: p.hidden, 이름: p.dataset.name || null,
               display: getComputedStyle(p).display, 켜진단추: document.querySelectorAll("#vp-root .vp-goods-list button.on").length }; });
    console.log('    [연 뒤 꼴] ' + JSON.stringify(꼴));
    return page.evaluate(열렸나);
  };
  const 자리 = async (고르개) => page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }; }, 고르개);

  console.log('\n■ 상세 팝업 바깥 눌러 닫기');
  console.log('  팝업 넷 가운데 상세 창(.vp-goods-panel)에 넣었다. 나머지 셋은 이미 있었다.');

  console.log('\n  열렸나: ' + await 열기());
  let 밖 = { x: 120, y: 700 };                         // 상세 창 바깥 (왼쪽 아래 빈 자리)
  await page.mouse.click(밖.x, 밖.y); await page.waitForTimeout(250);
  console.log('  ① 바깥을 **짧게** 눌렀다 → 열려 있나: ' + await page.evaluate(열렸나) + '  (닫혀야 맞다)');

  console.log('\n  다시 열었다: ' + await 열기());
  const 안 = await 자리('#vp-root .vp-goods-panel .vp-goods-panel-body');
  await page.mouse.click(안.x, 안.y); await page.waitForTimeout(250);
  console.log('  ② 카드 **속**을 눌렀다 → 열려 있나: ' + await page.evaluate(열렸나) + '  (열려 있어야 맞다)');

  await page.mouse.move(밖.x, 밖.y); await page.mouse.down();
  await page.waitForTimeout(900); await page.mouse.up(); await page.waitForTimeout(250);
  console.log('  ③ 바깥을 **0.9초 꾹** 눌렀다(짚기) → 열려 있나: ' + await page.evaluate(열렸나) + '  (열려 있어야 맞다)');

  const 안2 = await 자리('#vp-root .vp-goods-panel .vp-goods-panel-body');
  await page.mouse.move(안2.x, 안2.y); await page.mouse.down();
  await page.waitForTimeout(900); await page.mouse.up(); await page.waitForTimeout(250);
  console.log('  ④ 카드 속을 **0.9초 꾹** 눌렀다(짚기) → 열려 있나: ' + await page.evaluate(열렸나) + '  (열려 있어야 맞다)');

  await page.keyboard.press('Escape'); await page.waitForTimeout(250);
  console.log('  ⑤ ESC 를 눌렀다 → 열려 있나: ' + await page.evaluate(열렸나) + '  (닫혀야 맞다)');

  console.log('\n  다시 열었다: ' + await 열기());
  await page.mouse.move(밖.x, 밖.y); await page.mouse.down(); await page.waitForTimeout(80);
  const 안3 = await 자리('#vp-root .vp-goods-panel .vp-goods-panel-body');
  await page.mouse.move(안3.x, 안3.y); await page.mouse.up(); await page.waitForTimeout(250);
  console.log('  ⑥ 바깥에서 눌러 **카드 속에서 뗐다**(끌기) → 열려 있나: ' + await page.evaluate(열렸나) + '  (열려 있어야 맞다)');

  const 다른탈 = [...new Set(탈)];
  if (다른탈.length) { console.log('\n  터진 말 (서로 다른 것 전부 ' + 다른탈.length + '가지):');
    for (const t of 다른탈) console.log('    · ' + t); }
  await b.close();
})();
