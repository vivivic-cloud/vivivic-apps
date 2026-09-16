// 테일윈드를 진짜로 켜고 재는 시험.
// 이 상자에서는 cdn.tailwindcss.com 에 못 닿는다. 그래서 npm 으로 받은 진짜
// tailwindcss 3.4.17 로 이 앱 파일을 훑어 CSS 를 뽑아 두고(tw-built.css),
// CDN 자리에 그 CSS 를 끼워 넣는 쪽지로 바꿔치기한다 — 앱 파일은 안 건드린다.
// 이렇게 하면 두 칸 격자·배지·글자 크기가 실제와 같은 자리에서 잰다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const HERE='/tmp/claude-0/-home-user-vivivic-apps/17fbe99e-07b2-5ca2-bd6b-e6d2d41ab942/scratchpad';
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const C=await (await fetch(B+'/cutting_plans.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
// CDN 자리를 진짜 테일윈드 CSS 로 바꿔치기 — 문서의 그 자리(앱 <style> 보다 위)에 들어간다
await ctx.route('https://cdn.tailwindcss.com*', route => route.fulfill({
  status:200, contentType:'application/javascript',
  body:'document.write(' + JSON.stringify('<style id="__tw">'+CSS+'</style>') + ');'
}));
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);

const 켜짐 = await p.evaluate(()=>{
  const d=document.createElement('div'); d.className='grid grid-cols-2'; d.style.width='200px';
  document.body.appendChild(d); const on=getComputedStyle(d).display==='grid'; d.remove();
  return {테일윈드:on, 쪽지:!!document.getElementById('__tw')};
});
console.log('테일윈드 켜짐: '+JSON.stringify(켜짐));
판('진짜 테일윈드가 켜졌다', 켜짐.테일윈드===true && 켜짐.쪽지===true, JSON.stringify(켜짐));

const r = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  document.documentElement.removeAttribute('data-amthome');
  switchPage('cutting');            // 진짜 길 그대로 — 재단발주 탭으로 넘어간다
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push({...x, checked:true}));
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window.__쓰기=0;
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},setDoc:async()=>{window.__쓰기++;},
    deleteDoc:async()=>{window.__쓰기++;},addDoc:async()=>{window.__쓰기++;},collection:()=>({}),onSnapshot:()=>{},query:x=>x,
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
  refreshConsolidatedMaterials();
  const 단추=[...document.querySelectorAll('.scenario-plate-btn')];
  const i=단추.findIndex(x=>/발리오크/.test(x.textContent)); 단추[i>=0?i:0].click();
  const 재=el=>{const b=el.getBoundingClientRect(); return {가로:Math.round(b.width),세로:Math.round(b.height)};};
  const 카드=[...document.querySelectorAll('#id302-common-section .inner-part-card, #id302-normal-section .inner-part-card')];
  const 줄={}; 카드.forEach(c=>{const y=Math.round(c.getBoundingClientRect().y); 줄[y]=(줄[y]||0)+1;});
  const 배지=[...document.querySelectorAll('.qty-badge')].map(e=>{
    const bb=e.getBoundingClientRect(); const s=getComputedStyle(e);
    // 글자가 상자를 넘는지 — 글자만 재서 견준다
    const rg=document.createRange(); rg.selectNodeContents(e); const tw=rg.getBoundingClientRect().width;
    return {글:(e.textContent||'').trim(), 가로:Math.round(bb.width), 세로:Math.round(bb.height),
            글자폭:Math.round(tw*10)/10, 속:e.scrollWidth, 겉:e.clientWidth,
            넘침: e.scrollWidth>e.clientWidth+1 || tw > e.clientWidth+0.5,
            글자:s.fontSize, 여백:s.paddingLeft+'/'+s.paddingRight};});
  const 돌림=[...document.querySelectorAll('.rotate-btn')].map(재);
  const 초기화=document.getElementById('btn-reset-cutting');
  const 확정=document.getElementById('btn-confirm-cutting');
  const 목록=document.getElementById('id302-parts-content');
  return {카드수:카드.length, 카드:카드[0]?재(카드[0]):null, 한줄:Object.values(줄),
          목록폭:목록?Math.round(목록.getBoundingClientRect().width):null,
          배지, 배지수:배지.length, 넘친:배지.filter(x=>x.넘침).length,
          공통글자:배지.filter(x=>x.글==='공통').length,
          돌림:돌림[0]||null, 돌림수:돌림.length,
          초기화:초기화?재(초기화):null, 확정:확정?재(확정):null,
          문서가로:document.documentElement.scrollWidth, 쓰기:window.__쓰기};
},{O,C,L});
console.log('카드 '+r.카드수+'장 · 한 줄 '+JSON.stringify(r.한줄)+' · 카드 '+JSON.stringify(r.카드)+' · 목록폭 '+r.목록폭);
console.log('배지: '+JSON.stringify(r.배지));
console.log('재단회전 단추: '+JSON.stringify(r.돌림)+' ('+r.돌림수+'개)');
console.log('초기화 '+JSON.stringify(r.초기화)+' · 재단확정 '+JSON.stringify(r.확정));
판('부속 목록이 두 칸으로 선다(진짜 테일윈드)', r.한줄.some(n=>n===2), JSON.stringify(r.한줄));
판('배지 글자가 상자를 안 넘는다', r.넘친===0, '넘친 '+r.넘친+' / '+r.배지수+'개');
판('「공통」 글자로 남은 배지가 없다', r.공통글자===0, r.공통글자+'개');
판('재단회전 단추 세로 36px 이상', r.돌림 && r.돌림.세로>=36, JSON.stringify(r.돌림));
판('초기화 단추 세로 36px 이상', r.초기화 && r.초기화.세로>=36, JSON.stringify(r.초기화));
판('375px 에서 가로 스크롤 없다', r.문서가로<=375, r.문서가로+'px');
판('파이어베이스 쓰기 0', r.쓰기===0, r.쓰기+'번');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'tw1   OK':'tw1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
