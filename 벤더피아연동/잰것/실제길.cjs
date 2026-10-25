/* 0.34.53 의 **실제 싣는 길(bg.js → MAIN 인라인)** 로 이름 단추·줄 클릭·끌기를 재는 자 (10-25 「이미 34.53 이야」).
   진짜 크롬에 이 폴더를 확장으로 올리고, 깃허브는 이 폴더 파일을 내주는 흉내, vendorpia.com 은 가짜 https 서버. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https'), { execSync } = require('child_process');
const 확장 = path.join(__dirname, '..');
const EXE = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'].find((p) => fs.existsSync(p));
let 초록 = 0, 빨강 = 0;
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };
const 표 = (머리, 줄) => `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","모델번호","매출처상품명","옵션상품유무","등록일"];
const 상품들 = [["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","경동택배(포천)","판매중","비스켓 800 몸통","bis800_b","M-800","비스켓800","N","2026-01-05"]];
const 단품머리 = ["단품명","단품코드","단품분류","매입처명","재고유형","발주유형","판매상태","바코드","등록일"];
const 단품들 = [["비스켓 800 몸통","bis800_b","수납장","가매입처","재고","정상","판매중","880001","2026-01-05"]];
const 배송머리 = ["주문번호","상품명","단품명","수취인","수량","배송사","송장번호","배송상태","CS구분","매출처"];
const 배송줄 = [["20261015-1","비스켓 800 주방수납장","비스켓 800 몸통","가나다","1","경동택배(포천)","640001","배송완료","","가매출처"]];
const 보임 = ["주문번호","상품명","단품명","수취인","수량"];
const 머리69 = Array.from({ length: 66 }, (_, i) => i < 5 ? 보임[i] : '숨김' + i);
const 주문그리드 = `<div id="oGrid"><table><tr>${머리69.map((h, i) => `<th class="igg_HeaderCaption"${i < 5 ? '' : ' style="display:none"'}>${h}</th>`).join('')}</tr></table><table><tr><th><div><table><tbody>
<tr>${머리69.map((h, i) => `<td${i < 5 ? '' : ' style="display:none"'}>${['20261015-1','비스켓 800 주방수납장','비스켓 800 몸통','가나다','1'][i] || 'x'}</td>`).join('')}</tr></tbody></table></div></th></tr></table></div>`;
const 주문쪽 = `<html><head><meta charset="utf-8"></head><body id="body"><form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f"><input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" value="2026-09-25"><input name="dcEndDt" value="2026-10-25"><input type="image" name="btnSearch" id="btnSearch" src="s.gif"></form>${주문그리드}</body></html>`;
const 행수 = '<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>';
const 쪽 = (제목, 액션, 칸들) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body id="body"><form name="aspnetForm" method="post" action="${액션}" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">${칸들}<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;

(async () => {
  const d0 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d0}/k.pem -out ${d0}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  const 서버 = https.createServer({ key: fs.readFileSync(d0 + '/k.pem'), cert: fs.readFileSync(d0 + '/c.pem') }, (q, r) => {
    const 길 = q.url.split('?')[0]; r.setHeader('content-type', 'text/html; charset=utf-8');
    if (q.method === 'POST' && 길.includes('orderMst')) { q.resume(); return r.end('<html><body>' + 주문그리드 + '</body></html>'); }
    if (q.method === 'POST') { q.resume(); return r.end(길.includes('salesGoods') ? 표(상품머리, 상품들) : 길.includes('/Master/goods') ? 표(단품머리, 단품들) : 표(배송머리, 배송줄)); }
    if (길.includes('orderMst')) return r.end(주문쪽);
    if (길.includes('salesGoods')) return r.end(쪽('상품관리', '/System/Master/salesGoods.aspx', 행수 + '<input name="tbSGoodsCd"><input name="tbGoodsNm">'));
    if (길.includes('/Master/goods')) return r.end(쪽('단품관리', '/System/Master/goods.aspx', 행수 + '<input name="tbGoodsCd"><input name="tbGoodsNm">'));
    if (길.includes('firmDvList')) return r.end(쪽('배송목록조회', '/System/Delivery/firmDvList.aspx', '<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option></select>' + 행수));
    r.end('<html><body>x</body></html>');
  }).listen(8443);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-'));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true,
    env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
    args: ['--headless=new', '--no-sandbox', '--no-proxy-server', '--host-resolver-rules=MAP vendorpia.com 127.0.0.1:8443, MAP www.vendorpia.com 127.0.0.1:8443',
      '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
  await new Promise((r) => setTimeout(r, 2000));
  await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
  await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}', headers: { 'access-control-allow-origin': '*' } }));
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
    const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop()), 자리 = path.join(확장, 이름);
    if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
    return r.fulfill({ status: 200, headers: { 'content-type': 이름.endsWith('.css') ? 'text/css' : 'text/javascript', 'access-control-allow-origin': '*' }, body: fs.readFileSync(자리, 'utf8') });
  });
  const 오류 = [];
  const 화면 = async (길, 조회) => {
    const p = await ctx.newPage(); p.on('pageerror', (e) => 오류.push(String(e).slice(0, 160)));
    p.on('console', (m) => { if (/VP|상품단추|단품단추/.test(m.text())) console.log('   [콘솔]', m.text().slice(0, 140)); });
    await p.goto('https://vendorpia.com' + 길); await p.waitForTimeout(5000);
    if (조회) { await p.click('.vp-bar button[type=submit]'); await p.waitForTimeout(3500); }
    return p;
  };
  console.log('\n■ 배송관리 (실제 길)');
  const p = await 화면('/System/Delivery/firmDvList.aspx', true);
  console.log('   딱지:', await p.evaluate(() => (document.getElementById('vp-판') || {}).textContent));
  const 본 = await p.evaluate(() => ({ 상품단추: !!window.VP상품단추, 단품단추: !!window.VP단품단추, 굿즈: !!window.__vp굿즈돌았나, 글: document.documentElement.getAttribute('data-vp-글'),
    이름단추: document.querySelectorAll('.vp-table .vp-goods-list button').length, 줄표: document.querySelectorAll('.vp-table tbody tr.vp-줄상담').length, 줄: document.querySelectorAll('.vp-table tbody tr').length }));
  console.log('  ', JSON.stringify(본));
  맞나('이름 단추(상품+단품) 2개', 본.이름단추 === 2);
  맞나('줄 누름 표', 본.줄표 === 본.줄 && 본.줄 > 0);
  await p.click('.vp-table tbody tr td:last-child'); await p.waitForTimeout(600);
  맞나('줄 누름 → 상담 판', await p.evaluate(() => !!document.querySelector('.vp-상담판')));
  const 앞 = await p.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  const 머 = await p.evaluate(() => { const r = document.querySelector('.vp-상담판 .vp-상담머리 strong').getBoundingClientRect(); return [r.left + 4, r.top + r.height / 2]; });
  await p.mouse.move(머[0], 머[1]); await p.mouse.down(); await p.mouse.move(머[0] + 60, 머[1] + 70, { steps: 6 }); await p.mouse.up();
  const 뒤 = await p.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  맞나('상담 판 끌림', Math.abs(뒤[0] - 앞[0] - 60) <= 2 && Math.abs(뒤[1] - 앞[1] - 70) <= 2, JSON.stringify([앞, 뒤]));
  await p.close();

  console.log('\n■ CS등록 (주문관리, 실제 길 — 확장은 goods.js 를 안 보낸다)');
  const c = await 화면('/System/Sales/orderMst.aspx#vgCS', false); await c.waitForTimeout(2500);
  console.log('   딱지:', await c.evaluate(() => (document.getElementById('vp-판') || {}).textContent));
  const 씨 = await c.evaluate(() => ({ 머리: [...document.querySelectorAll('.vp-table thead th')].map((x) => x.textContent), 이름단추: document.querySelectorAll('.vp-table .vp-goods-list button').length, 줄표: document.querySelectorAll('.vp-table tbody tr.vp-줄상담').length, 줄: document.querySelectorAll('.vp-table tbody tr').length }));
  console.log('  ', JSON.stringify(씨));
  맞나('CS등록 이름 단추(상품+단품) 2개', 씨.이름단추 === 2);
  맞나('CS등록 줄 누름 표', 씨.줄표 === 씨.줄 && 씨.줄 > 0);
  await c.click('.vp-table tbody tr td:last-child'); await c.waitForTimeout(600);
  맞나('CS등록 줄 누름 → 상담 판', await c.evaluate(() => !!document.querySelector('.vp-상담판')));
  const 앞2 = await c.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  const 머2 = await c.evaluate(() => { const r = document.querySelector('.vp-상담판 .vp-상담머리 strong').getBoundingClientRect(); return [r.left + 4, r.top + r.height / 2]; });
  await c.mouse.move(머2[0], 머2[1]); await c.mouse.down(); await c.mouse.move(머2[0] + 60, 머2[1] + 70, { steps: 6 }); await c.mouse.up();
  const 뒤2 = await c.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  맞나('CS등록 상담 판 끌림', Math.abs(뒤2[0] - 앞2[0] - 60) <= 2 && Math.abs(뒤2[1] - 앞2[1] - 70) <= 2, JSON.stringify([앞2, 뒤2]));
  await c.keyboard.press('Escape');
  await c.click('.vp-table tbody tr td.vp-상품칸:not(.vp-단품칸) button'); await c.waitForTimeout(600);
  맞나('CS등록 상품명 단추 → 상품 상세(상담 아님)', await c.evaluate(() => [...document.querySelectorAll('.vp-goods-panel')].some((p) => !p.hidden) && !document.querySelector('.vp-상담판')));
  await c.close();
  맞나('쪽 오류 0', 오류.length === 0, JSON.stringify(오류.slice(0, 3)));
  await ctx.close(); 서버.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
