// 사장님 10-12: 「에이엠티의 거래명세표를 조혼가구에 따로 받아와서 사용할 수 있는
//  방법을 강구하라」 → 그리는 법을 `shared/거래명세표.js` 한 벌로 뺐다.
// ① 에이엠티 화면이 **전과 한 글자도 안 달라졌는지**(md5) ② 에이엠티가 베낀 것이 아니라
// **그 공용 함수를 부르는지** ③ 공용 함수가 **노드에서도**(window·업무자료 없이) 똑같이
// 그리는지 ④ 담긴 꼴(`명세표`) 그대로 먹는지 ⑤ 못 읽으면 한 줄로 알리는지 를 잰다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 } from './도구/터.mjs';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
await 서버();
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const CSS = readFileSync((await 자재()) + '/tw-built.css', 'utf-8');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const md5 = (s) => createHash('md5').update(s).digest('hex');

/* v1.58.0 **앞** 판(에이엠티 안에 그리는 법이 있던 판)에서 잰 값이다.
   떼어 낸 뒤에도 이 값이 그대로여야 사장님 화면이 한 픽셀도 안 바뀐 것이다. */
const 전판 = { 재단: 'b271ccee350654ad3da29aab7bcacec5', 엣지: '8bdfd56f07095d4238c3b8e69480a3eb',
               NC: '0f2ba299e17eb7ef620e828d9e2c785b', 보링: '1d150c76ad2c3b6c9b71024da8337659',
               납기: '74b9d4c7fbcefbcce802574cd1ac66e7',
               빈: 'c14ae01dec8d44c5afcc8fb2ae7c536b', 빈날: 'e300c868f3b43d4cef9dcbbdf392a237' };
const 단가 = 1234;
// 담기는 꼴(`명세표`) 그대로다 — 새 꼴을 만들지 않는다
const 본 = [
  { 발주: { displayName: '시험상품', code: 'C9', orderCode: '유한-20261009-01', deliveryDate: '2026-10-21' },
    계획들: [
      { 파: 'A', 매: 3, 종류: 'PB-18T', 색상: '화이트', 품목들: [
        { 이름: '도어', 크기: '784*396', 몫: 30, 코드: 'TA_1' },
        { 이름: '가와', 크기: '748*400', 몫: null, 코드: 'TA_2' }] },
      { 파: '', 매: null, 종류: 'MDF-15T', 색상: '우드', 품목들: [
        { 이름: '선반', 크기: '500*300', 몫: 7, 코드: 'TA_3' }] }] },
  { 발주: { displayName: '', code: 'C8', orderCode: '조혼-20261009-01', deliveryDate: '2026-10-22' },
    계획들: [{ 파: 'B', 매: 1, 종류: 'PB-18T', 색상: '블랙', 품목들: [
      { 이름: '뒷판 <b>&', 크기: '900*450', 몫: 12, 코드: 'TB_1' }] }] },
];

const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1200);

// ── ① 에이엠티 화면이 전과 한 글자도 안 달라졌다 ────────────────────
const 집 = await p.evaluate(({ 본, 단가 }) => {
  window._재단단가 = 단가;
  const 밖 = {};
  ['재단', '엣지', 'NC', '보링', '납기'].forEach(공 => { 밖[공] = window._명세서표Html('2026-10-21', 공, 본, '').html; });
  밖['빈'] = window._명세서표Html('2026-10-21', '납기', [], 'A').html;
  밖['빈날'] = window._명세서표Html('2026-10-21', '재단', [], '').html;
  return 밖;
}, { 본, 단가 });
const 어긋난것 = Object.keys(전판).filter(k => md5(집[k]) !== 전판[k]);
console.log('■ 에이엠티 md5: ' + JSON.stringify(Object.fromEntries(Object.keys(전판).map(k => [k, md5(집[k])]))));
판('① 에이엠티 명세서 HTML 이 **떼어 내기 전과 똑같다** (md5 일곱 자리 다)',
   어긋난것.length === 0, 어긋난것.length ? '어긋남 ' + JSON.stringify(어긋난것) : '일곱 자리 모두 같다');

// ── ② 베낀 것이 아니라 **그 공용 함수를 부른다** ───────────────────
const 부르나 = await p.evaluate(({ 본 }) => {
  if (!window.거래명세표 || typeof window.거래명세표.그리기 !== 'function')
    return { 몇: 0, html: '(공용 그리개가 없다)', 설정: null };   // 옛 판 — 빨갛게 알린다
  const 참 = window.거래명세표.그리기;
  let 몇 = 0, 받은설정 = null;
  window.거래명세표.그리기 = function (묶, 설정) { 몇++; 받은설정 = 설정; return { html: '<i>바꿔치기</i>', 총매: 0, 줄수: 0 }; };
  const r = window._명세서표Html('2026-10-21', '납기', 본, '');
  window.거래명세표.그리기 = 참;
  return { 몇, html: r.html, 설정: 받은설정 && { 공정: 받은설정.공정, 원장: 받은설정.원장, 파칸: 받은설정.파칸 } };
}, { 본 });
console.log('■ 공용 함수를 부르나: ' + JSON.stringify(부르나));
판('② 에이엠티가 **공용 그리개를 부른다** (베껴 두 벌이 아니다)',
   부르나.몇 === 1 && 부르나.html === '<i>바꿔치기</i>', '부른 횟수 ' + 부르나.몇);
판('② 거래명세표(납기)는 **원장 칸 없이 · 파레트 칸 있게** 넘긴다',
   부르나.설정 && 부르나.설정.공정 === '납기' && 부르나.설정.원장 === false && 부르나.설정.파칸 === true,
   JSON.stringify(부르나.설정));

// ── ③ 노드에서도 — window·업무자료 없이 똑같이 그린다 ──────────────
const require = createRequire(import.meta.url);
// ⚠ 이 파일은 `URL` 을 제 이름으로 쓰고 있다 — 전역 URL 을 쓰면 안 된다
const 공용길 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../shared/거래명세표.js');
const 공용 = require(공용길);
const 밖납기 = 공용.그리기(본, { 날짜: '2026-10-21' }).html;
판('③ **노드에서도 같은 표가 나온다** — 조혼가구가 제 집에서 그려도 같다',
   md5(밖납기) === 전판.납기, md5(밖납기) + ' (에이엠티 ' + md5(집.납기) + ')');
판('③ 공용 그리개는 **window·업무자료를 안 본다** (순수 함수)',
   typeof global.window === 'undefined' && typeof global.confirmedOrders === 'undefined'
   && typeof global.currentFullData === 'undefined' && 공용.그리기(본, {}).줄수 === 4,
   'window ' + typeof global.window + ' · 줄수 ' + 공용.그리기(본, {}).줄수);
판('③ 재단 쪽도 똑같이 그린다 (몰라·돈글을 넘기면 된다)',
   md5(공용.그리기(본, { 날짜: '2026-10-21', 공정: '재단', 원장: true, 파칸: false,
     몰라: (글) => `<span class="명세-몰라">?${글 ? ' ' + 글 : ''}</span>`,
     돈글: (n) => (Math.round(Number(n) || 0)).toLocaleString('ko-KR'),
     재단단가: 단가 }).html) === 전판.재단, '재단 md5 같다');

// ── ④ 담긴 꼴 그대로 먹는다 · ⑤ 빈 것도 한 줄 ──────────────────────
판('④ `몫` 이 null 이면 **빈칸**이다 (0 이 아니다)',
   /<td class="ㄱㄱ"><\/td>/.test(밖납기) && />30개</.test(밖납기), '빈칸 있고 30개 있다');
판('④ 파레트가 없는 묶음은 「없음」 으로 적는다',
   /명세-빈파">없음</.test(밖납기), '있다');
판('⑤ 줄이 하나도 없으면 **빈 표를 안 내고 한 줄**로 알린다',
   md5(공용.그리기([], { 날짜: '2026-10-21', 추린이름: 'A' }).html) === 전판.빈
   && /A 에 담긴 것이 없습니다/.test(공용.그리기([], { 추린이름: 'A' }).html), '한 줄');
판('⑤ 넘긴 것이 망가져 있어도 안 터진다',
   공용.그리기(null, {}).줄수 === 0 && 공용.그리기([{}], {}).줄수 === 0,
   '0줄 · 0줄');

// ── 그림 둘 — 에이엠티 명세서 · 공용 그리개로 그린 같은 표 ──────────
if (그림칸()) {
  await p.evaluate(({ 본 }) => {
    document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
    window._명세서지금 = { 날짜: '2026-10-21', 공정: '납기', 묶음: 본 };
    const 짠 = window._명세서표Html('2026-10-21', '납기', 본, '');
    const 판 = document.createElement('div'); 판.id = '명세서판'; 판.className = '명세-판';
    판.innerHTML = '<div class="명세-속"><div class="명세-머리"><span class="명세-제목">10월 21일 납기 내역</span></div>'
      + '<div class="명세-몸">' + 짠.html + '</div></div>';
    document.body.appendChild(판);
  }, { 본 });
  await p.waitForTimeout(300);
  // 품목·수량 칸은 오른쪽에 있다 — 거기까지 밀어 놓고 찍어야 견줄 수 있다
  await p.evaluate(() => { const m = document.querySelector('#명세서판 .명세-몸');
    if (m) m.scrollLeft = m.scrollWidth; });
  await p.waitForTimeout(200);
  await p.screenshot({ path: 그림칸() + '/share-375-에이엠티명세서.png' });
  // 같은 표를 **공용 그리개만으로** 그려 본다 — 남의 집에서 펴는 그 꼴이다
  const p2 = await ctx.newPage();
  await p2.setContent('<html><head><meta charset="utf-8"></head><body></body></html>');
  // ⚠ 상대 경로는 **돌리는 자리**를 따라간다 — 다돌리기가 다른 자리에서 부르면 못 찾는다
  await p2.addScriptTag({ path: 공용길 });
  await p2.evaluate(({ 본, 꾸밈 }) => {
    const 스 = document.createElement('style'); 스.textContent = 꾸밈; document.head.appendChild(스);
    document.body.innerHTML = '<div class="밖집"><p class="밖집이름">조혼가구 — 공용 그리개로만 그린 같은 표</p>'
      + window.거래명세표.그리기(본, { 날짜: '2026-10-21' }).html + '</div>';
  }, { 본, 꾸밈: await p.evaluate(() => {
      // 에이엠티가 쓰는 그 표 꾸밈을 그대로 떠서 쓴다 — 꼴을 견주려는 것이다
      let 글 = '';
      [...document.styleSheets].forEach(ss => { try {
        [...ss.cssRules].forEach(r => { if (/명세-(표|쪽|없음|빈파)/.test(r.cssText)) 글 += r.cssText + '\n'; });
      } catch (e) {} });
      return 글 + 'body{font-family:system-ui,sans-serif;background:#fff;margin:0;padding:12px}'
        + '.밖집{overflow:auto}.밖집이름{font-size:12px;font-weight:800;color:#6b6966;margin:0 0 8px}';
    }) });
  await p2.waitForTimeout(200);
  await p2.evaluate(() => { document.querySelector(".밖집").style.overflow = "visible"; document.querySelector(".밖집").style.width = "max-content"; });
  const 셈 = await p2.evaluate(() => ({ 표: document.querySelectorAll('table.명세-표').length,
    쪽: document.querySelectorAll('.명세-쪽').length, 높: document.body.scrollHeight }));
  console.log('■ 공용 그리개 판: ' + JSON.stringify(셈));
  // 표가 폰 가로보다 넓다 — 네모째 찍어 **표 전체**가 그림에 들어오게 한다
  await p2.locator('.밖집').screenshot({ path: 그림칸() + '/share-375-공용그리개.png' });
  await p2.close();
}
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '명세표떼기1   OK' : '명세표떼기1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
