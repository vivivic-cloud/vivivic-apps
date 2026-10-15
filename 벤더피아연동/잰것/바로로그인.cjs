/* 설치 안내 화면이 **깔려 있으면 로그인 화면으로 바로** 가는가를 재는 자.
   사장님 10-14 (설치 안내 화면에서 짚어 보내신 말씀, 그대로):
   「이미 확장프로그램이 설치됨을 확인하여 설치되었고 버전이 맞다면 프로그램실행시 바로 로그인화면 나오게 해줘」
   ⚠ 진짜 확장은 못 돌린다 — `깔렸다표시.js` 가 남기는 표(data-벤더피아연동)만 흉내 낸다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 판 = JSON.parse(fs.readFileSync(path.join(확장, 'manifest.json'), 'utf8')).version;

const 자리들 = [
  { 이름: '① 깔려 있고 판이 **맞다** (' + 판 + ')',            표: 판,       길: '/index.html' },
  { 이름: '② 깔려 있고 판이 **높다** (99.0.0)',                표: '99.0.0', 길: '/index.html' },
  { 이름: '③ 깔려 있는데 판이 **낮다** (0.30.0)',              표: '0.30.0', 길: '/index.html' },
  { 이름: '④ **안 깔렸다** (표가 없다)',                        표: null,     길: '/index.html' },
  { 이름: '⑤ 깔렸고 판 맞음 · **「여기 머물기」 를 누른다**',    표: 판,       길: '/index.html', 머문다: true },
  { 이름: '⑥ 깔렸고 판 맞음 · 주소에 **?안내**',               표: 판,       길: '/index.html?안내' },
  { 이름: '⑦ 깔린 판이 **꼭판과 같다** (0.34.9) — 덮어쓰기 필요 없다', 표: '0.34.9', 길: '/index.html' },
  { 이름: '⑧ 깔린 판이 **꼭판보다 낮다** (0.34.2)',            표: '0.34.2', 길: '/index.html' },
  /* ⚠ 사장님이 지금 깔아 두신 판 — 캐시 표가 든 0.34.9 로 덮어쓰셔야 한다 */
  { 이름: '⑨ **사장님의 지금 판 (0.34.5)**',                   표: '0.34.5', 길: '/index.html' },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ 설치 안내 → 바로 로그인 재기 (집 꼴 판 ' + 판 + ')');
  for (const 자 of 자리들) {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
    /* 흉내 집 — index.html 과 manifest.json 을 같은 자리에서 준다 */
    await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
      const u = new URL(r.request().url());
      const 길 = decodeURIComponent(u.pathname).replace('/vivivic-apps/벤더피아연동', '').replace('/vivivic-apps', '');
      if (길 === '/manifest.json') {
        if (자.깃막음) return r.abort('blockedbyclient');       // 새 판을 못 읽는 꼴
        return r.fulfill({ status: 200, contentType: 'application/json',
                           body: fs.readFileSync(path.join(확장, 'manifest.json')) });
      }
      if (길 === '/index.html') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
                                                   body: fs.readFileSync(path.join(확장, 'index.html')) });
      if (길 === '/../shared/viggle.js' || 길.endsWith('viggle.js'))
        return r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* 손잡이 자리 */' });
      return r.fulfill({ status: 200, contentType: 'text/plain', body: '' });
    });
    /* 벤더피아로 갔는지 본다 — 진짜로 가지는 않는다 */
    let 간곳 = null, 간때 = null;
    const 시작 = Date.now();
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (!간곳) { 간곳 = r.request().url(); 간때 = Date.now() - 시작; }
      r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
                  body: '<html><body><h1>벤더피아 로그인 화면(흉내)</h1></body></html>' });
    });
    const page = await ctx.newPage();
    /* `깔렸다표시.js` 흉내 — 확장이 <html> 에 남기는 표 하나 */
    if (자.표) await page.addInitScript((v) => {
      document.addEventListener('readystatechange', () => {
        if (document.documentElement) document.documentElement.setAttribute('data-벤더피아연동', v);
      });
      queueMicrotask(() => { try { document.documentElement.setAttribute('data-벤더피아연동', v); } catch (e) {} });
    }, 자.표);

    await page.goto('https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99' + 자.길, { waitUntil: 'domcontentloaded' });
    /* ⚠ 가기 **전** 에 머물 길이 실제로 보이나 — 이것이 제일 중요하다 */
    await page.waitForTimeout(900);
    const 가기전 = await page.evaluate(() => {
      const b = document.getElementById('그만'), n = document.getElementById('머무는법');
      const br = b.getBoundingClientRect();
      return { 머물기단추보임: !b.hidden && br.width > 8 && br.height > 8,
               단추글: b.textContent.trim(), 단추크기: [Math.round(br.width), Math.round(br.height)],
               머무는법보임: !n.hidden, 지금글: (document.getElementById('깔림글')||{}).textContent || '' };
    }).catch(() => null);
    if (자.머문다) { await page.click('#그만'); }
    await page.waitForTimeout(3800);

    const 본것 = await page.evaluate(() => ({
      제목: (document.getElementById('깔림제목') || {}).textContent || null,
      칸보임: !document.getElementById('깔림').hidden,
      글: (document.getElementById('깔림글') || {}).textContent || null,
      머무는법보임: !document.getElementById('머무는법').hidden,
      못찾음보임: !document.getElementById('못찾음').hidden,
      설치안내있나: !!document.querySelector('ol li'),
      지금주소: location.hostname,
    })).catch(() => ({ 지금주소: '옮겨갔다' }));

    console.log('\n──── ' + 자.이름 + ' ────');
    if (가기전) console.log('  [가기 전 0.9초] 머물기 단추 보임 ' + 가기전.머물기단추보임
      + ' 「' + 가기전.단추글 + '」 ' + JSON.stringify(가기전.단추크기)
      + ' · 머무는 법 줄 ' + 가기전.머무는법보임 + ' · 글: ' + 가기전.지금글.slice(0,70));
    console.log('  벤더피아로 갔나: ' + (간곳 ? '**갔다** (' + 간때 + 'ms)' : '안 갔다'));
    console.log('  칸 보임 ' + 본것.칸보임 + ' · 제목: ' + 본것.제목);
    console.log('  글: ' + (본것.글 || '').slice(0, 150));
    console.log('  머무는 법 보임: ' + 본것.머무는법보임 + ' · 못찾음 줄: ' + 본것.못찾음보임
                + ' · 설치 안내 그대로: ' + 본것.설치안내있나);
    await ctx.close();
  }
  await b.close();
})();
