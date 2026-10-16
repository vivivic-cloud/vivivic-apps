/* **로고가 창 맨 위로 올라가나**를 재는 자 (10-16).
   사장님: 「**그림 이미지 위쪽으로 창의 제일 위쪽으로 이동해주세요**」 (장부 a1792110677)
   짚은자 `body.kt-quick-panel--right.kt-demo-panel--right > div#divLogo > a > img#imglogo`
   — `#divLogo` 가 **몸의 바로 밑**이다. 어제 우리 띠는 걷었는데도 아직 낮다 하신다.
   ⚠ 짐작하지 않는다. **세 너비(375·390·1280)** 에서 재고, **무엇이 밀고 있었는지 이름으로** 적는다.
   ⚠ 빈자리(margin·padding)는 걷되, **앞에 보이는 형제가 있으면 손대지 않아야** 한다 —
     그 집 글이나 단추를 우리가 지우면 안 된다. 그 판도 함께 잰다.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 짚으신 이름 그대로 흉내를 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 그림칸 = path.join(__dirname, '그림');

/* 판 ㄱ) 로고 위가 **빈자리**다 — body padding 과 #divLogo margin. 걷혀야 한다.
   판 ㄴ) 로고 위에 **보이는 형제**(제 머리띠)가 있다. 손대지 말고 이름만 적어야 한다. */
const 쪽만들기 = (판) => `<html><head><meta charset="utf-8"><title>벤더피아</title><style>
  body { margin: 0; padding-top: ${판 === '빈자리' ? '34px' : '0'}; font: 14px/1.5 sans-serif;
         background: #fff; }
  #윗띠 { height: 48px; background: #1e1e2d; color: #fff; display: flex; align-items: center;
          padding: 0 16px; font-weight: 700; }
  #divLogo { display: flex; align-items: center; gap: 10px;
             margin-top: ${판 === '빈자리' ? '22px' : '0'}; padding-left: 16px; }
  #imglogo { width: 120px; height: 28px; background: #c92a2a; display: block; }
  #속 { padding: 16px; }
</style></head><body id="body" class="kt-quick-panel--right kt-demo-panel--right">
${판 === '형제' ? '<div id="윗띠">벤더피아 제 머리띠 — 이건 우리가 손대면 안 됩니다</div>' : ''}
<div id="divLogo"><a href="/"><img id="imglogo" src="logo.png" alt="벤더피아"></a>
  <span id="머리글">벤더피아 ERP</span></div>
<div id="속">본문입니다</div>
</body></html>`;

const 잰다 = () => {
  const 그림 = document.getElementById('imglogo');
  const 통 = document.getElementById('divLogo');
  const 띠 = document.getElementById('윗띠');
  const 자리 = (el) => { if (!el) return null; const r = el.getBoundingClientRect();
    return { 위: Math.round(r.top), 밑: Math.round(r.bottom), 키: Math.round(r.height) }; };
  const 잘림 = (A) => A ? Math.round(Math.max(0, -A.위) * 120) : null;
  return {
    로고: 자리(그림), 통: 자리(통), 윗띠: 자리(띠),
    로고잘림: 잘림(자리(그림)),
    몸위여백: getComputedStyle(document.body).paddingTop,
    통위여백: 통 ? getComputedStyle(통).marginTop : null,
    뿌리위여백: getComputedStyle(document.documentElement).paddingTop,
    윗띠보이나: !!띠 && 자리(띠).키 > 1,
    딱지: document.getElementById('vp-판')?.textContent || '',
  };
};

(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ 로고를 창 맨 위로 (10-16) — 375 · 390 · 1280');
  console.log('  ⚠ 자료는 전부 가짜. 짚으신 이름(`#divLogo`·`#imglogo`)으로 세웠다.');
  if (process.env.VP_LOGIN_JS) console.log('  ⚠ **옛 login.js 로 돌린다** — ' + process.env.VP_LOGIN_JS);
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  for (const 판 of ['빈자리', '형제']) {
    console.log('\n──── 로고 위가 ' + (판 === '빈자리' ? '**빈자리**(몸 padding 34 + 통 margin 22)'
      : '**보이는 형제**(제 머리띠 48px)') + ' 일 때 ────');
    for (const [w, h] of [[375, 812], [390, 844], [1280, 860]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h } });
      await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
      await ctx.route('**://vendorpia.com/**', (r) => {
        const u = new URL(r.request().url());
        if (u.pathname.endsWith('.js'))
          return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 (흉내) */' });
        if (u.pathname.endsWith('.png'))
          return r.fulfill({ status:200, contentType:'image/gif',
            body: Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64') });
        return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 쪽만들기(판) });
      });
      const page = await ctx.newPage();
      const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
      await page.goto('https://vendorpia.com/Main.aspx?vg판=1');
      await page.addScriptTag({ content:
        'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
        + '(function(){var d=document.createElement("div");d.id="vp-판";'
        + 'd.textContent="벤더피아 보기 잰것 · 확장";'
        + 'd.style.cssText="position:fixed;left:6px;bottom:6px";document.body.appendChild(d);})();' });
      /* ⚠ **우리 글을 넣기 전** 자리를 먼저 잰다 — 이것이 「고치기 전」 값이다 */
      const 맨처음 = await page.evaluate(잰다);
      await page.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') });
      const 로그인글 = process.env.VP_LOGIN_JS || path.join(확장, 'login.js');
      await page.addScriptTag({ content: fs.readFileSync(로그인글, 'utf8') });
      await page.waitForTimeout(700);
      const 뒤 = await page.evaluate(잰다);

      const 토막 = (뒤.딱지.split('‖').map(x => x.trim()).filter(x => /로고/.test(x))[0]) || '(없음)';
      console.log('\n  ' + w + '×' + h);
      console.log('    로고 창 위에서 — **전 ' + 맨처음.로고.위 + 'px → 후 ' + 뒤.로고.위 + 'px**'
        + ' · 잘린 넓이 ' + 뒤.로고잘림 + 'px²');
      console.log('    몸 위여백 ' + 맨처음.몸위여백 + '→' + 뒤.몸위여백
        + ' · 통 위여백 ' + 맨처음.통위여백 + '→' + 뒤.통위여백
        + ' · 뿌리 위여백 ' + 뒤.뿌리위여백);
      console.log('    까닭 줄 「' + 토막 + '」');
      if (판 === '빈자리') {
        console.log('    ★ **창 맨 위에 붙었나** ' + 못(뒤.로고.위 <= 2 && 뒤.로고잘림 === 0));
        console.log('    ★ 무엇을 걷었는지 **이름으로** 적혔나 '
          + 못(/걷음/.test(토막) && /body/.test(토막) && /divLogo/.test(토막)));
      } else {
        console.log('    ★ 제 머리띠를 **안 지웠나** (아직 보이나 ' + 뒤.윗띠보이나 + ') '
          + 못(뒤.윗띠보이나 && 뒤.윗띠.키 === 48));
        console.log('    ★ 로고가 **안 밀렸나** (' + 맨처음.로고.위 + ' → ' + 뒤.로고.위 + ') '
          + 못(뒤.로고.위 === 맨처음.로고.위));
        console.log('    ★ **막은 것을 이름으로** 적었나 ' + 못(/막은것 #윗띠/.test(토막)));
      }
      if (w === 375) await page.screenshot({ path: path.join(그림칸, '로고-' + 판 + '-375.png') });
      if (w === 1280) await page.screenshot({ path: path.join(그림칸, '로고-' + 판 + '-1280.png') });
      if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
      await ctx.close();
    }
  }
  console.log('\n  그림: 잰것/그림/로고-빈자리-375.png · 로고-빈자리-1280.png · 로고-형제-375.png · 로고-형제-1280.png');
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
