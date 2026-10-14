/* ⑦ 의 CSP(style-src 'self') 아래에서 **딴 집(github.io)에서 오는 꾸밈**도 죽는가 — 그것만 잰다.
   우리 goods.css·login.css 는 깃허브에서 온다. 그것까지 죽으면 메뉴 화면이 **헐벗어 보인다** —
   사장님은 그런 말씀을 안 하셨다. 그러면 ⑦ 은 뿌리가 아니다. 그 가름을 숫자로 둔다. */
const { chromium } = require('playwright');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  for (const [이름, csp] of [['CSP 없음', null], ["style-src 'self'", "default-src 'self' 'unsafe-inline' https:; style-src 'self'"]]) {
    const ctx = await b.newContext();
    await ctx.route('**://vendorpia.com/**', r => r.fulfill({ status:200,
      headers: Object.assign({'content-type':'text/html; charset=utf-8'}, csp ? {'content-security-policy': csp} : {}),
      body: `<html><head><meta charset="utf-8">
        <link rel="stylesheet" href="https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/goods.css">
        </head><body><div id="vp-root"><div class="vp-goods"><h1>단품관리</h1></div></div></body></html>` }));
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.fulfill({ status:200,
      contentType:'text/css', body: '#vp-root .vp-goods h1 { font-size: 77px }' }));   // 깃허브에서 온 꾸밈 흉내
    const page = await ctx.newPage();
    const 막힘 = [];
    page.on('console', m => { if (m.type()==='error') 막힘.push(m.text().slice(0,110)); });
    await page.goto('https://vendorpia.com/System/Master/goods.aspx');
    await page.waitForTimeout(700);
    const 잼 = await page.evaluate(() => {
      const h = document.querySelector('#vp-root .vp-goods h1');
      return { 글자크기: getComputedStyle(h).fontSize,
               붙은꾸밈수: document.styleSheets.length }; });
    console.log('\n[' + 이름 + '] 깃허브 꾸밈이 들었나 → h1 글자크기 ' + 잼.글자크기
      + ' (들면 77px · 죽으면 그 밖)  | 붙은 꾸밈 ' + 잼.붙은꾸밈수);
    if (막힘.length) console.log('   막힌 말: ' + JSON.stringify(막힘.slice(0,2)));
    await ctx.close();
  }
  await b.close();
})();
