// 「다른카드에 편집중」 칸이 진짜 완료 칸과 결이 같은가 — 숫자로.
// 글이 칸을 넘는지 · 글자 크기 · 두 칸 높이 · 제일 긴 부속 이름으로도.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const C=await (await fetch(B+'/cutting_plans.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };

// 원장에서 제일 긴 부속명을 찾는다 (곁가지로 앉을 수 있는 이름들)
const h=L[0]; const iN=h.indexOf('부속명');
let 긴이름=''; for(let i=1;i<L.length;i++){ const v=String((L[i]||[])[iN]||'').trim(); if(v.length>긴이름.length) 긴이름=v; }
console.log('■ 원장에서 제일 긴 부속명: 「'+긴이름+'」 ('+긴이름.length+'자)');

for (const [폭,opt] of [[375,{...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true}],
                        [1280,{viewport:{width:1280,height:900}}]]) {
const ctx=await b.newContext(opt); const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1700);
console.log('════ 폭 '+폭+'px ════');

const 세움 = (이름)=>p.evaluate(({O,C,L,이름})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(JSON.parse(JSON.stringify(x))));
  // 이 시험은 발주가 한 건이던 때 쓴 것이다. 지금 자료엔 여러 건이 있어
  // 자리와 개수가 어긋난다. 원래 보던 그 한 건만 놓고 잰다.
  if(confirmedOrders.length>1){ const 첫=confirmedOrders[0];
    confirmedOrders.length=0; confirmedOrders.push(첫); }
  // 사장님이 실제로 찍으신 시작·완료 기록이 자료에 들어 있다. 시험은 아무것도
  // 안 찍힌 자리에서 시작해야 뜻이 있으므로, 이 창에서만 지우고 쓴다(파이어베이스는 안 건드린다).
  confirmedOrders.forEach(o=>{ o.partStarted={}; o.partCompletions={}; });
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x.slice ? x.slice() : x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=JSON.parse(JSON.stringify(x));});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},deleteDoc:async()=>{},
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{},serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  appMode='process'; window._woOnlyMac={};
  const o0=confirmedOrders[0];
  const 날0=(o0.procOverrides&&o0.procOverrides['재단'])||o0.deliveryDate;
  window._tlDcDate=날0; renderProcessTimeline();
  try{tlExpandDateCard(날0);}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
  const 판=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)판.add(s);});
  const sk=[...판].find(s=>/-재단$/.test(s));
  if(!document.getElementById('wo-boring-grid-'+sk)){
    window._tlDcDate=sk.substring(0,10); renderProcessTimeline();
    try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
    Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
  }
  window._woCutGrpOpen=window._woCutGrpOpen||{};
  (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
  const hh=currentFullData[0];
  const 부속=(window._woBoringParts[sk]||[]);
  /* 부속 이름(이동선반L·S)을 못 박아 두었더니 그 발주가 목록에서 빠지자 시험이 멈췄다.
     이름을 안 박고, 그때 보드에 실제로 선 재단카드 가운데 제 몫을 스스로 자르는 것
     둘을 골라 쓴다 — 내주는 쪽(Lp)과 받는 쪽(Sc). 자료가 바뀌어도 견딘다. */
  const 쓸만=부속.filter(x=>x.isCuttingCard && (x.sheets||0)>0 && !(x.받은몫>0)
                        && x.pRowIndex!=null && x.orderKey);
  const Lp=쓸만[0];
  const Sc=쓸만.find(x=>x!==Lp && x.orderKey===Lp.orderKey && x.pRowIndex!==Lp.pRowIndex);
  if(!Lp||!Sc) return {못고름:true, 있는것:부속.map(x=>x.nm+'('+(x.sheets||0)+'장)')};
  // 도면 이름을 제일 긴 것으로 갈아 끼운다(화면 안에서만) — 이름이 길 때도 앉는지 보려고
  if(이름) currentFullData[Lp.pRowIndex][hh.indexOf('부속명')] = 이름;
  const Lpl=Object.values(window._cuttingPlans).find(x=>String(x.confirmId)===String(Lp.planId));
  Lpl.sRowIndex=Sc.pRowIndex; Lpl.sId='agg-card-'+Sc.pRowIndex; Lpl.sProducedQty=Sc.dq;
  Lpl.sOrderIds=[...(Lpl.pOrderIds||[])];
  Lpl.sInfoText=(Sc.w||0)+' X '+(Sc.d||0)+' - '+Sc.nm+' - '+Sc.dq+' EA';
  // 다른 카드 하나는 진짜 완료로 찍어 둔다 — 나란히 놓고 결을 견주려고
  // 견줄 카드도 이름을 안 박는다 — 내주는·받는 쪽이 아닌 다른 재단카드 하나면 된다
  const 견줄=부속.find(x=>x.isCuttingCard && x!==Lp && x!==Sc && (x.sheets||0)>0) || 쓸만[2] || Sc;
  const did=견줄.orderKey||''; const oo=confirmedOrders.find(x=>(x.docId||String(x.idNum))===did);
  oo.partCompletions=oo.partCompletions||{};
  oo.partCompletions[_woPartKey(견줄.cKey,did,견줄)]={'재단':{done:true}};
  Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
  _woRenderBoard(sk);
  window.__={sk};
  return {sk, 카드:(window._woBoringParts[sk]||[]).length};
},{O,C,L,이름});

const 재기 = ()=>p.evaluate(()=>{
  const g='#wo-boring-grid-'+window.__.sk+' ';
  const 카드=[...document.querySelectorAll(g+'.wo-boring-placed-card')];
  const 자=el=>{const r=el.getBoundingClientRect(); return {w:Math.round(r.width), h:Math.round(r.height)};};
  const 넘침=el=>el.scrollWidth>el.clientWidth+1 || el.scrollHeight>el.clientHeight+1;
  const 밖=el=>{const c=el.closest('.wo-boring-placed-card'); if(!c) return false;
    const a=el.getBoundingClientRect(), bb=c.getBoundingClientRect();
    return a.right>bb.right+1 || a.left<bb.left-1 || a.bottom>bb.bottom+1;};
  const 편집칸=[...document.querySelectorAll(g+'span')].find(e=>/^다른카드에 편집중/.test(e.textContent||''));
  const 완료칸=[...document.querySelectorAll(g+'span')].find(e=>/^✓ 완료/.test(e.textContent||''));
  const 글=e=>e?{크기:getComputedStyle(e).fontSize, 줄간:getComputedStyle(e).lineHeight,
                 여백:getComputedStyle(e).padding, 모서리:getComputedStyle(e).borderRadius,
                 바탕:getComputedStyle(e).backgroundColor}:null;
  return {
    카드수:카드.length, 도면:카드.filter(c=>c.querySelector('svg')).length,
    편집:편집칸?{글자:편집칸.textContent.trim().replace(/\s+/g,' '), 칸:자(편집칸), 넘침:넘침(편집칸), 밖으로:밖(편집칸), ...글(편집칸)}:null,
    완료:완료칸?{글자:완료칸.textContent.trim().replace(/\s+/g,' '), 칸:자(완료칸), 넘침:넘침(완료칸), ...글(완료칸)}:null,
    아랫줄:(()=>{const e=편집칸&&편집칸.querySelector('span'); return e?{글자:e.textContent.trim(), 크기:getComputedStyle(e).fontSize, 넘침:넘침(e)}:null;})(),
    카드터짐:카드.filter(c=>c.scrollWidth>c.clientWidth+1).length,
    본문가로:document.documentElement.scrollWidth>document.documentElement.clientWidth+1
  };
});

for (const [딱지, 이름] of [['보통 이름 (이동선반L)', null], ['제일 긴 이름 ('+긴이름+')', 긴이름]]) {
  await 세움(이름); await p.waitForTimeout(300);
  const r = await 재기();
  console.log('── '+딱지);
  console.log('   편집중 칸:', JSON.stringify(r.편집));
  console.log('   아랫줄   :', JSON.stringify(r.아랫줄));
  console.log('   완료 칸  :', JSON.stringify(r.완료));
  판(딱지+' — 글이 칸을 안 넘친다', r.편집 && !r.편집.넘침, r.편집?String(r.편집.넘침):'칸 없음');
  판(딱지+' — 칸이 카드 밖으로 안 나간다', r.편집 && !r.편집.밖으로 && r.카드터짐===0,
     '밖으로 '+(r.편집?r.편집.밖으로:'?')+' · 카드터짐 '+r.카드터짐);
  판(딱지+' — 아랫줄(도면 이름)이 보인다', r.아랫줄 && /도면$/.test(r.아랫줄.글자),
     r.아랫줄?r.아랫줄.글자:'없음');
  판(딱지+' — 완료 칸과 폭이 같다 (결이 같다)', r.편집&&r.완료 && Math.abs(r.편집.칸.w-r.완료.칸.w)<=2,
     r.편집&&r.완료 ? '편집중 '+r.편집.칸.w+'×'+r.편집.칸.h+' · 완료 '+r.완료.칸.w+'×'+r.완료.칸.h : '못 잼');
  판(딱지+' — 모서리·바탕결이 완료 칸과 같은 꼴', r.편집&&r.완료 && r.편집.모서리===r.완료.모서리 && r.편집.바탕!==r.완료.바탕,
     r.편집&&r.완료 ? '모서리 '+r.편집.모서리+'='+r.완료.모서리+' · 바탕 '+r.편집.바탕+' vs '+r.완료.바탕 : '못 잼');
  판(딱지+' — 높이가 완료 칸보다 많이 크지 않다 (두 줄이라 조금 큼)',
     r.편집&&r.완료 && (r.편집.칸.h - r.완료.칸.h) <= 12,
     '편집중 '+(r.편집?r.편집.칸.h:'?')+'px · 완료 '+(r.완료?r.완료.칸.h:'?')+'px · 차이 '+(r.편집&&r.완료?(r.편집.칸.h-r.완료.칸.h):'?')+'px');
  판(딱지+' — 본문 가로스크롤 없음 · 도면 다 보임', !r.본문가로 && r.도면===r.카드수,
     '가로스크롤 '+r.본문가로+' · 도면 '+r.도면+'/'+r.카드수);
}
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
await ctx.close();
}
console.log(실패===0?'fit1   OK':'fit1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
