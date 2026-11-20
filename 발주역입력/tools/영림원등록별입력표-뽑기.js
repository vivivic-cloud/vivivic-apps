// 영림원품목등록.html(배포본) 화면 표 값 뽑기 — 영림원등록별입력표.py 의 재료. 읽기만(창고·영림원에 안 씀).
// 쓰는 법: playwright-core@1.56.1 이 있는 폴더(scratchpad)에서 NODE_PATH=<그 폴더>/node_modules node 영림원등록별입력표-뽑기.js <data.json>
const {chromium}=require('playwright-core');
(async()=>{
const b=await chromium.launch({executablePath:process.env.HOME+'/Library/Caches/ms-playwright/chromium-1194/chrome-mac/Chromium.app/Contents/MacOS/Chromium'});
const p=await b.newPage();
await p.goto(encodeURI('https://vivivic-cloud.github.io/vivivic-apps/발주역입력/영림원품목등록.html'));
await p.waitForTimeout(5000);
const r=await p.evaluate(async()=>{
 const sl=ms=>new Promise(r=>setTimeout(r,ms));
 const clk=n=>[...document.querySelectorAll('button,.chip')].find(b=>b.textContent.trim().startsWith(n)).click();
 const grab=()=>[...document.querySelectorAll('table')].filter(t=>t.offsetParent).map(t=>({hs:[...t.querySelector('thead tr').children].map(c=>c.textContent.trim()),rows:[...t.querySelectorAll('tbody tr')].map(tr=>[...tr.children].map(c=>c.textContent.trim()))}))[0];
 const o={ver:document.title};
 clk('품목등록업로드');await sl(2500);o.품목=grab();
 clk('BOM등록업로드');await sl(2500);o.BOM=grab();
 clk('제품별공정별소요자재등록');await sl(2500);clk('공정 ');await sl(1500);o.공정=grab();clk('소요자재 ');await sl(1500);o.소요=grab();
 return o;});
require('fs').writeFileSync(process.argv[2],JSON.stringify(r,null,1));await b.close();})();
