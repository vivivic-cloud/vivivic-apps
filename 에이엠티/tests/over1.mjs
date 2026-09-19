// 손 검산 맞추기 — 발주 샘플-20260101-04(본보기 5단, 55세트)의 '가와'(원장 259행)는
// 재단도면 네 장에 걸쳐 각 100개씩 나온다. 그 중 한 장을 완료 찍을 때
// 화면이 내는 숫자가 손으로 센 것과 같은가.
import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
import { readFileSync } from 'node:fs';
const HERE = await 자재();   // 막힌 CDN 대신 쓸 것들 — 없으면 스스로 갖춘다
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
await ctx.route('https://cdn.tailwindcss.com*', r=>r.fulfill({status:200,contentType:'application/javascript',
  body:'document.write('+JSON.stringify('<style>'+CSS+'</style>')+');'}));
for (const [무늬,길] of [['https://cdn.sheetjs.com/**','node_modules/xlsx/dist/xlsx.full.min.js'],
                        ['https://cdn.jsdelivr.net/npm/sortablejs**','node_modules/sortablejs/Sortable.min.js'],
                        ['https://cdn.jsdelivr.net/npm/gsap**','node_modules/gsap/dist/gsap.min.js']])
  await ctx.route(무늬, r=>r.fulfill({status:200,contentType:'application/javascript',body:readFileSync(HERE+'/'+길,'utf-8')}));
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);

const 답 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  document.documentElement.removeAttribute('data-amthome'); switchPage('process');
  window.__쓰기=0;
  const 셈=()=>async()=>{window.__쓰기++;};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:셈(),setDoc:셈(),deleteDoc:셈(),addDoc:셈(),
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push({...x, checked:true}));
  confirmedOrders.forEach(o=>{ o.partStarted={}; o.partCompletions={}; });
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]={...x, planId:String(x.confirmId)};});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
  // 실제 흐름과 같게 — 보드를 먼저 세운다(완료 창은 보드가 선 뒤에 뜬다)
  const 본=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const k=_ensureCuttingPlanInTimeline(x); if(k)본.add(k);});
  // 보드에 오른 재단카드 가운데, 그 부속(원장 행)이 여러 도면에 걸친 것을 고른다
  const 오른것=[];
  Object.keys(window._woBoringParts||{}).forEach(sk=>{
    if(!/-재단$/.test(sk)) return;
    (window._woBoringParts[sk]||[]).forEach(x=>{ if(x.isCuttingCard) 오른것.push({sk, p:x}); });
  });
  const 재기 = (planId) => {
    const pl=window._cuttingPlans[planId]; if(!pl) return null;
    const 만든때=_cutPlanMadeAt(pl);
    const ids=[...new Set([...(pl.pOrderIds||[]),...(pl.sOrderIds||[]),...(pl.tOrderIds||[])])];
    const 산것=ids.map(id=>_cutPlanOwner(id,만든때,pl)||_cutPlanOwner(id,Infinity,pl)).filter(Boolean);
    if(!산것.length) return {planId, 못:'임자 발주 못 찾음'};
    const 행=parseInt(pl.pRowIndex,10); if(isNaN(행)) return {planId, 못:'행 없음'};
    const 키=new Set(산것.map(o=>o.docId||String(o.idNum)));
    const 발주수량=_cuttingReqQtyFor(pl,산것);
    const 다른=_이미잘린몫(행, 키, pl.confirmId);
    const 이번=pl.pProducedQty||0;
    return {planId, 행, 부속:pl.pInfoText, 발주:발주수량, 다른, 이번, 합:다른+이번,
            오바:(다른+이번)-발주수량, 발주들:산것.map(o=>({코드:o.orderCode, 수량:o.orderQty}))};
  };
  const 잰것=오른것.map(x=>재기(x.p.planId)).filter(Boolean);
  const 걸친것=잰것.filter(x=>x.다른>0);
  return {보드카드:오른것.length, 걸친것수:걸친것.length,
          걸친것, 보기:걸친것.slice(0,4), 쓰기:window.__쓰기};
}, {O,C,L});
console.log('앱이 낸 숫자: '+JSON.stringify(답,null,1));

// ── 손으로 센 것과 맞추기 (원장·발주·재단도면 원자료에서 직접 셈)
const h=L[0], uc칸=h.indexOf('세트별소모량'), 부속칸=h.indexOf('부속명');
const 손셈 = (행, 발주코드, 이번도면) => {
  const o=O.find(x=>x.orderCode===발주코드);
  const u=parseFloat(L[행][uc칸])||1;
  let 다른=0; const 본=new Set();
  C.forEach(c=>{ const n=String(c.confirmId); if(본.has(n)) return; 본.add(n);
    if(n===이번도면) return;
    ['p','s','t'].forEach(급=>{ if(c[급+'RowIndex']!==행) return;
      const q=parseInt(c[급+'ProducedQty']||0,10)||0; if(q<=0) return;
      if(!(c[급+'OrderIds']||[]).includes(o.idNum)) return; 다른+=q; });
  });
  return {부속:L[행][부속칸], 세트별소모량:u, 세트:o.orderQty, 발주:Math.round(u*o.orderQty), 다른};
};

판('보드에 한 부속이 여러 도면에 걸친 카드가 있다', (답.걸친것||[]).length>0,
   '걸친 카드 '+답.걸친것수+'장 / 보드 재단카드 '+답.보드카드+'장');

if ((답.보기||[]).length) {
  const 화면=답.보기[0];
  const 손=손셈(화면.행, 화면.발주들[0].코드, 화면.planId);
  console.log('   손으로 센 것: '+JSON.stringify(손));
  console.log('   화면이 낸 것: 발주 '+화면.발주+' · 다른 도면 '+화면.다른);
  판('발주수량이 손 셈과 같다 (세트별소모량 x 세트수)', 화면.발주===손.발주,
     손.세트별소모량+' x '+손.세트+' = '+손.발주+' · 화면 '+화면.발주);
  판('다른 도면 몫이 손 셈과 같다', 화면.다른===손.다른, '손 '+손.다른+' · 화면 '+화면.다른);
  판('합계 = 다른 도면 + 이번', 화면.합===화면.다른+화면.이번,
     화면.다른+' + '+화면.이번+' = '+화면.합);
  판('오바 = 합계 − 발주수량', 화면.오바===화면.합-화면.발주,
     화면.합+' − '+화면.발주+' = '+화면.오바);
}
판('파이어베이스 쓰기 0', 답.쓰기===0, 답.쓰기+'번');
판('페이지오류 없음', errs.length===0, String(errs.length));
console.log(실패===0?'over1   OK':'over1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
