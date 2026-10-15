/* **밖에 다리가 쓰기를 진짜로 막나**를 재는 자 (10-15).
   바이글이 짚었다 — 집(origin)만 둘로 묶고 **셈 종류(method)를 안 묶어서**, 이 창의
   아무 글이나 `POST`·`PATCH`·`DELETE` 를 창고로 보내 **사장님 자료를 쓰거나 지울 수** 있었다.
   「묻는 쪽이 읽기만 한다」 는 막음이 아니다. 다리 쪽에서 막아야 한다.
   ⚠ 막음 토막을 **손으로 베끼지 않는다** — `불러오기.js` 의 `──밖에다리시작──` ~ `──밖에다리끝──`
     을 **그대로 떼어 돌린다.** 베껴 두면 저쪽이 바뀔 때 자가 조용히 거짓말을 한다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

function 다리토막() {
  const t = fs.readFileSync(path.join(확장, '불러오기.js'), 'utf8');
  const 시작 = t.indexOf('/* ──밖에다리시작──');
  const 끝 = t.indexOf('/* ──밖에다리끝── */');
  if (시작 < 0 || 끝 < 0) throw new Error('불러오기.js 의 밖에다리 표를 못 찾았다');
  return t.slice(시작, 끝);
}
/* 화면 쪽 길은 `저장다리.js` 의 `window.VP밖에` 를 그대로 쓴다 */
function 화면다리토막() {
  const t = fs.readFileSync(path.join(확장, '저장다리.js'), 'utf8');
  const 시작 = t.indexOf('let 표2 = 0;');
  if (시작 < 0) throw new Error('저장다리.js 의 VP밖에 토막을 못 찾았다');
  return '(() => {\n' + t.slice(시작, t.lastIndexOf('})();')) + '\n})();';
}

/* 재어 볼 물음들 — 읽기는 통과해야 하고 **쓰기는 다 막혀야** 한다 */
const 창고 = 'https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents/artifacts/p/public/data';
const 로그인 = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=KKK';
const 물음들 = [
  { 이름: '창고 묻기 (읽기)',        주소: 창고 + ':runQuery',          셈: 'POST',   되나: true },
  { 이름: '익명 로그인',             주소: 로그인,                       셈: 'POST',   되나: true },
  { 이름: '창고 한 줄 읽기',         주소: 창고 + '/docs_files/abc',     셈: 'GET',    되나: true },
  { 이름: '★ 창고에 **쓰기**(commit)', 주소: 창고 + ':commit',           셈: 'POST',   되나: false },
  { 이름: '★ 창고에 **여럿 쓰기**',   주소: 창고 + ':batchWrite',        셈: 'POST',   되나: false },
  { 이름: '★ 줄 **만들기**',          주소: 창고 + '/docs_files',        셈: 'POST',   되나: false },
  { 이름: '★ 줄 **고치기**(PATCH)',   주소: 창고 + '/docs_files/abc',    셈: 'PATCH',  되나: false },
  { 이름: '★ 줄 **지우기**(DELETE)',  주소: 창고 + '/docs_files/abc',    셈: 'DELETE',되나: false },
  { 이름: '★ 셈을 숨긴 것(post)',     주소: 창고 + ':commit',            셈: 'post',   되나: false },
  { 이름: '★ 딴 집 (남의 서버)',      주소: 'https://example.com/x',     셈: 'GET',    되나: false },
  { 이름: '★ 딴 집 (구글 다른 칸)',   주소: 'https://www.googleapis.com/x', 셈: 'GET', 되나: false },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 900, height: 700 } });
  /* 다리를 **지나온 것만** 여기 쌓인다. 쌓이면 그 셈이 진짜로 나간 것이다. */
  const 나간것 = [];
  await ctx.route('**://**', (r) => {
    const u = new URL(r.request().url());
    if (u.hostname === 'vendorpia.com' && decodeURIComponent(u.pathname) === '/시험')
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
        body: '<html><head><meta charset="utf-8"></head><body id="body"></body></html>' });
    나간것.push(r.request().method() + ' ' + u.origin + u.pathname);
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"나갔다":true}' });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
  await page.goto('https://vendorpia.com/%EC%8B%9C%ED%97%98');
  await page.addScriptTag({ content: 화면다리토막() });     // window.VP밖에
  await page.addScriptTag({ content: '(() => {\n' + 다리토막() + '\n})();' });  // 받아 주는 쪽

  console.log('\n■ 밖에 다리 — **쓰기를 진짜로 막나** (토막은 불러오기.js 에서 그대로 떼어 왔다)');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  for (const 것 of 물음들) {
    /* ⚠ `GET` 에 몸통을 실으면 **브라우저가** 먼저 거절한다 — 다리 막음을 재는 것이 아니다.
         읽기 셈에는 몸통을 안 싣는다 (10-15 재서 잡았다). */
    const 답 = await page.evaluate(([주소, 셈]) => {
      const 옵션 = { method: 셈 };
      if (!/^(GET|HEAD)$/i.test(셈)) 옵션.body = '{}';
      return window.VP밖에(주소, 옵션);
    }, [것.주소, 것.셈]);
    const 통과 = !!(답 && 답.ok);
    const 길 = 것.셈.toUpperCase() + ' ' + new URL(것.주소).origin + new URL(것.주소).pathname;
    const 진짜나갔나 = 나간것.includes(길);
    console.log('  ' + (것.되나 ? '  ' : '  ') + 것.이름.padEnd(26)
      + ' ' + 것.셈.padEnd(6) + ' → ' + (통과 ? '통과' : '거절(' + (답 && 답.탈) + ')')
      + ' · 진짜 나갔나 ' + 진짜나갔나 + ' ' + 못(통과 === 것.되나 && 진짜나갔나 === 것.되나));
  }
  console.log('\n  다리를 지나 **진짜로 나간 것** ' + 나간것.length + '개:');
  for (const x of 나간것) console.log('    ' + x);
  console.log('  ★ 쓰기 길이 하나도 안 나갔나 '
    + 못(!나간것.some(x => /:commit|:batchWrite|^PATCH |^DELETE |^POST .*\/docs_files$/.test(x))));
  if (탈.length) { console.log('  터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await ctx.close(); await b.close();
  process.exit(빨강 ? 1 : 0);
})();
