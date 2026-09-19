import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const 폭 = parseInt(process.argv[2]||'375',10);
const b=await 브라우저열기();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:폭,height:812}, isMobile:폭<500, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html?viggle=1',{waitUntil:'load'});
await p.waitForTimeout(1500);
const sk='2026-09-15-엣지';
// 가짜 줄로만 시험한다 — 진짜 발주·완료 기록은 건드리지 않는다
await p.evaluate((sk)=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0;
  const mk=(i,코드,이름,부속들,끝난것)=>{
    const comp={};
    const parts=부속들.map((nm,j)=>({cKey:코드+'_'+nm,nm,pm:4,dq:50,orderCode:코드,orderKey:'d'+i,orderName:이름,
      plateName:'PB-18T',coating:'양면',finish:'화이트',rw:600+j,rd:400,isCuttingCard:false,pRowIndex:null,coveredOrderIds:[1400+i]}));
    부속들.forEach((nm,j)=>{ if(끝난것.includes(j)) comp[코드+'_'+nm]={'엣지':true}; });
    confirmedOrders.push({idNum:1400+i,docId:'d'+i,orderCode:코드,displayName:이름,orderQty:50,amtTimeline:true,
      partInfoMap:{},partCompletions:comp,partStarted:{},deliveryDate:'2026-09-15'});
    return parts;
  };
  const A=mk(0,'샘플-20260101-03','(본)본보기 수납장 1200 나무흰색',
    ['도어','속가와','상판','지판','이동선반','뒷판','걸레받이'],[0,2]);          // 7장 중 2장 완료
  const B=mk(1,'샘플-20260101-01','(본)본보기 오픈장_미색',['가와','이동선반','지판'],[0,1,2]); // 3장 다 완료
  const C=mk(2,'아인-20260911-02','블랑2000 맥스 멀티렌지대',
    Array.from({length:23},(_,j)=>'부속'+(j+1)), [0,1,2,3,4]);                    // 23장 중 5장
  const parts=[...A,...B,...C];
  window.__saved=[];
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async(r,d)=>{window.__saved.push(d);},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  window._woCutGrpOpen={}; window._woOnlyMac={};
  window._tlDcDate='2026-09-15'; appMode='process';
  tlExpandDateCard('2026-09-15'); tlDcExpandSection('엣지');
  const st={pool:[]}; ['1호기','2호기','3호기','4호기','5호기'].forEach(m=>st[m]=[]);
  st['1호기']=parts.map(x=>x.cKey);
  window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
  _woRenderBoard(sk);
}, sk);
await p.waitForTimeout(500);
const 줄 = ()=>p.evaluate(()=>[...document.querySelectorAll('.wo-cut-grp')].map(g=>{
  const r=g.getBoundingClientRect(); const 점=g.querySelector('.wo-grp-점');
  const 점들=점?[...점.querySelectorAll('i')]:[];
  const nm=g.querySelector('.wo-cut-grp-nm');
  return {상품:(nm?nm.textContent:'').slice(0,16), 줄크기:Math.round(r.width)+'x'+Math.round(r.height),
    점수:점들.length, 찬점:점들.filter(e=>e.classList.contains('on')).length,
    점지름:점들.length?Math.round(점들[0].getBoundingClientRect().width*10)/10:0,
    넘침꼬리:점?(점.querySelector('b')||{}).textContent||null:null,
    점줄높이:점?Math.round(점.getBoundingClientRect().height):0,
    점한줄:점&&점들.length?(new Set(점들.map(e=>Math.round(e.getBoundingClientRect().top)))).size===1:null,
    점줄폭:점?Math.round(점.getBoundingClientRect().width):0,
    안잘림:점?(점.scrollWidth<=점.clientWidth+1):null,
    속폭:점?점.scrollWidth:0, 담을폭:점?점.clientWidth:0,
    다끝:g.classList.contains('wo-다끝'), 이름투명도:nm?getComputedStyle(nm).opacity:null};
}));
console.log('■ 폭', 폭, JSON.stringify(await 줄(), null, 1));
console.log('  문서 가로', await p.evaluate(()=>document.documentElement.scrollWidth), '· 오류', errs.length, errs.slice(0,2));
if(폭===375){
  // 옅어진 줄도 눌리는가
  const cdp=await ctx.newCDPSession(p);
  const r=await p.evaluate(()=>{const g=[...document.querySelectorAll('.wo-cut-grp')].find(x=>x.classList.contains('wo-다끝')); if(!g) return null; g.scrollIntoView({block:'center'}); const b=g.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)};});
  if(r){ await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y,radiusX:14,radiusY:14,force:1}]});
    await p.waitForTimeout(110); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(400);
    console.log('  옅어진 줄 톡 → 펼쳐진 카드 수:', await p.evaluate(()=>[...document.querySelectorAll('.wo-boring-placed-card')].filter(e=>e.offsetParent!==null).length)); }
  const g0=await p.$('.wo-cut-grp');
  if(g0) await g0.screenshot({path:'dot_row.png'});
  await p.screenshot({path:'dot375.png'});
}
await b.close();
