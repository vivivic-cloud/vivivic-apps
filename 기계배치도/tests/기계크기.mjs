/* 기계배치도 — **기계 크기 고치기**를 재는 시험.
       node 기계배치도/tests/기계크기.mjs

   사장님 말씀 (장부에서 확인함)
     a1791288442 · 10-06 12:07:22 UTC · 짚은 자리 「기계배치도 · 패널쏘 3,800×3,300」
       「각 장비 기계도 사이즈변경 되어야 함」

   ⚠ 여는 길을 **톡 누르기**로 했다. 길게 누르기는 손잡이 것이고 끌기는 움직일 때다.
      그래서 **끌기가 안 깨지는지**를 이 시험에서 다시 잰다. */
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
const 손잡이주소 = 주소 + '?viggle=1&box=layout&name=' + encodeURIComponent('기계배치도');
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
    const 판 = document.getElementById('l-mc-sheet');
    const c = 판.querySelector('.lcard').getBoundingClientRect();
    const 담김 = JSON.parse(localStorage.getItem('layout.배치.v1') || 'null');
    return {
        판열림: !판.hidden, 제목: document.getElementById('l-mc-title').textContent,
        가로칸: document.getElementById('l-mw').value, 세로칸: document.getElementById('l-mh').value,
        판쪽지: document.getElementById('l-mc-msg').textContent,
        쪽지: document.getElementById('l-note').textContent,
        왼: Math.round(c.left), 오른: Math.round(c.right), 아래: Math.round(c.bottom),
        폭: window.innerWidth, 높이: window.innerHeight,
        넘친가로: document.documentElement.scrollWidth > window.innerWidth + 1,
        기계: [...document.querySelectorAll('.lmc')].map(el => {
            const r = el.getBoundingClientRect();
            return { 이름: el.querySelector('.lnm').textContent,
                     딱지: (el.querySelector('.lsz') || {}).textContent || '',
                     왼: r.left, 위: r.top, 폭: Math.round(r.width), 높이: Math.round(r.height) };
        }),
        담김: 담김 ? (담김['기계들'] || []).map(m => m['이름'] + ' ' + m.x + ',' + m.y
                     + ' ' + m['가로'] + 'x' + m['세로']).join(' · ') : null,
    };
});
async function 집을점(이름, 쪽 = p) {
    return await 쪽.evaluate(nm => {
        const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === nm);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        for (const fy of [0.5, 0.3, 0.7]) for (const fx of [0.5, 0.25, 0.75]) {
            const x = r.left + r.width * fx, y = r.top + r.height * fy;
            const 거기 = document.elementFromPoint(x, y);
            if (거기 && 거기.closest('.lmc') === el) return { x, y };
        }
        return null;
    }, 이름);
}
/* 톡 — 안 움직이고 바로 뗀다 */
async function 톡(이름, 쪽 = p) {
    const 점 = await 집을점(이름, 쪽);
    await 쪽.mouse.move(점.x, 점.y);
    await 쪽.mouse.down();
    await 쪽.waitForTimeout(80);
    await 쪽.mouse.up();
    await 쪽.waitForTimeout(300);
}
async function 크기넣기(가로, 세로) {
    await p.fill('#l-mw', String(가로));
    await p.fill('#l-mh', String(세로));
    await p.click('#l-mc-ok');
    await p.waitForTimeout(350);
}
const 깨끗이 = async (어디 = 주소) => {
    await p.evaluate(k => localStorage.removeItem(k), 폰열쇠);
    await p.goto(어디, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(450);
};
await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ 여는 길 ═════════════════════════════════════════════════════════ */
재기('처음엔 기계 크기 판이 닫혀 있나', !(await 봄()).판열림);
await 톡('패널쏘');
const 열림 = await 봄();
재기('기계를 톡 누르면 크기 판이 뜨나', 열림.판열림);
재기('그 기계 이름이 판에 뜨나', 열림.제목 === '패널쏘 크기', 열림.제목);
재기('지금 크기가 미터로 칸에 들어 있나(3,800 → 3.8)',
     열림.가로칸 === '3.8' && 열림.세로칸 === '3.3', 열림.가로칸 + ' · ' + 열림.세로칸);
const 판꼴 = await p.evaluate(() => {
    const s = document.getElementById('l-mc-sheet');
    const 칸 = [...s.querySelectorAll('input')].map(i => ({ 높이: Math.round(i.getBoundingClientRect().height),
        글씨: parseFloat(getComputedStyle(i).fontSize), 갈래: i.inputMode }));
    const 단 = [...s.querySelectorAll('.lcbtn')].map(x => Math.round(x.getBoundingClientRect().height));
    return { 칸, 단 };
});
재기('칸이 44px·글씨 16px 이상이고 소수 자판인가',
     판꼴.칸.every(c => c.높이 >= 44 && c.글씨 >= 16 && c.갈래 === 'decimal'),
     판꼴.칸.map(c => c.높이 + 'px/' + c.글씨 + 'px/' + c.갈래).join(' · '));
재기('그만·넣기가 44px 이상인가', 판꼴.단.every(h => h >= 44), 판꼴.단.join(' · '));
재기('판이 375 안에 네 변 다 들어오나',
     열림.왼 >= 0 && 열림.오른 <= 열림.폭 && 열림.아래 <= 열림.높이 + 1 && !열림.넘친가로,
     열림.왼 + '~' + 열림.오른 + ' / ' + 열림.폭 + ' · 아래 ' + 열림.아래 + '/' + 열림.높이);
await p.screenshot({ path: path.join(그림칸, '375-기계크기판.png') });
await p.click('#l-mc-no'); await p.waitForTimeout(250);
재기('그만을 누르면 닫히나', !(await 봄()).판열림);

/* ══ 줄이기 — 자리는 그대로, 크기만 ══════════════════════════════════ */
await 톡('패널쏘');
await 크기넣기(2.5, 2);
const 줄임 = await 봄();
const 패널 = 줄임.기계.find(x => x.이름 === '패널쏘');
재기('기계를 줄일 수 있나 (2.5 × 2 m)',
     /패널쏘 400,400 2500x2000/.test(줄임.담김), 줄임.담김.split(' · ')[0]);
재기('⚠ 줄여도 **놓인 자리(x·y)는 그대로**인가',
     /패널쏘 400,400 /.test(줄임.담김), 줄임.담김.split(' · ')[0]);
재기('딱지가 미터로 바뀌나', 패널.딱지 === '2.5×2m', 패널.딱지);
재기('줄인 뒤 판이 닫히나', !줄임.판열림);
재기('바꿨다고 알림줄에 적히나', /패널쏘 크기를 2.5 × 2 m 로 바꿨습니다/.test(줄임.쪽지), 줄임.쪽지);
const 다른기계 = 줄임.담김.split(' · ').slice(1).join(' · ');
재기('다른 기계는 하나도 안 건드려졌나',
     다른기계 === '보링기 5000,600 2400x1600 · 멤브레인프레스 5600,2400 3600x1800'
               + ' · 엣지밴더 400,4200 6000x1500 · 작업대 400,6200 2400x1200'
               + ' · 집진기 8200,6200 1500x1500', 다른기계);

/* ══ 키우기 — 벽·다른 기계 앞에서 선다 ═══════════════════════════════ */
// 패널쏘(400,400)를 크게. 오른쪽에 보링기(5000,600) 가 있어 가로는 4,600 에서 선다
await 톡('패널쏘');
await 크기넣기(9, 3);
const 막힘 = await 봄();
재기('키울 때 오른쪽 기계 앞에서 서나 (보링기 왼끝 5,000 → 가로 4,600)',
     /패널쏘 400,400 4600x3000/.test(막힘.담김), 막힘.담김.split(' · ')[0]);
재기('왜 거기서 멈췄는지 판에 적히나',
     /벽이나 다른 기계에 닿아 가로는 4.6 m 까지만 커졌습니다/.test(막힘.판쪽지), 막힘.판쪽지);
재기('막혔을 때는 판을 열어 둬 까닭을 보시나', 막힘.판열림);
재기('막혀도 다른 기계는 그대로인가',
     /보링기 5000,600 2400x1600/.test(막힘.담김) && /집진기 8200,6200 1500x1500/.test(막힘.담김));
const 겹친것 = await p.evaluate(k => {
    const ms = JSON.parse(localStorage.getItem(k))['기계들']; const 것 = [];
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
        const a = ms[i], c = ms[j];
        if (a.x < c.x + c['가로'] && c.x < a.x + a['가로'] && a.y < c.y + c['세로'] && c.y < a.y + a['세로'])
            것.push(a['이름'] + ' ↔ ' + c['이름']);
    } return 것;
}, 폰열쇠);
재기('키워도 기계끼리 겹치지 않나', 겹친것.length === 0, 겹친것.join(' | ') || '없음');
const 밖 = await p.evaluate(k => {
    const d = JSON.parse(localStorage.getItem(k));
    return (d['기계들'] || []).filter(m => m.x + m['가로'] > d['바닥']['가로']
                                        || m.y + m['세로'] > d['바닥']['세로']).map(m => m['이름']);
}, 폰열쇠);
재기('키워도 바닥 밖으로 나가는 기계가 없나', 밖.length === 0, 밖.join(' · ') || '없음');
await p.screenshot({ path: path.join(그림칸, '375-기계크기막힘.png') });
await p.click('#l-mc-no'); await p.waitForTimeout(250);

/* ── 벽에 막히는 쪽 — 집진기(8200,6200)를 오른쪽 벽(10,000)까지 ── */
await 톡('집진기');
await 크기넣기(9, 9);
const 벽 = await 봄();
재기('벽에 닿으면 거기서 서나 (가로 1.8 m · 세로 1.8 m)',
     /집진기 8200,6200 1800x1800/.test(벽.담김), 벽.담김.split(' · ').pop());
재기('벽에 막힌 까닭도 적히나', /벽이나 다른 기계에 닿아/.test(벽.판쪽지), 벽.판쪽지);
await p.click('#l-mc-no'); await p.waitForTimeout(250);

/* ══ 터무니없는 값 ═══════════════════════════════════════════════════ */
for (const [w, h, 왜, 바란말] of [[0, 2, '0', /사이로 넣어 주십시오/],
        [-3, 2, '음수', /사이로 넣어 주십시오/], [0.05, 2, '너무 작음', /사이로 넣어 주십시오/],
        ['', 2, '빈 칸', /사이로 넣어 주십시오/], [500, 2, '너무 큼', /사이로 넣어 주십시오/],
        [3800, 2, 'mm 로 넣으심', /3,800 mm 는 3.8 m 입니다/]]) {
    await 톡('작업대');
    const 전 = (await 봄()).담김;
    await 크기넣기(w, h);
    const 후 = await 봄();
    재기('터무니없는 값(' + 왜 + ')은 안 받고 기계가 그대로인가',
         후.담김 === 전 && 바란말.test(후.판쪽지), 후.판쪽지);
    await p.click('#l-mc-no'); await p.waitForTimeout(150);
}

/* ══ 다시 열어도 바뀐 크기가 그대로인가 ══════════════════════════════ */
await 톡('작업대');
await 크기넣기(3, 1.5);
await p.waitForTimeout(1500);
const 닫기전 = await 봄();
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
const 열고 = await 봄();
재기('다시 열어도 바꾼 기계 크기가 그대로인가',
     /작업대 400,6200 3000x1500/.test(열고.담김), 열고.담김.split(' · ').find(x => /작업대/.test(x)));
재기('다시 열어도 모든 기계가 닫기 전과 같은가', 열고.담김 === 닫기전.담김);

/* ══ ⚠ 끌기가 안 깨졌나 — 톡 누르기를 넣은 뒤에 다시 잰다 ════════════ */
await 깨끗이();
const 끌점 = await 집을점('집진기');
const 전자리 = (await 봄()).기계.find(x => x.이름 === '집진기');
await p.mouse.move(끌점.x, 끌점.y);
await p.mouse.down();
await p.waitForTimeout(80);
for (let i = 1; i <= 8; i++) { await p.mouse.move(끌점.x - 40 * i / 8, 끌점.y - 60 * i / 8); await p.waitForTimeout(25); }
await p.mouse.up();
await p.waitForTimeout(300);
const 끈뒤 = await 봄();
const 후자리 = 끈뒤.기계.find(x => x.이름 === '집진기');
재기('⚠ 톡 누르기를 넣은 뒤에도 끌기가 1:1 인가',
     Math.abs(후자리.왼 - 전자리.왼 + 40) < 2 && Math.abs(후자리.위 - 전자리.위 + 60) < 2,
     '끈 px -40,-60 → 움직인 px ' + (후자리.왼 - 전자리.왼).toFixed(1) + ',' + (후자리.위 - 전자리.위).toFixed(1));
재기('⚠ 끌고 났을 때는 크기 판이 안 떠야 한다', !끈뒤.판열림);
재기('끌어 옮긴 것이 담기나(처음 8200,6200 에서 움직였나)',
     /집진기 /.test(끈뒤.담김) && !/집진기 8200,6200/.test(끈뒤.담김),
     끈뒤.담김.split(' · ').pop());

/* 아주 조금(3px)만 밀고 떼면 — 기계가 안 움직였으니 톡으로 본다 */
await 깨끗이();
const 살짝 = await 집을점('보링기');
await p.mouse.move(살짝.x, 살짝.y);
await p.mouse.down(); await p.waitForTimeout(60);
await p.mouse.move(살짝.x + 3, 살짝.y + 2); await p.waitForTimeout(40);
await p.mouse.up(); await p.waitForTimeout(300);
const 살짝본것 = await 봄();
재기('3px 만 밀고 떼면 톡으로 보아 크기 판이 뜨나', 살짝본것.판열림);
재기('3px 흔들려도 기계가 안 밀리나(끌기 문턱 6px)',
     /보링기 5000,600 2400x1600/.test(살짝본것.담김 || '보링기 5000,600 2400x1600'),
     살짝본것.담김 === null ? '아예 안 담겼습니다(안 움직였다는 뜻)'
                            : 살짝본것.담김.split(' · ').find(x => /보링기/.test(x)));
await p.click('#l-mc-no'); await p.waitForTimeout(200);

/* 오래 누르고 있다 떼면 — 톡이 아니다 */
await 깨끗이();
const 오래 = await 집을점('보링기');
await p.mouse.move(오래.x, 오래.y);
await p.mouse.down(); await p.waitForTimeout(900); await p.mouse.up();
await p.waitForTimeout(300);
재기('오래 누르고 떼면 크기 판이 안 뜨나(손잡이 자리다)', !(await 봄()).판열림);

/* ══ 손잡이를 켠 채로 — 지시판이 뜨면 크기 판은 안 떠야 한다 ═════════ */
await 깨끗이(손잡이주소);
const 짚점 = await 집을점('패널쏘');
await p.mouse.move(짚점.x, 짚점.y);
await p.mouse.down(); await p.waitForTimeout(900); await p.mouse.up();
await p.waitForTimeout(300);
const 손잡이켬 = await p.evaluate(() => ({ 지시판: !!document.querySelector('.vg-sheet'),
                                           크기판: !document.getElementById('l-mc-sheet').hidden }));
재기('손잡이 켠 채 길게 누르면 지시판만 뜨고 크기 판은 안 뜨나',
     손잡이켬.지시판 && !손잡이켬.크기판,
     '지시판 ' + 손잡이켬.지시판 + ' · 크기판 ' + 손잡이켬.크기판);

/* ══ 돌린 채로도 되나 ════════════════════════════════════════════════ */
await 깨끗이();
await p.click('#l-turn'); await p.waitForTimeout(400);
await 톡('작업대');
const 돌려열림 = await 봄();
재기('돌린 채로도 톡 누르면 크기 판이 뜨나', 돌려열림.판열림 && 돌려열림.제목 === '작업대 크기',
     돌려열림.제목);
await 크기넣기(3, 1.5);
const 돌려고침 = await 봄();
재기('돌린 채로도 크기가 바뀌나', /작업대 400,6200 3000x1500/.test(돌려고침.담김),
     돌려고침.담김.split(' · ').find(x => /작업대/.test(x)));
재기('돌린 채로 고쳐도 가로 넘침이 없나', !돌려고침.넘친가로);
await p.screenshot({ path: path.join(그림칸, '375-기계크기고친뒤.png') });

재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');
await b.close();
const 실패 = 잰것.filter(t => !t.됐나);
console.log(`\n초록 ${잰것.length - 실패.length} · 빨강 ${실패.length} · 건너뜀 0 (잰 것 모두 ${잰것.length})`);
if (!잰것.length) { console.log('잰 것이 하나도 없습니다 — 초록이 아닙니다'); process.exit(1); }
if (실패.length) console.log('빨강:\n' + 실패.map(t => '  ✗ ' + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : '')).join('\n'));
process.exit(실패.length ? 1 : 0);
