// 아무것도 안 했는데 발주확정목록에 「수정요청됨」 이 뜨는가 — 진짜 손가락으로 재현한다.
// 발주서 → 공정관리 → 발주서 로 다녀온 뒤 확정목록을 본다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const HERE='/tmp/claude-0/-home-user-vivivic-apps/17fbe99e-07b2-5ca2-bd6b-e6d2d41ab942/scratchpad';
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const C=await (await fetch(B+'/cutting_plans.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
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

// 사장님 자리와 같게 — 확정된 발주 두 건, 아무 요청도 없는 깨끗한 자료
const 차림 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  document.documentElement.removeAttribute('data-amthome');
  window.__쓰기=0; window.__쓴것=[];
  const 셈=n=>async(ref,payload)=>{window.__쓰기++;
    window.__쓴것.push({무엇:n, 길:(ref&&ref.__길)||'?', 값:Object.keys(payload||{}).slice(0,6),
      어디서:(new Error()).stack.split('\n').slice(1,5).map(x=>x.trim().slice(0,90))});};
  window.db={}; window.fbFirestore={doc:(...a)=>({__길:a.slice(1).join('/')}),updateDoc:셈('updateDoc'),setDoc:셈('setDoc'),
    deleteDoc:셈('deleteDoc'),addDoc:셈('addDoc'),collection:()=>({}),onSnapshot:()=>{},query:x=>x,
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]={...x, planId:String(x.confirmId)};});
  const 하나=O[0];
  const 깨끗 = n => { const o={...하나, idNum: 1400+n, docId:'DOC'+n, orderCode:'샘플-20260101-0'+n,
      amtTimeline:true, checked:false};
      delete o.editInfo; delete o.editCompleted; delete o.amtApprovedEdit;
      o.isCancelRequested=false; return o; };
  confirmedOrders.length=0; confirmedOrders.push(깨끗(1), 깨끗(2));
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
  return {발주:confirmedOrders.map(o=>({docId:o.docId, editInfo:o.editInfo, editCompleted:o.editCompleted,
          amtApprovedEdit:o.amtApprovedEdit, 취소:o.isCancelRequested, amtTimeline:o.amtTimeline}))};
},{O,C,L});
console.log('자료(사장님 것과 같게 깨끗함): '+JSON.stringify(차림.발주));

const 확정목록보기 = () => p.evaluate(()=>{
  const box=document.getElementById('timeline-confirmed-section');
  const 글=(box&&box.textContent||'').replace(/\s+/g,' ').trim();
  const 카드=[...document.querySelectorAll('[id^="tlconf-card-"]')];
  return {카드수:카드.length, 수정요청됨:(글.match(/수정요청됨/g)||[]).length,
          분홍:카드.filter(c=>/fff7f7/i.test(c.getAttribute('style')||'')).length,
          글:글.slice(0,150)};
});

// ── 진짜 손가락으로 발주서 → 공정관리 → 발주서
const 탭누르기 = async (mode) => {
  const h = await p.evaluateHandle((m)=>document.querySelector('.bnav[data-mode="'+m+'"]') ||
      document.getElementById('nav-'+m), mode);
  const el=h.asElement();
  if(!el){ await p.evaluate(m=>switchPage(m), mode); return '단추없음-함수로'; }
  await el.tap(); await p.waitForTimeout(700); return '탭';
};
console.log('발주서 열기: '+await 탭누르기('order'));
await p.evaluate(()=>{ if(typeof renderTimelineConfirmedList==='function') renderTimelineConfirmedList(); });
await p.waitForTimeout(400);
const 처음 = await 확정목록보기();
console.log('① 발주서에 처음 들어왔을 때: '+JSON.stringify(처음));

console.log('공정관리로: '+await 탭누르기('process'));
console.log('발주서로 돌아오기: '+await 탭누르기('order'));
await p.waitForTimeout(700);
const 돌아온뒤 = await 확정목록보기();
console.log('② 공정관리 다녀와서 발주서: '+JSON.stringify(돌아온뒤));

const 쓰기 = await p.evaluate(()=>({쓰기:window.__쓰기, 쓴것:window.__쓴것}));
console.log('파이어베이스 쓰기: '+JSON.stringify(쓰기,null,1));

판('확정목록에 카드가 있다', 돌아온뒤.카드수>0, 돌아온뒤.카드수+'장');
판('아무 요청도 없는데 「수정요청됨」 이 안 뜬다', 돌아온뒤.수정요청됨===0, '「수정요청됨」 '+돌아온뒤.수정요청됨+'개 / 카드 '+돌아온뒤.카드수);
판('분홍 바탕도 안 깔린다', 돌아온뒤.분홍===0, '분홍 '+돌아온뒤.분홍+'장');
// 화면을 옮기면 앱이 원래부터 cachedWorkTime(공정 시간 캐시)만 한 번씩 저장한다.
// 이번 고침과 무관한 예전 동작이라, '그것 말고는 아무것도 안 쓴다' 로 잰다.
const _딴것 = (쓰기.쓴것||[]).filter(x=>!(x.값||[]).every(k=>k==='cachedWorkTime'));
판('발주 내용에는 아무것도 안 쓴다(cachedWorkTime 말고 없음)', _딴것.length===0,
   '딴 쓰기 '+_딴것.length+'번 / 전체 '+쓰기.쓰기+'번(모두 cachedWorkTime)');

// 진짜 수정요청이 있으면 여전히 보여야 한다
const 진짜 = await p.evaluate(()=>{
  confirmedOrders[0].editInfo={requester:'가나가구', at:Date.now()};
  renderTimelineConfirmedList();
  const box=document.getElementById('timeline-confirmed-section');
  const 글=(box&&box.textContent||'').replace(/\s+/g,' ').trim();
  return {수정요청됨:(글.match(/수정요청됨/g)||[]).length};
});
console.log('③ 진짜 수정요청 한 건 넣었을 때: '+JSON.stringify(진짜));
판('진짜 수정요청은 그대로 보인다', 진짜.수정요청됨===1, '「수정요청됨」 '+진짜.수정요청됨+'개');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
await p.screenshot({path:HERE+'/확정목록_375.png'});
console.log(실패===0?'edit1   OK':'edit1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
