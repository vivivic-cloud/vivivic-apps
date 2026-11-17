/* **하우저** 메뉴를 재는 자 (11-16 [새 지시 하우저 메뉴]). 자료는 전부 지어낸 값이다.
   흉내 = 사장님 크롬에서 잰 상품관리 꼴(바깥 틀 줄 2칸·1칸 포함 — 처음 판이 그것을 머리로 집었다): #oGrid 34칸(첫 칸 체크)·숨은 칸 4개(th class 에 `ig…` 생성 이름)·「총 N건」·배송사 고르는 칸 ddlDCo 에 「하우저」·쪽당 27/100/500/700.
   돌리기: NODE_PATH=<playwright(-core) 있는 node_modules> VP_EXE=<크로미움> node 잰것/하우저.cjs */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const { chromium } = pw;
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || process.env.PW_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 머리 = ['', '매출처명', '매출처코드', '상품코드', '상품명', '매출처상품명', '배송사명', '모델번호', '매입처명', '단품코드', '단품명', '판매금액', '공급금액', '매입금액', '매출이익', '선착불',
  '수도선불비', '수도착불비', '수도외곽선불비', '수도외곽착불비', '지방선불비', '지방착불비', '지방외곽선불비', '지방외곽착불비', '제주선불비', '제주착불비', '조립설치비', '유리비', '제품비', '상품메모', '판매상태', '등록일', '수정일', '옵션상품유무'];
const 숨은 = { 매출처코드: 'ig9a63765d', 매출처상품명: 'ig9a63765e', 모델번호: 'ig9a63765f', 옵션상품유무: 'ig9a637660' };
const 줄만들기 = (i, 배송사, 상태) => 머리.map((h) => ({ '': '', 매출처명: '가상몰', 상품코드: 'HZ' + i, 상품명: '가짜 소파 ' + i, 배송사명: 배송사, 매입처명: '가짜공장', 단품코드: i % 3 ? 'u-' + i : 'u-' + i + 'a+u-' + i + 'b',
  단품명: i % 3 ? '가짜 단품 ' + i : '가짜 몸통 ' + i + '+가짜 다리 ' + i, 판매상태: 상태, 등록일: '2026-01-01', 수정일: '2026-02-01', 선착불: '선불' }[h] ?? (/비|금액|이익/.test(h) ? '0' : '')));
const 상품들 = [...Array.from({ length: 900 }, (_, i) => 줄만들기(i, '하우저', '판매중')), ...Array.from({ length: 50 }, (_, i) => 줄만들기(5000 + i, '하우저', '중지')),
  ...Array.from({ length: 40 }, (_, i) => 줄만들기(9000 + i, '가짜택배', '판매중'))];
const 쪽html = ({ 줄들, 지금, 전체, 쪽크기, 배송사 = '전체', 상태 = '1', 시작 = '2021-11-16' }) => {  // 실제 벤더피아처럼 보낸 값을 그대로 돌려준다
  const 골 = (v) => (v === 배송사 ? ' selected' : ''), 상 = (v) => (v === 상태 ? ' selected' : '');
  const 끝쪽 = Math.ceil(전체 / 쪽크기) || 1;
  const 링크 = []; for (let n = 1; n <= Math.min(10, 끝쪽); n++) 링크.push(`<a href="javascript:__doPostBack('ctl00$Contents$Pager1$ctl${9 + n * 2}','')">${n}</a>`);
  return `<html><body><form id="aspnetForm" method="post" action="./salesGoods.aspx"><input type="hidden" name="__VIEWSTATE" value="x"><input type="hidden" name="__EVENTTARGET"><input type="hidden" name="__EVENTARGUMENT">
<select name="ctl00$Contents$ddlDCo" id="ddlDCo"><option value="전체"${골('전체')}>전체</option><option value="11"${골('11')}>가짜택배</option><option value="205"${골('205')}>하우저</option></select>
<select name="ctl00$Contents$ddlStatus"><option value="전체"${상('전체')}>전체</option><option value="1"${상('1')}>판매중</option><option value="2"${상('2')}>중지</option></select>
<input name="ctl00$Contents$dcStartDt" value="${시작}"><input name="ctl00$Contents$dcEndDt" value="2026-11-16">
<select name="ctl00$Contents$ddlRowCnt">${[27, 100, 500, 700].map((n) => `<option value="${n}"${n === 쪽크기 ? ' selected' : ''}>${n}</option>`).join('')}</select>
<input type="image" id="btnSearch" name="ctl00$Contents$btnSearch" src="s.gif"><input type="image" name="ctl00$Contents$btnDelete" src="d.gif"><input type="image" name="ctl00$Contents$btnChangeStatus" src="c.gif">
<span>총 ${전체}건</span>
<div id="oGrid"><table><tr><th>틀</th><th><table><tr><th class="igg_HeaderCaption">틀안</th></tr></table></th></tr><tr><th>틀둘</th></tr></table><table><tr>${머리.map((h) => `<th class="igg_HeaderCaption  nowrap${숨은[h] ? ' ' + 숨은[h] : ''}" style="width: ${숨은[h] ? 0 : 40}px;">${h}</th>`).join('')}</tr></table><div><table>${줄들.map((값) => `<tr>${값.map((v, i) => `<td>${i === 0 ? '<input id="chkItem" type="checkbox" name="ctl00$Contents$oGrid$it0_0">' : v || '&nbsp;'}</td>`).join('')}</tr>`).join('')}</table></div></div>
<div id="Pager1"><input type="hidden" name="ctl00$Contents$Pager1$hdCurrentPage" value="${지금}">${링크.join('')}</div>
</form></body></html>`;
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 재 = (참, 말) => { console.log((참 ? '  ✓ ' : '  ✗ ') + 말); 참 ? 초록++ : 빨강++; };
  async function 쪽열기(너비, 끊기 = false) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    const p = await ctx.newPage();
    const 보낸 = [], 쪽오류 = [], 밖 = [];
    p.on('pageerror', (e) => 쪽오류.push(String(e)));
    await ctx.route('**/*', async (r) => {
      const q = r.request(), u = new URL(q.url());
      if (u.hostname === 'vivivic-cloud.github.io') {
        const 이름 = decodeURIComponent(u.pathname.split('/').pop());
        return r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: 이름 === '하우저.js' ? fs.readFileSync(path.join(확장, 이름)) : '' });
      }
      if (u.hostname !== 'vendorpia.com') { 밖.push(q.method() + ' ' + u.hostname); return r.abort(); }
      if (/orderMst/i.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<html><body><form id="aspnetForm" action="./orderMst.aspx"><input type="image" id="btnSearch" name="ctl00$Contents$btnSearch"><input id="dcStartDt" value="2026-10-16"><input id="dcEndDt" value="2026-11-16"></form></body></html>' });
      if (!/salesGoods/i.test(u.pathname)) return r.fulfill({ status: 200, body: '' });
      if (끊기 && q.method() === 'POST') return 보낸.push({ 끊김: 1 }), r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><form><input type="password"></form></body></html>' });
      if (q.method() !== 'POST') { 보낸.push({ GET: 1 }); return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 쪽html({ 줄들: 상품들.slice(0, 27), 지금: 1, 전체: 상품들.length, 쪽크기: 27 }) }); }
      const 글 = q.postDataBuffer().toString('utf8');
      const 값 = (k) => (글.match(new RegExp(`name="${k.replace(/\$/g, '\\$')}"\\r\\n\\r\\n([^\\r]*)`)) || [])[1] || '';
      const 쪽값 = { 배송사: 값('ctl00$Contents$ddlDCo'), 상태: 값('ctl00$Contents$ddlStatus'), 시작: 값('ctl00$Contents$dcStartDt'), 줄수: Number(값('ctl00$Contents$ddlRowCnt')) || 27,
        대상: 값('__EVENTTARGET'), 조회: 글.includes('btnSearch.x'), 쓰기: /btnDelete|btnChangeStatus|btnInsert|btnUpdateDCo|btnDCostGb|chkItem/.test(글) };
      보낸.push(쪽값);
      const 이름 = { 205: '하우저', 11: '가짜택배' }[쪽값.배송사];
      const 몫 = 상품들.filter((v) => (!이름 || v[6] === 이름) && (쪽값.상태 !== '1' || v[30] === '판매중'));
      const m = 쪽값.대상.match(/ctl(\d+)$/), 쪽 = 쪽값.조회 ? 1 : m ? (Number(m[1]) - 9) / 2 : 1;
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 쪽html({ 줄들: 몫.slice((쪽 - 1) * 쪽값.줄수, 쪽 * 쪽값.줄수), 지금: 쪽, 전체: 몫.length, 쪽크기: 쪽값.줄수, 배송사: 쪽값.배송사, 상태: 쪽값.상태, 시작: 쪽값.시작 }) });
    });
    await p.goto('https://vendorpia.com/System/Sales/orderMst.aspx#vgHau');
    await p.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') + fs.readFileSync(path.join(확장, 'search.css'), 'utf8') });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8').replace(/^const VP_DATA/m, 'window.VP_DATA') + ';if(typeof VP_DATA!=="undefined")window.VP_DATA=VP_DATA' });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
    await p.waitForFunction(() => { const n = document.querySelector('#vp-root .vp-note'); return n && /조회 \d|끊겼|못/.test(n.textContent); }, null, { timeout: 60000 });
    return { p, ctx, 보낸, 쪽오류, 밖 };
  }

  for (const 너비 of [1280, 375]) {
    console.log('\n■ ' + 너비);
    const { p, ctx, 보낸, 쪽오류, 밖 } = await 쪽열기(너비);
    const 판 = await p.evaluate(() => {
      const t = document.querySelector('#vp-root table.vp-촘촘');
      const th = t && [...t.tHead.rows[0].cells].map((c) => c.firstChild.textContent);
      const td = t && t.tBodies[0].rows[0].cells[1];
      const cs = td && getComputedStyle(td);
      return { h1: document.querySelector('#vp-root h1')?.textContent, 알림: document.querySelector('#vp-root .vp-note').textContent, th, 줄: t ? t.tBodies[0].rows.length : 0,
        글: cs && cs.fontSize, 높이: t && t.tBodies[0].rows[0].getBoundingClientRect().height, 단품줄: t ? Math.max(1, ...[...t.tBodies[0].rows[0].querySelectorAll('.vp-단품줄')].map((x) => x.children.length)) : 1, 손: t ? t.querySelectorAll('.vp-열손').length : 0,
        검색창숨김: getComputedStyle(document.querySelector('#vp-root .vp-bar')).display === 'none',
        쪽가로: document.documentElement.scrollWidth > innerWidth + 1, 표통: (() => { const w = document.querySelector('#vp-root .vp-table'); return w.scrollWidth > w.clientWidth; })(),
        상품칸: document.querySelectorAll('#vp-root td.vp-상품칸:not(.vp-단품칸)').length, 단품칸: document.querySelectorAll('#vp-root td.vp-단품칸').length,
        단품여럿: document.querySelectorAll('#vp-root td.vp-단품칸 .vp-표단품들').length };
    });
    재(판.h1 === '하우저', '제목 「하우저」');
    재(판.검색창숨김, '주문관리 검색창은 숨김');
    재(JSON.stringify(판.th) === JSON.stringify(머리.filter((h) => h && !숨은[h])), '칸 = 상품관리 보이는 칸 그대로 29칸(체크·숨은 칸 4 뺌): ' + (판.th || []).length);
    재(판.줄 === 900, '판매중 하우저 줄 전부(700 + 쪽 넘김 200): ' + 판.줄);
    재(/상품 900개 · 900줄/.test(판.알림) && /판매중\(임시\)/.test(판.알림), '건수 표시: ' + 판.알림);
    재(보낸.filter((x) => !x.GET).every((x) => x.배송사 === '205' && x.상태 === '1' && x.시작 === '2000-01-01') && 보낸[1].조회 && 보낸[1].줄수 === 700 && 보낸[1].시작 === '2000-01-01', '조회 = 배송사 하우저(글자로 찾은 값)·판매중·700줄·2000-01-01부터');
    재(보낸.length === 3 && 보낸[2].대상.endsWith('ctl13'), '요청 = GET 1 + 조회 1 + 2쪽 1: ' + 보낸.length);
    재(보낸.every((x) => !x.쓰기), '쓰기 단추·체크 값 안 보냄');
    재(판.글 === '11px' && Math.round(판.높이) === (판.단품줄 > 1 ? 판.단품줄 * 20 + 5 : 25), '꼴 11px · 줄 25px(단품 n개 줄 = n×20+5, 11-17 모든표 양식): ' + 판.글 + ' ' + 판.높이 + ' 단품' + 판.단품줄);
    재(판.단품줄 > 1, '단품 여럿 = 한 줄에 하나(열바뀜): ' + 판.단품줄);
    재(판.손 === 29, '열 끌기 손잡이 29');
    재(판.상품칸 === 900 && 판.단품칸 === 900 && 판.단품여럿 === 300, '상품명·단품명 칸 = 이름 단추 자리(단품 「a+b」 는 여럿): ' + [판.상품칸, 판.단품칸, 판.단품여럿]);
    재(!판.쪽가로, '쪽 전체 가로 스크롤 없음');
    재(판.표통, '넓은 표는 표 통 안에서 가로로 밀림');
    /* 열 끌기 저장 열쇠 */
    const 손 = p.locator('#vp-root table.vp-촘촘 th .vp-열손').nth(2);
    const 상자 = await 손.boundingBox();
    if (너비 === 1280) {
      await p.mouse.move(상자.x + 3, 상자.y + 5); await p.mouse.down(); await p.mouse.move(상자.x + 60, 상자.y + 5, { steps: 4 }); await p.mouse.up();
      const 둠 = await p.evaluate(() => [localStorage.getItem('vp열넓이:하우저'), localStorage.getItem('vp열넓이:CS')]);
      재(둠[0] && JSON.parse(둠[0]).상품명 > 0 && !둠[1], '끈 넓이 = vp열넓이:하우저 에만 저장: ' + 둠[0]);
    }
    재(!쪽오류.length, '쪽 오류 없음 ' + 쪽오류.join(' | '));
    재(!밖.length, '밖으로 나간 요청 없음 ' + 밖.join(','));
    await ctx.close();
  }
  console.log('\n■ 세션 끊김');
  {
    const { p, ctx, 보낸 } = await 쪽열기(1280, true);
    const 글 = await p.evaluate(() => document.querySelector('#vp-root .vp-note').textContent);
    재(/로그인이 끊겼습니다/.test(글), '끊기면 알림: ' + 글);
    재(보낸.filter((x) => x.끊김).length === 1, '다시 시도·로그인 시도 없음');
    await ctx.close();
  }
  await b.close();
  console.log(`\n★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
