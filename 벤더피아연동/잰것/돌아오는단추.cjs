/* 11-07 [새 지시 돌아오는단추] 사장님 「벤더피아 화면에서 다시 벤더피아연동 화면으로 돌아가는 버튼이 없어 되돌아올 길이 없습니다」
   진짜 크롬에 이 폴더를 확장으로 올려 잰다(가짜는 vendorpia.com 뿐). 메인은 진짜 꼴대로 **맨 위 BODY + iframe first.aspx**.
   깃 글을 받는 길(배경 글 → 맨 위 문서)과 깃을 막은 길(확장 안 login.js) 둘 다 돈다.
   맥: NODE_PATH=<playwright 깐 곳> VP_EXE=<Chromium> node 잰것/돌아오는단추.cjs */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https');
const { execSync } = require('child_process');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let 초록 = 0, 빨강 = 0;
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };
const 쪽 = (제목, 속 = '') => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body style="margin:0"><div id="제화면">${제목}</div>${속}</body></html>`;
const 길들 = {
  '/index.aspx': 쪽('메인', '<a href="/System/Delivery/firmDvList.aspx">배송관리</a><iframe id="안틀" src="/first.aspx" style="width:100%;height:600px;border:0"></iframe>'),
  '/first.aspx': 쪽('첫 화면'),
  '/System/Stock/POWList.aspx': 쪽('구매입고', '<script>window.누름수=0;document.addEventListener("click",()=>window.누름수++)</script>'),
  '/System/CS/ordersPopup.aspx': 쪽('원주문 팝업'),
  '/other.aspx': 쪽('딴 쪽'),
  '/host.aspx': 쪽('숨은 창 꼴', '<iframe id="숨은" src="/System/Stock/POWList.aspx" style="width:800px;height:500px"></iframe>'),
  '/Login.aspx': 쪽('로그인', '<form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"></form>'),
  '/System/Delivery/firmDvList.aspx': 쪽('배송관리 원래'),
  '/System/Sales/orderMst.aspx': 쪽('주문관리 원래'),
};
const 돌림 = async (깃막음) => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d}/k.pem -out ${d}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  const 깃받음 = [];
  const 서버 = https.createServer({ key: fs.readFileSync(d + '/k.pem'), cert: fs.readFileSync(d + '/c.pem') }, (q, r) => {
    const 길 = decodeURIComponent(q.url.split('?')[0]);
    if (/github\.io/.test(q.headers.host || '')) {
      const f = path.join(확장, path.basename(길)); 깃받음.push(path.basename(길));
      r.setHeader('content-type', 'text/javascript; charset=utf-8'); r.setHeader('access-control-allow-origin', '*');
      return r.end(fs.existsSync(f) ? fs.readFileSync(f) : '');
    }
    const 몸 = 길들[길]; r.statusCode = 몸 ? 200 : 404; r.setHeader('content-type', 'text/html; charset=utf-8'); r.end(몸 || '');
  }).listen(0);
  const 문 = 서버.address().port;
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-')), {
    executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 },
    args: ['--headless=new', '--no-sandbox', '--no-proxy-server', '--ignore-certificate-errors',
      `--host-resolver-rules=MAP vendorpia.com 127.0.0.1:${문}, MAP www.vendorpia.com 127.0.0.1:${문}, MAP vivivic-cloud.github.io 127.0.0.1:${깃막음 ? 1 : 문}`,
      '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
  await new Promise((r) => setTimeout(r, 2000));
  const 오류 = []; ctx.on('page', (p) => p.on('pageerror', (e) => 오류.push(String(e.message).slice(0, 90))));
  const 열기 = async (주소) => { const p = await ctx.newPage(); p.on('pageerror', (e) => 오류.push(String(e.message).slice(0, 90))); await p.goto('https://vendorpia.com' + 주소); await p.waitForTimeout(2200); return p; };
  const 단추수 = (p) => p.evaluate(() => document.querySelectorAll('#vp-돌아가기').length);

  console.log('\n■ 우리 화면에서 「벤더피아」 새 창을 연다');
  const 우리 = await 열기('/index.aspx');
  맞나('우리 메인에는 돌아가기 단추가 없다', (await 단추수(우리)) === 0 && !!(await 우리.$('#vp-root')));
  const 새 = ctx.waitForEvent('page', { timeout: 6000 });
  await 우리.click('#vp-바꾸기'); const 창 = await 새; await 창.waitForLoadState('load'); await 창.waitForTimeout(2500);
  맞나('새 창 맨 위에 「벤더피아연동으로」 하나', (await 단추수(창)) === 1 && (await 창.textContent('#vp-돌아가기')) === '벤더피아연동으로');
  맞나('새 창은 원래 화면 그대로(덮개·「벤더피아」 단추·위 띠·꾸밈 없음)', await 창.evaluate(() => !document.getElementById('vp-root') && !document.getElementById('vp-바꾸기') && !document.getElementById('vp-버전') && document.documentElement.className === '' && !document.querySelector('link[href*="login.css"]') && getComputedStyle(document.documentElement).paddingTop === '0px'));
  맞나('새 창 안쪽 틀에는 없다', (await 창.frames().find((f) => f.url().endsWith('/first.aspx')).evaluate(() => document.querySelectorAll('#vp-돌아가기').length)) === 0);
  맞나('자리 = 오른쪽 아래, 작다', await 창.evaluate(() => { const r = document.getElementById('vp-돌아가기').getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth - 15 && r.top > innerHeight - 40 && r.left > innerWidth - 160 && r.height <= 20; }), await 창.evaluate(() => { const r = document.getElementById('vp-돌아가기').getBoundingClientRect(); return JSON.stringify([Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom), innerWidth, innerHeight, Math.round(r.width)]); }));
  맞나('새 창 스크립트 태그를 안 남긴다', await 창.evaluate(() => !document.querySelector('script[src*="chrome-extension"],script[src*="vivivic-cloud"]')));
  if (!깃막음) 맞나('깃에서 login.js 를 받았다', 깃받음.includes('login.js'));

  console.log('\n■ 새 창 팝업');
  const 팝 = ctx.waitForEvent('page', { timeout: 5000 });
  await 창.evaluate(() => { window.open('/System/CS/ordersPopup.aspx', 'pop', 'width=700,height=500'); }); const 팝창 = await 팝; await 팝창.waitForLoadState('load'); await 팝창.waitForTimeout(1800);
  맞나('팝업(ordersPopup)에는 없다', (await 단추수(팝창)) === 0); await 팝창.close();
  const 딴 = ctx.waitForEvent('page', { timeout: 5000 });
  await 창.evaluate(() => { window.open('/other.aspx'); }); const 딴창 = await 딴; await 딴창.waitForLoadState('load'); await 딴창.waitForTimeout(1800);
  맞나('window.open 으로 연 딴 창에도 없다', (await 단추수(딴창)) === 0); await 딴창.close();

  console.log('\n■ 새 창에서 누른다');
  const 메 = ctx.waitForEvent('page', { timeout: 6000 });
  await 창.click('#vp-돌아가기'); const 메창 = await 메; await 메창.waitForLoadState('load'); await 메창.waitForTimeout(2500);
  맞나('새 탭 = 벤더피아연동 메인', new URL(메창.url()).pathname === '/index.aspx' && !!(await 메창.$('#vp-root .vp-btn')));
  맞나('새 탭에 표식이 안 넘어갔다', await 메창.evaluate(() => window.name === '' && sessionStorage.getItem('vp원본') === null && !document.getElementById('vp-돌아가기')));
  맞나('새 창 오리지널은 그대로', new URL(창.url()).pathname === '/index.aspx' && (await 창.evaluate(() => window.name)) === 'vp원본');
  await 창.reload(); await 창.waitForTimeout(2200);
  맞나('새 창 새로고침 뒤에도 하나', (await 단추수(창)) === 1);
  await 창.goto('https://vendorpia.com/System/Stock/POWList.aspx'); await 창.waitForTimeout(2200);
  맞나('새 창에서 다른 쪽으로 가도 하나', (await 단추수(창)) === 1);

  console.log('\n■ 보통 창의 원래 화면(구매입고)');
  const 구 = await 열기('/System/Stock/POWList.aspx');
  맞나('구매입고에 단추 하나 · 위 띠·덮개 없음', (await 단추수(구)) === 1 && await 구.evaluate(() => !document.documentElement.classList.contains('vp-clean') && getComputedStyle(document.documentElement).paddingTop === '0px'));
  const 메2 = ctx.waitForEvent('page', { timeout: 6000 });
  await 구.click('#vp-돌아가기'); const 메창2 = await 메2; await 메창2.waitForLoadState('load'); await 메창2.waitForTimeout(2200);
  맞나('누르면 새 탭 메인 · 구매입고는 그대로 · 벤더피아 쪽 클릭 처리에 안 닿음', !!(await 메창2.$('#vp-root .vp-btn')) && 구.url().endsWith('POWList.aspx') && (await 구.evaluate(() => window.누름수)) === 0);

  console.log('\n■ 안 뜨는 곳');
  for (const [이름, 주소] of [['배송관리', '/System/Delivery/firmDvList.aspx'], ['주문관리(CS등록)', '/System/Sales/orderMst.aspx'], ['로그인', '/Login.aspx'], ['주소에 popup', '/System/CS/ordersPopup.aspx']]) {
    const p = await 열기(주소); 맞나(이름, (await 단추수(p)) === 0); await p.close();
  }
  const 숨 = await 열기('/host.aspx');
  맞나('숨은 창(틀 안쪽)에는 없다 · 맨 위 쪽에만', (await 숨.frames().find((f) => /POWList/.test(f.url())).evaluate(() => document.querySelectorAll('#vp-돌아가기').length)) === 0);
  if (오류.length) console.log('  터진 말:', JSON.stringify([...new Set(오류)].slice(0, 4)));
  await ctx.close(); 서버.close();
};
(async () => {
  console.log('━━ 깃 받는 길'); await 돌림(false);
  console.log('\n━━ 깃 막은 길(확장 안 글)'); await 돌림(true);
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강); process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.log('터짐', e); process.exit(1); });
