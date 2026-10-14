/* inghome 이름 맞춰보기가 **숫자를 제대로 세는지** 재는 자.
   사장님 10-14: 「… inghome 스크랩된 모든 제품명을 비교하여 연결지을수 있는지 확인하고 …」
   ⚠ 진짜 벤더피아 상품명은 이 상자에 없다. **일부러 아는 답을 넣어** 셈이 맞는지만 본다 —
     inghome 진짜 이름 셋을 그대로, 셋을 괄호만 떼어, 둘을 아주 딴 이름으로 넣는다.
     그러면 맞아야 할 답은 **그대로 3 · 거의 3 · 안 맞음 2** 다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const 뿌리 = path.join(확장, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-vivivic-apps/459edaf4-304e-56e1-9eb8-ad6dc33034a4/scratchpad/PAGES.json','utf8'));

/* inghome 진짜 이름 여섯을 뽑아 쓴다 (공개 카탈로그다) */
const ing = JSON.parse(fs.readFileSync(path.join(뿌리,'inghome카탈로그/data/p0.json'),'utf8'));
const 뽑은 = ing.slice(0, 6).map(o => o.t);
const 그대로셋 = 뽑은.slice(0, 3);
const 괄호뗀셋 = 뽑은.slice(3, 6).map(t => t.replace(/\([^)]*\)/g, '').trim());
const 딴것둘  = ['없는상품 가가가 9999', '없는상품 나나나 8888'];
const 상품이름 = [...그대로셋, ...괄호뗀셋, ...딴것둘];

const 원래 = `<html><head><meta charset="utf-8"><title>상품관리</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="salesGoods.aspx">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option><option value="1">판매중</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 머리 = ["상품코드","상품명","매출처명","매출처코드","매입처명","배송사명","판매상태","옵션상품유무","단품코드","단품명","배송수량","양품수"];
const 줄들 = 상품이름.map((t, i) => ["KLS-"+(i+1), t, "가매출처", "1014", "가매입처", "○○택배",
  "판매중", "N", "ING-"+(i+1), "가나다 단품 "+(i+1), String(10+i), String(5+i)]);
const VP흉내 = `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) { cb(${JSON.stringify(머리)}, ${JSON.stringify(줄들)}, ${줄들.length}, ${줄들.length}); return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };
var VP_JOHON_PARTS = [];`;

(async () => {
  const 깃막기 = process.argv[2] === '깃막음';
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  /* inghome 자료는 깃허브에서 받는다 — 여기서는 저장소 파일을 그대로 내준다 */
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
    if (깃막기) return r.abort('blockedbyclient');
    const m = decodeURIComponent(new URL(r.request().url()).pathname).match(/data\/(p[0-3]\.json)$/);
    if (!m) return r.fulfill({ status: 404, body: '[]' });
    return r.fulfill({ status: 200, contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
      body: fs.readFileSync(path.join(뿌리, 'inghome카탈로그/data', m[1])) });
  });
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
  await page.addScriptTag({ content: fs.readFileSync(path.join(확장,'goods.js'),'utf8') });
  await page.waitForTimeout(1600);
  const 본것 = await page.evaluate(() => {
    const n = document.querySelector("#vp-root .vp-ing-note");
    return { 보이나: !!n && !n.hidden, 글: n ? n.textContent : null,
             나쁨: !!(n && n.classList.contains("vp-ing-bad")),
             링크수: document.querySelectorAll("#vp-root a[href*='inghome']").length,
             붉은줄수: document.querySelectorAll("#vp-root .vp-ing").length };
  });
  console.log('\n■ inghome 이름 맞춰보기 ' + (깃막기 ? '(깃허브를 막았을 때)' : ''));
  /* 맞아야 할 답을 **여기서 셈해** 둔다 (손으로 적지 않는다) */
  const 맞춤 = (t) => String(t||'').trim().toLowerCase();
  const 바짝 = (t) => String(t||'').toLowerCase().replace(/\([^)]*\)/g,' ').replace(/[^0-9a-z가-힣]/g,'');
  const 전부 = [];
  for (let i=0;i<4;i++) 전부.push(...JSON.parse(fs.readFileSync(path.join(뿌리,'inghome카탈로그/data/p'+i+'.json'),'utf8')));
  const G = new Set(전부.map(o=>맞춤(o.t))), J = new Set(전부.map(o=>바짝(o.t)));
  let 답딱=0, 답거의=0;
  for (const n of 상품이름) { if (G.has(맞춤(n))) 답딱++; else if (J.has(바짝(n))) 답거의++; }
  console.log('  넣은 상품 ' + 상품이름.length + '개 · inghome ' + 전부.length + '개');
  console.log('  **맞아야 할 답** — 그대로 ' + 답딱 + ' · 거의 ' + 답거의 + ' · 안 맞음 ' + (상품이름.length-답딱-답거의));
  console.log('  줄이 보이나: ' + 본것.보이나 + (본것.나쁨 ? ' (붉은 줄)' : ''));
  console.log('  적힌 글: ' + 본것.글);
  const 적힌 = (본것.글||'').match(/그대로 맞는 것 (\d+)개 · 거의 맞는 것 (\d+)개/);
  const 셈맞나 = 적힌 && Number(적힌[1]) === 답딱 && Number(적힌[2]) === 답거의;
  console.log('  **셈이 맞나**: ' + (적힌 ? (셈맞나 ? '맞다 ✓' : '틀리다 ✗ (적힌 것 ' + 적힌[1] + '/' + 적힌[2] + ')') : '못 읽었다'));
  console.log('  ⚠ 링크를 건 것: ' + 본것.링크수 + '개 · 붉은 마킹: ' + 본것.붉은줄수 + '개  (둘 다 0이어야 맞다 — 아직 안 건다)');
  if (탈.length) console.log('  터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2)));
  await b.close();
})();
