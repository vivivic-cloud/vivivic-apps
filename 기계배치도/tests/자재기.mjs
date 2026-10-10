/* 기계배치도 — **도면 안에서 치수를 재는 자** 시험.

       node 기계배치도/tests/자재기.mjs

   사장님 말씀(10-10): 「배치도면 안에서 치수를 잴 수 있게 해줘」

   ⚠ 재는 자는 **수가 맞아야** 쓸모가 있다. 그래서 이 통은 참값을 아는 두
      모서리 사이를 재어 그 수가 도면과 맞는지 본다 — 「금이 그어졌나」 가
      아니라 「몇 m 라고 적혔나」 를 잰다.
   ⚠ 재는 동안 기계가 밀리면 배치가 망가진다. 그것도 잰다. */
import fs from 'node:fs';
import path from 'node:path';
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
const 열쇠들 = ['layout.배치.v2', 'layout.도면.v3', 'layout.벌.v1'];
/* 도면 참값 — 앱과 따로 적어 둔다 */
const 바닥 = { 가로: 67695, 세로: 22200 };
const 재단기 = { w: 3200, h: 3700, x: 1283, y: 734 };
const 판넬 = { w: 7200, h: 1600, x: 1283, y: 4434 };

const b = await 브라우저열기({ args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 },
                                 deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.route('**/firebasejs/**', r => r.fulfill({ status: 200, contentType: 'text/javascript',
    body: 'export const initializeApp=()=>({});export const getAuth=()=>({});'
        + 'export const signInAnonymously=async()=>({});export const onAuthStateChanged=()=>{};'
        + 'export const getFirestore=()=>({});export const doc=()=>({});'
        + 'export const getDoc=async()=>({exists:()=>false,data:()=>null});'
        + 'export const setDoc=async()=>{};export const onSnapshot=()=>()=>{};' }));
const p = await ctx.newPage();
const 터짐 = [];
p.on('pageerror', e => 터짐.push(e.message));
p.on('console', m => { if (m.type() === 'error') 터짐.push('콘솔: ' + m.text()); });

const 봄 = () => p.evaluate(() => ({
    쪽지: document.getElementById('l-note').textContent,
    켜짐: document.getElementById('l-ruler').getAttribute('aria-pressed'),
    금: document.querySelectorAll('.ljaa line').length,
    점: document.querySelectorAll('.ljaa circle').length,
    딱지: (document.querySelector('.ljab') || {}).textContent || '',
    재는중: document.getElementById('l-view').classList.contains('재는중'),
    기계수: document.querySelectorAll('.lmc:not(.조각), .lgrp').length,
    담김: localStorage.getItem('layout.도면.v3'),
    배율글: document.getElementById('l-mag').textContent,
}));
const 깨끗이 = async () => {
    await p.evaluate(ks => ks.forEach(k => localStorage.removeItem(k)), 열쇠들);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(520);
    await p.click('#l-sheet');            // 도면 그대로 벌
    await p.waitForTimeout(520);
};
const 눌러 = async (id, 쉼 = 200) => { await p.click('#' + id); await p.waitForTimeout(쉼); };
/* 참 자리(mm) → 화면 자리. 돌리기까지 셈한다 */
const 화면자리 = (x, y) => p.evaluate(([mx, my, 가로, 세로]) => {
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const 돈 = document.getElementById('l-turn').getAttribute('aria-pressed') === 'true';
    const 왼 = 돈 ? (세로 - my) / 세로 : mx / 가로;
    const 위 = 돈 ? mx / 가로 : my / 세로;
    return { x: f.left + f.width * 왼, y: f.top + f.height * 위 };
}, [x, y, 바닥.가로, 바닥.세로]);
/* 빈 바닥 한 점 — 팬을 걸 자리 */
const 빈데찾기 = () => p.evaluate(() => {
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const v = document.getElementById('l-view').getBoundingClientRect();
    for (let gy = 0.06; gy < 0.96; gy += 0.04) for (let gx = 0.04; gx < 0.98; gx += 0.03) {
        const x = f.left + f.width * gx, y = f.top + f.height * gy;
        if (x < v.left + 34 || x > v.right - 34 || y < v.top + 34 || y > v.bottom - 34) continue;
        const 거기 = document.elementFromPoint(x, y);
        if (거기 && !거기.closest('.lmc') && !거기.closest('.lhd') && !거기.closest('.lzb')
            && 거기.closest('#l-view')) return { x, y };
    }
    return null;
});
/* ⚠ 재려는 자리를 **화면에 들인다.** 확대하면 67.7m 공장의 대부분이 창 밖이라,
   들이지 않고 집으면 손가락이 화면 밖을 짚어 아무 일도 안 난다(10-10 에 잡았다).
   팬은 자를 **끄고** 건다 — 자를 켠 채로는 바닥이 안 끌린다(그것이 옳다). */
async function 들이기(점, 몇번 = 6) {
    const 켜져있었나 = (await 봄()).켜짐 === 'true';
    if (켜져있었나) await 눌러('l-ruler', 150);
    for (let k = 0; k < 몇번; k++) {
        const d = await p.evaluate(([mx, my, 가로, 세로]) => {
            const f = document.getElementById('l-floor').getBoundingClientRect();
            const v = document.getElementById('l-view').getBoundingClientRect();
            const 돈 = document.getElementById('l-turn').getAttribute('aria-pressed') === 'true';
            const 왼 = 돈 ? (세로 - my) / 세로 : mx / 가로;
            const 위 = 돈 ? mx / 가로 : my / 세로;
            return { dx: (v.left + v.width / 2) - (f.left + f.width * 왼),
                     dy: (v.top + v.height / 2) - (f.top + f.height * 위) };
        }, [점.x, 점.y, 바닥.가로, 바닥.세로]);
        if (Math.abs(d.dx) < 40 && Math.abs(d.dy) < 40) break;
        const 빈 = await 빈데찾기();
        if (!빈) break;
        const dx = Math.max(-260, Math.min(260, d.dx)), dy = Math.max(-260, Math.min(260, d.dy));
        await p.mouse.move(빈.x, 빈.y); await p.mouse.down();
        for (let i = 1; i <= 6; i++) { await p.mouse.move(빈.x + dx * i / 6, 빈.y + dy * i / 6); await p.waitForTimeout(20); }
        await p.mouse.up(); await p.waitForTimeout(150);
    }
    if (켜져있었나) await 눌러('l-ruler', 150);
}
async function 재어보기(점1, 점2, 칸수 = 8) {
    /* 두 점의 한가운데를 화면에 들이고 잰다 */
    await 들이기({ x: (점1.x + 점2.x) / 2, y: (점1.y + 점2.y) / 2 });
    const A = await 화면자리(점1.x, 점1.y), B = await 화면자리(점2.x, 점2.y);
    await p.mouse.move(A.x, A.y);
    await p.mouse.down();
    for (let i = 1; i <= 칸수; i++) {
        await p.mouse.move(A.x + (B.x - A.x) * i / 칸수, A.y + (B.y - A.y) * i / 칸수);
        await p.waitForTimeout(25);
    }
    const 끄는중 = await 봄();
    await p.mouse.up(); await p.waitForTimeout(200);
    return { 끄는중, 뒤: await 봄() };
}
/* 쪽지에서 수를 뽑는다 */
const 뽑기 = 글 => {
    const m = 글.match(/잰 길이 ([\d,.]+) m — 옆으로 ([\d,.]+) · 위아래로 ([\d,.]+) m/);
    if (!m) return null;
    const 수 = v => Number(String(v).replace(/,/g, ''));
    return { 길이: 수(m[1]), 옆: 수(m[2]), 위아래: 수(m[3]) };
};

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ 1. 자 켜고 끄기 ════════════════════════════════════════════════ */
console.log('\n── 1. 자 켜고 끄기');
const 켜기전 = await 봄();
재기('처음에는 자가 꺼져 있나', 켜기전.켜짐 === 'false' && !켜기전.재는중,
     '켜짐 ' + 켜기전.켜짐);
await 눌러('l-ruler');
const 켠뒤 = await 봄();
재기('「📐 재기」 를 누르면 켜지고 쓰는 법을 알리나',
     켠뒤.켜짐 === 'true' && 켠뒤.재는중 && /두 점을 잡아 끌면/.test(켠뒤.쪽지), 켠뒤.쪽지);

/* ══ 2. 수가 맞나 — 참값을 아는 자리를 잰다 ══════════════════════════ */
console.log('\n── 2. 잰 수가 도면과 맞나');
for (let i = 0; i < 3; i++) await 눌러('l-zin', 150);
{
    /* 재단기 왼위(1283,734) → 재단기 오른아래(4483,4434).
       참값: 옆 3,200 · 위아래 3,700 · 빗금 √(3200²+3700²) = 4,891.9 */
    const 잰 = await 재어보기({ x: 재단기.x, y: 재단기.y },
                              { x: 재단기.x + 재단기.w, y: 재단기.y + 재단기.h });
    const 수 = 뽑기(잰.뒤.쪽지);
    const 바란빗 = Math.hypot(재단기.w, 재단기.h) / 1000;
    재기('⚠ 재단기 대각선을 재면 도면 값이 나오나 (3.2 × 3.7 → 4.89 m)',
         !!수 && Math.abs(수.옆 - 3.2) <= 0.02 && Math.abs(수.위아래 - 3.7) <= 0.02
         && Math.abs(수.길이 - 바란빗) <= 0.03,
         잰.뒤.쪽지);
    재기('딱지에도 같은 수가 적히나', 잰.뒤.딱지 === 수.길이.toFixed(2) + ' m',
         '딱지 ' + 잰.뒤.딱지 + ' / 쪽지 ' + 수.길이);
    재기('두 끝 다 모서리에 붙었다고 알리나', /· 모서리에 붙음/.test(잰.뒤.쪽지),
         잰.뒤.쪽지.split('·').pop().trim());
    재기('⚠ 끄는 **도중에도** 수가 살아서 바뀌나', !!뽑기(잰.끄는중.쪽지),
         잰.끄는중.쪽지);
}
{
    /* 재단기 아래변(y 4434) ↔ 판넬 자동 투입기 위변(y 4434) — 딱 붙어 있다.
       대신 재단기 오른변(x 4483) → 판넬 오른변(x 8483) = 4,000mm 를 잰다 */
    const 잰 = await 재어보기({ x: 재단기.x + 재단기.w, y: 판넬.y + 200 },
                              { x: 판넬.x + 판넬.w,     y: 판넬.y + 200 });
    const 수 = 뽑기(잰.뒤.쪽지);
    재기('⚠ 재단기 오른변 → 판넬 자동 투입기 오른변이 4.00 m 로 나오나',
         !!수 && Math.abs(수.옆 - 4.0) <= 0.02 && 수.위아래 === 0,
         잰.뒤.쪽지);
}
await p.screenshot({ path: path.join(그림칸, '자-잰금.png') });

/* ══ 3. 모서리에 붙나 ═══════════════════════════════════════════════ */
console.log('\n── 3. 모서리에 붙나');
{
    /* 모서리에서 **일부러 조금 비껴** 짚는다 — 붙어서 참값이 나와야 한다 */
    const 잰 = await 재어보기({ x: 재단기.x + 120, y: 재단기.y + 90 },
                              { x: 재단기.x + 재단기.w - 140, y: 재단기.y + 재단기.h - 80 });
    const 수 = 뽑기(잰.뒤.쪽지);
    재기('⚠ 모서리에서 비껴 짚어도 **붙어서** 3.2 × 3.7 이 나오나',
         !!수 && Math.abs(수.옆 - 3.2) <= 0.02 && Math.abs(수.위아래 - 3.7) <= 0.02,
         잰.뒤.쪽지);
}
{
    /* 붙을 데가 없는 한가운데를 재면 붙지 않아야 한다 — 몰래 끌려가면 안 된다 */
    const 빈데 = { x: 20000, y: 8000 };
    const 잰 = await 재어보기(빈데, { x: 빈데.x + 5000, y: 빈데.y });
    const 수 = 뽑기(잰.뒤.쪽지);
    재기('붙을 데가 먼 자리는 **안 붙고** 짚은 대로 재나 (5.00 m 언저리)',
         !!수 && Math.abs(수.옆 - 5.0) <= 0.35, 잰.뒤.쪽지);
}
{
    /* ⚠ 전체 보기에서는 화면 14px 이 3m 다. 600mm 천장이 없으면 몇 m 가 끌려간다 */
    await 눌러('l-zall', 300);
    const 빈데 = { x: 20000, y: 8000 };
    const 잰 = await 재어보기(빈데, { x: 빈데.x + 10000, y: 빈데.y });
    const 수 = 뽑기(잰.뒤.쪽지);
    재기('⚠ 전체 보기에서도 붙는 거리가 600mm 를 안 넘나 (10 m 를 재면 10 m 가까이)',
         !!수 && Math.abs(수.옆 - 10.0) <= 1.3,
         잰.뒤.쪽지 + ' · ' + 잰.뒤.배율글);
    for (let i = 0; i < 3; i++) await 눌러('l-zin', 150);
}

/* ══ 4. 재는 동안 기계가 안 밀리나 ══════════════════════════════════ */
console.log('\n── 4. 재는 동안 배치가 안 흔들리나');
{
    const 전 = await 봄();
    /* 재단기 **몸통 위를** 가로질러 끈다 — 자가 안 받으면 기계가 끌려간다 */
    await 재어보기({ x: 재단기.x + 400, y: 재단기.y + 400 },
                   { x: 재단기.x + 재단기.w - 400, y: 재단기.y + 재단기.h - 400 });
    const 후 = await 봄();
    재기('⚠ 기계 몸통 위를 재도 **기계가 안 움직이나**', 후.담김 === 전.담김,
         전.담김 === null && 후.담김 === null ? '담긴 것이 없다(안 움직였다)'
                                              : (후.담김 === 전.담김 ? '그대로' : '움직였습니다'));
    재기('재는 동안에도 네모 172개가 그대로 있나', 후.기계수 === 172, 후.기계수 + '개');
    const 고른것 = await p.evaluate(() => document.querySelectorAll('.lmc.고름, .lgrp.고름').length);
    재기('재다가 기계가 골라지지도 않나', 고른것 === 0, 고른것 + '개 골라짐');
}

/* ══ 5. 확대·팬·돌리기를 해도 금이 그 자리인가 ══════════════════════ */
console.log('\n── 5. 확대·돌리기를 해도 금이 제자리인가');
{
    const 잰 = await 재어보기({ x: 재단기.x, y: 재단기.y },
                              { x: 재단기.x + 재단기.w, y: 재단기.y + 재단기.h });
    const 전수 = 뽑기(잰.뒤.쪽지);
    await 눌러('l-zin', 250);
    const 키운뒤 = await 봄();
    재기('확대해도 금이 남아 있나', 키운뒤.금 === 3 && 키운뒤.점 === 2,
         '금 ' + 키운뒤.금 + ' · 점 ' + 키운뒤.점);
    재기('확대해도 잰 수가 그대로인가', 키운뒤.딱지 === 잰.뒤.딱지,
         잰.뒤.딱지 + ' → ' + 키운뒤.딱지);
    await 눌러('l-turn', 350);            // 세로로 돌려 본다
    const 돌린뒤 = await 봄();
    재기('⚠ 세로로 돌려도 금이 남고 수가 그대로인가',
         돌린뒤.금 === 3 && 돌린뒤.딱지 === 잰.뒤.딱지,
         '금 ' + 돌린뒤.금 + ' · 딱지 ' + 돌린뒤.딱지);
    /* 돌린 채로도 참값으로 재지나 */
    const 돌려잰 = await 재어보기({ x: 재단기.x, y: 재단기.y },
                                  { x: 재단기.x + 재단기.w, y: 재단기.y });
    const 수2 = 뽑기(돌려잰.뒤.쪽지);
    재기('⚠ 돌린 채로도 재단기 가로가 3.20 m 로 나오나',
         !!수2 && Math.abs(수2.옆 - 3.2) <= 0.02 && 수2.위아래 === 0, 돌려잰.뒤.쪽지);
    await 눌러('l-turn', 350);
    await p.screenshot({ path: path.join(그림칸, '자-돌려서.png') });
}

/* ══ 6. 치우기 ═════════════════════════════════════════════════════ */
console.log('\n── 6. 치우기');
{
    /* 톡 치면 금이 지워진다 */
    await 들이기({ x: 20000, y: 8000 });      // 화면 밖을 치면 아무 일도 안 난다
    const 한점 = await 화면자리(20000, 8000);
    await p.mouse.move(한점.x, 한점.y);
    await p.mouse.down(); await p.waitForTimeout(40); await p.mouse.up();
    await p.waitForTimeout(200);
    const 톡뒤 = await 봄();
    재기('톡 치면 금이 지워지나', 톡뒤.금 === 0 && /두 점을 잡아 끌면/.test(톡뒤.쪽지),
         '금 ' + 톡뒤.금 + ' · ' + 톡뒤.쪽지);
    await 재어보기({ x: 재단기.x, y: 재단기.y }, { x: 재단기.x + 재단기.w, y: 재단기.y + 재단기.h });
    await 눌러('l-ruler');
    const 끈뒤 = await 봄();
    재기('자를 끄면 금이 없어지고 기계를 다시 잡을 수 있나',
         끈뒤.켜짐 === 'false' && !끈뒤.재는중 && 끈뒤.금 === 0,
         '켜짐 ' + 끈뒤.켜짐 + ' · 금 ' + 끈뒤.금 + ' · ' + 끈뒤.쪽지);
}
{
    /* 자를 끈 뒤에는 기계가 다시 잡혀야 한다 */
    const 그점 = await 화면자리(재단기.x + 400, 재단기.y + 400);
    await p.mouse.move(그점.x, 그점.y);
    await p.mouse.down(); await p.waitForTimeout(40); await p.mouse.up();
    await p.waitForTimeout(200);
    const 골랐나 = await p.evaluate(() => document.querySelectorAll('.lmc.고름').length);
    재기('⚠ 자를 끈 뒤에는 기계가 다시 골라지나 (이전 기능이 돌아오나)',
         골랐나 >= 1, 골랐나 + '개 골라짐');
}

/* ══ 7. 닿는 자리 · 넘침 ═══════════════════════════════════════════ */
console.log('\n── 7. 닿는 자리와 넘침');
for (const [w, h] of [[375, 812], [320, 480]]) {
    const 통 = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2,
                                    hasTouch: true, isMobile: true });
    await 통.route('**/firebasejs/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'export const x=1;' }));
    const p2 = await 통.newPage();
    await p2.goto(주소, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(520);
    const 잰 = await p2.evaluate(() => {
        const e = document.getElementById('l-ruler'), r = e.getBoundingClientRect();
        return { 폭: Math.round(r.width), 높이: Math.round(r.height), 오른: Math.round(r.right),
                 넘침: document.documentElement.scrollWidth > window.innerWidth + 1 };
    });
    재기(w + 'px — 재기 단추가 44px 이상이고 화면 안인가',
         잰.폭 >= 44 && 잰.높이 >= 44 && 잰.오른 <= w && !잰.넘침,
         잰.폭 + '×' + 잰.높이 + ' @오른끝 ' + 잰.오른 + '/' + w);
    await 통.close();
}
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

const 초록 = 잰것.filter(x => x.됐나).length, 빨강 = 잰것.length - 초록;
console.log('\n초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 0 (잰 것 모두 ' + 잰것.length + ')');
if (빨강) { console.log('빨강:'); 잰것.filter(x => !x.됐나).forEach(x =>
    console.log('  ✗ ' + x.이름 + (x.곁 ? '   [' + x.곁 + ']' : ''))); }
await b.close();
process.exit(빨강 ? 1 : 0);
