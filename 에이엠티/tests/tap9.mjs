// 자료를 끝내 다 못 받았을 때 ▶시작이 진짜로 안 눌리는가 — 마우스가 아니라 진짜 손가락(CDP 터치).
// ① 다 온 창에서 ▶시작 단추의 자리를 잰다
// ② 새 창을 열되 재단도면은 끝내 안 온 채로 두고, 같은 자리를 손가락으로 누른다
// ③ 아무 일도 안 일어나야 한다 — 일 기록 그대로, 파이어베이스 쓰기 0
import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});

const 차림 = ({O,C,L,도면옴})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.__쓰기=0;
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},setDoc:async()=>{window.__쓰기++;},
    deleteDoc:async()=>{window.__쓰기++;},collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{window.__쓰기++;},
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  appMode='process';
  (도면옴?['원장','발주','도면','차례']:['원장','발주','차례']).forEach(k=>window._자료왔다(k));
  const 본=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)본.add(s);});
  const sk=[...본].find(s=>/-재단$/.test(s)); window.__sk=sk;
  window._tlDcDate=sk.substring(0,10); renderProcessTimeline();
  try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
  Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
  window._woCutGrpOpen=window._woCutGrpOpen||{};
  (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
  _woRenderBoard(sk);
  const 다=[...document.querySelectorAll('#wo-boring-grid-'+sk+' button')].filter(x=>/시작/.test(x.textContent));
  let 자리=null;
  if(다[0]){ 다[0].scrollIntoView({block:'center'}); const r=다[0].getBoundingClientRect();
             자리={x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), w:Math.round(r.width), h:Math.round(r.height)}; }
  window.__쓰기=0;
  return {시작단추수:다.length, 자리, 막힘:window._자료막힘(),
          카드:document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card').length,
          일기록:JSON.stringify(window._woBoring[sk]||{})};
};

// ① 다 온 창 — ▶시작 자리 재기
const p1=await ctx.newPage(); await p1.goto(URL,{waitUntil:'load'}); await p1.waitForTimeout(1200);
const 온것=await p1.evaluate(차림,{O,C,L,도면옴:true});
console.log('① 다 온 창: '+JSON.stringify(온것).slice(0,200));
판('① 다 왔을 때는 ▶시작이 있다', 온것.시작단추수>0 && 온것.자리 && 온것.자리.w>0,
   '시작 '+온것.시작단추수+'개 · 자리 '+JSON.stringify(온것.자리));
await p1.close();

// ② 재단도면이 끝내 안 온 창 — 같은 자리를 진짜 손가락으로
const p2=await ctx.newPage(); const errs=[]; p2.on('pageerror',e=>errs.push(e.message));
await p2.goto(URL,{waitUntil:'load'}); await p2.waitForTimeout(1200);
const 막힌것=await p2.evaluate(차림,{O,C,L,도면옴:false});
console.log('② 도면 안 온 창: '+JSON.stringify({시작단추수:막힌것.시작단추수,막힘:막힌것.막힘,카드:막힌것.카드}));
판('② 자료를 다 못 받으면 ▶시작 단추가 아예 안 그려진다', 막힌것.시작단추수===0, '시작 단추 '+막힌것.시작단추수+'개 / 카드 '+막힌것.카드);
판('② 작업을 막는 표가 서 있다', 막힌것.막힘===true, String(막힌것.막힘));

const cdp=await ctx.newCDPSession(p2);
const pt=온것.자리 || {x:275,y:475};
// 그 자리가 지금 무엇인지도 적어 둔다
const 무엇=await p2.evaluate(({x,y})=>{ const e=document.elementFromPoint(x,y);
  return e? (e.tagName+' · '+(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)) : '(없음)'; }, pt);
console.log('   그 자리에 지금 있는 것: '+무엇);
for(let i=0;i<2;i++){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pt.x,y:pt.y}]});
  await p2.waitForTimeout(70);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p2.waitForTimeout(500);
}
const 뒤=await p2.evaluate(()=>({일기록:JSON.stringify(window._woBoring[window.__sk]||{}), 쓰기:window.__쓰기}));
console.log('③ 손가락으로 두 번 누른 뒤: 쓰기 '+뒤.쓰기+'번');
판('③ 진짜 손가락으로 눌러도 일이 안 시작된다', 뒤.일기록===막힌것.일기록, '일 기록 그대로');
판('③ 눌러도 파이어베이스에 아무것도 안 쓴다', 뒤.쓰기===0, 뒤.쓰기+'번');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'tap9   OK':'tap9   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
