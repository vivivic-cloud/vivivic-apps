/* 기계배치도 — **참 공장(67,800 × 13,800mm · 기계 스물)** 을 폰 375px 에서
   확대·축소·팬으로 볼 수 있나, 기계 하나하나를 돌릴 수 있나 재는 시험.

       node 기계배치도/tests/확대팬돌리기.mjs

   사장님 말씀(10-07)
     「이 배치에 맞게 니가 생각한 수치로 지금 형태의 배치도를 세팅해줘
      니가 생각한 각 기기별 객체화 해서 회전 이동 등이 가능해야해」
     「스케치업처럼 축소 확대해서 전체 도는 일부를 볼 수 있게 해주고
      팬기능으로 잡고이동 하면서 볼 수 있게 해줘」

   ⚠ 이 통에는 본보기를 깔지 않는다 — **앱이 제 처음 배치(참 공장)로 서는 것**을
      재는 통이다. 다른 다섯 통은 10,000×8,000 본보기로 그대로 잰다.
   ⚠ 두 손가락 벌리기는 플레이라이트의 쥐로는 못 한다(쥐는 하나다). 그 한 가지만
      **쪽 안에서 포인터 사건을 손으로 만들어** 잰다 — 그 자리에 그렇게 적는다.
      진짜 손가락 둘은 사장님 폰에서만 난다. */
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
const 폰열쇠 = 'layout.배치.v2';
/* 사장님 캐드 도면(…2026_1007_A.dwg)에서 꺼낸 참값. 앱과 따로 적어 둔다 —
   같은 곳을 보면 둘이 같이 틀려도 모른다. */
const 참바닥 = { 가로: 67800, 세로: 13800 };
const 참기계 = [
    ['재단기', 4000, 4000, 600, 600], ['판넬 자동 투입기', 3000, 1600, 4600, 2000],
    ['투입기', 2000, 1400, 9339, 64], ['엣지밴더 1', 7000, 600, 11400, 600],
    ['엣지밴더 2', 7000, 600, 21400, 600], ['엣지밴더 3', 7000, 600, 11400, 3800],
    ['엣지밴더 4', 7000, 600, 21400, 3800], ['엣지밴더 1(아래)', 7000, 600, 11400, 11024],
    ['적재기 1', 2000, 1400, 28400, 260], ['적재기 2', 2000, 1400, 28400, 3288],
    ['엣지 보관대', 600, 1600, 20737, 9996], ['멀티 보링기', 3000, 1600, 23769, 11200],
    ['스키퍼 1', 800, 2000, 37205, 1000], ['스키퍼 2', 2600, 2000, 34805, 9800],
    ['로버 골드', 4200, 2200, 43805, 1400], ['로버24', 4200, 2200, 42605, 10200],
    ['곡면 엣지 1', 2000, 2000, 50405, 1400], ['곡면 엣지 2', 1200, 1200, 49205, 11200],
    ['지에스더 그린테크 작업실', 9300, 5000, 58500, 0],
    ['에이엠티 조립·자재보관·회의실', 9300, 8800, 58500, 5000],
];

const b = await 브라우저열기({ args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 },
                                 deviceScaleFactor: 2, hasTouch: true, isMobile: true });
/* 이 통은 www.gstatic.com 에 못 닿는다 — 파이어베이스 모듈을 허수아비로 갈아 끼운다 */
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
    const 담김 = JSON.parse(localStorage.getItem('layout.배치.v2') || 'null');
    return {
        바닥폭: f.width, 바닥높: f.height, 바닥왼: f.left, 바닥위: f.top,
        바닥오른: f.right, 바닥아래: f.bottom,
        창왼: v.left, 창위: v.top, 창폭: v.width, 창높: v.height,
        배율글: document.getElementById('l-mag').textContent,
        쪽지: document.getElementById('l-note').textContent,
        기계수: document.querySelectorAll('.lmc').length,
        손잡이: [...document.querySelectorAll('.lhd')].map(h =>
            h.dataset.누구 + ':' + h.dataset.축 + ':' + h.className.match(/lhd-(\S+)/)[1]),
        고른것: (document.querySelector('.lmc.고름') || {}).dataset
                ? document.querySelector('.lmc.고름').dataset.id : null,
        돌리기단: { 꺼짐: document.getElementById('l-mturn').disabled,
                    글: document.getElementById('l-mturn').textContent },
        확대단: { 더: document.getElementById('l-zin').disabled,
                  덜: document.getElementById('l-zout').disabled,
                  전체: document.getElementById('l-zall').disabled },
        넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
        넘친세로: document.documentElement.scrollHeight > window.innerHeight + 1,
        기계들: 담김 ? (담김['기계들'] || []).map(m =>
            [m['이름'], m['가로'], m['세로'], m.x, m.y, m['각'] | 0]) : null,
        바닥담김: 담김 ? 담김['바닥'] : null,
        그려진것: [...document.querySelectorAll('.lmc')].map(e => {
            const r = e.getBoundingClientRect();
            return { 이름: e.querySelector('.lnm').textContent, id: e.dataset.id,
                     폭: r.width, 높이: r.height, 왼: r.left, 위: r.top };
        }),
    };
});
const 앱값 = () => p.evaluate(() => {
    // 앱이 들고 있는 참값 — 담긴 것이 없을 때도 재야 한다
    const f = document.getElementById('l-floor');
    return { 바닥: f.dataset.area, };
});
const 눌러 = async (id, 쉼 = 200) => { await p.click('#' + id); await p.waitForTimeout(쉼); };
const 깨끗이 = async () => {
    await p.evaluate(k => localStorage.removeItem(k), 폰열쇠);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
};
const 기계점 = id => p.evaluate(i => {
    const e = document.querySelector('.lmc[data-id="' + i + '"]');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const 거기 = document.elementFromPoint(x, y);
    return { x, y, 폭: r.width, 높이: r.height,
             잡히나: !!(거기 && 거기.closest('.lmc') && 거기.closest('.lmc').dataset.id === i) };
}, id);
/* 기계도 손잡이도 없는, 창 안에 든 바닥 한 점. 바닥 변 손잡이(변에서 −24~+4px)도 피한다 */
const 빈데찾기 = () => p.evaluate(() => {
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const v = document.getElementById('l-view').getBoundingClientRect();
    for (let gy = 0.08; gy < 0.95; gy += 0.06) for (let gx = 0.05; gx < 0.98; gx += 0.04) {
        const x = f.left + f.width * gx, y = f.top + f.height * gy;
        if (x < v.left + 34 || x > v.right - 34 || y < v.top + 34 || y > v.bottom - 34) continue;
        const 거기 = document.elementFromPoint(x, y);
        if (거기 && !거기.closest('.lmc') && !거기.closest('.lhd') && !거기.closest('.lzb')
            && 거기.closest('#l-view')) return { x, y };
    }
    return null;
});
const 끌기 = async (x, y, dx, dy, 칸수 = 8) => {
    await p.mouse.move(x, y);
    await p.mouse.down();
    for (let i = 1; i <= 칸수; i++) {
        await p.mouse.move(x + dx * i / 칸수, y + dy * i / 칸수);
        await p.waitForTimeout(22);
    }
    await p.mouse.up(); await p.waitForTimeout(160);
};
/* 확대하면 67.8m 공장의 대부분이 창 밖으로 나간다 — **팬으로 찾아간다.**
   앱 속을 들여다보지 않고, 사장님이 하실 그 손짓(빈 바닥 끌기)으로만 움직인다. */
async function 기계보이게(id, 몇번 = 6) {
    for (let k = 0; k < 몇번; k++) {
        const 잰 = await p.evaluate(i => {
            const e = document.querySelector('.lmc[data-id="' + i + '"]');
            if (!e) return null;
            const r = e.getBoundingClientRect(), v = document.getElementById('l-view').getBoundingClientRect();
            return { dx: (v.left + v.width / 2) - (r.left + r.width / 2),
                     dy: (v.top + v.height / 2) - (r.top + r.height / 2) };
        }, id);
        if (!잰) return false;
        if (Math.abs(잰.dx) < 40 && Math.abs(잰.dy) < 40) break;
        const 빈 = await 빈데찾기();
        if (!빈) break;
        await 끌기(빈.x, 빈.y, Math.max(-260, Math.min(260, 잰.dx)),
                               Math.max(-260, Math.min(260, 잰.dy)), 6);
    }
    const 점 = await 기계점(id);
    return !!(점 && 점.잡히나);
}
const 톡 = async (x, y) => { await p.mouse.move(x, y); await p.mouse.down();
                             await p.waitForTimeout(40); await p.mouse.up();
                             await p.waitForTimeout(140); };

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ 1. 참 공장 수치로 서나 ══════════════════════════════════════════ */
console.log('\n── 1. 사장님 캐드 도면의 참값으로 서나');
const 첫 = await 봄();
const 머리글 = await p.evaluate(() => document.getElementById('l-floor-size').textContent);
재기('바닥이 67.8 × 13.8 m 로 서나', /67\.8\s*×\s*13\.8/.test(머리글), 머리글.replace('✎', '').trim());
재기('기계 스물이 다 그려졌나', 첫.기계수 === 20, 첫.기계수 + '대');
{
    const 그려진 = 첫.그려진것.map(e => e.이름);
    const 빠진것 = 참기계.map(m => m[0]).filter(n => !그려진.includes(n));
    재기('도면에 적힌 이름 스물이 다 있나', 빠진것.length === 0, 빠진것.join(' · ') || '다 있습니다');
}
/* 처음 배치가 스스로 겹쳐 있으면 안 된다 — 겹친 채로 서면 그 기계를 못 끈다 */
{
    const 겹친것 = [];
    for (let i = 0; i < 참기계.length; i++) for (let j = i + 1; j < 참기계.length; j++) {
        const [an, aw, ah, ax, ay] = 참기계[i], [bn, bw, bh, bx, by] = 참기계[j];
        if (ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah) 겹친것.push(an + '↔' + bn);
    }
    재기('처음 배치에서 기계끼리 겹친 것이 없나', 겹친것.length === 0, 겹친것.join(' · ') || '없음');
}
{
    const 넘은것 = 참기계.filter(([n, w, h, x, y]) =>
        x < 0 || y < 0 || x + w > 참바닥.가로 || y + h > 참바닥.세로).map(m => m[0]);
    재기('처음 배치에서 벽을 넘은 기계가 없나', 넘은것.length === 0, 넘은것.join(' · ') || '없음');
}
재기('처음에는 「전체」 로 서나', /^전체/.test(첫.배율글), 첫.배율글);
재기('전체에서 바닥이 보는 창 안에 들어오나',
     첫.바닥왼 >= 첫.창왼 - 0.5 && 첫.바닥오른 <= 첫.창왼 + 첫.창폭 + 0.5
     && 첫.바닥위 >= 첫.창위 - 0.5 && 첫.바닥아래 <= 첫.창위 + 첫.창높 + 0.5,
     '바닥 ' + Math.round(첫.바닥폭) + '×' + Math.round(첫.바닥높)
     + ' · 창 ' + Math.round(첫.창폭) + '×' + Math.round(첫.창높));
재기('가로로 넘치지 않나', !첫.넘친가로 && !첫.넘친세로);
재기('67.8:13.8 비(4.913)가 지켜졌나',
     Math.abs(첫.바닥폭 / 첫.바닥높 - 67800 / 13800) < 0.05,
     (첫.바닥폭 / 첫.바닥높).toFixed(3) + ' / 바란 ' + (67800 / 13800).toFixed(3));
await p.screenshot({ path: path.join(그림칸, '참공장-전체.png') });

/* ══ 2. 왜 확대가 있어야 하나 — 수로 적어 둔다 ═══════════════════════ */
console.log('\n── 2. 전체로만 보면 얼마나 작은가 (확대가 있어야 하는 까닭)');
const 재단기전체 = 첫.그려진것.find(e => e.이름 === '재단기');
const 제일작은 = 첫.그려진것.reduce((a, c) => Math.min(c.폭, c.높이) < Math.min(a.폭, a.높이) ? c : a);
재기('ⓘ 전체에서 재단기가 몇 px 인가 (44px 자에 못 미치는 것을 적어 둔다)', true,
     Math.round(재단기전체.폭) + '×' + Math.round(재단기전체.높이) + 'px — 4,000×4,000mm');
재기('ⓘ 전체에서 제일 작은 기계가 몇 px 인가', true,
     제일작은.이름 + ' ' + Math.round(제일작은.폭) + '×' + Math.round(제일작은.높이) + 'px');
재기('전체만으로는 기계를 짚을 수 없다는 것이 맞나 (그래서 확대가 있다)',
     Math.min(재단기전체.폭, 재단기전체.높이) < 44,
     '재단기 ' + Math.round(Math.min(재단기전체.폭, 재단기전체.높이)) + 'px < 44px');

/* ══ 3. ＋ 로 커지나 ════════════════════════════════════════════════ */
console.log('\n── 3. 확대·축소 단추');
재기('전체에서는 − 와 「전체」 가 눌리지 않게 꺼져 있나',
     첫.확대단.덜 && 첫.확대단.전체 && !첫.확대단.더,
     '더 ' + !첫.확대단.더 + ' · 덜 ' + !첫.확대단.덜 + ' · 전체 ' + !첫.확대단.전체);
await 눌러('l-zin');
const 한번 = await 봄();
재기('＋ 를 한 번 누르면 커지나', 한번.바닥폭 > 첫.바닥폭 * 1.3,
     Math.round(첫.바닥폭) + ' → ' + Math.round(한번.바닥폭) + 'px · ' + 한번.배율글);
재기('커진 뒤에는 − 와 「전체」 가 살아나나', !한번.확대단.덜 && !한번.확대단.전체);
재기('확대해도 기계의 참 자리(mm)는 한 톨도 안 바뀌나',
     한번.기계들 === null || JSON.stringify(한번.기계들) === JSON.stringify(첫.기계들),
     한번.기계들 === null ? '담긴 것 없음(확대는 담지 않는다 — 보는 눈일 뿐이다)' : '같음');
/* 몇 번 눌러야 재단기가 손가락에 닿는 44px 이 되나 */
let 누름 = 1;
while (누름 < 10) {
    const 지금 = await 기계점('m01');
    if (지금 && Math.min(지금.폭, 지금.높이) >= 44) break;
    await 눌러('l-zin', 160); 누름++;
}
const 큰재단기 = await 기계점('m01');
재기('＋ 를 몇 번 누르면 재단기가 44px 자를 넘나',
     큰재단기 && Math.min(큰재단기.폭, 큰재단기.높이) >= 44,
     누름 + '번 → ' + Math.round(큰재단기.폭) + '×' + Math.round(큰재단기.높이) + 'px');
const 큰것 = await 봄();
재기('크게 본 뒤에도 가로로 넘치지 않나', !큰것.넘친가로 && !큰것.넘친세로, 큰것.배율글);
await p.screenshot({ path: path.join(그림칸, '참공장-확대.png') });
await 눌러('l-zall');
const 되돌림 = await 봄();
재기('「전체」 를 누르면 처음 크기로 돌아오나',
     Math.abs(되돌림.바닥폭 - 첫.바닥폭) < 1 && /^전체/.test(되돌림.배율글),
     Math.round(되돌림.바닥폭) + 'px · ' + 되돌림.배율글);
재기('전체보다 더 작게는 안 줄어드나(− 가 꺼지나)', 되돌림.확대단.덜);

/* ══ 4. 팬 — 잡고 끌어 옮긴다 ═══════════════════════════════════════ */
console.log('\n── 4. 팬 (빈 바닥을 잡고 끌기)');
/* ⚠ 바닥이 창보다 납작하면 그 쪽으로는 **가운데에 붙는다**(볼 것이 없으니까).
   67.8 : 13.8 공장은 전체에서 323×66px 이라, 세로로도 끌려면 창(608px)보다
   높아지게 키워야 한다 — ＋ 를 여섯 번(16.8배) 누르면 1,100px 가 된다. */
for (let i = 0; i < 6; i++) await 눌러('l-zin', 140);
const 팬전 = await 봄();
재기('＋ 를 여섯 번 누르면 바닥이 창보다 커지나 (세로로도 끌 수 있게)',
     팬전.바닥폭 > 팬전.창폭 && 팬전.바닥높 > 팬전.창높,
     '바닥 ' + Math.round(팬전.바닥폭) + '×' + Math.round(팬전.바닥높)
     + ' · 창 ' + Math.round(팬전.창폭) + '×' + Math.round(팬전.창높) + ' · ' + 팬전.배율글);
const 빈데 = await 빈데찾기();
재기('빈 바닥을 짚을 자리가 있나', !!빈데, 빈데 ? Math.round(빈데.x) + ',' + Math.round(빈데.y) : '못 찾음');
const 끈px = { x: -60, y: -40 };
await p.mouse.move(빈데.x, 빈데.y);
await p.mouse.down();
for (let i = 1; i <= 8; i++) {
    await p.mouse.move(빈데.x + 끈px.x * i / 8, 빈데.y + 끈px.y * i / 8);
    await p.waitForTimeout(25);
}
const 끄는중 = await 봄();
await p.mouse.up(); await p.waitForTimeout(200);
const 팬뒤 = await 봄();
재기('⚠ 빈 바닥을 끌면 바닥이 **끈 px 만큼** 따라오나 (1:1)',
     Math.abs((팬뒤.바닥왼 - 팬전.바닥왼) - 끈px.x) <= 1.5
     && Math.abs((팬뒤.바닥위 - 팬전.바닥위) - 끈px.y) <= 1.5,
     '끈 ' + 끈px.x + ',' + 끈px.y + ' → 바닥이 '
     + (팬뒤.바닥왼 - 팬전.바닥왼).toFixed(1) + ',' + (팬뒤.바닥위 - 팬전.바닥위).toFixed(1) + ' 갔다');
재기('팬은 기계의 참 자리(mm)를 안 건드리나',
     JSON.stringify(팬뒤.기계들) === JSON.stringify(팬전.기계들),
     팬뒤.기계들 === null ? '담긴 것 없음' : '같음');
재기('팬은 배율을 안 바꾸나', 팬뒤.배율글 === 팬전.배율글,
     팬전.배율글 + ' → ' + 팬뒤.배율글);
재기('팬이 끌리는 동안에도 바닥이 따라오나(떼고 나서만이 아니라)',
     Math.abs(끄는중.바닥왼 - 팬전.바닥왼) > 10, '끄는 중 ' + (끄는중.바닥왼 - 팬전.바닥왼).toFixed(1) + 'px');
/* 바닥을 창 밖으로 날려 보내지 않는다 — 한참 끌어 본다 */
await p.mouse.move(빈데.x, 빈데.y);
await p.mouse.down();
for (let i = 1; i <= 10; i++) { await p.mouse.move(빈데.x - 600 * i / 10, 빈데.y - 600 * i / 10); await p.waitForTimeout(20); }
await p.mouse.up(); await p.waitForTimeout(200);
const 멀리 = await 봄();
재기('⚠ 아무리 끌어도 바닥이 창 밖으로 안 날아가나 (손잡이 자리 26px 은 남나)',
     멀리.바닥오른 >= 멀리.창왼 + 26 - 1 && 멀리.바닥아래 >= 멀리.창위 + 26 - 1
     && 멀리.바닥왼 <= 멀리.창왼 + 멀리.창폭 - 26 + 1 && 멀리.바닥위 <= 멀리.창위 + 멀리.창높 - 26 + 1,
     '바닥 오른끝 ' + Math.round(멀리.바닥오른 - 멀리.창왼) + 'px · 아래끝 '
     + Math.round(멀리.바닥아래 - 멀리.창위) + 'px (창 ' + Math.round(멀리.창폭) + '×' + Math.round(멀리.창높) + ')');
await p.screenshot({ path: path.join(그림칸, '참공장-팬.png') });
/* 바닥이 창보다 납작한 쪽은 **가운데에 붙는다** — 내가 정한 규칙이다.
   볼 것이 없는 쪽으로 끌리면 공장이 화면에서 밀려 사라져 다시 찾기가 어렵다. */
await 눌러('l-zall');
await 눌러('l-zin'); await 눌러('l-zin');          // 가로만 넘치는 배율
const 납작 = await 봄();
const 납작빈데 = await 빈데찾기();
await 끌기(납작빈데.x, 납작빈데.y, -50, -120);
const 납작뒤 = await 봄();
재기('바닥이 창보다 납작한 쪽(세로)으로는 안 끌리고 가운데에 붙나',
     납작.바닥높 < 납작.창높 && Math.abs(납작뒤.바닥위 - 납작.바닥위) < 1
     && Math.abs(납작뒤.바닥왼 - 납작.바닥왼 + 50) < 1.5,
     '바닥높 ' + Math.round(납작.바닥높) + ' < 창높 ' + Math.round(납작.창높)
     + ' · 끈 −50,−120 → 바닥이 ' + (납작뒤.바닥왼 - 납작.바닥왼).toFixed(0) + ','
     + (납작뒤.바닥위 - 납작.바닥위).toFixed(0) + ' 갔다');
await 눌러('l-zall');

/* ══ 5. 고르기 ══════════════════════════════════════════════════════ */
console.log('\n── 5. 기계 고르기 (손잡이는 고른 기계에만)');
await 깨끗이();
const 고르기전 = await 봄();
재기('아무것도 안 골랐을 때는 바닥 손잡이 둘만 있나',
     고르기전.손잡이.length === 2 && 고르기전.손잡이.every(h => /^바닥/.test(h)),
     고르기전.손잡이.join(' · '));
재기('기계 돌리기 단추가 꺼져 있나', 고르기전.돌리기단.꺼짐, 고르기전.돌리기단.글);
/* 스물 가운데 가장 큰 것으로 — 전체 배율에서도 짚을 수 있어야 한다 */
await 눌러('l-zin'); await 눌러('l-zin'); await 눌러('l-zin');
/* 로버 골드는 공장 오른쪽 끝(43.8m)이라 확대하면 창 밖이다 — **팬으로 찾아간다.**
   이것이 사장님이 쓰실 길 그대로다: 키우고, 잡고 끌어 그 기계 앞으로 간다. */
const 찾았나 = await 기계보이게('m15');
const 로버 = await 기계점('m15');
재기('키운 뒤 팬으로 로버 골드까지 찾아가 짚을 수 있나', 찾았나 && 로버 && 로버.잡히나,
     로버 ? Math.round(로버.폭) + '×' + Math.round(로버.높이) + 'px · 화면 '
            + Math.round(로버.x) + ',' + Math.round(로버.y) : '못 찾음');
await 톡(로버.x, 로버.y);
const 골랐다 = await 봄();
재기('톡 치면 그 기계가 골라지나', 골랐다.고른것 === 'm15', 골랐다.고른것);
재기('고른 기계에만 가로·세로 손잡이가 나나',
     골랐다.손잡이.filter(h => /^m15/.test(h)).length === 2
     && 골랐다.손잡이.filter(h => /^m(?!15)/.test(h)).length === 0,
     골랐다.손잡이.join(' · '));
재기('기계 돌리기 단추가 살아나고 그 기계 이름을 적나',
     !골랐다.돌리기단.꺼짐 && /로버/.test(골랐다.돌리기단.글), 골랐다.돌리기단.글);

/* ══ 6. 기계를 돌린다 ═══════════════════════════════════════════════ */
console.log('\n── 6. 기계 하나하나 돌리기 (90°)');
await 눌러('l-mturn');
const 돈뒤 = await 봄();
const 돈로버 = 돈뒤.기계들 && 돈뒤.기계들.find(m => m[0] === '로버 골드');
재기('◰ 를 누르면 각이 90° 로 담기나', !!돈로버 && 돈로버[5] === 90,
     돈로버 ? '각 ' + 돈로버[5] + '°' : '안 담겼습니다');
재기('⚠ 돌려도 가로·세로 값은 그대로인가 (4,200×2,200 은 그 기계의 이름값이다)',
     !!돈로버 && 돈로버[1] === 4200 && 돈로버[2] === 2200,
     돈로버 ? 돈로버[1] + '×' + 돈로버[2] : '—');
재기('⚠ 돌려도 놓인 자리(x·y)는 그대로인가 (왼위 모서리에서 돈다)',
     !!돈로버 && 돈로버[3] === 43805 && 돈로버[4] === 1400,
     돈로버 ? 돈로버[3] + ',' + 돈로버[4] : '—');
{
    const 전 = 골랐다.그려진것.find(e => e.id === 'm15');
    const 후 = 돈뒤.그려진것.find(e => e.id === 'm15');
    재기('⚠ 화면에서 차지하는 자리가 **뒤바뀌나** (4.2×2.2 → 2.2×4.2)',
         Math.abs(후.폭 - 전.높이) < 1.5 && Math.abs(후.높이 - 전.폭) < 1.5,
         Math.round(전.폭) + '×' + Math.round(전.높이) + ' → ' + Math.round(후.폭) + '×' + Math.round(후.높이) + 'px');
    재기('돌려도 왼위 모서리가 제자리인가(화면에서도)',
         Math.abs(후.왼 - 전.왼) < 1.5 && Math.abs(후.위 - 전.위) < 1.5,
         '왼위 ' + Math.round(전.왼) + ',' + Math.round(전.위) + ' → ' + Math.round(후.왼) + ',' + Math.round(후.위));
}
재기('돌린 뒤 손잡이가 **자라는 쪽으로 옮겨 앉나** (가로가 아래로)',
     돈뒤.손잡이.includes('m15:가로:아래') && 돈뒤.손잡이.includes('m15:세로:오른'),
     돈뒤.손잡이.filter(h => /^m15/.test(h)).join(' · '));
재기('돌린 것을 알림줄에 적나', /90°/.test(돈뒤.쪽지), 돈뒤.쪽지);
/* 네 번 누르면 제자리 */
await 눌러('l-mturn'); await 눌러('l-mturn'); await 눌러('l-mturn');
const 네번 = await 봄();
const 제자리 = 네번.기계들.find(m => m[0] === '로버 골드');
재기('네 번 누르면 처음 각(0°)으로 돌아오나', 제자리[5] === 0, '각 ' + 제자리[5] + '°');
재기('네 번 돌아도 자리와 크기가 처음 그대로인가',
     제자리[1] === 4200 && 제자리[2] === 2200 && 제자리[3] === 43805 && 제자리[4] === 1400,
     제자리.slice(1).join(' · '));
/* 돌린 채로 다시 열어도 돌아 있나 */
await 눌러('l-mturn');
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(500);
const 다시열고 = await 봄();
{
    const 로 = 다시열고.기계들.find(m => m[0] === '로버 골드');
    재기('다시 열어도 돌린 채로 열리나', 로[5] === 90, '각 ' + 로[5] + '°');
    const 그려진 = 다시열고.그려진것.find(e => e.id === 'm15');
    재기('다시 열어도 화면에서 돌린 모습으로 그려지나 (세로가 더 길다)',
         그려진.높이 > 그려진.폭 * 1.6,
         Math.round(그려진.폭) + '×' + Math.round(그려진.높이) + 'px');
}
/* 돌릴 자리가 없으면 안 돌리고 그렇게 알린다.
   엣지밴더 1 은 7,000×600 이다 — 90° 로 돌리면 세로로 7,000mm 를 먹는데
   바로 아래 3,800 에 엣지밴더 3 이 있어 걸린다. */
await 깨끗이();
await 눌러('l-zin'); await 눌러('l-zin');
{
    await 기계보이게('m04');
    const 점 = await 기계점('m04');
    if (점 && 점.잡히나) {
        await 톡(점.x, 점.y);
        const 전 = await 봄();
        await 눌러('l-mturn');
        const 후 = await 봄();
        const 밴더 = 후.기계들 ? 후.기계들.find(m => m[0] === '엣지밴더 1') : null;
        재기('⚠ 돌릴 자리가 없으면 **안 돌리나** (엣지밴더 1 은 아래에 엣지밴더 3 이 있다)',
             전.고른것 === 'm04' && (!밴더 || 밴더[5] === 0),
             밴더 ? '각 ' + 밴더[5] + '°' : '담긴 것 없음(안 돌렸으니 안 담긴다)');
        재기('못 돌린 까닭을 알림줄에 적나', /돌릴 자리가 없습니다/.test(후.쪽지), 후.쪽지);
    } else {
        재기('⚠ 돌릴 자리가 없으면 **안 돌리나**', false, '엣지밴더 1 을 못 짚었습니다');
        재기('못 돌린 까닭을 알림줄에 적나', false, '위와 같은 까닭');
    }
}
/* 돌린 기계를 끌면 뒤바뀐 자리대로 벽에 막히나 */
await 깨끗이();
await 눌러('l-zin'); await 눌러('l-zin');
{
    await 기계보이게('m13');
    const 점 = await 기계점('m13');                       // 스키퍼 1 — 800×2000
    await 톡(점.x, 점.y);
    await 눌러('l-mturn');                                // 90° → 2000×800 을 차지한다
    const 돈것 = await 봄();
    const 스 = 돈것.기계들.find(m => m[0] === '스키퍼 1');
    재기('스키퍼 1 을 돌리면 2,000 × 800 을 차지하나', !!스 && 스[5] === 90,
         스 ? '각 ' + 스[5] + '° · 가로세로값은 ' + 스[1] + '×' + 스[2] : '—');
    /* ⚠ **작은 기계가 제 손잡이에 몸통을 뺏기지 않나.**
       스키퍼 1 은 2.6배에서 25×10px 인데 손잡이는 28×44px 이다. 손잡이를 변 안으로
       4px 물려 두었더니 손잡이가 몸통 한가운데를 덮어, 끌면 기계가 옮겨지는 대신
       0.1m 로 **쪼그라들었다**(10-07 에 그림을 눈으로 보고 잡았다). 그 뒤로는 잰다. */
    const 돈점 = await 기계점('m13');
    재기('⚠ 손잡이보다 작은 기계도 가운데를 짚으면 **몸통**이 잡히나',
         !!(돈점 && 돈점.잡히나),
         돈점 ? '스키퍼 1 ' + Math.round(돈점.폭) + '×' + Math.round(돈점.높이)
                + 'px · 몸통이 잡힘 ' + 돈점.잡히나 : '못 찾음');
    const 끌기전크기 = (await 봄()).기계들.find(m => m[0] === '스키퍼 1');
    await p.mouse.move(돈점.x, 돈점.y);
    await p.mouse.down();
    for (let i = 1; i <= 10; i++) { await p.mouse.move(돈점.x - 400 * i / 10, 돈점.y - 400 * i / 10); await p.waitForTimeout(20); }
    await p.mouse.up(); await p.waitForTimeout(250);
    const 끈뒤 = await 봄();
    const 스2 = 끈뒤.기계들.find(m => m[0] === '스키퍼 1');
    재기('⚠ 몸통을 끌었을 때 크기가 안 바뀌나 (손잡이에 안 뺏겼나)',
         스2[1] === 끌기전크기[1] && 스2[2] === 끌기전크기[2],
         끌기전크기[1] + '×' + 끌기전크기[2] + ' → ' + 스2[1] + '×' + 스2[2]);
    재기('돌린 기계도 벽 앞에서 서나 (왼·위 벽 0,0)', 스2[3] >= 0 && 스2[4] >= 0,
         스2[3] + ',' + 스2[4]);
    재기('몸통을 끌면 **옮겨지나** (제자리에 안 서 있나)',
         스2[3] !== 37205 || 스2[4] !== 1000, '37205,1000 → ' + 스2[3] + ',' + 스2[4]);
    const 겹친것 = [];
    끈뒤.기계들.forEach((a, i) => 끈뒤.기계들.forEach((c, j) => {
        if (j <= i) return;
        const w = x => (x[5] % 180) ? x[2] : x[1], h = x => (x[5] % 180) ? x[1] : x[2];
        if (a[3] < c[3] + w(c) && c[3] < a[3] + w(a) && a[4] < c[4] + h(c) && c[4] < a[4] + h(a))
            겹친것.push(a[0] + '↔' + c[0]);
    }));
    재기('⚠ 돌린 기계를 끌어도 다른 기계와 안 겹치나', 겹친것.length === 0,
         겹친것.join(' · ') || '없음');
}
await p.screenshot({ path: path.join(그림칸, '참공장-돌린기계.png') });

/* ══ 7. 두 손가락 벌리기 ════════════════════════════════════════════
   ⚠ 플레이라이트의 쥐는 하나다 — 이 한 가지만 쪽 안에서 포인터 사건을
      **손으로 만들어** 잰다. 진짜 손가락 둘은 사장님 폰에서만 난다.
      그래도 셈(배율·붙든 자리·끌던 것 되돌리기)은 다 여기서 재진다. */
console.log('\n── 7. 두 손가락 벌리기 (포인터 사건을 손으로 만들어 잰다)');
await 깨끗이();
const 핀치전 = await 봄();
const 핀치 = await p.evaluate(() => {
    const v = document.getElementById('l-view');
    const r = v.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const 내기 = (종, id, x, y) => v.dispatchEvent(new PointerEvent(종, {
        pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true,
        pointerType: 'touch', isPrimary: id === 1 }));
    내기('pointerdown', 1, cx - 30, cy);
    내기('pointerdown', 2, cx + 30, cy);
    const 전배율 = document.getElementById('l-mag').textContent;
    for (let i = 1; i <= 6; i++) {           // 60px → 240px 로 벌린다 (네 배)
        const d = 30 + 90 * i / 6;
        내기('pointermove', 1, cx - d, cy);
        내기('pointermove', 2, cx + d, cy);
    }
    const 후배율 = document.getElementById('l-mag').textContent;
    const f = document.getElementById('l-floor').getBoundingClientRect();
    내기('pointerup', 1, cx - 120, cy);
    내기('pointerup', 2, cx + 120, cy);
    return { 전배율, 후배율, 바닥폭: f.width, cx, cy };
});
await p.waitForTimeout(200);
재기('두 손가락을 벌리면 커지나', 핀치.바닥폭 > 핀치전.바닥폭 * 2.5,
     Math.round(핀치전.바닥폭) + ' → ' + Math.round(핀치.바닥폭) + 'px');
재기('벌린 배(네 배)만큼 커지나', Math.abs(핀치.바닥폭 / 핀치전.바닥폭 - 4) < 0.4,
     (핀치.바닥폭 / 핀치전.바닥폭).toFixed(2) + '배 / 바란 4배');
재기('배율 글이 따라 바뀌나', 핀치.전배율 !== 핀치.후배율,
     핀치.전배율 + ' → ' + 핀치.후배율);
{
    const 뒤 = await 봄();
    재기('두 손가락으로 커져도 기계의 참 자리(mm)는 안 바뀌나',
         뒤.기계들 === null, 뒤.기계들 === null ? '담긴 것 없음(보는 눈일 뿐이다)' : '담겼습니다');
    재기('벌린 뒤에도 바닥이 창 안에 걸쳐 있나(날아가지 않나)',
         뒤.바닥오른 >= 뒤.창왼 && 뒤.바닥왼 <= 뒤.창왼 + 뒤.창폭,
         '바닥 왼 ' + Math.round(뒤.바닥왼 - 뒤.창왼) + ' ~ 오른 ' + Math.round(뒤.바닥오른 - 뒤.창왼)
         + ' (창 0~' + Math.round(뒤.창폭) + ')');
}
/* 손가락 둘이 되면 끌던 기계를 제자리로 되돌린다 */
await 깨끗이();
await 눌러('l-zin'); await 눌러('l-zin');
{
    await 기계보이게('m15');
    const 점 = await 기계점('m15');
    const 되돌림잰것 = await p.evaluate(([x, y]) => {
        const v = document.getElementById('l-view');
        const el = document.querySelector('.lmc[data-id="m15"]');
        const 내기 = (대상, 종, id, px, py) => 대상.dispatchEvent(new PointerEvent(종, {
            pointerId: id, clientX: px, clientY: py, bubbles: true, cancelable: true,
            pointerType: 'touch', isPrimary: id === 1 }));
        const 첫 = el.getBoundingClientRect().left;
        내기(el, 'pointerdown', 1, x, y);                  // 기계를 집는다
        내기(el, 'pointermove', 1, x - 40, y);             // 끈다
        const 끌던자리 = el.getBoundingClientRect().left;
        내기(v, 'pointerdown', 2, x + 60, y);              // 두 번째 손가락이 닿는다
        const 되돌린자리 = el.getBoundingClientRect().left;
        내기(v, 'pointerup', 1, x - 40, y);
        내기(v, 'pointerup', 2, x + 60, y);
        return { 첫, 끌던자리, 되돌린자리, 잡힌것: document.querySelectorAll('.lmc.잡힘').length };
    }, [점.x, 점.y]);
    재기('⚠ 손가락이 둘이 되면 끌던 기계를 **제자리로 되돌리나**',
         Math.abs(되돌림잰것.되돌린자리 - 되돌림잰것.첫) < 1.5
         && 되돌림잰것.잡힌것 === 0,
         '처음 ' + Math.round(되돌림잰것.첫) + ' → 끌던 중 ' + Math.round(되돌림잰것.끌던자리)
         + ' → 둘째 손가락 뒤 ' + Math.round(되돌림잰것.되돌린자리));
}

/* ══ 8. 44px 자 · 넘침 ═════════════════════════════════════════════ */
console.log('\n── 8. 닿는 자리와 넘침');
await 깨끗이();
const 단추들 = await p.evaluate(() => ['l-zin', 'l-zout', 'l-zall', 'l-mturn', 'l-turn'].map(id => {
    const e = document.getElementById(id), r = e.getBoundingClientRect();
    return { id, 폭: Math.round(r.width), 높이: Math.round(r.height), 오른: Math.round(r.right) };
}));
const 작은단추 = 단추들.filter(d => d.폭 < 44 || d.높이 < 44);
재기('확대·축소·전체·기계돌리기·돌리기 단추가 다 44px 이상인가',
     작은단추.length === 0,
     작은단추.length ? 작은단추.map(d => d.id + ' ' + d.폭 + '×' + d.높이).join(' | ')
                     : 단추들.map(d => d.id + ' ' + d.폭 + '×' + d.높이).join(' · '));
재기('단추가 다 화면 안에 있나(375px)', 단추들.every(d => d.오른 <= 375),
     '오른끝 ' + Math.max(...단추들.map(d => d.오른)) + ' / 375');
{   // 확대판이 바닥 손잡이를 덮지 않나 — 처음에 이것으로 한 번 넘어졌다
    const 가린것 = [];
    for (const 축 of ['가로', '세로']) {
        const 잰 = await p.evaluate(a => {
            const h = [...document.querySelectorAll('.lhd')].find(x => x.dataset.누구 === '바닥' && x.dataset.축 === a);
            if (!h) return { 없음: true };
            const r = h.getBoundingClientRect();
            const x = r.left + r.width / 2, y = r.top + r.height / 2;
            const 거기 = document.elementFromPoint(x, y);
            return { 잡히나: !!(거기 && 거기.closest('.lhd') === h),
                     덮은것: 거기 ? (거기.id || 거기.className || 거기.tagName) : '없음' };
        }, 축);
        if (!잰.잡히나) 가린것.push(축 + '(' + (잰.덮은것 || '없음') + ')');
    }
    재기('⚠ 확대판이 바닥 손잡이를 덮지 않나', 가린것.length === 0,
         가린것.join(' · ') || '둘 다 잡힙니다');
}
/* 돌려서(세로로) 보는 채로도 같은가 */
await 눌러('l-turn');
const 세로로 = await 봄();
재기('세로로 돌려 봐도 바닥이 창 안에 들어오나',
     세로로.바닥왼 >= 세로로.창왼 - 0.5 && 세로로.바닥오른 <= 세로로.창왼 + 세로로.창폭 + 0.5
     && 세로로.바닥위 >= 세로로.창위 - 0.5 && 세로로.바닥아래 <= 세로로.창위 + 세로로.창높 + 0.5,
     '바닥 ' + Math.round(세로로.바닥폭) + '×' + Math.round(세로로.바닥높));
재기('세로로 돌려도 가로로 안 넘치나', !세로로.넘친가로);
{
    const 가린것 = [];
    for (const 축 of ['가로', '세로']) {
        const 잰 = await p.evaluate(a => {
            const h = [...document.querySelectorAll('.lhd')].find(x => x.dataset.누구 === '바닥' && x.dataset.축 === a);
            if (!h) return { 없음: true };
            const r = h.getBoundingClientRect();
            const 거기 = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return { 잡히나: !!(거기 && 거기.closest('.lhd') === h) };
        }, 축);
        if (!잰.잡히나) 가린것.push(축);
    }
    재기('세로로 돌려도 바닥 손잡이 둘이 다 잡히나', 가린것.length === 0,
         가린것.join(' · ') || '둘 다 잡힙니다');
}
await p.screenshot({ path: path.join(그림칸, '참공장-세로로.png') });
await 눌러('l-turn');

/* ══ 9. 320px 좁은 폰 ══════════════════════════════════════════════ */
console.log('\n── 9. 320px 좁은 폰');
const 좁은통 = await b.newContext({ viewport: { width: 320, height: 480 },
                                    deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await 좁은통.route('**/firebasejs/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'export const x=1;' }));
const p2 = await 좁은통.newPage();
await p2.goto(주소, { waitUntil: 'domcontentloaded' });
await p2.waitForTimeout(500);
const 좁은것 = await p2.evaluate(() => {
    const 단 = ['l-zin', 'l-zout', 'l-zall', 'l-mturn', 'l-turn'].map(id => {
        const r = document.getElementById(id).getBoundingClientRect();
        return { id, 폭: Math.round(r.width), 높이: Math.round(r.height), 오른: Math.round(r.right) };
    });
    const f = document.getElementById('l-floor').getBoundingClientRect();
    const v = document.getElementById('l-view').getBoundingClientRect();
    return { 단, 바닥: Math.round(f.width) + '×' + Math.round(f.height),
             창안: f.left >= v.left - 0.5 && f.right <= v.right + 0.5,
             넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
             기계수: document.querySelectorAll('.lmc').length };
});
재기('320px 에서도 가로로 안 넘치나', !좁은것.넘친가로, '바닥 ' + 좁은것.바닥);
재기('320px 에서도 단추가 다 화면 안이고 44px 이상인가',
     좁은것.단.every(d => d.오른 <= 320 && d.폭 >= 44 && d.높이 >= 44),
     좁은것.단.map(d => d.id + ' ' + d.폭 + '×' + d.높이 + '@' + d.오른).join(' · '));
재기('320px 에서도 기계 스물이 다 서나', 좁은것.기계수 === 20, 좁은것.기계수 + '대');
await p2.screenshot({ path: path.join(그림칸, '320-참공장.png') });
await 좁은통.close();

/* ══ 10. 글자가 판 밖으로 반 나가지 않나 ═══════════════════════════
   ⚠ 자로는 안 걸리고 **그림을 눈으로 봐야** 걸리는 자리다. 엣지밴더는
      7,000×600mm 이라 2.6배에서 7px 인데 글줄은 10px 이다 — 글자의 아래 반이
      판 밖으로 나가 흰 바탕 위 흰 글씨가 됐다. 그 뒤로는 자로도 잡는다. */
console.log('\n── 10. 글자가 판 밖으로 반 나가지 않나');
await 깨끗이();
for (const 몇 of [0, 1, 2, 3, 5]) {
    for (let i = 0; i < 몇; i++) await 눌러('l-zin', 110);
    const 삐진것 = await p.evaluate(() => {
        const 잰 = [];
        document.querySelectorAll('.lmc').forEach(el => {
            const r = el.getBoundingClientRect();
            el.querySelectorAll('.lnm, .lsz').forEach(g => {
                if (getComputedStyle(g).display === 'none') return;
                const gr = g.getBoundingClientRect();
                if (gr.height > r.height + 0.5 || gr.bottom > r.bottom + 0.5 || gr.top < r.top - 0.5)
                    잰.push(el.querySelector('.lnm').textContent + ' 글 ' + gr.height.toFixed(0)
                            + 'px > 판 ' + r.height.toFixed(0) + 'px');
            });
        });
        return 잰;
    });
    const 배 = await p.evaluate(() => document.getElementById('l-mag').textContent);
    재기('글자가 판 밖으로 안 나가나 — ' + 배, 삐진것.length === 0,
         삐진것.slice(0, 3).join(' | ') || '다 안쪽입니다');
    if (몇) await 눌러('l-zall', 110);          // 전체에서는 「전체」 단추가 꺼져 있다
}
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

/* ══ 적어 올리기 ═══════════════════════════════════════════════════ */
const 초록 = 잰것.filter(x => x.됐나).length, 빨강 = 잰것.length - 초록;
console.log('\n초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 0 (잰 것 모두 ' + 잰것.length + ')');
if (빨강) { console.log('빨강:'); 잰것.filter(x => !x.됐나).forEach(x =>
    console.log('  ✗ ' + x.이름 + (x.곁 ? '   [' + x.곁 + ']' : ''))); }
await b.close();
process.exit(빨강 ? 1 : 0);
