/* 11-16 [단품다리] 0.35.0 — 발주역입력 재단 ↔ 확장 단품관리 목록 다리를 재는 자.
   진짜 크롬에 이 폴더를 확장으로 올린다(진짜 content script·배경·화면 없는 문서). vendorpia.com 은 가짜 https 서버(자료 전부 가짜).
   github.io 는 route 로: `/vivivic-apps/발주역입력/` 아래는 이 저장소 파일(재단.html 은 진짜 창고를 **읽기만**), 그 밖은 404.
   잼: ① 로그아웃 → {로그인:false}·벤더피아 POST 0  ② 로그인 → 세 칸 줄·차례(중지 뒤)·같은 저장 열쇠·화면 없는 문서 닫힘
       ③ 다시 물음 → 저장된 것(POST 늘지 않음)  ④ 다시:true → 새로 받음  ⑤ 다른 쪽(/vivivic-apps/납품내역/)은 다리 없음
       ⑥ 재단.html 검색 판: 로그인 필요·로그인 화면 단추 / 로그인 뒤 「단품 새로 받기 · 3개」·후보 / 다리 없으면 「임시 목록」
   쓰는 법(맥): NODE_PATH=<playwright-core 깐 곳> VP_EXE=<Chromium> node 잰것/단품다리.cjs */
const { chromium } = require(process.env.NODE_PATH ? 'playwright-core' : 'playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https'), { execSync } = require('child_process');
const 확장 = path.join(__dirname, '..'), 저장소 = path.join(확장, '..');
const EXE = process.env.VP_EXE || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p));
let 초록 = 0, 빨강 = 0;
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };

let 로그인됨 = false, POST수 = 0;
const 로그인쪽 = `<html><body><form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"></form></body></html>`;
const 메인쪽 = `<html><body><a href="#">배송관리</a></body></html>`;
const 단품폼 = `<html><body><form method="post"><input type="hidden" name="__VIEWSTATE" value="x">
<select name="ddlRowCnt" id="ddlRowCnt"><option value="20">20</option><option value="700">700</option></select>
<input name="dcStartDt" id="dcStartDt" value="2026-01-01"><input name="dcEndDt" id="dcEndDt" value="2026-11-16">
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="1">판매중</option></select>
<input type="image" name="btnSearch" id="btnSearch"></form></body></html>`;
const 단품표 = `<html><body><form method="post"><input type="hidden" name="__VIEWSTATE" value="y"></form><div>총 4 건</div>
<table><tr><th>No</th><th>단품코드</th><th>단품명</th><th>매입처명</th><th>판매상태</th></tr>
<tr><td>1</td><td>zz-01</td><td>가나 서랍장 중지품</td><td>에이</td><td>중지</td></tr>
<tr><td>2</td><td>ab-02</td><td>킨포크 1200 상부장 W</td><td>비</td><td>판매중</td></tr>
<tr><td>3</td><td>ab-01</td><td>가나 서랍장</td><td>씨</td><td>판매중</td></tr>
<tr><td>4</td><td>ab-01</td><td>가나 서랍장</td><td>디</td><td>판매중</td></tr></table></body></html>`;

(async () => {
  const d0 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d0}/k.pem -out ${d0}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  const 서버 = https.createServer({ key: fs.readFileSync(d0 + '/k.pem'), cert: fs.readFileSync(d0 + '/c.pem') }, (q, r) => {
    r.setHeader('content-type', 'text/html; charset=utf-8');
    const u = q.url.split('?')[0];
    if (!로그인됨) return r.end(로그인쪽);
    if (u === '/System/Master/goods.aspx') {
      if (q.method === 'POST') { POST수++; let b = ''; q.on('data', (c) => b += c); q.on('end', () => r.end(단품표)); return; }
      return r.end(단품폼);
    }
    return r.end(메인쪽);
  }).listen(8443);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-'));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true,
    args: ['--headless=new', '--no-sandbox', '--ignore-certificate-errors', '--host-resolver-rules=MAP vendorpia.com 127.0.0.1:8443, MAP www.vendorpia.com 127.0.0.1:8443',
      '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
  let sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const 열린창 = [];
  ctx.on('page', (p) => 열린창.push(p.url()));
  await ctx.route('**://vivivic-cloud.github.io/**', async (r) => {
    const p = decodeURIComponent(new URL(r.request().url()).pathname);
    if (p === '/vivivic-apps/발주역입력/시험.html' || p === '/vivivic-apps/납품내역/시험.html')
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>t</title><p>시험</p>' });
    const 자리 = path.join(저장소, p.replace(/^\/vivivic-apps\//, ''));
    if (p.startsWith('/vivivic-apps/') && fs.existsSync(자리) && fs.statSync(자리).isFile())
      return r.fulfill({ status: 200, contentType: p.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript', body: fs.readFileSync(자리) });
    return r.fulfill({ status: 404, body: 'x' });
  });
  const 묻기 = (쪽, 다시) => 쪽.evaluate((다시) => new Promise((풀) => {
    const 표 = 'p' + Math.random();
    addEventListener('message', (e) => { if (e.data && e.data.__vp === '단품목록답' && e.data.표 === 표) 풀(e.data.답); });
    postMessage({ __vp: '단품목록', 표, 다시 }, location.origin);
    setTimeout(() => 풀('시간끝'), 30000);
  }), 다시);

  console.log('\n■ 다리 · 배경');
  const 쪽 = await ctx.newPage();
  await 쪽.goto('https://vivivic-cloud.github.io/vivivic-apps/발주역입력/시험.html');
  맞나('다리 표 data-벤더피아단품', await 쪽.evaluate(() => document.documentElement.getAttribute('data-벤더피아단품')) === '0.35.0');
  let 답 = await 묻기(쪽, false);
  맞나('① 로그아웃 → 로그인:false', 답 && 답.로그인 === false && !답.줄, JSON.stringify(답));
  맞나('① 벤더피아 POST 0', POST수 === 0);
  로그인됨 = true;
  답 = await 묻기(쪽, false);
  맞나('② 로그인 → 줄 셋(같은 코드 하나로)', 답 && 답.로그인 === true && 답.줄 && 답.줄.length === 3, JSON.stringify(답 && 답.줄));
  맞나('② 차례: 판매중 가나다 → 중지 뒤', JSON.stringify(답.줄) === JSON.stringify([['ab-01', '가나 서랍장', '판매중'], ['ab-02', '킨포크 1200 상부장 W', '판매중'], ['zz-01', '가나 서랍장 중지품', '중지']]));
  맞나('② 세 칸만(매입처 안 감)', !JSON.stringify(답).includes('에이') && !JSON.stringify(답).includes('매입처'));
  맞나('② 받은때 있음', typeof 답.받은때 === 'number');
  const 열쇠들 = await sw.evaluate(async () => Object.keys(await chrome.storage.local.get(null)));
  const d = new Date(), 오늘 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  맞나('② 단품관리와 같은 열쇠에 저장', 열쇠들.includes(`vpCache:/System/Master/goods.aspx|단품명|{}||2000-01-01|${오늘}`), JSON.stringify(열쇠들));
  맞나('② 화면 없는 문서 닫힘', (await sw.evaluate(() => chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] }))).length === 0);
  const P1 = POST수;
  맞나('② 벤더피아 POST 있음(건수 + 목록)', P1 >= 1, 'POST ' + P1);
  답 = await 묻기(쪽, false);
  맞나('③ 다시 물음 → 저장된 것(POST 그대로)', 답.줄 && 답.줄.length === 3 && POST수 === P1, 'POST ' + POST수);
  답 = await 묻기(쪽, true);
  맞나('④ 다시:true → 새로 받음', 답.줄 && 답.줄.length === 3 && POST수 > P1, 'POST ' + POST수);
  const 남쪽 = await ctx.newPage();
  await 남쪽.goto('https://vivivic-cloud.github.io/vivivic-apps/납품내역/시험.html');
  맞나('⑤ 다른 쪽엔 다리 없음', (await 남쪽.evaluate(() => document.documentElement.getAttribute('data-벤더피아단품'))) === null);
  await 남쪽.close();

  console.log('\n■ 재단.html 검색 판 (창고는 읽기만 — 후보는 누르지 않음)');
  로그인됨 = false;
  const 재단 = await ctx.newPage(); await 재단.setViewportSize({ width: 1280, height: 800 });
  재단.on('pageerror', (e) => console.log('   [오류]', String(e).slice(0, 200)));
  await 재단.goto('https://vivivic-cloud.github.io/vivivic-apps/발주역입력/재단.html');
  await 재단.waitForSelector('.vk input', { timeout: 30000 });
  맞나('배지 v1.6.0', (await 재단.textContent('.badge')).trim() === 'v1.6.0');
  await 재단.click('.vk input');
  await 재단.waitForFunction(() => /로그인/.test(document.querySelector('.vpd')?.textContent || ''), null, { timeout: 30000 });
  let 판 = await 재단.textContent('.vpd');
  맞나('⑥ 로그인 필요 글', 판.includes('벤더피아 로그인 필요'), 판.slice(0, 120));
  맞나('⑥ 로그인 화면 열기 단추', !!(await 재단.$('.vpd div[data-act="login"]')));
  맞나('⑥ 아이디·비밀번호 칸 없음', !(await 재단.$('.vpd input')) && !(await 재단.$('input[type=password]')));
  await 재단.click('.vpd div[data-act="login"]'); await 재단.waitForTimeout(800);
  맞나('⑥ 누르면 벤더피아 새 탭', 열린창.some((u) => u.startsWith('https://vendorpia.com/')), JSON.stringify(열린창));
  for (const p of ctx.pages()) if (p.url().startsWith('https://vendorpia.com')) await p.close();
  로그인됨 = true;
  await 재단.bringToFront();
  await 재단.click('h1'); await 재단.click('.vk input');
  await 재단.waitForFunction(() => /단품 새로 받기/.test(document.querySelector('.vpd')?.textContent || ''), null, { timeout: 30000 });
  판 = await 재단.textContent('.vpd');
  맞나('⑥ 로그인 뒤 「단품 새로 받기 · 3개」', /단품 새로 받기벤더피아연동 단품관리 3개/.test(판), 판.slice(0, 120));
  await 재단.fill('.vk input', '가나 서랍');
  판 = await 재단.textContent('.vpd');
  맞나('⑥ 검색 후보 = 확장 목록', 판.includes('ab-01') && 판.includes('zz-01') && 판.includes('중지'), 판.slice(0, 160));
  const P2 = POST수;
  await 재단.click('.vpd div[data-act="new"]');
  await 재단.waitForFunction(() => /단품 새로 받기/.test(document.querySelector('.vpd')?.textContent || ''), null, { timeout: 30000 });
  맞나('⑥ 「단품 새로 받기」 → 벤더피아에 다시 물음', POST수 > P2, 'POST ' + P2 + '→' + POST수);
  const 쪽넓이 = await 재단.evaluate(() => document.documentElement.scrollWidth);
  맞나('⑥ 쪽 가로 밀림 없음', 쪽넓이 <= 1280, String(쪽넓이));
  await 재단.screenshot({ path: path.join(os.tmpdir(), '단품다리-재단.png') });
  await ctx.close();

  console.log('\n■ 확장 없는 크롬 → 임시 목록');
  const ctx2 = await chromium.launch({ executablePath: EXE, headless: true });
  const 쪽2 = await ctx2.newPage();
  await 쪽2.route('**://vivivic-cloud.github.io/**', async (r) => {
    const p = decodeURIComponent(new URL(r.request().url()).pathname); const 자리 = path.join(저장소, p.replace(/^\/vivivic-apps\//, ''));
    if (fs.existsSync(자리) && fs.statSync(자리).isFile()) return r.fulfill({ status: 200, contentType: p.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript', body: fs.readFileSync(자리) });
    return r.fulfill({ status: 404, body: 'x' });
  });
  await 쪽2.goto('https://vivivic-cloud.github.io/vivivic-apps/발주역입력/재단.html');
  await 쪽2.waitForSelector('.vk input', { timeout: 30000 });
  await 쪽2.click('.vk input');
  await 쪽2.waitForFunction(() => /임시 목록|읽지 못/.test(document.querySelector('.vpd')?.textContent || ''), null, { timeout: 30000 });
  판 = await 쪽2.textContent('.vpd');
  맞나('확장 없음 → 「임시 목록」 + 창고 후보', 판.includes('임시 목록') && !판.includes('단품 새로 받기') && !판.includes('로그인'), 판.slice(0, 120));
  await ctx2.close();
  서버.close();
  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
