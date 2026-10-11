/* 기계배치도 — **이름 붙여 저장한 것이 화베에 올라가는가** 시험.

       node 기계배치도/tests/화베저장.mjs

   사장님 말씀(10-10): 「저장버튼을 눌러 현재의 상태를 각각 저장 할 수 있게
   해줘 … 화베에 대한 내용은 바이글 저장소 채팅에 물어봐」
   바이글 답(10-11): 칸은 `layout_저장`, 문서 id 는 우리가 짓고 이름은 칸 안에,
   같은 이름이면 덮고, ⚠ **쓰고 나서 다시 읽어** 본 뒤에야 담겼다고 적어라.

   ⚠ 가장 센 자(⚠ 표) — 「**거짓 초록**」. 못 올렸는데 담겼다고 적으면 사장님이
      담긴 줄 아시고 폰을 바꾸신다. 그때 그 배치가 날아간다. 쓰기·읽기를 따로
      막아 두 가지 다 잰다. */
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
const 저장앞 = 'artifacts/vivivic-4b7ef/public/data/layout_저장/';

/* 창고 허수아비 — `window.__막음` 으로 쓰기·읽기를 따로 막을 수 있다.
   `__비틀기` 를 켜면 올라간 것과 **다른 것**이 읽힌다(올리다 깨진 꼴). */
const 허수아비 = {
    'firebase-app.js': `export const initializeApp = () => ({ 흉내: 1 });`,
    'firebase-auth.js': `
        export const getAuth = () => ({ currentUser: { uid: '시험' } });
        export const signInAnonymously = async () => ({});
        export const onAuthStateChanged = (a, cb) => { setTimeout(() => cb({ uid: '시험' }), 10); };`,
    'firebase-firestore.js': `
        export const getFirestore = () => ({ 흉내: 1 });
        export const doc = (db, ...길) => ({ 길: 길.join('/'), 쪽: 길.length });
        export const getDoc = async (r) => {
            const 막 = window.__막음 || {};
            if (막.읽기) throw new Error('읽기를 막았습니다');
            let 것 = (window.__창고 = window.__창고 || {})[r.길];
            if (것 && window.__비틀기) 것 = { ...것, 때: (+것['때'] || 0) + 7 };
            return { exists: () => !!것, data: () => 것 };
        };
        export const setDoc = async (r, d) => {
            const 막 = window.__막음 || {};
            if (막.쓰기) throw new Error('쓰기를 막았습니다');
            (window.__창고 = window.__창고 || {})[r.길] = JSON.parse(JSON.stringify(d));
            (window.__길들 = window.__길들 || []).push({ 길: r.길, 쪽: r.쪽 });
            window.__창고셈 = (window.__창고셈 || 0) + 1;
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

/* 창고에 든 저장본 문서만 본다 — 실시간 거울(layout_배치도)은 세지 않는다 */
const 창고본 = () => p.evaluate(앞 => {
    const 창 = window.__창고 || {};
    const 적힌 = window.__길들 || [];
    const 길들 = Object.keys(창).filter(k => k.startsWith(앞));
    return 길들.map(k => ({ 길: k, id: k.slice(앞.length), 것: 창[k],
                            쪽: (적힌.filter(x => x.길 === k).pop() || {}).쪽 || 0 }));
}, 저장앞);
const 봄 = () => p.evaluate(() => {
    const 본 = (() => { try { return JSON.parse(localStorage.getItem('layout.저장본.v1') || '[]'); }
                        catch (e) { return []; } })();
    return {
        저장판쪽지: document.getElementById('l-save-msg').textContent,
        나쁨: document.getElementById('l-save-msg').className.includes('나쁨'),
        목록: [...document.querySelectorAll('.l저장줄 .l저장이름 b')].map(e => e.textContent),
        저장본: 본,
        쪽지: document.getElementById('l-note').textContent,
    };
});
const 담기 = async (이름, 쉼 = 400) => {
    const 열렸나 = await p.evaluate(() => !document.getElementById('l-save-sheet').hidden);
    if (!열렸나) { await p.click('#l-save-btn'); await p.waitForTimeout(220); }
    await p.fill('#l-save-name', 이름);
    await p.click('#l-save-do'); await p.waitForTimeout(쉼);
};
const 닫기 = async () => { await p.click('#l-save-close'); await p.waitForTimeout(180); };
const 깨끗이 = async () => {
    await p.evaluate(ks => { ks.forEach(k => localStorage.removeItem(k));
                             window.__창고 = {}; window.__창고셈 = 0; window.__길들 = [];
                             window.__막음 = {}; window.__비틀기 = false; }, 열쇠들);
    await p.goto(주소, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(560);
    for (let i = 0; i < 3; i++) { await p.click('#l-zin'); await p.waitForTimeout(150); }
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
const 점 = area => p.evaluate(a => {
    const e = document.querySelector('.lmc[data-area="' + a + '"]');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const 거기 = document.elementFromPoint(x, y);
    return { x, y, id: e.dataset.id, 잡히나: !!(거기 && 거기.closest('.lmc') === e) };
}, area);
/* 끌려면 먼저 창 가운데로 데려와야 한다 — 확대해 놓으면 창밖에 있을 수 있다 */
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
async function 끌어(area, dx, dy) {
    await 보이게(area);
    const 그것 = await 점(area);
    if (!그것 || !그것.잡히나) return false;
    await p.mouse.move(그것.x, 그것.y); await p.mouse.down();
    for (let i = 1; i <= 7; i++) { await p.mouse.move(그것.x + dx * i / 7, 그것.y + dy * i / 7); await p.waitForTimeout(22); }
    await p.mouse.up(); await p.waitForTimeout(300);
    return true;
}
/* 담긴 자리는 「내 배치」 열쇠에서 읽는다 */
const 자리들 = () => p.evaluate(() => {
    const d = (() => { try { return JSON.parse(localStorage.getItem('layout.배치.v2') || 'null'); }
                       catch (e) { return null; } })();
    return d ? d['기계들'].map(m => m.id + ':' + m.x + ',' + m.y).join(' | ') : '';
});

await p.goto(주소, { waitUntil: 'domcontentloaded' });
await 깨끗이();

/* ══ 1. 이름 붙여 저장 → 화베에 진짜 문서가 생기나 ══════════════════ */
console.log('\n── 1. 화베에 문서가 생기나');
await 담기('첫 안');
{
    const 본것 = await 봄(), 창 = await 창고본();
    재기('화베에 문서가 하나 생겼나', 창.length === 1,
         창.map(x => x.길).join(' | ') || '없음');
    const 하나 = 창[0] || { 것: {}, id: '' };
    const 폰것 = 본것.저장본[0] || {};
    재기('문서 id 가 폰에 담긴 id 와 같나', 창.length === 1 && 하나.id === 폰것.id,
         '화베 ' + 하나.id + ' / 폰 ' + 폰것.id);
    재기('⚠ 문서 id 에 사람이 지은 이름이 안 들어갔나', /^v\d+_\d+$/.test(하나.id) && !하나.id.includes('첫'),
         하나.id);
    재기('길이 여섯 쪽인가 (artifacts/vivivic-4b7ef/public/data/layout_저장/id)',
         하나.쪽 === 6 && 하나.길.split('/').length === 6
         && 하나.길 === 저장앞 + 하나.id,
         하나.길 + ' (쪽 ' + 하나.쪽 + ')');
    const 것 = 하나.것 || {};
    재기('이름이 칸 안에 그대로 담겼나', 것['이름'] === '첫 안', String(것['이름']));
    재기('벌·때·돌림이 담겼나',
         것['벌'] === '내배치' && +것['때'] === +폰것.때 && 것['돌림'] === false,
         것['벌'] + ' · 때 ' + 것['때'] + ' · 돌림 ' + 것['돌림']);
    재기('바닥이 폰 것과 같나',
         +것['바닥']['가로'] === +폰것.바닥.가로 && +것['바닥']['세로'] === +폰것.바닥.세로,
         미터글(것['바닥']) + ' / ' + 미터글(폰것.바닥));
    재기('네모 수가 폰 것과 같나',
         (것['기계들'] || []).length === (폰것.기계들 || []).length && 것['기계들'].length === 20,
         (것['기계들'] || []).length + '개 / 폰 ' + (폰것.기계들 || []).length + '개');
    재기('네모 하나하나가 그대로 담겼나',
         JSON.stringify(것['기계들']) === JSON.stringify(폰것.기계들),
         (것['기계들'] || [])[0] ? JSON.stringify(것['기계들'][0]).slice(0, 60) : '없음');
    재기('⚠ 다시 읽어 본 뒤에 「저장됐습니다」 라고 적었나',
         본것.저장판쪽지.includes('저장됐습니다') && 본것.저장판쪽지.includes('화베') && !본것.나쁨,
         본것.저장판쪽지);
}
function 미터글(b) { return b ? (b['가로'] + '×' + b['세로']) : '없음'; }

/* ══ 2. 같은 이름으로 다시 → 덮이나 ════════════════════════════════ */
console.log('\n── 2. 같은 이름이면 덮나');
{
    const 앞 = (await 창고본())[0];
    await 닫기();
    await 끌어('기계:재단기', 40, 26);
    await 담기('첫 안');
    const 본것 = await 봄(), 창 = await 창고본();
    재기('문서가 둘로 안 늘었나 (하나 그대로)', 창.length === 1, 창.length + '개');
    재기('같은 문서 id 를 덮었나', (창[0] || {}).id === 앞.id,
         '앞 ' + 앞.id + ' / 뒤 ' + (창[0] || {}).id);
    재기('덮인 것이 새것인가 (때가 더 큼)',
         +(창[0] || {}).것['때'] > +앞.것['때'],
         앞.것['때'] + ' → ' + (창[0] || {}).것['때']);
    재기('폰 목록도 하나 그대로인가', 본것.목록.length === 1 && 본것.저장본.length === 1,
         본것.목록.join(' | '));
    재기('덮었다고 적었나', 본것.저장판쪽지.includes('고쳐') && !본것.나쁨, 본것.저장판쪽지);
}

/* ══ 3. 다른 이름이면 따로 쌓이나 ══════════════════════════════════ */
console.log('\n── 3. 다른 이름은 따로');
await 담기('둘째 안');
{
    const 본것 = await 봄(), 창 = await 창고본();
    재기('문서가 둘 되었나', 창.length === 2, 창.map(x => x.것['이름']).join(' | '));
    재기('폰 목록도 둘인가', 본것.목록.length === 2, 본것.목록.join(' | '));
    재기('id 가 서로 다른가', 창[0].id !== 창[1].id, 창.map(x => x.id).join(' / '));
}

/* ══ 4. ⚠ 이름에 `/`·빈칸·한글이 섞여도 안 깨지나 ════════════════ */
console.log('\n── 4. 이름에 / · 빈칸 · 한글');
{
    const 험한이름 = '10/11 재단기 옆 · 안';
    await 담기(험한이름);
    const 본것 = await 봄(), 창 = await 창고본();
    재기('⚠ 문서가 생겼나 (셋)', 창.length === 3, 창.length + '개');
    const 그것 = 창.find(x => x.것['이름'] === 험한이름);
    재기('⚠ 이름이 글자 그대로 담겼나', !!그것, 그것 ? 그것.것['이름'] : '못 찾음');
    재기('⚠ 길이 안 깨졌나 (쪽이 여섯, id 에 / 없음)',
         !!그것 && 그것.쪽 === 6 && 그것.길.split('/').length === 6
         && !그것.id.includes('/') && 그것.길 === 저장앞 + 그것.id,
         그것 ? 그것.길 : '—');
    재기('목록에 이름 그대로 보이나', 본것.목록.includes(험한이름), 본것.목록.join(' | '));
    await 담기(험한이름);
    const 창2 = await 창고본();
    재기('⚠ 험한 이름도 덮이나 (셋 그대로)', 창2.length === 3, 창2.length + '개');
    await p.screenshot({ path: path.join(그림칸, '화베저장-목록.png') });
}

/* ══ 5. ⚠ 쓰기를 막으면 — 거짓 초록이 안 뜨나 ════════════════════ */
console.log('\n── 5. 쓰기를 일부러 막는다');
{
    await p.evaluate(() => { window.__막음 = { 쓰기: true }; });
    const 앞창 = (await 창고본()).length;
    await 담기('못 올릴 안');
    const 본것 = await 봄(), 창 = await 창고본();
    재기('⚠ 거짓 초록이 안 떴나 (저장됐다고 안 적었나)',
         !본것.저장판쪽지.includes('저장됐습니다'), 본것.저장판쪽지);
    재기('⚠ 한 줄로 알렸나 (폰에만 담겼다)',
         본것.저장판쪽지 === '폰에만 담겼습니다 — 화베에 못 올렸습니다' && 본것.나쁨,
         본것.저장판쪽지 + ' · 나쁨 ' + 본것.나쁨);
    재기('화베에는 안 올라갔나', 창.length === 앞창, 창.length + '개 (앞 ' + 앞창 + '개)');
    재기('그래도 폰에는 담겼나',
         본것.저장본.some(v => v.이름 === '못 올릴 안') && 본것.목록.includes('못 올릴 안'),
         본것.목록.join(' | '));
}

/* ══ 6. ⚠ 썼는데 다시 안 읽히면 — 역시 거짓 초록이 없나 ══════════ */
console.log('\n── 6. 쓰고 나서 읽기를 막는다');
{
    await p.evaluate(() => { window.__막음 = { 읽기: true }; });
    await 담기('읽기 막은 안');
    const 본것 = await 봄();
    재기('⚠ 읽히지 않으면 저장됐다고 안 적나',
         본것.저장판쪽지 === '폰에만 담겼습니다 — 화베에 못 올렸습니다' && 본것.나쁨,
         본것.저장판쪽지);
}
console.log('\n── 7. 올라간 것이 다르면');
{
    await p.evaluate(() => { window.__막음 = {}; window.__비틀기 = true; });
    await 담기('비틀린 안');
    const 본것 = await 봄();
    재기('⚠ 올라간 것이 다르면 저장됐다고 안 적나',
         본것.저장판쪽지 === '폰에만 담겼습니다 — 화베에 못 올렸습니다' && 본것.나쁨,
         본것.저장판쪽지);
    await p.evaluate(() => { window.__비틀기 = false; });
    await 담기('바른 안');
    const 본2 = await 봄();
    재기('비틀기를 끄면 다시 저장됐다고 적나',
         본2.저장판쪽지.includes('저장됐습니다') && !본2.나쁨, 본2.저장판쪽지);
}

/* ══ 8. 불러오기 — 그 배치가 그대로 돌아오나 ══════════════════════ */
console.log('\n── 8. 불러오면 그대로 돌아오나');
{
    await 깨끗이();
    await 끌어('기계:재단기', 36, 24);
    const 담을때자리 = await 자리들();
    await 담기('되돌릴 안');
    const 창 = await 창고본();
    재기('담을 때 화베에도 올라갔나', 창.length === 1 && !(await 봄()).나쁨,
         창.length + '개');
    await 닫기();
    await 끌어('기계:재단기', -60, 40);
    await 끌어('기계:스키퍼 1', 30, 30);
    const 흐트러진 = await 자리들();
    재기('흐트러뜨렸나 (자리가 달라졌나)', 흐트러진 !== 담을때자리,
         흐트러진 === 담을때자리 ? '안 달라짐' : '달라짐');
    await p.click('#l-save-btn'); await p.waitForTimeout(250);
    await p.click('.l저장줄 button[data-area^="불러오기"]'); await p.waitForTimeout(450);
    const 돌아온 = await 자리들();
    재기('⚠ 불러오니 담을 때 자리로 그대로 돌아왔나', 돌아온 === 담을때자리,
         돌아온 === 담을때자리 ? '같음' : '다름');
    const 본것 = await 봄();
    재기('불러온 뒤 되돌릴 수 있다고 알리나', 본것.쪽지.includes('뒤로'), 본것.쪽지);
}

/* ══ 9. 안 달라진 것 — 실시간 거울은 그대로인가 ══════════════════ */
console.log('\n── 9. 안 달라진 것');
{
    const 잰 = await p.evaluate(() => {
        const 창 = window.__창고 || {};
        return { 거울: Object.keys(창).filter(k => k.includes('layout_배치도')),
                 셈: window.__창고셈 || 0 };
    });
    재기('실시간 거울은 여전히 layout_배치도/현재v2 한 자리인가',
         잰.거울.length === 1 && 잰.거울[0].endsWith('layout_배치도/현재v2'),
         잰.거울.join(' | '));
}

재기('처음부터 끝까지 터진 것이 없나', 터짐.length === 0, 터짐.join(' | ') || '없음');

const 초록 = 잰것.filter(x => x.됐나).length, 빨강 = 잰것.length - 초록;
console.log('\n초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 0 (잰 것 모두 ' + 잰것.length + ')');
if (빨강) { console.log('빨강:'); 잰것.filter(x => !x.됐나).forEach(x =>
    console.log('  ✗ ' + x.이름 + (x.곁 ? '   [' + x.곁 + ']' : ''))); }
await b.close();
process.exit(빨강 ? 1 : 0);
