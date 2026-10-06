/* 기계배치도 — **돌리기 단추**를 재는 시험.
       node 기계배치도/tests/돌리기.mjs

   관리자가 재어 오라 한 여섯 가지
     ㄱ 돌린 뒤 바닥 크기와 쓰는 세로
     ㄴ 돌린 채로 끌었을 때 **손가락이 간 거리와 기계가 간 mm 가 1:1** 인지
        — 돌리기 **전과 같은 값**이 나와야 한다
     ㄷ 부딪힘 · 벽 막기가 돌린 채로도 똑같이 드는지
     ㄹ 다시 열었을 때 **돌린 것과 자리가 둘 다** 살아 있는지
     ㅁ 단추 높이(44px 이상)
     ㅂ 가로 넘침 0

   ⚠ page.mouse 로 진짜 누른다. CDP dispatchTouchEvent 로는 안 걸린다. */
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
const 폰열쇠 = 'layout.배치.v1';
const 바닥가로 = 10000, 바닥세로 = 8000, 눈금 = 10;
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
    const t = document.getElementById('l-turn');
    const tr = t.getBoundingClientRect();
    const 기계 = [...document.querySelectorAll('.lmc')].map(el => {
        const r = el.getBoundingClientRect();
        return { 이름: el.querySelector('.lnm').textContent,
                 왼: r.left, 위: r.top, 폭: r.width, 높이: r.height,
                 작은변: Math.min(r.width, r.height) };
    });
    return {
        바닥폭: Math.round(f.width), 바닥높: Math.round(f.height),
        화면높: window.innerHeight, 화면폭: window.innerWidth,
        넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
        단추글: t.textContent.trim(), 단추눌림: t.getAttribute('aria-pressed'),
        단추높: Math.round(tr.height), 단추폭: Math.round(tr.width),
        단추오른: Math.round(tr.right),
        기계, 제일작은변: Math.round(Math.min(...기계.map(x => x.작은변))),
        담김: JSON.parse(localStorage.getItem('layout.배치.v1') || 'null'),
    };
});
const 담긴것 = (이름, 것) => (것.담김 ? (것.담김['기계들'] || []).find(x => x['이름'] === 이름) : null);
async function 집을점(이름) {
    return await p.evaluate(nm => {
        const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === nm);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        for (const fy of [0.5, 0.3, 0.7, 0.15, 0.85]) for (const fx of [0.5, 0.25, 0.75, 0.1, 0.9]) {
            const x = r.left + r.width * fx, y = r.top + r.height * fy;
            const 거기 = document.elementFromPoint(x, y);
            if (거기 && 거기.closest('.lmc') === el) return { x, y };
        }
        return null;
    }, 이름);
}
async function 끌기(이름, dx, dy, 칸수 = 8) {
    const 점 = await 집을점(이름);
    if (!점) return { 못잡음: '덮여 있습니다' };
    await p.mouse.move(점.x, 점.y);
    await p.mouse.down();
    await p.waitForTimeout(80);
    const 잡힌 = await p.evaluate(() => {
        const e = document.querySelector('.lmc.잡힘');
        return e ? e.querySelector('.lnm').textContent : null;
    });
    for (let i = 1; i <= 칸수; i++) {
        await p.mouse.move(점.x + dx * i / 칸수, 점.y + dy * i / 칸수);
        await p.waitForTimeout(25);
    }
    const 쪽지 = await p.evaluate(() => document.getElementById('l-note').textContent);
    await p.mouse.up();
    await p.waitForTimeout(250);
    return { 잡힌, 쪽지 };
}
const 깨끗이 = async () => {
    await p.evaluate(k => localStorage.removeItem(k), 폰열쇠);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(450);
};

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ ㅁ 단추 — 있나 · 44px 넘나 · 기본이 안 돌린 것인가 ═══════════════ */
const 처음 = await 봄();
재기('단추가 있고 기본은 「안 돌린 것」 인가',
     처음.단추눌림 === 'false' && 처음.단추글 === '⟲ 세로로',
     '글 「' + 처음.단추글 + '」 · aria-pressed ' + 처음.단추눌림);
재기('ㅁ 단추가 44px 이상인가', 처음.단추높 >= 44 && 처음.단추폭 >= 44,
     처음.단추폭 + '×' + 처음.단추높 + 'px');
재기('단추가 화면 안에 있나', 처음.단추오른 <= 처음.화면폭, 처음.단추오른 + '/' + 처음.화면폭);
재기('ㅂ 돌리기 전 가로 넘침이 없나', !처음.넘친가로);
재기('돌리기 전 바닥이 10,000 쪽이 가로인가',
     Math.abs(처음.바닥높 / 처음.바닥폭 - 8000 / 10000) < 0.012,
     처음.바닥폭 + '×' + 처음.바닥높);

/* ══ ㄴ-앞 돌리기 **전**의 끌기 자 — 뒤에서 이것과 견준다 ═══════════ */
const 전끌 = { x: -40, y: -60 };
await 끌기('집진기', 전끌.x, 전끌.y);
const 전 = await 봄();
const 전담 = 담긴것('집진기', 전);
const 전배율 = 처음.바닥폭 / 바닥가로;
const 전바란 = { x: Math.round((8200 + 전끌.x / 전배율) / 눈금) * 눈금,
                 y: Math.round((6200 + 전끌.y / 전배율) / 눈금) * 눈금 };
재기('돌리기 전 — 끈 px 만큼 mm 가 가나(1:1)',
     Math.abs(전담.x - 전바란.x) <= 눈금 && Math.abs(전담.y - 전바란.y) <= 눈금,
     '끈 px ' + 전끌.x + ',' + 전끌.y + ' → ' + 전담.x + ',' + 전담.y + ' / 바란 ' + 전바란.x + ',' + 전바란.y);

/* ══ ㄱ 돌린다 ═══════════════════════════════════════════════════════ */
await p.click('#l-turn');
await p.waitForTimeout(400);
const 후 = await 봄();
재기('단추를 누르면 돌아가나(10,000 쪽이 세로로)',
     Math.abs(후.바닥폭 / 후.바닥높 - 8000 / 10000) < 0.012 && 후.단추눌림 === 'true',
     후.바닥폭 + '×' + 후.바닥높 + ' · 글 「' + 후.단추글 + '」');
재기('ㄱ 돌리면 바닥이 더 커지나',
     후.바닥높 > 처음.바닥높 && 후.바닥폭 * 후.바닥높 > 처음.바닥폭 * 처음.바닥높,
     '넓이 ' + (처음.바닥폭 * 처음.바닥높) + ' → ' + (후.바닥폭 * 후.바닥높)
     + ' (+' + Math.round(100 * (후.바닥폭 * 후.바닥높 / (처음.바닥폭 * 처음.바닥높) - 1)) + '%)'
     + ' · 쓰는 세로 ' + Math.round(100 * 처음.바닥높 / 처음.화면높) + '% → '
     + Math.round(100 * 후.바닥높 / 후.화면높) + '%');
재기('ㅂ 돌린 뒤에도 가로 넘침이 없나', !후.넘친가로);
재기('돌린 뒤 바닥이 화면 안에 들어오나', 후.바닥폭 <= 후.화면폭 && 후.바닥높 <= 후.화면높,
     후.바닥폭 + '×' + 후.바닥높 + ' / ' + 후.화면폭 + '×' + 후.화면높);
재기('돌려도 제일 작은 기계 변이 44px 이상인가', 후.제일작은변 >= 44,
     처음.제일작은변 + 'px → ' + 후.제일작은변 + 'px');

/* ⚠ 돌려도 참 자리(mm)는 한 톨도 안 바뀌어야 한다 */
재기('돌려도 기계의 참 자리(mm)가 한 톨도 안 바뀌나',
     JSON.stringify((전.담김['기계들'] || []).map(m => [m['이름'], m.x, m.y]))
     === JSON.stringify((후.담김['기계들'] || []).map(m => [m['이름'], m.x, m.y])),
     (후.담김['기계들'] || []).map(m => m['이름'] + ' ' + m.x + ',' + m.y).join(' · '));
재기('돌린 것이 자리와 같은 곳(layout.배치.v1)에 담기나', 후.담김['돌림'] === true,
     '담김.돌림 = ' + JSON.stringify(후.담김['돌림']));
await p.screenshot({ path: path.join(그림칸, '375-돌린뒤.png') });

/* ══ ㄴ 돌린 채로 끌어도 1:1 인가 ════════════════════════════════════
   돌리면 화면 축이 바뀐다 — 손가락을 **아래로** 밀면 x 가 늘고,
   **오른쪽으로** 밀면 y 가 준다. 간 거리는 돌리기 전과 똑같아야 한다. */
/* 깨끗한 자리에서 다시 시작한다 — 위에서 한 번 끌어 둔 집진기 자리로는
   길이 비어 있지 않다(멤브레인프레스가 30mm 앞에 선다). 잰 값을 못 믿게 된다. */
await 깨끗이();
await p.click('#l-turn');
await p.waitForTimeout(400);
const 돌린판 = await 봄();
const 후배율 = 돌린판.바닥높 / 바닥가로;                   // 세로가 10,000 쪽이다
/* ⚠ 길이 **비어 있는** 쪽으로 끌어야 1:1 이 보인다. 다른 기계에 막히면
   거기서 서는 것이 맞는 동작이고, 그건 ㄷ 에서 따로 잰다.
   집진기(8200,6200)에서 화면 왼·위 쪽 — 그 길에 기계가 없다. */
const 민 = { x: 20, y: -30 };                             // 오른쪽 20px · 위 30px
const 끌기전담 = { x: 8200, y: 6200 };                     // 깨끗한 처음 자리
const 돌려끌 = await 끌기('집진기', 민.x, 민.y);
const 끌고 = await 봄();
const 끌고담 = 담긴것('집진기', 끌고);
const 바란 = { x: Math.round((끌기전담.x + 민.y / 후배율) / 눈금) * 눈금,
               y: Math.round((끌기전담.y - 민.x / 후배율) / 눈금) * 눈금 };
재기('ㄴ 끈 길에 다른 기계가 없었나(막혔으면 1:1 이 안 보인다)',
     !/막혔습니다/.test(돌려끌.쪽지 || ''), 돌려끌.쪽지 || '');
재기('돌린 채로도 그 기계가 잡히나', 돌려끌.잡힌 === '집진기', String(돌려끌.잡힌 || 돌려끌.못잡음));
재기('ㄴ 돌린 채로도 끈 px 만큼 mm 가 가나(1:1)',
     Math.abs(끌고담.x - 바란.x) <= 눈금 && Math.abs(끌고담.y - 바란.y) <= 눈금,
     '끈 px ' + 민.x + ',' + 민.y + ' → ' + 끌기전담.x + ',' + 끌기전담.y
     + ' 에서 ' + 끌고담.x + ',' + 끌고담.y + ' / 바란 ' + 바란.x + ',' + 바란.y);
const 화면간 = (() => {
    const a = 돌린판.기계.find(m => m.이름 === '집진기'), c = 끌고.기계.find(m => m.이름 === '집진기');
    return { dx: c.왼 - a.왼, dy: c.위 - a.위 };
})();
재기('ㄴ 돌린 채로 손가락이 간 px 만큼 기계도 화면에서 가나',
     Math.abs(화면간.dx - 민.x) < 2 && Math.abs(화면간.dy - 민.y) < 2,
     '손가락 ' + 민.x + ',' + 민.y + ' → 기계 ' + 화면간.dx.toFixed(1) + ',' + 화면간.dy.toFixed(1));
재기('10mm 눈금에 떨어졌나', 끌고담.x % 눈금 === 0 && 끌고담.y % 눈금 === 0,
     끌고담.x + ',' + 끌고담.y);

/* ══ ㄷ 돌린 채로 부딪힘 · 벽 막기 ═══════════════════════════════════ */
await 깨끗이();
await p.click('#l-turn');
await p.waitForTimeout(400);
/* 벽 — 집진기(8200,6200)를 화면 왼·아래로 세게 민다.
   돌림에서 화면 아래 = x 가 느는 쪽, 화면 왼 = y 가 느는 쪽. 그 길은 비어 있다.
   두 벽(x 10000-1500=8500 · y 8000-1500=6500)에 동시에 걸려야 한다. */
await 끌기('집진기', -600, 600, 10);
const 벽 = 담긴것('집진기', await 봄());
재기('ㄷ 돌린 채로도 두 벽을 안 넘나', 벽.x === 10000 - 1500 && 벽.y === 8000 - 1500,
     '집진기 ' + 벽.x + ',' + 벽.y + ' / 벽 ' + (10000 - 1500) + ',' + (8000 - 1500));
// 부딪힘 — 패널쏘(400,400~4200,3700) 쪽으로 민다
await 깨끗이();
await p.click('#l-turn');
await p.waitForTimeout(400);
const 밀 = await 끌기('보링기', 0, -400, 12);
const 부딪 = 담긴것('보링기', await 봄());
const 겹친 = await p.evaluate(k => {
    const ms = JSON.parse(localStorage.getItem(k))['기계들']; const 것 = [];
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
        const a = ms[i], c = ms[j];
        if (a.x < c.x + c['가로'] && c.x < a.x + a['가로'] && a.y < c.y + c['세로'] && c.y < a.y + a['세로'])
            것.push(a['이름'] + ' ↔ ' + c['이름']);
    } return 것;
}, 폰열쇠);
재기('ㄷ 돌린 채로도 기계끼리 안 겹치나', 겹친.length === 0, 겹친.join(' | ') || '없음');
재기('ㄷ 돌린 채로도 다른 기계 앞에서 서나(패널쏘 오른끝 4200)',
     부딪.x === 4200 && 부딪.y === 600, 부딪.x + ',' + 부딪.y + ' · 잡힌 것 ' + 밀.잡힌);
재기('ㄷ 막혔을 때 돌린 채로도 쪽지에 적히나',
     /다른 기계에 막혔습니다/.test(밀.쪽지 || ''), 밀.쪽지 || '');

/* ══ ㄹ 다시 열면 돌린 것과 자리가 둘 다 사나 ════════════════════════ */
await 끌기('집진기', -25, -35);
await p.waitForTimeout(1500);
const 닫기전 = await 봄();
const 닫기전담 = (닫기전.담김['기계들'] || []).map(m => m['이름'] + ' ' + m.x + ',' + m.y).join(' · ');
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
const 열고 = await 봄();
재기('ㄹ 다시 열어도 돌린 채로 열리나',
     열고.단추눌림 === 'true' && Math.abs(열고.바닥폭 / 열고.바닥높 - 8000 / 10000) < 0.012,
     '단추 ' + 열고.단추눌림 + ' · 바닥 ' + 열고.바닥폭 + '×' + 열고.바닥높);
재기('ㄹ 다시 열어도 기계 자리(mm)가 그대로인가',
     (열고.담김['기계들'] || []).map(m => m['이름'] + ' ' + m.x + ',' + m.y).join(' · ') === 닫기전담,
     닫기전담);
재기('ㄹ 다시 열어도 화면에 그 자리로 그려지나',
     열고.기계.every(c => { const a = 닫기전.기계.find(x => x.이름 === c.이름);
         return Math.abs(a.왼 - c.왼) < 1.5 && Math.abs(a.위 - c.위) < 1.5; }));
await p.screenshot({ path: path.join(그림칸, '375-돌려서다시열기.png') });

/* ══ 되돌리기 — 다시 누르면 원래대로 · 자리는 그대로 ═════════════════ */
await p.click('#l-turn');
await p.waitForTimeout(400);
const 되돌 = await 봄();
재기('다시 누르면 원래 보기로 돌아오나',
     되돌.단추눌림 === 'false' && 되돌.단추글 === '⟲ 세로로'
     && Math.abs(되돌.바닥높 / 되돌.바닥폭 - 8000 / 10000) < 0.012,
     되돌.바닥폭 + '×' + 되돌.바닥높 + ' · 「' + 되돌.단추글 + '」');
재기('되돌려도 기계의 참 자리(mm)는 그대로인가',
     (되돌.담김['기계들'] || []).map(m => m['이름'] + ' ' + m.x + ',' + m.y).join(' · ') === 닫기전담);
재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

await b.close();
const 실패 = 잰것.filter(t => !t.됐나);
console.log(`\n초록 ${잰것.length - 실패.length} · 빨강 ${실패.length} · 건너뜀 0 (잰 것 모두 ${잰것.length})`);
if (!잰것.length) { console.log('잰 것이 하나도 없습니다 — 초록이 아닙니다'); process.exit(1); }
if (실패.length) console.log('빨강:\n' + 실패.map(t => '  ✗ ' + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : '')).join('\n'));
process.exit(실패.length ? 1 : 0);
