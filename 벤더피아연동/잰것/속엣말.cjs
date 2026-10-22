/* ① **속엣말 딱지가 평소에 안 보이나**를 재는 자.
   사장님 10-15: 「이 내부정보표기는 보이지 안도록해주세요」 (장부 a1792027764)
   보아야 하는 것 — 평소 안 보임 · 탭 글자에 「·짚기v」 없음 ·
     `?vg판=1` 이면 보임 · 두 번 누르면 보임(그리고 화면은 제자리) · 붉은 줄은 그대로.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 몸 = `<html><head><meta charset="utf-8"><title>로그인</title></head><body id="body">
<div id="벤더피아제화면">벤더피아 원래 로그인 화면입니다</div>
<form id="frmSign"><input id="txtID"><input id="txtPWD" type="password"><input type="submit" id="btnLogin" value="로그인"></form>
</body></html>`;
/* `불러오기.js` 가 하는 것과 **같은 꼴**로 딱지와 탭 글자를 세운다 (그 파일은 확장 안이라 못 고친다) */
const 불러오기흉내 = (판) => `
document.documentElement.classList.add("vp-clean");
document.title = (document.title || "벤더피아") + " ·짚기v" + ${JSON.stringify(판)};
(function(){
  var d = document.createElement("div"); d.id = "vp-판";
  d.textContent = "벤더피아 보기 깔림 ${판} · 화면글 ${판} · 확장 · 짚개✓ 기억✓ 손잡이✓ 꾸밈✓";
  d.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:2147483646;background:rgba(0,0,0,.55);"
    + "color:#fff;font:600 11px/1.4 sans-serif;padding:3px 7px;border-radius:9px;pointer-events:none";
  document.body.appendChild(d);
  var t = document.createElement("div"); t.id = "vp-탈"; t.textContent = "화면 글을 못 받았습니다";
  t.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483645;background:#c92a2a;color:#fff;"
    + "font:600 12px/1.6 sans-serif;padding:4px 8px;text-align:center";
  document.body.appendChild(t);
})();`;

const 본다 = () => {
  const 보임 = (el) => { if (!el) return false; const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && getComputedStyle(el).display !== 'none'; };
  return {
    딱지보이나: 보임(document.getElementById('vp-판')),
    딱지있나: !!document.getElementById('vp-판'),
    붉은줄보이나: 보임(document.getElementById('vp-탈')),
    탭글자: document.title,
    짚기v들었나: /·짚기v/.test(document.title || ''),
    판보기표: document.documentElement.classList.contains('vp-판보기'),
    우리화면인가: document.documentElement.classList.contains('vp-clean'),
  };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ ① 속엣말 딱지 — 평소에 안 보여야 한다 · PC 1280×800');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  for (const 길 of ['/Login.aspx', '/Login.aspx?vg판=1']) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (new URL(r.request().url()).pathname.endsWith('.js'))
        return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 자리 (흉내) */' });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 몸 });
    });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,120)));
    await page.goto('https://vendorpia.com' + 길);
    await page.addScriptTag({ content: 불러오기흉내('0.34.11') });
    await page.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') });
    await page.addScriptTag({ content: fs.readFileSync(path.join(확장, 'login.js'), 'utf8') });
    await page.waitForTimeout(1800);                      // 제목털기 가 1500ms 에 한 번 더 돈다

    const 것 = await page.evaluate(본다);
    const 판보기길 = 길.includes('vg판');
    console.log('\n  ' + (판보기길 ? '② 주소에 ?vg판=1' : '① 그냥 열었을 때'));
    console.log('    딱지 있나 ' + 것.딱지있나 + ' · **보이나 ' + 것.딱지보이나 + '** '
      + 못(것.딱지있나 && 것.딱지보이나 === 판보기길));
    console.log('    탭 글자 「' + 것.탭글자 + '」 · 「·짚기v」 들었나 ' + 것.짚기v들었나 + ' '
      + 못(것.짚기v들었나 === 판보기길));
    console.log('    붉은 줄(진짜 탈 알림) 보이나 ' + 것.붉은줄보이나 + ' ' + 못(것.붉은줄보이나));

    if (!판보기길) {
      /* 두 번 빠르게 누르기 — 딱지가 켜지고 **화면은 제자리**여야 한다 */
      await page.click('#vp-바꾸기'); await page.click('#vp-바꾸기', { delay: 0 });
      await page.waitForTimeout(250);
      const 뒤 = await page.evaluate(본다);
      console.log('    두 번 빠르게 누름 → 딱지 **' + 뒤.딱지보이나 + '** ' + 못(뒤.딱지보이나)
        + ' · 화면 제자리인가(vp-clean ' + 뒤.우리화면인가 + ') ' + 못(뒤.우리화면인가 === 것.우리화면인가)
        + ' · 탭 글자 「' + 뒤.탭글자 + '」');
      /* 다시 두 번 → 꺼지고 탭 글자도 다시 털려야 한다 */
      await page.click('#vp-바꾸기'); await page.click('#vp-바꾸기', { delay: 0 });
      await page.waitForTimeout(250);
      const 또 = await page.evaluate(본다);
      console.log('    또 두 번 누름   → 딱지 ' + 또.딱지보이나 + ' ' + 못(!또.딱지보이나)
        + ' · 「·짚기v」 ' + 또.짚기v들었나 + ' ' + 못(!또.짚기v들었나));
      /* 한 번만 누르면 새 창이 열릴 뿐 이 화면은 제자리여야 한다 (0.34.40 — 옛 「원래 화면」 뒤집기는 지웠다) */
      const 열림 = ctx.waitForEvent('page', { timeout: 3000 }).then(() => true, () => false);
      await page.click('#vp-바꾸기'); await page.waitForTimeout(700);
      const 한번 = await page.evaluate(본다);
      console.log('    한 번만 누름    → 새 창이 떴나 ' + await 열림 + ' ' + 못(await 열림)
        + ' · 이 화면은 제자리 ' + 한번.우리화면인가 + ' ' + 못(한번.우리화면인가 === 것.우리화면인가));
    }
    if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
