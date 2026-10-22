/* **전환 단추의 크기·투명도·자리·겹침**을 재는 자.
   사장님 10-15: 「화면전환버튼이 너무크고 위치가 데이터를 가리고 있어요
   반투명으로처리하고 페이지 상단 여백에 배치해 주세요.」
   ★ 보아야 하는 숫자는 **겹친 넓이 0** 이다 — 우리 화면에서도, 벤더피아 제 화면에서도.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 네 쪽을 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');

const 배송머리 = ['주문번호','상품명','수취인','휴대전화','주소','배송사','송장번호','상태'];
const 배송줄 = Array.from({length:12},(_,i)=>['20261015-'+i,'가나다 서랍장 '+i,'가나다','010-0000-0000','경기도 ○○시','○○택배',String(64000+i),'배송완료']);
const 단품머리 = ["단품코드","단품명","매입처명","단품분류","재고유형","발주유형","판매상태","배송수량","양품수","상품코드","상품명","매출처명","매출처코드","창고"];
const 단품줄 = Array.from({length:3},(_,i)=>["ING-"+i,"가나다 단품 "+i,"가매입처","서랍장","재고","발주","판매중",String(10+i),String(5+i),"KLS-"+i,"가나다 세트 "+i,"가매출처","1010","0.본사"]);

const 로그인쪽 = `<html><head><meta charset="utf-8"><title>로그인</title></head><body>
<div id="벤더피아제화면">벤더피아 원래 로그인 화면입니다</div>
<form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"><input type="submit" id="btnLogin" value="로그인"></form>
</body></html>`;
const 배송폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
/* ③ 벤더피아 제 화면이 쪽 맨 위를 **글자로 꽉 채운** 꼴 — 띠가 밀어 주어야 한다 */
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title>
<style>body{margin:0}#벤더피아제화면{margin:0;padding:6px;background:#eee}</style></head><body>
<div id="벤더피아제화면">벤더피아 원래 배송관리 화면입니다 — 이 글이 쪽 맨 위를 가로로 꽉 채웁니다</div>
${배송폼}</body></html>`;
/* ④ 벤더피아가 **position:fixed 로 띄워 둔 머리띠** — 띠가 못 밀어 준다. 단추가 **비켜서야** 한다 */
const 고정쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title><style>body{margin:0}
#붙은머리{position:fixed;top:0;right:0;left:0;height:24px;background:#cfe;z-index:50}</style></head><body>
<div id="붙은머리">벤더피아가 붙여 둔 머리띠</div>
<div id="벤더피아제화면">벤더피아 원래 배송관리 화면입니다</div>
${배송폼}</body></html>`;

const VP흉내 = `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    cb(${JSON.stringify(단품머리)}, ${JSON.stringify(단품줄)}, ${단품줄.length}, ${단품줄.length});
    return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };
var VP_JOHON_PARTS = [];`;

/* 단추 자리에 **무엇이 깔려 있나**를 점으로 샅샅이 센다.
   단추를 잠깐 안 잡히게 해 두고 2px 격자로 찍어, 뿌리·몸이 아닌 것이 잡히면 겹친 것이다.
   겹친 넓이 = 잡힌 점 / 전체 점 × 단추 넓이. **0 이어야 한다.** */
const 잰다 = () => {
  const 단추 = document.getElementById("vp-바꾸기");
  if (!단추) return null;
  const r = 단추.getBoundingClientRect();
  const cs = getComputedStyle(단추);
  단추.style.pointerEvents = "none";
  let 전체 = 0, 걸린 = 0; const 걸린것 = new Set();
  for (let y = r.top + 1; y < r.bottom - 0.5; y += 2) {
    for (let x = r.left + 1; x < r.right - 0.5; x += 2) {
      전체++;
      const el = document.elementFromPoint(x, y);
      if (el && el !== document.documentElement && el !== document.body && !단추.contains(el)) {
        걸린++;
        걸린것.add((el.id ? "#" + el.id : el.tagName.toLowerCase())
          + "「" + (el.textContent || "").trim().slice(0, 14) + "」");
      }
    }
  }
  단추.style.pointerEvents = "";
  const 넓이 = r.width * r.height;
  return {
    가로: Math.round(r.width), 세로: Math.round(r.height),
    글: 단추.textContent, 위에서: Math.round(r.top), 오른쪽에서: Math.round(innerWidth - r.right),
    투명도: cs.opacity, 바탕: cs.backgroundColor, zindex: cs.zIndex,
    위여백: getComputedStyle(document.documentElement).paddingTop,
    겹친넓이: Math.round(넓이 * (전체 ? 걸린 / 전체 : 0)),
    겹친것: [...걸린것].slice(0, 3),
    가로스크롤: document.documentElement.scrollWidth > innerWidth + 1,
    세로넘침: document.documentElement.scrollHeight - innerHeight,
    짚개돌았나: !!window.__vp짚개,
  };
};

const 쪽들 = [
  { 이름:'① 로그인',                길:'/Login.aspx',                      몸:로그인쪽, 글:['login.js'] },
  { 이름:'② 배송관리 (글이 꽉 찬 쪽)', 길:'/System/Delivery/firmDvList.aspx', 몸:배송쪽,   글:['login.js','search.js'], 조회:true },
  { 이름:'③ 배송관리 (붙은 머리띠)',   길:'/System/Delivery/firmDvList.aspx', 몸:고정쪽,   글:['login.js','search.js'] },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ 전환 단추 — 크기 · 반투명 · 쪽 위 여백 · **겹친 넓이** · PC 1280×800');
  let 초록 = 0, 빨강 = 0;
  const 못 = (이름, 참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  for (const 쪽 of 쪽들) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (r.request().method() === 'POST') return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
        body: `<html><body><span>총 ${배송줄.length} 건</span><table><tr>${배송머리.map(h=>`<th>${h}</th>`).join('')}</tr>
          ${배송줄.map(x=>`<tr>${x.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>` });
      if (new URL(r.request().url()).pathname.endsWith('.js'))
        return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 자리 (흉내) */' });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 쪽.몸 });
    });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0, 120)));
    await page.goto('https://vendorpia.com' + 쪽.길);
    await page.addStyleTag({ content: ['login.css','menu.css','search.css','goods.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of 쪽.글) await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await page.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"x"}),getURL:f=>"/"+f};' });
    await page.addScriptTag({ content: fs.readFileSync(path.join(확장, '짚개.js'), 'utf8') }).catch(()=>{});
    await page.waitForTimeout(900);
    if (쪽.조회) { await page.click('.vp-bar button[type=submit]').catch(()=>{}); await page.waitForTimeout(700); }

    const 우리 = await page.evaluate(잰다);
    if (!우리) { console.log('\n  ' + 쪽.이름 + ' — ✗ 단추가 없다'); 빨강++; await ctx.close(); continue; }
    console.log('\n  ' + 쪽.이름);
    console.log('    크기 **' + 우리.가로 + '×' + 우리.세로 + 'px** (옛 것은 세로 44) '
      + 못('세로 24px 아래', 우리.세로 <= 24));
    console.log('    투명도 **' + 우리.투명도 + '** · 바탕 ' + 우리.바탕 + ' '
      + 못('반투명', Number(우리.투명도) < 1));
    console.log('    자리 위에서 **' + 우리.위에서 + 'px** · 오른쪽에서 ' + 우리.오른쪽에서 + 'px · 쪽 위 여백 '
      + 우리.위여백 + ' ' + 못('위쪽 30px 안', 우리.위에서 <= 30));
    console.log('    z-index ' + 우리.zindex + ' ' + 못('지시판(2147483000)보다 아래', Number(우리.zindex) < 2147483000));
    console.log('    ★ 겹친 넓이 — 우리 화면 **' + 우리.겹친넓이 + 'px²** ' + 못('0', 우리.겹친넓이 === 0)
      + (우리.겹친것.length ? ' ' + JSON.stringify(우리.겹친것) : ''));
    console.log('    단추가 **창 안에** 있나 — 위에서 ' + 우리.위에서 + 'px · 오른쪽에서 ' + 우리.오른쪽에서 + 'px ' + 못('창 안', 우리.위에서 >= 0 && 우리.오른쪽에서 >= 0 && 우리.오른쪽에서 < 200));
    console.log('    글 「' + 우리.글 + '」 ' + 못('「벤더피아」', 우리.글 === '벤더피아'));
    console.log('    가로스크롤 ' + 우리.가로스크롤 + ' ' + 못('없다', !우리.가로스크롤));
    if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0, 2))); 빨강++; }
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
