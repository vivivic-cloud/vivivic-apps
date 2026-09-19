import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899'; const 폭=parseInt(process.argv[2]||'375',10);
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await chromium.launch();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:폭,height:812}, isMobile:폭<500, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1600);
const 준비=await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  Object.values(window._cuttingPlans).forEach(pl=>_ensureCuttingPlanInTimeline(pl));
  // 재단 판에서 한 발주를 골라 부속 일부만 완료로 둔다 (화면 안에서만)
  let 고른=null;
  Object.keys(window._woBoringParts).forEach(sk=>{ if(!/-재단$/.test(sk)||고른) return;
    const ps=window._woBoringParts[sk]||[]; if(ps.length>=3) 고른={sk, ps};});
  if(!고른) return {없음:true};
  const 열쇠=_woOrderMatchKey(고른.ps[0]);
  const 같은=고른.ps.filter(x=>_woOrderMatchKey(x)===열쇠);
  const 행 = x => { const s=String(x.cKey||''); const m=s.match(/card-\d+-(\d+)/); return m?+m[1]:(x.pRowIndex!=null?+x.pRowIndex:null); };
  return {sk:고른.sk, 열쇠, 코드:같은[0].orderCode, 재단카드:같은.length,
    카드들:같은.slice(0,4).map(x=>({부속:x.nm, cKey:String(x.cKey).slice(0,28), 행:행(x)}))};
},{O,C,L});
console.log('■ 재단 쪽 (진짜 자료):', JSON.stringify(준비,null,1));
const 본 = await p.evaluate(({열쇠})=>{
  const sk='2026-09-15-엣지';
  // 엣지 부속은 진짜 자료에 없다 — 재단 카드가 가리키는 원장 행으로 짝이 맞는 가짜 부속을 세운다
  const 재단들=[]; Object.keys(window._woBoringParts).forEach(s2=>{ if(!/-재단$/.test(s2)) return;
    (window._woBoringParts[s2]||[]).forEach(x=>{ if(_woOrderMatchKey(x)===열쇠) 재단들.push({p:x, sk:s2}); }); });
  const 행들=[...new Set(재단들.flatMap(x=>[..._woCutCardRows(x.p)]))].slice(0,4);
  const o=confirmedOrders.find(x=>_woOrderMatchKey({orderCode:x.orderCode,orderKey:x.docId||String(x.idNum)})===열쇠);
  const ok=o.docId||String(o.idNum);
  const parts=행들.map((r,i)=>({cKey:ok+'_card-'+o.idNum+'-'+r, nm:'부속행'+r, pm:4, dq:10,
    orderCode:o.orderCode, orderKey:ok, orderName:o.displayName, plateName:'PB-18T', coating:'양면',
    finish:'화이트', rw:600+i, rd:400, isCuttingCard:false, pRowIndex:r, coveredOrderIds:[o.idNum]}));
  window._woCutGrpOpen={}; window._woCutGrpOpen[sk+'|'+o.orderCode]=true; window._woOnlyMac={};
  window._tlDcDate='2026-09-15'; appMode='process';
  tlExpandDateCard('2026-09-15'); tlDcExpandSection('엣지');
  const st={pool:[]}; ['1호기','2호기','3호기','4호기','5호기'].forEach(m=>st[m]=[]);
  st['1호기']=parts.map(x=>x.cKey);
  window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
  window.__행들=행들; window.__열쇠=열쇠; window.__ok=ok;
  _woRenderBoard(sk);
  return {행들, 엣지부속:parts.length};
},{열쇠:준비.열쇠});
console.log('■ 엣지 부속(가짜) 세움:', JSON.stringify(본));
const 점읽기=()=>p.evaluate(()=>[...document.querySelectorAll('.wo-grp-점 i')].map(e=>{const s=getComputedStyle(e);
  return {모양:e.className||'빈', 테두리:s.borderTopColor, 바탕:s.backgroundColor, 그림:(s.backgroundImage||'').slice(0,60),
    지름:Math.round(e.getBoundingClientRect().width)};}));
const 읽기=()=>p.evaluate(()=>[...document.querySelectorAll('.wo-boring-placed-card')].map(c=>({
  부속:(c.textContent.match(/부속행\d+/)||[''])[0], 대기:c.classList.contains('wo-앞대기카드'),
  글자색:getComputedStyle(c).color, 속투명도:c.firstElementChild?getComputedStyle(c.firstElementChild).opacity:null})));
console.log('■ 재단 완료 0 일 때:', JSON.stringify(await 읽기(),null,1));
// 재단에서 첫 행 하나만 완료로 (화면 안에서만) → 곧바로 다시 그린다
const 뒤=await p.evaluate(()=>{
  const 행=window.__행들[0];
  Object.keys(window._woBoringParts).forEach(sk=>{ if(!/-재단$/.test(sk)) return;
    (window._woBoringParts[sk]||[]).forEach(pp=>{
      if(_woOrderMatchKey(pp)!==window.__열쇠) return;
      if(![..._woCutCardRows(pp)].includes(행)) return;
      const did=pp.orderKey||''; const ck=_woPartKey(pp.cKey,did,pp);
      const o=confirmedOrders.find(x=>(x.docId||String(x.idNum))===did); if(!o) return;
      o.partCompletions=o.partCompletions||{};
      o.partCompletions[ck]=Object.assign({},o.partCompletions[ck],{'재단':{done:true}});
    });
  });
  _woRenderBoard('2026-09-15-엣지');
  return 행;
});
console.log('■ 재단에서 행',뒤,'하나만 끝낸 뒤:', JSON.stringify(await 읽기(),null,1));
// 연한 카드도 손가락으로 잡히는가 (길게 눌러 옮기기)
const cdp=await ctx.newCDPSession(p);
const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
const c=await p.evaluate(()=>{const e=[...document.querySelectorAll('.wo-boring-placed-card.wo-앞대기카드')][0]; if(!e) return null;
  e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2), y:Math.round(b.y+14)};});
if(c){ await 손('touchStart',c.x,c.y); await p.waitForTimeout(460);
  const on=await p.evaluate(()=>!!document.querySelector('.wo-move-on'));
  await 손('touchMove',c.x,c.y+120); await p.waitForTimeout(40);
  const bar=await p.evaluate(()=>!!document.querySelector('.wo-move-bar'));
  await 손('touchEnd',0,0); await p.waitForTimeout(350);
  console.log('  연한 카드 길게 눌러 옮기기: 이동켜짐', on, '· 자리줄', bar); }
console.log('■ 점(재단 한 장 끝난 뒤):', JSON.stringify(await 점읽기(),null,1));
// 엣지까지 끝낸 부속 하나 더 (화면 안에서만)
await p.evaluate(()=>{
  const sk='2026-09-15-엣지'; const ps=window._woBoringParts[sk]||[];
  const p0=ps[0]; const did=p0.orderKey||''; const ck=_woPartKey(p0.cKey,did,p0);
  const o=confirmedOrders.find(x=>(x.docId||String(x.idNum))===did);
  o.partCompletions=o.partCompletions||{};
  o.partCompletions[ck]=Object.assign({},o.partCompletions[ck],{'엣지':{done:true}});
  _woRenderBoard(sk);
});
console.log('■ 점(엣지까지 하나 끝낸 뒤):', JSON.stringify(await 점읽기(),null,1));
const g0=await p.$('.wo-cut-grp'); if(g0) await g0.screenshot({path:'dot3_row.png'});
console.log('  문서 가로', await p.evaluate(()=>document.documentElement.scrollWidth), '· 오류', errs.length, errs.slice(0,2));
await b.close();
