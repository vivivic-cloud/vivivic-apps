// 도면 초기화 단추 — 시키신 그대로 해 본다.
// 부속 셋 고르고 · 하나 돌리고 · 장수 손으로 +2 · 원장 3X6 → 초기화 → 처음 상태인가
// 그리고 재단계획 장수가 그대로인가(세 번 눌러 본다), 파이어베이스 쓰기 0 인가.
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
p.on('dialog', d=>d.accept());          // confirm() 은 '예' 로 답한다
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1200);

await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  document.documentElement.removeAttribute('data-amthome');
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push({...x, checked:true}));
  // 이 시험은 발주가 한 건이던 때 쓴 것이다. 지금 자료엔 여러 건이 있어
  // 자리와 개수가 어긋난다. 원래 보던 그 한 건만 놓고 잰다.
  if(confirmedOrders.length>1){ const 첫=confirmedOrders[0];
    confirmedOrders.length=0; confirmedOrders.push(첫); }
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window.__쓰기=0; window.__쓴것=[];
  const 셈=n=>async(...a)=>{window.__쓰기++;window.__쓴것.push(n);};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:셈('updateDoc'),setDoc:셈('setDoc'),
    deleteDoc:셈('deleteDoc'),addDoc:셈('addDoc'),collection:()=>({}),onSnapshot:()=>{},query:x=>x,
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
  refreshConsolidatedMaterials();
  const 단추=[...document.querySelectorAll('.scenario-plate-btn')];
  const i=단추.findIndex(x=>/발리오크/.test(x.textContent));
  단추[i>=0?i:0].click();
  // 테일윈드가 막혀 있어 두 칸 격자가 안 선다 — 재기 위해 시험 창에만 넣는다
  const st=document.createElement('style');
  st.textContent='#id302-common-section,#id302-normal-section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.5rem;}';
  document.head.appendChild(st);
  let el=document.getElementById('id302-parts-content');
  while(el && el!==document.body){ if(getComputedStyle(el).display==='none'){ el.classList.remove('hidden'); el.style.setProperty('display','block','important'); } el=el.parentElement; }
},{O,C,L});

// 편집화면이 몇 개인가 — 재단편집 도구가 문서에 몇 벌 있는지, 초기화 단추가 몇 개인지
const 개수=await p.evaluate(()=>({편집도구:document.querySelectorAll('#cutting-edit-box').length,
  초기화단추:document.querySelectorAll('#btn-reset-cutting').length,
  확정단추:document.querySelectorAll('#btn-confirm-cutting').length}));
console.log('편집 도구/단추 수: '+JSON.stringify(개수));

// 단추 크기 (375px)
const 크기=await p.evaluate(()=>{
  const bt=document.getElementById('btn-reset-cutting'); bt.scrollIntoView({block:'center'});
  const r=bt.getBoundingClientRect(); const cf=document.getElementById('btn-confirm-cutting').getBoundingClientRect();
  return {초기화:{가로:Math.round(r.width),세로:Math.round(r.height)}, 재단확정:{가로:Math.round(cf.width),세로:Math.round(cf.height)},
          글:document.getElementById('btn-reset-cutting').textContent.trim()};
});
console.log('단추 크기: '+JSON.stringify(크기));
판('초기화 단추 세로가 36px 이상', 크기.초기화.세로>=36, 크기.초기화.세로+'px');
판('초기화 단추 가로가 44px 이상', 크기.초기화.가로>=44, 크기.초기화.가로+'px');

// ── 시키신 대로 흐트러뜨린다
const 흐트림 = await p.evaluate(()=>{
  const 카드=[...document.querySelectorAll('.inner-part-card')];
  카드[0].click(); 카드[1].click(); 카드[2].click();            // 셋 고르기 (P/S/T)
  const 돌릴=카드.find(c=>c.querySelector('.rotate-btn'));
  if(돌릴) 돌릴.querySelector('.rotate-btn').click();            // 하나 돌리기
  changeSuggestedSheets(1); changeSuggestedSheets(1);           // 장수 손으로 +2
  const s2=document.getElementById('setting-board-size'); s2.value='3X6';
  s2.dispatchEvent(new Event('change'));                        // 원장 3X6
  return {P:primarySelectedCardId, S:secondarySelectedCardId, T:tertiarySelectedCardId,
          돌린것:document.querySelectorAll('.rotate-btn.rotated').length,
          손장수:isSheetsManual, 장수:suggestedSheets,
          판:s2.value, 전단컷:document.getElementById('setting-front-cut').value,
          톱날:document.getElementById('setting-blade-t').value};
});
console.log('흐트러뜨린 뒤: '+JSON.stringify(흐트림));
판('흐트러뜨리기가 실제로 됐다', 흐트림.P!==null && 흐트림.S!==null && 흐트림.T!==null
   && 흐트림.돌린것>0 && 흐트림.손장수===true && 흐트림.판==='3X6', JSON.stringify(흐트림));

// ── 초기화를 진짜 손가락으로 누른다
const 손 = await p.evaluateHandle(()=>document.getElementById('btn-reset-cutting'));
await 손.asElement().tap();
await p.waitForTimeout(600);
const 뒤 = await p.evaluate(()=>({
  P:primarySelectedCardId, S:secondarySelectedCardId, T:tertiarySelectedCardId,
  돌린것:document.querySelectorAll('.rotate-btn.rotated').length,
  손장수:isSheetsManual, 장수:suggestedSheets,
  판:document.getElementById('setting-board-size').value,
  전단컷:document.getElementById('setting-front-cut').value,
  톱날:document.getElementById('setting-blade-t').value,
  줄글:document.getElementById('cut-set-sum').textContent.trim(),
  재단계획:Object.keys(window._cuttingPlans).length,
  확정목록:confirmedCuttingData.length, 발주:confirmedOrders.length,
  쓰기:window.__쓰기, 쓴것:window.__쓴것}));
console.log('초기화 뒤: '+JSON.stringify(뒤));
판('P/S/T 가 다 null', 뒤.P===null && 뒤.S===null && 뒤.T===null, `P=${뒤.P} S=${뒤.S} T=${뒤.T}`);
판('돌려 놓은 것이 0개', 뒤.돌린것===0, 흐트림.돌린것+'개 → '+뒤.돌린것+'개');
판('isSheetsManual 이 false', 뒤.손장수===false, String(뒤.손장수));
판('원장 크기·전단컷·톱날T 가 4X8 · 5 · 4.5', 뒤.판==='4X8' && String(뒤.전단컷)==='5' && String(뒤.톱날)==='4.5',
   `${뒤.판} · ${뒤.전단컷} · ${뒤.톱날}`);
판('접힌 줄 글도 따라 바뀐다', /4X8 · 전단컷 5 · 톱날T 4.5/.test(뒤.줄글), 뒤.줄글);
판('장수가 저절로 센 값으로 돌아왔다(고른 것이 없으니 0)', 뒤.장수===0, 흐트림.장수+' → '+뒤.장수);

// ── 세 번 눌러도 재단계획이 그대로인가
for(let i=0;i<3;i++){ const h=await p.evaluateHandle(()=>document.getElementById('btn-reset-cutting'));
  await h.asElement().tap(); await p.waitForTimeout(400); }
const 끝 = await p.evaluate(()=>({재단계획:Object.keys(window._cuttingPlans).length,
  확정목록:confirmedCuttingData.length, 발주:confirmedOrders.length, 쓰기:window.__쓰기, 쓴것:window.__쓴것}));
console.log('세 번 더 누른 뒤: '+JSON.stringify(끝));
// 장수를 못 박지 않는다 — 사장님이 도면을 더 만드시면 숫자가 바뀐다.
// 초기화가 한 장도 안 건드렸는지만 본다.
판('재단계획이 초기화 앞뒤로 그대로', 끝.재단계획===뒤.재단계획,
   '앞 '+뒤.재단계획+'장 → 뒤 '+끝.재단계획+'장');
판('확정목록·발주 안 건드림', 끝.확정목록===0 && 끝.발주===1, '확정목록 '+끝.확정목록+' · 발주 '+끝.발주);
판('파이어베이스 쓰기 0번', 끝.쓰기===0, 끝.쓰기+'번 '+JSON.stringify(끝.쓴것));
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'res9   OK':'res9   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
