// 빨강으로 바뀌는 시계가 15초가 아니라 30초인가 — 직접 재 본다.
// ① 듣기를 건 뒤 자료가 안 오면: 15초에는 아직 회색, 30초쯤에 빨강
// ② 25초 만에 자료가 다 오면 빨강이 안 뜬다 (전에는 15초에 떠 겁을 줬다)
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const 폰={...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true};
const 빨강인가=p=>p.evaluate(()=>{const c=document.getElementById('process-timeline-container');
  return /다 못 받았습니다/.test((c&&c.textContent)||'');});

// ① 듣기는 걸었는데 자료가 안 온다
{
  const ctx=await b.newContext(폰); const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'load'});
  const t0=await p.evaluate(()=>{ const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    document.documentElement.removeAttribute('data-amthome');
    if(typeof switchPage==='function') switchPage('process');
    window._자료시계시작();          // 듣기를 건 것과 같다
    return Date.now(); });
  const at15=await (async()=>{ await p.waitForTimeout(17000); return 빨강인가(p); })();
  let 뜬초=null;
  for(let i=0;i<60;i++){ if(await 빨강인가(p)){ 뜬초=+((Date.now()-t0)/1000).toFixed(1); break; } await p.waitForTimeout(500); }
  console.log('① 자료가 안 올 때 — 17초에 빨강? '+at15+' · 실제로 빨강 뜬 때 '+뜬초+'초');
  판('① 15초에는 아직 안 겁준다(회색 그대로)', at15===false, '17초에 빨강 '+at15);
  판('① 30초쯤에 빨강이 뜬다', 뜬초!==null && 뜬초>=28 && 뜬초<=34, 뜬초+'초');
  await ctx.close();
}
// ② 25초 만에 자료가 다 오면 빨강이 안 떠야 한다 (전에는 15초에 떴다)
{
  const ctx=await b.newContext(폰); const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'load'});
  await p.evaluate(()=>{ const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    document.documentElement.removeAttribute('data-amthome');
    if(typeof switchPage==='function') switchPage('process');
    window._자료시계시작(); });
  await p.waitForTimeout(25000);
  const 오기전=await 빨강인가(p);
  await p.evaluate(()=>{ ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k)); });
  await p.waitForTimeout(12000);
  const 온뒤=await 빨강인가(p);
  console.log('② 25초 만에 자료가 다 옴 — 오기 전 빨강 '+오기전+' · 온 뒤 빨강 '+온뒤);
  판('② 25초에 오는 자료를 기다려 준다(그 전에 안 겁준다)', 오기전===false, String(오기전));
  판('② 다 온 뒤에도 빨강이 안 뜬다(40초 보조 시계도 조용)', 온뒤===false, String(온뒤));
  await ctx.close();
}
console.log(실패===0?'t30   OK':'t30   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
