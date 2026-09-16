// 재단회전 단추를 손가락으로 누를 수 있게 키웠는가 — 폰 375px 에서 잰다.
// 고치기 전(옛 규칙을 되살려)과 고친 뒤를 같은 창에서 잰다.
// 마지막에 진짜 손가락(CDP 터치)으로 눌러 회전이 되는지, 카드가 안 골라지는지 본다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const C=await (await fetch(B+'/cutting_plans.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1200);

const 차림 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  document.documentElement.removeAttribute('data-amthome');   // 첫 화면(집)에서 나온다
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push({...x, checked:true}));
  // 이 시험은 발주가 한 건이던 때 쓴 것이다. 지금 자료엔 여러 건이 있어
  // 자리와 개수가 어긋난다. 원래 보던 그 한 건만 놓고 잰다.
  if(confirmedOrders.length>1){ const 첫=confirmedOrders[0];
    confirmedOrders.length=0; confirmedOrders.push(첫); }
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
  window.__쓰기=0;
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},setDoc:async()=>{window.__쓰기++;},
    deleteDoc:async()=>{window.__쓰기++;},collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{window.__쓰기++;},
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
  refreshConsolidatedMaterials();
  const 단추=[...document.querySelectorAll('.scenario-plate-btn')];
  const i = 단추.findIndex(x=>/발리오크/.test(x.textContent));
  단추[i>=0?i:0].click();
  // 이 상자는 테일윈드 CDN 이 막혀 있다. 부속 목록이 두 칸 격자인 것은 테일윈드
  // grid grid-cols-2 gap-2 가 하는 일이므로, 재기 위해 그 세 줄만 손으로 넣는다.
  // (앱 파일은 안 건드린다 — 시험 창에만 넣는다)
  const st=document.createElement('style'); st.id='__격자';
  st.textContent='#id302-common-section,#id302-normal-section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.5rem;}';
  document.head.appendChild(st);
  // 상자를 보이게 (재기 위해서만)
  let el=document.getElementById('id302-parts-content');
  while(el && el!==document.body){ if(getComputedStyle(el).display==='none'){ el.classList.remove('hidden'); el.style.setProperty('display','block','important'); } el=el.parentElement; }
  const pc=document.getElementById('id302-parts-content'); if(pc) pc.style.width='375px';
  return {판:단추.map(x=>x.textContent.trim())};
},{O,C,L});

const 재기 = () => p.evaluate(()=>{
  const 카드=[...document.querySelectorAll('#id302-normal-section .inner-part-card, #id302-common-section .inner-part-card')];
  const 단추있는=카드.filter(c=>c.querySelector('.rotate-btn'));
  const 단추없는=카드.filter(c=>!c.querySelector('.rotate-btn'));
  const 재=el=>{const r=el.getBoundingClientRect(); return {가로:Math.round(r.width), 세로:Math.round(r.height), x:Math.round(r.x), y:Math.round(r.y)};};
  // 한 줄에 몇 장 — 같은 y 인 카드 수
  const 줄={}; 카드.forEach(c=>{const y=Math.round(c.getBoundingClientRect().y); 줄[y]=(줄[y]||0)+1;});
  const 줄수=Object.values(줄);
  const bt=단추있는[0] && 단추있는[0].querySelector('.rotate-btn');
  const 카드0=단추있는[0];
  let 삐져=null;
  if(bt && 카드0){ const br=bt.getBoundingClientRect(), cr=카드0.getBoundingClientRect();
    삐져={왼:Math.round(br.left-cr.left), 오른:Math.round(cr.right-br.right), 아래:Math.round(cr.bottom-br.bottom),
          넘침:bt.scrollWidth>bt.clientWidth+1 || bt.scrollHeight>bt.clientHeight+1}; }
  return {카드수:카드.length, 단추있는:단추있는.length, 단추없는:단추없는.length,
          단추: bt?재(bt):null, 글자: bt?getComputedStyle(bt).fontSize:null,
          카드: 카드0?재(카드0):null, 단추없는카드: 단추없는[0]?재(단추없는[0]):null,
          한줄:줄수, 삐져, 문서가로:document.documentElement.scrollWidth};
});

// ── 고친 뒤 (지금 규칙)
const 뒤 = await 재기();
// ── 고치기 전 (옛 규칙을 덮어씌워 되살린다 — 재기 위해서만)
await p.evaluate(()=>{ const st=document.createElement('style'); st.id='__옛';
  st.textContent='.rotate-btn{font-size:8px!important;padding:1px 4px!important;border-radius:3px!important;margin-top:4px!important;align-self:flex-start!important;min-height:0!important;line-height:normal!important;}';
  document.head.appendChild(st); });
const 앞 = await 재기();
await p.evaluate(()=>{ document.getElementById('__옛').remove(); });
const 뒤2 = await 재기();

console.log('고치기 전 단추: '+JSON.stringify(앞.단추)+' 글자 '+앞.글자);
console.log('고친 뒤  단추: '+JSON.stringify(뒤2.단추)+' 글자 '+뒤2.글자);
console.log('고치기 전 카드: '+JSON.stringify(앞.카드)+' / 고친 뒤 카드: '+JSON.stringify(뒤2.카드));
console.log('한 줄에 선 카드 수 — 전 '+JSON.stringify(앞.한줄)+' / 후 '+JSON.stringify(뒤2.한줄));
console.log('단추 여백(왼/오른/아래) 및 넘침: '+JSON.stringify(뒤2.삐져));
console.log('단추 없는 카드 — 전 '+JSON.stringify(앞.단추없는카드)+' / 후 '+JSON.stringify(뒤2.단추없는카드)+' (개수 '+뒤2.단추없는+')');

판('단추 세로가 손가락에 닿는 크기(36px 이상)', 뒤2.단추.세로>=36, 뒤2.단추.세로+'px (전 '+앞.단추.세로+'px)');
판('단추 가로도 손가락이 들어간다(44px 이상)', 뒤2.단추.가로>=44, 뒤2.단추.가로+'px (전 '+앞.단추.가로+'px)');
판('글자가 11px 이상', parseFloat(뒤2.글자)>=11, 뒤2.글자+' (전 '+앞.글자+')');
판('카드 가로는 그대로', 뒤2.카드.가로===앞.카드.가로, 앞.카드.가로+' → '+뒤2.카드.가로+'px');
판('한 줄에 서는 카드 수 그대로', JSON.stringify(뒤2.한줄)===JSON.stringify(앞.한줄), JSON.stringify(앞.한줄)+' → '+JSON.stringify(뒤2.한줄));
판('단추가 카드 밖으로 안 나간다', 뒤2.삐져.왼>=0 && 뒤2.삐져.오른>=0 && 뒤2.삐져.아래>=0, JSON.stringify(뒤2.삐져));
판('단추 글자가 안 잘린다', 뒤2.삐져.넘침===false, String(뒤2.삐져.넘침));
// 결보호가 X 가 아닌 부속(재단회전 단추가 없는 카드)이 목록에 있을 때만 견준다.
if (앞.단추없는카드 && 뒤2.단추없는카드) {
  판('단추 없는 카드는 그대로',
     앞.단추없는카드.가로===뒤2.단추없는카드.가로 && 앞.단추없는카드.세로===뒤2.단추없는카드.세로,
     JSON.stringify(앞.단추없는카드)+' → '+JSON.stringify(뒤2.단추없는카드));
} else {
  console.log('  (단추 없는 카드가 이 목록엔 없다 — 견줄 것이 없어 건너뜀)');
}

// ── 진짜 손가락으로 눌러 본다
const 앞상태 = await p.evaluate(()=>{
  const c=[...document.querySelectorAll('.inner-part-card')].find(x=>x.querySelector('.rotate-btn'));
  const bt=c.querySelector('.rotate-btn'); bt.scrollIntoView({block:'center'});
  const r=bt.getBoundingClientRect();
  window.__카드=c.id;
  return {치수:c.querySelector('.dim-label').textContent, 골라짐:c.classList.contains('active'),
          돌려짐:bt.classList.contains('rotated'), 으뜸:window.primarySelectedCardId||null,
          x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
});
// 진짜 손가락 — 요소를 집어서 톡 친다(hasTouch 켜진 창이라 진짜 touch 이벤트가 간다)
const 손 = await p.evaluateHandle(()=>{
  const c=document.getElementById(window.__카드); return c.querySelector('.rotate-btn'); });
await 손.asElement().tap();
await p.waitForTimeout(500);
const 뒤상태 = await p.evaluate(()=>{
  const c=document.getElementById(window.__카드); const bt=c.querySelector('.rotate-btn');
  return {치수:c.querySelector('.dim-label').textContent, 골라짐:c.classList.contains('active'),
          돌려짐:bt.classList.contains('rotated'), 으뜸:window.primarySelectedCardId||null, 쓰기:window.__쓰기};
});
console.log('진짜 손가락 누르기 — 전 '+JSON.stringify(앞상태)+' / 후 '+JSON.stringify(뒤상태));
판('진짜 손가락으로 눌러 회전이 된다', 앞상태.치수!==뒤상태.치수 && 뒤상태.돌려짐===true,
   앞상태.치수+' → '+뒤상태.치수);
판('단추를 눌러도 카드가 안 골라진다', 뒤상태.골라짐===false && 뒤상태.으뜸===앞상태.으뜸,
   '골라짐 '+뒤상태.골라짐+' · 으뜸 '+뒤상태.으뜸);
판('파이어베이스에 안 쓴다', 뒤상태.쓰기===0, 뒤상태.쓰기+'번');
// 문서 가로는 여기서 못 잰다 — 재려고 숨은 상자들을 억지로 편 탓에 폭이 늘어난다.
console.log('   (문서 가로 '+뒤2.문서가로+'px 은 재려고 숨은 상자를 편 탓이라 참값이 아니다)');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'rot1   OK':'rot1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
