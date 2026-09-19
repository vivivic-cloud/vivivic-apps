// 되돌렸을 때 그 자리에서 풀리는가 — 진짜 편집 흐름으로. 새로고침 없이 네 번 이어서.
// 재단편집 팝업을 열고 → 이동선반S 를 골라 → 재단확정 → 다시 열어 빼고 → 재단확정.
// 파이어스토어는 가짜로 막고 몇 번 불렸는지 센다.
import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };

for (const [폭,opt] of [[375,{...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true}],
                        [1280,{viewport:{width:1280,height:900}}]]) {
const ctx=await b.newContext(opt); const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1700);
console.log('════ 폭 '+폭+'px ════');

const 세움 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  // 이 시험은 발주가 한 건이던 때 쓴 것이다. 지금 자료엔 여러 건이 있어
  // 자리와 개수가 어긋난다. 원래 보던 그 한 건만 놓고 잰다.
  if(confirmedOrders.length>1){ const 첫=confirmedOrders[0];
    confirmedOrders.length=0; confirmedOrders.push(첫); }
  // 사장님이 실제로 찍으신 시작·완료 기록이 자료에 들어 있다. 시험은 아무것도
  // 안 찍힌 자리에서 시작해야 뜻이 있으므로, 이 창에서만 지우고 쓴다(파이어베이스는 안 건드린다).
  confirmedOrders.forEach(o=>{ o.partStarted={}; o.partCompletions={}; });
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window.__쓰기=0; window.__지움=0;
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},
    setDoc:async()=>{window.__쓰기++;}, deleteDoc:async()=>{window.__지움++;},
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{window.__쓰기++;},
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  // 칸을 먼저 펴고(그 사이 재단 날짜가 정해진다) 그 다음에 판을 잡는다
  appMode='process'; window._woOnlyMac={};
  const o0=confirmedOrders[0];
  const 날0=(o0.procOverrides&&o0.procOverrides['재단'])||o0.deliveryDate;
  window._tlDcDate=날0;
  renderProcessTimeline(); try{tlExpandDateCard(날0);}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
  const 판=new Set();
  Object.values(window._cuttingPlans).forEach(pl=>{const s=_ensureCuttingPlanInTimeline(pl); if(s)판.add(s);});
  const sk=[...판].find(s=>/-재단$/.test(s));
  // 도면이 올라간 그 날짜의 칸을 다시 편다 — 판이 생긴 뒤라야 칸이 나온다
  if(!document.getElementById('wo-boring-grid-'+sk)){
    window._tlDcDate=sk.substring(0,10);
    renderProcessTimeline();
    try{tlExpandDateCard(sk.substring(0,10));}catch(e){}
    try{tlDcExpandSection('재단');}catch(e){}
    Object.values(window._cuttingPlans).forEach(pl=>_ensureCuttingPlanInTimeline(pl));
  }
  window._woCutGrpOpen=window._woCutGrpOpen||{};
  (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
  _woRenderBoard(sk);
  const 부속=window._woBoringParts[sk]||[];
  /* 예전에는 이동선반L·S 를 이름으로 못 박아 집었다. 그 부속이 든 발주가 목록에서
     빠지자 시험이 통째로 멈췄다. 이름을 못 박지 않고, 그때 보드에 실제로 선 재단카드
     가운데 제 몫을 스스로 자르는 것 둘을 골라 쓴다 — 하나는 내주는 쪽(L),
     하나는 받는 쪽(S). 자료가 바뀌어도 견딘다. */
  const 쓸만한=부속.filter(x=>x.isCuttingCard && (x.sheets||0)>0 && !(x.받은몫>0)
                         && x.pRowIndex!=null && x.orderKey);
  const Lp=쓸만한[0];
  const Sp=쓸만한.find(x=>x!==Lp && x.orderKey===Lp.orderKey && x.pRowIndex!==Lp.pRowIndex);
  if(!Lp||!Sp) return {못고름:true, 있는것:부속.map(x=>x.nm+'('+(x.sheets||0)+'장)')};
  // 밑판을 깨끗이 — 저장된 자료에 이미 사장님이 하신 L→S 편집이 들어 있다
  Object.values(window._cuttingPlans).forEach(x=>{
    ['s','t'].forEach(g=>{ if(parseInt(x[g+'RowIndex'],10)===Sp.pRowIndex){
      x[g+'Id']=null; x[g+'RowIndex']=null; x[g+'ProducedQty']=0; x[g+'OrderIds']=[]; x[g+'InfoText']=''; }});
  });
  Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
  _woRenderBoard(sk);
  window.__={sk, L:Lp.cKey, S행:Sp.pRowIndex, S이름:Sp.nm, L이름:Lp.nm, S열쇠:Sp.cKey};
  return {sk, L:Lp.cKey, S행:Sp.pRowIndex, 내주는쪽:Lp.nm, 받는쪽:Sp.nm,
          카드:(window._woBoringParts[sk]||[]).length};
},{O,C,L});
console.log('■ 세움', JSON.stringify(세움));

// S 카드 상태를 읽는다
const S보기 = ()=>p.evaluate(()=>{
  const sk=window.__.sk;
  const x=(window._woBoringParts[sk]||[]).find(z=>z.pRowIndex===window.__.S행);
  const 카드=[...document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card')];
  // 이름이 같은 카드가 둘 있을 수 있다 — 그 카드의 도면 열쇠로 집는다
  const c=카드.find(e=>(e.outerHTML||'').includes(window.__.S열쇠))
          || 카드.find(e=>(e.textContent||'').includes(window.__.S이름));
  return { 받은몫:x?(x.받은몫||0):null, 원장:x?x.sheets:null, 작업:x?_cuttingYield(x):null,
    편집중: c? /다른카드에 편집중/.test(c.textContent||'') : null,
    완료표기: c? /✓ 완료/.test(c.textContent||'') : null,
    초록: c? (()=>{const e=[...c.querySelectorAll('span')].find(z=>/다른카드에 편집중|✓ 완료/.test(z.textContent||''));
        return e? getComputedStyle(e).backgroundColor : null;})() : null,
    잠김: c? /다른카드에 편집중|✓ 완료/.test(c.textContent||'') : null,
    시작단추: c? [...c.querySelectorAll('button')].some(b=>/시작/.test(b.textContent)) : null,
    카드수:카드.length, 도면:카드.filter(e=>e.querySelector('svg')).length,
    쓰기:window.__쓰기, 지움:window.__지움, 도면수:Object.keys(window._cuttingPlans).length };
});

// 진짜 편집: 팝업 열고 → (얹을까면) S 를 골라 → 재단확정
const 편집 = (얹을까)=>p.evaluate((얹을까)=>{
  const {sk, L, S행}=window.__;
  woEditCuttingPlan(L, sk);
  if(얹을까){
    const s=document.getElementById('agg-card-'+S행);
    if(!s) return {S카드없음:true, 있는카드:[...document.querySelectorAll('.inner-part-card')].map(e=>e.id+':'+e.dataset.name)};
    handleCardClick(s);           // 2순위로 고른다
    // 자투리에 안 들어가면 돌려 본다 — 사장님이 '재단회전' 을 누르시는 것과 같다
    const 돌리기=(el)=>{const w=el.dataset.w, d=el.dataset.d; el.dataset.w=d; el.dataset.d=w;
      const lb=el.querySelector('.dim-label'); if(lb) lb.textContent=d+'X'+w;
      isSheetsManual=false; updateBoardVisual();};
    const 목=document.getElementById('_woEditTargetCard');
    if(currentProducedQtySecondary<=0) 돌리기(s);
    if(currentProducedQtySecondary<=0 && 목) 돌리기(목);
    if(currentProducedQtySecondary<=0) 돌리기(s);
  }
  const 뽑 = {일순위:primarySelectedCardId, 이순위:secondarySelectedCardId,
              이순위수:typeof currentProducedQtySecondary!=='undefined'?currentProducedQtySecondary:null};
  _woInlineConfirmCutting();      // 재단확정 — 사장님이 누르시는 그 단추
  return 뽑;
}, 얹을까);

const L완료 = (할까)=>p.evaluate((할까)=>{
  const {sk, L}=window.__;
  const pp=(window._woBoringParts[sk]||[]).find(x=>x.cKey===L); if(!pp) return {L없음:true};
  const did=pp.orderKey||''; const o=confirmedOrders.find(x=>(x.docId||String(x.idNum))===did);
  const ck=_woPartKey(pp.cKey, did, pp);
  o.partCompletions=o.partCompletions||{};
  if(할까) o.partCompletions[ck]=Object.assign({},o.partCompletions[ck],{'재단':{done:true}});
  else if(o.partCompletions[ck]) delete o.partCompletions[ck]['재단'];
  _woRenderBoard(sk);                       // 저쪽 카드는 다시 세지 않는다 — 그릴 때 보게 돼 있다
  return {ck};
}, 할까);

const 온판 = ()=>p.evaluate(()=>{
  const 표={};
  Object.keys(window._woBoringParts||{}).forEach(sk=>{
    (window._woBoringParts[sk]||[]).forEach(x=>{
      표[sk+'|'+x.cKey] = [x.dq, x.sheets, x.받은몫||0, x.pm||0].join('/');
    });
  });
  return 표;
});
const 다른점 = (a,bb)=>{ const 나=[];
  new Set([...Object.keys(a),...Object.keys(bb)]).forEach(k=>{ if(a[k]!==bb[k]) 나.push(k.split('|')[1]+' '+a[k]+'→'+bb[k]); });
  return 나; };

const 처음 = await S보기();
const 처음판 = await 온판();
console.log('■ 처음(얹기 전)', JSON.stringify(처음));

for (let 회=1; 회<=4; 회++){
  const a = await 편집(true);  await p.waitForTimeout(250);
  if(회===1) console.log('   [편집 얹기]', JSON.stringify(a).slice(0,400));
  const 얹 = await S보기();
  const bb = await 편집(false); await p.waitForTimeout(250);
  const 뺀 = await S보기();
  console.log('■ '+회+'회 · 얹음 '+JSON.stringify(얹)+'\n        되돌림 '+JSON.stringify(뺀));
  판(회+'회 — 얹으면 그 자리에서 잠긴다', 얹.잠김===true && 얹.시작단추===false && 얹.받은몫>0,
     '받은몫 '+얹.받은몫+' · 원장 '+얹.원장+'장 · 잠김 '+얹.잠김);
  판(회+'회 — 되돌리면 그 자리에서 풀린다 (새로고침 없이)',
     뺀.잠김===false && 뺀.시작단추===true && 뺀.받은몫===0,
     '받은몫 '+뺀.받은몫+' · 원장 '+뺀.원장+'장 · 시작단추 '+뺀.시작단추);
  판(회+'회 — 수량도 같이 돌아온다', 뺀.작업===처음.작업 && 뺀.원장===처음.원장,
     '작업 '+얹.작업+'개 → '+뺀.작업+'개 (처음 '+처음.작업+'개)');
  판(회+'회 — 다른 카드 안 건드려짐', 뺀.카드수===처음.카드수 && 뺀.도면===뺀.카드수,
     '카드 '+처음.카드수+' → '+뺀.카드수+' · 도면 '+뺀.도면+'/'+뺀.카드수);
  const 끝판 = await 온판();
  // 편집한 그 카드(L)는 뺀다 — 시험이 재단회전을 눌러 원장 장수가 바뀌는 게 맞다
  const 바뀐 = 다른점(처음판, 끝판).filter(t=>t.indexOf(세움.L)<0);
  판(회+'회 — 편집한 카드 말고는 모든 판의 모든 카드가 처음과 똑같다', 바뀐.length===0,
     바뀐.length? 바뀐.slice(0,4).join(' · ') : '바뀐 카드 0개 / 전체 '+Object.keys(처음판).length+'개');
}
// ── 사장님 새 지시 확인 ─────────────────────────────────────────────
for (let 회=1; 회<=2; 회++){
  await 편집(true); await p.waitForTimeout(200);
  const 얹2 = await S보기();
  판('㈀'+회+' 얹으면 「다른카드에 편집중」 (완료 아님 · 초록 아님 · 시작 안 눌림)',
     얹2.편집중===true && 얹2.완료표기===false && 얹2.시작단추===false && 얹2.초록!=='rgb(232, 247, 238)',
     '편집중 '+얹2.편집중+' · 완료표기 '+얹2.완료표기+' · 바탕 '+얹2.초록);
  await L완료(true); await p.waitForTimeout(200);
  const 완 = await S보기();
  판('㈁'+회+' L 을 완료하면 그 자리에서 S 도 완료 (다른 카드와 같은 모양)',
     완.완료표기===true && 완.편집중===false && 완.초록==='rgb(232, 247, 238)',
     '완료표기 '+완.완료표기+' · 편집중 '+완.편집중+' · 바탕 '+완.초록);
  await L완료(false); await p.waitForTimeout(200);
  const 취 = await S보기();
  판('㈂'+회+' L 완료를 취소하면 그 자리에서 「다른카드에 편집중」 으로 돌아온다',
     취.편집중===true && 취.완료표기===false,
     '편집중 '+취.편집중+' · 완료표기 '+취.완료표기);
  await 편집(false); await p.waitForTimeout(200);
  const 원 = await S보기();
  판('㈃'+회+' S 를 아예 되돌리면 원래대로 (작업 '+처음.작업+'개 · 시작 눌림)',
     원.시작단추===true && 원.편집중===false && 원.작업===처음.작업,
     '작업 '+원.작업+'개 · 시작단추 '+원.시작단추);
}
const 끝 = await S보기();
판('재단계획 장수 그대로', 끝.도면수===처음.도면수, 처음.도면수+'장 → '+끝.도면수+'장');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log('   (파이어스토어 가짜 저장 '+끝.쓰기+'번 · 삭제 '+끝.지움+'번 — 재단확정은 원래 저장한다)');
await ctx.close();
}
console.log(실패===0?'rt2   OK':'rt2   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
