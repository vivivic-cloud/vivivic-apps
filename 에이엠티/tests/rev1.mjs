import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1700);
console.log(JSON.stringify(await p.evaluate(({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  const h=currentFullData[0];
  window.db={}; window.fbFirestore={ doc:()=>({}), updateDoc:async()=>{}, setDoc:async()=>{},
    deleteDoc:async()=>{}, collection:()=>({}), onSnapshot:()=>{}, query:x=>x, addDoc:async()=>{},
    serverTimestamp:()=>0, getDoc:async()=>({exists:()=>false}), getDocs:async()=>({forEach:()=>{}}),
    deleteField:()=>null };
  const 결과=[];
  O.forEach(원본=>{
    const o=JSON.parse(JSON.stringify(원본));
    if(o.amtConfirmedCancel) return;
    o.amtTimeline=true;
    window._cuttingPlans={}; window._woBoring={}; window._woBoringParts={};
    confirmedOrders.length=0; confirmedOrders.push(o);
    _autoGenerateCuttingPlansForOrder(o);
    // 도면이 나와야 하는 부속 = 살아 있고 · 재단치수가 있고 · 원장에 들어가는 것
    const BW=2440,BD=1220,fCut=5,bT=4.5;
    const 나와야 = Object.entries(o.partInfoMap||{}).filter(([k,pd])=>{
      if(!pd || pd.isDeleted) return false;
      const ri=parseInt(String(k).split('-')[2]); const r=currentFullData[ri]; if(!r) return false;
      const rw=parseFloat(r[h.indexOf('재단W')])||0, rd=parseFloat(r[h.indexOf('재단D')])||0;
      if(rw<=0||rd<=0) return false;
      if((pd.qty||0)<=0) return false;
      const 방=_앉힐방향(rw,rd,r[h.indexOf('결보호')],BW,BD,fCut,bT);
      const per=Math.floor((BW-fCut+bT)/(방.w+bT))*Math.floor((BD-fCut+bT)/(방.d+bT));
      return per>0;
    }).map(([k])=>parseInt(String(k).split('-')[2]));
    const 나온행=new Set(Object.values(window._cuttingPlans).map(x=>x.pRowIndex).filter(x=>x!=null));
    const 빠진=나와야.filter(r=>!나온행.has(r));
    결과.push({발주:o.orderCode, 발주수량:o.orderQty,
      '도면이 나와야 할 부속':나와야.length, '만들어진 도면':Object.keys(window._cuttingPlans).length,
      '빠진 부속':빠진.length,
      '빠진 부속 이름':빠진.map(r=>String(currentFullData[r][h.indexOf('부속명')]||'').trim())});
  });
  return 결과;
},{O,L}),null,1));
console.log('오류',errs.length,errs.slice(0,2));
await b.close();
