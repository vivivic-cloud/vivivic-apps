/* 10-26 [새 지시 새창] 사장님 말씀 (한 글자도 안 고침):
   「현재 페이지에서 어떤방식으로든 단품관리 상품관리등 링크를 타고 넘어갈때 화면 전환이 아닌 새페이지로 나타나게 해줘」
   보는 것: 메뉴 단추 다섯(배송관리·단품관리·상품관리·재고조회·CS등록)을 누르면 **새 탭**이 뜨고 메뉴 화면은 그대로인가.
            goods.js 팝업의 「…로 가기」(.vp-goto) 가 새 탭으로 열리는 꼴인가.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 흉내로 세운다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');
const 메인쪽 = `<html><head><meta charset="utf-8"><title>vendorpia</title></head><body>
<div><a href="/System/Delivery/firmDvList.aspx">배송관리</a></div></body></html>`;
const VP흉내 = `var VP_DATA = { PAGES: ${JSON.stringify(PAGES)}, list: async function(){ return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**://vendorpia.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 메인쪽 }));
  const 쪽 = await ctx.newPage();
  await 쪽.goto('https://vendorpia.com/index.aspx');
  await 쪽.addScriptTag({ content:
    'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};' });
  await 쪽.addStyleTag({ content: fs.readFileSync(path.join(확장, 'menu.css'), 'utf8') });
  await 쪽.addScriptTag({ content: VP흉내 });
  await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'menu.js'), 'utf8') });
  const 이름들 = await 쪽.$$eval('#vp-root .vp-btn', (a) => a.map((x) => x.textContent.trim()));
  console.log('\n■ 새창 — 메뉴 단추 ' + 이름들.length + '개 ' + 못(이름들.length === 5));
  for (const 이름 of 이름들) {
    const [새] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null),
      쪽.click(`#vp-root .vp-btn:text-is("${이름}")`)]);
    if (새) await 새.waitForLoadState().catch(() => {});
    const 그대로 = new URL(쪽.url()).pathname === '/index.aspx' && await 쪽.$('#vp-root') !== null;
    console.log('  ★ ' + 이름 + ' → 새 탭 ' + (새 ? new URL(새.url()).pathname + new URL(새.url()).hash : '없음') + ' ' + 못(!!새)
      + ' · 메뉴 화면 그대로 ' + 못(그대로));
    if (새) await 새.close();
  }
  /* goods.js 팝업 「…로 가기」 — 틀 글에 target 이 박혀 있나 */
  const g = fs.readFileSync(path.join(확장, 'goods.js'), 'utf8');
  console.log('  ★ 「…로 가기」(.vp-goto) target="_blank" ' + 못(/<a class="vp-goto" target="_blank"/.test(g)));
  console.log('\n  초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
