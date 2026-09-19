// 두 번째 편집화면 — 보드 카드의 '재편집' 팝업 안에도 초기화 단추가 따라오는가.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await 브라우저열기();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
let 물은글=null;
p.on('dialog', d=>{ 물은글=d.message(); d.accept(); });
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1200);

const 열기 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  document.documentElement.removeAttribute('data-amthome');
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push({...x, checked:true}));
  // 이 시험은 발주가 한 건이던 때 쓴 것이다. 지금 자료엔 여러 건이 있어
  // 자리와 개수가 어긋난다. 원래 보던 그 한 건만 놓고 잰다.
  if(confirmedOrders.length>1){ const 첫=confirmedOrders[0];
    confirmedOrders.length=0; confirmedOrders.push(첫); }
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.__쓰기=0;
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},setDoc:async()=>{window.__쓰기++;},
    deleteDoc:async()=>{window.__쓰기++;},addDoc:async()=>{window.__쓰기++;},collection:()=>({}),onSnapshot:()=>{},query:x=>x,
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
  const 본=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)본.add(s);});
  const sk=[...본].find(s=>/-재단$/.test(s));
  window._tlDcDate=sk.substring(0,10); renderProcessTimeline();
  try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
  Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
  window._woCutGrpOpen=window._woCutGrpOpen||{};
  (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
  _woRenderBoard(sk);
  const 쓸것=(window._woBoringParts[sk]||[]).find(x=>x.isCuttingCard);
  if(!쓸것) return {없음:true};
  woEditCuttingPlan(쓸것.cKey, sk);            // 보드 카드 '재편집' 으로 들어간다
  const 팝업=document.getElementById('_woInlineEditPanel');
  const bt=팝업 && 팝업.querySelector('#btn-reset-cutting');
  const r=bt?bt.getBoundingClientRect():null;
  return {팝업:!!팝업, 팝업안단추:!!bt, 크기:r?{가로:Math.round(r.width),세로:Math.round(r.height)}:null,
          편집도구수:document.querySelectorAll('#cutting-edit-box').length,
          초기화단추수:document.querySelectorAll('#btn-reset-cutting').length,
          판:document.getElementById('setting-board-size').value,
          P:primarySelectedCardId, 재단계획:Object.keys(window._cuttingPlans).length};
},{O,C,L});
console.log('재편집 팝업: '+JSON.stringify(열기));
판('보드 카드 재편집 팝업이 열린다', 열기.팝업===true, String(열기.팝업));
판('그 팝업 안에도 초기화 단추가 따라온다', 열기.팝업안단추===true, String(열기.팝업안단추));
판('단추가 온 화면에 하나뿐(도구가 하나라 옮겨 다닌다)', 열기.초기화단추수===1 && 열기.편집도구수===1,
   '초기화 '+열기.초기화단추수+'개 · 편집도구 '+열기.편집도구수+'벌');
판('팝업 안에서도 세로 36px 이상', 열기.크기 && 열기.크기.세로>=36, JSON.stringify(열기.크기));

// 팝업 안에서 흐트러뜨리고 초기화
const 흐 = await p.evaluate(()=>{
  const s2=document.getElementById('setting-board-size'); s2.value='3X6'; s2.dispatchEvent(new Event('change'));
  const 돌릴=[...document.querySelectorAll('.rotate-btn')][0]; if(돌릴) 돌릴.click();
  changeSuggestedSheets(1);
  return {판:s2.value, 돌린것:document.querySelectorAll('.rotate-btn.rotated').length, 손장수:isSheetsManual, 장수:suggestedSheets, P:primarySelectedCardId};
});
const 손 = await p.evaluateHandle(()=>document.getElementById('btn-reset-cutting'));
await 손.asElement().tap(); await p.waitForTimeout(600);
const 뒤 = await p.evaluate(()=>({P:primarySelectedCardId, S:secondarySelectedCardId, T:tertiarySelectedCardId,
  돌린것:document.querySelectorAll('.rotate-btn.rotated').length, 손장수:isSheetsManual, 장수:suggestedSheets,
  판:document.getElementById('setting-board-size').value, 전단컷:document.getElementById('setting-front-cut').value,
  톱날:document.getElementById('setting-blade-t').value,
  팝업살아있나:!!document.getElementById('_woInlineEditPanel'),
  재단계획:Object.keys(window._cuttingPlans).length, 확정목록:confirmedCuttingData.length,
  보드카드:Object.keys(window._woBoringParts).reduce((a,k)=>a+window._woBoringParts[k].length,0), 쓰기:window.__쓰기}));
console.log('팝업 안 흐트림: '+JSON.stringify(흐));
console.log('팝업 안 초기화 뒤: '+JSON.stringify(뒤));
console.log('물어본 글: '+JSON.stringify(물은글));
판('팝업 안에서도 처음 상태로 돌아간다', 뒤.P===null && 뒤.S===null && 뒤.T===null && 뒤.돌린것===0
   && 뒤.손장수===false && 뒤.장수===0 && 뒤.판==='4X8' && String(뒤.전단컷)==='5' && String(뒤.톱날)==='4.5',
   JSON.stringify({P:뒤.P,돌린것:뒤.돌린것,손장수:뒤.손장수,장수:뒤.장수,판:뒤.판}));
판('초기화해도 팝업은 안 닫힌다', 뒤.팝업살아있나===true, String(뒤.팝업살아있나));
판('한 번 물어본다', 물은글 && /처음 상태로 되돌립니다/.test(물은글), String(물은글).replace(/\n/g,' / '));
판('겁내지 않게 저장된 계획은 안 지워진다고 적혀 있다', 물은글 && /저장된 재단계획은 지워지지 않습니다/.test(물은글), '적혀 있음');
판('재단계획이 초기화 앞뒤로 그대로', 뒤.재단계획===열기.재단계획,
   '앞 '+열기.재단계획+'장 → 뒤 '+뒤.재단계획+'장');
판('보드 카드도 그대로', 뒤.보드카드>0, 뒤.보드카드+'장');
판('파이어베이스 쓰기 0번', 뒤.쓰기===0, 뒤.쓰기+'번');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'res10   OK':'res10   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
