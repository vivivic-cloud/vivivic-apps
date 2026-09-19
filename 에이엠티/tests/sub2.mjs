import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899'; const 폭=parseInt(process.argv[2]||'375',10);
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await chromium.launch();
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:폭,height:812},isMobile:폭<500,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1600);
const 준비=await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{},deleteDoc:async()=>{}}; window.db={};
  Object.values(window._cuttingPlans).forEach(pl=>_ensureCuttingPlanInTimeline(pl));
  // 자투리에 함께 앉힌 부속이 있는 재단도 카드를 찾는다
  let 찾음=null;
  Object.keys(window._woBoringParts).forEach(sk=>{ if(찾음||!/-재단$/.test(sk)) return;
    (window._woBoringParts[sk]||[]).forEach(x=>{ if(찾음) return;
      if(x.isCuttingCard && x.extras && x.extras.length) 찾음={sk, cKey:x.cKey, p:x}; }); });
  if(!찾음) return {없음:true};
  window.__찾음=찾음;
  return {sk:찾음.sk, cKey:String(찾음.cKey), 부속:찾음.p.nm, 제품:찾음.p.orderName,
    치수:찾음.p.rw+'x'+찾음.p.rd, 장수:찾음.p.sheets, 필요:찾음.p.dq,
    함께앉은것:찾음.p.extras, 계획:String(찾음.p.planId)};
},{O,C,L});
console.log('■ 고른 재단도 (진짜 자료):', JSON.stringify(준비,null,1));
if(준비.없음){ console.log('없음'); await p.evaluate(()=>{const e=document.getElementById('board-usage-info'); if(e) e.scrollIntoView({block:'center'});});
await p.waitForTimeout(200);
await p.screenshot({path:process.argv[3]||'/tmp/sub.png'});
await b.close(); process.exit(0); }
await p.evaluate(({sk})=>{ const d=sk.slice(0,10); appMode='process'; window._tlDcDate=d;
  if(typeof amtOpenBox==='function') amtOpenBox('process');
  tlExpandDateCard(d); tlDcExpandSection('재단'); }, 준비);
await p.waitForTimeout(500);
await p.evaluate(()=>{ woEditCuttingPlan(window.__찾음.cKey, window.__찾음.sk); });
await p.waitForTimeout(700);
const 읽기=()=>p.evaluate(()=>{
  const t=id=>{const e=document.getElementById(id); if(!e) return '(칸 없음)';
    const 숨=e.closest('.hidden')||(e.parentElement&&e.parentElement.classList.contains('hidden'));
    return (숨?'[숨김] ':'')+(e.textContent||'').trim();};
  const rect=document.getElementById('board-rect');
  const 조각=rect?[...rect.querySelectorAll('.placed-part')].map(e=>e.textContent.trim()):[];
  const 셈={}; 조각.forEach(x=>셈[x]=(셈[x]||0)+1);
  return {
    도면글: rect? (rect.innerText||'').replace(/\s*\n+\s*/g,' ').trim().slice(0,120) : '(도면 없음)',
    조각셈: 셈,
    '1순위줄': t('part-production-detail-text'),
    '2순위줄': t('residue-production-detail-text'),
    '2순위줄숨김': await0('residue-production-info-row'),
    '3순위줄': t('tertiary-production-detail-text'),
    '3순위줄숨김': await0('tertiary-production-info-row'),
    원장장수: t('material-id-label-text'),
  };
  function await0(id){const e=document.getElementById(id); return e? e.classList.contains('hidden') : null;}
});
console.log('■ 재단편집 화면:', JSON.stringify(await 읽기(),null,1));
// 보여 주는 수량 = 합계에 들어가는 수량인가
console.log('■ 수량 견주기:', JSON.stringify(await p.evaluate(()=>{
  const 찾=window.__찾음, pl=window._cuttingPlans[찾.p.planId];
  const h=currentFullData[0], 공=h.indexOf('공급처'), 부=h.indexOf('부속명');
  const ids=[...new Set([...(pl.pOrderIds||[]),...(pl.sOrderIds||[])])];
  const o=confirmedOrders.find(x=>ids.includes(x.idNum));
  const 줄=k=>currentFullData[parseInt(String(k).split('-').pop())];
  const 보이는=o?Object.keys(o.partInfoMap).filter(k=>!o.partInfoMap[k].isDeleted):[];
  const 표=보이는.map(k=>{const r=줄(k); return r?{이름:r[부],공급처:normalizeValue(r[공])||'(빈칸)',수량:o.partInfoMap[k].qty}:null;}).filter(Boolean);
  const 전도=표.find(x=>String(x.이름).includes('전도방지'));
  // renderOrderParts 가 cachedWorkTime 을 채울 때 쓰는 규칙: 공급처 AMT 줄만
  return {발주:o&&o.orderCode, 화면에적는수량:(찾.p.extras[0]||{}).수,
    계획이든수량:pl.sProducedQty, 이발주의전도방지:전도||'(이 발주엔 없음)',
    합계가세는부속:표.filter(x=>x.공급처==='AMT').map(x=>x.이름+' '+x.수량),
    합계가빼는부속:표.filter(x=>x.공급처!=='AMT').map(x=>x.이름+' '+x.수량+' ('+x.공급처+')'),
    지금합계:o&&o.cachedWorkTime||null};
}),null,1));
const 칸=await p.evaluate(()=>{const e=document.getElementById('board-usage-info');
  if(!e) return null; const r=e.getBoundingClientRect();
  return {w:Math.round(r.width), 넘침:e.scrollWidth>e.clientWidth+1};});
console.log('■ 잰 값(폭 '+폭+'): 글 칸', JSON.stringify(칸),
  '· 문서 가로', await p.evaluate(()=>document.documentElement.scrollWidth), '· 오류', errs.length, errs.slice(0,2));
await p.evaluate(()=>{const e=document.getElementById('board-usage-info'); if(e) e.scrollIntoView({block:'center'});});
await p.waitForTimeout(200);
await p.screenshot({path:process.argv[3]||'/tmp/sub.png'});
await b.close();
