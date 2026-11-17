/* 11-17 [새 지시 단품줄바꿈·가로스크롤] — 상품관리 단품명 칸 = 단품 하나에 한 줄·단품 단추, 표 통 밑이 화면 밖이면 화면 맨 아래 밀대(`VP표` `.vp-떠밀대`).
   자료는 전부 지어낸 값. 돌리기: NODE_PATH=<playwright 있는 node_modules> VP_EXE=<크로미움> node 잰것/단품줄밀대.cjs */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const { chromium } = pw;
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');
let 초록 = 0, 빨강 = 0;
const 봤다 = (참, 글) => { if (참) 초록++; else 빨강++; console.log('    ' + (참 ? '✓ ' : '✗ ') + 글); };

const 원래 = (제목, 쪽) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="${쪽}"><input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option><option value="1">판매중</option></select><input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
/* 받은 자료 머리 = 원래칸 사이에 숨은 칸을 섞어 둔다(원래 화면처럼) */
const 자료짓기 = (길, 숨은, 몇이름, 이름당줄) => {
  const 원 = PAGES[길].원래칸;
  const 머리 = [...원.slice(0, 2), ...숨은, ...원.slice(2)];
  const 줄 = [];
  for (let n = 0; n < 몇이름; n++) for (let k = 0; k < 이름당줄; k++)
    줄.push(머리.map((h, i) => h === PAGES[길].nameCol ? `지어낸이름${n}` : h === PAGES[길].codeCol ? `CODE-${n}` :
      h === '양품수' ? String(k + 1) : h === '등록일' ? '2026-08-0' + (k + 1) : h === '창고' ? (k ? '2.안성' : '0.본사') : `${h}값${n}-${k}`));
  return { 머리, 줄 };
};
const 판0 = {
  '/System/Master/goods.aspx': { 제목: '단품관리', 쪽: 'goods.aspx', ...자료짓기('/System/Master/goods.aspx', ['수도권선불비', 'Page'], 60, 2) },
  '/System/Master/salesGoods.aspx': { 제목: '상품관리', 쪽: 'salesGoods.aspx', ...자료짓기('/System/Master/salesGoods.aspx', ['매출처코드', '모델번호'], 60, 3) },
  '/System/Stock/StockList.aspx': { 제목: '재고조회', 쪽: 'StockList.aspx', ...자료짓기('/System/Stock/StockList.aspx', ['재고번호', '박스코드'], 60, 2) },
};
const 흉내 = (자료) => `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");}; return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    if (/prePostDelivery/.test(url)) { var rows = []; for (var n = 0; n < 60; n++) rows.push(["지어낸이름" + n, String(100 - n)]);
      cb([cfg.nameCol, "배송수량"], rows, rows.length, rows.length); return { cachedAt: null }; }
    var 모두 = ${JSON.stringify(판)}; var 이것 = 모두[url] || ${JSON.stringify(자료)};
    cb(이것.머리, 이것.줄, 이것.줄.length, 이것.줄.length); return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){ return {}; }, set: async function(){}, remove: async function(){} };`;
const vp데이터 = fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8').replace(/^const VP_DATA = /m, 'const VP_DATA_진짜 = ');


/* 상품관리 단품명 칸을 실제 꼴로: 「이름+이름」 · 코드 「코드 +코드」(11-17 사장님 크롬에서 본 꼴) · 이름 안 「+」(코드 하나) */
const 판 = 판0;
{
  const 상 = 판['/System/Master/salesGoods.aspx'], ni = 상.머리.indexOf('단품명'), ci = 상.머리.indexOf('단품코드');
  상.줄.forEach((r, k) => {
    const n = Math.floor(k / 3);
    if (n % 3 === 0) { r[ci] = `CODE-${n + 1} +CODE-${n + 2} +CODE-${n + 1}`; r[ni] = `지어낸이름${n + 1}+지어낸이름${n + 2}+지어낸이름${n + 1}`; }
    else if (n % 3 === 1) { r[ci] = `CODE-${n + 1}`; r[ni] = `지어낸이름${n + 1}+전도방지`; }
    else { r[ci] = `CODE-${n + 1} +CODE-${n + 2}`; r[ni] = `가+나+다`; }   // 이름 조각 수 ≠ 코드 수 → 단품관리 이름으로
  });
}
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  for (const [너비, 높이] of [[1280, 700], [375, 700]]) {
    const 길 = '/System/Master/salesGoods.aspx', 자료 = 판[길];
    console.log('\n■ 상품관리 · 창 ' + 너비);
    const ctx = await b.newContext({ viewport: { width: 너비, height: 높이 } });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 150)));
    await page.route('**://vivivic-cloud.github.io/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
    await page.route('**://firestore.googleapis.com/**', (r) => r.abort());
    await page.route('**://vendorpia.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 원래(자료.제목, 자료.쪽) }));
    await page.goto('https://vendorpia.com' + 길);
    await page.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') + fs.readFileSync(path.join(확장, 'goods.css'), 'utf8') });
    await page.addScriptTag({ content: 흉내(자료) });
    await page.addScriptTag({ content: vp데이터 });
    await page.addScriptTag({ content: fs.readFileSync(path.join(확장, 'goods.js'), 'utf8') });
    await page.waitForTimeout(2000);
    const v = await page.evaluate(() => {
      const t = document.querySelector('#vp-root .vp-목록표 table.vp-촘촘');
      const h = [...t.tHead.rows[0].cells].map((c) => c.firstChild.textContent), di = h.indexOf('단품명');
      const 줄 = [...t.querySelectorAll('tbody:not([hidden]) tr')];
      const 칸 = (r) => r.cells[di];
      const 줄본 = (r) => { const bs = [...칸(r).querySelectorAll('.vp-단품줄 > .vp-goods-list > button')];
        return { 수: bs.length, 글: bs.map((b) => b.firstChild.textContent), 위: bs.map((b) => Math.round(b.getBoundingClientRect().top)), 높이: Math.round(r.getBoundingClientRect().height),
          남높이: Math.round(r.cells[0].getBoundingClientRect().height) }; };
      return { di, 셋: 줄본(줄[0]), 하나: 줄본(줄[3]), 둘: 줄본(줄[6]) };
    });
    봤다(v.셋.수 === 3 && new Set(v.셋.위).size === 3, '「a+b+a」 = 단추 셋, 한 줄에 하나 ' + JSON.stringify(v.셋));
    봤다(JSON.stringify(v.셋.글) === JSON.stringify(['지어낸이름1', '지어낸이름2', '지어낸이름1']), '같은 단품 반복은 수량만큼 ' + v.셋.글);
    봤다(v.셋.높이 === 3 * 20 + 5 && v.셋.남높이 === v.셋.높이, '세 줄 칸 = 그 줄만 65px(다른 칸도 같은 줄 높이) ' + v.셋.높이);
    봤다(v.하나.수 === 1 && v.하나.높이 === 25, '이름 안 「+」·코드 하나 = 단추 하나, 줄 25px ' + JSON.stringify(v.하나));
    봤다(v.둘.수 === 2 && v.둘.글.every((x) => x.startsWith('지어낸이름')), '조각 수 ≠ 코드 수 → 코드로 나눠 단품관리 이름 ' + v.둘.글);
    // 단추 누름 → 단품 연결 창
    await page.evaluate(() => document.querySelector('#vp-root .vp-단품줄 button').click());
    await page.waitForTimeout(400);
    const 창 = await page.evaluate(() => { const m = [...document.querySelectorAll('#vp-root .vp-goods-modal, #vp-root .vp-modal, #vp-root [class*=modal]')].find((x) => !x.hidden && x.offsetParent !== null);
      return m ? m.textContent.slice(0, 80) : null; });
    봤다(!!창 && 창.includes('지어낸이름1'), '단품 단추 누르면 그 단품 창 ' + (창 || '').slice(0, 40));
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.querySelectorAll('#vp-root .vp-modal-close, #vp-root [aria-label=닫기]').forEach((x) => x.offsetParent && x.click()));
    // 화면 아래 밀대
    const 밀 = await page.evaluate(() => { const 통 = document.querySelector('#vp-root .vp-목록표'), 대 = 통.nextElementSibling, r = 통.getBoundingClientRect();
      return { 대: !!대 && 대.classList.contains('vp-떠밀대'), 보임: 대 && !대.hidden, 통밑: Math.round(r.bottom), 높이: innerHeight, 대밑: 대 && Math.round(대.getBoundingClientRect().bottom), 대높이: 대 && 대.offsetHeight,
        넘침: 통.scrollWidth - 통.clientWidth, 쪽가로: document.documentElement.scrollWidth - innerWidth }; });
    봤다(밀.대 && 밀.통밑 > 밀.높이 && 밀.넘침 > 0 && 밀.보임 && 밀.대밑 === 밀.높이, '통 밑이 화면 밖 → 화면 맨 아래 밀대 보임 ' + JSON.stringify(밀));
    봤다(밀.쪽가로 <= 0, '쪽 가로 스크롤 없음 ' + 밀.쪽가로);
    const 끌 = await page.evaluate(async () => { const 통 = document.querySelector('#vp-root .vp-목록표'), 대 = 통.nextElementSibling;
      대.scrollLeft = 300; await new Promise((r) => setTimeout(r, 100)); const a = 통.scrollLeft;
      통.scrollLeft = 120; await new Promise((r) => setTimeout(r, 100)); return [a, 대.scrollLeft]; });
    봤다(끌[0] === 300 && 끌[1] === 120, '밀대 ↔ 표 같이 움직임 ' + 끌);
    // 마우스로 실제 끌기
    const 손 = await page.evaluate(() => { const 대 = document.querySelector('#vp-root .vp-떠밀대'); const r = 대.getBoundingClientRect(); return [r.left + 30, r.top + 13, (document.elementFromPoint(r.left + 30, r.top + 13) || {}).className, 대.offsetHeight - 대.clientHeight]; });
    await page.mouse.move(손[0], 손[1]); await page.mouse.down(); await page.mouse.move(손[0] + 200, 손[1], { steps: 5 }); await page.mouse.up();
    const 끈뒤 = await page.evaluate(() => document.querySelector('#vp-root .vp-목록표').scrollLeft);
    if (손[3] === 0) console.log('    – 건너뜀: 이 크로미움은 밀대가 덮개식(두께 0)이라 손잡이 끌기를 못 잰다 — 진짜 크롬에서 잰다');
    else 봤다(끈뒤 > 120, '밀대 손잡이를 끌면 표가 밀림 ' + 끈뒤 + ' ' + 손.slice(2));
    // 쪽을 끝까지 내리면(통 밑이 보이면) 숨음
    await page.evaluate(() => (document.scrollingElement || document.documentElement).scrollTo(0, 1e6));
    await page.evaluate(() => [...document.querySelectorAll('*')].forEach((e) => { if (e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY) && !e.classList.contains('vp-목록표')) e.scrollTop = 1e6; }));
    await page.waitForTimeout(200);
    const 끝 = await page.evaluate(() => { const 통 = document.querySelector('#vp-root .vp-목록표'); return { 통밑: Math.round(통.getBoundingClientRect().bottom), 높이: innerHeight, 숨음: 통.nextElementSibling.hidden }; });
    봤다(끝.통밑 > 끝.높이 || 끝.숨음, '통 밑이 화면 안이면 숨음 ' + JSON.stringify(끝));
    if (너비 === 1280) await page.screenshot({ path: path.join(__dirname, '그림', '단품줄밀대.png') });
    봤다(!탈.length, '쪽 오류 없음 ' + 탈.join(' | '));
    await ctx.close();
  }
  await b.close();
  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
