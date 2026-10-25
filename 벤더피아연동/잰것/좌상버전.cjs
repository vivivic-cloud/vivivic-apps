/* 0.34.53 의 **좌측 상단 버전 시험(bg.js → MAIN 인라인)** 로 이름 단추·줄 클릭·끌기를 재는 자 (10-25 「이미 34.53 이야」).
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
    if (길.includes('index.aspx')) return r.end('<html><head><meta charset="utf-8"></head><body><a href="#">배송관리</a></body></html>');
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
  const 칩보기 = (p) => p.evaluate(() => { const e = document.getElementById('vp-버전'); if (!e) return null; const r = e.getBoundingClientRect(), b = document.getElementById('vp-바꾸기'), br = b && b.getBoundingClientRect();
    return { 글: e.textContent, x: r.left, y: r.top, w: r.width, h: r.height, 겹침: !!br && !(r.right <= br.left || br.right <= r.left || r.bottom <= br.top || br.bottom <= r.top), 보임: getComputedStyle(e).display !== 'none' && r.width > 0, 딱지숨음: !document.getElementById('vp-판') || getComputedStyle(document.getElementById('vp-판')).display === 'none' }; });
  const 판 = JSON.parse(fs.readFileSync(path.join(확장, 'manifest.json'), 'utf8')).version;
  const 길들 = [['배송관리', '/System/Delivery/firmDvList.aspx'], ['CS등록', '/System/Sales/orderMst.aspx#vgCS'], ['단품관리', '/System/Master/goods.aspx'], ['상품관리', '/System/Master/salesGoods.aspx'], ['메뉴', '/index.aspx']];
  for (const [이름, 길] of 길들) {
    console.log('\n■ ' + 이름);
    const p = await 화면(길, false); await p.waitForTimeout(1500);
    const c = await 칩보기(p); console.log('   칩:', JSON.stringify(c));
    맞나(이름 + ' 좌측 상단 버전 보임', !!c && c.보임 && c.x < 20 && c.y < 20);
    맞나(이름 + ' 글자 = v' + 판 + '…', !!c && c.글.startsWith('v' + 판));
    맞나(이름 + ' 단추와 안 겹침', !!c && !c.겹침);
    맞나(이름 + ' 옛 딱지 그대로 숨음', !!c && c.딱지숨음);
    if (이름 === '메뉴') { await p.setViewportSize({ width: 375, height: 700 }); await p.waitForTimeout(300); const m = await 칩보기(p); 맞나('375 폭에서도 안 겹침', !!m && !m.겹침 && m.보임); await p.screenshot({ path: path.join(__dirname, '그림', '좌상버전-375.png') }); }
    else { await p.setViewportSize({ width: 1280, height: 720 }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, '그림', '좌상버전-' + 이름 + '-1280.png') }); }
    await p.close();
  }
  console.log('\n■ 새 창 오리지널 (window.name=vp원본)');
  const o = await ctx.newPage(); await o.goto('https://vendorpia.com/x.aspx'); await o.evaluate(() => { window.name = 'vp원본'; });
  await o.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx'); await o.waitForTimeout(4000);
  맞나('원본 새 창에는 버전 칩 없음', (await o.evaluate(() => !document.getElementById('vp-버전') && !document.getElementById('vp-바꾸기'))));
  await o.close();
  맞나('쪽 오류 0', 오류.length === 0, JSON.stringify(오류.slice(0, 3)));
  await ctx.close(); 서버.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
