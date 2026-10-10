/* 기계배치도 — **두 번 톡 치면 뜨는 속성 판** 시험.

       node 기계배치도/tests/속성판.mjs

   사장님 말씀(10-10): 「더블클릭 속성입력 창 기능 안 나타나」
   — 그런 창이 없었다. 지어서 재는 통이다.

   ⚠ 가장 센 자(⚠ 표)는 「**손대지 않은 칸은 안 밀리나**」 다. 미터로 보이는
      수는 10mm 눈금까지라, 그냥 다시 읽으면 캐드 참값 734mm 가 730mm 로
      밀린다. 이름만 고치셨는데 자리가 틀어지면 「도면과 1:1」 이 깨진다. */
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
const 바닥 = { 가로: 67695, 세로: 22200 };
/* 도면 참값 — 앱과 따로 적어 둔다. y 734 가 이 통의 벼리다 */
const 재단기 = { w: 3200, h: 3700, x: 1283, y: 734 };

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

const 봄 = () => p.evaluate(() => {
    const 눌린 = 통 => { const b = [...document.querySelectorAll('#' + 통 + ' button')]
        .find(x => x.getAttribute('aria-pressed') === 'true'); return b ? b.textContent : null; };
    const d = (() => { try { return JSON.parse(localStorage.getItem('layout.도면.v3') || 'null'); }
                       catch (e) { return null; } })();
    return {
        판: !document.getElementById('l-prop-sheet').hidden,
        이름: document.getElementById('l-p-name').value,
        가로: document.getElementById('l-p-w').value, 세로: document.getElementById('l-p-h').value,
        x: document.getElementById('l-p-x').value,   y: document.getElementById('l-p-y').value,
        크기꺼짐: document.getElementById('l-p-w').disabled && document.getElementById('l-p-h').disabled,
        갈래: 눌린('l-p-kind'), 각: 눌린('l-p-ang'),
        판쪽지: document.getElementById('l-prop-msg').textContent,
        누구: document.getElementById('l-prop-who').textContent,
        쪽지: document.getElementById('l-note').textContent,
        고름: document.querySelectorAll('.lmc.고름, .lgrp.고름').length,
        수: document.querySelectorAll('.lmc:not(.조각), .lgrp').length,
        기계들: d ? d['기계들'] : null,
    };
});
const 눌러 = async (id, 쉼 = 220) => { await p.click('#' + id); await p.waitForTimeout(쉼); };
const 깨끗이 = async () => {
    await p.evaluate(ks => ks.forEach(k => localStorage.removeItem(k)), 열쇠들);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(520);
    await p.click('#l-sheet'); await p.waitForTimeout(520);
    for (let i = 0; i < 3; i++) await 눌러('l-zin', 150);
};
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
async function 보이게(area, 몇번 = 7) {
    for (let k = 0; k < 몇번; k++) {
        const d = await p.evaluate(a => {
            const e = document.querySelector('.lmc[data-area="' + a + '"]');
            if (!e) return null;
            const r = e.getBoundingClientRect(), v = document.getElementById('l-view').getBoundingClientRect();
            return { dx: (v.left + v.width / 2) - (r.left + r.width / 2),
                     dy: (v.top + v.height / 2) - (r.top + r.height / 2) };
        }, area);
        if (!d) return false;
        if (Math.abs(d.dx) < 40 && Math.abs(d.dy) < 40) break;
        const 빈 = await 빈데찾기(); if (!빈) break;
        const dx = Math.max(-260, Math.min(260, d.dx)), dy = Math.max(-260, Math.min(260, d.dy));
        await p.mouse.move(빈.x, 빈.y); await p.mouse.down();
        for (let i = 1; i <= 6; i++) { await p.mouse.move(빈.x + dx * i / 6, 빈.y + dy * i / 6); await p.waitForTimeout(20); }
        await p.mouse.up(); await p.waitForTimeout(150);
    }
    return true;
}
const 점 = area => p.evaluate(a => {
    const e = document.querySelector('.lmc[data-area="' + a + '"]');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const 거기 = document.elementFromPoint(x, y);
    return { x, y, id: e.dataset.id, 잡히나: !!(거기 && 거기.closest('.lmc') === e) };
}, area);
const 톡 = async (x, y) => { await p.mouse.move(x, y); await p.mouse.down();
                             await p.waitForTimeout(40); await p.mouse.up(); };
async function 두번톡(area) {
    await 보이게(area);
    const 그것 = await 점(area);
    if (!그것 || !그것.잡히나) return null;
    await 톡(그것.x, 그것.y); await p.waitForTimeout(120);
    await 톡(그것.x, 그것.y); await p.waitForTimeout(280);
    return 그것;
}

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ 1. 한 번은 고르기 · 두 번은 속성 판 ═══════════════════════════ */
console.log('\n── 1. 두 번 톡 치면 뜨나');
await 보이게('기계:재단기');
{
    const 그것 = await 점('기계:재단기');
    재기('재단기를 짚을 수 있나', !!(그것 && 그것.잡히나), 그것 ? 그것.id : '못 찾음');
    await 톡(그것.x, 그것.y); await p.waitForTimeout(250);
    const 한번 = await 봄();
    재기('한 번 톡은 **고르기만** 하고 판은 안 뜨나', !한번.판 && 한번.고름 === 1,
         '판 ' + 한번.판 + ' · 고름 ' + 한번.고름);
    /* 400ms 를 넘겨 치면 두 번 톡이 아니다 */
    await p.waitForTimeout(600);
    await 톡(그것.x, 그것.y); await p.waitForTimeout(250);
    재기('느리게 두 번 치면 판이 안 뜨나 (400ms 를 넘겼다)', !(await 봄()).판);
}
{
    const 그것 = await 두번톡('기계:재단기');
    const 본것 = await 봄();
    재기('⚠ 두 번 톡 치면 속성 판이 뜨나', 본것.판, '판 ' + 본것.판);
    재기('칸에 도면 참값이 들어 있나 — 3.2 · 3.7 · 1.28 · 0.73',
         본것.이름 === '재단기' && 본것.가로 === '3.2' && 본것.세로 === '3.7'
         && 본것.x === '1.28' && 본것.y === '0.73',
         [본것.이름, 본것.가로, 본것.세로, 본것.x, 본것.y].join(' · '));
    재기('갈래와 각이 지금 것으로 눌려 있나', 본것.갈래 === '기계' && 본것.각 === '0°',
         본것.갈래 + ' · ' + 본것.각);
}
await p.screenshot({ path: path.join(그림칸, '속성판.png') });

/* ══ 2. ⚠ 손대지 않은 칸은 안 밀리나 ═══════════════════════════════ */
console.log('\n── 2. 손대지 않은 칸은 안 밀리나');
{
    /* 이름만 고치고 넣는다 — 자리는 734mm 그대로여야 한다 */
    await p.fill('#l-p-name', '재단기 큰것');
    await 눌러('l-prop-ok', 400);
    const 뒤 = await 봄();
    const m = 뒤.기계들.find(x => x['이름'] === '재단기 큰것');
    재기('이름을 고치면 담기나', !!m, m ? m['이름'] : '못 찾음');
    재기('⚠ 이름만 고쳤을 때 자리가 **한 톨도 안 밀리나** (y 734 그대로)',
         !!m && m.x === 재단기.x && m.y === 재단기.y,
         m ? m.x + ',' + m.y + ' / 바란 ' + 재단기.x + ',' + 재단기.y : '—');
    재기('⚠ 크기도 그대로인가 (3,200 × 3,700)',
         !!m && m['가로'] === 재단기.w && m['세로'] === 재단기.h,
         m ? m['가로'] + '×' + m['세로'] : '—');
    재기('고친 이름이 알림줄과 판에 보이나', /재단기 큰것/.test(뒤.쪽지) && !뒤.판, 뒤.쪽지);
}

/* ══ 3. 갈래 · 각 · 자리 · 크기 ════════════════════════════════════ */
console.log('\n── 3. 갈래·각·자리·크기를 고친다');
await 깨끗이();
{
    await 두번톡('기계:재단기');
    await p.click('#l-p-kind button[data-area="갈래고르기:방"]');
    await p.click('#l-p-ang button[data-area="각고르기:90°"]');
    await 눌러('l-prop-ok', 400);
    const m = (await 봄()).기계들.find(x => x['이름'] === '재단기');
    재기('갈래를 「방」 으로 고치면 담기나', !!m && m['갈래'] === '방', m ? m['갈래'] : '—');
    재기('각을 90° 로 고치면 담기나', !!m && (m['각'] | 0) === 90, m ? m['각'] + '°' : '—');
    재기('⚠ 각만 고쳐도 가로·세로 값은 그대로인가 (차지하는 자리만 바뀐다)',
         !!m && m['가로'] === 재단기.w && m['세로'] === 재단기.h,
         m ? m['가로'] + '×' + m['세로'] : '—');
    const 그려진 = await p.evaluate(() => {
        const e = document.querySelector('.lmc[data-area="기계:재단기"]');
        const r = e.getBoundingClientRect();
        return { 폭: Math.round(r.width), 높이: Math.round(r.height),
                 갈: e.className.match(/갈-(\S+)/)[1] };
    });
    재기('화면에서도 90° 로 돌아 보이나 (가로가 더 길어졌다)',
         그려진.폭 > 그려진.높이, 그려진.폭 + '×' + 그려진.높이 + 'px');
    재기('화면에서도 갈래가 「방」 으로 바뀌었나', 그려진.갈 === '방', '갈-' + 그려진.갈);
}
await 깨끗이();
{
    await 두번톡('기계:재단기');
    await p.fill('#l-p-w', '5.00');
    await p.fill('#l-p-x', '10.00');
    await p.fill('#l-p-y', '2.50');
    await 눌러('l-prop-ok', 400);
    const m = (await 봄()).기계들.find(x => x['이름'] === '재단기');
    재기('크기와 자리를 넣으면 그대로 가나 (5.00 m · 10.00 · 2.50)',
         !!m && m['가로'] === 5000 && m.x === 10000 && m.y === 2500,
         m ? m['가로'] + ' · ' + m.x + ',' + m.y : '—');
    재기('안 건드린 세로는 그대로인가 (3,700)', !!m && m['세로'] === 재단기.h,
         m ? String(m['세로']) : '—');
}

/* ══ 4. 벽 밖으로는 안 나간다 ══════════════════════════════════════ */
console.log('\n── 4. 벽 밖은 벽에서 선다');
await 깨끗이();
{
    await 두번톡('기계:재단기');
    await p.fill('#l-p-x', '999');
    await p.fill('#l-p-y', '999');
    await 눌러('l-prop-ok', 400);
    const 뒤 = await 봄();
    const m = 뒤.기계들.find(x => x['이름'] === '재단기');
    재기('⚠ 벽 밖 수를 넣어도 벽 안에서 서나',
         !!m && m.x + m['가로'] <= 바닥.가로 && m.y + m['세로'] <= 바닥.세로,
         m ? m.x + ',' + m.y + ' (바닥 ' + 바닥.가로 + '×' + 바닥.세로 + ')' : '—');
    재기('못 간 것을 알림줄에 적나', /못 갔습니다/.test(뒤.쪽지), 뒤.쪽지.slice(0, 90));
}
{
    await 두번톡('기계:재단기');
    await p.fill('#l-p-w', '0.05');          // 가장 작은 크기(0.1m) 아래
    await 눌러('l-prop-ok', 300);
    const 뒤 = await 봄();
    재기('너무 작은 크기는 안 받고 판이 그대로 열려 있나',
         뒤.판 && /가장 작은 크기/.test(뒤.판쪽지), 뒤.판쪽지);
    await 눌러('l-prop-no', 250);
}

/* ══ 5. 그만 누르면 아무것도 안 바뀐다 ═════════════════════════════ */
console.log('\n── 5. 그만');
await 깨끗이();
{
    const 전 = await 봄();
    await 두번톡('기계:재단기');
    await p.fill('#l-p-name', '아무거나');
    await p.fill('#l-p-x', '30.00');
    await 눌러('l-prop-no', 300);
    const 뒤 = await 봄();
    재기('「그만」 을 누르면 판이 닫히고 아무것도 안 바뀌나',
         !뒤.판 && 뒤.기계들 === null && 전.기계들 === null,
         '판 ' + 뒤.판 + ' · 담긴 것 ' + (뒤.기계들 ? '있음' : '없음'));
    const 이름 = await p.evaluate(() => {
        const e = document.querySelector('.lmc[data-area="기계:재단기"]');
        return e ? e.querySelector('.lnm').textContent : null;
    });
    재기('화면의 이름도 그대로인가', 이름 === '재단기', 이름 || '못 찾음');
}

/* ══ 6. 끌었을 때 · 여럿일 때 · 자를 켰을 때는 안 뜬다 ═════════════ */
console.log('\n── 6. 안 떠야 할 때');
await 깨끗이();
{
    /* 끌고 나서 뗀 것은 두 번 톡이 아니다 */
    await 보이게('기계:재단기');
    const 그것 = await 점('기계:재단기');
    await 톡(그것.x, 그것.y); await p.waitForTimeout(120);
    await p.mouse.move(그것.x, 그것.y); await p.mouse.down();
    for (let i = 1; i <= 6; i++) { await p.mouse.move(그것.x + 40 * i / 6, 그것.y); await p.waitForTimeout(20); }
    await p.mouse.up(); await p.waitForTimeout(250);
    재기('끌고 뗀 것은 두 번 톡으로 안 세나 (판이 안 뜬다)', !(await 봄()).판);
}
await 깨끗이();
{
    await 눌러('l-many');                    // 여럿 고르기
    const 그것 = await 두번톡('기계:재단기');
    재기('여럿 고르는 중에는 판이 안 뜨나 (고르는 일이 먼저다)', !(await 봄()).판);
    await 눌러('l-many');
}
await 깨끗이();
{
    await 눌러('l-ruler');                   // 자
    await 두번톡('기계:재단기');
    재기('자를 켠 채로는 판이 안 뜨나 (지금은 재는 중이다)', !(await 봄()).판);
    await 눌러('l-ruler');
}

/* ══ 7. 덩이는 크기를 못 고친다 ════════════════════════════════════ */
console.log('\n── 7. 덩이');
await 깨끗이();
{
    /* 재단기와 그 옆 판넬 자동 투입기를 합친다 */
    await 눌러('l-many');
    for (const a of ['기계:재단기', '기계:판넬 자동 투입기']) {
        await 보이게(a);
        const 그것 = await 점(a);
        if (그것 && 그것.잡히나) { await 톡(그것.x, 그것.y); await p.waitForTimeout(160); }
    }
    const 고른수 = (await 봄()).고름;
    if (고른수 === 0) {
        const 여럿 = await p.evaluate(() =>
            document.querySelectorAll('.lmc.여럿, .lgrp.여럿').length);
        재기('덩이를 만들 둘을 골랐나', 여럿 === 2, '여럿 ' + 여럿 + '개');
    } else 재기('덩이를 만들 둘을 골랐나', true, '고름 ' + 고른수);
    await 눌러('l-join', 350);
    const 덩이 = await p.evaluate(() => {
        const e = document.querySelector('.lmc.조각');
        return e ? e.dataset.id : null;
    });
    재기('덩이가 생겼나', !!덩이, 덩이 || '못 만들었습니다');
    if (덩이) {
        const 조각점 = await p.evaluate(id => {
            const e = document.querySelector('.lmc.조각[data-id="' + id + '"]');
            const r = e.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, 덩이);
        await 톡(조각점.x, 조각점.y); await p.waitForTimeout(120);
        await 톡(조각점.x, 조각점.y); await p.waitForTimeout(300);
        const 본것 = await 봄();
        재기('덩이도 두 번 톡 치면 판이 뜨나', 본것.판, '판 ' + 본것.판);
        재기('⚠ 덩이는 **크기 칸이 꺼져 있나** (테만 늘리면 모양이 깨진다)',
             본것.크기꺼짐, '꺼짐 ' + 본것.크기꺼짐 + ' · ' + 본것.판쪽지);
        재기('덩이라고 판에 적나', /덩이/.test(본것.누구), 본것.누구);
        await p.fill('#l-p-name', '재단 묶음');
        await 눌러('l-prop-ok', 400);
        const m = (await 봄()).기계들.find(x => x['이름'] === '재단 묶음');
        재기('덩이도 이름을 고칠 수 있나', !!m && Array.isArray(m['조각']),
             m ? m['이름'] + ' (조각 ' + m['조각'].length + '개)' : '—');
    }
}

/* ══ 8. 닿는 자리 · 넘침 ══════════════════════════════════════════ */
console.log('\n── 8. 닿는 자리와 넘침');
await 깨끗이();
await 두번톡('기계:재단기');
for (const [w, h] of [[375, 812], [320, 480]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(300);
    const 잰 = await p.evaluate(() => {
        const 칸 = [...document.querySelectorAll('#l-prop-sheet input')];
        const 단 = [...document.querySelectorAll('#l-prop-sheet button')];
        const 작은것 = [...칸, ...단].filter(e => {
            const r = e.getBoundingClientRect();
            return r.height < 44 || r.width < 44;
        }).map(e => (e.id || e.textContent) + ' '
            + Math.round(e.getBoundingClientRect().width) + '×'
            + Math.round(e.getBoundingClientRect().height));
        const 카드 = document.querySelector('#l-prop-sheet .lcard').getBoundingClientRect();
        return { 작은것, 카드높: Math.round(카드.height), 화면높: window.innerHeight,
                 글씨: 칸.map(e => parseFloat(getComputedStyle(e).fontSize)),
                 넘침: document.documentElement.scrollWidth > window.innerWidth + 1 };
    });
    재기(w + '×' + h + ' — 칸과 단추가 다 44px 이상인가', 잰.작은것.length === 0,
         잰.작은것.join(' | ') || '다 넘깁니다');
    재기(w + '×' + h + ' — 판이 화면 안에 드나', 잰.카드높 <= 잰.화면높,
         '판 ' + 잰.카드높 + 'px / 화면 ' + 잰.화면높 + 'px');
    재기(w + '×' + h + ' — 칸 글씨가 16px 이상인가 (아이폰이 확대 안 하게)',
         잰.글씨.every(v => v >= 16), 잰.글씨.join(',') + 'px');
    재기(w + '×' + h + ' — 가로로 안 넘치나', !잰.넘침);
}
await p.setViewportSize({ width: 375, height: 812 });
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

const 초록 = 잰것.filter(x => x.됐나).length, 빨강 = 잰것.length - 초록;
console.log('\n초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 0 (잰 것 모두 ' + 잰것.length + ')');
if (빨강) { console.log('빨강:'); 잰것.filter(x => !x.됐나).forEach(x =>
    console.log('  ✗ ' + x.이름 + (x.곁 ? '   [' + x.곁 + ']' : ''))); }
await b.close();
process.exit(빨강 ? 1 : 0);
