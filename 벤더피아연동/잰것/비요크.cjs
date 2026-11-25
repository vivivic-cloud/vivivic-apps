/* **비요크선불비변경** 메뉴를 재는 자 (11-25 [새 지시 비요크선불비변경] · [새 지시 비요크연결]). 자료는 전부 지어낸 값이다 — 진짜 파일을 여기 넣지 마라(고객 정보).
   [비요크연결] 파일 셀 색은 안 칠함(흰 바탕) · 고름 칸 · 송장번호로 주문관리 흉내(#oGrid 60칸)와 이음 = 노랑.
   흉내 = 사장님 파일 꼴: 1줄 메모(병합 칸) · 2줄 제목(배송관리 칸 + 「선불 수정 」) · 칠한 줄(채움 FFF2CB) · 흰 채움(theme 0) · 채움 없음 · 숫자 「15000.0」 꼴.
   돌리기: NODE_PATH=<playwright(-core) 있는 node_modules> VP_EXE=<크로미움> node 잰것/비요크.cjs
   (VP_REAL=<저장소 밖 .xlsx> 를 주면 그 파일도 올려 줄 수·칠한 줄 수·합만 찍는다 — 값은 안 찍는다) */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const { chromium } = pw;
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || process.env.PW_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';

/* ── 지어낸 .xlsx (저장만 하는 zip) ── */
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(파일들) {
  const 앞 = [], 뒤 = []; let 자리 = 0;
  for (const [이름, 글] of 파일들) {
    const n = Buffer.from(이름), d = Buffer.from(글), c = crc(d);
    const h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x800, 6); h.writeUInt32LE(c, 14); h.writeUInt32LE(d.length, 18); h.writeUInt32LE(d.length, 22); h.writeUInt16LE(n.length, 26);
    앞.push(h, n, d);
    const g = Buffer.alloc(46); g.writeUInt32LE(0x02014b50, 0); g.writeUInt16LE(20, 4); g.writeUInt16LE(20, 6); g.writeUInt16LE(0x800, 8); g.writeUInt32LE(c, 16); g.writeUInt32LE(d.length, 20); g.writeUInt32LE(d.length, 24); g.writeUInt16LE(n.length, 28); g.writeUInt32LE(자리, 42);
    뒤.push(g, n);
    자리 += 30 + n.length + d.length;
  }
  const 뒤판 = Buffer.concat(뒤), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(파일들.length, 8); e.writeUInt16LE(파일들.length, 10); e.writeUInt32LE(뒤판.length, 12); e.writeUInt32LE(자리, 16);
  return Buffer.concat([...앞, 뒤판, e]);
}
const 머리 = ['CS', '매출처', '생산처', '몰', '수취인', '전화', '휴대전화', '주문자', '주문자휴대폰', '주문번호', '고유번호', '배송번호', '송장번호', '배송상태', '상품명', '옵션값', '수량', '박스', '권역', '주소', '배송사', '선불비', '선불 수정 ', '착불비', '제품비', '주문등록일', '입고확인', '지정일', '지사출발', '지사도착', '지방상태', '지방일자', '배송출발', '배송완료일', '회수', '배송메세지', '기사메모', '메모', '본사메모'];
const 줄들 = [ // [칠 꼴(s), 선불비] — 첫 줄은 CS 「취소」(취소 줄 색보다 파일 색이 이김)
  [7, 15000], [7, 10000], [7, 12000], [6, 15000], [0, 10000],
];
const 열 = (i) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const 공유 = [];
const 글칸 = (r, i, 값, s) => { 공유.push(값); return `<c r="${열(i)}${r}" s="${s}" t="s"><v>${공유.length - 1}</v></c>`; };
const 수칸 = (r, i, 값, s) => `<c r="${열(i)}${r}" s="${s}"><v>${값}.0</v></c>`;
function 가짜파일() {
  공유.length = 0;
  let 몸 = `<row r="1">${글칸(1, 12, '가짜 메모 3건/ 37000원', 1)}${글칸(1, 20, '가짜 수정/ 총 5건 \n62000>25000', 3)}${글칸(1, 22, '가짜 안내 글', 4)}</row>`;
  몸 += `<row r="2">${머리.map((h, i) => 글칸(2, i, h, i === 22 ? 6 : 5)).join('')}</row>`;
  줄들.forEach(([s, 선불], k) => {
    const r = k + 3;
    몸 += `<row r="${r}">${머리.map((h, i) => {
      if (h === '선불비') return 수칸(r, i, 선불, s);
      if (h === '선불 수정 ') return 수칸(r, i, 5000, s);
      if (h === '수량' || h === '박스') return 수칸(r, i, 1, s);
      const 값 = { CS: k === 0 ? '취소' : '', 매출처: '가상몰', 몰: '가짜', 수취인: '홍가짜' + k, 주문번호: '9000000000' + k, 고유번호: '100' + k, 배송상태: '주문확정', 상품명: '가짜 협탁 ' + k, 옵션값: '(가짜) 협탁', 배송사: '가짜물류', 주문등록일: '26.11.20  ', 송장번호: k < 4 ? '6000000000' + k : '' }[h];
      return 값 ? 글칸(r, i, 값, s) : `<c r="${열(i)}${r}" s="${s}"/>`;
    }).join('')}</row>`;
  });
  몸 += `<row r="9"><c r="A9" s="7"/><c r="B9" s="7"/></row>`; // 꼴만 있는 빈 줄
  const 시트 = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${몸}</sheetData><mergeCells count="1"><mergeCell ref="M1:P1"/></mergeCells></worksheet>`;
  const 공유글 = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${공유.map((t) => `<si><t xml:space="preserve">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</t></si>`).join('')}</sst>`;
  const 꼴 = `<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="lightGray"/></fill><fill><patternFill patternType="solid"><fgColor theme="0"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDFE3E8"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CB"/></patternFill></fill></fills><cellXfs count="9"><xf fillId="0"/><xf fillId="0"/><xf fillId="0"/><xf fillId="0"/><xf fillId="2"/><xf fillId="3"/><xf fillId="2"/><xf fillId="4"/><xf fillId="2"/></cellXfs></styleSheet>`;
  const 테마 = `<?xml version="1.0" encoding="UTF-8"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:themeElements><a:clrScheme name="x"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="16365C"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2></a:clrScheme></a:themeElements></a:theme>`;
  return zip([
    ['xl/workbook.xml', '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId3"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Target="worksheets/sheet1.xml"/></Relationships>'],
    ['xl/sharedStrings.xml', 공유글], ['xl/styles.xml', 꼴], ['xl/theme/theme1.xml', 테마], ['xl/worksheets/sheet1.xml', 시트],
  ]);
}

/* 주문관리 조회 흉내 — 주문번호 9000000000k: k=0·1 = 송장 같음(이음) · k=2 = 송장 다름 · k=3 = 줄 없음. k=4 는 파일 송장이 비어 안 물음 */
function 폼값(q) {
  const 글 = q.postDataBuffer() ? q.postDataBuffer().toString('utf8') : '';
  const 값 = (이름) => { const m = 글.match(new RegExp('name="[^"]*' + 이름.replace(/\$/g, '\\$') + '"\r\n\r\n([^\r]*)')); return m ? m[1] : ''; };
  return 'tbSOrderNo=' + 값('tbSOrderNo') + ' dcStartDt=' + 값('dcStartDt') + ' ddlRowCnt=' + 값('ddlRowCnt') + ' 단추=' + (/btnSearch\.x/.test(글) ? 1 : 0) + (/btnSave|btnDelete|btnInsert/.test(글) ? ' 쓰기단추!' : '');
}
function 주문관리응답(폼) {
  const 번 = (폼.match(/tbSOrderNo=(\S*)/) || [])[1] || '';
  const k = Number(번.slice(-1));
  const 이름 = ['', '주문번호', 'CS', '주문번호', '상품명', '수취인', '송장번호', '매출처코드', '매출처', '상품코드'];
  while (이름.length < 60) 이름.push('덤' + 이름.length);
  const 보임 = (i) => i !== 0 && i !== 1 && i < 10;   // 체크·안 번호·덤 50칸은 숨김(인라인 width 없음)
  const th = 이름.map((h, i) => `<th class="igg_HeaderCaption"${보임(i) ? ' style="width: 40px;"' : ''}>${h}</th>`).join('');
  const 줄 = (송장, j) => '<tr>' + 이름.map((h, i) => `<td>${i === 0 ? '<input type="checkbox">' : i === 1 ? '77' + k + j : h === '주문번호' ? 번 : h === '상품명' ? '주문관리 협탁 ' + k : h === '수취인' ? '주문관리수취인' + k : h === '송장번호' ? 송장 : h === '매출처코드' ? '55' : h === '매출처' ? '가상몰' : h === '상품코드' ? 'GAZZA' + k : ''}</td>`).join('') + '</tr>';
  const 몸 = k === 0 || k === 1 ? 줄('9999', 0) + 줄('6000000000' + k, 1) : k === 2 ? 줄('5555', 0) : '';
  return `<html><head><script>var vendorCd = getServerCookie('VP_Cookie', 'LOGON_EMP_VCD'); var 길 = "orderDetl.aspx?x=1&vendorCd=" + vendorCd;</script></head><body><form id="aspnetForm" action="./orderMst.aspx"></form><div id="oGrid"><table><tr>${th}</tr></table><table>${몸}</table></div><span>행수: ${k < 2 ? 2 : k === 2 ? 1 : 0}건</span></body></html>`;
}

/* 주문 상세 흉내(orderDetl.aspx) — 배송정보 dGrid 한 줄(송장·선불비) · 저장 = 그림 단추 전체 제출(cost 칸에 그리드 값이 실림) */
const 상세 = { 값: {}, 안먹음: false, 보냄: [], 열림: [], 늦음: 0, 막음: false, 끼어듦: [] };
function 상세쪽(주소) {
  const q = new URL(주소).searchParams, 번 = q.get('orderNo'), k = 번.slice(2, 3);
  const 값 = 상세.값[번] == null ? 15000 : 상세.값[번];
  return `<html><body><form id="aspnetForm" method="post"><input type="hidden" name="cost" id="cost" value="${값}"><input type="image" name="ctl00$Contents$btnSave" id="btnSave" alt="저장"></form>
<script>document.forms[0].action = location.href; var 값 = ${값}, 송 = '6000000000${k}';
window.$find = function (id) { if (id !== 'dGrid') return null; return { get_rows: function () { return { get_length: function () { return 1; }, get_row: function () { return { get_cellByColumnKey: function (c) {
  return c === 'invoiceNo' ? { get_value: function () { return 송; } } : { get_value: function () { return 값; }, set_value: function (v) { 값 = v; document.getElementById('cost').value = v; } }; } }; } }; } }; };
document.getElementById('btnSave').addEventListener('click', function (e) { getGridInfo(); });
document.getElementById('btnSave').addEventListener('click', function (e) { if (!document.getElementById('cost').value || ${상세.막음}) { e.preventDefault(); alert(${상세.막음} ? '막음 시험' : '빈 값'); } });</script></body></html>`;
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 재 = (참, 말) => { console.log((참 ? '  ✓ ' : '  ✗ ') + 말); 참 ? 초록++ : 빨강++; };
  async function 쪽열기(ctx) {
    const p = await ctx.newPage();
    const 보낸 = [], 쪽오류 = [], 밖 = [];
    p.on('pageerror', (e) => { if (!/getGridInfo/.test(String(e))) 쪽오류.push(String(e)); });   // getGridInfo 없음 = 진짜 벤더피아 상세 쪽 글 오류를 흉내에 그대로 둠
    await p.route('**/*', async (r) => {
      const q = r.request(), u = new URL(q.url());
      if (u.hostname === 'vivivic-cloud.github.io') {
        const 이름 = decodeURIComponent(u.pathname.split('/').pop());
        return r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: 이름 === '비요크.js' ? fs.readFileSync(path.join(확장, 이름)) : '' });
      }
      if (u.hostname !== 'vendorpia.com') {
        /* 상담 셈 읽기(익명 표·Firestore)는 CS등록과 같은 길 — 파일 값(이름·주문번호)이 실리면 안 된다 */
        const 실림 = q.url() + ' ' + (q.postData() || '');
        if (/googleapis\.com$/.test(u.hostname) && !/홍가짜|9000000000|가짜 협탁|가상몰/.test(decodeURIComponent(실림))) return r.abort();
        밖.push(q.method() + ' ' + u.hostname); return r.abort();
      }
      if (/orderDetl/i.test(u.pathname)) {
        const 번 = u.searchParams.get('orderNo');
        if (q.method() === 'POST') {
          const 값 = new URLSearchParams(q.postData() || '').get('cost');
          상세.보냄.push(번 + '=' + 값 + ' ' + ['sCd', 'sNm', 'sGoodsCd', 'vendorCd'].map((x) => u.searchParams.get(x)).join(','));
          if (!상세.안먹음) 상세.값[번] = Number(값);
          if (상세.늦음) await new Promise((ok) => setTimeout(ok, 상세.늦음));
        } else 상세.열림.push(번);
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 상세쪽(q.url()) });
      }
      if (q.method() !== 'GET' || !/orderMst/i.test(u.pathname)) 보낸.push(q.method() + ' ' + u.pathname + (q.method() === 'POST' ? ' ' + 폼값(q) : ''));
      if (상세.사이) 상세.끼어듦.push(q.method() + ' ' + u.pathname);
      if (q.method() === 'POST' && /orderMst/i.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 주문관리응답(폼값(q)) });
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<html><head><script>window.getServerCookie = function (c, k) { return c === "VP_Cookie" && k === "LOGON_EMP_VCD" ? (window.흉내업체 == null ? "12" : window.흉내업체) : ""; };</script></head><body><form id="aspnetForm" action="./orderMst.aspx"><input type="image" id="btnSearch" name="ctl00$Contents$btnSearch"><input name="ctl00$Contents$tbSOrderNo" value=""><input name="ctl00$Contents$ddlRowCnt" value="50"><input name="ctl00$Contents$dcStartDt" value="2026-10-25"><input name="ctl00$Contents$dcEndDt" value="2026-11-25"></form></body></html>' });
    });
    await p.goto('https://vendorpia.com/System/Sales/orderMst.aspx#vgByk');
    await p.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') + fs.readFileSync(path.join(확장, 'search.css'), 'utf8') });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8').replace(/^const VP_DATA/m, 'window.VP_DATA') + ';if(typeof VP_DATA!=="undefined")window.VP_DATA=VP_DATA' });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
    await p.waitForSelector('#vp-root .vp-비요크줄', { timeout: 20000 });
    return { p, 보낸, 쪽오류, 밖 };
  }
  const 판읽기 = (p) => p.evaluate(() => {
    const t = document.querySelector('#vp-root table.vp-촘촘');
    const 몸 = t ? [...t.tBodies[0].rows] : [];
    const cs = 몸[0] && getComputedStyle(몸[0].cells[2]);
    return { h1: document.querySelector('#vp-root h1')?.textContent, 줄: 몸.length,
      칠: 몸.map((tr) => getComputedStyle(tr.cells[3]).backgroundColor), 칠첫칸: 몸.map((tr) => getComputedStyle(tr.cells[0]).backgroundColor),
      고름: 몸.map((tr) => !!tr.cells[0].querySelector('input.vp-줄고름')), 머리고름: !!(t && t.tHead.rows[0].cells[0].querySelector('input.vp-다고름')),
      첫붙음: 몸[0] && getComputedStyle(몸[0].cells[0]).position === 'sticky' && getComputedStyle(몸[0].cells[1]).position !== 'sticky' && t.tHead.rows[0].cells[0].classList.contains('vp-first') && !t.tHead.rows[0].cells[1].classList.contains('vp-first'),
      메모: document.querySelector('#vp-root .vp-비요크메모')?.textContent, 셈: document.querySelector('#vp-root .vp-비요크셈')?.textContent,
      파일: document.querySelector('#vp-root .vp-비요크파일')?.textContent, 알림: document.querySelector('#vp-root .vp-note')?.textContent, 상태: (() => { const e = document.querySelector('#vp-root .vp-비요크상태'); return e && !e.hidden ? e.textContent : ''; })(), 상태꼴: document.querySelector('#vp-root .vp-비요크상태')?.className,
      선불: 몸.map((tr) => tr.cells[22].textContent), 글: cs && cs.fontSize, 높이: 몸[0] && 몸[0].getBoundingClientRect().height,
      손: t ? t.querySelectorAll('.vp-열손').length : 0, th: t && [...t.tHead.rows[0].cells].slice(1).map((c) => c.firstChild.textContent), 검색창숨김: getComputedStyle(document.querySelector('#vp-root .vp-bar')).display === 'none',
      쪽가로: document.documentElement.scrollWidth > innerWidth + 1, 기억: !!localStorage.getItem('vp비요크'), 상품칸: document.querySelectorAll('#vp-root td.vp-상품칸').length,
      줄누름: 몸.filter((tr) => tr.classList.contains('vp-줄상담')).length, 지우기넓이: document.querySelector('#vp-root .vp-지우기')?.getBoundingClientRect().width };
  });

  for (const 너비 of [1280, 375]) {
    console.log('\n■ ' + 너비);
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    const { p, 보낸, 쪽오류, 밖 } = await 쪽열기(ctx);
    재((await 판읽기(p)).h1 === '비요크선불비변경', '제목 「비요크선불비변경」');
    await p.setInputFiles('#vp-root .vp-비요크줄 input[type=file]', { name: '가짜.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: 가짜파일() });
    await p.waitForFunction(() => document.querySelectorAll('#vp-root table.vp-촘촘 tbody tr').length > 0, null, { timeout: 15000 });
    let 판 = await 판읽기(p);
    재(판.검색창숨김, '주문관리 검색창은 숨김');
    재(JSON.stringify(판.th) === JSON.stringify(머리.map((h) => h.trim())), '칸 = 파일 칸 그대로 39칸(선불비·선불 수정 포함): ' + (판.th || []).length);
    재(판.줄 === 5, '줄 = 글 있는 줄 5(꼴만 있는 빈 줄 뺌): ' + 판.줄);
    재(판.머리고름 && 판.고름.every(Boolean) && 판.th[0] === 'CS', 'CS 앞 고름 칸(머리·줄마다 체크상자)');
    재(판.첫붙음, '고름 칸이 붙박이 첫 칸(CS 칸은 안 붙음)');
    await p.waitForFunction(() => /연결\s*2/.test(document.querySelector('#vp-root .vp-비요크셈').textContent) && !/확인/.test(document.querySelector('#vp-root .vp-비요크셈').textContent), null, { timeout: 15000 }).catch(() => {});
    판 = await 판읽기(p);
    const 노랑 = 'rgb(255, 243, 191)', 흰 = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'rgb(255, 255, 255)';
    재(판.칠[0] === 노랑 && 판.칠[1] === 노랑 && 판.칠.slice(2).every(흰), '송장 같은 줄 2 = 노랑 · 나머지(송장 다름·줄 없음·송장 빔·파일 색 칠한 줄도) = 흰: ' + 판.칠.join(' / '));
    재(판.칠첫칸[0] === 노랑 && 흰(판.칠첫칸[2]), '붙박이 고름 칸도 같은 색: ' + 판.칠첫칸.join(' / '));
    재(/줄\s*5/.test(판.셈) && /연결\s*2/.test(판.셈) && !/칠한/.test(판.셈), '셈 = 줄 5 · 연결 2: ' + 판.셈);
    const 물은 = 보낸.filter((x) => x.startsWith('POST'));
    재(물은.length === 4 && 물은.every((x) => /dcStartDt=2026-11-13 ddlRowCnt=50 단추=1$/.test(x)), '주문관리 조회 4번(주문번호마다, 송장 빈 줄은 안 물음, 등록일 = 가장 이른 주문등록일 − 7일, 쓰기 단추 없음): ' + 물은.length);
    /* 고름: 머리 = 전체 체크·해제, 줄 하나 풀면 머리는 반쯤 */
    const 고름셈 = () => p.evaluate(() => ({ 켬: document.querySelectorAll('#vp-root input.vp-줄고름:checked').length, 다: document.querySelector('#vp-root input.vp-다고름').checked, 반: document.querySelector('#vp-root input.vp-다고름').indeterminate, 상담: !!document.querySelector('.vp-상담판') }));
    await p.click('#vp-root input.vp-다고름');
    const ㄱ = await 고름셈();
    await p.click('#vp-root tbody tr:nth-child(2) td.vp-고름칸');
    const ㄴ = await 고름셈();
    await p.click('#vp-root input.vp-다고름');
    const ㄷ = await 고름셈();
    await p.click('#vp-root input.vp-다고름');
    const ㄹ = await 고름셈();
    재(ㄱ.켬 === 5 && ㄱ.다 && ㄴ.켬 === 4 && ㄴ.반 && !ㄴ.상담 && ㄷ.켬 === 5 && ㄹ.켬 === 0 && !ㄹ.다, '전체 체크 5 → 줄 하나 풂 4(머리 반쯤·상담 안 뜸) → 전체 5 → 전체 해제 0');
    /* 이은 줄 누름 = 이은 주문관리 줄로 상담 판 */
    await p.click('#vp-root tbody tr:nth-child(1) td:nth-child(5)');
    await p.waitForSelector('.vp-상담판', { timeout: 5000 }).catch(() => {});
    const 상담 = await p.evaluate(() => { const d = document.querySelector('.vp-상담판'); return d ? d.querySelector('.vp-상담머리').textContent + ' | ' + d.querySelector('.vp-고객정보').textContent : ''; });
    재(/주문관리 협탁 0/.test(상담) && /주문관리수취인0/.test(상담), '이은 줄 누름 = 이은 주문관리 주문의 상담 판(상품명·고객정보 = 주문관리 줄)');
    await p.keyboard.press('Escape');
    /* ── [비요크선불저장] 체크 줄 선불비 저장 ── 흉내 상세: 7701(줄0) = 5000(같음) · 7711(줄1) = 15000 */
    Object.assign(상세, { 값: { 7701: 5000 }, 안먹음: false, 보냄: [], 열림: [] });
    const 저장셈 = () => p.evaluate(() => document.querySelector('#vp-root .vp-비요크셈').textContent);
    const 저장끝 = () => p.waitForFunction(() => !document.querySelector('#vp-root .vp-선불저장').disabled, null, { timeout: 30000 });
    const 체크 = (ks) => p.evaluate((ks) => { const 줄 = [...document.querySelectorAll('#vp-root tbody tr')]; 줄.forEach((tr, k) => { const c = tr.querySelector('input.vp-줄고름'); if (c.checked !== ks.includes(k)) c.click(); }); }, ks);
    await 체크([]);
    재(await p.evaluate(() => document.querySelector('#vp-root .vp-비요크상태').hidden), '누르기 전 현황 칸 = 숨음(빈 칸 안 보임)');
    await p.click('#vp-root .vp-선불저장');
    { const 판 = await 판읽기(p);
      재(/체크해 주세요/.test(판.상태) && /vp-탈/.test(판.상태꼴) && !상세.보냄.length && !상세.열림.length, '체크 없이 저장 = 단추 밑 붉은 현황 글 · 벤더피아 0: ' + 판.상태);
      const 자리 = await p.evaluate(() => { const a = document.querySelector('#vp-root .vp-선불저장').getBoundingClientRect(), b = document.querySelector('#vp-root .vp-비요크상태').getBoundingClientRect(); return b.top - a.bottom; });
      재(자리 >= 0 && 자리 < 30, '현황 글 = 저장 단추 바로 밑: ' + Math.round(자리) + 'px'); }
    await 체크([0, 1, 2]);
    p.once('dialog', (d) => setTimeout(() => d.dismiss(), 150));   // 사람처럼 잠깐 뒤 「취소」(바로 돌아오면 「막힘」 으로 본다)
    await p.click('#vp-root .vp-선불저장');
    await p.waitForTimeout(300);
    재(!상세.보냄.length && !상세.열림.length && /취소/.test((await 판읽기(p)).상태), '확인 창 「취소」 = 벤더피아 0 · 「저장 안 함(취소)」 보임: ' + (await 판읽기(p)).상태);
    /* 하는 동안 = 「저장 중 k/n · m번째 줄 · 지금 단계」 + 그 줄 테두리 */
    const 본상태 = [];
    const 엿보기 = setInterval(() => p.evaluate(() => { const e = document.querySelector('#vp-root .vp-비요크상태'); return [e.textContent, document.querySelectorAll('#vp-root tr.vp-저장중줄').length, e.className]; }).then((x) => 본상태.push(x)).catch(() => {}), 40);
    let 창글 = '';
    p.once('dialog', (d) => { 창글 = d.message(); d.accept(); });
    await p.click('#vp-root .vp-선불저장');
    await 저장끝();
    clearInterval(엿보기);
    let 셈글 = await 저장셈();
    재(본상태.some(([t, n, c]) => /저장 중\s*1\/2/.test(t) && /번째 줄/.test(t) && /(찾는|여는|확인|누름)/.test(t) && n === 1 && /vp-하는중/.test(c)) && 본상태.some(([t]) => /저장 중\s*2\/2/.test(t)), '하는 동안 = 저장 중 1/2 → 2/2 · 몇 번째 줄 · 단계 · 그 줄 테두리: ' + [...new Set(본상태.map((x) => x[0]))].slice(0, 4).join(' | '));
    const 끝상태 = (await 판읽기(p)).상태;
    재(/저장 끝/.test(끝상태) && /저장됨\s*1/.test(끝상태) && /이미 같음\s*1/.test(끝상태) && /실패\s*0/.test(끝상태) && !(await p.evaluate(() => document.querySelectorAll('#vp-root tr.vp-저장중줄').length)), '끝 현황 = 저장됨 1 · 이미 같음 1 · 실패 0 · 테두리 걷힘: ' + 끝상태);
    재(/2줄/.test(창글) && /1줄은 뺍니다/.test(창글), '확인 창 = 저장할 2줄 · 연결 안 된 1줄 뺌');
    재(/저장\s*1\/2/.test(셈글) && /같음\s*1/.test(셈글) && !/실패/.test(셈글), '셈 = 저장 1/2 · 같음 1: ' + 셈글);
    재(상세.보냄.length === 1 && /^7711=5000 55,가상몰,GAZZA1,12$/.test(상세.보냄[0]), '상세 저장 제출 1번(같은 줄은 안 누름) · 금액 5000 · 여는 값 다섯(안 번호·매출처코드·매출처·상품코드·vendorCd): ' + 상세.보냄.join(' | '));
    재(상세.값[7711] === 5000, '흉내 벤더피아 선불비 = 5000');
    재(await p.evaluate(() => [...document.querySelectorAll('#vp-root tbody tr')].map((tr) => tr.querySelector('input.vp-줄고름').checked).join()) === 'false,false,true,false,false', '저장된 줄은 체크 풀림(뺀 줄은 그대로)');
    재(!(await p.evaluate(() => document.querySelectorAll('iframe').length)), '숨은 틀 지움');
    const 연두 = 'rgb(221, 243, 192)';
    let 색들 = (await 판읽기(p)).칠;
    재(색들[0] === 연두 && 색들[1] === 연두 && 색들[2] !== 연두 && (await 판읽기(p)).칠첫칸[1] === 연두, '완료 확인된 줄(저장됨·이미 같음) = 연두 · 고름 칸까지 · 뺀 줄은 아님: ' + 색들.slice(0, 3).join(' / '));
    /* 실패하면 멈춤: 줄0 = 9000 인데 저장이 안 먹음 → 줄1 은 안 함 */
    Object.assign(상세, { 값: { 7701: 9000, 7711: 15000 }, 안먹음: true, 보냄: [], 열림: [] });
    await 체크([0, 1]);
    p.once('dialog', (d) => d.accept());
    await p.click('#vp-root .vp-선불저장');
    await 저장끝();
    셈글 = await 저장셈();
    const 멈춘글 = (await 판읽기(p)).상태;
    재(/실패\s*1/.test(멈춘글) && /안 함\s*1/.test(멈춘글) && /vp-탈/.test((await 판읽기(p)).상태꼴), '멈춘 현황 = 실패 1 · 안 함 1 · 붉게: ' + 멈춘글);
    재(/실패\s*1/.test(셈글) && /1번째 줄/.test(멈춘글) && /9,000/.test(멈춘글) && /멈췄/.test(멈춘글), '저장 뒤 값이 그대로면 실패 · 까닭 · 멈춤: ' + 멈춘글);
    재(상세.보냄.length === 1 && 상세.열림.every((x) => x === '7701'), '실패한 뒤 줄(줄1)은 안 열고 안 보냄');
    색들 = (await 판읽기(p)).칠;
    재(색들[0] === 노랑 && 색들[1] === 연두, '실패한 줄은 연두 풀림(노랑) · 앞서 완료된 줄은 연두 그대로');
    상세.안먹음 = false;
    /* [비요크저장실패] 업체코드(vendorCd)를 못 읽으면 = 빈 값 이름을 보이고 상세 안 엶 */
    Object.assign(상세, { 값: { 7711: 15000 }, 보냄: [], 열림: [] });
    await p.evaluate(() => { window.흉내업체 = ""; });
    await 체크([1]);
    p.once('dialog', (d) => d.accept());
    await p.click('#vp-root .vp-선불저장');
    await 저장끝();
    const 빈값글 = (await 판읽기(p)).상태;
    재(/빈 값: 업체코드/.test(빈값글) && !/주문번호|매출처코드|상품코드/.test(빈값글.replace(/.*빈 값:/, '')) && !상세.열림.length && !상세.보냄.length, '여는 값이 비면 = 어느 값이 비었는지 보임 · 상세 안 엶: ' + 빈값글);
    await p.evaluate(() => { window.흉내업체 = null; });
    /* [비요크저장안됨] 답이 4초보다 늦어도(6초) 기다려 저장됨 · 그동안 「…초」 보임 · 우리 다른 요청은 안 끼어듦 */
    Object.assign(상세, { 값: { 7711: 15000 }, 보냄: [], 열림: [], 늦음: 6000, 끼어듦: [] });
    await 체크([1]);
    const 늦은상태 = [];
    const 엿보기2 = setInterval(() => p.evaluate(() => document.querySelector('#vp-root .vp-비요크상태').textContent).then((x) => 늦은상태.push(x)).catch(() => {}), 200);
    p.once('dialog', (d) => d.accept());
    await p.click('#vp-root .vp-선불저장');
    await p.waitForFunction(() => /저장 보냄/.test(document.querySelector('#vp-root .vp-비요크상태').textContent), null, { timeout: 10000 }).catch(() => {});
    상세.사이 = true;
    await p.evaluate(() => { window.__끼움 = VP_DATA.받기('/System/Sales/orderMst.aspx?끼움=1', { method: 'GET' }, '사람').then(() => Date.now()); });
    await 저장끝();
    상세.사이 = false;
    clearInterval(엿보기2);
    재(/저장됨\s*1/.test((await 판읽기(p)).상태) && 상세.값[7711] === 5000, '답 6초 = 기다려 저장됨: ' + (await 판읽기(p)).상태);
    재(늦은상태.some((x) => /답 기다리는 중\s*[3-9]초/.test(x)), '기다리는 동안 초 보임: ' + [...new Set(늦은상태)].filter((x) => /초/.test(x)).slice(-1)[0]);
    재(상세.끼어듦.length === 1 && 상세.열림.length === 2, '저장 하는 동안 우리 다른 요청은 기다림(끝난 뒤 1번) · 저장 뒤 상세 다시 엶: 끼어듦 ' + 상세.끼어듦.length + ' 열림 ' + 상세.열림.length);
    /* 쪽 검사가 막으면 = 「저장을 보내지 않았습니다」 + 알림 · 보냄 0 · 멈춤 */
    Object.assign(상세, { 값: { 7711: 15000 }, 보냄: [], 열림: [], 늦음: 0, 막음: true });
    await 체크([1]);
    p.once('dialog', (d) => d.accept());
    await p.click('#vp-root .vp-선불저장');
    await 저장끝();
    const 막은글 = (await 판읽기(p)).상태;
    재(/보내지 않았습니다/.test(막은글) && /막음 시험/.test(막은글) && !/getGridInfo/.test(막은글) && !상세.보냄.length, '쪽 검사가 막음 = 단계·알림 보임 · 제출 0: ' + 막은글);
    상세.막음 = false;
    Object.assign(상세, { 값: { 7711: 15000 }, 보냄: [], 열림: [] });
    p.once('dialog', (d) => d.accept());   // 업체코드가 돌아오면 같은 줄이 다시 저장됨(연두 되돌림 — 뒤 「다시 열기」 검사 그대로)
    await p.click('#vp-root .vp-선불저장');
    await 저장끝();
    재(/저장됨\s*1/.test((await 판읽기(p)).상태) && 상세.보냄.length === 1, '값이 돌아오면 같은 줄 저장됨: ' + (await 판읽기(p)).상태);
    await 체크([]);
    재(판.메모 && 판.메모.includes('가짜 메모 3건/ 37000원') && 판.메모.includes('62000>25000'), '맨 위 메모 글 보임');
    재(/선불비\s*62,000/.test(판.셈) && /선불 수정\s*25,000/.test(판.셈), '셈 합: ' + 판.셈);
    재(JSON.stringify(판.선불) === JSON.stringify(['15000', '10000', '12000', '15000', '10000']), '숫자 「15000.0」 → 15000: ' + 판.선불.join(','));
    재(판.글 === '11px' && Math.round(판.높이) === 25, '꼴 11px · 줄 25px: ' + 판.글 + ' ' + 판.높이);
    재(판.손 === 40, '열 끌기 손잡이 40(고름 칸 + 39): ' + 판.손);
    재(판.상품칸 === 5, '상품명 칸 = 이름 단추 자리 5: ' + 판.상품칸);
    재(판.줄누름 === 5, '줄 누름(상담) 5: ' + 판.줄누름);
    재(!판.쪽가로, '쪽 전체 가로 스크롤 없음');
    재(판.지우기넓이 > 0 && 판.지우기넓이 < 100, '「지우기」 단추 = 작은 단추(쪽 너비로 안 늘어남): ' + Math.round(판.지우기넓이));
    재(판.기억 && 판.파일.startsWith('가짜.xlsx'), '브라우저 안에 기억 · 파일 이름: ' + 판.파일);
    /* 다시 열기 → 기억으로 그대로 */
    const { p: p2, 보낸: 보낸2, 쪽오류: 오류2 } = await 쪽열기(ctx);
    await p2.waitForFunction(() => document.querySelectorAll('#vp-root table.vp-촘촘 tbody tr').length > 0, null, { timeout: 15000 });
    const 판2 = await 판읽기(p2);
    await p2.waitForFunction(() => !/확인/.test(document.querySelector('#vp-root .vp-비요크셈').textContent), null, { timeout: 15000 }).catch(() => {});
    const 판2b = await 판읽기(p2);
    const 물은2 = 보낸2.filter((x) => x.startsWith('POST'));
    재(판2b.줄 === 5 && 판2b.칠[0] === 'rgb(255, 243, 191)' && 판2b.칠[1] === 'rgb(221, 243, 192)' && /연결\s*2/.test(판2b.셈) && 판2.메모.includes('가짜 메모'), '다시 열어도 그대로(줄 5·노랑 1·연두 1(완료 기억)·메모): ' + 판2b.칠.slice(0, 2).join(' / '));
    재(물은2.length === 2 && !물은2.some((x) => /900000000[01] /.test(x)), '다시 열 때 = 기억한 이음은 안 묻고 못 이은 줄만 2번: ' + 물은2.length);
    await p2.click('#vp-root .vp-지우기');
    const 판3 = await 판읽기(p2);
    재(!판3.기억 && 판3.줄 === 0 && !판3.셈 && !판3.메모, '지우기 = 기억·표·메모·셈 지움');
    /* 엉뚱한 파일 */
    await p2.setInputFiles('#vp-root .vp-비요크줄 input[type=file]', { name: '깨짐.xlsx', mimeType: 'application/octet-stream', buffer: Buffer.from('아님') });
    await p2.waitForFunction(() => /읽지 못/.test(document.querySelector('#vp-root .vp-note').textContent), null, { timeout: 5000 }).catch(() => {});
    재(/읽지 못/.test((await 판읽기(p2)).알림), '깨진 파일 = 알림 한 줄');
    재([...보낸, ...보낸2].every((x) => x.startsWith('GET') || (/^POST \/System\/Sales\/orderMst\.aspx tbSOrderNo=9/.test(x) && !/쓰기단추/.test(x))), '주문관리 = 조회만(쓰기 단추 0) · 쓰기는 「저장」 누른 상세 저장뿐');
    재(!밖.length, '파일 값이 밖으로 안 나감(구글 익명 표 길에도 안 실림) ' + 밖.join(','));
    재(!쪽오류.length && !오류2.length, '쪽 오류 없음 ' + [...쪽오류, ...오류2].join(' | '));
    await ctx.close();
  }
  if (process.env.VP_REAL) {
    console.log('\n■ 진짜 파일(숫자만)');
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const { p } = await 쪽열기(ctx);
    await p.setInputFiles('#vp-root .vp-비요크줄 input[type=file]', process.env.VP_REAL);
    await p.waitForFunction(() => document.querySelectorAll('#vp-root table.vp-촘촘 tbody tr').length > 0, null, { timeout: 15000 });
    const 판 = await 판읽기(p);
    console.log('  칸 ' + 판.th.length + ' · 줄 ' + 판.줄 + ' · 칠 ' + [...new Set(판.칠)].join(',') + ' · 셈 「' + 판.셈 + '」 · 메모 칸 ' + (await p.evaluate(() => document.querySelectorAll('#vp-root .vp-비요크메모 span').length)));
    await ctx.close();
  }
  await b.close();
  console.log(`\n★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
