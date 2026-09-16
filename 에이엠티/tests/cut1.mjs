import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const O=await (await fetch(B+'/확정발주_지금.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1600);
const r=await p.evaluate(({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(Object.assign({docId:x._id},x)));
  currentFullData.length=0; L.forEach(rr=>currentFullData.push(rr));
  appMode='cutting'; if(typeof switchPage==='function') switchPage('cutting');
  if(typeof renderID0508==='function') renderID0508();
  const 칸=document.getElementById('identity-list-container');
  const 줄들=[...칸.querySelectorAll('[class*="order-code"], .order-code-badge')].map(e=>e.textContent.trim());
  return {글:칸.textContent.replace(/\s+/g,' ').trim().slice(0,90), 오더줄:줄들,
    자료수:confirmedOrders.length,
    보낸것:confirmedOrders.filter(o=>o.amtRegistered===true).length,
    타임라인:confirmedOrders.filter(o=>o.amtTimeline===true&&!o.amtConfirmedCancel).length};
},{O,L});
console.log('■ 재단발주목록:', JSON.stringify(r,null,1));
// 한 건을 '보낸 것'으로 표시하면(화면 안에서만) 다시 나오는지
const r2=await p.evaluate(()=>{ confirmedOrders[0].amtRegistered=true; renderID0508();
  const 칸=document.getElementById('identity-list-container');
  return {글:칸.textContent.replace(/\s+/g,' ').trim().slice(0,70)};});
console.log('■ 한 건을 보낸 것으로 두면:', JSON.stringify(r2));
console.log('  오류',errs.length,errs.slice(0,2));
await b.close();
