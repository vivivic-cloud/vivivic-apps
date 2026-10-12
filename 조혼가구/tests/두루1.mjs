import { 서버, 브라우저열기, devices, 주소, 테일윈드, 자판 } from './도구/터.mjs';
await 서버();
const TW = await 테일윈드();
const { 못, 끝 } = 자판();
const b=await 브라우저열기();
for (const w of [375,1280]) {
const ctx=await b.newContext({viewport:{width:w,height:900},hasTouch:true,isMobile:w<500});
const p=await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(e.message));
await p.addInitScript(()=>{window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
  s.textContent='#auth-login-overlay{display:none!important}';document.head.appendChild(s);});});
await p.route('**cdn.tailwindcss.com**',r=>r.abort());
await p.goto(주소,{waitUntil:'load'});
await p.addStyleTag({path:TW});
await p.waitForTimeout(2200);
const 칸들=['order','waiting','danger','registered','timeline'];
const 본것=[];
for (const k of 칸들){ await p.evaluate(k=>johonBoxShows(k), k); await p.waitForTimeout(350);
  본것.push(k+':'+(await p.evaluate(()=>document.documentElement.scrollWidth))); }
await p.evaluate(()=>johonGoHome()); await p.waitForTimeout(400);
/* 새 화면을 붙일 때마다 **옛 화면이 밀리지 않았는지** 본다 — 가로로 한 칸이라도
   넘치면 사장님 폰에서 옆으로 밀린다. 다섯 칸을 다 돌아본다. */
못('가로 '+w+' — 칸마다 가로 넘침 0', 본것, 칸들.map(k=>k+':'+w));
못('가로 '+w+' — 집도 넘침 0',
   [await p.evaluate(()=>document.documentElement.scrollWidth),
    await p.evaluate(()=>document.documentElement.clientWidth)], [w, w]);
못('가로 '+w+' — 페이지 오류 0', 오류.length, 0);
if (오류.length) console.log('   ', 오류.slice(0,3));
await ctx.close(); }
await b.close();
끝();
