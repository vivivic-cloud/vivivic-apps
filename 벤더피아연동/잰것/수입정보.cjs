/* ② **단품 상세의 「수입정보」 단추**를 재는 자.
   사장님 10-15: 「단품코드와 서류관리프로그램에서 사용되는 코드와 일치시 서류관리 프로그램의
   해당코드에 대한 상세정보가 본 단품버튼의 상세팝업에서 수입정보 버튼을 누르면 나타나게 해줘」
   (장부 a1792025546)
   보아야 하는 것 —
     ㄱ) **코드 꼴이 달라도 맞나** (밑줄 꼴 `▁`·`＿` · 대소문자 · `-`↔`_`)
     ㄴ) **안 맞는 단품엔 단추가 없나** (가짜 단추를 만들지 않는다)
     ㄷ) 누르면 창이 뜨고 줄 수가 맞나 · `+` 로 이어진 단품코드 둘 다 보나
     ㄹ) **사람 칸이 새지 않나** — 보낸 물음에 `cipl` 말고는 없나, 화면에 전화·주소가 없나
     ㅁ) 서류관리 자료를 **못 받아도** 화면이 그대로 도나
   ⚠ 진짜 vendorpia.com·창고는 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');

/* ── 벤더피아 단품관리 줄 ─────────────────────────────── */
const 단품머리 = ["단품코드","단품명","매입처명","단품분류","재고유형","발주유형","판매상태",
  "배송수량","양품수","상품코드","상품명","매출처명","매출처코드","창고","바코드","등록일"];
const 단품들 = [
  /* ① 대소문자 + 밑줄 꼴이 다르다 — 서류관리는 `myT▁3C` 로 적어 두었다 */
  ["MYT_3C","가나다 3단 서랍장","가매입처","서랍장","재고","발주","판매중","5","3","KLS-1","가나다 세트","가매출처","1010","0.본사","B1","2026-01-02"],
  /* ② `-` 와 `_` 가 다르다 — 서류관리는 `BH-LKB` 로 적어 두었다 (바이글이 같게 보라 했다) */
  ["BH_LKB","가나다 문짝","가매입처","문짝","재고","발주","판매중","2","1","KLS-2","가나다 세트","가매출처","1010","0.본사","B2","2026-01-03"],
  /* ③ `+` 로 둘이 이어져 있다 — 둘 다 보여야 한다 */
  ["EF-al55 + bd-whsqa","가나다 다리+손잡이","가매입처","부속","재고","발주","판매중","9","4","KLS-3","가나다 세트","가매출처","1010","0.본사","B3","2026-01-04"],
  /* ④ 서류관리에 **없는** 코드 — 단추가 없어야 한다 */
  ["ZZ_NONE","가나다 없는것","가매입처","기타","재고","발주","판매중","1","0","KLS-4","가나다 세트","가매출처","1010","0.본사","B4","2026-01-05"],
  /* ⑤ **진짜 창고 꼴**(코드·이름·수량만) — 칸 이름 일곱은 그대로 보이고 값만 비어야 한다 */
  ["MIN_BARE","민짜 단품","가매입처","기타","재고","발주","판매중","1","0","KLS-5","가나다 세트","가매출처","1010","0.본사","B5","2026-01-06"],
];
/* ── 서류관리(docs_files)의 cipl 흉내 ───────────────────
   ⚠ 사람 칸(`수취인`·`전화`·`주소`)을 **일부러 문서에 심어 둔다** — 우리가 그것을 받지도,
     보이지도 않는지 재려고. 품목 안에도 하나 심는다. */
/* 창고가 돌려주는 꼴을 손으로 짜지 않고 **값 → Firestore 꼴** 로 싸는 작은 셈을 쓴다
   (깊은 괄호를 손으로 맞추다 한 번 틀렸다 — 10-15). */
const 싸기 = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v)
    ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(싸기) } };
  if (typeof v === 'object') return { mapValue: { fields:
    Object.fromEntries(Object.entries(v).map(([k, x]) => [k, 싸기(x)])) } };
  return { stringValue: String(v) };
};
const 서류문서 = (코드, 이름, 날) => ({ document: { fields: 싸기({
  /* ⚠ 사람 칸과 거래처·경로를 **일부러 심어 둔다** — 받지도 보이지도 않는지 재려고 */
  path: "/제헤우드/2026-01/CI&PL.xlsx", vendor: "제헤우드",
  수취인: "홍길동", 전화: "010-1234-5678", 주소: "서울시 ○○구 ○○로 1",
  cipl: { v: 2, invoiceDate: 날, items: [ {
    code: 코드, name: 이름, qty: 120, price: 12.5, size: "800*400*250",
    perCtn: 2, cbm: 0.08, colors: ["흰색"],
    수취인: "홍길동", 전화: "010-1234-5678",
  } ] },
}).mapValue.fields } });
const 서류들 = [
  서류문서("myT▁3C", "3단 서랍장 몸통", "2026-01-10"),
  서류문서("BH-LKB", "문짝 LKB", "2026-01-11"),
  서류문서("EF-al55", "55형 다리", "2026-01-12"),
  서류문서("bd-whsqa", "흰 손잡이", "2026-01-13"),
  /* 같은 코드가 서류 두 장에 — 두 줄 다 보여야 한다 */
  서류문서("myT＿3C", "3단 서랍장 몸통 (수정본)", "2026-02-01"),
];
/* ── ㄷ 차수 수량 (서류관리 `docs_단품수량`, 10-16) ─────────
   그 집이 적는 칸은 **넷뿐**이다: vendor · code · 차수들 · updatedAt.
   `차수들[] = { batch · 수량 · 어디 · 잔액있음 }` · 「어디」 는 두 글귀뿐이다.
   ⚠ 금액·규격 칸은 **없다**(그 집 `js/firebase.js` 주석에 「두지 마십시오」 라 적혀 있다).
   ⚠ 열쇠가 다른 꼴로도 와 본다 — 서류관리는 밑줄 꼴만 모으고 대소문자를 살린다. */
const 수량문서 = (vendor, code, 차수들) => ({ document: { fields: 싸기({
  vendor, code, 차수들, updatedAt: 1760000000000 }).mapValue.fields } });
const 수량들 = [
  /* ① 벤더피아 단품코드 `MYT_3C` ↔ 서류관리 `myT▁3C` — 밑줄 꼴만 다르고 **대소문자가 다르다**.
       엄한 열쇠로는 안 맞고 **헐거운 열쇠로 하나만** 걸리니 보여야 한다. */
  수량문서("가거래처", "myT▁3C", [
    { batch: "26-22", 수량: 10, 어디: "발주수량(입고전)", 잔액있음: false },
    { batch: "26-17", 수량: 10, 어디: "상차수량", 잔액있음: true },
    { batch: "26-13", 수량: 4,  어디: "상차수량", 잔액있음: true },
  ]),
  /* ② `BH-LKB` — 대소문자·밑줄이 그대로 맞는다(엄한 열쇠로 바로 걸린다) */
  수량문서("가거래처", "BH-LKB", [
    { batch: "26-22", 수량: 7, 어디: "발주수량(입고전)", 잔액있음: false },
  ]),
  /* ③ ⚠ **헐거운 열쇠로는 둘이 걸리는** 짝 — `-` 와 `_` 는 서류관리가 **남이라** 한다.
       이런 때는 **아무것도 안 보여야** 한다(남의 수량을 보이면 안 된다). */
  수량문서("가거래처", "EF-al55", [{ batch: "26-20", 수량: 3, 어디: "상차수량", 잔액있음: true }]),
  수량문서("가거래처", "EF_al55", [{ batch: "26-19", 수량: 9, 어디: "상차수량", 잔액있음: true }]),
];

/* ⚠⚠ **진짜 창고 꼴** — 10-16 에 창고를 재 보니 품목 칸이 `code·name·qty` **셋뿐**이었다
     (품목 줄 310개 전부). 색상·포장규격·입수·CBM·FOB 는 **아직 아무 데도 없다.**
     그래서 그런 줄도 하나 넣어 **칸 이름은 그대로 보이는지**(값만 빈지) 잰다. */
const 민짜문서 = { document: { fields: 싸기({
  cipl: { v: 2, invoiceDate: "2026-03-01", items: [ { code: "MIN_BARE", name: "민짜 품목", qty: 70 } ] },
}).mapValue.fields } };
서류들.push(민짜문서);

const 표 = (머리, 줄) => `<html><body><span>총 ${줄.length} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 빈표 = '<html><body><span>총 0 건</span><table><tr><th>없음</th></tr></table></body></html>';
const 폼 = (액션, 칸들) => `<form name="aspnetForm" method="post" action="${액션}" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중" selected>판매중</option></select>
<select name="ddlSupplier" id="ddlSupplier"><option value="전체">전체</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
${칸들}<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 단품쪽 = `<html><head><meta charset="utf-8"><title>단품관리</title></head><body id="body">
${폼('/System/Master/goods.aspx','')}</body></html>`;

const VP흉내 = (쪽) => `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    if (String(url).indexOf("goods.aspx") >= 0 && String(url).indexOf("salesGoods") < 0) {
      cb(${JSON.stringify(단품머리)}, ${JSON.stringify(단품들)}, ${단품들.length}, ${단품들.length});
    } else if (String(url).indexOf("StockList.aspx") >= 0) {
      /* ★ 재고조회 — 첫 단품만 **양품수**가 있다(연두). 색이 겹치는 자리를 만들려는 것이다(10-16) */
      cb(["단품코드","양품수","창고"], [["MYT_3C","12","0.본사"]], 1, 1);
    } else {
      /* ⚠ 배송현황(많이 나간 순)이 비면 첫 화면 단추가 **전부 숨는다**(hidden) —
           겹친 색을 찍을 수가 없다. 단추.cjs 처럼 같은 줄을 돌려준다. 그러면 다섯이 다 보인다. */
      cb(${JSON.stringify(단품머리)}, ${JSON.stringify(단품들)}, ${단품들.length}, ${단품들.length});
    }
    return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
/* ★ 조혼가구 — 첫 단품만 조혼 단품과 같다(버튼 **밑 붉은 줄**). 역시 겹치는 자리를 만들려는 것이다 */
window.VP저장 = { get: async function(){
    return { vpJohon: { v: 3, parts: [["가거래처","ING 3단 서랍장","MYT_3C"]], cards: {}, jundo: [] } }; },
  set: async function(){}, remove: async function(){} };
/* VP_JOHON_PARTS 는 johon.js 가 밝힌다 — 여기서 또 밝히면 두 번 밝혔다고 터진다 */`;

const 본다 = () => {
  const 판 = document.querySelector('.vp-goods-panel');
  const 창 = document.querySelector('.vp-modal');
  const 단추 = 판 && !판.hidden ? 판.querySelector('.vp-수입 button') : null;
  const 글 = (el) => (el && el.textContent) || '';
  return {
    판떴나: !!판 && !판.hidden, 판제목: 글(판 && 판.querySelector('strong')).trim(),
    수입단추있나: !!단추, 단추글: 단추 ? 단추.textContent : null,
    창떴나: !!창 && !창.hidden, 창제목: 글(창 && 창.querySelector('strong')).trim(),
    창줄수: 창 && !창.hidden ? 창.querySelectorAll('.vp-modal-body dl').length : 0,
    창글: 창 && !창.hidden ? 글(창.querySelector('.vp-modal-body')) : '',
    가기단추: 창 && !창.hidden ? 글(창.querySelector('.vp-goto')).trim() : null,
    /* 10-16 — 칸 이름이 **차례 그대로** 한 번씩만 나오나 (되풀이 0)
       ⚠ **맨 앞 묶음(접히지 않은 자리)만** 센다. 접은 자리(「전체속성 보기」 안)에 있는 이름을
         같이 세면, 빈 칸을 숨겨 두고도 차례가 맞는 것처럼 보인다 — 재서 잡았다(10-16). */
    칸이름: 창 && !창.hidden
      ? [...(창.querySelector('.vp-modal-body dl')?.querySelectorAll('dt') || [])]
          .map((x) => x.textContent) : [],
    접힌칸: 창 && !창.hidden
      ? [...창.querySelectorAll('.vp-modal-body dl')].slice(1)
          .reduce((n, dl) => n + dl.querySelectorAll('dt').length, 0) : 0,
    금액단추: 창 && !창.hidden
      ? 글([...창.querySelectorAll('.vp-modal-body .vp-toggle')]
          .find((b) => /금액속성/.test(b.textContent))) : '',
    알림글: 글(document.querySelector('.vp-notice-card p')),
    /* ㄷ 차수 박스 (10-16) */
    내역단추: 창 && !창.hidden
      ? 글([...창.querySelectorAll('.vp-차수통 .vp-toggle')][0]) : '',
    차수들: 창 && !창.hidden
      ? [...창.querySelectorAll('.vp-차수통 .vp-차수')].map((x) => ({
          글: (x.querySelector('strong') || {}).textContent || '',
          밑: (x.querySelector('small') || {}).textContent || '',
          높이: Math.round(x.getBoundingClientRect().height) })) : [],
    차수보이나: !!(창 && !창.hidden && 창.querySelector('.vp-차수통 .vp-차수들')
                  && !창.querySelector('.vp-차수통 .vp-차수들').hidden),
  };
};

/* ⚠⚠ ⑧ **다리 길** (10-15) — 벤더피아 쪽 CSP 가 창고로 나가는 것을 막아도
     확장 다리(`window.VP밖에`)로는 받아야 한다. 그 판을 따로 잰다.
     `저장다리.js`·`불러오기.js` 가 하는 일을 **같은 꼴로** 흉내 낸다 —
     page 쪽 `window.VP밖에` 가 postMessage 로 묻고, 「확장 쪽」 이 받아 돌려준다. */
const 다리흉내 = `
(() => {
  let 표 = 0; const 기다림 = new Map();
  addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "밖에답") return;
    const p = 기다림.get(e.data.표); if (p) { 기다림.delete(e.data.표); p(e.data.답); }
  });
  window.VP밖에 = (주소, 옵션) => new Promise((풀) => {
    const 내표 = ++표; 기다림.set(내표, 풀);
    window.postMessage({ __vp: "밖에", 표: 내표, 주소, 옵션: 옵션 || null }, location.origin);
    setTimeout(() => { if (기다림.delete(내표)) 풀(null); }, 20000);
  });
})();`;
/* 「확장 쪽」 — 이 상자에서는 page 안에서 하지만, 받아오기는 **playwright 가 가로채** 돌려준다.
   ⚠ 바로받기(page 의 fetch)는 **막은 척**한다. 그래야 다리로만 되는지 갈린다. */
const 확장쪽흉내 = `
(() => {
  const 허락한집 = ["https://firestore.googleapis.com", "https://identitytoolkit.googleapis.com"];
  const 진짜받기 = window.fetch.bind(window);
  addEventListener("message", async (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "밖에") return;
    const 보내기 = (답) => window.postMessage({ __vp: "밖에답", 표: e.data.표, 답 }, location.origin);
    let 집 = ""; try { 집 = new URL(e.data.주소).origin; } catch (err) {}
    if (!허락한집.includes(집)) return 보내기({ 다리: true, ok: false, status: 0, 글: "", 탈: "안 허락한 집" });
    const 옛 = e.data.옵션 || {};
    try {
      const r = await 진짜받기(e.data.주소, { method: 옛.method || "GET", headers: 옛.headers,
        body: 옛.body, credentials: "omit", __다리: 1 });
      보내기({ 다리: true, ok: r.ok, status: r.status, 글: await r.text() });
    } catch (err) { 보내기({ 다리: true, ok: false, status: 0, 글: "", 탈: String(err && err.message || err) }); }
  });
  /* 화면 글이 **제가 바로** 받으려 하면 CSP 처럼 막는다 */
  window.fetch = (주소, 옵션) => {
    const u = String(주소 && 주소.url ? 주소.url : 주소);
    if (!(옵션 && 옵션.__다리) && /googleapis\.com/.test(u))
      return Promise.reject(new TypeError("Refused to connect (CSP 흉내)"));
    return 진짜받기(주소, 옵션);
  };
})();`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ ② 단품 상세의 「수입정보」 단추');
  console.log('  ⚠ 자료는 전부 가짜. 서류 문서에 **사람 칸을 일부러 심어** 새는지 본다.');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  for (const 판 of ['바로', '다리만', '못받음']) {
    const 자료줌 = 판 !== '못받음';
    const 보낸물음 = [];
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json',
                  body: JSON.stringify({ idToken: 'ascii-fake-token' }) }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      const 물음 = r.request().postData() || '';
      보낸물음.push(물음);
      if (!자료줌) return r.fulfill({ status: 403, contentType: 'application/json',
        body: JSON.stringify({ error: { code: 403, status: 'PERMISSION_DENIED' } }) });
      /* 차수 수량은 **딴 칸**이다 — 물음을 보고 가른다 */
      if (/docs_\\uB2E8\\uD488\\uC218\\uB7C9|docs_단품수량/.test(물음))
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(수량들) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(서류들) });
    });
    await ctx.route('**://vendorpia.com/**', (r) => {
      const 길 = new URL(r.request().url()).pathname;
      if (r.request().method() === 'POST') return r.fulfill({ status:200,
        contentType:'text/html; charset=utf-8', body: 빈표 });
      if (길.endsWith('.js')) return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 (흉내) */' });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 단품쪽 });
    });
    ctx.setDefaultTimeout(5000);                 // 오래 기다리지 않는다
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,160)));
    await page.goto('https://vendorpia.com/System/Master/goods.aspx');
    await page.addStyleTag({ content: ['login.css','goods.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    if (판 === '다리만') {
      await page.addScriptTag({ content: 다리흉내 });
      await page.addScriptTag({ content: 확장쪽흉내 });
    }
    /* 딱지와 `login.js` 를 세운다 — 까닭(`VP말`)이 딱지에 적혀야 어느 길로 됐는지 읽힌다.
       실제로도 `login.js` 는 모든 화면에 함께 간다. */
    await page.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + '(function(){var d=document.createElement("div");d.id="vp-판";'
      + 'd.textContent="벤더피아 보기 잰것 · 확장";'
      + 'd.style.cssText="position:fixed;left:6px;bottom:6px";document.body.appendChild(d);})();' });
    await page.addScriptTag({ content: fs.readFileSync(path.join(확장, 'login.js'), 'utf8') });
    await page.addScriptTag({ content: VP흉내() });
    for (const f of ['johon.js','amt-draw.js','goods.js'])
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') }).catch(()=>{});
    await page.waitForTimeout(1800);               // 서류관리 자료를 받을 틈

    console.log('\n  ◆ ' + (판 === '바로' ? '① 제가 바로 받을 때'
      : 판 === '다리만' ? '② **바로받기가 막히고(CSP 흉내) 다리로만** 될 때'
      : '③ 아예 **못 받을 때**(403)'));
    const 쓴것 = 보낸물음.filter((x) => /"writes"|:commit|setDoc/.test(x));
    console.log('    창고에 **쓴 적 있나** ' + (쓴것.length > 0) + ' ' + 못(쓴것.length === 0)
      + ' (읽기만 해야 한다)');
    /* ⚠ 이제 물음이 **둘**이다 — 서류(`docs_files`)와 차수 수량(`docs_단품수량`).
         하나만 보고 넘어가면 다른 하나가 무엇을 받아 가는지 안 본 것이 된다. */
    const 칸뽑기 = (x) => JSON.stringify((x.match(/"fieldPath":"([^"]+)"/g) || []));
    const 물음 = 보낸물음.find((x) => /"collectionId":"docs_files"/.test(x)) || '';
    console.log('    서류 물음의 받을 칸 : ' + 칸뽑기(물음) + ' '
      + 못(/"fieldPath":"cipl"/.test(물음) && !/수취인|전화|주소|"path"|vendor/.test(물음)));
    const 수량물음 = 보낸물음.find((x) => /docs_단품수량/.test(x)) || '';
    console.log('    차수 물음의 받을 칸 : ' + 칸뽑기(수량물음) + ' '
      + 못(/"fieldPath":"code"/.test(수량물음) && /"fieldPath":"차수들"/.test(수량물음)
           && !/수취인|전화|주소|"path"|"vendor"/.test(수량물음)));

    /* ★★ 10-16 사장님: 「**서류관리에서 코드가 연결된 단품버튼은 주황색 버튼** 버튼하단에
         붉은색 테두리 표현 해주세요」(장부 a1792135920)
       ⚠ 연두(재고)·붉은 줄(조혼가구)이 **하나도 사라지면 안 된다** — 셋을 같이 센다. */
    if (자료줌) {
      const 칠 = await page.evaluate(() => [...document.querySelectorAll('.vp-goods-list button')]
        .map((b) => {
          const s = getComputedStyle(b);
          return { 글: (b.firstChild && b.firstChild.textContent) || '',
            주황: b.classList.contains('vp-서류'),
            연두: b.classList.contains('vp-instock'),
            조혼: b.classList.contains('vp-johon'),
            파란점: (() => { const i = b.querySelector('.vp-점 i.b'); return i ? getComputedStyle(i).display + '|' + getComputedStyle(i).backgroundColor : null; })(),
            바탕: s.backgroundColor, 바탕그림: s.backgroundImage,
            밑줄: s.boxShadow };
        }));
      const 주황수 = 칠.filter((x) => x.주황).length;
      const 연두수 = 칠.filter((x) => x.연두).length;
      const 줄수 = 칠.filter((x) => /rgb\(224, 62, 62\)/.test(x.밑줄)).length;
      console.log('\n  ★ 단추 칠 — 주황 **' + 주황수 + '개** · 연두 ' + 연두수 + '개 · 밑 붉은 줄 '
        + 줄수 + '개');
      for (const x of 칠) console.log('      「' + x.글 + '」 주황 ' + x.주황 + ' 연두 ' + x.연두
        + ' 조혼 ' + x.조혼 + ' · 바탕 ' + x.바탕
        + (x.바탕그림 !== 'none' ? ' · 바탕그림 ' + x.바탕그림.replace(/\s+/g, ' ').slice(0, 70) : ''));
      /* `MYT_3C`(헐거운 열쇠 하나) · `BH_LKB`(헐거운 열쇠 하나) · `EF-al55 + …`(엄한 열쇠) 셋 */
      console.log('    ★ 주황이 **셋**인가(서류관리에 있는 코드만) ' + 못(주황수 === 3));
      console.log('    ★ 서류관리에 **없는** 코드는 안 주황인가 '
        + 못(칠.filter((x) => /없는것|민짜/.test(x.글)).every((x) => !x.주황)));
      /* ⚠ 10-22: 서류관리 주황 칠·붉은 줄은 **화면에서 뺐다**(주황은 이제 카탈로그 점). 판단(클래스)은 위에서 셌다.
           여기서는 단품 이름이 **글자 꼴**(바탕 없음·밑줄 그림자 없음)인지, 서류 때문에 칠이 남지 않았는지 잰다. */
      console.log('    ★ 서류 주황 칠·붉은 줄이 안 남았나(바탕 없음·그림자 없음) '
        + 못(칠.every((x) => x.바탕 === 'rgba(0, 0, 0, 0)' && x.바탕그림 === 'none' && x.밑줄 === 'none')));
      /* ★ 10-22 파란 점 = 서류관리 연결: 서류연결(vp-서류)인 단품에만 켜지고(#1c7ed6), 아니면 꺼져 있다 */
      console.log('    ★ 파란 점이 서류연결 단품에만 뜨나(' + 주황수 + '개) '
        + 못(칠.every((x) => x.주황 ? x.파란점 === 'block|rgb(8, 103, 136)' : (x.파란점 || '').startsWith('none'))));
      const 둘다 = 칠.filter((x) => x.주황 && x.연두);
      const 셋다 = 칠.filter((x) => x.주황 && x.연두 && x.조혼);
      console.log('    ★ 판단은 그대로 — 주황+연두 ' + 둘다.length + '개 · 셋 겹침 ' + 셋다.length + '개 ' + 못(둘다.length > 0 && 셋다.length > 0));
      /* ★ 그림 — **색이 겹친 줄이 보이게** (바이글 10-16)
         ⚠ 첫 화면은 「많이 나간 순」 이라 단추가 숨어 있다. **「전체보기」 를 눌러** 보이게 한 뒤 찍는다 —
           안 누르고 찍으면 빈 화면을 찍어 놓고 「겹친 모습」 이라 할 뻔했다(재서 잡았다). */
      if (판 === '바로') {
        /* ⚠ 「전체보기」 가 **둘**이다 — 앞엣것은 보기 탭, 뒤엣것이 목록을 다 펴는 단추다.
             앞엣것을 누르면 아무것도 안 펴진다(재서 잡았다). **뒤엣것**을 누른다. */
        /* ⚠ 이 흉내의 첫 화면은 「최근 3개월 많이 나간 순」 자리라 단추가 전부 숨어 있다
             (`.vp-more-all` 도 검색어도 안 먹었다 — 재서 확인. 진짜 화면에서는 보인다).
             그래서 **그 단추들을 그대로 베껴** 한 줄에 놓고 찍는다. 꼴(class)이 같으니
             칠도 같다 — 지어낸 단추가 아니라 **방금 잰 그 단추**다. */
        const 보이나 = await page.evaluate(() => {
          const 통 = document.createElement('div');
          통.id = 'vp-색견본';
          통.className = 'vp-goods-list';
          통.style.cssText = 'padding:12px;gap:8px';
          for (const b of document.querySelectorAll('.vp-goods-list button')) {
            const c = b.cloneNode(true);
            c.hidden = false;
            통.appendChild(c);
          }
          const 뿌리 = document.getElementById('vp-root');
          뿌리.insertBefore(통, 뿌리.firstChild);
          return [...통.querySelectorAll('button')]
            .filter((b) => b.getBoundingClientRect().height > 2).length;
        });
        console.log('    ★ 그림 찍기 앞 — 베껴 놓은 단추 ' + 보이나 + '개 ' + 못(보이나 === 5));
        fs.mkdirSync(path.join(__dirname, '그림'), { recursive: true });
        for (const w of [1280, 375]) {
          await page.setViewportSize({ width: w, height: 900 });
          await page.waitForTimeout(250);
          await page.screenshot({ path: path.join(__dirname, '그림', '주황단추-' + w + '.png') });
        }
        await page.setViewportSize({ width: 1280, height: 900 });
        /* ⚠ 베낀 것을 **반드시 치운다.** 안 치우면 아래에서 누르는 단추가 베낀 쪽이라
             아무 일도 안 일어난다(재서 잡았다 — 넷이 한꺼번에 빨개졌다). */
        await page.evaluate(() => document.getElementById('vp-색견본')?.remove());
        await page.waitForTimeout(200);
        const 남았나 = await page.evaluate(() => !!document.getElementById('vp-색견본'));
        console.log('    베낀 것을 치웠나 ' + 못(!남았나));
      }
    }

    for (const [i, 단품] of 단품들.entries()) {
      /* ⚠ 첫 화면은 「많이 나간 순 50개」 라 단추가 숨어 있을 수 있다(`apply` 의 stage).
           보이는지는 `단추.cjs` 가 따로 잰다. 여기서는 **누른 뒤**를 재려는 것이니
           화면 안에서 바로 누른다. */
      await page.evaluate((k) => {
        const b = document.querySelectorAll('.vp-goods-list button')[k];
        if (b) b.click();
      }, i);
      await page.waitForTimeout(250);
      const 것 = await page.evaluate(본다);
      const 맞아야 = 자료줌 && i !== 3;      // ④ 만 서류관리에 없다 (⑤ 민짜는 있다)
      console.log('    [' + (i+1) + '] 「' + 단품[1] + '」 코드 ' + 단품[0]
        + ' → 판 ' + 것.판떴나 + ' · 수입정보 단추 **' + 것.수입단추있나 + '**'
        + (것.단추글 ? ' 「' + 것.단추글 + '」' : '') + ' ' + 못(것.수입단추있나 === 맞아야));
      if (!것.수입단추있나) continue;
      await page.evaluate(() => document.querySelector('.vp-수입 button').click());
      await page.waitForTimeout(250);
      const 창 = await page.evaluate(본다);
      const 민짜인가 = 단품[0] === 'MIN_BARE';
      /* ⚠ 10-16 부터 **공통정보 한 벌**이다 — 서류가 두 장이어도 묶음(dl)은 하나다
           (사장님: 「공통정보로 한번만 표기」). 그 전에는 서류 수만큼 그렸다. */
      console.log('        창 「' + 창.창제목 + '」 · 묶음 **' + 창.창줄수 + '개** (바라는 것 1) '
        + 못(창.창떴나 && 창.창줄수 === 1));
      const 바란차례 = ['단품코드','상품명','색상','포장규격','입수','CBM'];
      console.log('        ★ 칸 차례 ' + JSON.stringify(창.칸이름) + ' '
        + 못(JSON.stringify(창.칸이름) === JSON.stringify(바란차례))
        + ' (FOB 는 가려져 이름도 안 나온다)');
      console.log('        ★ 되풀이 0 인가 — 칸 ' + 창.칸이름.length + '개 중 다른 이름 '
        + new Set(창.칸이름).size + '개 ' + 못(창.칸이름.length === new Set(창.칸이름).size));
      console.log('        ★ **접어 둔 칸이 없나** ' + 창.접힌칸 + '개 ' + 못(창.접힌칸 === 0)
        + ' (값이 비어도 이름은 그대로 보여야 한다 — 창고에 아직 없는 칸이다)');
      console.log('        ★ 수량·서류 날짜가 **지워졌나** — 수량 '
        + /120/.test(창.창글) + ' · 날짜 ' + /2026-0[12]-\d\d/.test(창.창글) + ' '
        + 못(!/120/.test(창.창글) && !/2026-0[123]-\d\d/.test(창.창글) && !/\b70\b/.test(창.창글)));
      console.log('        ★ 사람 칸이 샜나 — 전화 ' + /010-1234-5678/.test(창.창글)
        + ' · 이름 ' + /홍길동/.test(창.창글) + ' · 주소 ' + /○○로 1/.test(창.창글)
        + ' · 거래처 ' + /제헤우드/.test(창.창글) + ' '
        + 못(!/010-1234-5678|홍길동|○○로 1|제헤우드/.test(창.창글)));
      console.log('        규격·입수·CBM 보이나 '
        + 못(민짜인가 || (/800\*400\*250/.test(창.창글) && /0\.08/.test(창.창글))));
      /* ★★ 10-16 사장님: 「FOB는 가격정보로서 … 값을 볼 수 있는 사용자를 제한 해 주어야 합니다」
           ⚠ **값이 글 속에 남으면 안 된다** — 숨긴 자리에 적어 두고 접기만 해서는 안 된다. */
      console.log('        ★ FOB 값(12.5)이 글 속에 **안 남나** ' + !/12\.5/.test(창.창글) + ' '
        + 못(!/12\.5/.test(창.창글)) + ' · 금액 단추 「' + 창.금액단추 + '」 '
        + 못(/금액속성 보기 \(1\)/.test(창.금액단추)));
      await page.evaluate(() => [...document.querySelectorAll('.vp-modal-body .vp-toggle')]
        .find((b) => /금액속성/.test(b.textContent))?.click());
      await page.waitForTimeout(200);
      const 알림 = await page.evaluate(본다);
      console.log('        ★ 눌렀을 때 뜨는 알림 「' + 알림.알림글 + '」 '
        + 못(알림.알림글 === '금액 속성은 승인된 아이디만 볼 수 있습니다.')
        + ' · 그래도 값은 안 보이나 ' + 못(!/12\.5/.test(알림.창글)));
      await page.evaluate(() => document.querySelector('.vp-notice-card button')?.click());
      await page.waitForTimeout(150);

      /* ★★ ㄷ **수입내역보기 → 차수 박스** (10-16 장부 a1792135808) */
      console.log('        ★ 「수입내역보기」 단추 「' + 창.내역단추 + '」 '
        + 못(창.내역단추 === '수입내역보기') + ' · 누르기 전 박스 ' + 창.차수들.length + '개 '
        + 못(창.차수들.length === 0 && !창.차수보이나));
      await page.evaluate(() => [...document.querySelectorAll('.vp-차수통 .vp-toggle')][0]?.click());
      await page.waitForTimeout(700);
      const 차수 = await page.evaluate(본다);
      const 바란차수 = {
        'MYT_3C': [['26-22','발주수량(입고전) 10'], ['26-17','상차수량 10'], ['26-13','상차수량 4']],
        'BH_LKB': [['26-22','발주수량(입고전) 7']],
        'EF-al55 + bd-whsqa': [['26-20','상차수량 3']],   // 엄한 열쇠가 먼저다 — `EF_al55`(26-19)는 남
        'MIN_BARE': [['아직 없음','']],
      }[단품[0]];
      const 본차수 = 차수.차수들.map((x) => [x.글, x.밑]);
      console.log('        ★ 차수 박스 **' + 본차수.length + '개** ' + JSON.stringify(본차수) + ' '
        + 못(JSON.stringify(본차수) === JSON.stringify(바란차수)));
      console.log('        ★ 글귀가 **두 가지 그대로인가** '
        + 못(본차수.every(([, m]) => !m || /^(발주수량\(입고전\)|상차수량) \d+$/.test(m))));
      /* ⚠ 높이는 **서류관리 차수 카드(103px)의 절반 = 52px.** 그 103 은 그 집 css·꼴을 그대로
           그려서 쟀다(`vivivic-docs` ce1f071 · `js/app.js:452`). */
      console.log('        ★ 박스 높이 ' + JSON.stringify([...new Set(차수.차수들.map((x) => x.높이))])
        + 'px (서류관리 103px 의 절반 52) '
        + 못(차수.차수들.length > 0 && 차수.차수들.every((x) => x.높이 === 52)));
      if (단품[0] === 'MYT_3C') {
        for (const w of [1280, 375]) {
          await page.setViewportSize({ width: w, height: 900 });
          await page.waitForTimeout(250);
          await page.screenshot({ path: path.join(__dirname, '그림', '차수박스-' + w + '.png') });
        }
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.waitForTimeout(200);
      }
      await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    }
    /* ★ 그림 — 사장님 폭(375)과 넓은 폭(1280) 둘 다, **공통정보 한 벌**이 보이게 */
    if (판 === '바로') {
      const 그림칸 = path.join(__dirname, '그림');
      fs.mkdirSync(그림칸, { recursive: true });
      for (const w of [1280, 375]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.waitForTimeout(250);
        await page.evaluate(() => document.querySelectorAll('.vp-goods-list button')[0]?.click());
        await page.waitForTimeout(250);
        await page.evaluate(() => document.querySelector('.vp-수입 button')?.click());
        await page.waitForTimeout(300);
        const 찍기 = await page.evaluate(본다);
        console.log('    ' + w + ' — 창 ' + 찍기.창떴나 + ' · 묶음 ' + 찍기.창줄수 + '개 · 칸 '
          + 찍기.칸이름.length + '개 ' + 못(찍기.창떴나 && 찍기.창줄수 === 1 && 찍기.칸이름.length === 6));
        await page.screenshot({ path: path.join(그림칸, '수입공통-' + w + '.png') });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
      }
      await page.setViewportSize({ width: 1280, height: 900 });
    }
    if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
    /* 자료를 못 받아도 목록·상세는 그대로 돌아야 한다 */
    if (판 === '다리만') {
      const 길 = await page.evaluate(() =>
        (document.getElementById('vp-판')?.textContent || ''));
      const 토막 = 길.split('‖').map(x=>x.trim()).filter(x=>/수입정보/.test(x));
      console.log('    ★ 어느 길로 받았나 — ' + JSON.stringify(토막) + ' '
        + 못(토막.some(x => /다리/.test(x) && !/못받음/.test(x))));
    }
    if (!자료줌) {
      const 것 = await page.evaluate(() => ({
        단추수: document.querySelectorAll('.vp-goods-list button').length,
        판떴나: !document.querySelector('.vp-goods-panel').hidden }));
      console.log('    목록 단추 ' + 것.단추수 + '개 · 상세도 뜬다 ' + 것.판떴나 + ' '
        + 못(것.단추수 === 단품들.length && 것.판떴나));
    }
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
