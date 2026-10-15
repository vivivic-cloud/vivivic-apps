/* 고친 배송관리 표를 눈으로 본다. ⚠ 자료는 전부 가짜 — 그림은 커밋하지 않는다. */
const { chromium } = require('playwright');
const fs=require('fs'), path=require('path');
const os = require('os');
/* ⚠ 그림은 **저장소에 넣지 않는다**(공개 저장소). 어느 상자에나 있는 임시칸에 둔다.
   `OUT=...` 로 자리를 바꿀 수 있다. (10-15 — 전에는 작업자 임시폴더를 박아 두어 남의 손에서 안 돌았다) */
const 그림칸 = process.env.OUT || fs.mkdtempSync(path.join(os.tmpdir(), '벤더피아-잰그림-'));
const 자 = fs.readFileSync(path.join(__dirname,'가로.cjs'),'utf8');
const 종이쪽 = 자.match(/const 종이 = ([\s\S]*?)\n\n\/\* 한 칸이/)[1];
const COLUMNS = ["주문번호","상품명","수취인","휴대전화","주소","배송사","송장번호","상태"];
const 가짜 = (i) => ["20261014-"+String(100000+i),
  "가나다라 와이드 3단 서랍장 (화이트/오크) 1200x450x700 +전도방지 포함 / 조립배송",
  "가나다","010-0000-0000",
  "경기도 ○○시 ○○구 ○○대로123번길 45-6, ○○아파트 101동 1001호 (○○동)",
  "○○택배", String(640000000000+i), "배송완료"];
const 종이 = eval(종이쪽);
(async () => {
  const css = fs.readFileSync(path.join(__dirname,'..','search.css'),'utf8');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const 밖 = 그림칸;
  for (const [이름, w, 민] of [['맨왼쪽',1280,0], ['끝까지민뒤',1280,9999]]) {
    const ctx = await b.newContext({ viewport:{width:w,height:860} });
    const page = await ctx.newPage();
    await page.setContent(종이(css, 25), { waitUntil:'load' });
    await page.evaluate((x)=>{ document.querySelector('.vp-table').scrollLeft = x; }, 민);
    await page.waitForTimeout(150);
    const 꼴 = await page.evaluate(()=>{ const t=document.querySelector('.vp-table');
      const cs=getComputedStyle(t);
      return { 그늘층수: (cs.backgroundImage.match(/gradient/g)||[]).length,
               붙임: cs.backgroundAttachment, 밀린거리: Math.round(t.scrollLeft),
               더밀수있나: t.scrollWidth - t.clientWidth - t.scrollLeft }; });
    const 길 = 밖 + '/배송관리-' + 이름 + '.png';
    await page.screenshot({ path: 길 });
    console.log(이름, JSON.stringify(꼴), '→', 길);
    await ctx.close();
  }
  await b.close();
})();
