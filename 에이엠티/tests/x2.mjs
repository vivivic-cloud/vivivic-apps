import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const b=await chromium.launch();
async function 판(파일, 공정, 기계들){
  const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/'+파일+'?viggle=1',{waitUntil:'load'});
  await p.waitForTimeout(1500);
  await p.evaluate(({공정,기계들})=>{
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
    const sk='2026-09-15-'+공정;
    const ords=[
      {code:'샘플-20260101-01', nm:'(본)본보기 오픈장_미색', 부속:['가와','이동선반','지판','상판']},
      {code:'샘플-20260101-02', nm:'(본)본보기 수납장 1200', 부속:['도어','속가와']},
      {code:'아인-20260911-01', nm:'블랑2000 맥스 멀티렌지대',       부속:['고정선반','손잡이','마이다']},
    ];
    confirmedOrders.length=0;
    const parts=[]; let w=600;
    ords.forEach((o,oi)=>{
      confirmedOrders.push({idNum:1400+oi,docId:'d'+oi,orderCode:o.code,displayName:o.nm,orderQty:50,
        amtTimeline:true,partInfoMap:{},partCompletions:{},partStarted:{},deliveryDate:'2026-09-15'});
      o.부속.forEach(nm=>parts.push({cKey:o.code+'_'+nm,nm,pm:8,dq:50,orderCode:o.code,orderKey:'d'+oi,
        orderName:o.nm,plateName:'PB-18T',coating:'양면',finish:'미색',rw:w++,rd:400,
        isCuttingCard:공정==='재단',sheets:5,perSheet:4,
        boardParts:[{lp:0,tp:0,wp:.4,hp:.4,bg:'#ddd',dw:'600',dh:'400'}],pRowIndex:null,coveredOrderIds:[1400+oi]}));
    });
    window.__saved=[];
    window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async(r,d)=>{window.__saved.push(d);},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
    window._woCutGrpOpen={};
    window._tlDcDate='2026-09-15'; appMode='process';
    tlExpandDateCard('2026-09-15'); tlDcExpandSection(공정);
    const st={pool:[]}; 기계들.forEach((m,i)=>st[m]= i===0?parts.map(x=>x.cKey):[]);
    window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
    _woRenderBoard(sk);
  }, {공정,기계들});
  await p.waitForTimeout(400);
  return {p, ctx, errs};
}
const F='%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const MACS=['1호기','2호기','3호기','4호기','5호기'];
const SK='2026-09-15-엣지';
const 상품 = p => p.evaluate(()=>_woGetEntries('2026-09-15-엣지','1호기').map(k=>String(k).split('_')[0]).filter((v,i,a)=>v!==a[i-1]));
const 전체 = p => p.evaluate(()=>_woGetEntries('2026-09-15-엣지','1호기'));

// ① 짧게 톡 = 펼치기·접기
{
  const {p,ctx,errs}=await 판(F,'엣지',MACS);
  const cdp=await ctx.newCDPSession(p);
  const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
  const pos=await p.evaluate(()=>{const r=document.querySelectorAll('.wo-cut-grp')[0].getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
  const 보임=()=>p.evaluate(()=>[...document.querySelectorAll('.wo-boring-placed-card')].filter(e=>e.offsetParent!==null).length);
  console.log('① 짧게 톡  처음', await 보임());
  await 손('touchStart',pos.x,pos.y); await p.waitForTimeout(150); await 손('touchEnd',0,0); await p.waitForTimeout(350);
  console.log('   한 번 톡 →', await 보임());
  await 손('touchStart',pos.x,pos.y); await p.waitForTimeout(150); await 손('touchEnd',0,0); await p.waitForTimeout(350);
  console.log('   두 번 톡 →', await 보임(), '· 오류', errs.length);
  await p.close(); await ctx.close();
}
// ② 상품 줄 길게 눌러 옮기기 (접힌 채 / 펼친 채)
for (const 펼침 of [false,true]) {
  const {p,ctx,errs}=await 판(F,'엣지',MACS);
  if (펼침) { await p.evaluate(()=>{const sk='2026-09-15-엣지';
    (window._woBoringParts[sk]||[]).forEach(pp=>{window._woCutGrpOpen[sk+'|'+_woCutGroupKey(pp)]=true;}); _woRenderBoard(sk);}); await p.waitForTimeout(300); }
  const cdp=await ctx.newCDPSession(p);
  const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
  console.log('② 상품 줄 옮기기 ' + (펼침?'펼친 채':'접힌 채'));
  console.log('   처음:', (await 상품(p)).join(' · '), '· 보이는 카드', await p.evaluate(()=>[...document.querySelectorAll('.wo-boring-placed-card')].filter(e=>e.offsetParent!==null).length));
  const 자리=await p.evaluate(()=>{const g=[...document.querySelectorAll('.wo-cut-grp')];
    const a=g[0].getBoundingClientRect(), c=g[2].getBoundingClientRect();
    return {x:Math.round(a.x+a.width/2), y:Math.round(a.y+a.height/2), to:Math.round(c.bottom+6)};});
  await 손('touchStart',자리.x,자리.y); await p.waitForTimeout(460);
  const 켬=await p.evaluate(()=>({이동:!!document.querySelector('.wo-cut-grp.wo-move-on'),안내:(document.querySelector('.wo-move-hint')||{}).textContent,짚기판:!!document.querySelector('.vg-sheet')}));
  for(let i=1;i<=8;i++){ await 손('touchMove',자리.x,자리.y+(자리.to-자리.y)*i/8); await p.waitForTimeout(15); }
  await 손('touchEnd',0,0); await p.waitForTimeout(350);
  console.log('   길게:', JSON.stringify(켬));
  console.log('   바뀐 상품:', (await 상품(p)).join(' · '));
  console.log('   전체:', (await 전체(p)).join(' '));
  console.log('   저장', await p.evaluate(()=>window.__saved.length), '회 · 오류', errs.length, errs.slice(0,2));
  await p.close(); await ctx.close();
}
// ③ 안쪽 카드 옮기기 + 기계 사이 옮기기
{
  const {p,ctx,errs}=await 판(F,'엣지',MACS);
  await p.evaluate(()=>{const sk='2026-09-15-엣지';
    (window._woBoringParts[sk]||[]).forEach(pp=>{window._woCutGrpOpen[sk+'|'+_woCutGroupKey(pp)]=true;}); _woRenderBoard(sk);});
  await p.waitForTimeout(300);
  const cdp=await ctx.newCDPSession(p);
  const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
  console.log('③ 안쪽 카드 → 2호기');
  console.log('   처음 1호기:', (await 전체(p)).join(' '));
  const 자리=await p.evaluate(()=>{const c=document.querySelectorAll('.wo-boring-placed-card')[0].getBoundingClientRect();
    const cols=[...document.querySelectorAll('.wo-boring-mac-col')].map(e=>{const r=e.getBoundingClientRect();return{mac:e.dataset.mac,x:Math.round(r.x+r.width/2),y:Math.round(r.y+40)};});
    return {from:{x:Math.round(c.x+c.width/2),y:Math.round(c.y+14)}, 칸:cols};});
  await 손('touchStart',자리.from.x,자리.from.y); await p.waitForTimeout(460);
  const on=await p.evaluate(()=>!!document.querySelector('.wo-boring-placed-card.wo-move-on'));
  const 표적=자리.칸[1];
  for(let i=1;i<=8;i++){ await 손('touchMove', 자리.from.x+(표적.x-자리.from.x)*i/8, 표적.y); await p.waitForTimeout(15); }
  const 안내=await p.evaluate(()=>(document.querySelector('.wo-move-hint')||{}).textContent);
  await 손('touchEnd',0,0); await p.waitForTimeout(350);
  console.log('   이동켜짐', on, '· 안내', JSON.stringify(안내));
  console.log('   1호기:', (await 전체(p)).join(' '));
  console.log('   2호기:', (await p.evaluate(()=>_woGetEntries('2026-09-15-엣지','2호기'))).join(' '));
  console.log('   저장', await p.evaluate(()=>window.__saved.length), '회 · 오류', errs.length, errs.slice(0,2));
  await p.close(); await ctx.close();
}
await b.close();
