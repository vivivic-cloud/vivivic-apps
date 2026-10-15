/* **원래 화면으로 돌아갔을 때 벤더피아 제 머리칸이 밀리나**를 재는 자 (10-15).
   사장님: 「**이것을 위로 올려주세요 텍스트가 안보여요**」 (장부 a1792059225)
   짚은자 `body.kt-quick-panel--right … > div#divLogo > a > img#imglogo` — **벤더피아 제 로고**다.
   까닭으로 의심한 것: ⑥ 전환 단추가 `html` 에 만든 **26px 빈 띠**가 원래 화면에서도 남아
   벤더피아 제 머리칸을 아래로 밀었다.
   ⚠ 짐작하지 않는다 — 우리 화면 / **원래 화면** 각각 로고 자리와 **밀린 값**을 잰다.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 그 집 머리칸 꼴을 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 그림칸 = path.join(__dirname, '그림');
const PAGES = require('./본보기/PAGES.cjs');

/* 벤더피아 제 머리칸 흉내 — 짚으신 자리 이름을 그대로 쓴다.
   ⚠ 머리칸이 `position: fixed` 다. 그래야 그 집 꼴과 가깝고, 띠가 못 밀어 주는 바로 그 꼴이다. */
/* ⚠ 벤더피아 제 머리칸이 **붙은 것(fixed)**인지 **흐름 속**인지 우리는 모른다. 둘 다 잰다.
     붙은 것은 띠가 못 민다(그래도 그 **아래 글**은 밀린다).
     흐름 속이면 **로고째** 밀린다 — 사장님이 보신 것이 그 꼴일 수 있다. */
const 배송쪽만들기 = (붙었나) => `<html><head><meta charset="utf-8"><title>배송목록조회</title><style>
  body { margin: 0; font: 14px/1.5 sans-serif; }
  #kt_header { position: ${붙었나 ? 'fixed' : 'static'}; top: 0; left: 0; right: 0; height: 55px; background: #1e1e2d;
               color: #fff; display: flex; align-items: center; gap: 16px; padding: 0 20px; z-index: 97; }
  #divLogo { display: flex; align-items: center; gap: 10px; }
  #imglogo { width: 120px; height: 28px; background: #fff; display: block; }
  #머리글 { font-weight: 700; }
  #속 { padding-top: ${붙었나 ? '70px' : '15px'}; }
</style></head><body id="body" class="kt-quick-panel--right kt-demo-panel--right">
<div id="kt_header"><div id="divLogo"><a href="/"><img id="imglogo" src="logo.png" alt="벤더피아"></a>
  <span id="머리글">벤더피아 ERP · 배송목록조회</span></div></div>
<div id="속">
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option>
<option value="V2">배송중</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option>
<option value="V2">경동택배(포천)</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option>
<option value="V2">나매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>
</div></body></html>`;
const 머리 = ["CS","CS주문번호","IMG","매출처","주문번호","주문번호","가용수량","상품명","몰","주문자",
  "수취인","휴대전화","주소","배송사","송장번호","배송상태","비고"];
const 줄 = Array.from({length:5},(_,i)=>머리.map((c,j)=> j===4 ? "20261015-"+i : c+"-"+i));
const 표 = `<html><body><span>총 ${줄.length} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const VP흉내 = `var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function(){ return { cachedAt: null }; }, prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

const 잰다 = () => {
  const 뿌리 = document.documentElement;
  const 로고 = document.getElementById('imglogo');
  const 통 = document.getElementById('divLogo');
  const 글 = document.getElementById('머리글');
  const 단추 = document.getElementById('vp-바꾸기');
  const 자리 = (el) => { if (!el) return null; const r = el.getBoundingClientRect();
    return { 위: Math.round(r.top), 밑: Math.round(r.bottom),
             왼: Math.round(r.left), 오른: Math.round(r.right) }; };
  const 겹침 = (A, B) => {
    if (!A || !B) return null;
    const w = Math.max(0, Math.min(A.오른, B.오른) - Math.max(A.왼, B.왼));
    const h = Math.max(0, Math.min(A.밑, B.밑) - Math.max(A.위, B.위));
    return Math.round(w * h);
  };
  const 로고자리 = 자리(로고), 글자리 = 자리(글), 단추자리 = 자리(단추);
  /* **잘린 넓이** — 창 위로 넘어가 안 보이는 넓이 */
  const 잘림 = (A) => {
    if (!A) return null;
    const 넘김 = Math.max(0, -A.위);
    return Math.round(넘김 * Math.max(0, A.오른 - A.왼));
  };
  return {
    우리화면인가: 뿌리.classList.contains('vp-clean'),
    띠있나: 뿌리.classList.contains('vp-위여백'),
    띠값: getComputedStyle(뿌리).paddingTop,
    로고: 로고자리, 머리글: 글자리, 단추: 단추자리,
    로고잘림: 잘림(로고자리), 머리글잘림: 잘림(글자리),
    로고보이나: !!로고자리 && 로고자리.위 >= 0 && 로고자리.밑 <= innerHeight,
    머리글보이나: !!글자리 && 글자리.위 >= 0 && 글자리.밑 <= innerHeight,
    단추가로고를: 겹침(단추자리, 로고자리),
    단추가머리글을: 겹침(단추자리, 글자리),
    단추글: 단추 ? 단추.textContent : null,
    머리칸위: 자리(document.getElementById('kt_header')),
    속위: 자리(document.getElementById('속')),
  };
};

(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ 원래 화면으로 돌아갔을 때 벤더피아 제 머리칸 · 1280×860');
  console.log('  ⚠ 자료는 전부 가짜. 머리칸은 짚으신 이름(`#divLogo`·`#imglogo`)으로 세웠다.');
  if (process.env.VP_LOGIN_JS) console.log('  ⚠ **옛 login.js 로 돌린다** — ' + process.env.VP_LOGIN_JS);
  for (const 붙었나 of [true, false]) {
  const 배송쪽 = 배송쪽만들기(붙었나);
  console.log('\n──── 머리칸이 ' + (붙었나 ? '**붙은 것(fixed)**' : '**흐름 속(static)**') + ' 일 때 ────');
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
  await ctx.route('**://vendorpia.com/**', (r) => {
    const u = new URL(r.request().url());
    if (r.request().method() === 'POST')
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 표 });
    if (u.pathname.endsWith('.js'))
      return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 (흉내) */' });
    if (u.pathname.endsWith('.png') || u.pathname.endsWith('.gif'))
      return r.fulfill({ status:200, contentType:'image/gif',
        body: Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64') });
    return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 배송쪽 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
  await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
  await page.addScriptTag({ content:
    'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};' });
  /* ⚠ **우리 글을 넣기 전** 자리를 먼저 잰다 — 이것이 「안 밀린 참값」 이다.
       손으로 박아 두면 흉내 꼴을 바꿀 때마다 자가 조용히 거짓말을 한다 (10-15 겪었다). */
  const 맨처음 = await page.evaluate(잰다);
  await page.addStyleTag({ content: ['login.css','search.css']
    .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
  await page.addScriptTag({ content: VP흉내 });
  /* ⚠ 고치기 **전** 숫자도 내려고 옛 `login.js` 를 받아 돌릴 수 있게 했다.
       `VP_LOGIN_JS=<자리> node 원래화면머리.cjs` — 안 주면 지금 글로 돈다. */
  const 로그인글 = process.env.VP_LOGIN_JS || path.join(확장, 'login.js');
  await page.addScriptTag({ content: fs.readFileSync(로그인글, 'utf8') });
  await page.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
  await page.waitForTimeout(700);

  const 우리 = await page.evaluate(잰다);
  console.log('\n  ◆ 우리 화면 (vp-clean)');
  console.log('    띠 ' + 우리.띠값 + ' (있나 ' + 우리.띠있나 + ') ' + 못(우리.띠있나 && 우리.띠값 === '26px'));
  console.log('    단추 「' + 우리.단추글 + '」 ' + JSON.stringify(우리.단추));
  if (붙었나) await page.screenshot({ path: path.join(그림칸, '머리칸-우리화면-1280.png') });

  await page.click('#vp-바꾸기'); await page.waitForTimeout(400);
  const 저쪽 = await page.evaluate(잰다);
  console.log('\n  ◆ **벤더피아 원래 화면**');
  console.log('    ★ 띠 **' + 저쪽.띠값 + '** (있나 ' + 저쪽.띠있나 + ') — **걷혔나** '
    + 못(!저쪽.띠있나 && 저쪽.띠값 === '0px'));
  console.log('    ★ 로고 자리 ' + JSON.stringify(저쪽.로고) + ' · 보이나 ' + 저쪽.로고보이나
    + ' · 잘린 넓이 ' + 저쪽.로고잘림 + 'px² ' + 못(저쪽.로고보이나 && 저쪽.로고잘림 === 0));
  console.log('    ★ 머리글 자리 ' + JSON.stringify(저쪽.머리글) + ' · 보이나 ' + 저쪽.머리글보이나
    + ' · 잘린 넓이 ' + 저쪽.머리글잘림 + 'px² ' + 못(저쪽.머리글보이나 && 저쪽.머리글잘림 === 0));
  console.log('    ★ 우리 화면 때와 로고 자리가 **같은가** (' + (우리.로고 ? 우리.로고.위 : '없음')
    + ' → ' + 저쪽.로고.위 + ') — 밀렸으면 다르다');
  /* ★★ 우리 글을 넣기 **전**과 견준다 — 0 이어야 한다 */
  const 민값 = (뒤, 앞) => (뒤 && 앞) ? 뒤.위 - 앞.위 : null;
  console.log('    ★★ **벤더피아 제 것이 밀린 값** (우리 글 넣기 전과 견줌) — 로고 '
    + 민값(저쪽.로고, 맨처음.로고) + 'px · 머리글 ' + 민값(저쪽.머리글, 맨처음.머리글)
    + 'px · 그 아래 글(#속) ' + 민값(저쪽.속위, 맨처음.속위) + 'px '
    + 못(민값(저쪽.로고, 맨처음.로고) === 0 && 민값(저쪽.머리글, 맨처음.머리글) === 0
         && 민값(저쪽.속위, 맨처음.속위) === 0));
  console.log('    단추가 로고를 가린 넓이 ' + 저쪽.단추가로고를 + 'px² · 머리글을 '
    + 저쪽.단추가머리글을 + 'px² ' + 못(저쪽.단추가머리글을 === 0)
    + ' (로고는 반투명 단추가 살짝 겹쳐도 괜찮다 — 바이글 10-15)');
  console.log('    단추 「' + 저쪽.단추글 + '」 ' + JSON.stringify(저쪽.단추)
    + ' · 아직 보이나 ' + 못(!!저쪽.단추 && 저쪽.단추.위 >= 0));
  if (붙었나) await page.screenshot({ path: path.join(그림칸, '머리칸-원래화면-1280.png') });

  /* 앞뒤로 오가도 그대로인가 — 세 번 더 뒤집어 본다 */
  for (let i = 0; i < 3; i++) { await page.click('#vp-바꾸기'); await page.waitForTimeout(250); }
  const 세번뒤 = await page.evaluate(잰다);           // 홀수 번 더 → 우리 화면
  console.log('\n  ◆ 세 번 더 뒤집은 뒤 (우리 화면이어야 한다)');
  console.log('    우리 화면인가 ' + 세번뒤.우리화면인가 + ' · 띠 ' + 세번뒤.띠값 + ' '
    + 못(세번뒤.우리화면인가 && 세번뒤.띠값 === '26px'));
  await page.click('#vp-바꾸기'); await page.waitForTimeout(300);
  const 또저쪽 = await page.evaluate(잰다);
  console.log('    다시 원래 화면 — 띠 ' + 또저쪽.띠값 + ' · 로고 잘림 ' + 또저쪽.로고잘림 + 'px² '
    + 못(또저쪽.띠값 === '0px' && 또저쪽.로고잘림 === 0 && 또저쪽.로고.위 === 저쪽.로고.위));
  if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
  await ctx.close();
  }

  console.log('\n  그림: 잰것/그림/머리칸-우리화면-1280.png · 머리칸-원래화면-1280.png');
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
