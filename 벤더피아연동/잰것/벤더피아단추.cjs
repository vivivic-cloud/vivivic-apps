/* 사장님 10-22 「원래화면 보기 버튼의 기능은 모두 삭제하고 그자리에 벤더피아 라는 버튼을 만들어서 그걸 누르면 확장프로그램이 적용되지 않는
   오리지날 벤더피아 화면이 현재창을 유지한채 새로운 창에 뜨도록」 (0.34.40, 덮어쓰기 필요).

   ⚠ 이번 자는 흉내가 아니라 **진짜 크롬에 이 폴더를 확장으로 올려서** 잰다 (--load-extension). 진짜 content script(따로인 세상·all_frames·
     document_end/idle)·진짜 window.open·진짜 window.name 이다. 앞 방 자들은 확장 글을 손으로 넣어 주어 초록이어도 사장님 화면에서 안 됐다.
   ⚠ 안 흉내 낸 것은 vendorpia.com 뿐이다 — route 로 가로챈 가짜 frameset 이다. github.io 는 막아 **확장 안 글**로 돌게 한다(불러오기.js 뒷길).
   재는 것: ① 이 창(우리 화면)에 단추가 있고 누르기 전·뒤에 그대로(표식 0, 우리 글 그대로) ② 새 창이 뜬다 ③ 새 창 **모든 frame** 에서 우리 글 0개
            ④ 새 창에서 다른 쪽으로 이동·새로고침해도 0개 ⑤ 새 창이 연 딴 창도 0개 ⑥ 대조: 표식 없는 새 탭은 우리 글이 돈다(자가 눈이 있나) */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let 초록 = 0, 빨강 = 0;
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };

const 로그인틀 = `<html><head><meta charset="utf-8"><title>벤더피아 로그인</title></head><body>
<div id="벤더피아제화면">원래 로그인</div>
<form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"><input type="submit" id="btnLogin" value="로그인"></form></body></html>`;
const 본문 = (제목) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body><div id="벤더피아제화면">${제목}</div>
<a id="딴창" href="/other.aspx" onclick="window.open('/other.aspx');return false">딴 창</a></body></html>`;
/* 진짜 꼴: 맨 위 frameset(위 메뉴 틀 + 옆 메뉴 틀 + 본문 틀). 본문 틀은 로그인 꼴이라 우리 화면(vp-clean)과 단추가 붙는다 */
const 틀 = `<html><head><title>벤더피아</title></head>
<frameset rows="60,*"><frame name="topFrame" src="/top.aspx"><frameset cols="150,*"><frame name="leftFrame" src="/left.aspx"><frame name="mainFrame" src="/main.aspx"></frameset></frameset></html>`;
const 길들 = { '/index.aspx': 틀, '/top.aspx': 본문('위 메뉴'), '/left.aspx': 본문('옆 메뉴'), '/main.aspx': 로그인틀, '/page2.aspx': 본문('다른 쪽'), '/other.aspx': 본문('딴 창 내용') };

/* 한 창(page)의 모든 frame 에서 우리 글이 돈 흔적을 센다 */
const 흔적 = async (p) => {
  const 낱 = [];
  for (const f of p.frames()) {
    let r; try { r = await f.evaluate(() => ({
      url: location.pathname, 단추: !!document.getElementById('vp-바꾸기'), 우리: !!document.getElementById('vp-root'), 덮음: document.documentElement.classList.contains('vp-clean'),
      짚개: !!window.__vp짚개, 딱지: !!document.getElementById('vp-판'), 기억: Object.keys(sessionStorage).filter((k) => /^vg기억/.test(k)).length,
      글붙음: document.querySelectorAll('script[src*="chrome-extension"],script[src*="vivivic-cloud"],link[href*="chrome-extension"],link[href*="vivivic-cloud"]').length > 0, 말: typeof window.VP말, 제목짚기: /·짚기v/.test(document.title), 이름: window.top.name, 표식: sessionStorage.getItem('vp원본') })); } catch (e) { r = { url: f.url(), 오류: String(e).slice(0, 60) }; }
    낱.push(r);
  }
  return 낱;
};
const 우리글수 = (낱) => 낱.filter((r) => r.단추 || r.우리 || r.덮음 || r.짚개 || r.딱지 || r.기억 || r.글붙음 || r.제목짚기).length;

(async () => {
  /* vendorpia.com 을 이 상자의 가짜 https 서버로 돌린다 (route 가로채기는 확장 글을 안 붙여서 못 쓴다 — 진짜 이동이어야 한다) */
  const 인증 = (() => { const { execSync } = require('child_process'); const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
    execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d}/k.pem -out ${d}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
    return { key: fs.readFileSync(d + '/k.pem'), cert: fs.readFileSync(d + '/c.pem') }; })();
  const 서버 = https.createServer(인증, (q, r) => {
    const 길 = q.url.split('?')[0]; const 몸 = 길들[길] || (길 === '/' ? 길들['/index.aspx'] : null);
    r.statusCode = 몸 ? 200 : 404; r.setHeader('content-type', 'text/html; charset=utf-8'); r.end(몸 || '');
  }).listen(8443);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-'));
  /* ⚠ 한글 파일 이름(불러오기.js 따위)은 로캘이 UTF-8 이어야 크롬이 읽는다 — 이 상자는 비어 있어 안 주면 content script 가 안 붙는다 */
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true,
    env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
    args: ['--headless=new', '--no-sandbox', '--no-proxy-server', '--host-resolver-rules=MAP vendorpia.com 127.0.0.1:8443, MAP www.vendorpia.com 127.0.0.1:8443',
      '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
  await new Promise((r) => setTimeout(r, 2000));            // 확장이 올라올 때까지
  const 오류 = [];
  console.log('\n■ 대조 — 표식 없는 새 탭에서는 우리 글이 도는가 (자에 눈이 있나)');
  const 보통 = ctx.pages()[0] || await ctx.newPage(); 보통.on('pageerror', (e) => 오류.push(String(e.message).slice(0, 90)));
  await 보통.goto('https://vendorpia.com/index.aspx'); await 보통.waitForTimeout(2500);
  const 보통흔적 = await 흔적(보통);
  console.log('  ', JSON.stringify(보통흔적.map((r) => [r.url, r.단추 ? '단추' : '', r.짚개 ? '짚개' : '', r.덮음 ? '덮음' : '', r.딱지 ? '딱지' : ''].filter(Boolean))));
  맞나('대조: 우리 글이 도는 frame 이 있다 (확장이 진짜 올라갔다)', 우리글수(보통흔적) >= 2, '우리 글 도는 frame ' + 우리글수(보통흔적) + '/' + 보통흔적.length);
  const 본문틀 = 보통.frames().find((f) => f.url().endsWith('/main.aspx'));
  맞나('① 이 창: 우리 화면 틀에 「벤더피아」 단추가 있다', !!(await 본문틀.$('#vp-바꾸기')) && (await 본문틀.textContent('#vp-바꾸기')) === '벤더피아');
  맞나('① 이 창: 옛 「원래 화면」 글·「← 우리 화면」 은 없다', !(await 본문틀.evaluate(() => /원래 화면|우리 화면/.test(document.getElementById('vp-바꾸기').textContent))));
  const 앞 = await 본문틀.evaluate(() => ({ 이름: window.top.name, 표식: sessionStorage.getItem('vp원본'), 덮음: document.documentElement.classList.contains('vp-clean'), 단추수: document.querySelectorAll('#vp-바꾸기').length }));

  console.log('\n■ 「벤더피아」 단추를 누른다 (본문 틀 안쪽에서)');
  const 새 = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null);
  await 본문틀.click('#vp-바꾸기');
  const 새창 = await 새;
  맞나('② 새 창이 떴다', !!새창);
  if (!새창) { await ctx.close(); 서버.close(); console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강); process.exit(1); }
  새창.on('pageerror', (e) => 오류.push('새창 ' + String(e.message).slice(0, 90)));
  await 새창.waitForLoadState('load'); await 새창.waitForTimeout(3000);
  맞나('② 새 창 주소 = 벤더피아 메인 틀', new URL(새창.url()).pathname === '/index.aspx', 새창.url());
  맞나('② 이 창은 그대로 (같은 주소·단추 하나·우리 화면 덮임·표식 없음)', 보통.url().endsWith('/index.aspx') && JSON.stringify(await 본문틀.evaluate(() => ({ 이름: window.top.name, 표식: sessionStorage.getItem('vp원본'), 덮음: document.documentElement.classList.contains('vp-clean'), 단추수: document.querySelectorAll('#vp-바꾸기').length }))) === JSON.stringify(앞));

  console.log('\n■ 새 창 — 모든 frame 에서 우리 글 0개');
  let 흔 = await 흔적(새창);
  console.log('  ', JSON.stringify(흔.map((r) => [r.url, r.이름, r.표식 || '-', r.오류 || ''])));
  맞나('③ frame 수(진짜 틀 꼴)', 흔.length === 4, 흔.length + '개');
  맞나('③ 우리 글이 도는 frame 0개', 우리글수(흔) === 0, JSON.stringify(흔.filter((r) => r.단추 || r.우리 || r.덮음 || r.짚개 || r.딱지 || r.기억 || r.글붙음 || r.제목짚기)));
  맞나('③ 창 이름 표식이 모든 frame 에서 읽힌다', 흔.every((r) => r.이름 === 'vp원본'));
  맞나('③ 새 창 탭 글자에 「·짚기v」 가 없다', !/·짚기v/.test(await 새창.title()));

  console.log('\n■ 새 창에서 이동·새로고침해도');
  await 새창.goto('https://vendorpia.com/page2.aspx'); await 새창.waitForTimeout(2000);
  흔 = await 흔적(새창); 맞나('④ 다른 쪽으로 이동(맨 위 문서)', 우리글수(흔) === 0 && 흔.every((r) => r.이름 === 'vp원본'));
  await 새창.goto('https://vendorpia.com/index.aspx'); await 새창.reload(); await 새창.waitForTimeout(2500);
  흔 = await 흔적(새창); 맞나('④ 메인 틀 새로고침 — 모든 frame', 우리글수(흔) === 0 && 흔.length === 4, 흔.length + '개 frame');
  await 새창.frames().find((f) => f.url().endsWith('/left.aspx')).evaluate(() => { location.href = '/page2.aspx'; }); await 새창.waitForTimeout(1800);
  흔 = await 흔적(새창); 맞나('④ 틀 안쪽 frame 만 다른 쪽으로 이동', 우리글수(흔) === 0);

  console.log('\n■ 새 창이 연 딴 창(target=_blank)도');
  const 딴 = ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await 새창.goto('https://vendorpia.com/page2.aspx'); await 새창.waitForTimeout(800);
  await 새창.click('#딴창'); const 딴창 = await 딴; if (딴창) { await 딴창.waitForLoadState('load'); await 딴창.waitForTimeout(2500); }
  맞나('⑤ 새 창 안에서 window.open 으로 연 딴 창(표식 복사)도 우리 글 0개', !!딴창 && 우리글수(await 흔적(딴창)) === 0, 딴창 ? JSON.stringify((await 흔적(딴창)).map((r) => [r.이름 || '-', r.표식 || '-'])) : '');

  console.log('\n■ 마지막으로 이 창이 멀쩡한가 (새 창을 연 뒤에도)');
  await 보통.reload(); await 보통.waitForTimeout(2500);
  const 끝 = await 흔적(보통);
  맞나('⑥ 이 창 새로고침 뒤에도 우리 글이 그대로 돈다', 우리글수(끝) === 우리글수(보통흔적), 우리글수(끝) + '/' + 끝.length);
  맞나('⑥ 이 창에 표식이 안 남았다(이름·sessionStorage)', 끝.every((r) => r.이름 === '' && !r.표식));
  const 또 = await ctx.newPage(); await 또.goto('https://vendorpia.com/index.aspx'); await 또.waitForTimeout(2500);
  맞나('⑥ 새 탭(주소창으로 연 것)에도 우리 글이 돈다 — 표식이 새지 않았다', 우리글수(await 흔적(또)) >= 2);
  if (오류.length) { console.log('  터진 말:', JSON.stringify([...new Set(오류)].slice(0, 4))); }
  await ctx.close(); 서버.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
