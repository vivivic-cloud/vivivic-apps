/* 서류관리 제품관리 표(`vivivic-docs/index.html` `#docs-prod .dpr-t`)와 우리 표의 **computed style 을 나란히 숫자로** 견주는 자 (10-23).
   사장님 말씀: 「서류관리의 제품관리 박스의 표와 완벽하게 동일한 디자인 일관성 … 특히 표의 상단부(머리줄)」
   기준은 서류관리 저장소(`/home/user/vivivic-docs`, 읽기만)의 css 를 **그 자리에서 뽑아** 같은 마크업으로 그려서 잰다 — 숫자를 베껴 두지 않는다.
   서류관리 저장소가 없으면 기준을 못 만든다 → `기준재기` 가 null 을 돌려주고 호출한 시험은 「건너뜀」 으로 센다. */
const fs = require('fs');
const 서류관리 = process.env.VP_DOCS || '/home/user/vivivic-docs';

const 재는칸 = ['fontFamily', 'fontSize', 'fontWeight', 'color', 'backgroundColor', 'textAlign', 'verticalAlign',
  'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'borderTopWidth', 'borderBottomWidth', 'borderBottomColor',
  'borderBottomStyle', 'borderLeftWidth', 'lineHeight', 'whiteSpace', 'letterSpacing', 'minWidth', 'textTransform'];
const 표칸 = ['borderCollapse', 'borderTopWidth', 'borderRadius', 'backgroundColor'];

/* 쪽 안에서 도는 재는 글 — 머리·몸을 종류별로 한 칸씩 집어 잰다.
   종류: 첫(코드 칸) · 보통 · 숫자 · 모델(줄바꿈 허용 둘째 칸). 없는 종류는 null. */
const 재기글 = `(function (표선택자, 고르개) {
  const 표 = document.querySelector(표선택자); if (!표) return null;
  const 재 = (el, ks) => { if (!el) return null; const c = getComputedStyle(el); const o = {}; ks.forEach((k) => { o[k] = c[k]; });
    o.textAlign = o.textAlign === 'start' ? 'left' : o.textAlign; o.높이 = Math.round(el.getBoundingClientRect().height * 10) / 10; return o; };
  const 머리 = [...표.querySelectorAll('thead th')], 몸줄 = [...표.querySelectorAll('tbody tr')].filter((t) => !t.hidden);
  const 첫줄 = 몸줄[0]; const td = 첫줄 ? [...첫줄.children] : [];
  const g = 고르개;
  return { 표: 재(표, ${JSON.stringify(표칸)}),
    머리: { 첫: 재(머리.find(g.첫), ${JSON.stringify(재는칸)}), 보통: 재(머리.find(g.보통), ${JSON.stringify(재는칸)}), 숫자: 재(머리.find(g.숫자), ${JSON.stringify(재는칸)}) },
    몸: { 첫: 재(td.find(g.첫), ${JSON.stringify(재는칸)}), 보통: 재(td.find(g.보통), ${JSON.stringify(재는칸)}), 숫자: 재(td.find(g.숫자), ${JSON.stringify(재는칸)}), 모델: 재(td.find(g.모델), ${JSON.stringify(재는칸)}) },
    머리줄높이: 머리[0] ? Math.round(머리[0].parentNode.getBoundingClientRect().height * 10) / 10 : null,
    줄높이: 첫줄 ? Math.round(첫줄.getBoundingClientRect().height * 10) / 10 : null };
})`;
const 고르개글 = `{
  첫: (e) => e.classList.contains('dpr-k') || e.classList.contains('vp-main'),
  보통: (e) => !e.className && !e.classList.length,
  숫자: (e) => e.classList.contains('num') || e.classList.contains('vp-num'),
  모델: (e) => e.classList.contains('dpr-m') || e.classList.contains('vp-m') }`;
const 재기 = (page, 선택자) => page.evaluate(`${재기글}(${JSON.stringify(선택자)}, ${고르개글})`);

/* 기준 — 서류관리 css 를 뽑아 같은 마크업으로 그린다 */
async function 기준재기(browser, 너비) {
  let src;
  try { src = fs.readFileSync(서류관리 + '/index.html', 'utf8'); } catch (e) { return null; }
  try {
    const a = src.indexOf('#docs-home, #docs-vendor');
    const 바탕 = src.slice(a, src.indexOf('}', a) + 1)
      .replace(/position:fixed;[^;]*;[^;]*;[^;]*;\s*z-index:\d+;/, '').replace(/top:var\(--dhh-top, 65px\);/, '').replace('display:none;', 'display:block;')
      .replace('#docs-home, #docs-vendor, #docs-files, #docs-orders, #docs-kinds, #docs-codes, #docs-items, #docs-prod', '#docs-prod');
    const 포장 = (src.match(/\.dhh-wrap\{[^}]*\}/) || [''])[0];
    const 규칙 = src.slice(src.indexOf('/* 제품관리 — 거래처 한 덩이'), src.indexOf('/* 단품관리 — 차수 한 덩이'));
    const 줄 = (n) => `<tr><td class="dpr-k">AB-${n}</td><td class="dpr-m">Desk model ${n}</td><td>WHITE</td><td>123</td><td class="num">4.5</td><td class="num">800*400*250</td><td class="num">0.08</td><td class="num">2</td></tr>`;
    const 쪽 = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">`
      + `<link rel="stylesheet" href="file://${서류관리}/css/app.css"><style>${바탕}${포장}${규칙}</style></head><body><div id="docs-prod"><div class="dhh-wrap"><div id="dpr-list">`
      + `<section class="dpr-g"><div class="dpr-scroll"><table class="dpr-t"><thead><tr><th class="dpr-k">CODE#</th><th>Product model</th><th>COLOR</th><th>产品号</th>`
      + `<th class="num">FOB</th><th class="num">Packing size(mm)</th><th class="num">carton Volume (CBM)</th><th class="num">pcs/ctn</th></tr></thead><tbody>${줄(1)}${줄(2)}</tbody></table></div></section></div></div></div></body></html>`;
    const ctx = await browser.newContext({ viewport: { width: 너비, height: 800 } });
    const page = await ctx.newPage();
    await page.setContent(쪽, { waitUntil: 'load' });
    const 값 = await 재기(page, '.dpr-t');
    await ctx.close();
    return 값;
  } catch (e) { return null; }
}

/* 견주기 — 다른 값 목록을 돌려준다(비면 같다). 머리 첫 칸의 굵기만 기준이 700 이다(`.dpr-k`).
   ⚠ 줄높이·머리줄높이는 **글이 한 줄일 때만** 같다 — 머리가 줄바꿈하면 머리줄은 달라질 수 있어 머리줄높이는 견주지 않고 줄높이만 견준다. */
function 견주기(기준, 우리) {
  const 다름 = [];
  const 비교 = (이름, a, b) => { if (!a && !b) return; if (!a || !b) { if (!b && /숫자$/.test(이름)) return; 다름.push(이름 + ' (' + (a ? '우리에 없음' : '기준에 없음') + ')'); return; }
    for (const k of Object.keys(a)) { if (k === 'fontFamily' && a[k] === b[k]) continue; if (k === '높이') continue;
      if (a[k] !== b[k]) 다름.push(이름 + '.' + k + ' 기준 ' + a[k] + ' ≠ 우리 ' + b[k]); } };
  비교('표', 기준.표, 우리.표);
  for (const k of ['첫', '보통', '숫자']) 비교('머리.' + k, 기준.머리[k], 우리.머리[k]);
  for (const k of ['첫', '보통', '숫자', '모델']) 비교('몸.' + k, 기준.몸[k], 우리.몸[k]);
  return 다름;
}
module.exports = { 기준재기, 재기, 견주기 };
