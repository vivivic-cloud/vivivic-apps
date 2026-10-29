/* 단품관리 목록 → 납품내역 `납품내역_단품목록` 자동 올림(0.34.78)을 재는 자.
   사장님: 「제품목록에 나타나는 각 제품명 옆에 벤더피아연동 프로그램의 단품관리 의 단품을 검색 할 수 있게 해주세요. …」 → 「확장이 자동으로」
   보아야 하는 것 —
     ㄱ) 빈 창고에 `단품_N`(1,000개씩) + `_정보` 를 **제품목록이 읽는 꼴**로 쓰나 — 줄 = "코드\t이름\t상태", 중지 뒤로, 가나다
     ㄴ) 금액·매입처·사람 칸이 **하나도 안 실리나**
     ㄷ) 같은 목록으로 다시 열면 **쓰기 0**(읽기 한 번뿐)
     ㄹ) 하나 바뀌고 줄면 **바뀐 문서만** 쓰고 남는 `단품_N` 을 지우나 — 한 번의 `:commit` 으로
     ㅁ) 절반 아래로 줄면 안 올리나 · `납품내역_단품연결`·`vp_` 자리는 안 건드리나 · 벤더피아로 POST 0
   ⚠ 진짜 vendorpia.com·창고는 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. 맥: VP_EXE 에 크로미움 경로. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');

const 머리 = ["단품코드","단품명","매입처명","단품분류","재고유형","발주유형","판매상태","매입단가","고객명","전화","주소"];
/* n 개 — 셋 중 하나는 중지, 금액·사람 칸은 알아보기 쉬운 가짜 값 */
const 줄짓기 = (n, 바꿈 = {}) => Array.from({ length: n }, (_, i) => {
  const c = "T" + String(i).padStart(5, "0");
  return [c, 바꿈[c] || ("단품 " + (i % 997) + "호 " + c), "가매입처", "서랍장", "재고", "발주",
    i % 3 === 0 ? "중지" : "판매중", "77777", "홍길동", "010-1234-5678", "서울시 ○○구"];
});

const 쪽 = `<html><head><meta charset="utf-8"><title>단품관리</title></head><body id="body">
<form name="aspnetForm" method="post" action="/System/Master/goods.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x"><select name="ddlStatus" id="ddlStatus"><option value="전체" selected>전체</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
const VP흉내 = (줄) => `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    if (String(url).indexOf("/System/Master/goods.aspx") >= 0) {
      var 줄 = ${JSON.stringify(줄)};
      for (var i = 0; i < 줄.length; i += 700) cb(${JSON.stringify(머리)}, 줄.slice(i, i + 700), Math.min(i + 700, 줄.length), 줄.length);
    } else cb(["단품코드","단품명"], [], 0, 0);
    return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){ return {}; }, set: async function(){}, remove: async function(){} };`;

/* 창고 흉내 — 문서 이름 → fields. GET 목록 · :commit(update/delete) 만 받는다 */
const 창고 = new Map();
const 이름뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents/artifacts/vivivic-4b7ef/public/data/';
let 기록 = [];
const 풀기 = (f) => {
  const o = {};
  for (const [k, v] of Object.entries(f || {}))
    o[k] = 'arrayValue' in v ? (v.arrayValue.values || []).map((x) => x.stringValue)
      : 'integerValue' in v ? Number(v.integerValue) : v.stringValue;
  return o;
};

async function 한번(b, 줄, 제목) {
  기록 = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => r.abort('blockedbyclient'));
  await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200,
    contentType: 'application/json', body: JSON.stringify({ idToken: 'fake' }) }));
  await ctx.route('**://firestore.googleapis.com/**', (r) => {
    const q = r.request(), u = decodeURIComponent(new URL(q.url()).pathname), 몸 = q.postData() || '';
    기록.push({ 셈: q.method(), 길: u, 몸 });
    if (q.method() === 'GET' && u.endsWith('/납품내역_단품목록')) {
      const documents = [...창고].map(([name, fields]) => ({ name: 이름뿌리 + '납품내역_단품목록/' + name, fields }));
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(documents.length ? { documents } : {}) });
    }
    if (q.method() === 'POST' && u.endsWith(':commit')) {
      for (const w of JSON.parse(몸).writes) {
        const n = (w.update ? w.update.name : w.delete);
        if (!n.startsWith(이름뿌리 + '납품내역_단품목록/')) continue;
        const 이름 = n.slice((이름뿌리 + '납품내역_단품목록/').length);
        if (w.update) 창고.set(이름, w.update.fields); else 창고.delete(이름);
      }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' });   // 차수·수입정보 물음
  });
  await ctx.route('**://vendorpia.com/**', (r) => {
    기록.push({ 셈: r.request().method(), 길: 'vendorpia ' + new URL(r.request().url()).pathname, 몸: '' });
    return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 쪽 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 160)));
  await page.goto('https://vendorpia.com/System/Master/goods.aspx');
  await page.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
    + 'window.__말=[];window.VP말=function(t){window.__말.push(t);};' });
  await page.addScriptTag({ content: VP흉내(줄) });
  for (const f of ['johon.js', 'amt-draw.js', 'goods.js'])
    await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') }).catch((e) => 탈.push(f + ' ' + String(e).slice(0, 200)));
  await page.waitForFunction(() => window.__말.some((t) => /^단품목록:/.test(t)), null, { timeout: 15000 }).catch(() => {});
  const 말 = (await page.evaluate(() => window.__말)).filter((t) => /^단품목록:/.test(t));
  await ctx.close();
  console.log(`\n  ◆ ${제목} — 딱지 ${JSON.stringify(말)}${탈.length ? ' · 탈 ' + 탈.join(' / ') : ''}`);
  return { 말, 탈 };
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참, 글) => { if (참) 초록++; else 빨강++; console.log(`    ${참 ? '✓' : '✗'} ${글}`); };
  const 커밋들 = () => 기록.filter((x) => x.셈 === 'POST' && x.길.endsWith(':commit'));

  console.log('\n■ 단품관리 → 납품내역_단품목록 자동 올림');
  /* ㄱ·ㄴ 빈 창고 */
  const 첫줄 = 줄짓기(2500);
  let 잰 = await 한번(b, 첫줄, 'ㄱ 빈 창고 · 2,500개');
  let 커 = 커밋들();
  못(커.length === 1, `:commit 한 번 (${커.length})`);
  못(['단품_1', '단품_2', '단품_3', '_정보'].every((k) => 창고.has(k)) && 창고.size === 4, `문서 ${[...창고.keys()].join(',')}`);
  const 다 = ['단품_1', '단품_2', '단품_3'].flatMap((k) => 풀기(창고.get(k)).줄);
  못(다.length === 2500 && 풀기(창고.get('단품_1')).줄.length === 1000, `줄 ${다.length} (단품_1 ${풀기(창고.get('단품_1')).줄.length})`);
  못(다.every((s) => s.split('\t').length === 3), '줄 꼴 = 코드\\t이름\\t상태 (세 칸)');
  const 첫중지 = 다.findIndex((s) => s.endsWith('\t중지'));
  못(첫중지 > 0 && 다.slice(첫중지).every((s) => s.endsWith('\t중지')), `중지는 뒤로 (첫 중지 ${첫중지})`);
  const 판매 = 다.slice(0, 첫중지).map((s) => s.split('\t')[1]);
  못(판매.every((x, i) => !i || 판매[i - 1].localeCompare(x, 'ko', { numeric: true }) <= 0), '판매중 안은 단품명 가나다');
  const 정보 = 풀기(창고.get('_정보'));
  못(정보.단품수 === 2500 && 정보.문서수 === 3 && /T/.test(정보.올린때) && !!정보.파일, `_정보 ${JSON.stringify(정보)}`);
  const 몸 = 커.map((x) => x.몸).join('');
  못(!/77777|홍길동|010-1234|서울시|가매입처|서랍장/.test(몸), '금액·사람·매입처 칸 안 실림');
  못(!/납품내역_단품연결|\/vp_/.test(기록.map((x) => x.길 + x.몸).join('')), '단품연결·vp_ 자리 안 건드림');
  못(!기록.some((x) => /^vendorpia/.test(x.길) && x.셈 !== 'GET'), '벤더피아로 POST 0');
  못(!잰.탈.length, '화면 탈 0');

  /* ㄷ 같은 목록 */
  잰 = await 한번(b, 첫줄, 'ㄷ 같은 목록으로 다시 열기');
  못(커밋들().length === 0, `쓰기 0 (${커밋들().length})`);
  못(기록.filter((x) => x.셈 === 'GET' && x.길.endsWith('/납품내역_단품목록')).length === 1, '읽기 한 번');

  /* ㄹ 하나 이름 바뀜 + 1,800 개로 줆 → 단품_3 지움 */
  const 둘째 = 줄짓기(1800, { T00001: "가가가 맨앞 단품" });
  잰 = await 한번(b, 둘째, 'ㄹ 이름 하나 바뀜 · 1,800개로 줆');
  커 = 커밋들();
  const w = 커.length ? JSON.parse(커[0].몸).writes : [];
  const 쓴 = w.map((x) => (x.update ? '쓰기 ' + x.update.name : '지움 ' + x.delete).split('/').pop() + (x.delete ? '(지움)' : ''));
  못(커.length === 1, `:commit 한 번 (${커.length}) — ${쓴.join(', ')}`);
  못(!창고.has('단품_3') && 창고.has('단품_2') && 풀기(창고.get('_정보')).단품수 === 1800, `단품_3 지움 · _정보 1800 (${[...창고.keys()].join(',')})`);
  못(풀기(창고.get('단품_1')).줄[0] === 'T00001\t가가가 맨앞 단품\t판매중', `맨 앞 ${JSON.stringify(풀기(창고.get('단품_1')).줄[0])}`);

  /* 단품_1 만 바뀌는 경우 — 끝쪽 중지 하나만 이름이 바뀌면 단품_2 만 */
  const 셋째 = 줄짓기(1800, { T00001: "가가가 맨앞 단품", T01797: "힣힣 끝 중지" });
  잰 = await 한번(b, 셋째, 'ㄹ-2 마지막 문서 안의 이름 하나만 바뀜');
  커 = 커밋들();
  const 이름들 = 커.length ? JSON.parse(커[0].몸).writes.map((x) => (x.update ? x.update.name : x.delete).split('/').pop()) : [];
  못(JSON.stringify(이름들) === '["단품_2","_정보"]', `바뀐 문서만 ${JSON.stringify(이름들)}`);

  /* ㅁ 절반 아래 */
  잰 = await 한번(b, 줄짓기(300), 'ㅁ 300개(절반 아래)');
  못(커밋들().length === 0 && 창고.has('단품_2'), '안 올림 · 창고 그대로');

  await b.close();
  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
