// 바이글 10-12: 「사장님이 지우셔도 다음에 열면 또 생긴다 … 「한 번 세웠다」 는 자국을
//  따로 남겨라. ㄱ) 박스를 지우는 길이 그 자국까지 지우면 안 된다 ㄴ) 자국이 네모로
//  떠서는 안 된다 ㄷ) localStorage 로만 두지 마라」
// ① 처음 한 번은 박스가 제대로 서고 **자국도 남는지** ② 같은 판에서 소식이 여러 번 와도
// 문서가 하나인지 ③ **박스를 지우고 다시 열면 안 생기는지** ④ 자국이 박스판에
// 네모로 안 뜨는지 ⑤ 박스를 지우는 길이 자국을 안 지우는지 ⑥ 못 읽어도 안 터지는지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));

const 박스칸 = 'artifacts/vivivic-4b7ef/public/data/amt_boxes/출고내역';
// 조혼가구와 **같은 꼴**이다 — 그 집은 johon_meta/박스세움 의 「거래내역」 칸
const 자국칸 = 'artifacts/vivivic-4b7ef/public/data/amt_meta/박스세움';

// 창고를 **노드 쪽에 들고** 다닌다 — 새로고침해도 화베는 안 비워지기 때문이다
async function 열기(창고, 막나) {
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1200);
  await p.evaluate(({ 창고, 막나 }) => {
    document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
    window.__쓴곳 = []; window.__창고 = JSON.parse(JSON.stringify(창고)); window.__막나 = !!막나;
    const 방 = (...a) => a.join('/');
    window.db = {}; window._myAccount = { uid: '시험uid' };
    window.fbFirestore = {
      doc: (db, ...a) => ({ 길: 방(...a) }),
      collection: (db, ...a) => ({ 길: 방(...a) }),
      setDoc: async (r, v) => { window.__쓴곳.push(r.길); window.__창고[r.길] = v; },
      updateDoc: async (r, v) => { window.__쓴곳.push(r.길); Object.assign(window.__창고[r.길] || (window.__창고[r.길] = {}), v); },
      deleteDoc: async (r) => { window.__쓴곳.push('지움:' + r.길); delete window.__창고[r.길]; },
      addDoc: async (r) => { window.__쓴곳.push(r.길); },
      getDoc: async (r) => { if (window.__막나) throw new Error('PERMISSION_DENIED: 시험으로 막음');
        return { exists: () => !!window.__창고[r.길], data: () => window.__창고[r.길] || {} }; },
      getDocs: async () => ({ forEach: () => {} }),
      onSnapshot: (r, cb) => {
        if (/amt_boxes$/.test(r.길)) {
          // 진짜 화베처럼 **첫 소식에 이미 있는 박스가 실려 온다**
          window.__박스듣기 = () => cb({ forEach: (f) =>
            Object.entries(window.__창고).filter(([k]) => k.indexOf('/amt_boxes/') >= 0)
              .forEach(([k, v]) => f({ id: k.split('/').pop(), data: () => v })) });
          window.__박스듣기(); return () => {};
        }
        if (cb) cb({ forEach: () => {} }); return () => {}; },
      query: x => x, serverTimestamp: () => '때', deleteField: () => null };
  }, { 창고, 막나 });
  return await p.evaluate(async () => {
    try { window.amtBoxSync(); } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
    window.__박스듣기 && window.__박스듣기();
    await new Promise(r => setTimeout(r, 400));
    return { 쓴곳: window.__쓴곳.slice(), 창고: window.__창고,
             네모: [...document.querySelectorAll('[data-amtb-id]')]
               .map(e => (e.querySelector('.amth-nm')?.textContent || '').trim()) };
  });
}

// ── ① 처음 한 번 — 박스가 서고 자국도 남는다 ───────────────────────
let 한 = await 열기({});
console.log('■ 첫 판: ' + JSON.stringify({ 쓴곳: 한.쓴곳, 네모: 한.네모 }));
판('① 처음 한 번은 박스가 제대로 선다',
   !!한.창고[박스칸] && 한.창고[박스칸].name === '출고내역' && 한.네모.includes('출고내역'),
   JSON.stringify(한.창고[박스칸]) + ' · 네모 ' + JSON.stringify(한.네모));
판('① 「한 번 세웠다」 자국이 **박스 칸 밖에** 남는다 (amt_meta/박스세움 의 출고내역 칸)',
   !!한.창고[자국칸] && !!한.창고[자국칸].출고내역 && /amt_meta\/박스세움$/.test(자국칸),
   JSON.stringify(한.창고[자국칸]));
// 조혼가구가 지킨 차례 그대로 — **박스를 먼저, 자국을 나중에** 쓴다
판('① 차례가 박스 먼저 · 자국 나중이다',
   한.쓴곳.indexOf(박스칸) >= 0 && 한.쓴곳.indexOf(박스칸) < 한.쓴곳.indexOf(자국칸),
   JSON.stringify(한.쓴곳.map(k => k.split('/').slice(-2).join('/'))));
판('② 소식이 두 번 와도 박스 문서는 하나다',
   한.쓴곳.filter(k => k === 박스칸).length === 1 && 한.쓴곳.filter(k => k === 자국칸).length === 1,
   JSON.stringify(한.쓴곳));
판('④ 자국은 박스판에 **네모로 안 뜬다**',
   한.네모.filter(n => n === '출고내역').length === 1 && !한.네모.some(n => /자국|한번/.test(n)),
   JSON.stringify(한.네모));

// ── ③ 새로 열어도 또 안 쓴다 ───────────────────────────────────────
const 두 = await 열기(한.창고);
console.log('■ 두 번째 판: ' + JSON.stringify({ 쓴곳: 두.쓴곳, 네모: 두.네모 }));
판('③ 다시 열어도 **아무것도 다시 쓰지 않는다**',
   두.쓴곳.length === 0 && 두.네모.includes('출고내역'), JSON.stringify(두.쓴곳));

// ── ⑤ 박스를 지워 본다 — 자국은 남아야 한다 ────────────────────────
const 지운뒤 = await p.evaluate(async () => {
  const b2 = [...document.querySelectorAll('[data-amtb-id]')]
    .find(e => (e.querySelector('.amth-nm')?.textContent || '').trim() === '출고내역');
  const { deleteDoc, doc } = window.fbFirestore;
  await deleteDoc(doc(window.db, 'artifacts', 'vivivic-4b7ef', 'public', 'data', 'amt_boxes',
    b2 ? b2.dataset['amtbId'] : '출고내역'));
  return { 창고: window.__창고, 쓴곳: window.__쓴곳.slice() };
});
판('⑤ 박스를 지우는 길이 **자국까지 지우지 않는다**',
   !지운뒤.창고['artifacts/vivivic-4b7ef/public/data/amt_boxes/출고내역'] && !!지운뒤.창고[자국칸],
   '박스 ' + !!지운뒤.창고[박스칸] + ' · 자국 ' + !!지운뒤.창고[자국칸]);

// ── ③ 지운 뒤 다시 열면 **안 생긴다** ← 이게 못이다 ────────────────
const 셋 = await 열기(지운뒤.창고);
console.log('■ 지우고 다시 연 판: ' + JSON.stringify({ 쓴곳: 셋.쓴곳, 네모: 셋.네모 }));
판('③ **지우고 다시 열어도 출고내역 박스가 안 생긴다**',
   !셋.창고[박스칸] && !셋.네모.includes('출고내역') && 셋.쓴곳.length === 0,
   '박스 ' + !!셋.창고[박스칸] + ' · 네모 ' + JSON.stringify(셋.네모) + ' · 쓴 곳 ' + JSON.stringify(셋.쓴곳));

// ── 박스는 이미 있는데 자국만 없을 때 — **박스는 안 쓰고 자국만** 적는다 ──
// (조혼가구가 잰 셋째 값: 「이미 있음 → 박스 0회」)
const 다섯 = await 열기({ [박스칸]: { name: '출고내역', icon: 'truck', tone: 'light',
  link: '출고', 곳: 'home', at: 1 } });
console.log('■ 박스만 있을 때: ' + JSON.stringify({ 쓴곳: 다섯.쓴곳, 네모: 다섯.네모 }));
판('② 박스가 이미 있으면 **박스는 0회** 쓰고 자국만 적는다',
   다섯.쓴곳.filter(k => k === 박스칸).length === 0
   && 다섯.쓴곳.filter(k => k === 자국칸).length === 1 && 다섯.네모.includes('출고내역'),
   JSON.stringify(다섯.쓴곳.map(k => k.split('/').slice(-2).join('/'))));

// ── ⑥ 자국을 못 읽어도 안 터지고, 함부로 세우지도 않는다 ───────────
const 넷 = await 열기({}, true);
console.log('■ 못 읽을 때: ' + JSON.stringify({ 쓴곳: 넷.쓴곳 }));
판('⑥ 자국을 못 읽으면 **세우지 않는다** (모르면서 짓지 않는다)',
   넷.쓴곳.length === 0, JSON.stringify(넷.쓴곳));
판('⑥ 그때도 안 터진다', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '박스자국1   OK' : '박스자국1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
