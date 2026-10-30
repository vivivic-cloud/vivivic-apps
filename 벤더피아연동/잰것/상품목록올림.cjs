/* 단품관리 화면의 연결 목록(상품관리) → 납품내역 `납품내역_상품목록` 자동 올림(0.34.80)을 재는 자.
   사장님: 「제품목록 단품검색에서 검색시 목록에 나타나는 단품에 상세보기 버튼을 만들어 해당단품과 벤더피아연동에서 연관된  상품관리와 동일한 상품버튼들이 나타나게 해주세요.」
   보아야 하는 것 —
     ㄱ) 빈 창고에 `상품_N`(1,000개씩) + `_정보` 를 정한 꼴로 쓰나 — 줄 = "상품코드\t상품명\t판매상태\t단품코드,단품코드,…"
         매출처마다 한 줄인 같은 상품은 하나로 · 「a+a+b」 → 「a,a,b」 · 중지 뒤로 · 상품명 가나다
     ㄴ) 금액·매입처·매출처·사람 칸이 **하나도 안 실리나**
     ㄷ) 같은 목록으로 다시 열면 **쓰기 0** · ㄹ) 바뀐 문서만 · 남는 `상품_N` 지움 · ㅁ) 절반 아래·100개 아래 안 올림
     ㅂ) `납품내역_단품목록` 올림은 전과 같고 `납품내역_단품연결`·`vp_` 는 안 건드림 · 벤더피아로 POST 0 · 연결 목록 받기 말고 새 요청 없음
   ⚠ firestore.googleapis.com 은 **전부 가로챈다**(진짜 창고에 가짜가 들어가지 않게). 자료는 전부 가짜. 맥: VP_EXE 에 크로미움 경로. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');

const 단품머리 = ["단품코드","단품명","매입처명","단품분류","재고유형","발주유형","판매상태"];
const 단품줄 = Array.from({ length: 300 }, (_, i) => ["T" + String(i).padStart(5, "0"), "단품 " + i, "가매입처", "서랍장", "재고", "발주", "판매중"]);
const 상품머리 = ["상품코드","상품명","매출처명","매출처코드","매입처명","배송사명","판매상태","옵션상품유무","단품코드","단품명","판매가","원가","고객명","전화","주소"];
/* n 개 상품 — 넷 중 하나는 중지, 상품마다 매출처 두 줄(같은 상품코드), 구성 「a+a+b」 */
const 상품줄짓기 = (n, 바꿈 = {}) => Array.from({ length: n }, (_, i) => {
  const c = "S" + String(i).padStart(5, "0");
  const a = "T" + String(i % 300).padStart(5, "0"), b = "t" + String((i + 1) % 300).padStart(5, "0");
  const 줄 = (매출처) => [c, 바꿈[c] || ("상품 " + (i % 991) + "호 " + c), 매출처, "MCQX9", "가매입처", "가배송사",
    i % 4 === 0 ? "중지" : "판매중", "N", a + "+" + a + "+" + b, "단품a+단품a+단품b", "88888", "66666", "홍길동", "010-1234-5678", "서울시 ○○구"];
  return [줄("협찬몰"), 줄("가매출처")];
}).flat();

const 쪽 = `<html><head><meta charset="utf-8"><title>단품관리</title></head><body id="body">
<form name="aspnetForm" method="post" action="/System/Master/goods.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x"><select name="ddlStatus" id="ddlStatus"><option value="전체" selected>전체</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
const VP흉내 = (줄) => `
window.__부름 = [];
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    window.__부름.push(String(url) + " " + status + " " + (dates && dates.from));
    if (String(url).indexOf("/System/Master/goods.aspx") >= 0) {
      cb(${JSON.stringify(단품머리)}, ${JSON.stringify(단품줄)}, 300, 300);
    } else if (String(url).indexOf("/System/Master/salesGoods.aspx") >= 0) {
      var 줄 = ${JSON.stringify(줄)};
      for (var i = 0; i < 줄.length; i += 700) cb(${JSON.stringify(상품머리)}, 줄.slice(i, i + 700), Math.min(i + 700, 줄.length), 줄.length);
    } else cb(["단품코드","단품명"], [], 0, 0);
    return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){ return {}; }, set: async function(){}, remove: async function(){} };`;

const 창고 = new Map();          // 납품내역_상품목록
const 단품창고 = new Map();      // 납품내역_단품목록
const 이름뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents/artifacts/vivivic-4b7ef/public/data/';
let 기록 = [];
const 풀기 = (f) => {
  const o = {};
  for (const [k, v] of Object.entries(f || {}))
    o[k] = 'arrayValue' in v ? (v.arrayValue.values || []).map((x) => x.stringValue)
      : 'integerValue' in v ? Number(v.integerValue) : v.stringValue;
  return o;
};
const 자리들 = { '납품내역_상품목록': 창고, '납품내역_단품목록': 단품창고 };

async function 한번(b, 줄, 제목) {
  기록 = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => r.abort('blockedbyclient'));
  await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200,
    contentType: 'application/json', body: JSON.stringify({ idToken: 'fake' }) }));
  await ctx.route('**://firestore.googleapis.com/**', (r) => {
    const q = r.request(), u = decodeURIComponent(new URL(q.url()).pathname), 몸 = q.postData() || '';
    기록.push({ 셈: q.method(), 길: u, 몸 });
    for (const [칸, 곳] of Object.entries(자리들)) if (q.method() === 'GET' && u.endsWith('/' + 칸)) {
      const documents = [...곳].map(([name, fields]) => ({ name: 이름뿌리 + 칸 + '/' + name, fields }));
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(documents.length ? { documents } : {}) });
    }
    if (q.method() === 'POST' && u.endsWith(':commit')) {
      for (const w of JSON.parse(몸).writes) {
        const n = (w.update ? w.update.name : w.delete);
        for (const [칸, 곳] of Object.entries(자리들)) {
          if (!n.startsWith(이름뿌리 + 칸 + '/')) continue;
          const 이름 = n.slice((이름뿌리 + 칸 + '/').length);
          if (w.update) 곳.set(이름, w.update.fields); else 곳.delete(이름);
        }
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
  await page.waitForFunction(() => window.__말.some((t) => /^상품목록:/.test(t)) && window.__말.some((t) => /^단품목록:/.test(t)), null, { timeout: 20000 }).catch(() => {});
  const 말 = (await page.evaluate(() => window.__말)).filter((t) => /^(상품|단품)목록:/.test(t));
  const 부름 = await page.evaluate(() => window.__부름);
  await ctx.close();
  console.log(`\n  ◆ ${제목} — 딱지 ${JSON.stringify(말)}${탈.length ? ' · 탈 ' + 탈.join(' / ') : ''}`);
  return { 말, 탈, 부름 };
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참, 글) => { if (참) 초록++; else 빨강++; console.log(`    ${참 ? '✓' : '✗'} ${글}`); };
  const 상품커밋 = () => 기록.filter((x) => x.셈 === 'POST' && x.길.endsWith(':commit') && /납품내역_상품목록/.test(x.몸));

  console.log('\n■ 단품관리 연결 목록 → 납품내역_상품목록 자동 올림');
  const 첫줄 = 상품줄짓기(2500);
  let 잰 = await 한번(b, 첫줄, 'ㄱ 빈 창고 · 상품 2,500개(매출처 두 줄씩 5,000줄)');
  let 커 = 상품커밋();
  못(커.length === 1, `상품목록 :commit 한 번 (${커.length})`);
  못(['상품_1', '상품_2', '상품_3', '_정보'].every((k) => 창고.has(k)) && 창고.size === 4, `문서 ${[...창고.keys()].join(',')}`);
  const 다 = ['상품_1', '상품_2', '상품_3'].flatMap((k) => 풀기(창고.get(k)).줄);
  못(다.length === 2500 && 풀기(창고.get('상품_1')).줄.length === 1000, `줄 ${다.length} (매출처 두 줄이 하나로, 상품_1 ${풀기(창고.get('상품_1')).줄.length})`);
  못(다.every((s) => s.split('\t').length === 4), '줄 꼴 = 상품코드\\t상품명\\t판매상태\\t단품코드들 (네 칸)');
  const S5 = 다.find((s) => s.startsWith('S00005\t'));
  못(S5 === 'S00005\t상품 5호 S00005\t판매중\tT00005,T00005,t00006', `구성 a+a+b → a,a,b · 코드 글 그대로 ${JSON.stringify(S5)}`);
  const 첫중지 = 다.findIndex((s) => s.split('\t')[2] === '중지');
  못(첫중지 > 0 && 다.slice(첫중지).every((s) => s.split('\t')[2] === '중지'), `중지는 뒤로 (첫 중지 ${첫중지})`);
  const 판매 = 다.slice(0, 첫중지).map((s) => s.split('\t')[1]);
  못(판매.every((x, i) => !i || 판매[i - 1].localeCompare(x, 'ko', { numeric: true }) <= 0), '판매중 안은 상품명 가나다');
  const 정보 = 풀기(창고.get('_정보'));
  못(정보.상품수 === 2500 && 정보.문서수 === 3 && /T/.test(정보.올린때) && 정보.파일 === '벤더피아연동 상품관리(자동)', `_정보 ${JSON.stringify(정보)}`);
  const 몸 = 커.map((x) => x.몸).join('');
  못(!/88888|66666|홍길동|010-1234|서울시|가매입처|협찬몰|가매출처|가배송사|MCQX9|단품a/.test(몸), '금액·매입처·매출처·사람 칸 안 실림');
  못(!/납품내역_단품연결|\/vp_/.test(기록.map((x) => x.길 + x.몸).join('')), '단품연결·vp_ 자리 안 건드림');
  못(단품창고.has('단품_1') && 풀기(단품창고.get('_정보')).단품수 === 300, `단품목록 올림 그대로 (${잰.말.filter((t) => /^단품/.test(t))})`);
  못(!기록.some((x) => /^vendorpia/.test(x.길) && x.셈 !== 'GET'), '벤더피아로 POST 0');
  const 상품부름 = 잰.부름.filter((x) => /salesGoods/.test(x));
  못(상품부름.length === 1 && / 2000-01-01$/.test(상품부름[0]), `상품관리 목록 받기는 원래 있던 연결 목록 한 번뿐 (${JSON.stringify(잰.부름)})`);
  못(!잰.탈.length, '화면 탈 0');

  잰 = await 한번(b, 첫줄, 'ㄷ 같은 목록으로 다시 열기');
  못(상품커밋().length === 0, `쓰기 0 (${상품커밋().length})`);
  못(기록.filter((x) => x.셈 === 'GET' && x.길.endsWith('/납품내역_상품목록')).length === 1, '읽기 한 번');

  const 둘째 = 상품줄짓기(1800, { S00002: "가가가 맨앞 상품" });
  잰 = await 한번(b, 둘째, 'ㄹ 이름 하나 바뀜 · 1,800개로 줆');
  커 = 상품커밋();
  못(커.length === 1 && !창고.has('상품_3') && 풀기(창고.get('_정보')).상품수 === 1800, `상품_3 지움 · _정보 1800 (${[...창고.keys()].join(',')})`);
  못(풀기(창고.get('상품_1')).줄[0] === 'S00002\t가가가 맨앞 상품\t판매중\tT00002,T00002,t00003', `맨 앞 ${JSON.stringify(풀기(창고.get('상품_1')).줄[0])}`);

  const 셋째 = 상품줄짓기(1800, { S00002: "가가가 맨앞 상품", S01796: "힣힣 끝 중지" });
  잰 = await 한번(b, 셋째, 'ㄹ-2 마지막 문서 안의 이름 하나만 바뀜');
  커 = 상품커밋();
  const 이름들 = 커.length ? JSON.parse(커[0].몸).writes.filter((x) => /상품목록/.test(x.update ? x.update.name : x.delete)).map((x) => (x.update ? x.update.name : x.delete).split('/').pop()) : [];
  못(JSON.stringify(이름들) === '["상품_2","_정보"]', `바뀐 문서만 ${JSON.stringify(이름들)}`);

  잰 = await 한번(b, 상품줄짓기(300), 'ㅁ 300개(절반 아래)');
  못(상품커밋().length === 0 && 창고.has('상품_2'), '안 올림 · 창고 그대로');

  창고.clear();
  잰 = await 한번(b, 상품줄짓기(3), 'ㅂ 빈 창고 · 3개');
  못(상품커밋().length === 0 && 창고.size === 0, '안 올림 · 창고 빈 채로');

  await b.close();
  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
