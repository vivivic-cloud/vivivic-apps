// 작업완료를 찍을 때, 그 도면에서 같이 나온 작업물의 수량도 보이는가.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
import { readFileSync } from 'node:fs';
const HERE = await 자재();   // 막힌 CDN 대신 쓸 것들 — 없으면 스스로 갖춘다
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await 브라우저열기();
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

const 차림 = await p.evaluate(({O,C,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  document.documentElement.removeAttribute('data-amthome'); switchPage('process');
  window.__쓰기=0; window.__쓴것=[];
  const 셈=n=>async()=>{window.__쓰기++;window.__쓴것.push(n);};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:셈('updateDoc'),setDoc:셈('setDoc'),
    deleteDoc:셈('deleteDoc'),addDoc:셈('addDoc'),collection:()=>({}),onSnapshot:()=>{},query:x=>x,
    serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push({...x, checked:true}));
  // 사장님이 실제로 찍으신 시작·완료 기록이 자료에 들어 있다. 시험은 아무것도
  // 안 찍힌 자리에서 시작해야 뜻이 있으므로, 이 창에서만 지우고 쓴다(파이어베이스는 안 건드린다).
  confirmedOrders.forEach(o=>{ o.partStarted={}; o.partCompletions={}; });
  window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]={...x, planId:String(x.confirmId)};});
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
  ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
  const 본=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)본.add(s);});
  const sk=[...본].find(s=>/-재단$/.test(s));
  return {sk, 오른카드:(window._woBoringParts[sk]||[]).filter(x=>x.isCuttingCard).length};
},{O,C,L});
console.log('쓸 도면: '+JSON.stringify(차림));
if(!차림.sk){ console.log('판이 안 만들어졌다'); await b.close(); process.exit(1); }

const 열기 = await p.evaluate((sk)=>{
  const 펴기=()=>{
    window._tlDcDate=sk.substring(0,10); renderProcessTimeline();
    try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
    Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
    window._woCutGrpOpen=window._woCutGrpOpen||{};
    (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
    _woRenderBoard(sk);
  };
  펴기();
  // 진짜로 ▶시작이 떠 있는 재단카드를 고른다 — 그래야 완료까지 갈 수 있다
  const 시작들=[...document.querySelectorAll('#wo-boring-grid-'+sk+' button')]
      .filter(b=>/시작/.test(b.textContent) &&
                 /tlMarkPartStarted/.test(b.getAttribute('onclick')||''));
  if(!시작들.length) return {시작없음:true, 카드수:document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card').length};
  const 첫=시작들[0];
  const m=(첫.getAttribute('onclick')||'').match(/tlMarkPartStarted\('([^']*)','([^']*)','([^']*)'/);
  const docId=m[1], 부속키=m[2];
  const 카드=첫.closest('.wo-boring-placed-card');
  const pp=(window._woBoringParts[sk]||[]).find(x=>x.isCuttingCard &&
      카드 && (카드.textContent||'').includes(x.nm) && (x.sheets||0)>0 && !(x.받은몫>0));
  const 쓸pp = pp || (window._woBoringParts[sk]||[]).find(x=>x.isCuttingCard && (x.sheets||0)>0);
  window.__고른도면=쓸pp.planId;
  // 재단편집으로 2순위 부속을 얹은 것과 같은 꼴로 만든다
  const pl=window._cuttingPlans[쓸pp.planId];
  pl.sInfoText='762 X 180 - 전도방지 - 36 EA';
  pl.sDisplayName='PB-18TLPM-양면-발리오크';
  pl.sProducedQty=36; pl.sRowIndex=1; pl.sId='agg-common-1'; pl.sOrderIds=[...(pl.pOrderIds||[])];
  _ensureCuttingPlanInTimeline(pl);
  // 시작 기록을 카드가 쓰는 그 키로 넣는다 (파이어베이스는 안 건드린다)
  const o=confirmedOrders.find(x=>(x.docId||String(x.idNum))===docId) || confirmedOrders[0];
  o.partStarted=o.partStarted||{}; o.partStarted[부속키]={'재단':{startMs:Date.now()-120000}};
  펴기();
  const bt=[...document.querySelectorAll('#wo-boring-grid-'+sk+' button')]
      .find(b=>/완료/.test(b.textContent) && (b.getAttribute('onclick')||'').includes(window.__고른도면));
  const 새pp=(window._woBoringParts[sk]||[]).find(x=>x.planId===window.__고른도면);
  return {카드수:document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card').length,
          완료단추:!!bt, planId:window.__고른도면, nm:새pp.nm, sheets:새pp.sheets,
          extras:새pp.extras, 부속키, docId};
}, 차림.sk);
console.log('보드: '+JSON.stringify(열기));
console.log('   날 살핌: '+JSON.stringify(await p.evaluate((sk)=>{
  const 칸=(window._woBoringParts[sk]||[]);
  return {sk, 오늘:new Date().toISOString().slice(0,10), 부속수:칸.length,
    상태:칸.slice(0,3).map(x=>({nm:x.nm, cKey:x.cKey, dq:x.dq, sheets:x.sheets, 받은몫:x.받은몫})),
    판들:Object.keys(window._woBoringParts),
    단추글:[...document.querySelectorAll('#wo-boring-grid-'+sk+' button')].map(b=>b.textContent.trim()).slice(0,8)};
}, 차림.sk)));
console.log('   ▣ 완료 기본수량(팝업 예정값)의 밑값: '+JSON.stringify(await p.evaluate((sk)=>{
  const pp=(window._woBoringParts[sk]||[]).filter(x=>x.isCuttingCard)[0];
  return {부속:pp.nm, dq:pp.dq, 뽑는수:(typeof _cuttingYield==='function')?_cuttingYield(pp):null, sheets:pp.sheets};
}, 차림.sk)));
판('도면에 2순위 부속이 실려 있다', (열기.extras||[]).length>0, JSON.stringify(열기.extras));
판('완료 단추가 있다', 열기.완료단추===true, String(열기.완료단추));

// 진짜 손가락으로 완료를 누른다
const 손 = await p.evaluateHandle((sk)=>{
  // 고른 그 도면의 완료 단추를 onclick 에 적힌 도면 번호로 집는다
  return [...document.querySelectorAll('#wo-boring-grid-'+sk+' button')]
    .find(b=>/완료/.test(b.textContent) && (b.getAttribute('onclick')||'').includes(window.__고른도면));
}, 차림.sk);
await 손.asElement().tap();
await p.waitForTimeout(600);

const 팝 = await p.evaluate(()=>{
  const m=document.getElementById('_partDoneModal');
  if(!m) return {없음:true};
  const 글=(m.textContent||'').replace(/\s+/g,' ').trim();
  const 상자=m.querySelector('div > div');
  const r=상자.getBoundingClientRect();
  // 같이 나온 것 칸
  const 칸=[...m.querySelectorAll('div')].find(d=>/이 도면에서 같이 나온 것/.test(d.textContent||''));
  const 줄=칸?[...칸.querySelectorAll(':scope > div')].slice(1).map(d=>(d.textContent||'').replace(/\s+/g,' ').trim()):[];
  return {글:글.slice(0,220), 있나:!!칸, 줄, 팝가로:Math.round(r.width), 팝세로:Math.round(r.height),
          왼:Math.round(r.left), 오른:Math.round(375-r.right),
          넘침:상자.scrollWidth>상자.clientWidth+1,
          쓰기:window.__쓰기, 문서가로:document.documentElement.scrollWidth};
});
console.log('팝업: '+JSON.stringify(팝));
판('완료 확인 팝업에 「이 도면에서 같이 나온 것」 칸이 있다', 팝.있나===true, String(팝.있나));
판('같이 나온 작업물의 이름과 수량이 적힌다', (팝.줄||[]).length>0 && /\d+EA/.test((팝.줄||[]).join(' ')), JSON.stringify(팝.줄));
판('375px 에서 팝업이 화면 안에 든다', 팝.왼>=0 && 팝.오른>=0 && 팝.문서가로<=375,
   '왼 '+팝.왼+' · 오른 '+팝.오른+' · 문서 '+팝.문서가로);
판('팝업 글이 안 잘린다', 팝.넘침===false, String(팝.넘침));
판('여기까지 파이어베이스 쓰기 0', 팝.쓰기===0, 팝.쓰기+'번');
await p.screenshot({path:그림칸자리()+'/완료팝업_375.png'});

// ── 오바 칸 (09-16 02:32 지시)
const 오바 = await p.evaluate(()=>{
  const m=document.getElementById('_partDoneModal'); if(!m) return {없음:true};
  const 줄=[...m.querySelectorAll('div')].map(d=>(d.textContent||'').replace(/\s+/g,' ').trim());
  const 박스=줄.find(t=>/발주수량/.test(t)) || 줄.find(t=>/아직 못 맞춰/.test(t)) || '';
  const q=document.getElementById('_pdQty');
  const 읽기=()=>({합:(document.getElementById('_pdSum')||{}).textContent,
                  이번:(document.getElementById('_pdNow')||{}).textContent,
                  줄:(document.getElementById('_pdOverLine')||{}).textContent});
  const 처음=읽기();
  // 수량을 바꾸면 같이 움직이는가
  q.value = String((parseInt(q.value||0)||0) + 100); q.dispatchEvent(new Event('input'));
  const 올린뒤=읽기();
  q.value = '0'; q.dispatchEvent(new Event('input'));
  const 내린뒤=읽기();
  return {셈:window._pdChk, 박스:박스.slice(0,120), 처음, 올린뒤, 내린뒤,
          빨강:/오바/.test(올린뒤.줄)};
});
console.log('오바 칸: '+JSON.stringify(오바));
// 오바가 난 모습도 한 장 남긴다 (예정 수량보다 더 찍었을 때)
await p.evaluate(()=>{ const q=document.getElementById('_pdQty');
  q.value=String((window._pdChk.발주 - window._pdChk.다른) + 30); q.dispatchEvent(new Event('input')); });
await p.waitForTimeout(300);
await p.screenshot({path:그림칸자리()+'/완료팝업_오바_375.png'});
판('완료 확인 창에 발주수량 맞춰 보는 칸이 있다', !!(오바.셈 && 오바.셈.잼), JSON.stringify(오바.셈));
판('발주수량·다른 도면·이번·합계가 다 적힌다', /발주수량/.test(오바.박스) && /다른 도면에서/.test(오바.박스)
   && /이번에 찍는 것/.test(오바.박스) && /합계/.test(오바.박스), 오바.박스);
판('수량을 올리면 합계와 오바가 같이 움직인다',
   오바.올린뒤.합 !== 오바.처음.합 && 오바.빨강===true, JSON.stringify(오바.올린뒤));
판('수량을 0 으로 내리면 합계도 따라 내려간다',
   Number(오바.내린뒤.합) === Number(오바.셈.다른), '합 '+오바.내린뒤.합+' · 다른도면 '+오바.셈.다른);
판('합계 = 다른 도면 + 이번 (셈이 맞는다)',
   Number(오바.처음.합) === 오바.셈.다른 + Number(오바.처음.이번),
   오바.셈.다른+' + '+오바.처음.이번+' = '+오바.처음.합);

// 도면이 하나뿐인 카드에서는 그 칸이 안 나와야 한다
const 하나 = await p.evaluate(()=>{
  document.getElementById('_partDoneModal')?.remove();
  tlShowPartDoneConfirm('DOC1','ck','재단','2026-09-29',null,'혼자부속',10,'ck','');
  const m=document.getElementById('_partDoneModal');
  const 있나=/이 도면에서 같이 나온 것/.test((m&&m.textContent)||'');
  m?.remove();
  return 있나;
});
판('같이 나온 것이 없으면 그 칸은 안 나온다', 하나===false, String(하나));

// ── 숫자를 못 구할 때 0 으로 속이지 않는가
const 모름 = await p.evaluate(()=>{
  document.getElementById('_partDoneModal')?.remove();
  // ① 재단도면을 아직 다 못 받은 상태
  const 옛=window._자료옴.도면; window._자료옴.도면=false;
  tlShowPartDoneConfirm('DOC1','ck','재단','2026-09-29',null,'가와',10,'ck',window.__고른도면);
  const m1=document.getElementById('_partDoneModal');
  const a={못맞춤:/아직 못 맞춰 봤습니다/.test((m1&&m1.textContent)||''),
           오바글:/오바|남습니다|딱 맞습니다/.test((m1&&m1.textContent)||''),
           글:((m1&&m1.textContent)||'').replace(/\s+/g,' ').match(/아직 못 맞춰 봤습니다[^완]*/)?.[0]||''};
  m1?.remove(); window._자료옴.도면=옛;
  // ② 도면 자체를 못 찾는 카드
  tlShowPartDoneConfirm('DOC1','ck','재단','2026-09-29',null,'가와',10,'ck','없는도면');
  const m2=document.getElementById('_partDoneModal');
  const b={못맞춤:/아직 못 맞춰 봤습니다/.test((m2&&m2.textContent)||''),
           오바글:/오바|남습니다|딱 맞습니다/.test((m2&&m2.textContent)||'')};
  m2?.remove();
  return {도면안옴:a, 도면없음:b};
});
console.log('못 구할 때: '+JSON.stringify(모름));
판('재단도면을 다 못 받았으면 「아직 못 맞춰 봤습니다」 라고 한다',
   모름.도면안옴.못맞춤===true && 모름.도면안옴.오바글===false, JSON.stringify(모름.도면안옴));
판('도면을 못 찾아도 0 으로 치지 않는다',
   모름.도면없음.못맞춤===true && 모름.도면없음.오바글===false, JSON.stringify(모름.도면없음));
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'dup1   OK':'dup1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
