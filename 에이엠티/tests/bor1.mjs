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

const 세움=await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  Object.values(window._cuttingPlans).forEach(pl=>_ensureCuttingPlanInTimeline(pl));
  // 진짜 재단 판에서 발주 하나를 고른다
  let 고른=null;
  Object.keys(window._woBoringParts).forEach(sk=>{ if(!/-재단$/.test(sk)||고른) return;
    const ps=window._woBoringParts[sk]||[]; if(ps.length>=3) 고른={sk, ps};});
  if(!고른) return {없음:true};
  const 열쇠=_woOrderMatchKey(고른.ps[0]);
  const 재단들=[]; Object.keys(window._woBoringParts).forEach(s2=>{ if(!/-재단$/.test(s2)) return;
    (window._woBoringParts[s2]||[]).forEach(x=>{ if(_woOrderMatchKey(x)===열쇠) 재단들.push(x); }); });
  const 행들=[...new Set(재단들.flatMap(x=>[..._woCutCardRows(x)]))].slice(0,4);
  const o=confirmedOrders.find(x=>_woOrderMatchKey({orderCode:x.orderCode,orderKey:x.docId||String(x.idNum)})===열쇠);
  const ok=o.docId||String(o.idNum);
  const 부속=(sk,r,i)=>({cKey:ok+'_card-'+o.idNum+'-'+r, nm:'부속행'+r, pm:4, dq:10,
    orderCode:o.orderCode, orderKey:ok, orderName:o.displayName, plateName:'PB-18T', coating:'양면',
    finish:'화이트', rw:600+i, rd:400, isCuttingCard:false, pRowIndex:r, coveredOrderIds:[o.idNum]});
  // 먼저 칸을 펴 판이 생기게 한 다음, 그 판에 부속을 얹는다(가짜 줄, 화면 안에서만)
  window._woOnlyMac={}; window._tlDcDate='2026-09-15'; appMode='process';
  tlExpandDateCard('2026-09-15'); tlDcExpandSection('엣지'); tlDcExpandSection('보링');
  const 판세움=(공정)=>{ const sk='2026-09-15-'+공정;
    const parts=행들.map((r,i)=>부속(sk,r,i));
    const st={pool:[]}; ['1호기','2호기','3호기','4호기','5호기'].forEach(m=>st[m]=[]);
    st['1호기']=parts.map(x=>x.cKey);
    window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
    window._woCutGrpOpen=window._woCutGrpOpen||{}; window._woCutGrpOpen[sk+'|'+o.orderCode]=true;
    return sk; };
  const skE=판세움('엣지'), skB=판세움('보링');
  window.__그리드=[...document.querySelectorAll('[id^=wo-boring-grid-]')].map(e=>e.id);
  _woRenderBoard(skE); _woRenderBoard(skB);
  window.__={열쇠,ok,행들,skE,skB,코드:o.orderCode};
  // 이 행들이 보링에서 무엇을 기다리는가 (_partPrereqDone 의 판단 그대로)
  const 무엇=행들.map(r=>{ const ck=ok+'_card-'+o.idNum+'-'+r;
    let t={}; try{ t=calcProcessTime(currentFullData[r],1,{},currentFullData[0]); }catch(e){}
    return {행:r, 엣지분:+(t['엣지']||0).toFixed(1), NC분:+(t['NC']||0).toFixed(1), 보링분:+(t['보링']||0).toFixed(1),
      기다리는것:((t['엣지']||0)>0||(t['NC']||0)>0)?'엣지·NC':'재단'}; });
  return {코드:o.orderCode, 행들, 무엇, skB, 그리드:window.__그리드};
},{O,C,L});
console.log('■ 세움:', JSON.stringify(세움,null,1));

const 읽기=async(sk)=>p.evaluate((sk)=>{
  const g=document.getElementById('wo-boring-grid-'+sk); if(!g) return {없음:true};
  const h=g.querySelector('.wo-cut-grp');
  const r=x=>{const b=x.getBoundingClientRect(); return {w:Math.round(b.width),h:Math.round(b.height)};};
  return {
    상품줄: h? {글:h.querySelector('.wo-cut-grp-nm')?.textContent, 셈:h.querySelector('.wo-cut-grp-n')?.textContent,
      아래:h.querySelector('.wo-cut-grp-sub')?.textContent, 앞대기:h.classList.contains('wo-앞대기'),
      크기:r(h), 투명도:getComputedStyle(h.querySelector('.wo-cut-grp-nm')).opacity} : null,
    점: h? [...h.querySelectorAll('.wo-grp-점 i')].map(i=>i.classList.contains('on')?2:(i.classList.contains('wo-앞끝')?1:0)) : null,
    점칸: h&&h.querySelector('.wo-grp-점') ? r(h.querySelector('.wo-grp-점')) : null,
    카드: [...g.querySelectorAll('.wo-boring-placed-card')].map(c=>({
      부속:(c.textContent.match(/부속행\d+/)||[''])[0], 대기:c.classList.contains('wo-앞대기카드'),
      크기:r(c)})),
  };
},sk);
const 찍기=(o)=>(o.없음? {판없음:true} : { 앞대기:o.상품줄?.앞대기, 아래:o.상품줄?.아래, 셈:o.상품줄?.셈, 점:o.점,
  대기카드:o.카드.filter(c=>c.대기).map(c=>c.부속.replace(/(\d+)10$/,'$1')) });
console.log('■ 아무것도 안 끝났을 때 · 보링:', JSON.stringify(찍기(await 읽기(세움.skB))));

const 완료 = (공정, 행) => p.evaluate(({공정,행})=>{
  const {ok,행들}=window.__;
  const 할행 = 행==null? 행들 : [행];
  할행.forEach(r=>{ const o=confirmedOrders.find(x=>(x.docId||String(x.idNum))===ok); if(!o) return;
    const pp=(window._woBoringParts[window.__.skB]||[]).find(z=>z.pRowIndex===r); if(!pp) return;
    const ck=_woPartKey(pp.cKey, ok, pp);
    o.partCompletions=o.partCompletions||{};
    o.partCompletions[ck]=Object.assign({},o.partCompletions[ck],{[공정]:{done:true}});
  });
  _woRenderBoard(window.__.skB); _woRenderBoard(window.__.skE);
},{공정,행});

await 완료('엣지', 세움.행들[0]);
console.log('■ 엣지 한 행('+세움.행들[0]+')만 끝낸 뒤 · 보링:', JSON.stringify(찍기(await 읽기(세움.skB))));
await 완료('엣지', null);
console.log('■ 엣지 다 끝낸 뒤 · 보링:', JSON.stringify(찍기(await 읽기(세움.skB))));
await 완료('보링', 세움.행들[0]);
console.log('■ 보링 한 행도 끝낸 뒤 · 보링:', JSON.stringify(찍기(await 읽기(세움.skB))));
console.log('■ 같은 때 엣지 판:', JSON.stringify(찍기(await 읽기(세움.skE))));
const 재=await 읽기(세움.skB);
console.log('■ 잰 값(폭 '+폭+'): 상품줄', JSON.stringify(재.상품줄?.크기), '· 점칸', JSON.stringify(재.점칸),
  '· 카드1', JSON.stringify(재.카드[0]?.크기), '· 문서가로', await p.evaluate(()=>document.documentElement.scrollWidth));
// 상품 줄을 손가락으로 눌러 접고 편다
const cdp=await ctx.newCDPSession(p);
const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
const c=await p.evaluate((sk)=>{const e=document.querySelector('#wo-boring-grid-'+sk+' .wo-cut-grp'); if(!e) return null;
  e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2), y:Math.round(b.y+b.height/2)};},세움.skB);
if(c){ const 전=(await 읽기(세움.skB)).카드.length;
  await 손('touchStart',c.x,c.y); await p.waitForTimeout(60); await 손('touchEnd',0,0); await p.waitForTimeout(300);
  const 후=await p.evaluate((sk)=>[...document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card')]
    .filter(e=>e.getBoundingClientRect().height>0).length, 세움.skB);
  console.log('■ 상품 줄 손가락 탭: 편 카드', 전, '→ 접은 뒤 보이는 카드', 후); }
console.log('■ 오류', errs.length, errs.slice(0,3));
await b.close();
