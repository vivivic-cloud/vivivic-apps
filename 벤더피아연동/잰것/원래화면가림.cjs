/* 사장님 10-21 「원래화면 전환시 … 벤더피아의 원래 화면 전체가 정상적으로 보이도록」 (장부 a1792566604)
   원래 화면에서 **본문이 제 머리띠 밑에 깔려 가려지는가**를 잰다. 우리 글을 넣기 전/후 본문 윗자리를 견준다.
   ⚠ 진짜 vendorpia.com 은 못 닿는다 — 머리띠가 붙은(fixed) 꼴·흐르는 꼴을 흉내로 세운다. 자료는 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 판 = (붙음, 몸안여백) => `<html><head><meta charset="utf-8"><style>
 body{margin:0;font:14px/1.5 sans-serif;${몸안여백 ? 'padding-top:55px;' : ''}}
 #kt_header{position:${붙음 ? 'fixed' : 'static'};top:0;left:0;right:0;height:55px;background:#1e1e2d;display:flex;align-items:center;padding:0 20px;z-index:97}
 #divLogo{display:flex} #imglogo{width:120px;height:28px;background:#fff;display:block}
 #속{${몸안여백 ? '' : 'padding-top:60px;'}}
</style></head><body id="body"><div id="kt_header"><div id="divLogo"><a href="/"><img id="imglogo"></a></div></div>
<div id="속"><h2 id="본문첫줄">본문 첫 줄입니다</h2></div></body></html>`;
const 흉내 = `window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};`;
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  let 빨강 = 0;
  for (const [이름, 붙음, 몸안] of [['머리띠 붙음+몸 여백',true,true],['머리띠 붙음+본문 여백',true,false],['머리띠 흐름+몸 여백',false,true]]) {
    for (const 넣나 of [false, true]) {
      const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
      await p.route('**://vendorpia.com/**', r => r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 판(붙음, 몸안) }));
      await p.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
      if (넣나) { await p.addScriptTag({ content: 흉내 });
        await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'login.js'), 'utf8') }); await p.waitForTimeout(300); }
      const r = await p.evaluate(() => {
        const 띠 = document.getElementById('kt_header').getBoundingClientRect();
        const 본 = document.getElementById('본문첫줄').getBoundingClientRect();
        const fixed = getComputedStyle(document.getElementById('kt_header')).position === 'fixed';
        return { 본문위: Math.round(본.top), 띠밑: Math.round(fixed ? 띠.bottom : 띠.bottom), fixed,
                 가려진높이: Math.max(0, Math.round(fixed ? 띠.bottom - 본.top : 0)) };
      });
      console.log(이름, 넣나 ? '| 우리글 넣음' : '| 원래    ', JSON.stringify(r));
      if (넣나 && r.가려진높이 > 0) 빨강++;
      await p.close();
    }
  }
  console.log('가려진 판:', 빨강);
  await b.close();
})();
