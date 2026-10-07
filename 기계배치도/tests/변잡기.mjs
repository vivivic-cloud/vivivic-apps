/* 기계배치도 — **변을 잡아 늘리기**를 재는 시험.
       node 기계배치도/tests/변잡기.mjs

   사장님 말씀 (장부에서 확인함)
     a1791349269 · 10-07 05:01:09 UTC · 짚으신 자리 「기계배치도 · 패널쏘 크기」
       「야 이렇게 말고 가로세로 변을 잡아 늘리고 늘리는 동작중 정확한 수치
         입력등으로 조절되게 해줘 공장바닥도 마찬가지야」

   ⚠ page.mouse 로 진짜 잡아 끈다. 값만 보지 않고 **손가락이 닿나 · 수가 보이나**까지. */
import path from 'node:path';
import fs from 'node:fs';
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
const 폰열쇠 = 'layout.배치.v1', 눈금 = 10;
const 허수아비 = {
    'firebase-app.js': `export const initializeApp=()=>({});`,
    'firebase-auth.js': `export const getAuth=()=>({});export const signInAnonymously=async()=>({});
                         export const onAuthStateChanged=(a,cb)=>{setTimeout(()=>cb({uid:'t'}),10)};`,
    'firebase-firestore.js': `export const getFirestore=()=>({});export const doc=(d,...k)=>({길:k.join('/')});
                         export const getDoc=async()=>({exists:()=>false,data:()=>null});
                         export const setDoc=async(r,d)=>{window.__창고=d};`,
};
const b = await 브라우저열기({ args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
await ctx.route('**/firebasejs/**', r => {
    const n = Object.keys(허수아비).find(k => r.request().url().endsWith(k));
    return r.fulfill({ status: 200, contentType: 'text/javascript', body: n ? 허수아비[n] : 'export {};' });
});
const p = await ctx.newPage();
const 터짐 = []; p.on('pageerror', e => 터짐.push(String(e.message || e)));

const 봄 = () => p.evaluate(() => {
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const 무대 = document.getElementById('l-stage').getBoundingClientRect();
    const 바 = document.getElementById('l-bar2');
    const 담김 = JSON.parse(localStorage.getItem('layout.배치.v1') || 'null');
    const 손잡이 = [...document.querySelectorAll('.lhd')].map(h => {
        const r = h.getBoundingClientRect();
        return { 누구: h.dataset.누구, 축: h.dataset.축, 쪽: h.className.match(/lhd-(\S+)/)[1],
                 왼: r.left, 위: r.top, 오른: r.right, 아래: r.bottom,
                 폭: Math.round(r.width), 높이: Math.round(r.height) };
    });
    return {
        바닥: Math.round(f.width) + '×' + Math.round(f.height),
        바닥폭: f.width, 바닥높: f.height, 바닥왼: f.left, 바닥오른: f.right, 바닥아래: f.bottom,
        무대오른: 무대.right, 화면폭: window.innerWidth, 화면높: window.innerHeight,
        넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
        바켜짐: 바.classList.contains('켜짐'),
        바위: Math.round(바.getBoundingClientRect().top),
        바아래: Math.round(바.getBoundingClientRect().bottom),
        바누구: document.getElementById('l-b2who').textContent,
        바축: document.getElementById('l-b2ax').textContent,
        바값: document.getElementById('l-b2val').value,
        바칸높: Math.round(document.getElementById('l-b2val').getBoundingClientRect().height),
        바칸글씨: parseFloat(getComputedStyle(document.getElementById('l-b2val')).fontSize),
        바단높: Math.round(document.getElementById('l-b2ok').getBoundingClientRect().height),
        손잡이,
        쪽지: document.getElementById('l-note').textContent,
        담김: 담김 ? { 바닥: 담김['바닥'],
                 기계: (담김['기계들'] || []).map(m => m['이름'] + ' ' + m.x + ',' + m.y
                        + ' ' + m['가로'] + 'x' + m['세로']).join(' · ') } : null,
        기계px: [...document.querySelectorAll('.lmc')].map(e => {
            const r = e.getBoundingClientRect();
            return e.querySelector('.lnm').textContent + ' ' + Math.round(r.width) + '×' + Math.round(r.height);
        }),
        크기판있나: !!document.getElementById('l-mc-sheet'),
    };
});
const 손잡이점 = async (누구, 축) => await p.evaluate(([n, a]) => {
    const h = [...document.querySelectorAll('.lhd')].find(x => x.dataset.누구 === n && x.dataset.축 === a);
    if (!h) return null;
    const r = h.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const 거기 = document.elementFromPoint(x, y);
    return { x, y, 잡히나: !!(거기 && 거기.closest('.lhd') === h) };
}, [누구, 축]);
async function 변끌기(누구, 축, dx, dy, 칸수 = 8) {
    const 점 = await 손잡이점(누구, 축);
    if (!점 || !점.잡히나) return { 못잡음: 점 ? '다른 것이 덮고 있습니다' : '손잡이가 없습니다' };
    await p.mouse.move(점.x, 점.y);
    await p.mouse.down();
    await p.waitForTimeout(80);
    const 짚자마자 = await 봄();
    const 도중 = [];
    for (let i = 1; i <= 칸수; i++) {
        await p.mouse.move(점.x + dx * i / 칸수, 점.y + dy * i / 칸수);
        await p.waitForTimeout(30);
        if (i === Math.ceil(칸수 / 2)) 도중.push(await 봄());
    }
    const 떼기전 = await 봄();
    await p.mouse.up();
    await p.waitForTimeout(250);
    return { 짚자마자, 도중: 도중[0], 떼기전, 점 };
}
const 깨끗이 = async () => {
    await p.evaluate(k => localStorage.removeItem(k), 폰열쇠);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(450);
};
await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();
const 처음 = await 봄();
const 배율 = 처음.바닥폭 / 10000;        // px / mm

/* ══ 톡 눌러 뜨던 크기 판은 뗐나 (사장님이 물리신 것) ════════════════ */
재기('톡 눌러 뜨던 크기 판이 없어졌나', !처음.크기판있나);

/* ══ 손잡이가 있나 · 닿나 ════════════════════════════════════════════ */
재기('기계 여섯 대 + 바닥에 가로·세로 손잡이가 다 달렸나',
     처음.손잡이.length === 14, 처음.손잡이.length + '개 (기계 12 + 바닥 2)');
const 작은손잡이 = 처음.손잡이.filter(h => Math.min(h.폭, h.높이) < 28 || Math.max(h.폭, h.높이) < 44);
재기('손잡이 닿는 자리가 다 28×44px 이상인가', 작은손잡이.length === 0,
     작은손잡이.length ? 작은손잡이.map(h => h.누구 + ':' + h.축 + ' ' + h.폭 + '×' + h.높이).join(' | ')
                       : 처음.손잡이[0].폭 + '×' + 처음.손잡이[0].높이 + ' (모두 같음)');
const 못잡는것 = [];
for (const h of 처음.손잡이) {
    const 점 = await 손잡이점(h.누구, h.축);
    if (!점 || !점.잡히나) 못잡는것.push(h.누구 + ':' + h.축);
}
재기('손잡이 열넷이 **다 손가락에 잡히나**', 못잡는것.length === 0, 못잡는것.join(' · ') || '다 잡힙니다');
재기('안 돌렸을 때 가로 손잡이는 오른쪽 · 세로 손잡이는 아래인가',
     처음.손잡이.every(h => h.쪽 === (h.축 === '가로' ? '오른' : '아래')),
     처음.손잡이.slice(0, 2).map(h => h.축 + '→' + h.쪽).join(' · '));
재기('바닥 손잡이가 화면 안에 있나 (바닥을 26px 비웠나)',
     처음.손잡이.filter(h => h.누구 === '바닥').every(h => h.오른 <= 처음.화면폭 + 0.5 && h.왼 >= -0.5),
     '바닥 ' + 처음.바닥 + ' · 오른끝 ' + Math.round(처음.바닥오른)
     + ' · 손잡이 오른끝 ' + Math.round(Math.max(...처음.손잡이.filter(h => h.누구 === '바닥').map(h => h.오른)))
     + ' / 화면 ' + 처음.화면폭);
재기('가로 넘침이 없나', !처음.넘친가로);
재기('바닥이 10:8 비를 지키나', Math.abs(처음.바닥높 / 처음.바닥폭 - 0.8) < 0.012,
     처음.바닥 + ' = ' + (처음.바닥높 / 처음.바닥폭).toFixed(3));
await p.screenshot({ path: path.join(그림칸, '375-변손잡이.png') });

/* ══ 크기 바 ═════════════════════════════════════════════════════════ */
재기('평소엔 크기 바가 안내말만 띄우나', !처음.바켜짐);
재기('⚠ 크기 바가 **바닥 위**에 있나(아래 변 끌 때 손가락에 안 가리게)',
     처음.바아래 <= Math.round(처음.바닥왼 >= 0 ? 처음.바닥높 + 1e9 : 0) || 처음.바위 < 처음.바닥아래 - 처음.바닥높,
     '바 ' + 처음.바위 + '~' + 처음.바아래 + ' · 바닥 위끝 ' + Math.round(처음.바닥아래 - 처음.바닥높));

/* ══ 가로 변을 잡아 늘린다 ═══════════════════════════════════════════ */
/* ⚠ 1:1 은 **막히지 않는 기계**로 재야 보인다. 패널쏘는 오른쪽 보링기(5,000)에
   4,600mm 에서 막힌다 — 거기서 재면 1:1 이 아니라 막힘을 재는 꼴이 된다.
   작업대(400,6200)는 오른쪽이 집진기(8,200)까지 비어 5,400mm 여유가 있다. */
const 끈px = 40;
const 잡기 = await 변끌기('m5', '가로', 끈px, 0);     // 작업대
재기('손잡이를 **짚기만 해도** 크기 바가 뜨나',
     잡기.짚자마자.바켜짐 && 잡기.짚자마자.바누구 === '작업대' && 잡기.짚자마자.바축 === '가로',
     잡기.짚자마자.바누구 + ' · ' + 잡기.짚자마자.바축 + ' · ' + 잡기.짚자마자.바값);
재기('짚었을 때 지금 크기가 미터로 뜨나(2,400 → 2.4)', 잡기.짚자마자.바값 === '2.4', 잡기.짚자마자.바값);
재기('⚠ **끄는 도중에 수가 살아서 바뀌나**',
     잡기.도중.바값 !== '2.4' && Number(잡기.도중.바값) > 2.4,
     '2.4 → 끄는 중 ' + 잡기.도중.바값 + ' → 뗄 때 ' + 잡기.떼기전.바값);
const 뒤 = await 봄();
const 바란가로 = Math.round((2400 + 끈px / 배율) / 눈금) * 눈금;
재기('⚠ 변 끌기가 1:1 인가 (끈 px × 26.7mm)',
     Math.abs(Number(뒤.바값) * 1000 - 바란가로) <= 눈금,
     '끈 ' + 끈px + 'px → ' + (Number(뒤.바값) * 1000) + 'mm / 바란 ' + 바란가로 + 'mm');
재기('⚠ 늘려도 **놓인 자리(x·y)는 그대로**인가', /작업대 400,6200 /.test(뒤.담김.기계),
     뒤.담김.기계.split(' · ').find(x => /작업대/.test(x)));
재기('늘린 것이 담기나', new RegExp('작업대 400,6200 ' + 바란가로 + 'x1200').test(뒤.담김.기계),
     뒤.담김.기계.split(' · ').find(x => /작업대/.test(x)));
await p.screenshot({ path: path.join(그림칸, '375-변끈뒤.png') });

/* ══ 끄는 도중 그림 — 수가 보이는 모습 ═══════════════════════════════ */
await 깨끗이();
const 점2 = await 손잡이점('m5', '가로');
await p.mouse.move(점2.x, 점2.y);
await p.mouse.down();
for (let i = 1; i <= 6; i++) { await p.mouse.move(점2.x + 50 * i / 6, 점2.y); await p.waitForTimeout(30); }
await p.screenshot({ path: path.join(그림칸, '375-변끄는중.png') });
const 끄는중 = await 봄();
await p.mouse.up(); await p.waitForTimeout(250);
재기('끄는 도중 그림에 수가 떠 있나', 끄는중.바켜짐 && Number(끄는중.바값) > 2.4,
     끄는중.바누구 + ' ' + 끄는중.바축 + ' ' + 끄는중.바값 + ' m');
const 끄는중딱지 = 끄는중.기계px.find(x => /작업대/.test(x));
재기('끄는 도중 기계 딱지도 바와 같은 수를 보이나(안 어긋나나)',
     await p.evaluate(() => {
         const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === '작업대');
         return el.querySelector('.lsz').textContent;
     }) === 끄는중.바값 + '×1.2m',
     '딱지 ' + await p.evaluate(() => {
         const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === '작업대');
         return el.querySelector('.lsz').textContent;
     }) + ' · 바 ' + 끄는중.바값);

/* ══ 벽·다른 기계 앞에서 선다 ════════════════════════════════════════ */
await 깨끗이();
await 변끌기('m1', '가로', 300, 0, 12);          // 패널쏘를 보링기(5,000) 쪽으로
const 막힘 = await 봄();
재기('막힘 뒤에 담긴 것이 있나', !!막힘.담김, 막힘.담김 ? '있음' : '없음');
재기('키울 때 다른 기계 앞에서 서나 (보링기 왼끝 5,000 → 가로 4,600)',
     /패널쏘 400,400 4600x3300/.test(막힘.담김.기계), 막힘.담김.기계.split(' · ')[0]);
재기('왜 섰는지 알림줄에 적히나', /벽이나 다른 기계에 닿아 더는 안 됩니다/.test(막힘.쪽지), 막힘.쪽지);
const 겹친것 = await p.evaluate(k => {
    const ms = JSON.parse(localStorage.getItem(k))['기계들']; const 것 = [];
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
        const a = ms[i], c = ms[j];
        if (a.x < c.x + c['가로'] && c.x < a.x + a['가로'] && a.y < c.y + c['세로'] && c.y < a.y + a['세로'])
            것.push(a['이름'] + ' ↔ ' + c['이름']);
    } return 것;
}, 폰열쇠);
재기('늘려도 기계끼리 안 겹치나', 겹친것.length === 0, 겹친것.join(' | ') || '없음');

/* ══ 「맞춤」 — 정확한 수치 입력 ═════════════════════════════════════ */
await 깨끗이();
/* ⚠ 여유가 있는 자리로 재야 「맞춤」 이 보인다. 집진기 세로는 아래 벽까지 1,800mm
   뿐이라 2.25 m 는 막히는 것이 맞다. 보링기 가로는 오른쪽이 비어 5,000mm 여유다. */
const 점3 = await 손잡이점('m2', '가로');          // 보링기
await p.mouse.move(점3.x, 점3.y); await p.mouse.down(); await p.waitForTimeout(80); await p.mouse.up();
await p.waitForTimeout(250);
const 짚기만 = await 봄();
재기('안 끌고 짚기만 해도 바가 떠 수만 넣으실 수 있나',
     짚기만.바켜짐 && 짚기만.바누구 === '보링기' && 짚기만.바값 === '2.4', 짚기만.바값);
await p.fill('#l-b2val', '3.5');
await p.click('#l-b2ok');
await p.waitForTimeout(350);
const 맞춤 = await 봄();
재기('정확한 수(3.5 m)를 넣어 맞출 수 있나',
     /보링기 5000,600 3500x1600/.test(맞춤.담김.기계),
     맞춤.담김.기계.split(' · ').find(x => /보링기/.test(x)));
재기('맞춤해도 놓인 자리는 그대로인가', /보링기 5000,600 /.test(맞춤.담김.기계));

/* ══ 공장 바닥도 마찬가지 ════════════════════════════════════════════ */
await 깨끗이();
const 바닥끌 = await 변끌기('바닥', '가로', 30, 0);
재기('바닥 변을 잡으면 크기 바에 「공장 바닥」 이 뜨나',
     바닥끌.짚자마자.바누구 === '공장 바닥' && 바닥끌.짚자마자.바값 === '10',
     바닥끌.짚자마자.바누구 + ' ' + 바닥끌.짚자마자.바축 + ' ' + 바닥끌.짚자마자.바값);
const 바닥뒤 = await 봄();
재기('바닥 변을 끌면 바닥이 커지나', 바닥뒤.담김.바닥['가로'] > 10000,
     바닥뒤.담김.바닥['가로'] + '×' + 바닥뒤.담김.바닥['세로'] + ' mm');
재기('⚠ 바닥을 늘려도 기계의 참 자리(mm)는 한 톨도 안 바뀌나',
     바닥뒤.담김.기계 === '패널쏘 400,400 3800x3300 · 보링기 5000,600 2400x1600'
       + ' · 멤브레인프레스 5600,2400 3600x1800 · 엣지밴더 400,4200 6000x1500'
       + ' · 작업대 400,6200 2400x1200 · 집진기 8200,6200 1500x1500', 바닥뒤.담김.기계);
await p.fill('#l-b2val', '12'); await p.click('#l-b2ok'); await p.waitForTimeout(350);
const 바닥맞춤 = await 봄();
재기('바닥도 정확한 수(12 m)로 맞출 수 있나', 바닥맞춤.담김.바닥['가로'] === 12000,
     바닥맞춤.담김.바닥['가로'] + 'mm');
await 변끌기('바닥', '가로', -400, 0, 10);
재기('바닥을 줄일 때 기계가 차 있는 데(9,700)에서 서나',
     (await 봄()).담김.바닥['가로'] === 9700, (await 봄()).담김.바닥['가로'] + 'mm');

/* ══ ⚠ 돌린 채로 — 손잡이가 따라 도나 · 기계가 안 움직이나 ═══════════ */
await 깨끗이();
await p.click('#l-turn'); await p.waitForTimeout(400);
const 돌린판 = await 봄();
재기('돌리면 가로 손잡이가 **아래**로 · 세로 손잡이가 **왼쪽**으로 가나',
     돌린판.손잡이.every(h => h.쪽 === (h.축 === '가로' ? '아래' : '왼')),
     돌린판.손잡이.slice(0, 2).map(h => h.축 + '→' + h.쪽).join(' · '));
재기('⚠ 돌려도 바닥 손잡이가 화면 안에 있나(비우는 쪽도 같이 도나)',
     돌린판.손잡이.filter(h => h.누구 === '바닥').every(h => h.왼 >= -0.5 && h.오른 <= 돌린판.화면폭 + 0.5),
     '바닥손잡이 왼끝 ' + Math.round(Math.min(...돌린판.손잡이.filter(h => h.누구 === '바닥').map(h => h.왼)))
     + ' · 오른끝 ' + Math.round(Math.max(...돌린판.손잡이.filter(h => h.누구 === '바닥').map(h => h.오른)))
     + ' / 화면 ' + 돌린판.화면폭);
재기('돌려도 가로 넘침이 없나', !돌린판.넘친가로);
const 돌배율 = 돌린판.바닥높 / 10000;
const 돌끌 = await 변끌기('m2', '가로', 0, 40);     // 보링기 — 오른쪽이 비어 안 막힌다
재기('돌린 채로 가로 손잡이를 잡을 수 있나', !돌끌.못잡음, 돌끌.못잡음 || '잡힘');
const 돌뒤 = await 봄();
const 돌바란 = Math.round((2400 + 40 / 돌배율) / 눈금) * 눈금;
재기('⚠ 돌린 채로도 변 끌기가 1:1 인가',
     Math.abs(Number(돌뒤.바값) * 1000 - 돌바란) <= 눈금 * 2,
     '끈 40px → ' + (Number(돌뒤.바값) * 1000) + 'mm / 바란 ' + 돌바란 + 'mm');
재기('⚠ 돌린 채로 늘려도 기계가 **안 움직이나**', /보링기 5000,600 /.test(돌뒤.담김.기계),
     돌뒤.담김.기계.split(' · ').find(x => /보링기/.test(x)));
const 돌세로 = await 변끌기('m5', '세로', -30, 0);  // 작업대 — 아래가 비어 안 막힌다
재기('돌린 채로 세로 손잡이(화면 왼쪽)도 잡히나', !돌세로.못잡음, 돌세로.못잡음 || '잡힘');
const 돌세로뒤 = await 봄();
재기('⚠ 돌린 채로 세로를 늘려도 기계가 안 움직이나', /작업대 400,6200 /.test(돌세로뒤.담김.기계),
     돌세로뒤.담김.기계.split(' · ').find(x => /작업대/.test(x)));
재기('돌린 채로 세로를 왼쪽으로 끌면 커지나',
     Number(돌세로뒤.바값) > 1.2, '1.2 → ' + 돌세로뒤.바값 + ' m');
await p.screenshot({ path: path.join(그림칸, '375-돌려서변잡기.png') });
await p.click('#l-turn'); await p.waitForTimeout(300);

/* ══ 몸통 끌기가 안 깨졌나 ═══════════════════════════════════════════ */
await 깨끗이();
const 몸통 = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === '집진기');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width * 0.3, y: r.top + r.height * 0.3, 왼: r.left, 위: r.top };
});
await p.mouse.move(몸통.x, 몸통.y);
await p.mouse.down(); await p.waitForTimeout(80);
for (let i = 1; i <= 8; i++) { await p.mouse.move(몸통.x - 40 * i / 8, 몸통.y - 60 * i / 8); await p.waitForTimeout(25); }
await p.mouse.up(); await p.waitForTimeout(300);
const 몸통뒤 = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === '집진기');
    const r = el.getBoundingClientRect();
    return { 왼: r.left, 위: r.top };
});
재기('⚠ 손잡이를 넣은 뒤에도 몸통 끌기가 1:1 인가',
     Math.abs(몸통뒤.왼 - 몸통.왼 + 40) < 2 && Math.abs(몸통뒤.위 - 몸통.위 + 60) < 2,
     '끈 px -40,-60 → 움직인 px ' + (몸통뒤.왼 - 몸통.왼).toFixed(1) + ',' + (몸통뒤.위 - 몸통.위).toFixed(1));
const 몸통담김 = (await 봄()).담김;
재기('몸통을 끌어도 크기는 안 바뀌나', /집진기 \d+,\d+ 1500x1500/.test(몸통담김.기계),
     몸통담김.기계.split(' · ').pop());

/* ══ 다시 열어도 그대로 ══════════════════════════════════════════════ */
await 변끌기('m2', '가로', 25, 0);
await p.waitForTimeout(1500);
const 닫기전 = await 봄();
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
const 열고 = await 봄();
재기('다시 열어도 바꾼 크기가 그대로인가', 열고.담김.기계 === 닫기전.담김.기계, 열고.담김.기계);
재기('다시 열어도 손잡이가 다 있나', 열고.손잡이.length === 14, 열고.손잡이.length + '개');
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

await b.close();
const 실패 = 잰것.filter(t => !t.됐나);
console.log(`\n초록 ${잰것.length - 실패.length} · 빨강 ${실패.length} · 건너뜀 0 (잰 것 모두 ${잰것.length})`);
if (!잰것.length) { console.log('잰 것이 하나도 없습니다 — 초록이 아닙니다'); process.exit(1); }
if (실패.length) console.log('빨강:\n' + 실패.map(t => '  ✗ ' + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : '')).join('\n'));
process.exit(실패.length ? 1 : 0);
