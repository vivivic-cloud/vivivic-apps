// v1.9.85 마무리 세 가지 확인 — 숫자로.
// ① 원장 내려받기가 깨지면 빨강이 즉시 뜨는가 (15초 안 기다림)
// ② 자료가 정상으로 오는 중에는 빨강이 안 뜨는가 (열 번)
// ③ 안내 상자 좌·우 여백이 같은가 (375px) — 빨강·회색 둘 다
// ④ 막힌 카드를 진짜 손가락으로 눌러도 시작이 안 되는가
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await 브라우저열기();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };

const 폰={...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true};

// ── ① 원장 내려받기를 깨뜨렸을 때 빨강이 몇 초 만에 뜨나 ────────────────
{
  const ctx=await b.newContext(폰); const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1200);
  const 초 = await p.evaluate(async ()=>{
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    appMode='process';
    ['발주','도면','차례'].forEach(k=>window._자료왔다(k));   // 원장만 남긴다
    window._자료시계시작();                                   // 시계도 돌린다(15초)
    const 시작=Date.now();
    // 원장 내려받기가 아주 깨진 상황 — loadCloudExcelData 의 바깥 catch 가 하는 일
    window._자료탈났다('원장', new Error('일부러 깨뜨림'));
    const c=document.getElementById('process-timeline-container');
    return { 걸린초: +((Date.now()-시작)/1000).toFixed(2),
             빨강: /다 못 받았습니다/.test((c&&c.textContent)||''),
             글: ((c&&c.textContent)||'').replace(/\s+/g,' ').trim().slice(0,60) };
  });
  console.log('① 원장 깨뜨림 → ', JSON.stringify(초));
  판('① 원장이 깨지면 빨강이 즉시 뜬다 (15초 안 기다림)', 초.빨강===true && 초.걸린초 < 1,
     초.걸린초+'초 · 빨강 '+초.빨강);
  await ctx.close();
}

// ── ② 자료가 정상으로 오는 중에는 빨강이 안 뜬다 (열 번) ─────────────────
{
  let 빨강=0, 회색=0;
  for (let i=0;i<10;i++){
    const ctx=await b.newContext(폰); const p=await ctx.newPage();
    await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1000);
    const r=await p.evaluate(()=>{
      const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
      appMode='process'; renderProcessTimeline();
      const c=document.getElementById('process-timeline-container');
      const t=(c&&c.textContent||'');
      return {빨강:/다 못 받았습니다/.test(t), 회색:/불러오는 중/.test(t), 시계:window._자료시계섰나};
    });
    if(r.빨강) 빨강++; if(r.회색) 회색++;
    await ctx.close();
  }
  console.log('② 그냥 열었을 때 열 번: 빨강 '+빨강+'번 · 회색(불러오는 중) '+회색+'번');
  판('② 정상으로 오는 중에는 빨강이 한 번도 안 뜬다', 빨강===0, '빨강 '+빨강+' / 10');
  판('② 대신 「불러오는 중」 이 뜬다', 회색===10, '회색 '+회색+' / 10');
}

// ── ③ 안내 상자 좌·우 여백 (375px) ──────────────────────────────────────
for (const [딱지, 어떻게] of [['회색 (불러오는 중)', null], ['빨강 (다 못 받았습니다)', 'red']]) {
  const ctx=await b.newContext(폰); const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1200);
  const r=await p.evaluate((어떻게)=>{
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    try{ switchPage('process'); }catch(e){}   // 사람이 공정관리 탭을 누르는 것과 같게
    appMode='process';
    if(어떻게==='red'){ ['발주','도면','차례'].forEach(k=>window._자료왔다(k)); window._자료탈났다('원장','일부러'); }
    else renderProcessTimeline();
    renderProcessTimeline();
    // 이 상자에서는 구역이 숨겨진 채로 뜬다(진짜 폰에서는 공정관리에서 보인다).
    // 자리를 재려면 보이게 해 놓아야 한다 — 재기 위한 손질이고 앱은 안 건드린다.
    const sec=document.getElementById('order-timeline-section');
    if(sec){ sec.classList.remove('hidden'); sec.style.setProperty('display','block','important'); }
    const c=document.getElementById('process-timeline-container');
    const box=c&&c.firstElementChild;
    const track=document.getElementById('tl-infinite-track');
    const wrap=document.getElementById('tl-infinite-wrap');
    if(!box||!track) return {없음:true};
    void track.offsetWidth;
    const a=box.getBoundingClientRect(), t=track.getBoundingClientRect();
    const w=wrap.getBoundingClientRect();
    return { 감쌈폭:Math.round(w.width),
             // 여백은 '담고 있는 자리(감쌈)' 을 기준으로 잰다. 화면 폭으로 재면
             // 이 상자에서 붙는 스크롤바 16px 이 섞여 한쪽이 더 넓어 보인다.
             왼쪽여백:Math.round(a.left - w.left), 오른쪽여백:Math.round(w.right - a.right),
             화면기준왼쪽:Math.round(a.left), 화면기준오른쪽:Math.round(window.innerWidth-a.right),
             상자폭:Math.round(a.width), 트랙폭:Math.round(t.width), 화면폭:window.innerWidth,
             가로스크롤:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
             결:track.className };
  }, 어떻게);
  console.log('③ '+딱지+' → '+JSON.stringify(r));
  판('③ '+딱지+' 좌·우 여백이 같다', !r.없음 && Math.abs(r.왼쪽여백-r.오른쪽여백)<=2,
     '왼쪽 '+r.왼쪽여백+'px · 오른쪽 '+r.오른쪽여백+'px');
  판('③ '+딱지+' 트랙이 화면보다 안 넓다', !r.없음 && r.트랙폭<=r.화면폭 && !r.가로스크롤,
     '트랙 '+r.트랙폭+'px · 화면 '+r.화면폭+'px · 가로스크롤 '+r.가로스크롤);
  await ctx.close();
}

// ── ④ 막힌 카드를 진짜 손가락으로 눌러 본다 ─────────────────────────────
{
  const ctx=await b.newContext(폰); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);
  const 세움 = await p.evaluate(({O,C,L})=>{
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
    // 사장님이 실제로 찍으신 시작·완료 기록이 자료에 들어 있다. 시험은 아무것도
    // 안 찍힌 자리에서 시작해야 뜻이 있으므로, 이 창에서만 지우고 쓴다(파이어베이스는 안 건드린다).
    confirmedOrders.forEach(o=>{ o.partStarted={}; o.partCompletions={}; });
    currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
    window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
    window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
    window.__쓰기=0;
    window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},
      setDoc:async()=>{window.__쓰기++;},deleteDoc:async()=>{window.__쓰기++;},
      collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{window.__쓰기++;},
      serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
    appMode='process';
    ['원장','발주','차례'].forEach(k=>window._자료왔다(k));   // 도면만 못 받은 상태
    const 판=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)판.add(s);});
    const sk=[...판].find(s=>/-재단$/.test(s)); window.__sk=sk;
    window._tlDcDate=sk.substring(0,10);
    try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
    window._woCutGrpOpen=window._woCutGrpOpen||{};
    (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
    if(document.getElementById('wo-boring-grid-'+sk)) _woRenderBoard(sk);
    const 카드=[...document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card')];
    return {sk, 카드:카드.length,
            시작단추:카드.filter(c=>[...c.querySelectorAll('button')].some(bb=>/시작/.test(bb.textContent))).length,
            막힘:window._자료막힘()};
  },{O,C,L});
  console.log('④ 도면만 못 받은 채 보드: '+JSON.stringify(세움));
  // 진짜 손가락으로 첫 카드를 눌러 본다
  const cdp=await ctx.newCDPSession(p);
  const 자리=await p.evaluate(()=>{
    const e=document.querySelector('#wo-boring-grid-'+window.__sk+' .wo-boring-placed-card');
    if(!e) return null; e.scrollIntoView({block:'center'});
    const r=e.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
  });
  let 눌러본=false;
  if(자리){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:자리.x,y:자리.y,radiusX:14,radiusY:14,force:1}]});
    await p.waitForTimeout(80);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await p.waitForTimeout(400); 눌러본=true;
  }
  const 뒤=await p.evaluate(()=>{
    const o=confirmedOrders[0];
    const 시작기록=Object.keys((o&&o.partStarted)||{}).length;
    const 완료기록=Object.keys((o&&o.partCompletions)||{}).length;
    const 카드=[...document.querySelectorAll('#wo-boring-grid-'+window.__sk+' .wo-boring-placed-card')];
    return {시작기록, 완료기록, 쓰기:window.__쓰기,
            시작단추:카드.filter(c=>[...c.querySelectorAll('button')].some(bb=>/시작/.test(bb.textContent))).length};
  });
  console.log('④ 진짜 손가락으로 누른 뒤: '+JSON.stringify(뒤)+' (눌러봄 '+눌러본+')');
  판('④ 막힌 동안 ▶시작 단추가 아예 없다', 세움.시작단추===0, '시작 단추 '+세움.시작단추+' / 카드 '+세움.카드);
  판('④ 진짜 손가락으로 눌러도 시작·완료 기록이 안 생긴다',
     눌러본 && 뒤.시작기록===0 && 뒤.완료기록===0 && 뒤.쓰기===0,
     '시작기록 '+뒤.시작기록+' · 완료기록 '+뒤.완료기록+' · 파이어베이스 쓰기 '+뒤.쓰기+'번');
  판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
  await ctx.close();
}
console.log(실패===0?'boot2   OK':'boot2   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
