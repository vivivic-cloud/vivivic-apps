/* 11-18 [새 지시 단품실시간] — 발주역입력 재단 「단품 추가」 검색 = 벤더피아 단품관리 실시간(덮어쓰기 없이)을 재는 자.
   ⚠ 확장은 **깔린 판 그대로**(VP_EXT = 0.34.90 같은 옛 판 폴더 — `git archive 25212f7 벤더피아연동` 으로 풀어 둔 것). 단품다리(0.35.0)는 없다.
     그 판의 bg.js 가 깃(github.io, route 로 이 저장소 파일)에서 새 `vp-data.js` 를 받아 벤더피아 탭에 넣는다 → 그것이 이 길의 전부.
   vendorpia.com = 가짜 https 서버(자료 전부 가짜). github.io = 이 저장소 파일(재단.html 은 진짜 창고 사본을 **읽기만** — 쓰기 길은 막음, 후보는 안 누름).
   잼: ① 「단품 추가」 → 벤더피아 단품관리 탭 하나 열림 → 이어짐  ② 사본에 없는 새 단품이 후보에 · 「· 실시간」 · POST 에 tbGoodsNm
       ③ 판매상태가 벤더피아에서 「중지」 로 바뀐 단품은 후보에서 빠짐  ④ 로그아웃 → 「벤더피아 로그인 화면 열기」
       ⑤ 재단 새로고침 → 새 탭 안 열고 인사로 다시 이어짐  ⑥ 이어진 탭 없는 쪽 = 사본 그대로(실시간 표시 없음)
   쓰는 법(맥): NODE_PATH=<playwright-core 깐 곳> VP_EXE=<Chromium> VP_EXT=<옛 판 폴더> node 잰것/단품실시간.cjs */
const { chromium } = require(process.env.NODE_PATH ? 'playwright-core' : 'playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https'), { execSync } = require('child_process');
const 저장소 = path.join(__dirname, '..', '..');
const 확장 = process.env.VP_EXT;
const EXE = process.env.VP_EXE;
const 쪽이름 = process.env.VP_PAGE || '재단.html', 배지 = process.env.VP_BADGE || 'v1.9.0';   // 이룸산업.html v1.3.0 · 로앤.html v1.2.0
let 초록 = 0, 빨강 = 0;
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };

let 로그인됨 = true, 검색들 = [];
let 자료 = [['NEW-9001', '시험새단품 수납장 1200', '판매중']];   // 사본에 없는 새 단품
const 로그인쪽 = `<html><body><form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"></form></body></html>`;
const 단품폼 = `<html><body><form method="post"><input type="hidden" name="__VIEWSTATE" value="x">
<select name="ddlRowCnt" id="ddlRowCnt"><option value="20">20</option><option value="700">700</option></select>
<input name="dcStartDt" id="dcStartDt" value="2026-01-01"><input name="dcEndDt" id="dcEndDt" value="2026-11-18">
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="1">판매중</option></select>
<input name="tbGoodsNm" id="tbGoodsNm" value=""><input name="tbGoodsCd" id="tbGoodsCd" value="">
<input type="image" name="btnSearch" id="btnSearch"></form></body></html>`;
const 표 = (줄) => `<html><body><form method="post"><input type="hidden" name="__VIEWSTATE" value="y"></form><div>총 ${줄.length} 건</div>
<table><tr><th>No</th><th>매입처명</th><th>단품코드</th><th>단품명</th><th>판매상태</th></tr>
${줄.map((r, i) => `<tr><td>${i + 1}</td><td>가짜매입처</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table></body></html>`;

(async () => {
  const d0 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d0}/k.pem -out ${d0}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  https.createServer({ key: fs.readFileSync(d0 + '/k.pem'), cert: fs.readFileSync(d0 + '/c.pem') }, (q, r) => {
    r.setHeader('content-type', 'text/html; charset=utf-8');
    const u = q.url.split('?')[0];
    if (!로그인됨) return r.end(로그인쪽);
    if (u === '/System/Master/goods.aspx') {
      if (q.method === 'POST') {
        const 조각 = []; q.on('data', (c) => 조각.push(c));
        q.on('end', () => {
          const b = Buffer.concat(조각).toString('utf8');
          const 값 = (n) => (b.match(new RegExp('name="' + n + '"\\r\\n\\r\\n([^\\r]*)')) || [])[1] || '';
          const 이름 = 값('tbGoodsNm'), 코드 = 값('tbGoodsCd');
          if (이름 || 코드) 검색들.push(이름 || 코드);
          r.end(표(자료.filter((x) => (이름 && x[1].includes(이름)) || (코드 && x[0] === 코드) || (!이름 && !코드))));
        });
        return;
      }
      return r.end(단품폼);
    }
    return r.end('<html><body><a href="#">배송관리</a></body></html>');
  }).listen(8443);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-'));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true,
    args: ['--headless=new', '--no-sandbox', '--ignore-certificate-errors', '--host-resolver-rules=MAP vendorpia.com 127.0.0.1:8443, MAP www.vendorpia.com 127.0.0.1:8443',
      '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const 판 = await sw.evaluate(() => chrome.runtime.getManifest().version);
  console.log('깔린 판(시험) ' + 판);
  const 열린창 = [];
  ctx.on('page', (p) => 열린창.push(p));
  let 쓰기 = 0;
  await ctx.route('**://firestore.googleapis.com/**', (r) => {
    const u = r.request().url();
    if (/Write\/channel|:commit|:batchWrite/.test(u) || ['PATCH', 'DELETE'].includes(r.request().method()) && !/Listen/.test(u)) { 쓰기++; return r.abort(); }
    return r.continue();
  });
  await ctx.route('**://vivivic-cloud.github.io/**', async (r) => {
    const p = decodeURIComponent(new URL(r.request().url()).pathname);
    const 자리 = path.join(저장소, p.replace(/^\/vivivic-apps\//, ''));
    if (p.startsWith('/vivivic-apps/') && fs.existsSync(자리) && fs.statSync(자리).isFile())
      return r.fulfill({ status: 200, contentType: p.endsWith('.html') ? 'text/html; charset=utf-8' : p.endsWith('.css') ? 'text/css' : 'text/javascript', body: fs.readFileSync(자리) });
    return r.fulfill({ status: 404, body: 'x' });
  });
  const 판글 = (쪽) => 쪽.evaluate(() => document.querySelector('.vpd')?.textContent || '');
  const 기다려 = (쪽, f, a) => 쪽.waitForFunction(f, a, { timeout: 30000 }).then(() => true, () => false);

  console.log('\n■ 재단 — 깔린 판 그대로');
  const 재단 = await ctx.newPage(); await 재단.setViewportSize({ width: 1280, height: 800 });
  재단.on('pageerror', (e) => console.log('   [오류]', String(e).slice(0, 200)));
  await 재단.goto('https://vivivic-cloud.github.io/vivivic-apps/발주역입력/' + 쪽이름);
  await 재단.waitForSelector('.vk .추가', { timeout: 30000 });
  맞나(쪽이름 + ' 배지 ' + 배지, (await 재단.textContent('.badge')).trim() === 배지);
  맞나('확장 표시 data-벤더피아연동 = 깔린 판', (await 재단.evaluate(() => document.documentElement.getAttribute('data-벤더피아연동'))) === 판);
  맞나('단품다리 없음(0.35.0 아님)', (await 재단.evaluate(() => document.documentElement.getAttribute('data-벤더피아단품'))) === null);
  const 앞창 = 열린창.length;
  await 재단.click('.vk .추가');
  await 재단.waitForTimeout(500);
  const 새창 = 열린창.slice(앞창);
  맞나('① 「단품 추가」 → 벤더피아 탭 하나', 새창.length === 1, 새창.map((p) => p.url()).join(','));
  if (새창[0]) await 새창[0].waitForLoadState('load').catch(() => {});
  맞나('① 그 탭 = 벤더피아 단품관리', 새창[0] && /vendorpia\.com\/System\/Master\/goods\.aspx/.test(새창[0].url()), 새창[0] && 새창[0].url());
  await 재단.bringToFront();
  맞나('① 이어짐(인사 받음)', await 기다려(재단, () => window.VP실시간 && VP실시간.이어짐()));
  맞나('① 그 탭에서 깃 vp-data.js 가 돎', 새창[0] && /vp-data\.js/.test(await 새창[0].evaluate(() => document.documentElement.getAttribute('data-vp-글') || '')));

  await 재단.click('.vk .추가').catch(() => {});
  if (!(await 재단.$('.vk input'))) await 재단.click('.vk .추가');
  await 재단.fill('.vk input', '시험새단품');
  const 나옴 = await 기다려(재단, () => /NEW-9001/.test(document.querySelector('.vpd')?.textContent || ''));
  let 글 = await 판글(재단);
  맞나('② 사본에 없는 새 단품이 후보에', 나옴, 글.slice(0, 160));
  맞나('② 「· 실시간」 표시', /· 실시간/.test(글));
  맞나('② 벤더피아 검색칸 tbGoodsNm 으로 물음', 검색들.includes('시험새단품'), JSON.stringify(검색들));
  맞나('② 세 칸만 건넴(매입처 안 감)', !(await 재단.evaluate(() => JSON.stringify([...실시간줄.values()]))).includes('가짜매입처'));
  맞나('② 새 단품이 맨 앞', (await 재단.evaluate(() => 후보들[0] && 후보들[0].코드)) === 'NEW-9001');
  맞나('② 「×」·멀티선택 단추 그대로(후보 줄 data-i)', !!(await 재단.$('.vpd div[data-i="0"]')));

  /* ③ 사본의 판매중 단품 하나를 벤더피아에서 「중지」 로 */
  const 하나 = await 재단.evaluate(() => { const d = 단품들.find((x) => x.상태 === '판매중' && x.코드 !== 'NEW-9001' && /[가-힣]{3,}/.test(x.이름)); return d && [d.코드, d.이름]; });
  if (하나) {
    const 낱 = 하나[1].match(/[가-힣]{3,}/)[0];
    자료 = 자료.concat([[하나[0], 하나[1], '중지']]);
    await 재단.fill('.vk input', 하나[1]);
    const 빠짐 = await 기다려(재단, (c) => 실시간줄.has(c) && !후보들.some((d) => d.코드 === c), 하나[0]);
    맞나('③ 벤더피아에서 중지된 단품은 후보에서 빠짐', 빠짐, 하나.join(' ') + ' · 물은 낱말 ' + JSON.stringify(검색들.slice(-2)));
    void 낱;
  } else 맞나('③ 사본 단품 못 찾음', false);

  /* ④ 로그아웃 */
  로그인됨 = false;
  await 재단.fill('.vk input', '로그아웃시험');
  맞나('④ 로그아웃 → 로그인 화면 열기', await 기다려(재단, () => !!document.querySelector('.vpd div[data-act="login"]')), (await 판글(재단)).slice(0, 120));
  로그인됨 = true;

  /* ⑤ 재단 새로고침 → 새 탭 없이 다시 이어짐 */
  const 앞창2 = 열린창.length;
  await 재단.reload();
  await 재단.waitForSelector('.vk .추가', { timeout: 30000 });
  맞나('⑤ 새로고침 뒤 인사로 다시 이어짐', await 기다려(재단, () => window.VP실시간 && VP실시간.이어짐()));
  await 재단.click('.vk .추가');
  await 재단.fill('.vk input', '시험새단품');
  맞나('⑤ 새로고침 뒤에도 실시간 후보', await 기다려(재단, () => /NEW-9001/.test(document.querySelector('.vpd')?.textContent || '')));
  맞나('⑤ 새 탭 안 열림', 열린창.length === 앞창2, String(열린창.length - 앞창2));

  /* ⑥ 이어진 탭 없는 쪽(다른 탭으로 연 재단) — 연 탭을 닫고 새로 */
  for (const p of 새창) await p.close().catch(() => {});
  const 남 = await ctx.newPage();
  await 남.goto('https://vivivic-cloud.github.io/vivivic-apps/발주역입력/' + 쪽이름);
  await 남.waitForSelector('.vk .추가', { timeout: 30000 });
  await 남.evaluate(() => { window.open = () => null; });   /* 탭이 안 열리는 기기 흉내(폰·막힘) */
  await 남.click('.vk .추가');
  await 남.fill('.vk input', '서랍');
  맞나('⑥ 사본으로 후보', await 기다려(남, () => 후보들.length > 0 && !/받는 중/.test(document.querySelector('.vpd')?.textContent || '')));
  글 = await 판글(남);
  맞나('⑥ 실시간 표시 없음', !/실시간/.test(글), 글.slice(0, 100));
  맞나('⑥ 중지 숨김 그대로', await 남.evaluate(() => 후보들.every((d) => d.상태 !== '중지')));
  맞나('창고 쓰기 0(시험이 막음 — 누른 후보 없음)', 쓰기 === 0, String(쓰기));

  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  await ctx.close(); process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
