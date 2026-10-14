/* 배송관리 표가 **가로로 다 보이는가** 를 재는 자.
   사장님 10-14 (배송관리 화면에서 짚어 보내신 말씀, 그대로): 「가로스크롤로 모든 정보 다 보이게 해줘」

   ⚠ 여기 쓰는 자료는 **전부 가짜**다. 진짜 수취인·전화·주소는 한 글자도 쓰지 않는다.
     (vivivic-apps 는 누구나 보는 공개 저장소다.)
   ⚠ 진짜 vendorpia.com 은 이 상자에서 못 본다 — `search.js` 가 만드는 **표 꼴 그대로**만 세워 잰다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const COLUMNS = ["주문번호", "상품명", "수취인", "휴대전화", "주소", "배송사", "송장번호", "상태"];
/* 가짜 줄 — 길이만 진짜와 비슷하게 맞춘다 */
const 가짜 = (i) => [
  "20261014-" + String(100000 + i),
  /* 긴 상품명 — 실제 가구 상품명은 이만큼 길다 (옵션·치수가 붙는다) */
  "가나다라 와이드 3단 서랍장 (화이트/오크) 1200x450x700 +전도방지 포함 / 조립배송",
  "가나다",
  "010-0000-0000",
  /* 긴 주소 — 도로명 + 상세주소 */
  "경기도 ○○시 ○○구 ○○대로123번길 45-6, ○○아파트 101동 1001호 (○○동)",
  "○○택배",
  String(640000000000 + i),
  "배송완료",
];

const 종이 = (css, 줄수) => `<!doctype html><html class="vp-clean"><head><meta charset="utf-8">
<style>
html.vp-clean, html.vp-clean body { margin:0 !important; background:#fff !important; }
#vp-root { --ink:#37352f; --muted:#787774; --fill:#f1f1ef; --line:#e3e2e0;
  color:var(--ink); font-family:Inter,-apple-system,"Apple SD Gothic Neo",sans-serif; box-sizing:border-box; }
#vp-root * { box-sizing:border-box; }
#vp-root h1 { font-size:26px; font-weight:900; margin:0 0 24px; }
#vp-root input { display:block; width:100%; padding:14px 16px; margin:0 0 10px;
  border:1px solid var(--line); border-radius:12px; background:var(--fill); font-size:15px; }
#vp-root button { width:100%; padding:14px; border:0; border-radius:12px; background:var(--ink);
  color:#fff; font-size:15px; font-weight:800; }
#vp-root .vp-home { display:inline-block; margin-bottom:12px; padding:6px 12px; border-radius:999px;
  background:var(--fill); color:var(--muted); font-size:13px; font-weight:600; text-decoration:none; }
${css}
</style></head><body>
<div id="vp-root" class="vp-wide"><div class="vp-search">
  <a class="vp-home" href="/index.aspx">← 메인</a>
  <h1>배송관리</h1>
  <form class="vp-bar">
    <input type="date" name="from" value="2026-07-14"><span>~</span>
    <input type="date" name="to" value="2026-10-14">
    <input name="q" class="vp-q" placeholder="송장번호, 주문번호, 이름, 상품명, 주소, 전화번호, 배송상태…">
    <button type="submit">조회</button>
  </form>
  <div class="vp-note">600건 · 결과가 많아 일부만 받아왔습니다. 기간을 좁혀 보세요.</div>
  <div class="vp-table"><table>
    <thead><tr>${COLUMNS.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${Array.from({length:줄수},(_,i)=>`<tr>${가짜(i).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
</div></div></body></html>`;

/* 한 칸이 **온전히** 보이는가 — 칸 상자가 보이는 자리 안에 다 들어오고, 글이 안 잘렸나 */
const 재기 = () => {
  const 통 = document.querySelector('.vp-table');
  const t = 통.querySelector('table');
  const tr = 통.querySelector('tbody tr');
  const 통상자 = 통.getBoundingClientRect();
  const 칸들 = [...통.querySelectorAll('thead th')].map((th, i) => {
    const td = tr.children[i];
    const r = th.getBoundingClientRect();
    const 보임 = r.left >= 통상자.left - 0.5 && r.right <= 통상자.right + 0.5;
    /* 글이 상자보다 넓으면 줄바꿈되거나 잘린 것 */
    const 넘침 = td.scrollWidth > td.clientWidth + 1;
    /* 한 줄인지 — 글 상자(scrollWidth)가 칸보다 넓으면 줄이 접힌 것이다 */
    const cs = getComputedStyle(td);
    const 한줄높이 = parseFloat(cs.lineHeight) || Math.round(parseFloat(cs.fontSize) * 1.5);
    const 속높이 = td.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const 줄수 = Math.max(1, Math.round(속높이 / 한줄높이));
    return { 이름: th.textContent, 보임, 넘침, 줄수, 너비: Math.round(r.width) };
  });
  return {
    창: [innerWidth, innerHeight],
    통너비: Math.round(통상자.width),
    표너비: Math.round(t.getBoundingClientRect().width),
    줄높이: Math.round(tr.getBoundingClientRect().height),
    밀수있나: 통.scrollWidth > 통.clientWidth + 1,
    밀수있는양: 통.scrollWidth - 통.clientWidth,
    칸들,
  };
};
/* 머리줄이 세로로 밀어도 붙어 있나 · 밀대(스크롤바)가 자리를 차지하나 */
const 머리붙나 = () => {
  const 통 = document.querySelector('.vp-table');
  const th = 통.querySelector('thead th');
  const 전 = th.getBoundingClientRect().top;
  통.scrollTop = 400;
  const 후 = th.getBoundingClientRect().top;
  const 통위 = 통.getBoundingClientRect().top;
  const r = 통.scrollTop;
  통.scrollTop = 0;
  return { 세로로밀렸나: r > 0, 머리줄자리_전: Math.round(전), 머리줄자리_후: Math.round(후),
           통맨위: Math.round(통위), 붙어있나: r > 0 ? Math.abs(후 - 통위) < 2 : '세로로 안 밀려 못 쟀다',
           밀대높이: 통.offsetHeight - 통.clientHeight };
};
/* 끝까지 민 뒤 마지막 칸이 보이나 */
const 끝까지 = () => {
  const 통 = document.querySelector('.vp-table');
  통.scrollLeft = 통.scrollWidth;
  const 통상자 = 통.getBoundingClientRect();
  const ths = [...통.querySelectorAll('thead th')];
  const 끝 = ths[ths.length - 1].getBoundingClientRect();
  return { 마지막칸: ths[ths.length-1].textContent,
           보이나: 끝.left >= 통상자.left - 0.5 && 끝.right <= 통상자.right + 0.5,
           민거리: Math.round(통.scrollLeft) };
};

(async () => {
  const 어느 = process.argv[2] === '뒤' ? '뒤' : '전';
  const css = fs.readFileSync(path.join(확장, 'search.css'), 'utf8');
  const b = await chromium.launch({ executablePath: EXE, args: ['--disable-features=OverlayScrollbar'] });
  console.log('\n■ 배송관리 표 가로 재기 (' + (어느 === '전' ? '고치기 전' : '고친 뒤') + ') · 칸 ' + COLUMNS.length + '개');
  console.log('  ⚠ 자료는 전부 가짜. 진짜 수취인·전화·주소는 안 쓴다.');
  for (const [w, h] of [[1920,1000],[1440,900],[1280,860],[1024,800],[820,1100],[390,844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.setContent(종이(css, 25), { waitUntil: 'load' });
    await page.waitForTimeout(120);
    const v = await page.evaluate(재기);
    const 끝 = await page.evaluate(끝까지);
    const 머리 = await page.evaluate(머리붙나);
    const 안보임 = v.칸들.filter(c => !c.보임).map(c => c.이름);
    const 잘림 = v.칸들.filter(c => c.넘침).map(c => c.이름);
    const 여러줄 = v.칸들.filter(c => c.줄수 > 1).map(c => c.이름 + '(' + c.줄수 + '줄)');
    console.log('\n  창 ' + w + '×' + h + '  표너비 ' + v.표너비 + ' / 통 ' + v.통너비
      + '  밀수있나 ' + (v.밀수있나 ? '예(' + v.밀수있는양 + 'px)' : '**아니오**')
      + '  한 줄 높이 ' + v.줄높이 + 'px');
    console.log('    한눈에 안 보이는 칸: ' + (안보임.length ? 안보임.length + '개 — ' + 안보임.join(', ') : '없음'));
    console.log('    글이 넘쳐 잘린 칸  : ' + (잘림.length ? 잘림.join(', ') : '없음'));
    console.log('    여러 줄로 쪼개진 칸: ' + (여러줄.length ? 여러줄.join(', ') : '없음'));
    console.log('    끝까지 밀면 마지막 칸「' + 끝.마지막칸 + '」: ' + (끝.보이나 ? '보인다 ✓' : '**안 보인다 ✗**')
      + ' (민 거리 ' + 끝.민거리 + 'px)');
    console.log('    머리줄: 세로로 밀리나 ' + (머리.세로로밀렸나 ? '예' : '아니오(줄이 적다)')
      + ' · 붙어있나 ' + 머리.붙어있나 + ' (통 맨위 ' + 머리.통맨위 + ', 민 뒤 머리줄 ' + 머리.머리줄자리_후 + ')'
      + ' · 밀대 자리 ' + 머리.밀대높이 + 'px');
    await ctx.close();
  }
  await b.close();
})();
