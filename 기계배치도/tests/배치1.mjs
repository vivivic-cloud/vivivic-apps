/* 기계배치도 — 폰 375px 에서 **손가락으로 기계를 끌어 옮기고**, 옮긴 자리가
   다시 열어도 그대로인지 재는 시험. 손잡이가 길게 눌러 뜨는지도 눌러서 재어 본다.

       node 기계배치도/tests/배치1.mjs

   에이엠티 시험의 터(브라우저 찾기·자리 서버)를 그대로 빌려 쓴다 — 그 파일은 안 건드린다.

   ⚠ 이 통은 www.gstatic.com 에 못 닿는다. 그래서 파이어베이스 모듈 셋을 **허수아비로
      갈아 끼운다** — 이름난 내보냄(doc·getDoc·setDoc…)을 그대로 갖춘 것이라 창고로
      가는 길까지 여기서 재진다. 창고가 **아예 안 붙은** 경우는 12 에서 따로 잰다.
   ⚠ 진짜로 못 재는 것은 둘 — 산 파이어스토어 쓰기 · 사장님의 진짜 폰.

   ⚠ 값만 보지 않는다. 엔알에스가 세 번 되돌아간 까닭이 그것이었다 —
      **화면에 제대로 보이나 · 손가락으로 되나**까지 같이 잰다. */
import fs from 'node:fs';
import path from 'node:path';
import { 브라우저열기, 서버, 뿌리 } from '../../에이엠티/tests/도구/터.mjs';

const 잰것 = [];
const 재기 = (이름, 됐나, 곁 = '') => {
    잰것.push({ 이름, 됐나, 곁 });
    console.log((됐나 ? '  ✓ ' : '  ✗ ') + 이름 + (곁 ? '   [' + 곁 + ']' : ''));
};
/* 내 몫이 아닌 것 — 손잡이(shared/viggle.js)는 관리자 것이라 내가 안 고친다.
   재기는 하되 내 시험의 빨강으로는 세지 않고 따로 적어 올린다. */
const 관리자몫 = [];
const 관리자에게 = (이름, 됐나, 곁 = '') => {
    관리자몫.push({ 이름, 됐나, 곁 });
    console.log((됐나 ? '  · ' : '  ! ') + '[관리자에게] ' + 이름 + (곁 ? '   [' + 곁 + ']' : ''));
};
const 그림칸 = path.join(뿌리, '기계배치도/shots');
fs.mkdirSync(그림칸, { recursive: true });

await 서버();
const 주소 = 'http://127.0.0.1:8899/' + encodeURIComponent('기계배치도') + '/' + encodeURIComponent('기계배치도.html');
const 손잡이주소 = 주소 + '?viggle=1&box=layout&name=' + encodeURIComponent('기계배치도');
const 폰열쇠 = 'layout.배치.v1';
const 눈금 = 10;
const 처음기계 = [
    { 이름: '패널쏘',        가로: 3800, 세로: 3300, x:  400, y:  400 },
    { 이름: '보링기',        가로: 2400, 세로: 1600, x: 5000, y:  600 },
    { 이름: '멤브레인프레스', 가로: 3600, 세로: 1800, x: 5600, y: 2400 },
    { 이름: '엣지밴더',      가로: 6000, 세로: 1500, x:  400, y: 4200 },
    { 이름: '작업대',        가로: 2400, 세로: 1200, x:  400, y: 6200 },
    { 이름: '집진기',        가로: 1500, 세로: 1500, x: 8200, y: 6200 },
];

/* ── 허수아비 파이어베이스 ────────────────────────────────────────────
   창고에 담긴 것은 window.__창고 에 쌓인다 — 시험이 들여다볼 수 있게. */
const 허수아비 = {
    'firebase-app.js': `export const initializeApp = () => ({ 흉내: 1 });`,
    'firebase-auth.js': `
        export const getAuth = () => ({ currentUser: { uid: '시험', getIdToken: async () => 'tok' } });
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
        };`,
};
async function 허수아비꽂기(ctx) {
    await ctx.route('**/firebasejs/**', r => {
        const 이름 = Object.keys(허수아비).find(n => r.request().url().endsWith(n));
        return r.fulfill({ status: 200, contentType: 'text/javascript',
                           body: 이름 ? 허수아비[이름] : 'export {};' });
    });
}

const b = await 브라우저열기({ args: ['--no-sandbox'] });
const 폰 = { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const ctx = await b.newContext(폰);
await 허수아비꽂기(ctx);
const p = await ctx.newPage();
const 터진것 = [];
p.on('pageerror', e => 터진것.push(String(e && e.message || e)));

/* ── 손으로 재는 도구 ───────────────────────────────────────────────── */
async function 담긴것(이름, 쪽 = p) {
    return await 쪽.evaluate(([nm, k]) => {
        const m = JSON.parse(localStorage.getItem(k) || 'null');
        const 것 = m && (m['기계들'] || []).find(x => x['이름'] === nm);
        return 것 ? { x: 것.x, y: 것.y } : null;
    }, [이름, 폰열쇠]);
}
async function 화면자리(이름, 쪽 = p) {
    return await 쪽.evaluate(nm => {
        const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === nm);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { 왼: r.left, 위: r.top, 폭: r.width, 높이: r.height };
    }, 이름);
}
/* ⚠ 가운데를 그냥 누르면 **위에 덮인 다른 기계**를 잡는 일이 있다(10-05 에 물렸다).
   elementFromPoint 로 「정말 이 기계가 잡히는 점」 을 찾는다. 못 찾으면 null —
   그것은 곧 「사장님 손가락이 이 기계에 닿을 길이 없다」 는 뜻이다. */
async function 집을점(이름, 쪽 = p) {
    return await 쪽.evaluate(nm => {
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
/* ⚠ CDP dispatchTouchEvent 로는 안 걸린다. page.mouse 로 진짜 누른다.
   손가락처럼 여러 번 나눠 움직이고, 잡힌 것이 그 기계인지 중간에 확인한다. */
async function 끌어옮기기(이름, dx, dy, { 칸수 = 8, 쪽 = p } = {}) {
    const 점 = await 집을점(이름, 쪽);
    if (!점) return { 못잡음: '다른 기계에 덮여 손가락이 못 닿습니다' };
    await 쪽.mouse.move(점.x, 점.y);
    await 쪽.mouse.down();
    await 쪽.waitForTimeout(80);
    const 잡힌것 = await 쪽.evaluate(() => {
        const 들 = [...document.querySelectorAll('.lmc.잡힘')];
        return { 셈: 들.length, 이름: 들[0] ? 들[0].querySelector('.lnm').textContent : null };
    });
    for (let i = 1; i <= 칸수; i++) {
        await 쪽.mouse.move(점.x + dx * i / 칸수, 점.y + dy * i / 칸수);
        await 쪽.waitForTimeout(25);
    }
    const 끄는중 = await 쪽.evaluate(() => ({
        쪽지: document.getElementById('l-note').textContent,
        잡힌셈: document.querySelectorAll('.lmc.잡힘').length,
    }));
    await 쪽.mouse.up();
    await 쪽.waitForTimeout(250);
    return { 잡힌것: 잡힌것.이름, 잡힌셈: 잡힌것.셈, 끄는중쪽지: 끄는중.쪽지, 끌때잡힌셈: 끄는중.잡힌셈 };
}
async function 깨끗이(쪽 = p, 어디 = 주소) {
    await 쪽.evaluate(k => localStorage.removeItem(k), 폰열쇠);
    await 쪽.goto(어디, { waitUntil: 'domcontentloaded' });
    await 쪽.waitForTimeout(450);
}
/* 겹친 기계가 있나 — 담긴 것으로 센다 */
async function 겹친것(쪽 = p) {
    return await 쪽.evaluate(k => {
        const m = JSON.parse(localStorage.getItem(k) || 'null');
        const 들 = m ? m['기계들'] : [];
        const 것 = [];
        for (let i = 0; i < 들.length; i++) for (let j = i + 1; j < 들.length; j++) {
            const a = 들[i], c = 들[j];
            if (a.x < c.x + c['가로'] && c.x < a.x + a['가로']
             && a.y < c.y + c['세로'] && c.y < a.y + a['세로']) 것.push(a['이름'] + ' ↔ ' + c['이름']);
        }
        return 것;
    }, 폰열쇠);
}

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(500);

/* ══ 1. 바닥 하나 · 기계 몇 대가 놓인 화면인가 ═══════════════════════ */
const 첫판 = await p.evaluate(() => {
    const f = document.getElementById('l-floor');
    const r = f.getBoundingClientRect();
    return { 바닥있나: !!f, 폭: r.width, 높이: r.height,
             기계수: document.querySelectorAll('.lmc').length,
             크기글: document.getElementById('l-floor-size').textContent,
             칸: f.style.backgroundSize };
});
const 배율 = 첫판.폭 / 10000;                            // px / mm
재기('바닥 판이 있나', 첫판.바닥있나);
재기('기계가 여섯 대 놓여 있나', 첫판.기계수 === 6, '기계 ' + 첫판.기계수 + '대');
재기('바닥 높이가 10000×8000 비율(0.8)대로 잡혔나',
     Math.abs(첫판.높이 / 첫판.폭 - 0.8) < 0.01,
     Math.round(첫판.폭) + '×' + Math.round(첫판.높이) + ' = ' + (첫판.높이 / 첫판.폭).toFixed(3));
재기('바닥 크기가 머리에 미터로 적혀 있나', /10 × 8 m/.test(첫판.크기글), 첫판.크기글);
재기('1m 눈금 칸이 박혀 있나', /px/.test(첫판.칸), 첫판.칸);
재기('열자마자 터진 것이 없나', 터진것.length === 0, 터진것.join(' | ') || '없음');
재기('화면에 그려진 기계가 표와 같은가',
     (await p.evaluate(() => [...document.querySelectorAll('.lmc')]
        .map(e => e.querySelector('.lnm').textContent).join(','))) === 처음기계.map(m => m.이름).join(','));
재기('처음 배치에 겹쳐 놓인 기계가 없나',
     (() => { const 것 = [];
        for (let i = 0; i < 처음기계.length; i++) for (let j = i + 1; j < 처음기계.length; j++) {
            const a = 처음기계[i], c = 처음기계[j];
            if (a.x < c.x + c.가로 && c.x < a.x + a.가로 && a.y < c.y + c.세로 && c.y < a.y + a.세로)
                것.push(a.이름 + ' ↔ ' + c.이름);
        } return 것.length === 0; })());

/* ══ 2. 375 에서 네 변이 다 화면 안에 있나 · 손가락 자 ═══════════════ */
const 삐짐 = await p.evaluate(() => {
    const 넘친가로 = document.documentElement.scrollWidth > window.innerWidth + 1;
    const 밖 = [];
    document.querySelectorAll('.lwrap, .lhead, .lfloor, .lfoot, .lmc, .lhead > *, .lfoot > *')
        .forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return;
            if (r.left < -0.5 || r.right > window.innerWidth + 0.5)
                밖.push((el.dataset.area || el.className) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
        });
    const 아래 = Math.max(...[...document.querySelectorAll('.lwrap, .lfoot')]
        .map(el => el.getBoundingClientRect().bottom));
    /* ⚠ scrollWidth 로 재면 안 된다 — 닿는 자리를 넓히려고 둔 ::after 가 밖으로
       12px 나가 있어 글이 멀쩡해도 깎인 것으로 잡힌다(10-06 에 헛방을 맞았다).
       **글 자체의 너비**를 Range 로 재서 칸과 견준다. */
    const 깎인글 = [];
    document.querySelectorAll('.lhead > *, .lfoot > *').forEach(el => {
        const r = document.createRange(); r.selectNodeContents(el);
        const 글폭 = r.getBoundingClientRect().width; r.detach && r.detach();
        if (글폭 > el.clientWidth + 1) 깎인글.push((el.id || el.className)
            + ' 글 ' + Math.round(글폭) + ' > 칸 ' + el.clientWidth);
    });
    return { 넘친가로, 밖, 아래: Math.round(아래), 높이: window.innerHeight, 깎인글 };
});
재기('가로로 삐져나간 것이 없나', !삐짐.넘친가로 && 삐짐.밖.length === 0,
     삐짐.밖.join(' | ') || 'scrollWidth 넘침 없음');
재기('화면 아래로 잘린 것이 없나', 삐짐.아래 <= 삐짐.높이,
     '맨아래 ' + 삐짐.아래 + ' / 보이는 높이 ' + 삐짐.높이);
재기('머리·발의 글이 깎인 데가 없나', 삐짐.깎인글.length === 0, 삐짐.깎인글.join(' | ') || '없음');
재기('100vh 를 쓴 데가 없나(폰에서 보이는 높이가 아니다)',
     !(await p.evaluate(() => [...document.styleSheets].some(s => {
         try { return [...s.cssRules].some(r => /100vh/.test(r.cssText)); } catch { return false; }
     }))));
const 손가락 = await p.evaluate(() => [...document.querySelectorAll('.lmc')].map(el => {
    const r = el.getBoundingClientRect();
    const 넓힘 = Math.abs(parseFloat(getComputedStyle(el, '::after').top) || 0);
    return { 이름: el.querySelector('.lnm').textContent,
             본: Math.round(r.width) + '×' + Math.round(r.height),
             닿는가로: Math.round(r.width + 넓힘 * 2), 닿는세로: Math.round(r.height + 넓힘 * 2) };
}));
const 작은것 = 손가락.filter(x => x.닿는가로 < 44 || x.닿는세로 < 44);
재기('기계마다 닿는 자리가 44px 이상인가', 작은것.length === 0,
     작은것.length ? 작은것.map(x => x.이름 + ' ' + x.닿는가로 + '×' + x.닿는세로).join(' | ')
                   : 손가락.map(x => x.이름 + ' ' + x.본 + '→' + x.닿는가로 + '×' + x.닿는세로).join(' · '));
const 넘친글 = await p.evaluate(() => {
    const 것 = [];
    document.querySelectorAll('.lmc').forEach(el => {
        const 판 = el.getBoundingClientRect();
        el.querySelectorAll('.lnm, .lsz').forEach(t => {
            if (getComputedStyle(t).display === 'none') return;
            const r = t.getBoundingClientRect();
            if (r.bottom > 판.bottom + 0.5 || r.right > 판.right + 0.5 || r.top < 판.top - 0.5)
                것.push(el.querySelector('.lnm').textContent + ' / ' + t.className);
        });
    });
    return 것;
});
재기('기계 글자가 판 밖으로 나간 데가 없나', 넘친글.length === 0, 넘친글.join(' | ') || '없음');
/* ⚠ 판 밖으로 나가는 것만 보면 안 된다 — 판 **안에서 깎인** 글은 자에 안 걸리고
   그림에만 보인다(10-05 에 집진기가 「1,500×1,5」 로 깎여 있었다). 깎였나를 따로 잰다. */
const 깎인것 = await p.evaluate(() => {
    const 것 = [];
    document.querySelectorAll('.lmc').forEach(el => {
        el.querySelectorAll('.lnm, .lsz').forEach(t => {
            if (getComputedStyle(t).display === 'none') return;
            const 말줄임 = getComputedStyle(t).textOverflow === 'ellipsis';
            if (t.scrollWidth > t.clientWidth + 0.5 && !말줄임)
                것.push(el.querySelector('.lnm').textContent + ' / ' + t.className
                        + ' 「' + t.textContent + '」 ' + Math.round(t.scrollWidth) + '>' + Math.round(t.clientWidth));
        });
    });
    return 것;
});
재기('기계 안에서 깎인 글(말줄임표도 없이 잘린 글)이 없나', 깎인것.length === 0, 깎인것.join(' | ') || '없음');
const 글보임 = await p.evaluate(() => [...document.querySelectorAll('.lmc')].map(el => {
    const nm = el.querySelector('.lnm'), sz = el.querySelector('.lsz');
    return el.querySelector('.lnm').textContent + (getComputedStyle(sz).display === 'none' ? '(크기숨김)' : '(크기보임)')
         + (nm.scrollWidth > nm.clientWidth + 0.5 ? '(이름말줄임)' : '');
}));
재기('기계마다 이름은 반드시 보이나', await p.evaluate(() =>
        [...document.querySelectorAll('.lmc')].every(el => {
            const nm = el.querySelector('.lnm');
            return getComputedStyle(nm).display !== 'none' && nm.getBoundingClientRect().width > 8;
        })), 글보임.join(' · '));
재기('여섯 대 다 손가락이 닿나(덮인 기계가 없나)',
     (await Promise.all(처음기계.map(m => 집을점(m.이름)))).every(x => !!x));
await p.screenshot({ path: path.join(그림칸, '375-첫화면.png') });

/* ══ 3. 손가락으로 끌어 옮긴다 ═══════════════════════════════════════
   집진기를 왼·위로 끈다 — 그 길에 다른 기계가 없어 **끈 만큼 그대로** 간다. */
await 깨끗이();
재기('옮기기 전에는 폰에 담긴 것이 없나', (await 담긴것('집진기')) === null);

const 전화면 = await 화면자리('집진기');
const 끌이동 = { x: -40, y: -60 };
const 끌기 = await 끌어옮기기('집진기', 끌이동.x, 끌이동.y);
const 후화면 = await 화면자리('집진기');
const 후 = await 담긴것('집진기');
const 바란x = Math.round((8200 + 끌이동.x / 배율) / 눈금) * 눈금;
const 바란y = Math.round((6200 + 끌이동.y / 배율) / 눈금) * 눈금;
재기('끄는 동안 잡힌 기계가 그 기계 하나인가',
     끌기.잡힌것 === '집진기' && 끌기.잡힌셈 === 1 && 끌기.끌때잡힌셈 === 1,
     '잡힌 것 ' + 끌기.잡힌것 + ' · 셈 ' + 끌기.잡힌셈 + '→' + 끌기.끌때잡힌셈);
재기('끄는 동안 어디로 가는지 적히나',
     /^집진기 — 왼쪽벽 [\d,.]+ · 위벽 [\d,.]+ m$/.test(끌기.끄는중쪽지), 끌기.끄는중쪽지);
재기('손가락으로 끌면 기계가 화면에서 그만큼 움직이나',
     Math.abs(후화면.왼 - 전화면.왼 - 끌이동.x) < 2 && Math.abs(후화면.위 - 전화면.위 - 끌이동.y) < 2,
     '움직인 px ' + (후화면.왼 - 전화면.왼).toFixed(1) + ',' + (후화면.위 - 전화면.위).toFixed(1) +
     ' / 끈 px ' + 끌이동.x + ',' + 끌이동.y);
재기('움직인 만큼 mm 자리가 맞나',
     Math.abs(후.x - 바란x) <= 눈금 && Math.abs(후.y - 바란y) <= 눈금,
     '담긴 ' + 후.x + ',' + 후.y + ' / 바란 ' + 바란x + ',' + 바란y);
재기('10mm 눈금에 떨어졌나', 후.x % 눈금 === 0 && 후.y % 눈금 === 0, 후.x + ',' + 후.y);
재기('놓으면 「저장했습니다」 가 뜨나',
     /저장했습니다/.test(await p.evaluate(() => document.getElementById('l-save').textContent)));
재기('끌어도 터진 것이 없나', 터진것.length === 0, 터진것.join(' | ') || '없음');
await p.screenshot({ path: path.join(그림칸, '375-옮긴뒤.png') });

/* 짚기만 하고 안 옮겼으면 「저장했습니다」 가 뜨지 않아야 한다 — 거짓말이 된다 */
await p.waitForTimeout(1800);
const 짚기점 = await 집을점('집진기');
await p.mouse.move(짚기점.x, 짚기점.y);
await p.mouse.down(); await p.waitForTimeout(120); await p.mouse.up();
await p.waitForTimeout(200);
재기('제자리면 「저장했습니다」 가 뜨지 않나',
     (await p.evaluate(() => document.getElementById('l-save').textContent)) === '',
     '[' + await p.evaluate(() => document.getElementById('l-save').textContent) + ']');

/* ══ 4. 바닥 벽을 넘어가지 않는다 ════════════════════════════════════
   오른·위 쪽은 보링기, 왼·아래 쪽은 작업대 — 둘 다 그 길이 비어 있다. */
await 깨끗이();
const 오위 = await 끌어옮기기('보링기', 400, -400, { 칸수: 10 });
재기('오른·위 벽 — 잡힌 것이 보링기인가', 오위.잡힌것 === '보링기', String(오위.잡힌것 || 오위.못잡음));
const 모퉁이1 = await 담긴것('보링기');
재기('오른·위 벽을 넘어가지 않나', 모퉁이1.x === 10000 - 2400 && 모퉁이1.y === 0,
     모퉁이1.x + ',' + 모퉁이1.y + ' / 벽 ' + (10000 - 2400) + ',0');
const 왼아래 = await 끌어옮기기('작업대', -400, 400, { 칸수: 10 });
재기('왼·아래 벽 — 잡힌 것이 작업대인가', 왼아래.잡힌것 === '작업대', String(왼아래.잡힌것 || 왼아래.못잡음));
const 모퉁이2 = await 담긴것('작업대');
재기('왼·아래 벽을 넘어가지 않나', 모퉁이2.x === 0 && 모퉁이2.y === 8000 - 1200,
     모퉁이2.x + ',' + 모퉁이2.y + ' / 벽 0,' + (8000 - 1200));

/* ══ 5. 기계끼리 겹쳐 놓이지 않는다 ══════════════════════════════════
   10-05 에 재어 잡은 것 — 겹치게 두면 큰 기계가 작은 기계를 통째로 덮어
   그 기계를 **다시 끌 수가 없었다.** 그래서 겹치지 않게 막았다. */
await 깨끗이();
// 보링기(5000,600)를 왼쪽 패널쏘(400~4200, 400~3700) 쪽으로 밀어 넣는다
const 밀기 = await 끌어옮기기('보링기', -400, 0, { 칸수: 12 });
const 막힌자리 = await 담긴것('보링기');
재기('다른 기계 쪽으로 밀어도 잡힌 것은 보링기인가', 밀기.잡힌것 === '보링기', String(밀기.잡힌것 || 밀기.못잡음));
재기('기계 위로 밀어도 겹쳐지지 않나', (await 겹친것()).length === 0, (await 겹친것()).join(' | ') || '없음');
재기('막히기 전까지는 미끄러져 붙나(패널쏘 오른끝 4200)',
     막힌자리.x === 4200 && 막힌자리.y === 600, 막힌자리.x + ',' + 막힌자리.y);
// 밑으로 깔려 못 잡히는 기계가 생기지 않았나
재기('밀어 붙인 뒤에도 여섯 대 다 손가락이 닿나',
     (await Promise.all(처음기계.map(m => 집을점(m.이름)))).every(x => !!x),
     (await Promise.all(처음기계.map(async m => m.이름 + (await 집을점(m.이름) ? '○' : '✗')))).join(' '));
await p.screenshot({ path: path.join(그림칸, '375-밀어붙임.png') });

/* 두 축이 다 막힌 자리는 「막혔습니다」 라고 적히나 — 끼어 있는 배치를 심어 재어 본다 */
await p.evaluate(([k, 것]) => localStorage.setItem(k, JSON.stringify(것)), [폰열쇠, {
    바닥: { 가로: 10000, 세로: 8000 }, 잰때: Date.now(),
    기계들: [
        { id: 'm1', 이름: '패널쏘', 가로: 3800, 세로: 3300, x: 400, y: 400 },
        { id: 'm3', 이름: '멤브레인프레스', 가로: 3600, 세로: 1800, x: 4200, y: 0 },
        { id: 'm2', 이름: '보링기', 가로: 2400, 세로: 1600, x: 4200, y: 1800 },
    ],
}]);
await p.goto(주소, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(450);
재기('심어 둔 배치(기계 3대)를 그대로 읽어 그리나',
     (await p.evaluate(() => [...document.querySelectorAll('.lmc')]
        .map(e => e.querySelector('.lnm').textContent).join(','))) === '패널쏘,멤브레인프레스,보링기');
const 끼인것 = await 끌어옮기기('보링기', -60, -60, { 칸수: 8 });
재기('왼쪽·위쪽이 다 막히면 「다른 기계에 막혔습니다」 라고 적히나',
     /다른 기계에 막혔습니다/.test(끼인것.끄는중쪽지 || ''), 끼인것.끄는중쪽지 || String(끼인것.못잡음));
재기('막힌 자리에서는 안 움직이나',
     (await 담긴것('보링기')).x === 4200 && (await 담긴것('보링기')).y === 1800,
     JSON.stringify(await 담긴것('보링기')));

/* ══ 6. 다시 열어도 그대로인가 (③) ═══════════════════════════════════ */
await 깨끗이();
const 둘곳 = await 끌어옮기기('집진기', -90, -70, { 칸수: 8 });
재기('옮겨 둘 때 잡힌 것이 집진기인가', 둘곳.잡힌것 === '집진기', String(둘곳.잡힌것 || 둘곳.못잡음));
await p.waitForTimeout(1600);                             // 창고에 담는 시계(1.2초)까지 지나가게
const 닫기전 = await 담긴것('집진기');
const 닫기전화면 = await 화면자리('집진기');
const 창고 = await p.evaluate(() => {
    const 길 = 'artifacts/vivivic-4b7ef/public/data/layout_배치도/현재';
    const 것 = (window.__창고 || {})[길];
    return { 길있나: !!것, 셈: window.__창고셈 || 0,
             집진기: 것 && (것['기계들'] || []).find(x => x['이름'] === '집진기') || null };
});
재기('창고(파이어스토어) 자리에도 담기나 — layout_배치도/현재',
     창고.길있나 && 창고.집진기 && 창고.집진기.x === 닫기전.x && 창고.집진기.y === 닫기전.y,
     창고.길있나 ? ('담은 횟수 ' + 창고.셈 + ' · 집진기 ' + 창고.집진기.x + ',' + 창고.집진기.y)
                : '그 길에 아무것도 없습니다');

await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
const 열고나서 = await 담긴것('집진기');
const 열고나서화면 = await 화면자리('집진기');
재기('다시 열어도 옮긴 자리가 그대로인가(mm)',
     열고나서.x === 닫기전.x && 열고나서.y === 닫기전.y,
     '닫기 전 ' + 닫기전.x + ',' + 닫기전.y + ' → 열고 나서 ' + 열고나서.x + ',' + 열고나서.y);
재기('다시 열어도 화면에서 그 자리에 그려지나(px)',
     Math.abs(열고나서화면.왼 - 닫기전화면.왼) < 1.5 && Math.abs(열고나서화면.위 - 닫기전화면.위) < 1.5,
     '화면 ' + 닫기전화면.왼.toFixed(1) + ',' + 닫기전화면.위.toFixed(1) +
     ' → ' + 열고나서화면.왼.toFixed(1) + ',' + 열고나서화면.위.toFixed(1));
await p.screenshot({ path: path.join(그림칸, '375-다시열기.png') });

/* ══ 7. 안 달라진 것 — 옮기기는 자리만 바꾼다 ═══════════════════════ */
const 안달라진것 = await p.evaluate(k => {
    const m = JSON.parse(localStorage.getItem(k));
    return { 바닥: m['바닥'], 기계수: m['기계들'].length,
             이름들: m['기계들'].map(x => x['이름']).join(','),
             크기들: m['기계들'].map(x => x['가로'] + 'x' + x['세로']).join(','),
             자리들: Object.fromEntries(m['기계들'].map(x => [x['이름'], x.x + ',' + x.y])) };
}, 폰열쇠);
재기('안 달라진 것 — 바닥 크기는 그대로인가',
     안달라진것.바닥['가로'] === 10000 && 안달라진것.바닥['세로'] === 8000,
     안달라진것.바닥['가로'] + '×' + 안달라진것.바닥['세로']);
재기('안 달라진 것 — 기계 수·이름·크기는 그대로인가',
     안달라진것.기계수 === 6
     && 안달라진것.이름들 === 처음기계.map(m => m.이름).join(',')
     && 안달라진것.크기들 === 처음기계.map(m => m.가로 + 'x' + m.세로).join(','),
     안달라진것.기계수 + '대 · ' + 안달라진것.크기들);
const 손안댄것 = 처음기계.filter(m => m.이름 !== '집진기');
재기('손 안 댄 기계 다섯은 처음 자리 그대로인가',
     손안댄것.every(m => 안달라진것.자리들[m.이름] === m.x + ',' + m.y),
     손안댄것.map(m => m.이름 + ' ' + 안달라진것.자리들[m.이름] + (안달라진것.자리들[m.이름] === m.x + ',' + m.y ? '' : '(≠' + m.x + ',' + m.y + ')')).join(' · '));

/* ══ 8. 담긴 것이 깨져 있으면 처음 배치로 돌아오나 ══════════════════ */
for (const 깬것 of ['{"바닥":{"가로":0},"기계들":[]}', '{}', 'xxx아닌글',
                    '{"바닥":{"가로":10000,"세로":8000},"기계들":[{"id":"m1"}]}']) {
    await p.evaluate(([k, v]) => localStorage.setItem(k, v), [폰열쇠, 깬것]);
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(350);
    재기('담긴 것이 깨져 있어도(' + 깬것.slice(0, 22) + ') 처음 배치로 서나',
         await p.evaluate(() => document.querySelectorAll('.lmc').length === 6
             && document.getElementById('l-floor').clientHeight > 100),
         '기계 ' + await p.evaluate(() => document.querySelectorAll('.lmc').length) + '대');
}

/* ══ 9. 손잡이(④) — 길게 눌러 지시판이 뜨나 ═════════════════════════
   ⚠ 글자로 「붙였다」 를 믿지 않는다. 0.9초 눌러서 .vg-sheet 가 뜨는지 본다. */
await 깨끗이(p, 손잡이주소);
const 짚을곳 = await 집을점('패널쏘');
await p.mouse.move(짚을곳.x, 짚을곳.y);
await p.mouse.down(); await p.waitForTimeout(900); await p.mouse.up();
await p.waitForTimeout(250);
const 판 = await p.evaluate(() => {
    const s = document.querySelector('.vg-sheet');
    if (!s) return null;
    const r = s.querySelector('.vg-card').getBoundingClientRect();
    return { 짚은것: (s.querySelector('.vg-what') || {}).textContent || '',
             적는칸: !!s.querySelector('textarea'), 보내기: !!s.querySelector('.vg-send'),
             왼: Math.round(r.left), 오른: Math.round(r.right), 아래: Math.round(r.bottom),
             폭: window.innerWidth, 높이: window.innerHeight };
});
재기('기계를 길게 누르면 지시판(.vg-sheet)이 뜨나', !!판, 판 ? '떴다' : '안 떴다');
재기('지시판에 적는 칸과 보내기가 있나', !!(판 && 판.적는칸 && 판.보내기));
재기('지시판이 375 안에 네 변 다 들어오나',
     !!(판 && 판.왼 >= 0 && 판.오른 <= 판.폭 && 판.아래 <= 판.높이 + 1),
     판 ? 판.왼 + '~' + 판.오른 + ' / 폭 ' + 판.폭 + ' · 아래 ' + 판.아래 + ' / 높이 ' + 판.높이 : '—');
재기('짚은 것에 그 기계 이름이 잡히나', !!(판 && /패널쏘/.test(판.짚은것)),
     판 ? 판.짚은것.replace(/\s+/g, ' ').slice(0, 60) : '—');
await p.screenshot({ path: path.join(그림칸, '375-지시판.png') });

/* 바닥 바탕을 짚으셔도 그 자리가 잡히나 (어제 작업대가 여기서 물렸다) */
await p.goto(손잡이주소, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(500);
const 바탕 = await p.evaluate(() => {
    const r = document.getElementById('l-floor').getBoundingClientRect();
    for (let fy = 0.05; fy < 1; fy += 0.07) for (let fx = 0.05; fx < 1; fx += 0.07) {
        const x = r.left + r.width * fx, y = r.top + r.height * fy;
        const e = document.elementFromPoint(x, y);
        if (e && e.id === 'l-floor') return { x, y };
    }
    return null;
});
재기('기계가 없는 빈 바닥을 찾을 수 있나', !!바탕);
await p.mouse.move(바탕.x, 바탕.y);
await p.mouse.down(); await p.waitForTimeout(900); await p.mouse.up();
await p.waitForTimeout(250);
const 바탕판 = await p.evaluate(() => {
    const s = document.querySelector('.vg-sheet');
    return s ? ((s.querySelector('.vg-what') || {}).textContent || '') : null;
});
재기('빈 바닥을 길게 눌러도 지시판이 뜨나', 바탕판 !== null, 바탕판 === null ? '안 떴다' : '떴다');
/* 내 몫이 아닌 것 — 손잡이의 무엇(el) 은 innerText 만 보고 data-area 를 안 본다.
   그래서 빈 바닥을 짚으시면 **그 안의 기계 이름이 통째로** 적힌다. */
관리자에게('빈 바닥을 짚었을 때 손잡이가 data-area(「바닥」)를 적나 — viggle.js 무엇(el) 이 innerText 만 본다',
     바탕판 !== null && /바닥/.test(바탕판),
     바탕판 === null ? '안 떴다' : '지금 적히는 것: ' + 바탕판.replace(/\s+/g, ' ').slice(0, 80));

/* 손잡이가 안 켜졌을 때는 아무 일도 없어야 한다 — 직원들이 보는 화면은 그대로다 */
await p.goto(주소, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(400);
const 평소 = await 집을점('패널쏘');
await p.mouse.move(평소.x, 평소.y);
await p.mouse.down(); await p.waitForTimeout(900); await p.mouse.up();
await p.waitForTimeout(200);
재기('손잡이를 안 켜면 길게 눌러도 판이 안 뜨나',
     await p.evaluate(() => !document.querySelector('.vg-sheet')));
/* 손잡이를 켠 채로도 ② 가 그대로 되나 — 지시판이 뜨면 끌기는 멈춰야 한다 */
await p.goto(손잡이주소, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(450);
const 손잡이켜고 = await 끌어옮기기('작업대', 40, -40, { 칸수: 8 });
재기('손잡이를 켠 채로도 기계를 끌 수 있나', 손잡이켜고.잡힌것 === '작업대',
     String(손잡이켜고.잡힌것 || 손잡이켜고.못잡음));

/* ══ 10. data-area 가 화면 곳곳에 달렸나 ════════════════════════════ */
const 자리이름 = await p.evaluate(() => [...document.querySelectorAll('[data-area]')].map(e => e.dataset.area));
재기('바닥·기계·머리·발에 data-area 가 달렸나',
     ['바닥', '머리', '안내'].every(n => 자리이름.includes(n))
     && 자리이름.filter(n => n.startsWith('기계:')).length === 6,
     자리이름.join(' · '));

/* ══ 11. 두 손가락으로 벌리셔도 네 변이 화면 안인가 ═════════════════
   확대하면 보이는 화면이 줄어든다. 320×480 으로 줄여 그때를 흉내 낸다. */
const 작은폰 = await b.newContext({ ...폰, viewport: { width: 320, height: 480 } });
await 허수아비꽂기(작은폰);
const p2 = await 작은폰.newPage();
await p2.goto(손잡이주소, { waitUntil: 'domcontentloaded' });
await p2.waitForTimeout(500);
const 좁은삐짐 = await p2.evaluate(() => {
    const 넘친가로 = document.documentElement.scrollWidth > window.innerWidth + 1;
    const 아래 = Math.max(...[...document.querySelectorAll('.lwrap, .lfoot')]
        .map(el => el.getBoundingClientRect().bottom));
    return { 넘친가로, 아래: Math.round(아래), 높이: window.innerHeight };
});
재기('320 으로 줄어든 화면에서도 가로로 삐져나가지 않나', !좁은삐짐.넘친가로);
재기('320 으로 줄어들어도 프로그램 이름이 한 줄인가',
     await p2.evaluate(() => {
         const el = document.querySelector('.lday');
         return el.getBoundingClientRect().height < parseFloat(getComputedStyle(el).fontSize) * 1.6;
     }), '이름 높이 ' + await p2.evaluate(() => Math.round(document.querySelector('.lday').getBoundingClientRect().height)) + 'px');
재기('320 으로 줄어든 화면에서도 아래로 안 잘리나', 좁은삐짐.아래 <= 좁은삐짐.높이,
     '맨아래 ' + 좁은삐짐.아래 + ' / ' + 좁은삐짐.높이);
const 좁은끌기 = await 끌어옮기기('집진기', -30, -30, { 칸수: 6, 쪽: p2 });
재기('320 에서도 기계를 끌 수 있나', 좁은끌기.잡힌것 === '집진기', String(좁은끌기.잡힌것 || 좁은끌기.못잡음));
const 좁은점 = await 집을점('패널쏘', p2);
await p2.mouse.move(좁은점.x, 좁은점.y);
await p2.mouse.down(); await p2.waitForTimeout(900); await p2.mouse.up();
await p2.waitForTimeout(250);
const 좁은것 = await p2.evaluate(() => {
    const s = document.querySelector('.vg-sheet');
    if (!s) return null;
    const r = s.querySelector('.vg-card').getBoundingClientRect();
    return { 왼: Math.round(r.left), 오른: Math.round(r.right), 위: Math.round(r.top),
             아래: Math.round(r.bottom), 폭: window.innerWidth, 높이: window.innerHeight };
});
재기('320 으로 줄어든 화면에서도 지시판이 네 변 안에 들어오나',
     !!(좁은것 && 좁은것.왼 >= 0 && 좁은것.오른 <= 좁은것.폭
        && 좁은것.위 >= 0 && 좁은것.아래 <= 좁은것.높이 + 1),
     좁은것 ? 좁은것.왼 + '~' + 좁은것.오른 + ' / ' + 좁은것.폭 + ' · 위 ' + 좁은것.위
              + ' 아래 ' + 좁은것.아래 + ' / ' + 좁은것.높이 : '안 떴다');
await p2.screenshot({ path: path.join(그림칸, '320-지시판.png') });
await 작은폰.close();

/* ══ 12. 창고가 아예 안 붙어도 끌고 담기나 ══════════════════════════
   이 통에서 참으로 일어나는 일이다 — www.gstatic.com 이 막혀 있다. */
const 막힌통 = await b.newContext(폰);
await 막힌통.route('**/firebasejs/**', r => r.abort());
const p3 = await 막힌통.newPage();
const 막힌터짐 = [];
p3.on('pageerror', e => 막힌터짐.push(String(e && e.message || e)));
await p3.goto(주소, { waitUntil: 'domcontentloaded' });
await p3.waitForTimeout(600);
재기('창고가 안 붙어도 기계가 여섯 대 그려지나',
     (await p3.evaluate(() => document.querySelectorAll('.lmc').length)) === 6);
const 막힌끌기 = await 끌어옮기기('집진기', -40, -40, { 칸수: 8, 쪽: p3 });
const 막힌담김 = await 담긴것('집진기', p3);
재기('창고가 안 붙어도 끌 수 있나', 막힌끌기.잡힌것 === '집진기', String(막힌끌기.잡힌것 || 막힌끌기.못잡음));
재기('창고가 안 붙어도 끌어 옮긴 것이 폰에 담기나',
     !!막힌담김 && (막힌담김.x !== 8200 || 막힌담김.y !== 6200),
     막힌담김 ? 막힌담김.x + ',' + 막힌담김.y : '안 담겼다');
await p3.reload({ waitUntil: 'domcontentloaded' });
await p3.waitForTimeout(500);
재기('창고가 안 붙어도 다시 열면 그 자리인가',
     await p3.evaluate(([k, 바란]) => {
         const el = [...document.querySelectorAll('.lmc')].find(e => e.querySelector('.lnm').textContent === '집진기');
         const 것 = JSON.parse(localStorage.getItem(k))['기계들'].find(x => x['이름'] === '집진기');
         return !!el && 것.x === 바란.x && 것.y === 바란.y;
     }, [폰열쇠, 막힌담김]), 막힌담김 ? 막힌담김.x + ',' + 막힌담김.y : '—');
const 우리가터진것 = 막힌터짐.filter(m => !/firebasejs|dynamically imported module|Failed to fetch/i.test(m));
재기('창고가 안 붙어도 우리 코드가 터지지 않나', 우리가터진것.length === 0,
     우리가터진것.join(' | ') || ('파이어베이스 모듈 쪽만 ' + 막힌터짐.length + '건'));
await p3.screenshot({ path: path.join(그림칸, '375-창고없이.png') });
await 막힌통.close();

재기('처음부터 끝까지(창고 흉내 쪽) 터진 것이 없나', 터진것.length === 0, 터진것.join(' | ') || '없음');

await b.close();

/* ── 적기 ──────────────────────────────────────────────────────────
   ⚠ 「다 초록」 을 그냥 믿지 않는다. 몇 가지를 재었는지 세어 적는다 —
      0 개를 재고 초록인 것은 초록이 아니다. */
const 실패 = 잰것.filter(t => !t.됐나);
const 관리자빨강 = 관리자몫.filter(t => !t.됐나);
console.log(`\n초록 ${잰것.length - 실패.length} · 빨강 ${실패.length} · 건너뜀 0 (잰 것 모두 ${잰것.length})`);
console.log(`관리자 몫(손잡이) ${관리자몫.length}건 중 안 되는 것 ${관리자빨강.length}건 — 내 빨강에는 안 넣는다`);
if (!잰것.length) { console.log('잰 것이 하나도 없습니다 — 초록이 아닙니다'); process.exit(1); }
if (실패.length) console.log('빨강:\n' + 실패.map(t => '  ✗ ' + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : '')).join('\n'));
if (관리자빨강.length) console.log('관리자에게:\n' + 관리자빨강.map(t => '  ! ' + t.이름 + (t.곁 ? '\n      ' + t.곁 : '')).join('\n'));
process.exit(실패.length ? 1 : 0);
