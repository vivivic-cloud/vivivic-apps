/* 오른쪽 끝 80px 만 크게 본다 — 그늘이 눈에 보이나. ⚠ 자료 전부 가짜. */
const { chromium } = require('playwright');
const fs=require('fs'), path=require('path');
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
  const 밖 = '/tmp/claude-0/-home-user-vivivic-apps/459edaf4-304e-56e1-9eb8-ad6dc33034a4/scratchpad';
  const ctx = await b.newContext({ viewport:{width:1280,height:500}, deviceScaleFactor:3 });
  const page = await ctx.newPage();
  await page.setContent(종이(css, 8), { waitUntil:'load' });
  if (process.argv[2] === '끝') await page.evaluate(()=>{ const t=document.querySelector('.vp-table'); t.scrollLeft = t.scrollWidth; });
  await page.waitForTimeout(150);
  const 상자 = await page.evaluate(()=>{ const r=document.querySelector('.vp-table').getBoundingClientRect();
    return { x:Math.round(r.right-90), y:Math.round(r.top), width:90, height:Math.min(260,Math.round(r.height)) }; });
  await page.screenshot({ path: 밖+'/배송관리-오른쪽끝'+(process.argv[2]==='끝'?'-끝까지민뒤':'')+'.png', clip: 상자 });
  console.log('오른쪽 끝', JSON.stringify(상자));
  await b.close();
})();
