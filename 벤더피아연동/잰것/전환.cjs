/* **진짜 벤더피아 화면으로 가는 전환 단추**를 재는 자.
   사장님 10-15: 「모든 페이지에 실제 벤더피아의 화면으로돌아오는 화면전환 버튼이 필요하다
   이 화면 전환버튼 누를시 … 딱 이 화면전환 버튼만 남겨둔채 벤더피아의 실제 모습이 모두 보여져야해」
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 네 쪽을 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-vivivic-apps/459edaf4-304e-56e1-9eb8-ad6dc33034a4/scratchpad/PAGES.json','utf8'));

const 로그인쪽 = `<html><head><meta charset="utf-8"><title>로그인</title></head><body>
<div id="벤더피아제화면">벤더피아 원래 로그인 화면입니다</div>
<form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"><input type="submit" id="btnLogin" value="로그인"></form>
</body></html>`;
const 메인쪽 = `<html><head><meta charset="utf-8"><title>벤더피아</title></head><body>
<div id="벤더피아제화면">벤더피아 원래 메인 화면입니다</div>
<a href="/System/Delivery/firmDvList.aspx">배송관리</a><a href="/System/Master/goods.aspx">단품관리</a>
</body></html>`;
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body>
<div id="벤더피아제화면">벤더피아 원래 배송관리 화면입니다</div>
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 단품쪽 = `<html><head><meta charset="utf-8"><title>단품관리</title></head><body>
<div id="벤더피아제화면">벤더피아 원래 단품관리 화면입니다</div>
<form name="aspnetForm" id="aspnetForm" method="post" action="goods.aspx">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 배송머리 = ['주문번호','상품명','수취인','휴대전화','주소','배송사','송장번호','상태'];
const 배송줄 = Array.from({length:5},(_,i)=>['20261015-'+i,'가나다 서랍장 '+i,'가나다','010-0000-0000','경기도 ○○시','○○택배',String(64000+i),'배송완료']);
const 단품머리 = ["단품코드","단품명","매입처명","단품분류","재고유형","발주유형","판매상태","배송수량","양품수","상품코드","상품명","매출처명","매출처코드","창고"];
const 단품줄 = Array.from({length:3},(_,i)=>["ING-"+i,"가나다 단품 "+i,"가매입처","서랍장","재고","발주","판매중",String(10+i),String(5+i),"KLS-"+i,"가나다 세트 "+i,"가매출처","1010","0.본사"]);
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

const 쪽들 = [
  { 이름: '① 로그인',   길: '/Login.aspx',                      몸: 로그인쪽, 글: ['login.js'] },
  { 이름: '② 메인메뉴', 길: '/index.aspx',                      몸: 메인쪽,   글: ['login.js','menu.js'] },
  { 이름: '③ 배송관리', 길: '/System/Delivery/firmDvList.aspx', 몸: 배송쪽,   글: ['login.js','search.js'] },
  { 이름: '④ 단품관리', 길: '/System/Master/goods.aspx',        몸: 단품쪽,   글: ['login.js','goods.js'] },
];
const 본다 = () => {
  const 보임 = (el) => { if (!el) return false; const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && getComputedStyle(el).display !== 'none'; };
  const 우리 = ['#vp-root', '#vp-판', '#vp-탈', '#vp-바꾸기'].filter((s) => 보임(document.querySelector(s)));
  const 단추 = document.querySelector('#vp-바꾸기');
  const r = 단추 && 단추.getBoundingClientRect();
  return { vp_clean: document.documentElement.classList.contains('vp-clean'),
    우리보이는것: 우리, 우리수: 우리.length,
    단추글: 단추 ? 단추.textContent : null,
    단추높이: r ? Math.round(r.height) : 0,
    단추뿌리에: !!(단추 && 단추.parentElement === document.documentElement),
    벤더피아제화면보이나: 보임(document.getElementById('벤더피아제화면')),
    /* ⚠ 「짚개가 그 문서에서 돌았나」 만 본다. 손잡이 글이 진짜로 그려지는지는
       이 상자에서 못 잰다(깃허브가 막혀 있다). 두 모습에서 **달라지지 않는지**가 볼 것이다. */
    짚개돌았나: !!window.__vp짚개,
    기억적혔나: (() => { try { return !!sessionStorage.getItem('vg기억장:' + location.pathname); }
                        catch (e) { return false; } })(),
  };
};
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ 벤더피아 원래 화면으로 가는 전환 단추 · 폰 390×844');
  let 붙은쪽 = 0;
  for (const 쪽 of 쪽들) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (r.request().method() === 'POST') return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
        body: `<html><body><span>총 5 건</span><table><tr>${배송머리.map(h=>`<th>${h}</th>`).join('')}</tr>
          ${배송줄.map(x=>`<tr>${x.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>` });
      if (new URL(r.request().url()).pathname.endsWith('.js'))
        return r.fulfill({ status:200, contentType:'text/javascript', body: '/* 손잡이 자리 (흉내) */' });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 쪽.몸 });
    });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,120)));
    await page.goto('https://vendorpia.com' + 쪽.길);
    await page.addStyleTag({ content: ['login.css','menu.css','search.css','goods.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of 쪽.글) await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    /* 짚개.js 도 넣는다 — 두 모습 다에서 짚기가 사는지 봐야 한다 */
    await page.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"x"}),getURL:f=>"/"+f};' });
    await page.addScriptTag({ content: fs.readFileSync(path.join(확장, '짚개.js'), 'utf8') }).catch(()=>{});
    await page.waitForTimeout(900);

    const 전 = await page.evaluate(본다);
    if (!전.단추글) { console.log('\n  ' + 쪽.이름 + ' — ✗ 단추가 없다'); await ctx.close(); continue; }
    붙은쪽++;
    /* 배송관리면 조회를 한 번 해 둔다 — 되돌렸을 때 결과가 그대로인지 보려고 */
    let 조회전 = null;
    if (쪽.길.includes('firmDvList')) {
      await page.click('.vp-bar button[type=submit]'); await page.waitForTimeout(700);
      조회전 = await page.evaluate(() => document.querySelectorAll('#vp-root .vp-table tbody tr').length);
    }
    await page.click('#vp-바꾸기'); await page.waitForTimeout(300);
    const 뒤 = await page.evaluate(본다);
    await page.click('#vp-바꾸기'); await page.waitForTimeout(300);
    const 되돌림 = await page.evaluate(본다);
    const 조회후 = 조회전 === null ? null
      : await page.evaluate(() => document.querySelectorAll('#vp-root .vp-table tbody tr').length);

    console.log('\n  ' + 쪽.이름);
    console.log('    단추 「' + 전.단추글 + '」 · 높이 ' + 전.단추높이 + 'px · 뿌리에 달렸나 ' + 전.단추뿌리에);
    console.log('    우리 화면일 때  : 우리 것 ' + 전.우리수 + '개 ' + JSON.stringify(전.우리보이는것)
      + ' · 벤더피아 제 화면 ' + 전.벤더피아제화면보이나 + ' · 짚개 ' + 전.짚개돌았나 + '/기억 ' + 전.기억적혔나);
    console.log('    **눌렀을 때**   : 우리 것 **' + 뒤.우리수 + '개** ' + JSON.stringify(뒤.우리보이는것)
      + ' · **벤더피아 제 화면 ' + 뒤.벤더피아제화면보이나 + '** · 짚개 ' + 뒤.짚개돌았나 + '/기억 ' + 뒤.기억적혔나 + ' · 단추 「' + 뒤.단추글 + '」');
    console.log('    다시 눌렀을 때  : 우리 것 ' + 되돌림.우리수 + '개 · 벤더피아 제 화면 ' + 되돌림.벤더피아제화면보이나
      + ' · 짚개 ' + 되돌림.짚개돌았나 + '/기억 ' + 되돌림.기억적혔나);
    if (조회전 !== null) console.log('    ★ 조회 결과 줄 : 전 ' + 조회전 + '줄 → 되돌린 뒤 ' + 조회후 + '줄 ('
      + (조회전 === 조회후 ? '그대로 ✓' : '달라졌다 ✗') + ')');
    if (탈.length) console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2)));
    await ctx.close();
  }
  console.log('\n  ★ 단추가 붙은 쪽: **' + 붙은쪽 + ' / ' + 쪽들.length + '**');
  await b.close();
})();
