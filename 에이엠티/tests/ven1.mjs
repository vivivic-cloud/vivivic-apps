import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const b=await chromium.launch();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1500);
const cdp=await ctx.newCDPSession(p);
const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
const 탭=async(sel,i=0)=>{const r=await p.evaluate(({sel,i})=>{const e=document.querySelectorAll(sel)[i]; if(!e) return null; e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)};},{sel,i});
  if(!r) return false; await 손('touchStart',r.x,r.y); await p.waitForTimeout(110); await 손('touchEnd',0,0); await p.waitForTimeout(500); return true;};
await p.evaluate(({O})=>{
  const o=document.getElementById('auth-login-overlay'); if(o)o.style.display='none';
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  // 한 건은 거래처를 비워 둔다 — 어디로 가는지 보려고
  confirmedOrders[3] = Object.assign({}, confirmedOrders[3], {supplier:''});
  if(typeof amtOpenBox==='function') amtOpenBox('pending');
  if(typeof renderPendingOrders==='function') renderPendingOrders();
  if(typeof renderTimelineConfirmedList==='function') renderTimelineConfirmedList();
},{O});
await p.waitForTimeout(700);
const 판=()=>p.evaluate(()=>({
  판보임: getComputedStyle(document.getElementById('amt-vendor-home')).display,
  타일: [...document.querySelectorAll('#amtv-tiles .amth-tile')].map(t=>t.textContent.replace(/\s+/g,' ').trim()),
  머리: (document.getElementById('amtv-sub')||{}).textContent,
  대기목록보임: getComputedStyle(document.getElementById('pending-order-container')).display,
  돌아가기: getComputedStyle(document.getElementById('amt-vendor-bar')).display,
  가로: document.documentElement.scrollWidth,
}));
console.log('① 거래처 판:', JSON.stringify(await 판(),null,1));
// ② 가나가구 박스를 손가락으로
const i = await p.evaluate(()=>[...document.querySelectorAll('#amtv-tiles .amth-tile')].findIndex(t=>t.textContent.includes('가나가구')));
console.log('  가나가구 타일 차례:', i);
await 탭('#amtv-tiles .amth-tile', i);
console.log('② 가나가구를 누른 뒤:', JSON.stringify(await p.evaluate(()=>({
  판보임:getComputedStyle(document.getElementById('amt-vendor-home')).display,
  지금:(document.getElementById('amtv-now')||{}).textContent,
  돌아가기:getComputedStyle(document.getElementById('amt-vendor-bar')).display,
  대기목록보임:getComputedStyle(document.getElementById('pending-order-container')).display,
  확정수:(document.getElementById('timeline-confirmed-count')||{}).textContent,
  확정줄:[...document.querySelectorAll('#timeline-confirmed-list')].map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,120)),
})),null,1));
// ③ 돌아오는 길
await 탭('#amt-vendor-bar button');
console.log('③ 돌아온 뒤 판보임:', await p.evaluate(()=>getComputedStyle(document.getElementById('amt-vendor-home')).display));
// ④ 전체보기
await 탭('#amtv-tiles .amth-tile', 0);
console.log('④ 전체보기:', JSON.stringify(await p.evaluate(()=>({
  지금:(document.getElementById('amtv-now')||{}).textContent,
  확정수:(document.getElementById('timeline-confirmed-count')||{}).textContent,
  확정줄:[...document.querySelectorAll('#timeline-confirmed-list')].map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,120)),
}))));
console.log('오류',errs.length,errs.slice(0,3));
await p.screenshot({path:'ven_home.png'});
await b.close();
