/* 「압축파일 받기」 를 눌렀을 때 **어떤 이름으로 받아지나** 를 재는 자.
   공유받으신 분 10-14 11:38, 「압축파일 받기」 를 짚으시고: 「압축파일로 바꿔줘」
   ⚠ 진짜 깃허브 페이지에는 이 상자에서 못 닿는다 — 설치 안내 화면만 그대로 세워 잰다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ acceptDownloads: true });
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
    const 길 = decodeURIComponent(new URL(r.request().url()).pathname)
      .replace('/vivivic-apps/벤더피아연동', '').replace(/^\//, '');
    if (!길 || 길 === 'index.html')
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
                         body: fs.readFileSync(path.join(확장, 'index.html')) });
    const 자리 = path.join(확장, 길);
    if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'no' });
    /* ⚠ 깃허브 페이지가 zip 을 무엇이라 내주는지 **못 쟀다.** 여기서는 application/zip 으로 둔다. */
    return r.fulfill({ status: 200, contentType: 길.endsWith('.zip') ? 'application/zip' : 'text/plain',
                       body: fs.readFileSync(자리) });
  });
  const page = await ctx.newPage();
  await page.goto('https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/index.html?%EC%95%88%EB%82%B4');
  await page.waitForTimeout(400);

  const 줄 = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim() === '압축파일 받기');
    if (!a) return null;
    return { 보이는글: a.textContent.trim(), href속성: a.getAttribute('href'),
             다운로드속성: a.getAttribute('download'), 풀린주소: a.href };
  });
  console.log('\n■ 「압축파일 받기」 단추');
  console.log('  ' + JSON.stringify(줄, null, 0));

  const [받음] = await Promise.all([
    page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
    page.evaluate(() => { const a = [...document.querySelectorAll('a')]
      .find(x => x.textContent.trim() === '압축파일 받기'); a && a.click(); }),
  ]);
  if (!받음) { console.log('  ✗ 받아지지 않았다'); await b.close(); return; }
  const 이름 = 받음.suggestedFilename();
  console.log('\n  ★ **받아지는 이름: 「' + 이름 + '」**');
  console.log('     아스키뿐인가 : ' + /^[\x20-\x7e]+$/.test(이름));
  console.log('     .zip 으로 끝나나 : ' + 이름.toLowerCase().endsWith('.zip'));
  const 둘곳 = '/tmp/claude-0/-home-user-vivivic-apps/459edaf4-304e-56e1-9eb8-ad6dc33034a4/scratchpad/받은것.bin';
  try {
    await 받음.saveAs(둘곳);
    const 몸 = fs.readFileSync(둘곳);
    console.log('     크기 : ' + 몸.length.toLocaleString() + ' 바이트');
    console.log('     진짜 zip 인가(PK 머리) : ' + (몸[0] === 0x50 && 몸[1] === 0x4b));
  } catch (e) { console.log('     몸은 못 받았다: ' + String(e.message).split('\n')[0]); }
  await b.close();
})();
