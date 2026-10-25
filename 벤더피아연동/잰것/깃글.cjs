/* 사장님 10-25 「GitHub 코드를 못 받는 문제」 — 화면 글이 **깃허브 것으로** 도는지, 못 받으면 **확장 것 + 붉은 딱지(까닭)** 인지,
   **두 벌 도는 일이 없는지** 재는 자. 진짜 크롬에 이 폴더를 확장으로 올린다(진짜 content script). vendorpia.com 은 가짜 https 서버.
   깃허브(github.io)는 경우마다 route 로 흉내 낸다:
     A 정상  B 막힘(abort)  C CORS 없음(확장 fetch 는 상관없음)  D 7초 느림(5초 끊기)  E login.js 만 404
   깃 글에는 몰래 표식(`window.__깃돔`)을 붙여 돌린 횟수를 센다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https'), { execSync } = require('child_process');
const 확장 = path.join(__dirname, '..');
const EXE = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'].find((p) => fs.existsSync(p));
let 초록 = 0, 빨강 = 0;
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };
const 쪽 = `<html><head><meta charset="utf-8"><title>로그인</title></head><body><div>원래 로그인</div>
<form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"><input type="submit" id="btnLogin" value="로그인"></form></body></html>`;

(async () => {
  const d0 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d0}/k.pem -out ${d0}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  const 서버 = https.createServer({ key: fs.readFileSync(d0 + '/k.pem'), cert: fs.readFileSync(d0 + '/c.pem') }, (q, r) => {
    r.setHeader('content-type', 'text/html; charset=utf-8'); r.end(쪽);
  }).listen(8443);

  const 경우 = async (이름, 길, 기대) => {
    console.log('\n■ ' + 이름);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-'));
    const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true,
      env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
      args: ['--headless=new', '--no-sandbox', '--no-proxy-server', '--host-resolver-rules=MAP vendorpia.com 127.0.0.1:8443, MAP www.vendorpia.com 127.0.0.1:8443',
        '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
    await new Promise((r) => setTimeout(r, 2000));
    const 요청 = [];
    await ctx.route('**://vivivic-cloud.github.io/**', async (r) => {
      const q = r.request(); const 이름 = decodeURIComponent(new URL(q.url()).pathname.split('/').pop());
      const 낱 = (await q.allHeaders())['sec-fetch-dest'] || '';
      요청.push(이름 + ':' + 낱);
      if (길 === 'B') return r.abort('blockedbyclient');
      if (길 === 'D' && 낱 === 'empty') { await new Promise((s) => setTimeout(s, 7000)); return r.abort().catch(() => {}); }
      if (길 === 'E' && 낱 === 'empty' && 이름 === 'login.js') return r.fulfill({ status: 404, body: 'x' });
      const 자리 = path.join(확장, 이름);
      if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
      const 헤더 = { 'content-type': 이름.endsWith('.css') ? 'text/css' : 'text/javascript' };
      if (길 !== 'C') 헤더['access-control-allow-origin'] = '*';
      if (길 === 'C' && 낱 === 'empty') return r.abort();       // CORS 없는 fetch 와 같은 꼴: fetch 만 실패
      const 몸 = fs.readFileSync(자리, 'utf8') + (이름.endsWith('.js') ? '\n;window.__깃돔=(window.__깃돔||[]).concat(' + JSON.stringify(이름) + ');' : '');
      return r.fulfill({ status: 200, headers: 헤더, body: 몸 });
    });
    const 쪽창 = await ctx.newPage(); 쪽창.on('console', m => console.log('   [콘솔]', m.text().slice(0,200))); 쪽창.on('pageerror', e => console.log('   [오류]', String(e).slice(0,200)));
    await 쪽창.goto('https://vendorpia.com/System/Login/main.aspx'); await 쪽창.waitForTimeout(5500);
    const 본 = await 쪽창.evaluate(() => ({
      딱지: (document.getElementById('vp-판') || {}).textContent || '',
      붉음: ((document.getElementById('vp-판') || { style: {} }).style.background || ''),
      돌림: window.__깃돔 || null,   // ⚠ 확장 격리 세상이 아니라 쪽(MAIN) 변수 — 인라인/스크립트는 MAIN 에서 돈다
      돌린글: document.documentElement.getAttribute('data-vp-글'),
      확장스크립트: [...document.querySelectorAll('script[src*="chrome-extension"]')].map((s) => decodeURIComponent(s.src.split('/').pop())),
    }));
    console.log('   딱지:', 본.딱지); console.log('   깃 요청:', 요청.length, '· 깃 글 돌림:', JSON.stringify(본.돌림), '· 확장 script:', JSON.stringify(본.확장스크립트));
    기대(본, 요청);
    await ctx.close();
  };
  const 줄글 = ['vp-data.js', 'login.js'];
  await 경우('A 깃허브 정상 — 깃 글이 돈다 · 두 벌 없음', 'A', (본) => {
    맞나('딱지에 「깃」(확장 아님)', /· 깃 ·/.test(본.딱지) && !/확장/.test(본.딱지.replace('벤더피아 보기', '')), 본.딱지.slice(0, 60));
    맞나('「깃 못받음」 없음', !/못받음/.test(본.딱지));
    맞나('깃 글이 각각 정확히 1번 돈다(두 벌 아님)', 줄글.every((f) => (본.돌림 || []).filter((x) => x === f).length === 1), JSON.stringify(본.돌림));
    맞나('확장 안 vp-data·login 은 안 박혔다', !본.확장스크립트.some((x) => 줄글.includes(x)));
  });
  await 경우('B 깃허브 막힘 — 확장 것으로 돈다 · 딱지 붉음 · 까닭', 'B', (본) => {
    맞나('딱지에 「확장」', /· 확장 ·/.test(본.딱지));
    맞나('까닭: 「깃 못받음」 + 파일 이름 + 실패 말', /깃 못받음/.test(본.딱지) && /vp-data\.js=/.test(본.딱지) && /login\.js=/.test(본.딱지));
    맞나('딱지가 붉다', /c92a2a|201, 42, 42/i.test(본.붉음) || /201,\s*42,\s*42/.test(본.붉음), 본.붉음);
    맞나('확장 안 글이 각각 1번(두 벌 아님)', 줄글.every((f) => 본.확장스크립트.filter((x) => x === f).length === 1), JSON.stringify(본.확장스크립트));
    맞나('깃 글은 안 돌았다', !본.돌림);
  });
  await 경우('C 쪽 fetch 가 CORS 로 막히는 꼴 — 배경 글 fetch 는 상관없이 깃 글이 돈다 · 두 벌 없음', 'C', (본) => {
    맞나('깃 글이 각각 정확히 1번', 줄글.every((f) => (본.돌림 || []).filter((x) => x === f).length === 1), JSON.stringify(본.돌림));
    맞나('확장 안 vp-data·login 은 안 박혔다', !본.확장스크립트.some((x) => 줄글.includes(x)));
  });
  await 경우('D 깃 fetch 가 7초 걸림 — 5초에 끊고 확장 것으로 · 늦게 와도 두 벌 없음', 'D', (본) => {
    맞나('깃 글이 각각 정확히 1번', 줄글.every((f) => (본.돌림 || []).filter((x) => x === f).length === 1), JSON.stringify(본.돌림));
  });
  await 경우('E login.js 만 404 — 그 파일만 확장 것으로 · 두 벌 없음', 'E', (본) => {
    맞나('깃 글 각각 1번', 줄글.every((f) => (본.돌림 || []).filter((x) => x === f).length === 1), JSON.stringify(본.돌림));
  });
  서버.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
