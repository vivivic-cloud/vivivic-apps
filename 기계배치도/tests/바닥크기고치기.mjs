/* 기계배치도 — **바닥 크기 고치기**와 **기준 보드판**을 재는 시험.
       node 기계배치도/tests/바닥크기고치기.mjs

   사장님 말씀 둘 (장부에서 확인함)
     a1791279510 · 10-06 09:38:30 UTC
       「현장 바닥을 선택하여 가로 세로 길이를 각각 조절 할 수 있게 해주세요.
         이는 현재 배치된 기계에도 적용해 주세요.」
     a1791279590 · 10-06 09:39:50 UTC
       「모든 배치의 기준이 되는 2440*1220mm 사이즈의 보드판이 공장바닥의
         세팅 비율에 맞게 존재하게 해주세요」

   ⚠ page.mouse 로 진짜 누른다. 값만 보지 않고 화면에 보이나까지 잰다. */
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
const 폰열쇠 = 'layout.배치.v2';
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
await 본보기깔기(ctx);   // 옛 시험통에는 10,000×8,000 본보기를 깔아 준다
const p = await ctx.newPage();
const 터짐 = []; p.on('pageerror', e => 터짐.push(String(e.message || e)));

const 봄 = () => p.evaluate(() => {
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const 단 = document.getElementById('l-floor-size');
    const dr = 단.getBoundingClientRect();
    const 넓힘 = Math.abs(parseFloat(getComputedStyle(단, '::after').top) || 0);
    const 옆넓힘 = Math.abs(parseFloat(getComputedStyle(단, '::after').left) || 0);
    const bd = document.querySelector('.lboard');
    const br = bd ? bd.getBoundingClientRect() : null;
    const 판 = document.getElementById('l-size-sheet');
    const 담김 = JSON.parse(localStorage.getItem('layout.배치.v2') || 'null');
    return {
        바닥폭: Math.round(f.width), 바닥높: Math.round(f.height), 바닥왼: f.left, 바닥위: f.top,
        크기글: 단.textContent.replace(/\s+/g, ' ').trim(),
        크기닿는높: Math.round(dr.height + 넓힘 * 2), 크기닿는폭: Math.round(dr.width + 옆넓힘 * 2),
        판열림: !판.hidden,
        보드있나: !!bd,
        보드폭: br ? Math.round(br.width) : 0, 보드높: br ? Math.round(br.height) : 0,
        보드왼: br ? br.left : 0, 보드위: br ? br.top : 0,
        보드글: bd ? bd.querySelector('.lbnm').textContent : '',
        보드손가락: bd ? getComputedStyle(bd).pointerEvents : '',
        넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
        화면폭: window.innerWidth, 화면높: window.innerHeight,
        바닥담김: 담김 ? 담김['바닥'] : null,
        기계담김: 담김 ? (담김['기계들'] || []).map(m => m['이름'] + ' ' + m.x + ',' + m.y).join(' · ') : null,
        쪽지: document.getElementById('l-note').textContent,
        판쪽지: document.getElementById('l-size-msg').textContent,
        기계수: document.querySelectorAll('.lmc').length,
    };
});
/* 막혀서 판을 열어 둔 채일 수도 있다 — 그때는 다시 열지 않고 값만 갈아 끼운다 */
async function 크기넣기(가로, 세로) {
    if (await p.evaluate(() => document.getElementById('l-size-sheet').hidden)) {
        await p.click('#l-floor-size');
        await p.waitForTimeout(250);
    }
    await p.fill('#l-w', String(가로));
    await p.fill('#l-h', String(세로));
    await p.click('#l-size-ok');
    await p.waitForTimeout(350);
}
const 깨끗이 = async () => {
    await p.evaluate(k => localStorage.removeItem(k), 폰열쇠);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(450);
};
await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();
const 처음 = await 봄();

/* ══ 보드판 (사장님 말씀 ㄴ) ═════════════════════════════════════════ */
재기('기준 보드판이 바닥에 있나', 처음.보드있나);
재기('보드판에 2.44×1.22m 가 미터로 적혀 있나',
     /2\.44\s*×\s*1\.22/.test(처음.보드글), 처음.보드글);
재기('보드판이 바닥과 **같은 자**로 그려지나 (2440×1220 비율)',
     Math.abs(처음.보드폭 / 처음.바닥폭 - 2440 / 10000) < 0.01
     && Math.abs(처음.보드높 / 처음.바닥높 - 1220 / 8000) < 0.01,
     '보드 ' + 처음.보드폭 + '×' + 처음.보드높 + 'px · 바닥 ' + 처음.바닥폭 + '×' + 처음.바닥높 + 'px'
     + ' → 바닥의 ' + (100 * 처음.보드폭 / 처음.바닥폭).toFixed(1) + '% × '
     + (100 * 처음.보드높 / 처음.바닥높).toFixed(1) + '% (바란 24.4% × 15.3%)');
재기('보드판이 손가락을 안 받나(기계 끄는 것을 안 막나)',
     처음.보드손가락 === 'none', 처음.보드손가락);
/* 기계를 가리면 못 쓴다 — 빈 자리에 놓였나를 잰다 */
const 겹침 = await p.evaluate(() => {
    const b = document.querySelector('.lboard').getBoundingClientRect();
    return [...document.querySelectorAll('.lmc')].filter(el => {
        const r = el.getBoundingClientRect();
        return b.left < r.right - 1 && r.left < b.right - 1 && b.top < r.bottom - 1 && r.top < b.bottom - 1;
    }).map(el => el.querySelector('.lnm').textContent);
});
재기('보드판이 기계를 안 가리나(빈 자리에 놓이나)', 겹침.length === 0, 겹침.join(' · ') || '겹친 기계 없음');
재기('보드판이 바닥 안에 들어 있나',
     처음.보드왼 >= 처음.바닥왼 - 1 && 처음.보드위 >= 처음.바닥위 - 1
     && 처음.보드왼 + 처음.보드폭 <= 처음.바닥왼 + 처음.바닥폭 + 1
     && 처음.보드위 + 처음.보드높 <= 처음.바닥위 + 처음.바닥높 + 1);

/* ══ 폰에 **이미 담겨 있던 옛 값(mm)** 이 미터로 바로 보이나 ══════════
   사장님 폰에는 미터로 바꾸기 전에 담긴 것이 있다. 안엣셈은 mm 그대로 두었으니
   10,000 이 담겨 있어도 10 m 로 떠야 한다 — 10,000 m 로 뜨면 큰일이다. */
await p.evaluate(([k, 것]) => localStorage.setItem(k, JSON.stringify(것)), [폰열쇠, {
    바닥: { 가로: 10000, 세로: 8000 }, 잰때: Date.now(),
    기계들: [{ id: 'm1', 이름: '패널쏘', 가로: 3800, 세로: 3300, x: 400, y: 400 },
             { id: 'm6', 이름: '집진기', 가로: 1500, 세로: 1500, x: 8200, y: 6200 }],
}]);
await p.goto(주소, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(450);
const 옛것 = await 봄();
재기('옛 값(mm 로 담긴 10,000×8,000)이 10 × 8 m 로 보이나',
     /(^|[^\d])10 × 8 m/.test(옛것.크기글) && !/10,000/.test(옛것.크기글), 옛것.크기글);
재기('옛 값이 담긴 것은 mm 그대로인가(갈아엎지 않았나)',
     옛것.바닥담김['가로'] === 10000 && 옛것.바닥담김['세로'] === 8000,
     JSON.stringify(옛것.바닥담김));
const 옛칸 = await p.evaluate(async () => {
    document.getElementById('l-floor-size').click();
    await new Promise(r => setTimeout(r, 200));
    const v = [document.getElementById('l-w').value, document.getElementById('l-h').value];
    document.getElementById('l-size-no').click();
    return v;
});
재기('옛 값을 열면 칸에도 미터로(10 · 8) 들어오나',
     옛칸[0] === '10' && 옛칸[1] === '8', 옛칸.join(' · '));
const 옛딱지 = await p.evaluate(() => [...document.querySelectorAll('.lmc')]
    .map(e => e.querySelector('.lnm').textContent + ' ' + e.querySelector('.lsz').textContent));
재기('옛 값의 기계 딱지도 미터로 보이나(3,800 → 3.8)',
     옛딱지.some(t => /패널쏘 3\.8×3\.3m/.test(t)), 옛딱지.join(' · '));
await 깨끗이();

/* ══ 크기 단추 (사장님 말씀 ㄱ) ═══════════════════════════════════════ */
재기('바닥 크기가 누를 수 있는 단추인가(미터로)', /10 × 8 m/.test(처음.크기글), 처음.크기글);
재기('크기 단추 닿는 자리가 44px 이상인가',
     처음.크기닿는높 >= 44 && 처음.크기닿는폭 >= 44,
     처음.크기닿는폭 + '×' + 처음.크기닿는높 + 'px');
await p.click('#l-floor-size');
await p.waitForTimeout(300);
const 판 = await p.evaluate(() => {
    const s = document.getElementById('l-size-sheet');
    const c = s.querySelector('.lcard').getBoundingClientRect();
    const 칸 = [...s.querySelectorAll('input')].map(i => {
        const r = i.getBoundingClientRect();
        return { id: i.id, 높이: Math.round(r.height), 값: i.value,
                 글씨: parseFloat(getComputedStyle(i).fontSize), 갈래: i.inputMode };
    });
    const 단 = [...s.querySelectorAll('.lcbtn')].map(x =>
        ({ 글: x.textContent.trim(), 높이: Math.round(x.getBoundingClientRect().height) }));
    return { 떴나: !s.hidden, 칸, 단, 왼: Math.round(c.left), 오른: Math.round(c.right),
             아래: Math.round(c.bottom), 폭: window.innerWidth, 높이: window.innerHeight };
});
재기('크기를 누르면 넣는 판이 뜨나', 판.떴나);
재기('가로·세로 칸이 둘 다 있고 지금 값이 들어 있나',
     판.칸.length === 2 && 판.칸[0].값 === '10' && 판.칸[1].값 === '8',
     판.칸.map(c => c.id + '=' + c.값).join(' · '));
재기('칸이 48px 이상이고 글씨가 16px 이상인가(아이폰이 화면을 안 키우게)',
     판.칸.every(c => c.높이 >= 44 && c.글씨 >= 16),
     판.칸.map(c => c.높이 + 'px/' + c.글씨 + 'px').join(' · '));
재기('칸이 숫자 자판을 올리나(소수가 들어오니 decimal)', 판.칸.every(c => c.갈래 === 'decimal'),
     판.칸.map(c => c.갈래).join(','));
재기('그만·넣기 단추가 44px 이상인가', 판.단.length === 2 && 판.단.every(x => x.높이 >= 44),
     판.단.map(x => x.글 + ' ' + x.높이 + 'px').join(' · '));
재기('판이 375 안에 네 변 다 들어오나',
     판.왼 >= 0 && 판.오른 <= 판.폭 && 판.아래 <= 판.높이 + 1,
     판.왼 + '~' + 판.오른 + ' / ' + 판.폭 + ' · 아래 ' + 판.아래 + '/' + 판.높이);
await p.screenshot({ path: path.join(그림칸, '375-바닥크기판.png') });
await p.click('#l-size-no');
await p.waitForTimeout(250);
재기('그만을 누르면 판이 닫히나', !(await 봄()).판열림);

/* ══ 늘리기 — 기계 mm 자리는 한 톨도 안 바뀐다 ═══════════════════════ */
/* 처음 배치 그대로. 바닥을 어떻게 바꾸든 이 줄이 한 글자도 안 바뀌어야 한다 */
const 기준기계 = '패널쏘 400,400 · 보링기 5000,600 · 멤브레인프레스 5600,2400'
              + ' · 엣지밴더 400,4200 · 작업대 400,6200 · 집진기 8200,6200';
await 크기넣기(16, 12);
const 늘림 = await 봄();
재기('바닥을 늘릴 수 있나 (16,000 × 12,000)',
     늘림.바닥담김['가로'] === 16000 && 늘림.바닥담김['세로'] === 12000,
     늘림.바닥담김['가로'] + '×' + 늘림.바닥담김['세로']);
재기('늘려도 비가 맞게 그려지나 (12000/16000 = 0.75)',
     Math.abs(늘림.바닥높 / 늘림.바닥폭 - 0.75) < 0.012,
     늘림.바닥폭 + '×' + 늘림.바닥높 + ' = ' + (늘림.바닥높 / 늘림.바닥폭).toFixed(3));
재기('⚠ 늘려도 기계의 참 자리(mm)가 한 톨도 안 바뀌나',
     늘림.기계담김 === 기준기계, 늘림.기계담김);
재기('늘리면 보드판도 같은 자로 작아져 보이나 (바닥의 15.3%)',
     Math.abs(늘림.보드폭 / 늘림.바닥폭 - 2440 / 16000) < 0.01,
     '보드 ' + 늘림.보드폭 + 'px = 바닥의 ' + (100 * 늘림.보드폭 / 늘림.바닥폭).toFixed(1) + '% (바란 15.3%)');
재기('늘려도 가로 넘침이 없나', !늘림.넘친가로);
/* 바닥을 키우면 보드가 작아진다 — 그때 이름표가 삐져나가 기계를 덮으면 안 된다 */
const 이름표 = await p.evaluate(() => {
    const bd = document.querySelector('.lboard'), nm = bd.querySelector('.lbnm');
    const b = bd.getBoundingClientRect();
    const 덮은것 = [...document.querySelectorAll('.lmc')].filter(el => {
        const r = el.getBoundingClientRect();
        return b.left < r.right - 1 && r.left < b.right - 1 && b.top < r.bottom - 1 && r.top < b.bottom - 1;
    }).map(el => el.querySelector('.lnm').textContent);
    const n = nm.getBoundingClientRect();
    return { 글: getComputedStyle(nm).display === 'none' ? '(뗐음)' : nm.textContent,
             이름폭: Math.round(n.width), 보드폭: Math.round(b.width),
             삐짐: getComputedStyle(nm).display !== 'none' && n.right > b.right + 1,
             덮은것 };
});
재기('바닥을 키워 보드가 작아져도 이름표가 밖으로 안 삐져나가나',
     !이름표.삐짐, '이름표 「' + 이름표.글 + '」 ' + 이름표.이름폭 + 'px / 보드 ' + 이름표.보드폭 + 'px');
재기('바닥을 키워도 보드판이 기계를 안 덮나', 이름표.덮은것.length === 0,
     이름표.덮은것.join(' · ') || '덮은 기계 없음');
재기('늘린 것이 머리에 적히나', /16 × 12 m/.test(늘림.크기글), 늘림.크기글);
await p.screenshot({ path: path.join(그림칸, '375-바닥늘림.png') });

/* ══ 줄이기 — 기계에 안 막히는 데까지 ════════════════════════════════ */
/* 기계가 9,700 × 7,700 까지 차 있다. 그보다 위로 줄이는 것은 걸릴 데가 없다 */
await 크기넣기(9.8, 7.8);
const 줄임 = await 봄();
재기('바닥을 줄일 수 있나 (9,800 × 7,800)',
     줄임.바닥담김['가로'] === 9800 && 줄임.바닥담김['세로'] === 7800,
     줄임.바닥담김['가로'] + '×' + 줄임.바닥담김['세로']);
재기('줄인 뒤 판이 닫히나(막힌 것이 아니므로)', !줄임.판열림);
재기('⚠ 줄여도 기계의 참 자리(mm)가 한 톨도 안 바뀌나',
     줄임.기계담김 === 기준기계, 줄임.기계담김);
재기('기계 여섯 대가 그대로 그려지나', 줄임.기계수 === 6, 줄임.기계수 + '대');
await p.screenshot({ path: path.join(그림칸, '375-바닥줄임.png') });

/* ══ 기계가 막는 데보다 더 줄이려 하면 — 기계 앞에서 선다 ════════════
   처음 배치의 기계 끝: 가로 9,700(집진기 8200+1500) · 세로 7,700(집진기 6200+1500) */
await 크기넣기(3, 3);
const 막힘 = await 봄();
재기('기계가 차 있는 데까지만 줄어드나 (9,700 × 7,700 에서 섬)',
     막힘.바닥담김['가로'] === 9700 && 막힘.바닥담김['세로'] === 7700,
     막힘.바닥담김['가로'] + '×' + 막힘.바닥담김['세로'] + ' / 기계 끝 9700,7700');
재기('⚠ 막혀도 기계의 참 자리(mm)가 한 톨도 안 바뀌나',
     막힘.기계담김 === 기준기계, 막힘.기계담김);
재기('왜 거기서 멈췄는지 판에 적히나',
     /기계가 거기까지 차 있어/.test(막힘.판쪽지), 막힘.판쪽지);
재기('왜 거기서 멈췄는지 알림줄에도 적히나',
     /기계에 막혀 더는 안 줄었습니다/.test(막힘.쪽지), 막힘.쪽지);
재기('막혔을 때는 판을 열어 둬 사장님이 까닭을 보시나', 막힘.판열림);
await p.screenshot({ path: path.join(그림칸, '375-바닥막힘.png') });
await p.click('#l-size-no');
await p.waitForTimeout(200);

/* ══ 터무니없는 값은 안 받는다 ═══════════════════════════════════════ */
for (const [w, h, 왜, 바란말] of [[0, 8, '0', /사이로 넣어 주십시오/],
        [-5, 8, '음수', /사이로 넣어 주십시오/], [0.5, 8, '너무 작음', /사이로 넣어 주십시오/],
        ['', 8, '빈 칸', /사이로 넣어 주십시오/], [300, 8, '너무 큼', /사이로 넣어 주십시오/],
        [10000, 8, 'mm 로 넣으심', /미터로 넣어 주십시오 — 10,000 mm 는 10 m 입니다/],
        [3800, 8, 'mm 로 넣으심(3800)', /3,800 mm 는 3.8 m 입니다/]]) {
    const 전 = (await 봄()).바닥담김;
    await 크기넣기(w, h);
    const 후 = await 봄();
    재기('터무니없는 값(' + 왜 + ')은 안 받고 바닥이 그대로인가',
         후.바닥담김['가로'] === 전['가로'] && 후.바닥담김['세로'] === 전['세로']
         && 바란말.test(후.판쪽지),
         후.바닥담김['가로'] + '×' + 후.바닥담김['세로'] + ' · ' + 후.판쪽지);
    await p.click('#l-size-no');
    await p.waitForTimeout(150);
}

/* ══ 다시 열어도 바뀐 바닥이 그대로인가 ══════════════════════════════ */
await 크기넣기(12, 9);
await p.waitForTimeout(1500);
const 닫기전 = await 봄();
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
const 열고 = await 봄();
재기('다시 열어도 바꾼 바닥 크기가 그대로인가',
     열고.바닥담김['가로'] === 12000 && 열고.바닥담김['세로'] === 9000,
     열고.바닥담김['가로'] + '×' + 열고.바닥담김['세로']);
재기('다시 열어도 기계 자리(mm)가 그대로인가', 열고.기계담김 === 닫기전.기계담김);
재기('다시 열어도 보드판이 바른 자로 있나',
     열고.보드있나 && Math.abs(열고.보드폭 / 열고.바닥폭 - 2440 / 12000) < 0.012,
     '보드 ' + 열고.보드폭 + 'px = 바닥의 ' + (100 * 열고.보드폭 / 열고.바닥폭).toFixed(1)
     + '% (바란 20.3%) · 이름표 「' + 열고.보드글 + '」');

/* ══ 돌려도 보드판과 바닥 고치기가 그대로 되나 ═══════════════════════ */
await p.click('#l-turn');
await p.waitForTimeout(400);
const 돌림 = await 봄();
/* 돌리면 보드도 같이 돈다 — 화면 가로에는 보드의 1,220 쪽이, 세로에는 2,440 쪽이 온다.
   바닥도 마찬가지로 화면 가로가 9,000 쪽, 세로가 12,000 쪽이다. */
재기('돌려도 보드판이 바닥과 같은 자로 그려지나 (보드도 같이 돈다)',
     Math.abs(돌림.보드폭 / 돌림.바닥폭 - 1220 / 9000) < 0.012
     && Math.abs(돌림.보드높 / 돌림.바닥높 - 2440 / 12000) < 0.012,
     '보드 ' + 돌림.보드폭 + '×' + 돌림.보드높 + ' · 바닥 ' + 돌림.바닥폭 + '×' + 돌림.바닥높
     + ' → ' + (100 * 돌림.보드폭 / 돌림.바닥폭).toFixed(1) + '% × '
     + (100 * 돌림.보드높 / 돌림.바닥높).toFixed(1) + '% (바란 13.6% × 20.3%)');
await 크기넣기(14, 10);
const 돌려고침 = await 봄();
재기('돌린 채로도 바닥 크기를 고칠 수 있나',
     돌려고침.바닥담김['가로'] === 14000 && 돌려고침.바닥담김['세로'] === 10000,
     돌려고침.바닥담김['가로'] + '×' + 돌려고침.바닥담김['세로']);
재기('돌린 채로 고쳐도 기계 자리(mm)가 그대로인가', 돌려고침.기계담김 === 닫기전.기계담김);
재기('돌린 채로도 가로 넘침이 없나', !돌려고침.넘친가로);
await p.screenshot({ path: path.join(그림칸, '375-돌려서바닥고침.png') });
await p.click('#l-turn');
await p.waitForTimeout(300);

/* ══ 고친 뒤에도 끌기가 그대로 되나 ══════════════════════════════════ */
const 끌기전 = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === '집진기');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, 왼: r.left, 위: r.top };
});
await p.mouse.move(끌기전.x, 끌기전.y);
await p.mouse.down();
for (let i = 1; i <= 8; i++) { await p.mouse.move(끌기전.x - 30 * i / 8, 끌기전.y - 40 * i / 8); await p.waitForTimeout(25); }
await p.mouse.up();
await p.waitForTimeout(300);
const 끌고 = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === '집진기');
    const r = el.getBoundingClientRect();
    return { 왼: r.left, 위: r.top };
});
재기('바닥 크기를 고친 뒤에도 끌기가 1:1 인가',
     Math.abs(끌고.왼 - 끌기전.왼 + 30) < 2 && Math.abs(끌고.위 - 끌기전.위 + 40) < 2,
     '끈 px -30,-40 → 움직인 px ' + (끌고.왼 - 끌기전.왼).toFixed(1) + ',' + (끌고.위 - 끌기전.위).toFixed(1));
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

/* ══ 가장 좁은 화면 × 가장 긴 크기 글 ═══════════════════════════════
   두 손가락으로 벌려 320 까지 좁아진 화면에 「200,000 × 200,000 mm」 를 넣어도
   가로로 삐져나가거나 글이 깎이면 안 된다. */
const 좁은통 = await b.newContext({ viewport: { width: 320, height: 480 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
await 좁은통.route('**/firebasejs/**', r => r.abort());
await 본보기깔기(좁은통);   // 옛 시험통에는 10,000×8,000 본보기를 깔아 준다
const p2 = await 좁은통.newPage();
await p2.goto(주소, { waitUntil: 'domcontentloaded' });
await p2.waitForTimeout(450);
await p2.click('#l-floor-size'); await p2.waitForTimeout(250);
await p2.fill('#l-w', '200'); await p2.fill('#l-h', '200');
await p2.click('#l-size-ok'); await p2.waitForTimeout(400);
const 좁은것 = await p2.evaluate(() => {
    const 단 = document.getElementById('l-floor-size');
    const r = document.createRange(); r.selectNodeContents(단);
    const 글폭 = r.getBoundingClientRect().width;
    const f = document.getElementById('l-floor').getBoundingClientRect();
    return { 넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
             글: 단.textContent.replace(/\s+/g, ' ').trim(),
             깎임: 글폭 > 단.clientWidth + 1, 글폭: Math.round(글폭), 칸: 단.clientWidth,
             머리높: Math.round(document.querySelector('.lhead').getBoundingClientRect().height),
             바닥: Math.round(f.width) + '×' + Math.round(f.height),
             아래: Math.round(Math.max(...[...document.querySelectorAll('.lwrap, .lbar')]
                   .map(e => e.getBoundingClientRect().bottom))), 높이: window.innerHeight };
});
재기('320 에 가장 긴 크기 글을 넣어도 가로로 안 삐져나가나',
     !좁은것.넘친가로, 좁은것.글 + ' · 머리 높이 ' + 좁은것.머리높 + 'px');
재기('320 에 가장 긴 크기 글을 넣어도 글이 안 깎이나',
     !좁은것.깎임, '글 ' + 좁은것.글폭 + ' / 칸 ' + 좁은것.칸);
재기('320 에서 아래로도 안 잘리나', 좁은것.아래 <= 좁은것.높이,
     '맨아래 ' + 좁은것.아래 + '/' + 좁은것.높이 + ' · 바닥 ' + 좁은것.바닥);
await p2.screenshot({ path: path.join(그림칸, '320-큰바닥.png') });
await 좁은통.close();

await b.close();
const 실패 = 잰것.filter(t => !t.됐나);
console.log(`\n초록 ${잰것.length - 실패.length} · 빨강 ${실패.length} · 건너뜀 0 (잰 것 모두 ${잰것.length})`);
if (!잰것.length) { console.log('잰 것이 하나도 없습니다 — 초록이 아닙니다'); process.exit(1); }
if (실패.length) console.log('빨강:\n' + 실패.map(t => '  ✗ ' + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : '')).join('\n'));
process.exit(실패.length ? 1 : 0);
