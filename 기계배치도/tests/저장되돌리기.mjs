/* 기계배치도 — **저장(각각) · 실시간 화베 · 뒤로가기** 시험.

       node 기계배치도/tests/저장되돌리기.mjs

   사장님 말씀(10-10): 「저장버튼을 눌러 현재의 상태를 각각 저장 할 수 있게
   해줘 또 현 편집중인 현재 상태가 실시간으로 화베에 저장 되도록 해줘 또한
   편집중 뒤로가기 버튼으로 모든 단계로 순차적으로 돌아 갈 수 있게 해줘」

   ⚠ 가장 센 자(⚠ 표) — 「**모든 단계로 순차적으로**」. 고치는 길이 아홉이라
      하나라도 안 쌓이면 그 단계는 영영 못 돌아온다. 아홉을 다 잰다. */
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
const 열쇠들 = ['layout.배치.v2', 'layout.도면.v3', 'layout.벌.v1', 'layout.저장본.v1'];
const 바닥 = { 가로: 67695, 세로: 22200 };
const 재단기 = { w: 3200, h: 3700, x: 1283, y: 734 };

/* 창고 허수아비 — setDoc 이 참으로 되고, 몇 번 올렸는지 센다 */
const 허수아비 = {
    'firebase-app.js': `export const initializeApp = () => ({ 흉내: 1 });`,
    'firebase-auth.js': `
        export const getAuth = () => ({ currentUser: { uid: '시험' } });
        export const signInAnonymously = async () => ({});
        export const onAuthStateChanged = (a, cb) => { setTimeout(() => cb({ uid: '시험' }), 10); };`,
    'firebase-firestore.js': `
        export const getFirestore = () => ({ 흉내: 1 });
        export const doc = (db, ...길) => ({ 길: 길.join('/') });
        export const getDoc = async (r) => {
            const 것 = (window.__창고 = window.__창고 || {})[r.길];
            return { exists: () => !!것, data: () => 것 };
        };
        export const setDoc = async (r, d) => {
            (window.__창고 = window.__창고 || {})[r.길] = JSON.parse(JSON.stringify(d));
            window.__창고셈 = (window.__창고셈 || 0) + 1;
            window.__마지막길 = r.길;
        };`,
};
const 허수아비꽂기 = 통 => 통.route('**/firebasejs/**', r => {
    const 이름 = Object.keys(허수아비).find(n => r.request().url().endsWith(n));
    return r.fulfill({ status: 200, contentType: 'text/javascript',
                       body: 이름 ? 허수아비[이름] : 'export {};' });
});

const b = await 브라우저열기({ args: ['--no-sandbox'] });
const 폰 = { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const ctx = await b.newContext(폰);
await 허수아비꽂기(ctx);
const p = await ctx.newPage();
const 터짐 = [];
p.on('pageerror', e => 터짐.push(e.message));
p.on('console', m => { if (m.type() === 'error') 터짐.push('콘솔: ' + m.text()); });

const 봄 = () => p.evaluate(() => {
    const u = document.getElementById('l-undo');
    const s = document.getElementById('l-save');
    const d = (() => { try { return JSON.parse(localStorage.getItem('layout.도면.v3') || 'null'); }
                       catch (e) { return null; } })();
    const 본 = (() => { try { return JSON.parse(localStorage.getItem('layout.저장본.v1') || '[]'); }
                        catch (e) { return []; } })();
    return {
        뒤로글: u.textContent.trim(), 뒤로꺼짐: u.disabled,
        단계: (u.textContent.match(/(\d+)/) || [0, '0'])[1] | 0,
        창고글: s.textContent, 창고갈: s.dataset.창고 || '',
        창고셈: window.__창고셈 || 0, 마지막길: window.__마지막길 || '',
        쪽지: document.getElementById('l-note').textContent,
        저장판: !document.getElementById('l-save-sheet').hidden,
        저장목록: [...document.querySelectorAll('.l저장줄 .l저장이름 b')].map(e => e.textContent),
        저장판쪽지: document.getElementById('l-save-msg').textContent,
        저장본: 본,
        수: document.querySelectorAll('.lmc:not(.조각), .lgrp').length,
        기계들: d ? d['기계들'] : null,
        바닥담김: d ? d['바닥'] : null,
        바닥px: (() => { const f = document.getElementById('l-floor').getBoundingClientRect();
                        return Math.round(f.width) + '×' + Math.round(f.height); })(),
    };
});
const 눌러 = async (id, 쉼 = 250) => { await p.click('#' + id); await p.waitForTimeout(쉼); };
const 깨끗이 = async (도면벌 = true) => {
    await p.evaluate(ks => { ks.forEach(k => localStorage.removeItem(k));
                             window.__창고 = {}; window.__창고셈 = 0; }, 열쇠들);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(560);
    if (도면벌) { await p.click('#l-sheet'); await p.waitForTimeout(560); }
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
                             await p.waitForTimeout(40); await p.mouse.up(); await p.waitForTimeout(160); };
async function 끌어(area, dx, dy) {
    await 보이게(area);
    const 그것 = await 점(area);
    if (!그것 || !그것.잡히나) return false;
    await p.mouse.move(그것.x, 그것.y); await p.mouse.down();
    for (let i = 1; i <= 7; i++) { await p.mouse.move(그것.x + dx * i / 7, 그것.y + dy * i / 7); await p.waitForTimeout(22); }
    await p.mouse.up(); await p.waitForTimeout(300);
    return true;
}
/* ⚠ 담긴 것에서만 읽으면 **아직 한 번도 안 고친 처음**에는 비어 있다
   (손대기 전에는 안 담긴다). 화면에 그려진 것에서 되재어 늘 값이 나오게 한다. */
const 재단기자리 = () => p.evaluate(([가로, 세로]) => {
    const e = document.querySelector('.lmc[data-area="기계:재단기"]');
    if (!e) return null;
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const r = e.getBoundingClientRect();
    const 돈 = document.getElementById('l-turn').getAttribute('aria-pressed') === 'true';
    const 왼 = (r.left - f.left) / f.width, 위 = (r.top - f.top) / f.height;
    return 돈
        ? { x: Math.round(위 * 가로), y: Math.round(세로 - 왼 * 세로 - r.height / f.height * 세로) }
        : { x: Math.round(왼 * 가로), y: Math.round(위 * 세로) };
}, [바닥.가로, 바닥.세로]);

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ 1. 뒤로가기 — 한 단계씩 ══════════════════════════════════════ */
console.log('\n── 1. 뒤로가기');
재기('처음에는 뒤로가 꺼져 있나', (await 봄()).뒤로꺼짐, (await 봄()).뒤로글);
{
    const 자리들 = [await 재단기자리()];
    for (let n = 1; n <= 3; n++) {
        await 끌어('기계:재단기', 30, 20);
        자리들.push(await 재단기자리());
    }
    const 본것 = await 봄();
    재기('끌 때마다 단계가 쌓이나 (3단계)', 본것.단계 === 3 && !본것.뒤로꺼짐, 본것.뒤로글);
    재기('세 번 끌어 자리가 세 번 바뀌었나',
         자리들.slice(1).every((v, i) => v.x !== 자리들[i].x || v.y !== 자리들[i].y),
         자리들.map(v => v ? v.x + ',' + v.y : '처음').join(' → '));
    /* ⚠ 거꾸로 하나씩 되감긴다 */
    const 되감긴것 = [];
    for (let n = 0; n < 3; n++) { await 눌러('l-undo', 350); 되감긴것.push(await 재단기자리()); }
    const 바란것 = [자리들[2], 자리들[1], 자리들[0]];
    const 틀린것 = 되감긴것.filter((v, i) => !v || !바란것[i]
        || Math.abs(v.x - 바란것[i].x) > 60 || Math.abs(v.y - 바란것[i].y) > 60);
    재기('⚠ 뒤로를 누를 때마다 **한 단계씩 차례로** 돌아오나',
         틀린것.length === 0,
         되감긴것.map(v => v.x + ',' + v.y).join(' → ') + ' / 바란 '
         + 바란것.map(v => v.x + ',' + v.y).join(' → '));
    재기('⚠ 끝까지 되감으면 **도면 참값**(1283,734)으로 돌아오나',
         되감긴것[2] && Math.abs(되감긴것[2].x - 재단기.x) <= 60
                     && Math.abs(되감긴것[2].y - 재단기.y) <= 60,
         되감긴것[2] ? 되감긴것[2].x + ',' + 되감긴것[2].y : '—');
    const 끝 = await 봄();
    재기('다 되감으면 뒤로가 다시 꺼지나', 끝.뒤로꺼짐 && 끝.단계 === 0, 끝.뒤로글);
}

/* ══ 2. 고치는 길 아홉이 다 쌓이나 ════════════════════════════════ */
console.log('\n── 2. 고치는 길마다 쌓이나');
await 깨끗이();
{
    const 길 = [];
    const 재보기 = async (이름, 함) => {
        const 전 = (await 봄()).단계;
        await 함();
        const 후 = (await 봄()).단계;
        길.push({ 이름, 늘었나: 후 === 전 + 1, 전, 후 });
    };
    await 재보기('기계 끌기', () => 끌어('기계:재단기', 30, 20));
    await 재보기('기계 돌리기', async () => { await 눌러('l-mturn', 300); });
    await 재보기('속성 넣기', async () => {
        const 그것 = await 점('기계:재단기');
        await 톡(그것.x, 그것.y); await 톡(그것.x, 그것.y);
        await p.fill('#l-p-name', '재단기');
        await 눌러('l-prop-ok', 350);
    });
    await 재보기('변 잡아 늘리기', async () => {
        await 보이게('기계:재단기');
        /* ⚠ **줄이는 쪽으로** 끈다. 늘리는 쪽은 옆 기계(판넬 자동 투입기)에 막혀
           크기가 한 톨도 안 바뀌고, 그러면 쌓았던 켜가 도로 빠진다 — 앱이
           옳게 한 것이다(10-10 에 재어서 알았다). 손잡이가 앉은 변의 반대로 민다. */
        const 손 = await p.evaluate(() => {
            const h = document.querySelector('.lmc.고름 .lhd');
            if (!h) return null;
            const r = h.getBoundingClientRect();
            const 쪽 = (h.className.match(/lhd-(\S+)/) || ['', ''])[1];
            const 줄임 = { '오른': [-1, 0], '왼': [1, 0], '아래': [0, -1], '위': [0, 1] }[쪽] || [-1, 0];
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, dx: 줄임[0], dy: 줄임[1] };
        });
        if (!손) return;
        await p.mouse.move(손.x, 손.y); await p.mouse.down();
        for (let i = 1; i <= 6; i++) {
            await p.mouse.move(손.x + 손.dx * 40 * i / 6, 손.y + 손.dy * 40 * i / 6);
            await p.waitForTimeout(22);
        }
        await p.mouse.up(); await p.waitForTimeout(300);
    });
    await 재보기('바닥 크기 고치기', async () => {
        await p.click('#l-floor-size'); await p.waitForTimeout(250);
        await p.fill('#l-w', '70.00');
        await 눌러('l-size-ok', 350);
    });
    길.forEach(g => 재기('「' + g.이름 + '」 이 한 단계로 쌓이나', g.늘었나,
                         g.전 + ' → ' + g.후 + '단계'));
    /* 합치기·나누기 */
    await 깨끗이();
    await 눌러('l-many');
    for (const a of ['기계:재단기', '기계:판넬 자동 투입기']) {
        await 보이게(a); const 그것 = await 점(a);
        if (그것 && 그것.잡히나) await 톡(그것.x, 그것.y);
    }
    const 합전 = (await 봄()).단계;
    await 눌러('l-join', 350);
    const 합후 = (await 봄()).단계;
    재기('「합치기」 가 한 단계로 쌓이나', 합후 === 합전 + 1, 합전 + ' → ' + 합후 + '단계');
    await 눌러('l-split', 350);
    const 나후 = (await 봄()).단계;
    재기('「되돌리기(나누기)」 가 한 단계로 쌓이나', 나후 === 합후 + 1, 합후 + ' → ' + 나후 + '단계');
    /* 되감으면 합친 것이 다시 살아난다 */
    await 눌러('l-undo', 350);
    const 되살 = await p.evaluate(() => document.querySelectorAll('.lgrp').length);
    재기('⚠ 되감으면 합쳤던 덩이가 다시 살아나나', 되살 === 1, '덩이 ' + 되살 + '개');
}

/* ══ 3. 안 고친 것은 안 쌓인다 ════════════════════════════════════ */
console.log('\n── 3. 안 고친 것은 안 쌓인다');
await 깨끗이();
{
    const 전 = (await 봄()).단계;
    await 보이게('기계:재단기');
    const 그것 = await 점('기계:재단기');
    await 톡(그것.x, 그것.y);                       // 짚기만
    재기('짚기만 하면 안 쌓이나', (await 봄()).단계 === 전, 전 + ' → ' + (await 봄()).단계);
    await 눌러('l-zin', 250); await 눌러('l-zout', 250);
    재기('확대·축소는 안 쌓이나', (await 봄()).단계 === 전, '단계 ' + (await 봄()).단계);
    const 빈 = await 빈데찾기();
    if (빈) { await p.mouse.move(빈.x, 빈.y); await p.mouse.down();
              for (let i = 1; i <= 6; i++) { await p.mouse.move(빈.x - 40 * i / 6, 빈.y); await p.waitForTimeout(20); }
              await p.mouse.up(); await p.waitForTimeout(200); }
    재기('팬(바닥 끌기)은 안 쌓이나', (await 봄()).단계 === 전, '단계 ' + (await 봄()).단계);
    await 눌러('l-turn', 400);
    재기('⚠ 세로로 돌려 보기는 안 쌓이나 (보는 눈은 고친 것이 아니다)',
         (await 봄()).단계 === 전, '단계 ' + (await 봄()).단계);
    await 눌러('l-turn', 400);
}

/* ══ 4. 벌을 바꾸면 비운다 ════════════════════════════════════════ */
console.log('\n── 4. 벌을 바꾸면');
await 깨끗이();
{
    await 끌어('기계:재단기', 30, 20);
    재기('고쳐서 단계가 쌓였나', (await 봄()).단계 === 1, (await 봄()).뒤로글);
    await 눌러('l-sheet', 600);
    재기('⚠ 벌을 바꾸면 단계가 비나 (다른 벌로 되감으면 안 된다)',
         (await 봄()).뒤로꺼짐, (await 봄()).뒤로글);
    await 눌러('l-sheet', 600);
}

/* ══ 5. 실시간으로 화베에 올라가나 ════════════════════════════════ */
console.log('\n── 5. 실시간으로 화베에');
await 깨끗이();
{
    const 전 = await 봄();
    await 끌어('기계:재단기', 30, 20);
    const 바로 = await 봄();
    재기('고치면 **올리는 중**이라고 바로 보이나',
         바로.창고갈 === '올리는중' || 바로.창고갈 === '올렸음',
         바로.창고갈 + ' · ' + 바로.창고글);
    await p.waitForTimeout(1600);
    const 올린뒤 = await 봄();
    재기('⚠ 1.2초 안에 화베에 **참으로 올라가나**',
         올린뒤.창고셈 > 전.창고셈 && 올린뒤.창고갈 === '올렸음',
         '올린 횟수 ' + 전.창고셈 + ' → ' + 올린뒤.창고셈 + ' · ' + 올린뒤.창고글);
    재기('도면 벌은 제 문서(도면v3)에 올라가나',
         /layout_배치도\/도면v3$/.test(올린뒤.마지막길), 올린뒤.마지막길);
    const 올라간것 = await p.evaluate(() => {
        const d = window.__창고['artifacts/vivivic-4b7ef/public/data/layout_배치도/도면v3'];
        const m = d && d['기계들'].find(x => x['이름'] === '재단기');
        return m ? { x: m.x, y: m.y, 수: d['기계들'].length } : null;
    });
    const 폰것 = await p.evaluate(() => {
        const d = JSON.parse(localStorage.getItem('layout.도면.v3') || 'null');
        const m = d && d['기계들'].find(x => x['이름'] === '재단기');
        return m ? { x: m.x, y: m.y } : null;
    });
    재기('⚠ 화베에 올라간 것이 폰 안의 것과 **같은가**',
         !!올라간것 && !!폰것 && 올라간것.x === 폰것.x && 올라간것.y === 폰것.y && 올라간것.수 === 172,
         올라간것 ? 올라간것.x + ',' + 올라간것.y + ' · 네모 ' + 올라간것.수 : '못 올라갔습니다');
    /* 끄는 **동안**에는 안 올린다 — 초당 수십 번 올리면 쓰기가 터진다 */
    const 끌기전셈 = (await 봄()).창고셈;
    await 보이게('기계:재단기');
    const 그것 = await 점('기계:재단기');
    await p.mouse.move(그것.x, 그것.y); await p.mouse.down();
    for (let i = 1; i <= 20; i++) { await p.mouse.move(그것.x + i * 2, 그것.y); await p.waitForTimeout(18); }
    const 끄는중셈 = (await 봄()).창고셈;
    await p.mouse.up(); await p.waitForTimeout(1600);
    const 뗀뒤셈 = (await 봄()).창고셈;
    재기('⚠ 끄는 **동안**에는 안 올리고, 떼면 올리나 (쓰기가 안 터지게)',
         끄는중셈 === 끌기전셈 && 뗀뒤셈 === 끌기전셈 + 1,
         '끌기 전 ' + 끌기전셈 + ' · 끄는 중 ' + 끄는중셈 + ' · 뗀 뒤 ' + 뗀뒤셈);
}
{
    /* 창고가 안 붙었을 때는 그렇게 알린다 */
    const 막힌통 = await b.newContext(폰);
    await 막힌통.route('**/firebasejs/**', r => r.abort());
    const p2 = await 막힌통.newPage();
    await p2.goto(주소, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(600);
    await p2.click('#l-sheet'); await p2.waitForTimeout(600);
    const e = await p2.evaluate(() => {
        const el = [...document.querySelectorAll('.lmc')].find(x => x.dataset.area === '기계:재단기');
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await p2.mouse.move(e.x, e.y); await p2.mouse.down();
    for (let i = 1; i <= 6; i++) { await p2.mouse.move(e.x + 30 * i / 6, e.y); await p2.waitForTimeout(22); }
    await p2.mouse.up(); await p2.waitForTimeout(500);
    const 막힌것 = await p2.evaluate(() => ({ 갈: document.getElementById('l-save').dataset.창고,
        글: document.getElementById('l-save').textContent,
        담김: !!localStorage.getItem('layout.도면.v3') }));
    재기('창고가 안 붙으면 **그렇게 알리고** 폰에는 담기나',
         막힌것.갈 === '못올림' && 막힌것.담김, 막힌것.글 + ' · 폰담김 ' + 막힌것.담김);
    await 막힌통.close();
}

/* ══ 6. 저장 — 이름 붙여 각각 ═════════════════════════════════════ */
console.log('\n── 6. 저장해 두기');
await 깨끗이();
{
    await 끌어('기계:재단기', 40, 0);
    const 첫자리 = await 재단기자리();
    await 눌러('l-save-btn', 300);
    재기('「저장」 을 누르면 판이 뜨나', (await 봄()).저장판);
    await p.fill('#l-save-name', '첫째 안');
    await 눌러('l-save-do', 350);
    재기('이름 붙여 담기나', (await 봄()).저장목록.includes('첫째 안'),
         (await 봄()).저장목록.join(' · ') + ' · ' + (await 봄()).저장판쪽지);
    await 눌러('l-save-close', 250);
    /* 더 고치고 둘째로 담는다 */
    await 끌어('기계:재단기', 40, 0);
    const 둘째자리 = await 재단기자리();
    await 눌러('l-save-btn', 300);
    await p.fill('#l-save-name', '둘째 안');
    await 눌러('l-save-do', 350);
    const 본것 = await 봄();
    재기('⚠ **각각** 담기나 (둘이 따로 남나)',
         본것.저장목록.length === 2 && 본것.저장목록.includes('첫째 안') && 본것.저장목록.includes('둘째 안'),
         본것.저장목록.join(' · '));
    재기('담긴 둘의 속이 서로 다른가',
         본것.저장본.length === 2
         && JSON.stringify(본것.저장본[0].기계들) !== JSON.stringify(본것.저장본[1].기계들),
         첫자리.x + ',' + 첫자리.y + ' / ' + 둘째자리.x + ',' + 둘째자리.y);
    /* 첫째를 불러온다 */
    const 첫째불 = await p.evaluate(() => {
        const b = [...document.querySelectorAll('.l저장줄')].find(r =>
            r.querySelector('b').textContent === '첫째 안');
        return b ? true : false;
    });
    재기('목록에서 첫째 안을 찾았나', 첫째불);
    await p.click('[data-area="불러오기:첫째 안"]');
    await p.waitForTimeout(500);
    const 불러온뒤 = await 재단기자리();
    재기('⚠ 불러오면 그때 자리로 **돌아오나**',
         !!불러온뒤 && Math.abs(불러온뒤.x - 첫자리.x) <= 60 && Math.abs(불러온뒤.y - 첫자리.y) <= 60,
         (불러온뒤 ? 불러온뒤.x + ',' + 불러온뒤.y : '—') + ' / 바란 ' + 첫자리.x + ',' + 첫자리.y);
    재기('불러오기도 되돌릴 수 있나 (단계가 쌓였다)', !(await 봄()).뒤로꺼짐, (await 봄()).뒤로글);
    await 눌러('l-undo', 400);
    const 되돌린뒤 = await 재단기자리();
    재기('⚠ 불러온 것을 되돌리면 둘째 자리로 가나',
         !!되돌린뒤 && Math.abs(되돌린뒤.x - 둘째자리.x) <= 60
                     && Math.abs(되돌린뒤.y - 둘째자리.y) <= 60,
         (되돌린뒤 ? 되돌린뒤.x + ',' + 되돌린뒤.y : '—') + ' / 바란 ' + 둘째자리.x + ',' + 둘째자리.y);
}

/* ══ 7. 지우기는 두 번 눌러야 ════════════════════════════════════ */
console.log('\n── 7. 지우기');
{
    await 눌러('l-save-btn', 300);
    await p.screenshot({ path: path.join(그림칸, '저장판.png') });   // 판이 **열린** 모습
    const 전 = (await 봄()).저장목록.length;
    await p.click('[data-area="저장본지움:첫째 안"]');
    await p.waitForTimeout(250);
    const 한번 = await 봄();
    재기('한 번 누르면 안 지우고 다시 물어보나',
         한번.저장목록.length === 전 && /한 번 더/.test(한번.저장판쪽지), 한번.저장판쪽지);
    await p.click('[data-area="저장본지움:첫째 안"]');
    await p.waitForTimeout(300);
    const 두번 = await 봄();
    재기('두 번 누르면 지워지나', 두번.저장목록.length === 전 - 1 && !두번.저장목록.includes('첫째 안'),
         두번.저장목록.join(' · ') || '없음');
    await 눌러('l-save-close', 250);
}

/* ══ 8. 벌마다 따로 담긴다 ═══════════════════════════════════════ */
console.log('\n── 8. 벌마다 따로');
{
    await 눌러('l-sheet', 600);                 // 내 배치로
    await 눌러('l-save-btn', 300);
    const 내배치목록 = (await 봄()).저장목록;
    재기('⚠ 「내 배치」 에서는 도면 벌 저장본이 안 보이나',
         !내배치목록.includes('둘째 안'), 내배치목록.join(' · ') || '없음(맞습니다)');
    await p.fill('#l-save-name', '내배치 안');
    await 눌러('l-save-do', 350);
    재기('내 배치에서도 담기나', (await 봄()).저장목록.includes('내배치 안'),
         (await 봄()).저장목록.join(' · '));
    await 눌러('l-save-close', 250);
    await 눌러('l-sheet', 600);                 // 도면으로
    await 눌러('l-save-btn', 300);
    const 도면목록 = (await 봄()).저장목록;
    재기('도면 벌로 돌아오면 제 것만 보이나',
         도면목록.includes('둘째 안') && !도면목록.includes('내배치 안'),
         도면목록.join(' · '));
    await 눌러('l-save-close', 250);
}

/* ══ 9. 닿는 자리 · 넘침 · 도면이 안 작아졌나 ═══════════════════ */
console.log('\n── 9. 닿는 자리와 넘침');
for (const [w, h] of [[375, 812], [375, 667], [320, 568], [320, 480]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(350);
    const 잰 = await p.evaluate(() => {
        const 단 = ['l-undo', 'l-save-btn', 'l-ruler', 'l-sheet', 'l-turn',
                    'l-many', 'l-mturn', 'l-join', 'l-split'].map(i => {
            const e = document.getElementById(i), r = e.getBoundingClientRect();
            return { i, 폭: Math.round(r.width), 높이: Math.round(r.height), 오른: Math.round(r.right) };
        });
        const f = document.getElementById('l-floor').getBoundingClientRect();
        return { 단, 바닥: Math.round(f.width) + '×' + Math.round(f.height),
                 바닥폭: Math.round(f.width),
                 넘침: document.documentElement.scrollWidth > window.innerWidth + 1,
                 발아래: Math.round(document.querySelector('.lbar:last-of-type').getBoundingClientRect().bottom) };
    });
    const 작은것 = 잰.단.filter(d => d.폭 < 44 || d.높이 < 44 || d.오른 > w);
    재기(w + '×' + h + ' — 단추 아홉이 다 44px 이상이고 화면 안인가',
         작은것.length === 0,
         작은것.map(d => d.i + ' ' + d.폭 + '×' + d.높이 + '@' + d.오른).join(' | ')
         || '오른끝 ' + Math.max(...잰.단.map(d => d.오른)) + '/' + w);
    재기(w + '×' + h + ' — 가로로 안 넘치고 단추줄이 화면 안인가',
         !잰.넘침 && 잰.발아래 <= h + 1, '발아래 ' + 잰.발아래 + '/' + h);
    /* ⚠ 줄을 하나 늘렸는데 도면이 작아졌나 — 가로가 먼저 차는 비라 안 작아져야 한다 */
    재기(w + '×' + h + ' — ⚠ 줄이 늘어도 **도면이 안 작아졌나** (가로가 먼저 찬다)',
         잰.바닥폭 === w - 60, '바닥 ' + 잰.바닥 + ' (바란 폭 ' + (w - 60) + ')');
}
await p.setViewportSize({ width: 375, height: 812 });
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

const 초록 = 잰것.filter(x => x.됐나).length, 빨강 = 잰것.length - 초록;
console.log('\n초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 0 (잰 것 모두 ' + 잰것.length + ')');
if (빨강) { console.log('빨강:'); 잰것.filter(x => !x.됐나).forEach(x =>
    console.log('  ✗ ' + x.이름 + (x.곁 ? '   [' + x.곁 + ']' : ''))); }
await b.close();
process.exit(빨강 ? 1 : 0);
