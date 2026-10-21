/* 사장님 10-21 「벤더피아 전체화면이 보여야 한다 … 그 주위를 둘러싼 각종 메뉴들 이 보이는 원래의전체화면」 (장부 a1792566604 바로잡음)
   「원래 화면」 단추가 ① 틀 밖(맨 위 창)에서 눌리면 벤더피아 틀(위 메뉴띠 포함)로 가서 그 쪽을 틀 안에 여는가,
   ② 틀 안쪽에서 눌리면 옆 틀 덮기까지 걷는가, ③ 「← 우리 화면」 으로 돌아오는가 를 잰다.
   ⚠ 진짜 vendorpia.com 은 못 닿는다 — 틀 꼴은 흉내(잰것/흉내.cjs)다. 자료는 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 흉내 = require('./흉내.cjs');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 글 = `window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};` +
  fs.readFileSync(path.join(__dirname, '..', 'login.js'), 'utf8');
const 넣기 = (html, 덮나) => html.replace('</body>', `<script>${덮나 ? 'document.documentElement.classList.add("vp-clean");' : ''}${글}</script></body>`);
let 빨강 = 0;
const 맞나 = (이름, 참) => { console.log((참 ? '🟩 ' : '🟥 ') + 이름); if (!참) 빨강++; };
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const 길들 = (p) => p.route('**://vendorpia.com/**', (r) => {
    const 길 = new URL(r.request().url()).pathname;
    const 낸다 = (body) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
    if (길 === '/') return 낸다(흉내.틀('/index.aspx'));
    if (길 === '/top.aspx') return 낸다(흉내.몸통('위', '<div id="메뉴띠">벤더피아 위 메뉴</div>'));
    if (길 === '/index.aspx') return 낸다(넣기(흉내.메인, true));
    if (길 === '/System/Delivery/firmDvList.aspx') return 낸다(넣기(흉내.목록('배송관리'), true));
    return r.fulfill({ status: 404, body: '' });
  });
  /* ① 틀 밖: 우리 메뉴에서 배송관리를 틀 밖으로 연 꼴 → 원래 화면 */
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await 길들(p);
    await p.goto('https://vendorpia.com/');                        // 틀 → 그 안에서 메뉴(index.aspx)
    await p.waitForTimeout(500);
    await p.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');  // 틀 밖으로 열림
    await p.waitForTimeout(300);
    맞나('틀 밖으로 열렸다(재료)', await p.evaluate(() => window.top === window));
    await p.click('#vp-바꾸기'); await p.waitForTimeout(2500);
    const 틀 = p.frames().map((f) => f.url().replace('https://vendorpia.com', ''));
    console.log('  틀들:', JSON.stringify(틀));
    맞나('① 원래 화면: 위 메뉴띠 틀이 보인다', p.frames().some((f) => f.url().endsWith('/top.aspx')));
    const 안 = p.frames().find((f) => f.url().endsWith('/System/Delivery/firmDvList.aspx'));
    맞나('① 보던 배송관리가 그 틀 안에 열려 있다', !!안);
    맞나('① 안쪽은 우리 덮기가 걷혀 있다', !!안 && await 안.evaluate(() => !document.documentElement.classList.contains('vp-clean')));
    맞나('① 「← 우리 화면」 단추가 있다', !!안 && await 안.evaluate(() => /우리 화면/.test(document.getElementById('vp-바꾸기')?.textContent || '')));
    if (안) { await 안.click('#vp-바꾸기'); await p.waitForTimeout(1500); }
    맞나('③ 돌아오면 배송관리 한 장(우리 화면)이다', p.url().endsWith('/System/Delivery/firmDvList.aspx') && await p.evaluate(() => document.documentElement.classList.contains('vp-clean')));
    await p.close();
  }
  /* ② 틀 안쪽: 옆 틀(위)도 우리가 덮었다면 같이 걷는다 */
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await 길들(p);
    await p.route('**://vendorpia.com/top.aspx', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 넣기(흉내.몸통('위', '<div id="메뉴띠">위</div>'), true) }));
    await p.goto('https://vendorpia.com/'); await p.waitForTimeout(800);
    const 위 = p.frames().find((f) => f.url().endsWith('/top.aspx')), 안 = p.frames().find((f) => f.url().endsWith('/index.aspx'));
    await 안.click('#vp-바꾸기'); await p.waitForTimeout(300);
    맞나('② 틀 안쪽: 옆 틀 덮기가 걷힌다', await 위.evaluate(() => !document.documentElement.classList.contains('vp-clean')));
    await 안.click('#vp-바꾸기'); await p.waitForTimeout(300);
    맞나('② 되돌리면 옆 틀이 다시 덮인다', await 위.evaluate(() => document.documentElement.classList.contains('vp-clean')));
    await p.close();
  }
  /* ④ 틀 없이 메인(index.aspx)이 맨 위 창 → 배송관리(맨 위 창) → 원래 화면: 메인으로 가서 벤더피아 제 메뉴 줄을 눌러 연다 */
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.route('**://vendorpia.com/**', (r) => { const 길 = new URL(r.request().url()).pathname;
      const 낸다 = (body) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
      if (길 === '/index.aspx') return 낸다(넣기(흉내.메인.replace('<div id="menu">', '<div id="벤더피아제옆메뉴"><b>옆 메뉴</b></div><div id="menu">'), true));
      if (길 === '/System/Delivery/firmDvList.aspx') return 낸다(넣기(흉내.목록('배송관리'), true));
      return r.fulfill({ status: 404, body: '' }); });
    await p.goto('https://vendorpia.com/index.aspx'); await p.waitForTimeout(300);
    await p.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx'); await p.waitForTimeout(300);
    await p.click('#vp-바꾸기'); await p.waitForTimeout(2000);
    맞나('④ 메인이 맨 위일 때: 벤더피아 제 메뉴를 눌러 배송관리로 갔다', p.url().endsWith('/System/Delivery/firmDvList.aspx') || await p.evaluate(() => !!document.getElementById('벤더피아제옆메뉴')));
    await p.close();
  }
  console.log('빨강:', 빨강);
  await b.close();
})();
