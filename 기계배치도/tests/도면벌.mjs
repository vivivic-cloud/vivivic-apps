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
const 배치열쇠 = 'layout.배치.v2', 도면열쇠 = 'layout.도면.v1', 벌열쇠 = 'layout.벌.v1';

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
        수: document.querySelectorAll('.lmc').length,
        홀금: document.querySelectorAll('.lhall').length,
        보드: document.querySelectorAll('.lboard').length,
        머리: document.getElementById('l-floor-size').textContent.replace('✎', '').trim(),
        쪽지: document.getElementById('l-note').textContent,
        배율글: document.getElementById('l-mag').textContent,
        고름: [...document.querySelectorAll('.lmc.고름, .lmc.여럿')].map(e => e.dataset.id),
        단추: Object.fromEntries(['l-many', 'l-mturn', 'l-join', 'l-split', 'l-turn', 'l-sheet']
            .map(i => { const e = document.getElementById(i), r = e.getBoundingClientRect();
                return [i, { 글: e.textContent.trim(), 꺼짐: !!e.disabled,
                             폭: Math.round(r.width), 높이: Math.round(r.height), 오른: Math.round(r.right) }]; })),
        갈래수: Object.fromEntries(['기', '파', '둥', '방', '문', '밖', '몰'].map(g =>
            [g, document.querySelectorAll('.lmc.갈-' + g).length])),
        넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
        배치담김: 읽('layout.배치.v2'), 도면담김: 읽('layout.도면.v1'), 본벌: localStorage.getItem('layout.벌.v1'),
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
재기('내 배치에는 홀 벽선이 없고 기준 보드판이 있나', 첫.홀금 === 0 && 첫.보드 === 1,
     '홀금 ' + 첫.홀금 + ' · 보드 ' + 첫.보드);
await 눌러('l-sheet', 500);
const 도 = await 봄();
재기('누르면 「도면 그대로」 로 가나', /도면 그대로/.test(도.벌), 도.벌);
재기('도면의 네모 142개가 다 그려졌나', 도.수 === 142, 도.수 + '개');
재기('바닥이 67.8 × 16.8 m 인가 (기계실·엣지집진기가 홀 밖이다)',
     /67\.8\s*×\s*16\.8/.test(도.머리), 도.머리);
재기('홀 벽선(13.8m)이 그어졌나', 도.홀금 === 1, '홀금 ' + 도.홀금);
재기('도면 벌에는 기준 보드판을 안 그리나 (도면에 없는 금이다)', 도.보드 === 0, '보드 ' + 도.보드);
재기('갈래가 갈렸나 — 파레트 50 · 기둥 50 · 기계 18 · 방 3 · 문 2',
     도.갈래수['파'] === 50 && 도.갈래수['둥'] === 50 && 도.갈래수['기'] === 18
     && 도.갈래수['방'] === 3 && 도.갈래수['문'] === 2,
     Object.entries(도.갈래수).map(([k, v]) => k + v).join(' · '));
재기('도면 벌에서도 가로로 안 넘치나', !도.넘친가로);
await p.screenshot({ path: path.join(그림칸, '도면-전체.png') });

/* ══ 2. 참값이 도면과 같나 ═══════════════════════════════════════════ */
console.log('\n── 2. 수치가 캐드 도면 그대로인가');
const 참 = [
    ['재단기', 4000, 4000, 600, 600], ['로버 골드', 4200, 2200, 43805, 1400],
    ['멀티 보링기', 3000, 1600, 23769, 11200], ['기계실', 8000, 3000, 16706, 13800],
    ['엣지집진기', 2500, 1200, 28480, 15007], ['스키퍼 2', 2600, 2000, 34805, 9800],
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
        const 바닥가로 = 67800, 바닥세로 = 16800;
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
     다시도면.수 === 142 && !!다시도면.도면담김, '네모 ' + 다시도면.수);
재기('어느 벌을 보고 있었는지 담기나', 다시도면.본벌 === '도면', '본벌 ' + 다시도면.본벌);
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(520);
const 다시열고 = await 봄();
재기('다시 열어도 보던 벌로 열리나', /도면 그대로/.test(다시열고.벌) && 다시열고.수 === 142,
     다시열고.벌 + ' · 네모 ' + 다시열고.수);

/* ══ 4. 여럿 고르기 ═════════════════════════════════════════════════ */
console.log('\n── 4. 여럿 고르기');
await 깨끗이();
await 눌러('l-sheet', 500);
for (let i = 0; i < 4; i++) await 눌러('l-zin', 150);
/* 파레트 네 장이 2×2 로 모인 데를 고른다 — 사장님이 합치실 바로 그 자리다 */
const 파레트들 = await p.evaluate(() => {
    const 들 = [...document.querySelectorAll('.lmc.갈-파')].map(e => {
        const r = e.getBoundingClientRect();
        return { id: e.dataset.id, 왼: r.left, 위: r.top, 폭: r.width, 높이: r.height };
    });
    // 왼위가 가장 가까운 네 장(2×2 한 무리)
    들.sort((a, b) => a.위 - b.위 || a.왼 - b.왼);
    return 들.slice(0, 40).map(d => d.id);
});
재기('파레트가 50장 다 있나', (await 봄()).갈래수['파'] === 50, '파레트 ' + (await 봄()).갈래수['파'] + '장');
const 무리 = await p.evaluate(() => {
    /* 서로 맞닿은 파레트 네 장(2×2) 한 무리를 찾는다 */
    const 들 = [...document.querySelectorAll('.lmc.갈-파')].map(e => {
        const r = e.getBoundingClientRect();
        return { id: e.dataset.id, x: Math.round(r.left), y: Math.round(r.top),
                 w: Math.round(r.width), h: Math.round(r.height) };
    });
    for (const a of 들) {
        const 오 = 들.find(b => b !== a && Math.abs(b.x - (a.x + a.w)) <= 2 && Math.abs(b.y - a.y) <= 2);
        const 아 = 들.find(b => b !== a && Math.abs(b.y - (a.y + a.h)) <= 2 && Math.abs(b.x - a.x) <= 2);
        const 대 = 오 && 아 && 들.find(b => Math.abs(b.x - 오.x) <= 2 && Math.abs(b.y - 아.y) <= 2);
        if (오 && 아 && 대) return [a.id, 오.id, 아.id, 대.id];
    }
    return null;
});
재기('2×2 로 모인 파레트 네 장을 찾았나', !!무리 && 무리.length === 4, 무리 ? 무리.join(' ') : '못 찾음');
await 보이게(무리[0]);
await 눌러('l-many');
const 여럿켬 = await 봄();
재기('「여럿」 을 누르면 켜지나', /여럿/.test(여럿켬.단추['l-many'].글),
     여럿켬.단추['l-many'].글 + ' · ' + 여럿켬.쪽지);
for (const id of 무리) {
    const 그것 = await 점(id);
    if (그것 && 그것.잡히나) await 톡(그것.x, 그것.y);
}
const 넷고름 = await 봄();
재기('파레트 네 장이 한꺼번에 골라지나', 넷고름.고름.length === 4,
     넷고름.고름.length + '장 · ' + 넷고름.단추['l-many'].글);
재기('여럿 골랐을 때 합치기가 살아나나', !넷고름.단추['l-join'].꺼짐, 넷고름.단추['l-join'].글);
재기('여럿 골랐을 때 돌리기·나누기는 꺼지나 (하나일 때만 되는 일이다)',
     넷고름.단추['l-mturn'].꺼짐 && 넷고름.단추['l-split'].꺼짐,
     '돌리기 ' + 넷고름.단추['l-mturn'].꺼짐 + ' · 나누기 ' + 넷고름.단추['l-split'].꺼짐);
await p.screenshot({ path: path.join(그림칸, '도면-여럿고름.png') });

/* ══ 5. 합치기 ═════════════════════════════════════════════════════ */
console.log('\n── 5. 합치기');
const 합치기전 = await 봄();
await 눌러('l-join', 320);
const 합친뒤 = await 봄();
재기('네 장이 하나가 되나 (142 → 139)', 합친뒤.수 === 합치기전.수 - 3,
     합치기전.수 + ' → ' + 합친뒤.수 + '개');
{
    const 합 = 합친뒤.도면담김['기계들'].find(m => Array.isArray(m['조각']) && m['조각'].length === 4);
    재기('합친 것이 조각 넷을 품고 있나', !!합, 합 ? 합['이름'] : '못 찾음');
    재기('⚠ 합친 것이 네 장을 **꼭 감싸는 크기**인가 (1.2×4 = 2.4 × 2.4 m)',
         !!합 && 합['가로'] === 2400 && 합['세로'] === 2400,
         합 ? 합['가로'] + '×' + 합['세로'] + 'mm' : '—');
    재기('합친 뒤에는 그 하나만 골라져 있나', 합친뒤.고름.length === 1, 합친뒤.고름.length + '개');
    재기('합친 뒤 나누기가 「되돌리기」 로 바뀌나', /되돌리기/.test(합친뒤.단추['l-split'].글),
         합친뒤.단추['l-split'].글);
    재기('합친 것을 알림줄에 적나', /합쳤습니다/.test(합친뒤.쪽지), 합친뒤.쪽지);
}
await p.screenshot({ path: path.join(그림칸, '도면-합침.png') });

/* ══ 6. 되돌리기(나누기) ════════════════════════════════════════════ */
console.log('\n── 6. 되돌리기');
await 눌러('l-split', 320);
const 되돌린뒤 = await 봄();
재기('되돌리면 다시 142개가 되나', 되돌린뒤.수 === 합치기전.수,
     합친뒤.수 + ' → ' + 되돌린뒤.수 + '개');
{
    /* ⚠ 크기로 세면 안 된다 — 「곡면 엣지」 도 1,200×1,200 이라 51 이 나온다.
       갈래가 파레트인 것만 센다. */
    const 파 = 되돌린뒤.도면담김['기계들'].filter(m => m['갈래'] === '파');
    재기('⚠ 파레트 50장이 **한 톨도 안 틀리고** 되살아나나', 파.length === 50,
         파.length + '장 (바란 50장) · 1.2×1.2 크기인 것은 '
         + 되돌린뒤.도면담김['기계들'].filter(m => m['가로'] === 1200 && m['세로'] === 1200).length
         + '개 (곡면 엣지가 섞여 있다)');
    const 합 = 되돌린뒤.도면담김['기계들'].find(m => Array.isArray(m['조각']) && m['조각'].length);
    재기('합친 것이 남아 있지 않나', !합, 합 ? '남았습니다' : '없습니다');
    재기('되돌린 것을 알림줄에 적나', /되돌렸습니다/.test(되돌린뒤.쪽지), 되돌린뒤.쪽지);
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
    재기('재단기 하나가 둘이 되나 (142 → 143)', 나눈뒤.수 === 143, 나눈뒤.수 + '개');
    const 반쪽 = 나눈뒤.도면담김['기계들'].filter(m => m['이름'] === '재단기');
    재기('⚠ 4 × 4 m 가 2 × 4 m 두 쪽으로 갈리나 (합은 그대로)',
         반쪽.length === 2 && 반쪽.every(m => m['가로'] === 2000 && m['세로'] === 4000),
         반쪽.map(m => m['가로'] + '×' + m['세로'] + '@' + m.x + ',' + m.y).join(' · '));
    재기('가른 뒤에도 차지하는 자리가 그대로인가 (0.6~4.6m)',
         반쪽.length === 2 && Math.min(...반쪽.map(m => m.x)) === 600
         && Math.max(...반쪽.map(m => m.x + m['가로'])) === 4600,
         반쪽.map(m => m.x + '~' + (m.x + m['가로'])).join(' · '));
}

/* ══ 8. 삼키는 합치기는 막나 ════════════════════════════════════════ */
console.log('\n── 8. 합치면 다른 네모를 덮을 때');
await 깨끗이();
await 눌러('l-sheet', 500);
for (let i = 0; i < 2; i++) await 눌러('l-zin', 150);
{
    /* 재단기(0.6~4.6m)와 투입기(9.3~11.3m)를 고른다 — 그 둘을 감싸는 테 안에
       **판넬 자동 투입기**(4.6~7.6m)가 통째로 들어간다. 그러니 합치면 안 된다. */
    const 둘 = [await id찾기('재단기'), await id찾기('투입기')].filter(Boolean);
    재기('재단기와 투입기를 찾았나', 둘.length === 2, 둘.join(' '));
    await 눌러('l-many');
    for (const id of 둘) { await 보이게(id); const 그것 = await 점(id); if (그것 && 그것.잡히나) await 톡(그것.x, 그것.y); }
    const 전 = await 봄();
    if (전.고름.length === 2) {
        재기('그 둘을 감싸는 테 안에 판넬 자동 투입기가 들어가 있나', true, '재단기 + 투입기');
        await 눌러('l-join', 320);
        const 후 = await 봄();
        재기('⚠ 합치면 다른 네모를 삼킬 때는 **안 합치고** 그렇게 알리나',
             후.수 === 전.수 && /덮어 버립니다/.test(후.쪽지), 후.쪽지);
    } else {
        재기('⚠ 합치면 다른 네모를 삼킬 때는 **안 합치고** 그렇게 알리나', false,
             '둘을 못 골랐습니다 (' + 전.고름.length + '개)');
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
        return { 단, 수: document.querySelectorAll('.lmc').length,
                 넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1 };
    });
    재기('320px 에서도 안 넘치고 단추가 다 들어가나',
         !좁은것.넘친가로 && 좁은것.단.every(d => d.오른 <= 320 && d.폭 >= 44 && d.높이 >= 44),
         좁은것.단.map(d => d.i.slice(2) + ' ' + d.폭 + '@' + d.오른).join(' · '));
    재기('320px 에서도 도면 네모 142개가 다 서나', 좁은것.수 === 142, 좁은것.수 + '개');
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
