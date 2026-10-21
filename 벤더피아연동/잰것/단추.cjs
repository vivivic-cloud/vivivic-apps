/* 이름 단추가 **안 풀리고 다 검게 남는** 탈을 재는 자.
   사장님 10-14 (목록 단추를 짚으시고 쓰신 말씀, 그대로):
   「선택된버튼이 검게 변한후 다른선택시 해제되지않고 모든 선택된버튼이 검은상태로 유지되는 현상 수정해줘」
   ⚠ 진짜 vendorpia.com 은 이 상자에서 못 닿는다. `VP_DATA` 를 흉내 내고 **진짜 goods.js** 를 돌린다.
   ⚠ 자료는 전부 **가짜**다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/* ⚠ 시험이 쓰는 것은 **저장소 안**에 둔다 — 작업자 임시폴더를 가리키면 남의 손에서 안 돈다 (10-15) */
const PAGES = require('./본보기/PAGES.cjs');

/* 벤더피아 원래 화면 흉내 — goods.js 가 보는 못 셋 */
const 원래 = `<html><head><meta charset="utf-8"><title>단품관리</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="goods.aspx">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option><option value="1">판매중</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;

/* 가짜 목록 — 단품 여섯, 매입처(현위치) 둘 */
const 머리 = ["단품코드","단품명","매입처명","단품분류","재고유형","발주유형","판매상태","배송수량","양품수","상품코드","상품명","매출처명","매출처코드","창고"];
const 줄들 = Array.from({length: 6}, (_, i) => [
  "ING-" + String(i+1).padStart(3,'0'), "가나다 서랍장 " + (i+1),
  i < 3 ? "가매입처" : "나매입처", "서랍장", "재고", "발주", "판매중", String(50 - i*5), String(10 + i),
  "KLS-" + (i+1), "가나다 세트 " + (i+1), "가매출처", "1014", "0.본사",
]);
const VP흉내 = `
var VP_DATA = {
  PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + z(d.getMonth()+1) + "-" + z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) { cb(${JSON.stringify(머리)}, ${JSON.stringify(줄들)}, ${줄들.length}, ${줄들.length}); return { cachedAt: null }; },
  prefetch: function () {}, clearCache: async function () {},
};
window.VP저장 = { get: async function () { return {}; }, set: async function () {}, remove: async function () {} };
var VP_JOHON_PARTS = [];
`;

const 검은수 = () => {
  const 보임 = (el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
  const 모든 = [...document.querySelectorAll("#vp-root .vp-goods-list button")];
  const 검정 = 모든.filter((b) => b.classList.contains("on"));
  return { 통수: document.querySelectorAll("#vp-root .vp-gt tbody tr:not([hidden])").length,   /* 10-21: 표 줄 수 */
           단추수: 모든.filter(보임).length,
           검은단추: 검정.length,
           검은글: 검정.map((b) => (b.textContent || "").trim().slice(0, 18)) };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 950 } });
  await ctx.route('**://vendorpia.com/**', (r) => {
    const u = new URL(r.request().url());
    if (u.pathname.endsWith('.css')) return r.fulfill({ status:200, contentType:'text/css',
      body: fs.readFileSync(path.join(확장, path.basename(u.pathname))) });
    return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 원래 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,150)));
  const 길 = process.argv[2] || '/System/Master/goods.aspx';
  await page.goto('https://vendorpia.com' + 길);
  await page.addStyleTag({ content: fs.readFileSync(path.join(확장,'login.css'),'utf8')
                                  + fs.readFileSync(path.join(확장,'goods.css'),'utf8') });
  await page.addScriptTag({ content: VP흉내 });
  await page.addScriptTag({ content: fs.readFileSync(path.join(확장,'goods.js'),'utf8') });
  await page.waitForTimeout(700);

  const 보기 = async (이름) => {
    console.log('\n──── [' + (process.argv[2] || '/System/Master/goods.aspx') + '] ' + 이름 + ' ────');
    const 앞 = await page.evaluate(검은수);
    console.log('  단추 줄 ' + 앞.통수 + '개 · 보이는 단추 ' + 앞.단추수 + '개 · 검은 단추 ' + 앞.검은단추 + '개');
    for (const n of [1, 2, 3]) {
      const 됐나 = await page.evaluate((i) => {
        const bs = [...document.querySelectorAll("#vp-root .vp-goods-list button")]
          .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
        if (bs.length < i) return false;
        bs[i - 1].click(); return true;
      }, n);
      if (!됐나) { console.log('  ' + n + '번째 단추가 없다'); break; }
      await page.waitForTimeout(220);
      const v = await page.evaluate(검은수);
      console.log('  ' + n + '번째까지 눌렀다 → **검은 단추 ' + v.검은단추 + '개** ' + JSON.stringify(v.검은글));
    }
  };
  await 보기('㉮ 전체보기');
  /* 현위치별 보기로 바꾸고, 첫 현위치를 펼친다 */
  const 탭있나 = await page.evaluate(() => {
    const t = document.querySelector('#vp-root .vp-loc-tabs [data-view="place"]');
    if (!t) return false; t.click(); return true; });
  if (!탭있나) console.log('\n  (현위치별 보기 탭이 없다)');
  else {
    await page.waitForTimeout(300);
    await page.evaluate(() => { const h = document.querySelectorAll('#vp-root .vp-place-head');
      for (const x of h) x.click(); });
    await page.waitForTimeout(400);
    await 보기('㉯ 현위치별 보기 (단추가 딴 통으로 옮겨 간다)');
  }
  if (탈.length) console.log('\n  터진 말: ' + JSON.stringify(탈.slice(0,3)));
  await b.close();
})();
