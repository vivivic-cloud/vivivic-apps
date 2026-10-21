/* 사장님 10-21 「원래화면 보기시 벤더피아의 전체화면이 보이지 않습니다 … 현재 원래화면에서 우리화면으로 넘어오는 버튼이 작동하지 않고 있습니다」
   (장부 a1792566604, 0.34.37 고침). 「원래 화면」 = 벤더피아 전체 틀(위·옆 메뉴 + 본문에 보던 쪽) / 「← 우리 화면」 = 겹만 걷기.

   ⚠ 앞 판(0.34.36) 자는 틀 꼴을 **우리가 늘 되게** 지어서 초록이었다. 이번 자는 진짜에 가깝게 —
     · 확장 글은 **틀(frame)마다** 돈다 (불러오기가 하듯 body 가 있는 문서마다 login.js → menu.js 차례로 넣는다. frameset 문서에는 안 넣는다)
     · 메뉴 줄이 ㄱ) 같은 쪽 iframe 을 target 으로 하는 링크 ㄴ) 링크가 아닌 onclick 인 두 꼴을 다 잰다
     · 틀 모습 셋: S1 맨 위 index.aspx 안에 본문 iframe / S2 frameset(위 메뉴 틀 + 본문 틀) / S3 이미 틀 안쪽에서 누름
     · 「우리 화면」 기억은 sessionStorage 를 **비운 채**(새 탭 꼴)로도 잰다 — localStorage 에도 적혔나
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 자료는 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 흉내 = require('./흉내.cjs');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 읽기 = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const 글 = `window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};window.VP_DATA={prefetch(){},clearCache:async()=>{}};` +
  읽기('login.js');
const 메뉴글 = 읽기('menu.js');
const 꾸밈 = 읽기('login.css');
/* 불러오기.js 처럼 — body 가 있는 문서마다 login.js → (index.aspx 면) menu.js. 목록 쪽은 goods.js 가 하듯 vp-clean 을 켠다 */
const 넣기 = (html, 길) => {
  if (/<frameset/i.test(html)) return html;
  const 목록인가 = /firmDvList|goods\.aspx/i.test(길);
  const 덧 = `<style>${꾸밈}</style><script>${글}</script>` + (/index\.aspx$/i.test(길) ? `<script>${메뉴글}</script>` : '') +
    (목록인가 ? '<script>document.documentElement.classList.add("vp-clean");document.body.insertAdjacentHTML("beforeend","<div id=\\"vp-root\\">우리 화면</div>");</script>' : '');
  return html.replace('</body>', 덧 + '</body>');
};
let 빨강 = 0;
const 맞나 = (이름, 참) => { console.log((참 ? '🟩 ' : '🟥 ') + 이름); if (!참) 빨강++; };

const 메뉴줄 = (대상, 링크) => 링크
  ? `<a href="/System/Delivery/firmDvList.aspx" target="${대상}">배송관리</a> <a href="/System/Master/goods.aspx" target="${대상}">단품관리</a>`
  : `<span class="m" onclick="document.getElementById('${대상}').contentWindow ? window.open('/System/Master/goods.aspx','${대상}') : 0">단품관리</span> <a href="#" onclick="window.open('/System/Delivery/firmDvList.aspx','${대상}');return false">배송관리</a>`;

const 세우기 = (b, 꼴, 링크) => {
  const 길들 = [];
  const 라우트 = async (p) => p.route('**://vendorpia.com/**', (r) => {
    const 길 = new URL(r.request().url()).pathname;
    길들.push(길);
    const 낸다 = (body) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 넣기(body, 길) });
    if (꼴 === 'S1') {                                         // 맨 위 index.aspx 안에 본문 iframe, 메뉴는 그 문서 안
      if (길 === '/index.aspx') return 낸다(흉내.몸통('벤더피아', `<div id="벤더피아제옆메뉴" style="width:160px;float:left">${메뉴줄('ifrMain', 링크)}</div><iframe id="ifrMain" name="ifrMain" src="/home.aspx" style="width:900px;height:600px;border:0"></iframe>`));
      if (길 === '/home.aspx') return 낸다(흉내.몸통('홈', '<div id="홈">벤더피아 홈</div>'));
    } else {                                                   // S2/S3 frameset: 위 메뉴 틀 + 본문 틀
      if (길 === '/' || 길 === '/main.aspx') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 흉내.틀('/index.aspx').replace('src="/top.aspx"', 'src="/top.aspx" name="topFrame"').replace('name="mainFrame"', 'name="mainFrame" id="mainFrame"') });
      if (길 === '/top.aspx') return 낸다(흉내.몸통('위', `<div id="메뉴띠">벤더피아 위 메뉴 ${메뉴줄('mainFrame', 링크)}</div>`));
      if (길 === '/index.aspx') return 낸다(흉내.메인);
    }
    if (길 === '/System/Delivery/firmDvList.aspx') return 낸다(흉내.목록('배송관리'));
    if (길 === '/System/Master/goods.aspx') return 낸다(흉내.목록('단품관리'));
    return r.fulfill({ status: 404, body: '' });
  });
  return { 라우트, 길들 };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  for (const [꼴, 링크, 이름] of [['S1', true, 'S1 맨 위 메인+본문iframe, 메뉴=링크'], ['S1', false, 'S1 메뉴가 링크 아님(onclick)'], ['S2', true, 'S2 frameset 위 메뉴 틀']]) {
    console.log('\n── ' + 이름);
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const { 라우트 } = 세우기(b, 꼴, 링크); await 라우트(p);
    const 오류 = []; p.on('pageerror', (e) => 오류.push(String(e.message).slice(0, 100)));
    /* 사장님 흐름: 로그인 뒤 메인 → 우리 메뉴(.vp-btn)로 단품관리를 **틀 밖(맨 위)** 으로 연다 */
    await p.goto('https://vendorpia.com/' + (꼴 === 'S1' ? 'index.aspx' : '')); await p.waitForTimeout(600);
    const 메뉴창 = 꼴 === 'S1' ? p : p.frames().find((f) => f.url().endsWith('/index.aspx'));
    맞나('재료: 우리 메뉴 단추가 떠 있다', !!(await 메뉴창.$('#vp-root .vp-btn')));
    await p.goto('https://vendorpia.com/System/Master/goods.aspx'); await p.waitForTimeout(400);   // 틀 밖으로 열림
    await p.evaluate(() => { window.__우리기억 = '조회결과 12건'; sessionStorage.removeItem('vp틀'); });  // 새 탭 꼴: 이 탭엔 기억이 없다
    맞나('재료: 틀 밖(맨 위)이다', await p.evaluate(() => window.top === window));
    맞나('재료: 틀 주소가 localStorage 에 적혀 있다', await p.evaluate(() => !!localStorage.getItem('vp틀')));
    await p.click('#vp-바꾸기'); await p.waitForTimeout(3500);
    const 겹 = await p.$('#vp-원래틀');
    맞나('① 원래 화면: 벤더피아 틀이 한 겹 떴다', !!겹);
    const 창들 = p.frames().map((f) => f.url().replace('https://vendorpia.com', ''));
    console.log('  틀들:', JSON.stringify(창들));
    const 본문 = p.frames().find((f) => f.url().endsWith('/System/Master/goods.aspx') && f !== p.mainFrame());
    맞나('① 보던 단품관리가 그 틀 안 본문에 열려 있다', !!본문);
    const 메뉴보임 = async () => { for (const f of p.frames()) { if (f === p.mainFrame()) continue; const 칸 = await f.$('#벤더피아제옆메뉴, #메뉴띠').catch(() => null); if (칸 && await 칸.isVisible()) return true; } return false; };
    맞나('① 둘레 벤더피아 메뉴(위·옆)가 보인다', await 메뉴보임());
    맞나('① 본문은 우리 덮기가 없다(vp-clean 없음)', !!본문 && await 본문.evaluate(() => !document.documentElement.classList.contains('vp-clean')));
    맞나('① 본문 표가 보인다', !!본문 && await (await 본문.$('#divGrid')).isVisible());
    const 단추 = await p.$('#vp-바꾸기');
    맞나('① 「← 우리 화면」 단추가 틀 위에 보이고 눌린다', !!단추 && /우리 화면/.test(await 단추.textContent()) && await p.evaluate(() => { const r = document.getElementById('vp-바꾸기').getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && e.id === 'vp-바꾸기'; }));
    await p.click('#vp-바꾸기'); await p.waitForTimeout(300);
    맞나('③ 돌아온다: 겹이 걷혔다', !(await p.$('#vp-원래틀')));
    맞나('③ 우리 화면 그대로(vp-clean·#vp-root·눌렀던 쪽)', await p.evaluate(() => document.documentElement.classList.contains('vp-clean') && !!document.getElementById('vp-root') && location.pathname.endsWith('/goods.aspx')));
    맞나('③ 페이지 변수(우리 화면 기억)가 안 날아갔다', await p.evaluate(() => window.__우리기억 === '조회결과 12건'));
    맞나('③ 단추가 다시 「원래 화면」', /^원래 화면$/.test(await (await p.$('#vp-바꾸기')).textContent()));
    await p.click('#vp-바꾸기'); await p.waitForTimeout(1500);
    맞나('③ 다시 눌러도 또 뜬다', !!(await p.$('#vp-원래틀')));
    await p.click('#vp-바꾸기'); await p.waitForTimeout(200);
    맞나('페이지 오류 없음', 오류.length === 0); if (오류.length) console.log('  ', 오류);
    await p.close();
  }
  /* S0: 틀 주소 기억이 둘 다 비었다 → 짐작하지 않고 제자리에서 걷는다 */
  console.log('\n── S0 기억 없음');
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const { 라우트 } = 세우기(b, 'S2', true); await 라우트(p);
    await p.goto('https://vendorpia.com/System/Master/goods.aspx'); await p.waitForTimeout(400);
    await p.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
    await p.click('#vp-바꾸기'); await p.waitForTimeout(500);
    맞나('S0 겹 없이 제자리에서 벤더피아 제 화면이 보인다', !(await p.$('#vp-원래틀')) && await p.evaluate(() => !document.documentElement.classList.contains('vp-clean')));
    await p.click('#vp-바꾸기'); await p.waitForTimeout(300);
    맞나('S0 ← 우리 화면: 다시 덮인다', await p.evaluate(() => document.documentElement.classList.contains('vp-clean')));
    await p.close();
  }
  /* S3: 이미 틀 안쪽에서 누른다(우리 메뉴 단추가 틀 안에서 열었을 때) → 예전처럼 제자리에서 걷고 옆 틀 덮기도 같이 */
  console.log('\n── S3 틀 안쪽에서 누름');
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const { 라우트 } = 세우기(b, 'S2', true); await 라우트(p);
    await p.goto('https://vendorpia.com/'); await p.waitForTimeout(600);
    const 안 = p.frames().find((f) => f.url().endsWith('/index.aspx'));
    await 안.click('.vp-btn[href*="goods"]'); await p.waitForTimeout(600);
    const 본 = p.frames().find((f) => f.url().endsWith('/System/Master/goods.aspx'));
    맞나('S3 재료: 단품관리가 틀 안쪽에 열렸다', !!본 && p.frames().length >= 3);
    await 본.click('#vp-바꾸기'); await p.waitForTimeout(400);
    맞나('S3 원래 화면: 덮기가 걷히고 위 메뉴 틀도 그대로 보인다', await 본.evaluate(() => !document.documentElement.classList.contains('vp-clean')) && await (await p.frames().find((f) => f.url().endsWith('/top.aspx')).$('#메뉴띠')).isVisible());
    맞나('S3 겹을 만들지 않았다', !(await p.$('#vp-원래틀')) && !(await 본.$('#vp-원래틀')));
    await 본.click('#vp-바꾸기'); await p.waitForTimeout(300);
    맞나('S3 ← 우리 화면: 다시 덮인다', await 본.evaluate(() => document.documentElement.classList.contains('vp-clean')));
    await p.close();
  }
  console.log('\n빨강:', 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
