// 처음 열었을 때 빈 화면으로 속지 않는가 — 진짜로 열어서 잰다.
// ① 열자마자 「불러오는 중」 이 보이고 빈 목록이 안 보이는가 (열 번)
// ② 하나를 일부러 막으면 「다 못 받았습니다」 가 뜨고 ▶시작이 안 눌리는가
// ③ 다 왔을 때는 전과 똑같이 나오는가
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const C=await (await fetch(B+'/cutting_plans.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };

for (const [폭,opt] of [[375,{...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true}],
                        [1280,{viewport:{width:1280,height:900}}]]) {
console.log('════ 폭 '+폭+'px ════');

// ── ① 열 번 열어서, 처음 화면이 무엇인지 ──────────────────────────────
let 불러오는중=0, 빈목록=0, 딴것=0; const 본것=[];
for (let i=0;i<10;i++){
  const ctx=await b.newContext({...opt, storageState:undefined});   // 캐시 없는 새 창
  const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(900);
  const r=await p.evaluate(()=>{
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    appMode='process'; if(typeof renderProcessTimeline==='function') renderProcessTimeline();
    const c=document.getElementById('process-timeline-container');
    const t=(c&&c.textContent||'').replace(/\s+/g,' ').trim();
    return {글:t.slice(0,70), 받음:JSON.stringify(window._자료옴||{})};
  });
  if(/불러오는 중/.test(r.글)) 불러오는중++;
  else if(/발주확정 버튼을 눌러주세요/.test(r.글)) 빈목록++;
  else 딴것++;
  if(본것.length<2) 본것.push(r);
  await ctx.close();
}
console.log('   열 번 열어 본 첫 화면: 「불러오는 중」 '+불러오는중+'번 · 「비었다」 '+빈목록+'번 · 딴것 '+딴것+'번');
console.log('   보기: '+JSON.stringify(본것[0]));
판('① 처음 열 때 빈 목록으로 속이지 않는다 (10번 중 0번)', 빈목록===0, '「비었다」 '+빈목록+' / 10');
판('① 대신 「불러오는 중」 이 보인다 (10번 중 10번)', 불러오는중===10, '「불러오는 중」 '+불러오는중+' / 10');

// ── ②③ 한 창에서 — 하나 막기 / 다 오기 ─────────────────────────────
const ctx=await b.newContext(opt); const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);

const 채우기 = ({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},deleteDoc:async()=>{},
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{},serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  appMode='process';
};

// ② 재단도면만 못 받은 상태로 둔다
const 막힘 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},deleteDoc:async()=>{},
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{},serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  appMode='process';
  ['원장','발주','차례'].forEach(k=>window._자료왔다(k));
  window._자료탈났다('도면','일부러 막음');
  const c=document.getElementById('process-timeline-container');
  return {글:(c&&c.textContent||'').replace(/\s+/g,' ').trim().slice(0,90),
          다시받기:!!(c&&c.querySelector('button')),
          막힘:window._자료막힘(), 못온:window._자료못옴()};
}, {O,C,L});

console.log('   막았을 때 화면: '+JSON.stringify(막힘));
판('② 하나 못 받으면 크게 알린다', /다 못 받았습니다/.test(막힘.글), 막힘.글.slice(0,40));
판('② 무엇이 안 왔는지 적힌다', /재단도면/.test(막힘.글), 막힘.못온.join(','));
판('② 「다시 받기」 단추가 있다', 막힘.다시받기===true, String(막힘.다시받기));
판('② 작업을 막는 표가 서 있다', 막힘.막힘===true, String(막힘.막힘));

// 막힌 채로 보드를 그리면 ▶시작이 안 나와야 한다
const 막힌보드 = await p.evaluate(()=>{
  const 판=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)판.add(s);});
  const sk=[...판].find(s=>/-재단$/.test(s));
  window.__sk=sk;
  // 판이 없으면 칸을 펴서 만든다
  window._tlDcDate=sk.substring(0,10);
  try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
  if(!document.getElementById('wo-boring-grid-'+sk)) return {판없음:true, sk};
  window._woCutGrpOpen=window._woCutGrpOpen||{};
  (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
  _woRenderBoard(sk);
  const 카드=[...document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card')];
  return {카드:카드.length, 시작단추:카드.filter(c=>[...c.querySelectorAll('button')].some(bb=>/시작/.test(bb.textContent))).length};
});
console.log('   막힌 채 보드: '+JSON.stringify(막힌보드));
판('② 자료를 다 못 받으면 ▶시작이 안 눌린다',
   막힌보드.판없음 ? true : 막힌보드.시작단추===0,
   막힌보드.판없음 ? '판 자체가 안 그려짐(더 안전)' : '시작 단추 '+막힌보드.시작단추+' / 카드 '+막힌보드.카드);

// ③ 다 왔을 때는 전과 똑같이
const 다옴 = await p.evaluate(()=>{
  window._자료왔다('도면'); window._자료늦음=false; window._자료탈={};
  const sk=window.__sk;
  window._tlDcDate=sk.substring(0,10); renderProcessTimeline();
  try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
  Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
  window._woCutGrpOpen=window._woCutGrpOpen||{};
  (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
  _woRenderBoard(sk);
  const 카드=[...document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card')];
  const c=document.getElementById('process-timeline-container');
  return {카드:카드.length, 도면:카드.filter(x=>x.querySelector('svg')).length,
          단추:카드.filter(x=>/시작|완료|편집중/.test(x.textContent||'')).length,
          경고:/다 못 받았습니다|불러오는 중/.test((c&&c.textContent)||''),
          막힘:window._자료막힘()};
});
console.log('   다 왔을 때: '+JSON.stringify(다옴));
판('③ 다 오면 경고가 사라진다', 다옴.경고===false && 다옴.막힘===false, '경고 '+다옴.경고+' · 막힘 '+다옴.막힘);
판('③ 다 오면 카드가 전과 똑같이 나온다', 다옴.카드>0 && 다옴.도면===다옴.카드 && 다옴.단추===다옴.카드,
   '카드 '+다옴.카드+' · 도면 '+다옴.도면+' · 단추 '+다옴.단추);
// ④ 자료 듣기가 한 번만 서는지는 여기서 못 잰다 — 이 상자에서는 파이어베이스 모듈이
// 아예 안 불러와져서 그 코드가 돌지 않는다. 못 쟀다고 적는다.
console.log('   ④ 자료 듣기 한 번만 서는지 — 이 상자에서 못 잼 (파이어베이스 모듈이 안 실행됨)');

판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
await ctx.close();
}
console.log(실패===0?'boot1   OK':'boot1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
