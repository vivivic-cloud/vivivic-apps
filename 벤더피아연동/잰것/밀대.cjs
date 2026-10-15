/* ② **가로 밀대(스크롤바)를 두껍고 진하게** 한 것을 재는 자.
   사장님 10-15: 「가로 스크롤 높이 두께가 얇아 사용감이 떨어 집니다 스크롤색상도 좀
   진하게 하고 사이즈도 변경하여 사용감을 높여주세요」 (장부 a1792027852)

   ⚠⚠ **두께(px)는 이 상자에서 못 잰다.** 여기 크로미움은 밀대를 **겹쳐 그려**(overlay)
     자리를 아예 안 차지한다 — 꾸민 것도 맨 것도 0px 로 나온다.
     깃발 넷을 다 재 봤다: 없음 · `--disable-features=OverlayScrollbar` ·
     `…,FluentOverlayScrollbar` · `--enable-features=ScrollbarsWithoutOverlay` → **모두 0px**.
     사장님 크롬(윈도우/맥)은 자리를 차지하는 밀대라 거기서만 두께가 보인다.
   그래서 **잴 수 있는 것만** 잰다 —
     ㄱ) `search.css` 에 **적힌** 값
     ㄴ) 브라우저가 그 규칙을 **받아들였나**(styleSheets 에 남았나 — 오타면 사라진다)
     ㄷ) `scrollbar-color` 의 **셈해진 값**(이건 진짜로 읽힌다)
     ㄹ) 표가 그대로 **밀리나**, 첫 칸이 붙어 있나 (안 깨졌나)
   ⚠ 자료는 전부 가짜. 진짜 수취인·전화·주소는 한 글자도 쓰지 않는다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const COLUMNS = ["주문번호","주문일","상품명","단품명","단품코드","수량","수취인","휴대전화","전화","주소",
  "배송사","송장번호","배송상태","송장전송","매출처","매출처코드","주문자","결제금액","배송비","메모",
  "출고일","도착일","비고"];
const 가짜 = (i) => COLUMNS.map((c, j) => j === 2
  ? "가나다라 와이드 3단 서랍장 (화이트/오크) 1200x450x700 +전도방지 포함"
  : j === 9 ? "경기도 ○○시 ○○구 ○○대로123번길 45-6, ○○아파트 101동 1001호"
  : c + "-" + i + "-" + j);
const 종이 = (css, 줄수) => `<!doctype html><html class="vp-clean"><head><meta charset="utf-8"><style>
html.vp-clean, html.vp-clean body { margin:0 !important; background:#fff !important; }
#vp-root { --ink:#37352f; --muted:#787774; --fill:#f1f1ef; --line:#e3e2e0;
  color:var(--ink); font-family:Inter,sans-serif; box-sizing:border-box; }
#vp-root * { box-sizing:border-box; }
${css}
</style></head><body><div id="vp-root" class="vp-wide"><div class="vp-search"><h1>배송관리</h1>
<div class="vp-table"><table>
<thead><tr>${COLUMNS.map((c,i)=>`<th${i===0?' class="vp-first"':''}>${c}</th>`).join('')}</tr></thead>
<tbody>${Array.from({length:줄수},(_,i)=>`<tr>${가짜(i).map((v,j)=>`<td${j===0?' class="vp-first"':''}>${v}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div></div></div></body></html>`;

/* ㄴ) 브라우저가 밀대 규칙을 받아들였나 — 오타가 있으면 styleSheets 에서 사라진다 */
const 규칙확인 = () => {
  const 모음 = [];
  for (const ss of document.styleSheets) {
    let rules; try { rules = ss.cssRules; } catch (e) { continue; }
    for (const r of rules) if (r.selectorText && /-webkit-scrollbar/.test(r.selectorText))
      모음.push(r.selectorText.replace(/#vp-root \.vp-table/g, '…') + ' { ' + r.style.cssText + ' }');
  }
  const 통 = document.querySelector('.vp-table');
  통.scrollLeft = 0;
  const 첫칸전 = Math.round(통.querySelector('tbody td').getBoundingClientRect().left);
  통.scrollLeft = 99999;
  const 민거리 = Math.round(통.scrollLeft);
  const 첫칸후 = Math.round(통.querySelector('tbody td').getBoundingClientRect().left);
  const ths = [...통.querySelectorAll('thead th')];
  const 상자 = 통.getBoundingClientRect();
  const 끝 = ths[ths.length - 1].getBoundingClientRect();
  통.scrollLeft = 0;
  return { 규칙들: 모음, 셈한색: getComputedStyle(통).scrollbarColor,
    셈한너비: getComputedStyle(통).scrollbarWidth,
    밀수있는양: 통.scrollWidth - 통.clientWidth, 민거리,
    첫칸전, 첫칸후, 마지막칸: ths[ths.length-1].textContent,
    마지막칸보이나: 끝.left >= 상자.left - 0.5 && 끝.right <= 상자.right + 0.5,
    차지한자리_가로: 통.offsetHeight - 통.clientHeight };
};

(async () => {
  const css = fs.readFileSync(path.join(확장, 'search.css'), 'utf8');
  /* 밀대 토막만 떼어 내서 그 안에서만 찾는다 — 파일 딴 곳의 min-width 에 안 속게 */
  const 토막 = (이름) => {
    const m = css.match(new RegExp('::-webkit-scrollbar' + 이름 + '\\s*\\{([^}]*)\\}'));
    return m ? m[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim() : '(없다)';
  };
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ ② 가로 밀대 — 두껍고 진하게 · 칸 ' + COLUMNS.length + '개');
  console.log('  ⚠ 자료는 전부 가짜. ⚠ **두께(px)는 이 상자에서 못 잰다**(겹쳐 그리는 밀대).');
  console.log('\n  search.css 에 **적힌** 값');
  for (const [이름, 꼬리] of [['밀대 통', ''], ['길', '-track'], ['밀대', '-thumb'],
                              ['손 올림', '-thumb:hover'], ['누름', '-thumb:active']])
    console.log('    ' + 이름.padEnd(8) + ': ' + 토막(꼬리.replace(/[:]/g, '\\:')));

  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  for (const [w, h] of [[1920,1000],[1280,860],[390,844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.setContent(종이(css, 30));
    await page.waitForTimeout(150);
    const 것 = await page.evaluate(규칙확인);
    console.log('\n  ' + w + '×' + h);
    if (w === 1920) {
      console.log('    브라우저가 받아들인 밀대 규칙 **' + 것.규칙들.length + '개** ' + 못(것.규칙들.length >= 6));
      for (const r of 것.규칙들) console.log('      ' + r);
    }
    console.log('    셈한 scrollbar-color **' + 것.셈한색 + '** ' + 못(/111, 109, 102/.test(것.셈한색))
      + ' (진하게 — 옛 것은 rgb(196, 195, 191))');
    console.log('    셈한 scrollbar-width ' + 것.셈한너비 + ' · 이 상자에서 차지한 자리 '
      + 것.차지한자리_가로 + 'px (겹쳐 그려 0~1 로 나온다 — 못 잰 것)');
    console.log('    밀 수 있는 양 ' + 것.밀수있는양 + 'px → 끝까지 민 거리 ' + 것.민거리 + 'px '
      + 못(것.민거리 > 0 && 것.민거리 >= 것.밀수있는양 - 2));
    console.log('    마지막 칸 「' + 것.마지막칸 + '」 보이나 ' + 것.마지막칸보이나 + ' ' + 못(것.마지막칸보이나));
    console.log('    첫 칸이 밀어도 붙어 있나 (' + 것.첫칸전 + ' → ' + 것.첫칸후 + ') '
      + 못(Math.abs(것.첫칸전 - 것.첫칸후) < 2));
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
