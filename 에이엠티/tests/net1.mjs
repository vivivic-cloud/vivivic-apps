// 로그인이 아예 안 될 때 화면이 영영 「불러오는 중」 에 멈추지 않는가 — 40초 보조 시계.
// ① 망이 끊긴 채 열면 빨강이 몇 초 만에 뜨는가 (40초 안쪽이어야 한다)
// ② 자료가 정상으로 다 왔으면 40초가 지나도 거짓 빨강이 안 뜨는가 (창 열 개 한꺼번에)
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b=await 브라우저열기();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const 폰={...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true};

// ── ① 망이 끊긴 채로 열어 둔다 (이 자리에서는 파이어베이스에 닿지 못한다 = 망 끊김과 같다)
{
  const ctx=await b.newContext(폰); const p=await ctx.newPage();
  const 연때=Date.now();
  await p.goto(URL,{waitUntil:'load'});
  await p.evaluate(()=>{ const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; appMode='process'; });
  // 빨강이 뜰 때까지 기다린다 (최대 60초)
  let 뜬때=null;
  for(let i=0;i<120;i++){
    const 빨강=await p.evaluate(()=>{
      const c=document.getElementById('process-timeline-container');
      return /다 못 받았습니다/.test((c&&c.textContent)||'');
    });
    if(빨강){ 뜬때=Date.now(); break; }
    await p.waitForTimeout(500);
  }
  const 상태=await p.evaluate(()=>({동기섰나:window.__자료동기섰나, 시계섰나:window._자료시계섰나,
    늦음:window._자료늦음, 못온:window._자료못옴(), 막힘:window._자료막힘(),
    글:((document.getElementById('process-timeline-container')||{}).textContent||'').replace(/\s+/g,' ').trim().slice(0,70)}));
  const 초 = 뜬때 ? +((뜬때-연때)/1000).toFixed(1) : null;
  console.log('① 망 끊긴 채 열기 → 빨강 '+(초===null?'안 뜸':초+'초')+' · '+JSON.stringify(상태));
  판('① 로그인이 아예 안 돼도 빨강이 뜬다 (40초 보조 시계)', 초!==null && 초<=48, String(초)+'초');
  판('① 듣기가 아예 안 섰던 상황이 맞다', 상태.동기섰나!==true && 상태.시계섰나!==true,
     '동기섰나 '+상태.동기섰나+' · 15초시계섰나 '+상태.시계섰나);
  판('① 그 동안 작업은 막혀 있다', 상태.막힘===true, String(상태.막힘));
  await ctx.close();
}

// ── ② 자료가 정상으로 다 왔으면 40초가 지나도 거짓 빨강이 없어야 한다 (창 10개)
{
  const ctx=await b.newContext(폰);
  const 창=[];
  for(let i=0;i<10;i++){
    const p=await ctx.newPage();
    await p.goto(URL,{waitUntil:'load'});
    await p.evaluate(()=>{
      const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
      appMode='process';
      window.__쓰기=0;
      window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{window.__쓰기++;},
        setDoc:async()=>{window.__쓰기++;},deleteDoc:async()=>{window.__쓰기++;},
        collection:()=>({}),onSnapshot:()=>{},query:x=>x,addDoc:async()=>{window.__쓰기++;},
        serverTimestamp:()=>0,getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
      // 자료가 정상으로 다 온 상태
      ['원장','발주','도면','차례'].forEach(k=>window._자료왔다(k));
      window._자료시계시작();      // 듣기를 건 것처럼 15초 시계도 돌린다
    });
    창.push(p);
  }
  console.log('② 창 10개 열어 놓고 45초 기다리는 중…');
  await 창[0].waitForTimeout(45000);
  let 빨강=0, 회색=0, 쓰기합=0;
  for(const p of 창){
    const r=await p.evaluate(()=>{
      const c=document.getElementById('process-timeline-container');
      const t=(c&&c.textContent)||'';
      return {빨강:/다 못 받았습니다/.test(t), 회색:/불러오는 중/.test(t), 늦음:window._자료늦음, 쓰기:window.__쓰기};
    });
    if(r.빨강) 빨강++; if(r.회색) 회색++; 쓰기합+=r.쓰기;
  }
  console.log('② 45초 뒤 열 창: 빨강 '+빨강+'개 · 회색 '+회색+'개 · 파이어베이스 쓰기 합 '+쓰기합+'번');
  판('② 정상일 때 40초 시계가 거짓 빨강을 안 띄운다', 빨강===0, '빨강 '+빨강+' / 10');
  판('② 파이어베이스 쓰기가 안 늘었다', 쓰기합===0, String(쓰기합)+'번');
  await ctx.close();
}
console.log(실패===0?'net1   OK':'net1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
