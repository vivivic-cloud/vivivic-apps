/* 기계배치도 — **바닥이 화면을 얼마나 쓰나**를 세 화면에서 재는 시험.
   관리자가 10-05 에 짚은 것: 「폰 화면의 3분의 2가 비어 있다 · 제일 작은 기계 변이 41px」

       node 기계배치도/tests/바닥크기.mjs

   재는 것: 바닥 크기 · 바닥이 쓰는 세로 % · 바닥 밑의 빈 자리 · 제일 작은 기계 변(본 것과 닿는 것) */
import path from 'node:path';
import fs from 'node:fs';
import { 본보기깔기 } from './도구/본보기.mjs';
import { 브라우저열기, 서버, 뿌리 } from '../../에이엠티/tests/도구/터.mjs';

const 잰것 = [];
const 재기 = (이름, 됐나, 곁 = '') => {
    잰것.push({ 이름, 됐나, 곁 });
    console.log((됐나 ? '  ✓ ' : '  ✗ ') + 이름 + (곁 ? '   [' + 곁 + ']' : ''));
};
const 그림칸 = path.join(뿌리, '기계배치도/shots');
fs.mkdirSync(그림칸, { recursive: true });
await 서버();
const 주소 = 'http://127.0.0.1:8899/' + encodeURIComponent('기계배치도') + '/' + encodeURIComponent('기계배치도.html');
const 허수아비 = {
    'firebase-app.js': `export const initializeApp=()=>({});`,
    'firebase-auth.js': `export const getAuth=()=>({});export const signInAnonymously=async()=>({});
                         export const onAuthStateChanged=(a,cb)=>{setTimeout(()=>cb({uid:'t'}),10)};`,
    'firebase-firestore.js': `export const getFirestore=()=>({});export const doc=(d,...k)=>({길:k.join('/')});
                         export const getDoc=async()=>({exists:()=>false,data:()=>null});
                         export const setDoc=async()=>{};`,
};
const b = await 브라우저열기({ args: ['--no-sandbox'] });

const 화면들 = [
    { 이름: '375×812 (폰)',  w: 375,  h: 812,  폰: true },
    { 이름: '390×844',       w: 390,  h: 844,  폰: true },
    { 이름: '1280×900',      w: 1280, h: 900,  폰: false },
];
const 줄 = [];
for (const 화 of 화면들) {
    const ctx = await b.newContext({ viewport: { width: 화.w, height: 화.h },
        hasTouch: 화.폰, isMobile: 화.폰, deviceScaleFactor: 화.폰 ? 2 : 1 });
    await ctx.route('**/firebasejs/**', r => {
        const n = Object.keys(허수아비).find(k => r.request().url().endsWith(k));
        return r.fulfill({ status: 200, contentType: 'text/javascript', body: n ? 허수아비[n] : 'export {};' });
    });
    await 본보기깔기(ctx);   // 옛 시험통에는 10,000×8,000 본보기를 깔아 준다
    const p = await ctx.newPage();
    const 터짐 = []; p.on('pageerror', e => 터짐.push(String(e.message || e)));
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
    const 잰 = await p.evaluate(() => {
        const f = document.getElementById('l-floor').getBoundingClientRect();
        const 발 = document.querySelector('.lfoot').getBoundingClientRect();
        const 기계 = [...document.querySelectorAll('.lmc')].map(el => {
            const r = el.getBoundingClientRect();
            const 넓힘 = Math.abs(parseFloat(getComputedStyle(el, '::after').top) || 0);
            return { 이름: el.querySelector('.lnm').textContent,
                     본: Math.min(r.width, r.height),
                     닿는: Math.min(r.width + 넓힘*2, r.height + 넓힘*2) };
        });
        const 제일작은 = 기계.reduce((a, c) => c.본 < a.본 ? c : a);
        /* 바닥이 쓸 수 있는 칸 — **보는 창(.lview)** 에서 손잡이 자리를 뺀 나머지.
           ⚠ 10-07 에 바뀐 것: 바닥이 무대의 한 줄이 아니라 보는 창 안에 떠 있다
             (확대·팬 때문이다). 그래서 알림줄 높이를 손으로 뺄 일이 없다 —
             창의 높이가 곧 쓸 수 있는 세로다. 네 변 모두 26px 씩 비운다(먼 쪽
             둘만 비웠더니, 바닥을 끌어 옮길 때 가까운 쪽 손잡이가 창에 잘렸다). */
        const 창 = document.getElementById('l-view');
        const 여백 = 30;   // 손잡이가 변 밖으로 28px 나가 앉는다(10-07 에 24→28 로 뺐다)
        const 칸폭 = 창.clientWidth - 여백 * 2, 칸높 = 창.clientHeight - 여백 * 2;
        return {
            칸폭: Math.round(칸폭), 칸높: Math.round(칸높),
            막힌쪽: (칸폭 / 10000) <= (칸높 / 8000) ? '가로' : '세로',
            세로다쓰려면폭: Math.round(칸높 * 10000 / 8000),
            바닥폭: Math.round(f.width), 바닥높: Math.round(f.height),
            바닥위: Math.round(f.top), 발아래: Math.round(발.bottom),
            화면높: window.innerHeight, 화면폭: window.innerWidth,
            넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
            넘친세로: document.documentElement.scrollHeight > window.innerHeight + 1,
            제일작은이름: 제일작은.이름,
            제일작은본: Math.round(제일작은.본), 제일작은닿는: Math.round(제일작은.닿는),
            기계수: 기계.length,
        };
    });
    const 쓰는세로 = 100 * 잰.바닥높 / 잰.화면높;
    const 빈자리 = 잰.화면높 - 잰.발아래;
    줄.push({ ...화, ...잰, 쓰는세로, 빈자리 });
    재기(화.이름 + ' — 바닥이 네 변 안에 들어오나',
         !잰.넘친가로 && !잰.넘친세로 && 잰.발아래 <= 잰.화면높,
         '바닥 ' + 잰.바닥폭 + '×' + 잰.바닥높 + ' · 발아래 ' + 잰.발아래 + '/' + 잰.화면높);
    재기(화.이름 + ' — 10,000×8,000 비(0.8)가 지켜졌나',
         Math.abs(잰.바닥높 / 잰.바닥폭 - 0.8) < 0.012,
         (잰.바닥높 / 잰.바닥폭).toFixed(4));
    재기(화.이름 + ' — 쓸 수 있는 칸을 한 쪽이라도 꽉 채웠나',
         Math.abs(잰.바닥폭 - 잰.칸폭) <= 1 || Math.abs(잰.바닥높 - 잰.칸높) <= 1,
         '쓸 칸 ' + 잰.칸폭 + '×' + 잰.칸높 + ' · 바닥 ' + 잰.바닥폭 + '×' + 잰.바닥높
         + ' · ' + 잰.막힌쪽 + '가 먼저 찼다'
         + (잰.막힌쪽 === '가로'
            ? ' (세로까지 다 쓰려면 바닥 폭이 ' + 잰.세로다쓰려면폭 + 'px 이어야 한다 — 화면에 없는 폭이다)'
            : ''));
    /* ⚠ 44px 자는 **닿는 자리**에 건다 — 이 집 규칙이 「닿는 자리는 44px 이상」이다.
       보이는 변 크기도 숨기지 않고 같이 적는다(10-07 에 바닥이 26px 줄며 45→42 가 됐다). */
    재기(화.이름 + ' — 제일 작은 기계의 **닿는 자리**가 44px 이상인가',
         잰.제일작은닿는 >= 44,
         잰.제일작은이름 + ' 닿는 자리 ' + 잰.제일작은닿는 + 'px (보이는 변은 ' + 잰.제일작은본 + 'px)');
    재기(화.이름 + ' — 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');
    await p.screenshot({ path: path.join(그림칸, 화.w + 'x' + 화.h + '-바닥.png') });
    await ctx.close();
}
await b.close();

console.log('\n┌ 바닥이 화면을 얼마나 쓰나 ─────────────────────────────────────────');
const 칸 = (t, n) => String(t).padEnd(n, ' ');
console.log('│ ' + 칸('화면',16) + 칸('바닥',13) + 칸('쓸 칸',13) + 칸('쓰는 세로',11)
            + 칸('밑 빈자리',11) + 칸('먼저 찬 쪽',12) + '제일 작은 기계 변');
for (const r of 줄)
    console.log('│ ' + 칸(r.이름,16) + 칸(r.바닥폭 + '×' + r.바닥높,13) + 칸(r.칸폭 + '×' + r.칸높,13)
        + 칸(r.쓰는세로.toFixed(0) + '%',11) + 칸(r.빈자리 + 'px',11) + 칸(r.막힌쪽,12)
        + r.제일작은이름 + ' ' + r.제일작은본 + 'px (닿는 ' + r.제일작은닿는 + 'px)');
console.log('└────────────────────────────────────────────────────────────────────');

const 실패 = 잰것.filter(t => !t.됐나);
console.log(`\n초록 ${잰것.length - 실패.length} · 빨강 ${실패.length} · 건너뜀 0 (잰 것 모두 ${잰것.length})`);
if (실패.length) console.log('빨강:\n' + 실패.map(t => '  ✗ ' + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : '')).join('\n'));
process.exit(실패.length ? 1 : 0);
