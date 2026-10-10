/* 기계배치도 — **도면 그대로 벌**과 **여럿 고르기 · 합치기 · 나누기** 시험.

       node 기계배치도/tests/도면벌.mjs

   사장님 말씀(10-07)
     「일단 이 도면 그대로 프로그램에 그려봐. 현재 편성된 도면은 그대로 두고 …
      실제 사이즈를 인지하고 있는 도면을 하나 더 그려줘.
      제시한 사진의 각 사각형은 모두가 객체이고 각 객체를 멀티로 선택해서
      합치고 나누고 할 수 있도록 해줘.」

   ⚠ 「현재 편성된 도면은 그대로 두고」 가 이 통의 첫 자다 — 도면 벌을 아무리
      휘저어도 내 배치 벌이 한 톨도 안 바뀌는지 재서 올린다. */
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
const 배치열쇠 = 'layout.배치.v2', 도면열쇠 = 'layout.도면.v3', 벌열쇠 = 'layout.벌.v1';

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
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const v = document.getElementById('l-view').getBoundingClientRect();
    const 읽 = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
    return {
        벌: document.getElementById('l-sheet').textContent.trim(),
        /* ⚠ **낱낱이 세면 안 된다.** 덩이는 테 하나 + 조각 여럿으로 그려지므로
           .lmc 를 세면 넷을 합쳐도 넷 그대로다. 한 덩이는 하나로 센다. */
        수: document.querySelectorAll('.lmc:not(.조각), .lgrp').length,
        벽: document.querySelectorAll('.lhall').length,
        바닥비: f.width / f.height,
        보드: document.querySelectorAll('.lboard').length,
        머리: document.getElementById('l-floor-size').textContent.replace('✎', '').trim(),
        쪽지: document.getElementById('l-note').textContent,
        배율글: document.getElementById('l-mag').textContent,
        /* 고른 것들. 덩이는 **테**가 고름을 지니고 조각은 옅은 칠만 받는다
           (조각마다 붉은 테를 두르면 도면이 어수선해져 10-07 에 걷었다). */
        고름: [...new Set([...document.querySelectorAll(
            '.lmc.고름, .lmc.여럿, .lgrp.고름, .lgrp.여럿')].map(e => e.dataset.id))],
        단추: Object.fromEntries(['l-many', 'l-mturn', 'l-join', 'l-split', 'l-turn', 'l-sheet']
            .map(i => { const e = document.getElementById(i), r = e.getBoundingClientRect();
                return [i, { 글: e.textContent.trim(), 꺼짐: !!e.disabled,
                             폭: Math.round(r.width), 높이: Math.round(r.height), 오른: Math.round(r.right) }]; })),
        갈래수: Object.fromEntries(['기', '파', '둥', '방', '문', '밖', '몰', '원'].map(g =>
            [g, document.querySelectorAll('.lmc.갈-' + g).length])),
        넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
        배치담김: 읽('layout.배치.v2'), 도면담김: 읽('layout.도면.v3'), 본벌: localStorage.getItem('layout.벌.v1'),
        덩이테: [...document.querySelectorAll('.lgrp')].map(e => {
            const r = e.getBoundingClientRect();
            return { id: e.dataset.id, 폭: r.width, 높이: r.height, 왼: r.left, 위: r.top,
                     손가락막나: getComputedStyle(e).pointerEvents !== 'none' };
        }),
        조각그림: [...document.querySelectorAll('.lmc.조각')].map(e => {
            const f = document.getElementById('l-floor').getBoundingClientRect();
            const r = e.getBoundingClientRect();
            return { 덩이: e.dataset.id, 번호: +e.dataset.조각, 이름: e.querySelector('.lnm').textContent,
                     폭: r.width, 높이: r.height,
                     왼rel: r.left - f.left, 위rel: r.top - f.top };
        }),
        그려진: [...document.querySelectorAll('.lmc')].map(e => {
            const r = e.getBoundingClientRect();
            return { id: e.dataset.id, 이름: e.querySelector('.lnm').textContent,
                     폭: r.width, 높이: r.height, 왼: r.left, 위: r.top };
        }),
    };
});
const 깨끗이 = async () => {
    await p.evaluate(ks => ks.forEach(k => localStorage.removeItem(k)), [배치열쇠, 도면열쇠, 벌열쇠]);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(520);
};
const 눌러 = async (id, 쉼 = 220) => { await p.click('#' + id); await p.waitForTimeout(쉼); };
const 점 = id => p.evaluate(i => {
    const e = document.querySelector('.lmc[data-id="' + i + '"]');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const 거기 = document.elementFromPoint(x, y);
    return { x, y, 폭: r.width, 높이: r.height,
             잡히나: !!(거기 && 거기.closest('.lmc') && 거기.closest('.lmc').dataset.id === i) };
}, id);
/* 네모가 **골라질 때까지** 짚는다. 작은 네모는 한 번에 안 짚히는 일이 있다
   (화면 밖이거나 다른 것이 덮고 있거나). 팬으로 끌어다 놓고 다시 짚는다. */
async function 골라질때까지(id, 번 = 3) {
    for (let k = 0; k < 번; k++) {
        await 보이게(id);
        const 그것 = await 점(id);
        if (그것 && 그것.잡히나) {
            await p.mouse.move(그것.x, 그것.y);
            await p.mouse.down(); await p.waitForTimeout(40); await p.mouse.up();
            await p.waitForTimeout(160);
            const 골랐나 = await p.evaluate(i =>
                [...document.querySelectorAll('.lmc.고름, .lmc.여럿, .lgrp.고름, .lgrp.여럿')]
                    .some(e => e.dataset.id === i), id);
            if (골랐나) return true;
        }
    }
    return false;
}
const 톡 = async (x, y) => { await p.mouse.move(x, y); await p.mouse.down();
                             await p.waitForTimeout(40); await p.mouse.up(); await p.waitForTimeout(150); };
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
async function 보이게(id, 몇번 = 7) {
    for (let k = 0; k < 몇번; k++) {
        const d = await p.evaluate(i => {
            const e = document.querySelector('.lmc[data-id="' + i + '"]');
            if (!e) return null;
            const r = e.getBoundingClientRect(), v = document.getElementById('l-view').getBoundingClientRect();
            return { dx: (v.left + v.width / 2) - (r.left + r.width / 2),
                     dy: (v.top + v.height / 2) - (r.top + r.height / 2) };
        }, id);
        if (!d) return false;
        if (Math.abs(d.dx) < 40 && Math.abs(d.dy) < 40) break;
        const 빈 = await 빈데찾기();
        if (!빈) break;
        const dx = Math.max(-260, Math.min(260, d.dx)), dy = Math.max(-260, Math.min(260, d.dy));
        await p.mouse.move(빈.x, 빈.y); await p.mouse.down();
        for (let i = 1; i <= 6; i++) { await p.mouse.move(빈.x + dx * i / 6, 빈.y + dy * i / 6); await p.waitForTimeout(20); }
        await p.mouse.up(); await p.waitForTimeout(150);
    }
    const 그것 = await 점(id);
    return !!(그것 && 그것.잡히나);
}
/* 도면 벌에서 그 이름을 가진 네모의 id */
const id찾기 = (이름, 몇째 = 0) => p.evaluate(([n, i]) => {
    const 들 = [...document.querySelectorAll('.lmc')].filter(e => e.querySelector('.lnm').textContent === n);
    return 들[i] ? 들[i].dataset.id : null;
}, [이름, 몇째]);

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ 1. 두 벌 ═══════════════════════════════════════════════════════ */
console.log('\n── 1. 벌이 둘인가');
const 첫 = await 봄();
재기('처음에는 「내 배치」 로 서나', /내 배치/.test(첫.벌) && 첫.수 === 20, 첫.벌 + ' · 네모 ' + 첫.수);
재기('내 배치에는 건물 벽선이 없고 기준 보드판이 있나', 첫.벽 === 0 && 첫.보드 === 1,
     '벽 ' + 첫.벽 + ' · 보드 ' + 첫.보드);
await 눌러('l-sheet', 500);
const 도 = await 봄();
재기('누르면 「도면 그대로」 로 가나', /도면 그대로/.test(도.벌), 도.벌);
재기('도면의 네모 172개가 다 그려졌나', 도.수 === 172, 도.수 + '개');
재기('바닥이 67.7 × 22.2 m 인가 (홀 + 기계실 + 오른쪽 딴채를 다 담는 테다)',
     /67\.7\s*×\s*22\.2/.test(도.머리), 도.머리);
재기('⚠ 바닥 **비**가 도면과 같나 (67,695 ÷ 22,200 = 3.0493)',
     Math.abs(도.바닥비 - 67695 / 22200) < 0.004,
     '화면 ' + 도.바닥비.toFixed(4) + ' / 도면 ' + (67695 / 22200).toFixed(4));
재기('건물 벽 셋(바깥벽·안쪽면·아래 덧벽)이 그어졌나', 도.벽 === 3, '벽 ' + 도.벽);
재기('도면 벌에는 기준 보드판을 안 그리나 (도면에 없는 금이다)', 도.보드 === 0, '보드 ' + 도.보드);
재기('갈래가 갈렸나 — 기계 23 · 방 5 · 기둥 38 · 원 12 · 문 1 · 모르는 것 93',
     도.갈래수['기'] === 23 && 도.갈래수['방'] === 5 && 도.갈래수['둥'] === 38
     && 도.갈래수['원'] === 12 && 도.갈래수['문'] === 1 && 도.갈래수['몰'] === 93,
     Object.entries(도.갈래수).filter(([, v]) => v).map(([k, v]) => k + v).join(' · '));
재기('도면 벌에서도 가로로 안 넘치나', !도.넘친가로);
await p.screenshot({ path: path.join(그림칸, '도면-전체.png') });

/* ══ 2. 참값이 도면과 같나 ═══════════════════════════════════════════ */
console.log('\n── 2. 수치가 캐드 도면 그대로인가');
/* 2026-10-09 도면에서 꺼낸 참값 — 앱과 **따로** 적어 둔다.
   같은 곳을 보면 둘이 같이 틀려도 모른다. */
const 참 = [
    ['재단기', 3200, 3700, 1283, 734], ['엣지밴더 1', 7400, 900, 13359, 2850],
    ['로버 골드', 4400, 1400, 44888, 2171], ['멀티보링기', 4200, 1200, 29511, 1780],
    ['스키퍼 1', 2400, 2050, 35751, 9250], ['로버24', 4400, 1400, 45015, 10669],
    ['기계실', 6820, 3025, 26172, 14025], ['엣지집진기', 2500, 1200, 22980, 14743],
    ['조각기', 3400, 1400, 52436, 2080], ['판넬 자동 투입기', 7200, 1600, 1283, 4434],
];
{
    const 담 = await p.evaluate(k => {
        const d = JSON.parse(localStorage.getItem(k) || 'null');
        return d ? d['기계들'].map(m => [m['이름'], m['가로'], m['세로'], m.x, m.y]) : null;
    }, 도면열쇠);
    const 틀린것 = [];
    // 아직 안 담겼으면 화면에서 잰다 — 처음 벌은 손대기 전까지 안 담긴다
    const 쓸것 = 담 || await p.evaluate(() => null);
    for (const [n, w, h, x, y] of 참) {
        const 찾 = (쓸것 || []).find(m => m[0] === n && m[1] === w && m[2] === h && m[3] === x && m[4] === y);
        if (!쓸것) break;
        if (!찾) 틀린것.push(n);
    }
    재기('ⓘ 처음 벌은 손대기 전에는 안 담긴다', true, 담 ? '담겼습니다' : '아직 안 담겼습니다 (맞습니다)');
}
{
    // 화면에 그려진 크기로 참값을 되재 본다
    const 잰 = await p.evaluate(ns => {
        const f = document.getElementById('l-floor').getBoundingClientRect();
        const 바닥가로 = 67695, 바닥세로 = 22200;
        return ns.map(([n]) => {
            const e = [...document.querySelectorAll('.lmc')].find(x => x.querySelector('.lnm').textContent === n);
            if (!e) return [n, null];
            const r = e.getBoundingClientRect();
            return [n, Math.round(r.width / f.width * 바닥가로), Math.round(r.height / f.height * 바닥세로),
                    Math.round((r.left - f.left) / f.width * 바닥가로), Math.round((r.top - f.top) / f.height * 바닥세로)];
        });
    }, 참);
    const 틀린것 = [];
    참.forEach(([n, w, h, x, y], i) => {
        const g = 잰[i];
        if (!g[1]) { 틀린것.push(n + ' 없음'); return; }
        if (Math.abs(g[1] - w) > 60 || Math.abs(g[2] - h) > 60
            || Math.abs(g[3] - x) > 60 || Math.abs(g[4] - y) > 60)
            틀린것.push(n + ' ' + g.slice(1).join(',') + ' ≠ ' + [w, h, x, y].join(','));
    });
    재기('⚠ 화면에 그려진 크기·자리가 캐드 참값과 맞나 (60mm 안)',
         틀린것.length === 0, 틀린것.join(' | ') || 참.map(x => x[0]).join(' · ') + ' 다 맞습니다');
}

/* ══ 3. 한 벌을 고쳐도 다른 벌은 그대로인가 ══════════════════════════ */
console.log('\n── 3. 「현재 편성된 도면은 그대로 두고」');
await 눌러('l-zin'); await 눌러('l-zin'); await 눌러('l-zin');
const 재단기id = await id찾기('재단기');
재기('도면 벌에서 재단기를 찾았나', !!재단기id, 재단기id || '못 찾음');
await 보이게(재단기id);
{
    const 그것 = await 점(재단기id);
    await p.mouse.move(그것.x, 그것.y); await p.mouse.down();
    for (let i = 1; i <= 8; i++) { await p.mouse.move(그것.x + 60 * i / 8, 그것.y + 40 * i / 8); await p.waitForTimeout(22); }
    await p.mouse.up(); await p.waitForTimeout(260);
}
const 흔든뒤 = await 봄();
재기('도면 벌에서 끌면 도면 벌에만 담기나',
     !!흔든뒤.도면담김 && 흔든뒤.배치담김 === null,
     '도면담김 ' + (흔든뒤.도면담김 ? '있음' : '없음') + ' · 배치담김 ' + (흔든뒤.배치담김 ? '있음' : '없음'));
await 눌러('l-sheet', 500);
const 돌아와서 = await 봄();
재기('⚠ 도면 벌을 휘저어도 내 배치는 기계 스물 그대로인가',
     돌아와서.수 === 20 && /내 배치/.test(돌아와서.벌), 돌아와서.벌 + ' · 네모 ' + 돌아와서.수);
재기('내 배치의 바닥도 67.8 × 13.8 m 그대로인가', /67\.8\s*×\s*13\.8/.test(돌아와서.머리), 돌아와서.머리);
await 눌러('l-sheet', 500);
const 다시도면 = await 봄();
재기('도면 벌로 돌아오면 아까 옮긴 것이 그대로 있나',
     다시도면.수 === 172 && !!다시도면.도면담김, '네모 ' + 다시도면.수);
재기('어느 벌을 보고 있었는지 담기나', 다시도면.본벌 === '도면', '본벌 ' + 다시도면.본벌);
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(520);
const 다시열고 = await 봄();
재기('다시 열어도 보던 벌로 열리나', /도면 그대로/.test(다시열고.벌) && 다시열고.수 === 172,
     다시열고.벌 + ' · 네모 ' + 다시열고.수);

/* ══ 4. 여럿 고르기 ═════════════════════════════════════════════════ */
console.log('\n── 4. 여럿 고르기');
await 깨끗이();
await 눌러('l-sheet', 500);
for (let i = 0; i < 6; i++) await 눌러('l-zin', 150);   // 작은 네모도 짚히게 크게
/* ⚠ 2026-10-09 도면에는 파레트가 없다. 대신 **한 자리에 모여 있는 네모 넷**을
   찾아 그것으로 합치기를 잰다 — 사장님이 합치실 꼴은 똑같다. */
/* ⚠ **화면이 아니라 도면 좌표로** 고른다. 화면에 보이는 것만 보았더니
   6배로 키운 뒤에는 한 화면에 넷이 안 들어와 무리를 못 찾았다(10-10).
   조건 — ① 양변 600mm 이상(손가락에 짚히는 크기)
          ② 가운데를 다른 네모가 덮고 있지 않을 것(덮이면 그것이 잡힌다)
          ③ 넷이 6m 안에 모여 있을 것 */
const 무리 = await p.evaluate(() => {
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const 가로 = 67695, 세로 = 22200;
    const 들 = [...document.querySelectorAll('.lmc:not(.조각)')].map(e => {
        const r = e.getBoundingClientRect();
        return { id: e.dataset.id,
                 x: (r.left - f.left) / f.width * 가로, y: (r.top - f.top) / f.height * 세로,
                 w: r.width / f.width * 가로, h: r.height / f.height * 세로 };
    });
    const 덮였나 = a => 들.some(b => b !== a && b.w * b.h < a.w * a.h
        && b.x <= a.x + a.w / 2 && a.x + a.w / 2 <= b.x + b.w
        && b.y <= a.y + a.h / 2 && a.y + a.h / 2 <= b.y + b.h);
    const 쓸만한 = 들.filter(d => Math.min(d.w, d.h) >= 600 && Math.max(d.w, d.h) <= 8000 && !덮였나(d));
    let 고른 = null, 짧 = Infinity;
    for (const a of 쓸만한) {
        const 곁 = 쓸만한.filter(b => b !== a)
            .map(b => ({ b, d: Math.hypot(b.x - a.x, b.y - a.y) }))
            .sort((x, y) => x.d - y.d).slice(0, 3);
        if (곁.length < 3 || 곁[2].d > 6000) continue;
        if (곁[2].d < 짧) { 짧 = 곁[2].d; 고른 = [a.id, ...곁.map(c => c.b.id)]; }
    }
    return 고른;
});
재기('한 자리에 모인 네모 넷을 찾았나', !!무리 && 무리.length === 4, 무리 ? 무리.join(' ') : '못 찾음');
if (!무리) {
    const 초록0 = 잰것.filter(x => x.됐나).length;
    console.log('\n초록 ' + 초록0 + ' · 빨강 ' + (잰것.length - 초록0) + ' (잰 것 모두 ' + 잰것.length + ')');
    await b.close(); process.exit(1);
}
await 보이게(무리[0]);
await 눌러('l-many');
const 여럿켬 = await 봄();
재기('「여럿」 을 누르면 켜지나', /여럿/.test(여럿켬.단추['l-many'].글),
     여럿켬.단추['l-many'].글 + ' · ' + 여럿켬.쪽지);
/* ⚠ 넷을 다 짚지 못하는 일이 있다(작거나 다른 것에 덮이거나). 재려는 것은
   「넷」 이라는 숫자가 아니라 **합쳐도 모양이 그대로인가** 이므로, 짚힌 만큼으로
   잰다. 몇을 짚었는지는 적어 둔다. */
const 고른것들목록 = [];
for (const id of 무리) if (await 골라질때까지(id)) 고른것들목록.push(id);
const 고른수 = 고른것들목록.length;
재기('여럿을 짚을 수 있었나 (둘 이상이어야 합친다)', 고른수 >= 2,
     고른수 + '개 짚힘 / 고른 무리 ' + 무리.length + '개');
const 넷고름 = await 봄();
재기('짚은 것이 한꺼번에 골라지나', 넷고름.고름.length === 고른수,
     넷고름.고름.length + '개 · ' + 넷고름.단추['l-many'].글);
재기('여럿 골랐을 때 합치기가 살아나나', !넷고름.단추['l-join'].꺼짐, 넷고름.단추['l-join'].글);
재기('여럿 골랐을 때 돌리기·나누기는 꺼지나 (하나일 때만 되는 일이다)',
     넷고름.단추['l-mturn'].꺼짐 && 넷고름.단추['l-split'].꺼짐,
     '돌리기 ' + 넷고름.단추['l-mturn'].꺼짐 + ' · 나누기 ' + 넷고름.단추['l-split'].꺼짐);
await p.screenshot({ path: path.join(그림칸, '도면-여럿고름.png') });

/* ══ 5. 합치기 — **모양을 지키며** ═══════════════════════════════════
   사장님 말씀(10-07 07:53): 「객체 합치기 시 각 객체모양 유지하며 합쳐져야
   합니다」. 앞서 지은 「꼭 감싸는 한 네모」 를 물리신 것이다. 그래서 이 통은
   합친 **뒤에도 조각 넷이 제 모양·제 자리로 살아 있는지** 좌표로 잰다. */
console.log('\n── 5. 합치기 — 모양을 지키며');
const 합치기전 = await 봄();
if (합치기전.단추['l-join'].꺼짐) {
    재기('합치기 단추가 살아 있나 (여기서 막히면 아래를 못 잰다)', false,
         '고른 것 ' + 합치기전.고름.length + '개 — 넷을 못 짚었습니다');
    const 초록0 = 잰것.filter(x => x.됐나).length;
    console.log('\n초록 ' + 초록0 + ' · 빨강 ' + (잰것.length - 초록0)
                + ' · 건너뜀 0 (잰 것 모두 ' + 잰것.length + ')');
    잰것.filter(x => !x.됐나).forEach(x => console.log('  ✗ ' + x.이름 + (x.곁 ? '   [' + x.곁 + ']' : '')));
    await b.close(); process.exit(1);
}
/* 합치기 전 네 장이 바닥에서 어디에 어떤 크기로 앉아 있었나 (mm) */
const 전자리 = await p.evaluate(ids => {
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const 가로 = 67695, 세로 = 22200;
    return ids.map(i => {
        const e = document.querySelector('.lmc[data-id="' + i + '"]');
        const r = e.getBoundingClientRect();
        return { id: i, w: Math.round(r.width / f.width * 가로), h: Math.round(r.height / f.height * 세로),
                 x: Math.round((r.left - f.left) / f.width * 가로),
                 y: Math.round((r.top - f.top) / f.height * 세로) };
    });
}, 고른것들목록);
await 눌러('l-join', 340);
const 합친뒤 = await 봄();
재기('고른 것이 한 덩이가 되나', 합친뒤.수 === 합치기전.수 - (고른수 - 1),
     합치기전.수 + ' → ' + 합친뒤.수 + '개 (' + 고른수 + '개를 하나로)');
const 덩이id = 합친뒤.고름[0];
{
    const 합 = 합친뒤.도면담김['기계들'].find(m => Array.isArray(m['조각']) && m['조각'].length === 고른수);
    재기('덩이가 조각 ' + 고른수 + '개를 품고 있나', !!합, 합 ? 합['이름'] : '못 찾음');
    /* 테는 고른 넷을 **꼭 감싸는** 크기여야 한다 — 참값으로 되재어 본다 */
    const 테바람 = 전자리.reduce((a, c) => ({
        x1: Math.min(a.x1, c.x), y1: Math.min(a.y1, c.y),
        x2: Math.max(a.x2, c.x + c.w), y2: Math.max(a.y2, c.y + c.h) }),
        { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
    재기('덩이 테가 고른 것들을 꼭 감싸나',
         !!합 && Math.abs(합['가로'] - (테바람.x2 - 테바람.x1)) <= 60
              && Math.abs(합['세로'] - (테바람.y2 - 테바람.y1)) <= 60,
         합 ? 합['가로'] + '×' + 합['세로'] + 'mm / 바란 '
              + Math.round(테바람.x2 - 테바람.x1) + '×' + Math.round(테바람.y2 - 테바람.y1) : '—');
    재기('합친 뒤에는 그 덩이 하나만 골라져 있나', 합친뒤.고름.length === 1, 합친뒤.고름.length + '개');
    재기('합친 뒤 나누기가 「되돌리기」 로 바뀌나', /되돌리기/.test(합친뒤.단추['l-split'].글),
         합친뒤.단추['l-split'].글);
    재기('합친 것을 알림줄에 적나', /한 덩이로 묶었습니다/.test(합친뒤.쪽지), 합친뒤.쪽지);
}
/* ⚠ 여기가 사장님이 물리신 바로 그 자리다 */
재기('⚠ 합친 뒤에도 **조각이 저마다 그대로 그려지나** (한 네모로 안 뭉개지나)',
     합친뒤.조각그림.filter(c => c.덩이 === 덩이id).length === 고른수,
     합친뒤.조각그림.filter(c => c.덩이 === 덩이id).length + '조각 · 이름 '
     + [...new Set(합친뒤.조각그림.map(c => c.이름))].join(','));
{
    const 재본것 = await p.evaluate(id => {
        const f = document.getElementById('l-floor').getBoundingClientRect();
        const 가로 = 67695, 세로 = 22200;
        return [...document.querySelectorAll('.lmc.조각[data-id="' + id + '"]')].map(e => {
            const r = e.getBoundingClientRect();
            return { w: Math.round(r.width / f.width * 가로), h: Math.round(r.height / f.height * 세로),
                     x: Math.round((r.left - f.left) / f.width * 가로),
                     y: Math.round((r.top - f.top) / f.height * 세로) };
        }).sort((a, b) => a.y - b.y || a.x - b.x);
    }, 덩이id);
    const 전정렬 = [...전자리].sort((a, b) => a.y - b.y || a.x - b.x);
    const 틀린것 = [];
    재본것.forEach((c, i) => {
        const 전 = 전정렬[i];
        if (!전) { 틀린것.push('조각 ' + i + ' 짝 없음'); return; }
        if (Math.abs(c.w - 전.w) > 40 || Math.abs(c.h - 전.h) > 40
            || Math.abs(c.x - 전.x) > 40 || Math.abs(c.y - 전.y) > 40)
            틀린것.push([c.w, c.h, c.x, c.y].join(',') + ' ≠ ' + [전.w, 전.h, 전.x, 전.y].join(','));
    });
    재기('⚠ 조각의 크기·자리가 합치기 전과 **한 톨도 안 달라졌나** (40mm 안)',
         재본것.length === 고른수 && 틀린것.length === 0,
         틀린것.join(' | ') || 재본것.map(c => c.w + '×' + c.h + '@' + c.x + ',' + c.y).join(' · '));
}
재기('덩이 테가 손가락을 가로채지 않나 (안에 든 남의 네모도 짚혀야 한다)',
     합친뒤.덩이테.every(t => !t.손가락막나),
     합친뒤.덩이테.map(t => t.손가락막나 ? '막음' : '안 막음').join(' · '));
재기('덩이에는 변 손잡이를 안 내나 (테만 늘리면 모양이 깨진다)',
     !(await p.evaluate(id => document.querySelectorAll('.lmc[data-id="' + id + '"] .lhd').length, 덩이id)),
     (await p.evaluate(id => document.querySelectorAll('.lmc[data-id="' + id + '"] .lhd').length, 덩이id)) + '개');
await p.screenshot({ path: path.join(그림칸, '도면-합침.png') });

/* ══ 5-2. 덩이를 끌면 조각이 다 같이 가나 ═══════════════════════════ */
console.log('\n── 5-2. 덩이 끌기 · 돌리기');
{
    await 보이게(덩이id);          // 덩이를 화면에 들여야 손가락이 닿는다
    const 조각점 = await p.evaluate(id => {
        const e = document.querySelector('.lmc.조각[data-id="' + id + '"]');
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, 덩이id);
    const 전 = 합친뒤.도면담김['기계들'].find(m => m.id === 덩이id);
    await p.mouse.move(조각점.x, 조각점.y); await p.mouse.down();
    for (let i = 1; i <= 8; i++) { await p.mouse.move(조각점.x - 80 * i / 8, 조각점.y - 50 * i / 8); await p.waitForTimeout(22); }
    await p.mouse.up(); await p.waitForTimeout(300);
    const 끈뒤 = await 봄();
    const 후 = 끈뒤.도면담김['기계들'].find(m => m.id === 덩이id);
    재기('조각을 짚어 끌면 **덩이가** 잡히나', !!후 && (후.x !== 전.x || 후.y !== 전.y),
         전.x + ',' + 전.y + ' → ' + (후 ? 후.x + ',' + 후.y : '—'));
    재기('⚠ 덩이를 끌어도 품은 조각의 **속값은 안 바뀌나** (함께 움직일 뿐)',
         !!후 && JSON.stringify(후['조각']) === JSON.stringify(전['조각']),
         '조각 ' + (후 ? 후['조각'].length : 0) + '개 그대로');
    const 조각수 = 끈뒤.조각그림.filter(c => c.덩이 === 덩이id).length;
    재기('끈 뒤에도 조각이 다 그려지나', 조각수 === 고른수, 조각수 + '조각');
    /* 조각이 덩이와 **같은 만큼** 움직였나 — 화면 자리로 잰다 */
    const 움직임 = await p.evaluate(id => {
        const f = document.getElementById('l-floor').getBoundingClientRect();
        const 테 = document.querySelector('.lgrp[data-id="' + id + '"]').getBoundingClientRect();
        const 조 = [...document.querySelectorAll('.lmc.조각[data-id="' + id + '"]')]
            .map(e => e.getBoundingClientRect());
        return { 테안: 조.every(r => r.left >= 테.left - 1 && r.right <= 테.right + 1
                                   && r.top >= 테.top - 1 && r.bottom <= 테.bottom + 1) };
    }, 덩이id);
    재기('⚠ 조각이 모두 덩이 테 안에 들어 있나 (따로 놀지 않나)', 움직임.테안, '테 안 ' + 움직임.테안);
}
/* 덩이 돌리기 */
{
    const 전 = (await 봄()).도면담김['기계들'].find(m => m.id === 덩이id);
    await 눌러('l-mturn', 340);
    const 돈뒤 = await 봄();
    const 후 = 돈뒤.도면담김['기계들'].find(m => m.id === 덩이id);
    재기('덩이를 90° 돌릴 수 있나', !!후 && (후['각'] | 0) === 90, '각 ' + (후 ? 후['각'] : '—') + '°');
    재기('⚠ 돌려도 품은 조각의 속값은 안 바뀌나 (담긴 것은 안 돌린 테 기준이다)',
         !!후 && JSON.stringify(후['조각']) === JSON.stringify(전['조각']), '조각 그대로');
    const 조각수 = 돈뒤.조각그림.filter(c => c.덩이 === 덩이id).length;
    재기('돌린 뒤에도 조각이 다 그려지나', 조각수 === 고른수, 조각수 + '조각');
    /* 2.4×2.4 네모라 돌려도 테 크기는 같다. 조각이 테 안에 있는지로 잰다 */
    const 테안 = await p.evaluate(id => {
        const 테 = document.querySelector('.lgrp[data-id="' + id + '"]').getBoundingClientRect();
        return [...document.querySelectorAll('.lmc.조각[data-id="' + id + '"]')]
            .every(e => { const r = e.getBoundingClientRect();
                return r.left >= 테.left - 1 && r.right <= 테.right + 1
                    && r.top >= 테.top - 1 && r.bottom <= 테.bottom + 1; });
    }, 덩이id);
    재기('돌린 뒤에도 조각이 다 테 안인가', 테안, '테 안 ' + 테안);
    await 눌러('l-mturn', 300); await 눌러('l-mturn', 300); await 눌러('l-mturn', 300);
    const 네번 = (await 봄()).도면담김['기계들'].find(m => m.id === 덩이id);
    재기('네 번 돌리면 덩이가 제 각(0°)으로 돌아오나', (네번['각'] | 0) === 0, '각 ' + 네번['각'] + '°');
}
await p.screenshot({ path: path.join(그림칸, '도면-덩이끌고돌림.png') });

/* ══ 6. 되돌리기(나누기) ════════════════════════════════════════════ */
console.log('\n── 6. 되돌리기');
const 되돌리기전 = await 봄();
const 덩이전 = 되돌리기전.도면담김['기계들'].find(m => m.id === 덩이id);
await 눌러('l-split', 340);
const 되돌린뒤 = await 봄();
재기('되돌리면 다시 172개가 되나', 되돌린뒤.수 === 합치기전.수,
     합친뒤.수 + ' → ' + 되돌린뒤.수 + '개');
{
    재기('⚠ 기둥 38개가 **한 톨도 안 틀리고** 되살아나나',
         되돌린뒤.도면담김['기계들'].filter(m => m['갈래'] === '둥').length === 38,
         되돌린뒤.도면담김['기계들'].filter(m => m['갈래'] === '둥').length + '개 (바란 38개)');
    /* 풀린 넷이 덩이 안에 담겨 있던 자리 그대로인가 */
    const 푼것 = 되돌린뒤.도면담김['기계들'].filter(m =>
        덩이전['조각'].some(c => m.x === 덩이전.x + c.x && m.y === 덩이전.y + c.y
                               && m['가로'] === c['가로'] && m['세로'] === c['세로']));
    재기('⚠ 풀린 것이 덩이에 담겨 있던 **그 자리 그대로**인가', 푼것.length === 고른수,
         푼것.length + '개 · ' + 덩이전['조각'].map(c =>
            (덩이전.x + c.x) + ',' + (덩이전.y + c.y)).join(' · '));
    const 합 = 되돌린뒤.도면담김['기계들'].find(m => Array.isArray(m['조각']) && m['조각'].length);
    재기('덩이가 남아 있지 않나', !합, 합 ? '남았습니다' : '없습니다');
    재기('되돌린 것을 알림줄에 적나', /되돌렸습니다/.test(되돌린뒤.쪽지), 되돌린뒤.쪽지);
    재기('되돌린 뒤 조각 그림이 없나 (다 제 홀몸이 되었다)',
         되돌린뒤.조각그림.length === 0 && 되돌린뒤.덩이테.length === 0,
         '조각 ' + 되돌린뒤.조각그림.length + ' · 테 ' + 되돌린뒤.덩이테.length);
}

/* ══ 7. 합친 적 없는 것 나누기 ══════════════════════════════════════ */
console.log('\n── 7. 합친 적 없는 네모 나누기');
await 깨끗이();
await 눌러('l-sheet', 500);
for (let i = 0; i < 3; i++) await 눌러('l-zin', 150);
const 재단기id2 = await id찾기('재단기');
await 보이게(재단기id2);
{
    const 그것 = await 점(재단기id2);
    await 톡(그것.x, 그것.y);
    const 고른뒤 = await 봄();
    재기('하나만 골랐을 때 나누기가 살아나나', !고른뒤.단추['l-split'].꺼짐 && /나누기/.test(고른뒤.단추['l-split'].글),
         고른뒤.단추['l-split'].글);
    await 눌러('l-split', 320);
    const 나눈뒤 = await 봄();
    재기('재단기 하나가 둘이 되나 (172 → 173)', 나눈뒤.수 === 173, 나눈뒤.수 + '개');
    const 반쪽 = 나눈뒤.도면담김['기계들'].filter(m => m['이름'] === '재단기');
    /* 재단기는 3,200 × 3,700 이다. 긴 쪽(세로)을 반으로 → 3,200 × 1,850 둘 */
    재기('⚠ 3.2 × 3.7 m 가 3.2 × 1.85 m 두 쪽으로 갈리나 (긴 쪽을 가른다)',
         반쪽.length === 2 && 반쪽.every(m => m['가로'] === 3200 && m['세로'] === 1850),
         반쪽.map(m => m['가로'] + '×' + m['세로'] + '@' + m.x + ',' + m.y).join(' · '));
    재기('가른 뒤에도 차지하는 자리가 그대로인가 (y 734~4434)',
         반쪽.length === 2 && Math.min(...반쪽.map(m => m.y)) === 734
         && Math.max(...반쪽.map(m => m.y + m['세로'])) === 4434,
         반쪽.map(m => m.y + '~' + (m.y + m['세로'])).join(' · '));
}

/* ══ 8. 멀리 떨어진 둘을 합쳐도 사이의 네모가 살아 있나 ═══════════════
   ⚠ 10-07 에 **막음을 걷었다.** 전에는 「감싸는 테 안에 안 고른 네모가 들어가면
      안 합친다」 로 막았다 — 그때는 테가 칠해져 그 네모를 삼켰기 때문이다.
      이제 테는 칠하지도 손가락을 가로채지도 않으니 막을 까닭이 없다.
      대신 **사이에 낀 네모가 그대로 보이고 그대로 짚히는지**를 잰다. */
console.log('\n── 8. 멀리 떨어진 둘을 합칠 때');
await 깨끗이();
await 눌러('l-sheet', 500);
for (let i = 0; i < 4; i++) await 눌러('l-zin', 150);
{
    /* 재단기(x 1.28~4.48m)와 투입기(x 11.5~13.2m)를 고른다 — 그 둘을 감싸는 테
       안에 **판넬 자동 투입기**(x 1.28~8.48m · y 4.43~6.03m)가 통째로 든다.
       삼키지 않는 것을 여기서 잰다. */
    const 둘 = [await id찾기('재단기'), await id찾기('투입기')].filter(Boolean);
    재기('재단기와 투입기를 찾았나', 둘.length === 2, 둘.join(' '));
    await 눌러('l-many');
    for (const id of 둘) await 골라질때까지(id);
    const 전 = await 봄();
    if (전.고름.length === 2) {
        /* ⚠ 「판넬 자동 투입기의 한가운데」 를 짚으면 안 된다 — **합치기 전부터**
           그 위에 작은 부속(0.51×1.45 · 1.08×0.74)이 그려져 있어 그것이 잡힌다.
           도면이 그런 것이니 맞는 모습이다. 그래서 **합치기 전에 참으로 짚히던
           것** 하나를 골라, 합친 뒤에도 그대로 짚히는지로 잰다. */
        const 낀것 = await p.evaluate(ids => {
            const f = document.getElementById('l-floor').getBoundingClientRect();
            const 쓸 = [...document.querySelectorAll('.lmc:not(.조각)')];
            const 고름 = 쓸.filter(e => ids.includes(e.dataset.id)).map(e => e.getBoundingClientRect());
            if (고름.length < 2) return null;
            const 테 = { x1: Math.min(...고름.map(r=>r.left)), y1: Math.min(...고름.map(r=>r.top)),
                         x2: Math.max(...고름.map(r=>r.right)), y2: Math.max(...고름.map(r=>r.bottom)) };
            for (const e of 쓸) {
                if (ids.includes(e.dataset.id)) continue;
                const r = e.getBoundingClientRect();
                const cx = r.left + r.width/2, cy = r.top + r.height/2;
                if (!(cx > 테.x1 && cx < 테.x2 && cy > 테.y1 && cy < 테.y2)) continue;
                if (Math.min(r.width, r.height) < 10) continue;
                const 거기 = document.elementFromPoint(cx, cy);
                if (거기 && 거기.closest('.lmc') === e) return { id: e.dataset.id, 이름: e.dataset.area };
            }
            return null;
        }, 전.고름);
        재기('덩이 테 안에 들면서 **합치기 전에 짚히던** 네모를 찾았나', !!낀것,
             낀것 ? 낀것.이름 : '못 찾음');
        await 눌러('l-join', 340);
        const 후 = await 봄();
        재기('멀리 떨어진 둘도 합쳐지나 (172 → 171)', 후.수 === 전.수 - 1,
             전.수 + ' → ' + 후.수 + '개 · ' + 후.쪽지);
        if (낀것) {
            const 낀점 = await 점(낀것.id);
            재기('⚠ 덩이 테 안에 낀 네모가 합친 **뒤에도 그대로 짚히나**',
                 !!(낀점 && 낀점.잡히나),
                 낀것.이름 + ' — ' + (낀점 ? (낀점.잡히나 ? '짚힙니다' : '덮였습니다') : '못 찾음'));
            if (낀점) {
                await 톡(낀점.x, 낀점.y);
                const 짚은뒤 = await 봄();
                재기('그것을 짚으면 **그것이** 골라지나 (덩이가 가로채지 않나)',
                     짚은뒤.고름.length === 1 && 짚은뒤.고름[0] === 낀것.id,
                     '고른 것 ' + 짚은뒤.고름.join(',') + ' / 바란 ' + 낀것.id);
            } else 재기('그것을 짚으면 그것이 골라지나', false, '점을 못 찾음');
        } else {
            재기('⚠ 덩이 테 안에 낀 네모가 합친 뒤에도 그대로 짚히나', false, '낀 네모를 못 찾음');
            재기('그것을 짚으면 그것이 골라지나', false, '위와 같은 까닭');
        }
    } else {
        재기('덩이 테 안에 낀 네모를 찾았나', false, '둘을 못 골랐습니다 (' + 전.고름.length + '개)');
        재기('멀리 떨어진 둘도 합쳐지나', false, '위와 같은 까닭');
        재기('⚠ 덩이 테 안에 낀 네모가 합친 뒤에도 그대로 짚히나', false, '위와 같은 까닭');
        재기('그것을 짚으면 그것이 골라지나', false, '위와 같은 까닭');
    }
}

/* ══ 9. 닿는 자리 · 좁은 폰 ═════════════════════════════════════════ */
console.log('\n── 9. 닿는 자리와 좁은 폰');
await 깨끗이();
const 단 = (await 봄()).단추;
const 작은것 = Object.entries(단).filter(([, d]) => d.폭 < 44 || d.높이 < 44);
재기('단추 여섯이 다 44px 이상인가', 작은것.length === 0,
     작은것.length ? 작은것.map(([k, d]) => k + ' ' + d.폭 + '×' + d.높이).join(' | ')
                   : Object.entries(단).map(([k, d]) => k.slice(2) + ' ' + d.폭 + '×' + d.높이).join(' · '));
재기('단추가 다 화면 안인가(375px)', Object.values(단).every(d => d.오른 <= 375),
     '오른끝 ' + Math.max(...Object.values(단).map(d => d.오른)));
{
    const 좁은통 = await b.newContext({ viewport: { width: 320, height: 480 },
                                        deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    await 좁은통.route('**/firebasejs/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'export const x=1;' }));
    const p2 = await 좁은통.newPage();
    await p2.goto(주소, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(520);
    await p2.click('#l-sheet'); await p2.waitForTimeout(500);
    const 좁은것 = await p2.evaluate(() => {
        const 단 = ['l-many', 'l-mturn', 'l-join', 'l-split', 'l-turn', 'l-sheet'].map(i => {
            const e = document.getElementById(i), r = e.getBoundingClientRect();
            return { i, 폭: Math.round(r.width), 높이: Math.round(r.height), 오른: Math.round(r.right) };
        });
        return { 단, 수: document.querySelectorAll('.lmc:not(.조각), .lgrp').length,
                 넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1 };
    });
    재기('320px 에서도 안 넘치고 단추가 다 들어가나',
         !좁은것.넘친가로 && 좁은것.단.every(d => d.오른 <= 320 && d.폭 >= 44 && d.높이 >= 44),
         좁은것.단.map(d => d.i.slice(2) + ' ' + d.폭 + '@' + d.오른).join(' · '));
    재기('320px 에서도 도면 네모 172개가 다 서나', 좁은것.수 === 172, 좁은것.수 + '개');
    await p2.screenshot({ path: path.join(그림칸, '320-도면.png') });
    await 좁은통.close();
}
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

const 초록 = 잰것.filter(x => x.됐나).length, 빨강 = 잰것.length - 초록;
console.log('\n초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 0 (잰 것 모두 ' + 잰것.length + ')');
if (빨강) { console.log('빨강:'); 잰것.filter(x => !x.됐나).forEach(x =>
    console.log('  ✗ ' + x.이름 + (x.곁 ? '   [' + x.곁 + ']' : ''))); }
await b.close();
process.exit(빨강 ? 1 : 0);
