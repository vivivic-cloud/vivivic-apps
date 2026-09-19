// 캐시·localStorage 지우고 열 번 열어, 열 때마다 끝까지 따라가며 적는다.
// 한 번 열 때마다: ① 「불러오는 중」 이 몇 초 보였나 ② 카드가 제대로 떴나
//                  ③ 빨강이 떴나 ④ ▶시작이 눌리는 상태였나
// 이 상자는 파이어베이스에 못 닿으므로, 자료가 오는 것은 네 군데 듣기가 답을 준
// 것과 똑같이 손으로 넣어 흉내낸다. 망이 정말 끊긴 경우는 net1 에서 따로 쟀다.
import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
import { readFileSync } from 'node:fs';
const HERE = await 자재();   // 막힌 CDN 대신 쓸 것들 — 없으면 스스로 갖춘다
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O=await 자료('confirmed_orders');
const C=await 자료('cutting_plans');
const L=await 자료('원장');
const b=await chromium.launch();
const 폰={...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true};
const 늦기=[300,900,1500,2400,600,1200,2000,400,1800,1000];   // 자료가 오는 데 걸리는 시간을 번마다 다르게
const 표=[];
for(let n=0;n<10;n++){
  const ctx=await b.newContext({...폰, storageState:undefined});   // 캐시·저장소 없는 새 창
  // 이 상자는 테일윈드 CDN 에 못 닿는다 — npm 으로 받은 진짜 테일윈드로 뽑아 둔
  // CSS 를 그 자리에 끼워 넣는다(앱 파일은 안 건드린다).
  await ctx.route('https://cdn.tailwindcss.com*', route => route.fulfill({
    status:200, contentType:'application/javascript',
    body:'document.write('+JSON.stringify('<style id="__tw">'+CSS+'</style>')+');' }));
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const t0=Date.now();
  await p.goto(URL,{waitUntil:'load'});
  await p.evaluate(()=>{ try{localStorage.clear();sessionStorage.clear();}catch(e){}
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    document.documentElement.removeAttribute('data-amthome');
    switchPage('process');
    if(typeof renderProcessTimeline==='function') renderProcessTimeline(); });
  // 「불러오는 중」 이 보이기 시작한 때
  const 첫글=await p.evaluate(()=>{ const c=document.getElementById('process-timeline-container');
    const t=(c&&c.textContent||'').replace(/\s+/g,' ').trim();
    return {불러오는중:/불러오는 중/.test(t), 비었다:/발주확정 버튼을 눌러주세요/.test(t), 빨강:/다 못 받았습니다/.test(t), 글:t.slice(0,50)}; });
  const 보이기시작=Date.now();
  // 자료가 오기까지 기다린다 (번마다 다르게)
  await p.waitForTimeout(늦기[n]);
  const 온때=Date.now();
  const 끝 = await p.evaluate(({O,C,L})=>{
    const 테=(()=>{const d=document.createElement('div');d.className='grid grid-cols-2';document.body.appendChild(d);
      const on=getComputedStyle(d).display==='grid';d.remove();return on;})();
    window.__테일윈드=테;
    confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
    currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
    window._cuttingPlans={}; C.forEach(x=>{window._cuttingPlans[x.confirmId]=x;});
    window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={};
    window.__쓰기=0;
    window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},setDoc:async()=>{window.__쓰기++;},
      deleteDoc:async()=>{window.__쓰기++;},collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{window.__쓰기++;},
      serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
    // 네 군데가 답을 준 것과 똑같이
    ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
    const 본=new Set(); Object.values(window._cuttingPlans).forEach(x=>{const s=_ensureCuttingPlanInTimeline(x); if(s)본.add(s);});
    const sk=[...본].find(s=>/-재단$/.test(s));
    window._tlDcDate=sk.substring(0,10); renderProcessTimeline();
    const c=document.getElementById('process-timeline-container');
    const 글=(c&&c.textContent||'').replace(/\s+/g,' ').trim();
    const 날짜카드=document.querySelectorAll('#process-timeline-container .tl-date-card, #process-timeline-container [id^="tl-dc-"]').length;
    try{tlExpandDateCard(sk.substring(0,10));}catch(e){} try{tlDcExpandSection('재단');}catch(e){}
    Object.values(window._cuttingPlans).forEach(x=>_ensureCuttingPlanInTimeline(x));
    window._woCutGrpOpen=window._woCutGrpOpen||{};
    (window._woBoringParts[sk]||[]).forEach(x=>{window._woCutGrpOpen[sk+'|'+(x.orderCode||'')]=true;});
    _woRenderBoard(sk);
    const 카드=[...document.querySelectorAll('#wo-boring-grid-'+sk+' .wo-boring-placed-card')];
    return {불러오는중:/불러오는 중/.test(글), 빨강:/다 못 받았습니다/.test(글), 비었다:/발주확정 버튼을 눌러주세요/.test(글),
            줄:날짜카드, 카드:카드.length, 도면:카드.filter(x=>x.querySelector('svg')).length,
            시작:[...document.querySelectorAll('#wo-boring-grid-'+sk+' button')].filter(x=>/시작/.test(x.textContent)).length,
            막힘:window._자료막힘(), 쓰기:window.__쓰기, 테일윈드:window.__테일윈드};
  },{O,C,L});
  const 보인초=+((온때-보이기시작)/1000).toFixed(2);
  const 제대로 = 끝.테일윈드 && 첫글.불러오는중 && !첫글.비었다 && !끝.불러오는중 && !끝.빨강 && !끝.비었다
                 && 끝.카드>0 && 끝.도면===끝.카드 && 끝.시작>0 && 끝.막힘===false && errs.length===0;
  표.push({번:n+1, 첫화면:첫글.불러오는중?'불러오는 중':(첫글.비었다?'비었다':(첫글.빨강?'빨강':'딴것')),
           보인초, 카드:끝.카드, 도면:끝.도면, 시작단추:끝.시작, 빨강:끝.빨강, 막힘:끝.막힘, 쓰기:끝.쓰기, 오류:errs.length, 제대로});
  if(!제대로) console.log('!! '+(n+1)+'번째 어긋남: '+JSON.stringify({첫글, 끝, errs}));
  await ctx.close();
}
console.log('번 | 첫화면       | 「불러오는 중」 보인 시간 | 카드 | 도면 | ▶시작 | 빨강 | 막힘 | 쓰기 | 오류 | 제대로');
표.forEach(r=>console.log(String(r.번).padStart(2)+' | '+r.첫화면.padEnd(12)+' | '+String(r.보인초).padStart(19)+'초 | '
  +String(r.카드).padStart(4)+' | '+String(r.도면).padStart(4)+' | '+String(r.시작단추).padStart(5)+' | '
  +String(r.빨강).padStart(4)+' | '+String(r.막힘).padStart(4)+' | '+String(r.쓰기).padStart(4)+' | '+String(r.오류).padStart(4)+' | '+(r.제대로?'예':'아니오')));
const ok=표.filter(r=>r.제대로).length;
console.log('\n열 번 중 제대로 나온 것: '+ok+' / 10');
console.log('첫 화면이 「비었다」 로 나온 적: '+표.filter(r=>r.첫화면==='비었다').length+' / 10');
console.log('파이어베이스 쓰기 합: '+표.reduce((a,r)=>a+r.쓰기,0)+'번');
await b.close(); process.exit(ok===10?0:1);
