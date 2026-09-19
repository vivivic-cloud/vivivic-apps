import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const b=await 브라우저열기();
const 판정의 = { '재단':['AMT'], '보링':['1호기','2호기','멀티보링'], '엣지':['1호기','2호기','3호기','4호기','5호기'] };
for (const [공정, 기계들] of Object.entries(판정의)) {
  const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html?viggle=1',{waitUntil:'load'});
  await p.waitForTimeout(1500);
  await p.evaluate(({공정,기계들})=>{
    const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
    const sk='2026-09-15-'+공정;
    const ords=[{code:'샘플-20260101-01',nm:'(본)본보기 오픈장_미색',부속:['가와','이동선반','지판']},
                {code:'샘플-20260101-02',nm:'(본)본보기 수납장 1200',부속:['도어','속가와']}];
    confirmedOrders.length=0; const parts=[]; let w=600;
    ords.forEach((o,oi)=>{confirmedOrders.push({idNum:1400+oi,docId:'d'+oi,orderCode:o.code,displayName:o.nm,orderQty:50,amtTimeline:true,partInfoMap:{},partCompletions:{},partStarted:{},deliveryDate:'2026-09-15'});
      o.부속.forEach(nm=>parts.push({cKey:o.code+'_'+nm,nm,pm:8,dq:50,orderCode:o.code,orderKey:'d'+oi,orderName:o.nm,plateName:'PB-18T',coating:'양면',finish:'미색',rw:w++,rd:400,isCuttingCard:공정==='재단',sheets:5,perSheet:4,boardParts:[{lp:0,tp:0,wp:.4,hp:.4,bg:'#ddd',dw:'600',dh:'400'}],pRowIndex:null,coveredOrderIds:[1400+oi]}));});
    window.__saved=[];
    window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async(r,d)=>{window.__saved.push(d);},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
    window._woCutGrpOpen={}; window._woOnlyMac={};
    window._tlDcDate='2026-09-15'; appMode='process';
    tlExpandDateCard('2026-09-15'); tlDcExpandSection(공정);
    const st={pool:[]};
    // 첫 발주는 첫 기계, 둘째 발주는 둘째 기계(있으면)에 둔다
    기계들.forEach(m=>st[m]=[]);
    parts.forEach(x=>{ const m = (x.orderCode==='샘플-20260101-02' && 기계들[1]) ? 기계들[1] : 기계들[0]; st[m].push(x.cKey); });
    window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
    _woRenderBoard(sk);
  }, {공정,기계들});
  await p.waitForTimeout(400);
  const cdp=await ctx.newCDPSession(p);
  const 탭=async(sel)=>{ const r=await p.evaluate(s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)};}, sel);
    if(!r) return false;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y,radiusX:14,radiusY:14,force:1}]});
    await p.waitForTimeout(110);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await p.waitForTimeout(350); return true; };
  const 상태=()=>p.evaluate(()=>({
    칸수: document.querySelectorAll('.wo-boring-mac-col').length,
    머리: [...document.querySelectorAll('.wo-boring-machine-hdr')].map(e=>e.textContent.replace(/\s+/g,' ').trim()),
    칸너비: [...document.querySelectorAll('.wo-boring-mac-col')].map(e=>Math.round(e.getBoundingClientRect().width)),
    상품줄: [...document.querySelectorAll('.wo-cut-grp-nm')].map(e=>e.textContent),
    카드: document.querySelectorAll('.wo-boring-placed-card').length,
    가로: document.documentElement.scrollWidth,
  }));
  console.log('════ '+공정);
  console.log('  전체:', JSON.stringify(await 상태()));
  await 탭('.wo-boring-machine-hdr');       // 첫 호기 머리글 탭
  console.log('  1호기만:', JSON.stringify(await 상태()));
  // 그 안에서 상품 줄 펼치기
  const 폈나 = await 탭('.wo-cut-grp');
  console.log('  상품 줄 톡 → 보이는 카드:', await p.evaluate(()=>[...document.querySelectorAll('.wo-boring-placed-card')].filter(e=>e.offsetParent!==null).length), '(눌림', 폈나+')');
  if (공정==='엣지') await p.screenshot({path:'한호기-엣지.png'});
  await 탭('.wo-mac-only-btn');             // ← 전체 호기
  console.log('  돌아온 뒤:', JSON.stringify(await 상태()));
  console.log('  오류', errs.length, errs.slice(0,2));
  await p.close(); await ctx.close();
}
await b.close();
