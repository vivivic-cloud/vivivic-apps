/* ───────────────────────────────────────────────────────────────
   짚어서 지시하기 — **메뉴 화면에서 왜 붉은 테조차 안 뜨나** 를 재는 자.

   사장님 10-14: 「메인메뉴 까지만 되고 각 메뉴 들어갔을때는 안되요」 · 「붉은테도 안떠요」.

   ⚠⚠ **확인 못** — 메인메뉴(index.aspx)도 같은 자로 잰다. 메인은 사장님이 「된다」 하신 자리다.
        메인이 빨강이면 **이 자가 틀린 것**이다. 아무 숫자도 믿지 않는다.
   ⚠ 진짜 vendorpia.com 과 진짜 크롬 확장은 이 상자에서 못 돌린다. 꼴만 흉내 낸다 —
     ㄱ) 겉은 <frameset>, 안쪽 틀 주소가 /System/Master/goods.aspx 로 보이게 route 로 가로챈다
     ㄴ) 불러오기.js(document_end) → 짚개.js(document_idle) 차례 그대로 넣는다
     ㄷ) chrome.runtime / chrome.storage.local 은 흉내
     ㄹ) github.io·gstatic 은 막아 **확장 안의 것(손잡이.js)** 으로 가게 한다
     ㅁ) 길게 누르기는 mousedown → 600ms → mouseup, 그 사이 mousemove 없음
   ⚠ 참 확장은 짚개를 **따로인 세상(isolated)** 에서 돌린다. 이 자는 한 세상에서 돈다.
     __vp짚개·__vp손잡이붙음 은 짚개 안에서만 쓰고 읽으니 가름은 같다 — 다른 점은 적어 둔다.
   ─────────────────────────────────────────────────────────────── */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 흉내 = require('./흉내.cjs');

const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 판 = JSON.parse(fs.readFileSync(path.join(확장, 'manifest.json'), 'utf8')).version;
const 읽기 = (f) => fs.readFileSync(path.join(확장, f), 'utf8');

/* 확장 안의 글 — chrome.runtime.getURL 이 가리킬 자리 */
const 확장파일 = ['저장다리.js','vp-data.js','login.js','menu.js','search.js','johon.js',
                  'amt-draw.js','goods.js','손잡이.js','login.css','menu.css','search.css','goods.css'];

const 자리들 = [
  { 이름: '② 메인메뉴 index.aspx  ← 확인 못 (사장님: 된다)', 길: '/index.aspx',                    몸: 흉내.메인,            못: '#menu a' },
  { 이름: '③ 단품관리 goods.aspx',                           길: '/System/Master/goods.aspx',      몸: 흉내.목록('단품관리'), 못: '#칸5' },
  { 이름: '④ 상품관리 salesGoods.aspx',                      길: '/System/Master/salesGoods.aspx', 몸: 흉내.목록('상품관리'), 못: '#칸5' },
  { 이름: '⑤ 재고조회 StockList.aspx',                       길: '/System/Stock/StockList.aspx',   몸: 흉내.목록('재고조회'), 못: '#칸5' },
  /* ⑥⑦ 벤더피아가 그 화면에만 CSP 머리를 달았다면? — 바깥 글과 확장 글이 막힌다 */
  { 이름: "⑥ 단품관리 + CSP script-src 'self'",              길: '/System/Master/goods.aspx',      몸: 흉내.목록('단품관리'), 못: '#칸5',
    csp: "default-src 'self' 'unsafe-inline' data: https:; script-src 'self' 'unsafe-inline'" },
  { 이름: "⑦ 단품관리 + CSP style-src 'self'  ★",            길: '/System/Master/goods.aspx',      몸: 흉내.목록('단품관리'), 못: '#칸5',
    csp: "default-src 'self' 'unsafe-inline' data: https:; script-src 'self' 'unsafe-inline' https:; style-src 'self'" },
  /* ⑧ ⚠⚠ **이 자의 구멍을 메우는 자리.** 위 일곱은 내가 불러오기.js·짚개.js 를 **내 손으로 넣어 준다** —
     그러니 「글이 아예 안 돈다」 는 꼴은 구조상 만들 수 없고, 영원히 초록이다.
     그런데 사장님 꼴(딱지까지 안 보임)이 바로 그 꼴이다. 그래서 **글을 넣지 않는 자리**를 둔다.
     여기서 딱지 없음 · 테 없음 · 붉은 줄 없음 셋이 다 나오면, 뿌리는 「닿지 않는다」 다. */
  { 이름: '⑧ 단품관리 · **확장 글을 아예 안 넣는다** ★ (사장님 꼴과 맞춰 보는 자리)',
    길: '/System/Master/goods.aspx', 몸: 흉내.목록('단품관리'), 못: '#칸5', 글안넣음: true },
];

/* 짚개·불러오기 가 쓰는 chrome 을 흉내 낸다 */
const 크롬흉내 = (판, 길머리) => `
window.chrome = window.chrome || {};
chrome.runtime = { getManifest: () => ({ version: ${JSON.stringify(판)} }),
                   getURL: (f) => ${JSON.stringify(길머리)} + encodeURIComponent(f) };
(() => { const 통 = {};
  chrome.storage = { local: {
    get: async (k) => { if (k == null) return { ...통 };
      const ks = Array.isArray(k) ? k : (typeof k === 'string' ? [k] : Object.keys(k));
      const o = {}; for (const x of ks) if (x in 통) o[x] = 통[x]; return o; },
    set: async (o) => { Object.assign(통, o); },
    remove: async (k) => { for (const x of [].concat(k)) delete 통[x]; } } };
})();`;

const 재기 = () => {
  const head스타일 = [...document.head.querySelectorAll('style')].map(s => s.textContent);
  const 손잡이css = head스타일.some(t => /\.vg-sheet/.test(t));
  const 마크 = document.querySelector('.vg-mark');
  const cs = 마크 && getComputedStyle(마크);
  const 판 = document.querySelector('.vg-sheet');
  const pr = 판 && 판.getBoundingClientRect();
  const 판cs = 판 && getComputedStyle(판);
  return {
    '1_짚개돌았나': !!window.__vp짚개,
    '2_기억적혔나': (() => { try { return !!sessionStorage.getItem('vg기억장:' + location.pathname); } catch(e){ return 'storage 못 읽음'; } })(),
    '2b_기억열쇠': 'vg기억장:' + location.pathname,
    '3_손잡이붙음': !!window.__vp손잡이붙음,
    '3b_손잡이CSS가head에': 손잡이css,
    '3c_안내(.vg-hint)': !!document.querySelector('.vg-hint'),
    '4_마크붙었나': !!마크,
    '4b_마크outline': cs ? cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor : null,
    '4c_마크보이나': !!(cs && cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
                        && cs.visibility !== 'hidden' && cs.display !== 'none'),
    '4d_마크숨었나': !!(cs && (cs.display === 'none' || cs.visibility === 'hidden')),
    '4e_판떴나': !!판,
    '4f_판꼴': 판 ? { display: 판cs.display, position: 판cs.position, z: 판cs.zIndex,
                      자리: [Math.round(pr.x),Math.round(pr.y),Math.round(pr.width),Math.round(pr.height)] } : null,
    'vp_clean': document.documentElement.classList.contains('vp-clean'),
    'vp_root': !!document.getElementById('vp-root'),
    '붉은줄': (() => { const d = document.getElementById('vp-탈'); return d ? d.textContent.slice(0,120) : null; })(),
    '딱지': (() => { const d = document.getElementById('vp-판'); if (!d) return '딱지 없음';
        const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
        return d.textContent + ' | 보이나: ' + (cs.display !== 'none' && cs.visibility !== 'hidden'
          && r.width > 4 && r.height > 4) + ' | ' + cs.display; })(),
    '틀': window.top === window ? '맨 위' : '틀 안쪽',
    '화면': [innerWidth, innerHeight],
  };
};

(async () => {
  const 막은것 = []; const 결과 = [];
  const b = await chromium.launch({ executablePath: EXE });
  for (const 자리 of 자리들) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
    /* ㄹ) 바깥은 막는다 — 확장 안의 것으로 가게 */
    for (const p of ['**://vivivic-cloud.github.io/**', '**://*.gstatic.com/**', '**://*.firebaseio.com/**'])
      await ctx.route(p, r => { 막은것.push(r.request().url().slice(0,60)); r.abort('blockedbyclient'); });
    await ctx.route('**://identitytoolkit.googleapis.com/**', r =>
      r.fulfill({ status:200, contentType:'application/json', body: JSON.stringify({ idToken:'FAKE' }) }));
    await ctx.route('**://firestore.googleapis.com/**', r =>
      r.fulfill({ status:200, contentType:'application/json', body: JSON.stringify({ name:'x', fields:{} }) }));
    /* ㄱ) 벤더피아를 흉내 낸다 */
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url());
      const 길 = decodeURIComponent(u.pathname);
      if (길.startsWith('/__확장__/')) {
        const f = decodeURIComponent(길.slice('/__확장__/'.length));
        if (!확장파일.includes(f)) return r.fulfill({ status: 404, body: 'no' });
        return r.fulfill({ status: 200, contentType: f.endsWith('.css') ? 'text/css' : 'text/javascript',
                           body: 읽기(f) });
      }
      if (길 === '/틀.aspx')  return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 흉내.틀(자리.길) });
      if (길 === '/top.aspx') return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 흉내.몸통('위','<div>벤더피아</div>') });
      if (길 === 자리.길 && r.request().method() === 'GET')
        return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 자리.몸,
          headers: Object.assign({ 'content-type':'text/html; charset=utf-8' },
                                 자리.csp ? { 'content-security-policy': 자리.csp } : {}) });
      /* 조회(POST)·그 밖의 화면 — 빈 결과를 돌려준다 */
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 흉내.빈결과 });
    });

    const page = await ctx.newPage();
    const 탈 = [], 콘 = [];
    page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,170)));
    page.on('console', m => { if (m.type() === 'error') 콘.push(m.text().slice(0,140)); });

    /* ㄴ) content_script 차례 그대로 — 틀마다, 문서가 생길 때 */
    const 넣은틀 = new Set();
    const 붙이기 = async (f) => {
      if (자리.글안넣음) return;                      // ⑧ — 확장이 안 닿은 꼴
      if (!f || 넣은틀.has(f) || f.isDetached()) return;
      try {
        const 몸 = await f.evaluate(() => document.body && document.body.tagName);
        if (!몸) return;
        넣은틀.add(f);
        await f.evaluate(크롬흉내(판, 'https://vendorpia.com/__확장__/'));
        await f.evaluate(읽기('불러오기.js'));           // document_end
        await f.waitForTimeout ? null : null;
        await new Promise(r => setTimeout(r, 300));
        await f.evaluate(읽기('짚개.js'));                // document_idle
      } catch (e) { /* 틀이 사라졌으면 그만 */ }
    };
    page.on('framenavigated', f => { 넣은틀.delete(f); });

    await page.goto('https://vendorpia.com/틀.aspx', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    for (const f of page.frames()) await 붙이기(f);
    await page.waitForTimeout(1800);                      // 화면 글이 제 일을 하도록 기다린다

    const F = page.frames().find(f => decodeURIComponent(f.url()).includes(자리.길)) ;
    if (!F) { 결과.push({ 이름: 자리.이름, 탈: '틀 못 찾음', 틀들: page.frames().map(f=>f.url()) }); await ctx.close(); continue; }

    /* ㅁ) 길게 누르기 — mousedown → 600ms → mouseup, 사이에 mousemove 없음 */
    let 짚기탈 = null, 짚은곳 = null;
    try {
      const el = await F.waitForSelector(자리.못, { timeout: 4000, state: 'attached' });
      await el.scrollIntoViewIfNeeded().catch(()=>{});
      const bb = await el.boundingBox();
      if (!bb) throw new Error('짚을 자리가 화면에 없다 (boundingBox 없음)');
      짚은곳 = [Math.round(bb.x), Math.round(bb.y), Math.round(bb.width), Math.round(bb.height)];
      await page.mouse.move(bb.x + bb.width/2, bb.y + bb.height/2);
      await page.mouse.down();
      await new Promise(r => setTimeout(r, 600));
      await page.mouse.up();
      await new Promise(r => setTimeout(r, 700));
    } catch (e) { 짚기탈 = String(e.message).split('\n')[0].slice(0,150); }

    const 잰값 = await F.evaluate(재기);
    결과.push({ 이름: 자리.이름, 길: 자리.길, 짚은곳, 짚기탈, 잰값, 탈, 콘 });
    await ctx.close();
  }
  await b.close();

  /* ── 찍기 ── */
  console.log('\n■ 벤더피아 보기 v' + 판 + ' — 메뉴 화면 짚기 자 (흉내)');
  console.log('  막은 바깥 글: ' + (막은것.length ? 막은것.length + '개 (확장 안의 것으로 갔다)' : '없음 — ⚠ 자가 안 막았다'));
  let 초록 = 0, 빨강 = 0;
  for (const r of 결과) {
    console.log('\n──── ' + r.이름 + ' ────');
    if (!r.잰값) { console.log('  ' + JSON.stringify(r)); 빨강++; continue; }
    const v = r.잰값;
    const 줄 = (n, 참, 글) => { console.log('  ' + (참 ? '초록' : '빨강') + ' ' + n + ' ' + 글); return 참; };
    const a = 줄('1', v['1_짚개돌았나'], '짚개.js 돌았나 (__vp짚개)');
    const c = 줄('2', v['2_기억적혔나'] === true, '기억 적혔나 ' + v['2b_기억열쇠'] + ' → ' + v['2_기억적혔나']);
    const d = 줄('3', v['3_손잡이붙음'], '손잡이 붙었나 (__vp손잡이붙음) · head 에 손잡이 CSS: ' + v['3b_손잡이CSS가head에'] + ' · 안내: ' + v['3c_안내(.vg-hint)']);
    const e = 줄('4', v['4_마크붙었나'], '붉은 테 붙었나 (.vg-mark)');
    const f = 줄('4c', v['4c_마크보이나'], '붉은 테가 **보이는 값**인가 → outline: ' + v['4b_마크outline'] + (v['4d_마크숨었나'] ? ' · ⚠ display/visibility 로 **숨었다**' : ''));
    const g = 줄('4e', v['4e_판떴나'], '지시판 떴나 (.vg-sheet) ' + JSON.stringify(v['4f_판꼴']));
    console.log('     딱지(사장님이 왼쪽 아래에서 보시는 것): ' + v['딱지']);
    console.log('     vp-clean: ' + v.vp_clean + ' · #vp-root: ' + v.vp_root + ' · ' + v['틀'] + ' ' + JSON.stringify(v['화면']) + ' · 짚은곳 ' + JSON.stringify(r.짚은곳));
    if (r.짚기탈) console.log('     짚기탈: ' + r.짚기탈);
    if (v['붉은줄']) console.log('     붉은줄: ' + v['붉은줄']);
    if (r.탈 && r.탈.length) console.log('     터진 말: ' + JSON.stringify(r.탈.slice(0,3)));
    if (r.콘 && r.콘.length) console.log('     콘솔탈: ' + JSON.stringify(r.콘.slice(0,3)));
    for (const x of [a,c,d,e,f,g]) x ? 초록++ : 빨강++;
  }
  console.log('\n초록 ' + 초록 + ' · 빨강 ' + 빨강);
  console.log('⚠ 흉내다. 진짜 vendorpia.com·진짜 확장은 이 상자에서 못 돌린다.');
})();
