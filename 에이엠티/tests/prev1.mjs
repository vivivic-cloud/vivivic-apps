import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899'; const 폭=parseInt(process.argv[2]||'375',10);
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const C=await (await fetch(B+'/cutting_plans.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:폭,height:812}, isMobile:폭<500, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1600);
const 준비 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  Object.values(window._cuttingPlans).forEach(pl=>_ensureCuttingPlanInTimeline(pl));
  // 재단 판마다 발주별 완료 상태를 먼저 본다 (읽기만)
  const 표={};
  Object.keys(window._woBoringParts).forEach(sk=>{
    if(!/-재단$/.test(sk)) return;
    (window._woBoringParts[sk]||[]).forEach(pp=>{
      const k=_woOrderMatchKey(pp); 표[k]=표[k]||{코드:pp.orderCode,전체:0,완료:0};
      표[k].전체++; if(_woCutCardDone(pp,pp.cKey,sk)) 표[k].완료++;
    });
  });
  return 표;
},{O,C,L});
console.log('■ 재단 판의 발주별 완료 (진짜 자료):', JSON.stringify(준비,null,1));
// 엣지 판을 가짜 부속 줄로 만든다 — 진짜 자료엔 엣지 부속이 없다
const 결과 = await p.evaluate(()=>{
  const sk='2026-09-15-엣지';
  const parts=[];
  confirmedOrders.forEach((o,i)=>{
    ['가와','상판','지판'].forEach((nm,j)=>parts.push({cKey:'E_'+o.orderCode+'_'+nm,nm,pm:4,dq:10,
      orderCode:o.orderCode,orderKey:o.docId||String(o.idNum),orderName:o.displayName,plateName:'PB-18T',
      coating:'양면',finish:'화이트',rw:600+j,rd:400,isCuttingCard:false,pRowIndex:null,coveredOrderIds:[o.idNum]}));
  });
  window._woCutGrpOpen={}; window._woOnlyMac={};
  window._tlDcDate='2026-09-15'; appMode='process';
  tlExpandDateCard('2026-09-15'); tlDcExpandSection('엣지');
  const st={pool:[]}; ['1호기','2호기','3호기','4호기','5호기'].forEach(m=>st[m]=[]);
  st['1호기']=parts.map(x=>x.cKey);
  window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
  _woRenderBoard(sk);
  return [...document.querySelectorAll('.wo-cut-grp')].map(g=>{
    const nm=g.querySelector('.wo-cut-grp-nm'); const code=g.querySelector('.wo-cut-grp-code');
    return {오더:code?code.textContent:'', 상품:(nm?nm.textContent:'').slice(0,14),
      앞대기:g.classList.contains('wo-앞대기'), 다끝:g.classList.contains('wo-다끝'),
      이름투명도:nm?getComputedStyle(nm).opacity:null, 이름색:nm?getComputedStyle(nm).color:null,
      표:(g.querySelector('.wo-앞대기-표')||{}).textContent||null};
  });
});
console.log('■ 폭',폭,'엣지 줄:', JSON.stringify(결과,null,1));
// 재단을 다 끝낸 경우 — 화면 안(메모리)에서만 완료로 찍어 본다. 파이어베이스에는 한 줄도 안 쓴다.
const 후 = await p.evaluate(()=>{
  const 판들=window._woBoringParts||{};
  Object.keys(판들).forEach(sk=>{ if(!/-재단$/.test(sk)) return;
    (판들[sk]||[]).forEach(pp=>{
      if(!/^샘플-20260101-01\|/.test(_woOrderMatchKey(pp))) return;
      const did=pp.orderKey||''; const ck=_woPartKey(pp.cKey,did,pp);
      const o=confirmedOrders.find(x=>(x.docId||String(x.idNum))===did);
      if(!o) return; o.partCompletions=o.partCompletions||{};
      o.partCompletions[ck]=Object.assign({},o.partCompletions[ck],{'재단':{done:true}});
    });
  });
  _woRenderBoard('2026-09-15-엣지');
  return [...document.querySelectorAll('.wo-cut-grp')].map(g=>{
    const nm=g.querySelector('.wo-cut-grp-nm'); const code=g.querySelector('.wo-cut-grp-code');
    return {오더:code?code.textContent:'', 앞대기:g.classList.contains('wo-앞대기'),
      이름투명도:nm?getComputedStyle(nm).opacity:null, 표:(g.querySelector('.wo-앞대기-표')||{}).textContent||null};
  });
});
console.log('■ 첫 발주 재단을 다 끝낸 뒤(메모리에서만):', JSON.stringify(후,null,1));
// 옅어진 줄도 눌리는가
const cdp=await ctx.newCDPSession(p);
const r=await p.evaluate(()=>{const g=[...document.querySelectorAll('.wo-cut-grp')].find(x=>x.classList.contains('wo-앞대기')); if(!g) return null; g.scrollIntoView({block:'center'}); const b=g.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)};});
if(r){ await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y,radiusX:14,radiusY:14,force:1}]});
  await p.waitForTimeout(110); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(400);
  console.log('  재단 대기 줄 톡 → 펼쳐진 카드 수:', await p.evaluate(()=>[...document.querySelectorAll('.wo-boring-placed-card')].filter(e=>e.offsetParent!==null).length)); }
console.log('  문서 가로', await p.evaluate(()=>document.documentElement.scrollWidth), '· 오류', errs.length, errs.slice(0,2));
await b.close();
