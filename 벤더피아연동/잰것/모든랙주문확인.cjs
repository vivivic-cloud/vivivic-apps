/* **CS등록 머리 「모든랙주문확인」** 을 재는 자 (11-04 [새 지시 모든랙주문확인]).
   사장님(그대로): 「cs관리 상담내용보기 옆에 모든랙주문확인 버튼을 만들어 클릭시 해당페이지 보여지는 주문관리 목록에서 상품명 모든랙 으로 검색되는 목록만 보이게 해주세요」
   재는 것: ㄱ) 상담내용보기 바로 옆·같은 꼴 ㄴ) 누르면 멀티검색과 같은 POST 로 상품명 칸만·기간 그대로·공용 줄
           ㄷ) 50줄 넘으면 700 으로 더 받아 다 보임 ㄹ) 고르는 칸에 같은 이름이 있어도 안 걸림 ㅁ) 기간 바꿔 조회해도 상품명만
           ㅂ) 글 지우고 조회 = 전체, 손으로 친 「모든랙」 = 평소 네 칸 ㅅ) 700 넘으면 일부만이라고 말함
   ⚠ 진짜 vendorpia.com 은 못 닿는다 — 주문관리 모양은 흉내, 자료는 전부 가짜.
   돌리기: NODE_PATH=<playwright 있는 node_modules> PW_EXE=<크로미움> node 잰것/모든랙주문확인.cjs */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const 그림칸 = path.join(__dirname, '그림'); fs.mkdirSync(그림칸, { recursive: true });
const EXE = process.env.PW_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 머리 = ['', '주문번호', '상품코드', '상품명', '수취인', ...Array.from({ length: 60 }, (_, i) => '칸' + i)];
const 그리드 = (앞, n) => `<div id="oGrid"><table><tr>${머리.map((h) => `<th class="igg_HeaderCaption" style="width:80px">${h}</th>`).join('')}</tr></table><table><tbody>${
  Array.from({ length: n }, (_, r) => `<tr>${머리.map((h, c) => `<td>${c === 0 ? '<input type="checkbox">' : c === 3 ? 앞 + ' 선반 ' + r : 앞 + r + '_' + c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const 쪽글 = (매입처) => `<html><head><meta charset="utf-8"></head><body><form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f">
${['tbSOrderNo', 'tbSGoodsCd', 'tbSGoodsNm', 'tbRecipient', 'tbOrderer', 'tbAddr'].map((n) => `<input type="text" name="ctl00$Contents$${n}" id="${n}">`).join('')}
<select name="ctl00$Contents$ddlSupplier" id="ddlSupplier"><option value="">전체</option>${매입처 ? '<option value="77">모든랙</option>' : ''}</select>
<input type="text" name="ctl00$Contents$dcStartDt" id="dcStartDt" value="2026-10-05"><input type="text" name="ctl00$Contents$dcEndDt" id="dcEndDt" value="2026-11-04">
<select name="ctl00$Contents$ddlRowCnt" id="ddlRowCnt"><option>50</option><option>700</option></select>
<input type="image" name="ctl00$Contents$btnSearch" id="btnSearch" src="s.gif"><span>주문수량: 5 / 행수: 5건</span>${그리드('처음', 5)}</form></body></html>`;
let 초록 = 0, 빨강 = 0;
const 못 = (ok) => { ok ? 초록++ : 빨강++; return ok ? '✓' : '✗ 틀림'; };

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const 너비 of [1280, 375]) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 800 } });
    let 총 = 3, 매입처 = false;
    const 보낸것 = [];
    await ctx.route('**://vendorpia.com/**', async (r) => {
      const q = r.request(), 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
      if (q.method() !== 'POST') return 화(쪽글(매입처));
      const 몸 = q.postDataBuffer().toString('utf8');
      const 값 = (n) => (몸.match(new RegExp('name="ctl00\\$Contents\\$' + n + '"\\r\\n\\r\\n([^\\r]*)')) || [])[1] || '';
      const 칸 = ['tbSOrderNo', 'tbSGoodsCd', 'tbSGoodsNm', 'tbRecipient', 'tbOrderer', 'tbAddr', 'ddlSupplier'].filter((n) => 값(n));
      const 행 = 값('ddlRowCnt');
      보낸것.push({ 주소: new URL(q.url()).pathname, 칸: 칸.map((n) => n + '=' + 값(n)), 행, 시작: 값('dcStartDt'), 끝: 값('dcEndDt'), 조회단추: /btnSearch\.x/.test(몸) });
      const 준 = Math.min(총, Number(행) || 50);
      화(`<html><body><span>주문수량: ${총} / 행수: ${총}건</span>${그리드('모든랙', 준)}</body></html>`);
    });
    /* 깃허브 goods.js 는 이름 단추용 — 이 시험 밖이라 빈 글로. 창고는 막는다(쓰기 금지). */
    await ctx.route('**://vivivic-cloud.github.io/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.abort());
    const 열기 = async () => {
      const 쪽 = await ctx.newPage(), 탈 = [];
      쪽.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
      await 쪽.goto('https://vendorpia.com/System/Sales/orderMst.aspx#vgCS');
      await 쪽.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};' });
      await 쪽.addStyleTag({ content: ['login.css', 'search.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
      await 쪽.addScriptTag({ content: 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};window.공용줄=[];' });
      await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8') });   // 진짜 공용 줄
      await 쪽.addScriptTag({ content: 'const 원래받기=VP_DATA.받기;VP_DATA.받기=(u,o,급)=>{공용줄.push(급);return 원래받기(u,o,급);};' });
      await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
      await 쪽.waitForSelector('#vp-root .vp-table tbody tr');
      return { 쪽, 탈 };
    };
    const 끝기다림 = (쪽) => 쪽.waitForFunction(() => !window.VP조회중 && /건$|결과|일부만/.test(document.querySelector('#vp-root .vp-note').textContent));
    const 누르기 = async (쪽) => { 보낸것.length = 0; await 쪽.click('#vp-root .vp-모든랙단추'); await 쪽.waitForTimeout(150); await 끝기다림(쪽); };
    const 조회 = async (쪽) => { 보낸것.length = 0; await 쪽.click('#vp-root .vp-bar button[type=submit]'); await 쪽.waitForTimeout(150); await 끝기다림(쪽); };
    const 상태 = (쪽) => 쪽.evaluate(() => ({ 검색글: document.querySelector('#vp-root .vp-q').value, 글: document.querySelector('#vp-root .vp-note').textContent,
      줄: document.querySelectorAll('#vp-root .vp-table tbody tr').length, 처음줄: /처음/.test(document.querySelector('#vp-root .vp-table').textContent),
      모두모든랙: [...document.querySelectorAll('#vp-root .vp-table tbody tr')].every((tr) => /모든랙/.test(tr.textContent)), 공용: window.공용줄.slice() }));

    console.log('\n  ◆ 창 ' + 너비);
    const { 쪽, 탈 } = await 열기();
    const 꼴 = await 쪽.evaluate(() => {
      const 줄 = document.querySelector('#vp-root .vp-머리줄'), 상담 = 줄.querySelector('a.vp-머리단추'), 모 = 줄.querySelector('.vp-모든랙단추');
      const 뽑 = (e) => { const s = getComputedStyle(e); return [s.height, s.paddingLeft, s.paddingTop, s.borderTopWidth, s.borderTopColor, s.borderTopLeftRadius, s.backgroundColor, s.color, s.fontSize, s.fontWeight, s.fontFamily, s.marginTop, s.display].join('|'); };
      return { 글: 모 && 모.textContent, 바로옆: 상담.nextElementSibling === 모, 같은꼴: 뽑(상담) === 뽑(모), 상담꼴: 뽑(상담), 모꼴: 뽑(모), 쪽가로: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    console.log('    ★ 「모든랙주문확인」 상담내용보기 바로 옆 ' + 못(꼴.글 === '모든랙주문확인' && 꼴.바로옆));
    console.log('    ★ 상담내용보기와 같은 꼴 ' + 못(꼴.같은꼴) + (꼴.같은꼴 ? '' : '\n      ' + 꼴.상담꼴 + '\n      ' + 꼴.모꼴));
    console.log('    ★ 쪽 전체 안 밀림 ' + 못(!꼴.쪽가로));
    console.log('    ★ 누르기 전 POST 없음 ' + 못(보낸것.length === 0));

    await 누르기(쪽);
    let s = await 상태(쪽);
    console.log('    ★ 누름 → 상품명 칸만 · 기간 그대로 · 50줄 · 조회 단추 ' + 못(보낸것.length === 1 && JSON.stringify(보낸것[0].칸) === '["tbSGoodsNm=모든랙"]' && 보낸것[0].시작 === '2026-10-05' && 보낸것[0].끝 === '2026-11-04' && 보낸것[0].행 === '50' && 보낸것[0].조회단추 && 보낸것[0].주소 === '/System/Sales/orderMst.aspx'));
    console.log('    ★ 검색창에 「모든랙」 · 표는 받은 줄만(처음 목록 사라짐) · 3건 ' + 못(s.검색글 === '모든랙' && s.줄 === 3 && !s.처음줄 && s.모두모든랙 && s.글 === '3건'));
    console.log('    ★ 공용 줄·사람 급 ' + 못(s.공용.length === 1 && s.공용[0] === '사람'));
    await 쪽.screenshot({ path: path.join(그림칸, '모든랙주문확인-' + 너비 + '.png') });

    총 = 320; await 누르기(쪽); s = await 상태(쪽);
    console.log('    ★ 50줄 넘음 → 700 으로 더 받아 빠짐없음(320) ' + 못(보낸것.map((x) => x.행).join() === '50,700' && 보낸것.every((x) => x.칸.join() === 'tbSGoodsNm=모든랙') && s.줄 === 320 && s.글 === '320건') + ' (' + s.줄 + '줄)');

    총 = 900; await 누르기(쪽); s = await 상태(쪽);
    console.log('    ★ 700 넘음 → 일부만이라고 말함(멀티검색과 같음) ' + 못(s.줄 === 700 && /일부만/.test(s.글)));

    총 = 3; await 쪽.fill('#vp-root input[name=from]', '2026-08-01'); await 조회(쪽);
    console.log('    ★ 기간 바꿔 조회 → 그대로 상품명만, 새 기간 ' + 못(보낸것.length === 1 && 보낸것[0].칸.join() === 'tbSGoodsNm=모든랙' && 보낸것[0].시작 === '2026-08-01'));

    await 쪽.fill('#vp-root .vp-q', ''); await 조회(쪽);
    console.log('    ★ 글 지우고 조회 → 평소 전체 조회 ' + 못(보낸것.length === 1 && 보낸것[0].칸.length === 0));
    await 쪽.fill('#vp-root .vp-q', '모든랙'); await 조회(쪽);
    console.log('    ★ 손으로 친 「모든랙」 → 평소 멀티검색 네 칸 ' + 못(JSON.stringify(보낸것.map((x) => x.칸.join())) === JSON.stringify(['tbRecipient=모든랙', 'tbOrderer=모든랙', 'tbAddr=모든랙', 'tbSGoodsNm=모든랙'])));
    await 쪽.fill('#vp-root .vp-q', '홍길동'); await 조회(쪽);
    await 누르기(쪽); s = await 상태(쪽);
    console.log('    ★ 다른 말 뒤에 눌러도 검색창이 바뀌고 상품명만 ' + 못(s.검색글 === '모든랙' && 보낸것.length === 1 && 보낸것[0].칸.join() === 'tbSGoodsNm=모든랙'));
    console.log('    ★ 쪽 오류 ' + 탈.length + ' ' + 못(탈.length === 0) + (탈.length ? ' ' + 탈[0] : ''));

    매입처 = true;
    const 둘 = await 열기();
    await 누르기(둘.쪽);
    console.log('    ★ 매입처에 같은 이름 「모든랙」 있어도 상품명으로만 ' + 못(보낸것.length === 1 && 보낸것[0].칸.join() === 'tbSGoodsNm=모든랙'));
    await ctx.close();
  }
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
