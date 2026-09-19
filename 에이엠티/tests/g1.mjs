import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const b=await chromium.launch();
async function 판(펼침){
  const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html?viggle=1',{waitUntil:'load'});
  await p.waitForTimeout(1500);
  await p.evaluate((펼침)=>{
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
    const sk='2026-09-15-재단';
    const ords=[
      {code:'샘플-20260101-01', nm:'(본)본보기 오픈장_미색', 부속:['가와','이동선반','지판','상판']},
      {code:'샘플-20260101-02', nm:'(본)본보기 수납장 1200', 부속:['도어','속가와']},
      {code:'아인-20260911-01', nm:'블랑2000 맥스 멀티렌지대',       부속:['고정선반','손잡이','마이다']},
    ];
    confirmedOrders.length=0;
    const parts=[]; let w=600;
    ords.forEach((o,oi)=>{
      confirmedOrders.push({idNum:1400+oi, docId:'d'+oi, orderCode:o.code, displayName:o.nm,
        orderQty:50, amtTimeline:true, partInfoMap:{}, partCompletions:{}, partStarted:{}, deliveryDate:'2026-09-15'});
      o.부속.forEach(nm=>parts.push({cKey:o.code+'_'+nm, nm, pm:8, dq:50, orderCode:o.code, orderKey:'d'+oi,
        orderName:o.nm, plateName:'PB-18T', coating:'양면', finish:'미색', rw:w++, rd:400,
        isCuttingCard:true, sheets:5, perSheet:4,
        boardParts:[{lp:0,tp:0,wp:.4,hp:.4,bg:'#ddd',dw:'600',dh:'400'}], pRowIndex:null, coveredOrderIds:[1400+oi]}));
    });
    window.__saved=[];
    window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async(r,d)=>{window.__saved.push(d);},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
    window._woCutGrpOpen={};
    if (펼침) ords.forEach(o=>{ window._woCutGrpOpen[sk+'|'+o.code]=true; });
    window._tlDcDate='2026-09-15'; appMode='process';
    tlExpandDateCard('2026-09-15'); tlDcExpandSection('재단');
    window._woBoringParts[sk]=parts.slice();
    window._woBoring[sk]={'AMT':parts.map(x=>x.cKey), pool:[]};
    _woRenderBoard(sk);
  }, 펼침);
  await p.waitForTimeout(400);
  return {p, ctx, errs};
}
const 상품차례 = p => p.evaluate(()=>_woGetEntries('2026-09-15-재단','AMT').map(k=>String(k).split('_')[0]).filter((v,i,a)=>v!==a[i-1]));
const 전체 = p => p.evaluate(()=>_woGetEntries('2026-09-15-재단','AMT'));

for (const 펼침 of [false, true]) {
  const {p, ctx, errs} = await 판(펼침);
  const cdp=await ctx.newCDPSession(p);
  const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t, touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
  console.log('════ 상품 줄 ' + (펼침?'펼친 채':'접힌 채'));
  console.log('  상품 줄 수:', await p.evaluate(()=>document.querySelectorAll('.wo-cut-grp').length),
              '· 보이는 카드:', await p.evaluate(()=>[...document.querySelectorAll('.wo-boring-placed-card')].filter(e=>e.offsetParent!==null).length));
  console.log('  처음 상품 차례:', (await 상품차례(p)).join(' · '));
  // 첫 상품 줄을 길게 눌러 셋째 상품 아래로
  const 자리 = await p.evaluate(()=>{
    const g=[...document.querySelectorAll('.wo-cut-grp')];
    const a=g[0].getBoundingClientRect(), c=g[2].getBoundingClientRect();
    return {from:{x:Math.round(a.x+a.width/2), y:Math.round(a.y+a.height/2)}, to:{y:Math.round(c.bottom+6)}};
  });
  await 손('touchStart', 자리.from.x, 자리.from.y);
  await p.waitForTimeout(460);
  const 켬 = await p.evaluate(()=>({이동:!!document.querySelector('.wo-cut-grp.wo-move-on'), 안내:(document.querySelector('.wo-move-hint')||{}).textContent, 짚기판:!!document.querySelector('.vg-sheet')}));
  for(let i=1;i<=8;i++){ await 손('touchMove', 자리.from.x, 자리.from.y + (자리.to.y-자리.from.y)*i/8); await p.waitForTimeout(15); }
  const 중 = await p.evaluate(()=>!!document.querySelector('.wo-move-bar'));
  await 손('touchEnd',0,0);
  await p.waitForTimeout(350);
  console.log('  길게 누름:', JSON.stringify(켬), '· 자리줄', 중);
  console.log('  바뀐 상품 차례:', (await 상품차례(p)).join(' · '));
  console.log('  전체 차례:', (await 전체(p)).join(' '));
  console.log('  저장:', await p.evaluate(()=>window.__saved.length), '회 · 펼침 그대로:',
              await p.evaluate(()=>JSON.stringify(window._woCutGrpOpen)));
  console.log('  오류', errs.length, errs.slice(0,2));
  if (!펼침) await p.screenshot({path:'상품-접힘.png'});
  await p.close(); await ctx.close();
}
await b.close();
