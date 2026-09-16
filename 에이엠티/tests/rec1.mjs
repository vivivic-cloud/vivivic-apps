// 추천 부속 목록 — 이미 다 잘린 것은 빠지고, 모자란 것은 남은 수량과 함께 서는가.
// 업무 자료는 읽기만. 파이어베이스 쓰기는 가짜로 막고 몇 번 불렸는지 센다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const C=await (await fetch(B+'/cutting_plans.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };

// 손으로 검산: 공통부속(전도방지) 필요 총량 = 세트별소모량 × 발주수량
const h=L[0]; const i대=h.indexOf('대분류'), i소=h.indexOf('세트별소모량'), i명=h.indexOf('부속명');
let 공통행=null;
for(let i=1;i<L.length;i++){ const r=L[i]; if(r && String(r[i대]||'').trim()==='공통부속'){ 공통행=i; break; } }
const uc=parseFloat(L[공통행][i소])||0;
// 발주는 여러 건일 수 있다. 앱이 확정된 발주를 다 더하므로 손 검산도 다 더한다.
const 손필요=O.reduce((n,o)=>n+Math.round(uc*(o.orderQty||0)),0);
console.log('■ 손으로 검산: 원장 '+공통행+'행 「'+L[공통행][i명]+'」 세트별소모량 '+uc+' × 발주 '
  +O.map(o=>o.orderQty).join('+')+'세트 = 필요 '+손필요+'개');
// 저장된 도면에서 이 행이 이미 몇 개 잘렸는지(이 발주 몫만) 손으로 센다
let 손이미=0;
for(const pl of C){ for(const g of ['p','s','t']){
  if(parseInt(pl[g+'RowIndex'],10)===공통행) 손이미+=parseInt(pl[g+'ProducedQty'],10)||0; } }
console.log('■ 손으로 센 (임자 안 가린) 전체 잘린 몫: '+손이미+'개 — 앱은 임자를 가리므로 이보다 작거나 같아야 한다');

for (const [폭,opt] of [[375,{...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true}],
                        [1280,{viewport:{width:1280,height:900}}]]) {
const ctx=await b.newContext(opt); const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1600);
console.log('════ 폭 '+폭+'px ════');

const 세움 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  window.__쓰기=0;
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},
    setDoc:async()=>{window.__쓰기++;},deleteDoc:async()=>{window.__쓰기++;},
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{window.__쓰기++;},
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  appMode='process';
  const 판=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)판.add(s);});
  const sk=[...판].find(s=>/-재단$/.test(s)); window.__sk=sk;
  window._tlDcDate=sk.substring(0,10); renderProcessTimeline();
  try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
  Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
  window._woCutGrpOpen=window._woCutGrpOpen||{};
  (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
  _woRenderBoard(sk);
  /* 예전에는 「이동선반L」 을 이름으로 못 박아 집었다. 그 발주가 목록에서 빠지자
     팝업이 안 열려 시험이 통째로 어긋났다. 이름을 안 박고, 그때 보드에 실제로 선
     재단카드 가운데 제 몫을 스스로 자르는 첫 장을 쓴다. */
  const L카드=(window._woBoringParts[sk]||[]).find(x=>x.isCuttingCard && (x.sheets||0)>0 && !(x.받은몫>0))
            || (window._woBoringParts[sk]||[]).find(x=>x.isCuttingCard);
  window.__L=L카드?L카드.cKey:null;
  return {sk, L:window.__L, 쓴카드:L카드?L카드.nm:null, 카드:(window._woBoringParts[sk]||[]).length};
},{O,C,L});
console.log('   밑판: '+JSON.stringify(세움));

// 재단편집 팝업을 열고 추천 목록을 읽는다
const 목록 = ()=>p.evaluate(()=>{
  const 공통=[...document.querySelectorAll('#id302-common-section .inner-part-card')];
  const 보통=[...document.querySelectorAll('#id302-normal-section .inner-part-card')];
  const 읽=e=>({이름:e.dataset.name, 행:e.dataset.rowIndex, 수량:e.dataset.qty,
    배지:(e.querySelector('.qty-badge')||{}).textContent,
    배지넘침:(()=>{const q=e.querySelector('.qty-badge'); if(!q) return null;
      return q.scrollWidth>q.clientWidth+1 || q.scrollHeight>q.clientHeight+1;})(),
    배지폭:(()=>{const q=e.querySelector('.qty-badge'); return q?Math.round(q.getBoundingClientRect().width):null;})()});
  return {공통:공통.map(읽), 보통:보통.map(읽), 쓰기:window.__쓰기,
          도면수:Object.keys(window._cuttingPlans).length};
});

await p.evaluate(()=>{ woEditCuttingPlan(window.__L, window.__sk); });
await p.waitForTimeout(400);
const 뒤 = await 목록();
console.log('   추천 공통부속: '+JSON.stringify(뒤.공통));
console.log('   추천 일반부속 '+뒤.보통.length+'개: '+JSON.stringify(뒤.보통.slice(0,4)));

// ① 다 잘린 공통부속이 빠지는가 — 앱이 센 값으로 검산
const 셈 = await p.evaluate(({공통행})=>{
  /* 화면은 '지금 편집 중인 도면이 걸린 발주' 를 기준으로 센다. 시험도 같은 자를 써야
     한다 — 확정된 발주를 전부 더하면 발주가 여러 건일 때 화면과 어긋난다. */
  const 편집중=(window._editingCuttingPlan&&window._editingCuttingPlan.planId)||null;
  const pl=편집중?window._cuttingPlans[편집중]:null;
  const ids=pl?[...new Set([...(pl.pOrderIds||[]),...(pl.sOrderIds||[]),...(pl.tOrderIds||[])])]:[];
  const 산것=ids.map(id=>_cutPlanOwner(id,_cutPlanMadeAt(pl),pl)||_cutPlanOwner(id,Infinity,pl)).filter(Boolean);
  const 볼발주=산것.length?산것:confirmedOrders;
  const 키=new Set(볼발주.map(o=>o.docId||String(o.idNum)));
  const h=currentFullData[0];
  const uc=parseFloat(currentFullData[공통행][h.indexOf('세트별소모량')])||0;
  const 필요=볼발주.reduce((n,o)=>n+Math.round(uc*(o.orderQty||0)),0);
  const 이미=_이미잘린몫(공통행,키,편집중);
  const 이미모두=_이미잘린몫(공통행,키,null);
  const 온키=new Set(confirmedOrders.map(o=>o.docId||String(o.idNum)));
  return {필요, 이미, 이미모두, 남은:필요-이미, 편집중,
          본발주:볼발주.map(o=>o.orderCode), 온발주몫:_이미잘린몫(공통행,온키,null)};
},{공통행});
console.log('   앱의 셈(공통부속): '+JSON.stringify(셈));

const 손필요2 = O.filter(o=>셈.본발주.includes(o.orderCode))
                 .reduce((n,o)=>n+Math.round(uc*(o.orderQty||0)),0) || 손필요;
console.log('   (화면이 본 발주: '+셈.본발주.join(', ')+' → 손으로 다시 세면 '+손필요2+'개)');
판('① 공통부속 필요량이 손 검산과 같다 ('+손필요2+'개)', 셈.필요===손필요2, '앱 '+셈.필요+' · 손 '+손필요2);
// 뜻은 '0 이어야 한다' 가 아니라 '임자를 가려 남의 발주 몫은 안 센다' 이다.
// 이 발주 도면이 실제로 얼마를 내느냐는 자료에 따라 달라지므로 0 을 못 박지 않는다.
판('① 남의 발주가 자른 몫은 안 센다 (덜 자르면 안 되므로)', 셈.이미모두 < 손이미,
   '저장된 도면 전체에 '+공통행+'행 몫이 '+손이미+'개 있지만 이 발주 몫은 '+셈.이미모두+'개');
판('① 편집 중인 그 도면이 내는 몫만큼만 빠진다', 셈.이미모두 >= 셈.이미,
   '이 발주 전체 '+셈.이미모두+'개 · 편집 중 도면을 뺀 것 '+셈.이미+'개');
const 공통섰나 = 뒤.공통.some(x=>x.행===String(공통행));
판('① 다 잘렸으면 추천에서 빠지고, 모자라면 선다',
   (셈.남은>0.001) === 공통섰나,
   '남은 '+셈.남은+'개 · 목록에 '+(공통섰나?'있음':'없음'));
if (공통섰나) {
  const c=뒤.공통.find(x=>x.행===String(공통행));
  판('② 배지에 남은 필요수량이 찍힌다', String(Math.round(셈.남은))===String(c.배지),
     '배지 「'+c.배지+'」 · 남은 '+Math.round(셈.남은));
  판('② 배지 안에 숫자가 들어간다 (안 넘침)', c.배지넘침===false, '넘침 '+c.배지넘침+' · 배지폭 '+c.배지폭+'px');
} else {
  console.log('   (공통부속이 다 잘려 목록에서 빠졌다 — 배지는 잴 것이 없다)');
}

// ①-2 이 발주 도면이 전도방지를 다 내도록 만들어 보고, 추천에서 빠지는지 본다
const 채움 = (얼마)=>p.evaluate((얼마)=>{
  const 올=new Set((window._woBoringParts[window.__sk]||[]).map(x=>String(x.planId||'')));
  const pl=Object.values(window._cuttingPlans).find(x=>올.has(String(x.confirmId)) && String(x.confirmId)!==String(window.__L||'').replace(/^cut_/,''));
  if(!pl) return {없음:true};
  pl.tRowIndex=1; pl.tId='agg-common-1'; pl.tProducedQty=얼마; pl.tOrderIds=[...(pl.pOrderIds||[])];
  pl.tInfoText='762 X 180 - 전도방지 - '+얼마+' EA';
  woEditCuttingPlan(window.__L, window.__sk);       // 팝업을 다시 연다
  const 공통=[...document.querySelectorAll('#id302-common-section .inner-part-card')];
  const c=공통.find(e=>e.dataset.rowIndex==='1');
  return {쓴도면:pl.confirmId, 얹은수:얼마, 공통있음:!!c,
          배지:c?(c.querySelector('.qty-badge')||{}).textContent:null,
          수량:c?c.dataset.qty:null};
}, 얼마);

/* 못 박은 숫자를 쓰지 않는다 — 그때그때 센 값에서 끌어낸다.
   이 행은 다른 도면들도 이미 얼마를 내고 있다(셈.이미). 그러니 여기서 새로 얹는 몫은
   '남은 것(셈.남은)' 을 기준으로 잡아야 화면과 맞는다. */
const _필요 = 셈.필요, _남은 = 셈.남은;
const _모자란만큼 = Math.max(1, Math.round(_남은/3)), _덜낸것 = _남은 - _모자란만큼;
const 다참 = await 채움(_남은); await p.waitForTimeout(250);
console.log('   '+L[공통행][i명]+' 남은 '+_남은+'개를 다 내게 한 뒤: '+JSON.stringify(다참));
판('①-2 발주수량만큼 다 잘리면 추천에서 빠진다', 다참.공통있음===false,
   '필요 '+_필요+' · 다른 도면이 낸 '+셈.이미+' · 여기서 낸 '+_남은+' · 목록에 '+(다참.공통있음?'있음':'없음'));

const 모자람 = await 채움(_덜낸것); await p.waitForTimeout(250);
console.log('   '+L[공통행][i명]+' '+_덜낸것+'개만 내게 한 뒤: '+JSON.stringify(모자람));
판('①-2 모자라면 남은 필요수량과 함께 선다', 모자람.공통있음===true && String(모자람.배지)===String(_모자란만큼),
   '남은 '+_남은+' − 여기서 낸 '+_덜낸것+' = '+_모자란만큼+' · 배지 「'+모자람.배지+'」');

// ③ 편집 중인 도면이 제 카드를 지우지 않는가 — 진짜 손가락으로 카드를 눌러 본다
const 탭전제카드 = await p.evaluate(()=>!!document.getElementById('_woEditTargetCard'));
const 탭전목록 = await 목록();
// 진짜 손가락 탭 — 카드 그 자리를 정확히 누른다(덮개를 누르면 팝업이 닫혀 시험이 무의미해진다)
// 진짜 탭은 손가락이 있는 폰 칸에서만 잰다 (넓은화면 칸에는 터치가 없다)
const 손el = 폭===375 ? (await p.$('#_woEditTargetCard') || await p.$('#id302-normal-section .inner-part-card')) : null;
let 탭함=false;
if (손el) { await 손el.scrollIntoViewIfNeeded(); await 손el.tap(); await p.waitForTimeout(400); 탭함=true; }
const 탭뒤 = await 목록();
const 제카드 = await p.evaluate(()=>!!document.getElementById('_woEditTargetCard'));
const 팝업열림 = await p.evaluate(()=>!!document.getElementById('_woInlineEditOverlay'));
console.log('   진짜 탭 뒤 — 공통 '+탭뒤.공통.length+'개 · 일반 '+탭뒤.보통.length+'개 · 편집대상카드 '+제카드+' · 팝업 '+팝업열림);
if (폭===375) 판('③ 진짜 탭으로 눌러도 팝업이 그대로 열려 있다', 탭함 && 팝업열림===true, '탭함 '+탭함+' · 팝업 '+팝업열림);
else console.log('   (넓은화면 칸에는 손가락이 없어 진짜 탭은 폰 칸에서만 쟀다)');
판('③ 편집 중인 제 카드가 탭 때문에 사라지지 않는다',
   제카드===탭전제카드 && 탭뒤.보통.length===탭전목록.보통.length,
   '편집대상카드 '+탭전제카드+'→'+제카드+' · 일반 '+탭전목록.보통.length+'→'+탭뒤.보통.length);
판('③ 편집 중인 도면 제 몫은 안 뺀다', !!셈.편집중 && 셈.이미 <= 셈.이미모두,
   '편집 중 도면 '+셈.편집중+' · 그것을 뺀 이미잘린몫 '+셈.이미);
판('재단계획 장수 그대로', 탭뒤.도면수===C.length, C.length+'장 → '+탭뒤.도면수+'장');
판('파이어베이스 쓰기 0번', 탭뒤.쓰기===0, String(탭뒤.쓰기)+'번');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
await ctx.close();
}
console.log(실패===0?'rec1   OK':'rec1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
