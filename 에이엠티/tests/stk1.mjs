import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const B='http://localhost:8899'; const 폭=parseInt(process.argv[2]||'375',10);
const O=await (await fetch(B+'/confirmed_orders.json')).json();
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:폭,height:812},isMobile:폭<500,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1800);
const 세움=await p.evaluate(({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  window.__창고={}; window.__쓴곳=[];
  const 방=(...a)=>a.join('/');
  window.db={}; window.fbFirestore={
    collection:(db,...a)=>({p:방(...a)}), doc:(db,...a)=>({p:방(...a)}),
    setDoc:async(r,v)=>{ window.__쓴곳.push(r.p); window.__창고[r.p]=Object.assign({},window.__창고[r.p],v); 알림(); },
    updateDoc:async(r,v)=>{ window.__쓴곳.push(r.p); Object.assign(window.__창고[r.p]=window.__창고[r.p]||{},v); 알림(); },
    deleteDoc:async(r)=>{ window.__쓴곳.push(r.p); delete window.__창고[r.p]; 알림(); },
    onSnapshot:(r,cb)=>{ (window.__알림들=window.__알림들||[]).push(()=>cb({forEach:f=>Object.keys(window.__창고)
      .filter(k=>k.startsWith(r.p+'/')).forEach(k=>f({id:k.split('/').pop(), data:()=>window.__창고[k]}))}));
      window.__알림들[window.__알림들.length-1](); return ()=>{}; },
    query:x=>x, addDoc:async()=>{}, serverTimestamp:()=>0, getDoc:async()=>({exists:()=>false}),
    getDocs:async()=>({forEach:()=>{}}), deleteField:()=>null };
  function 알림(){ (window.__알림들||[]).forEach(f=>f()); }
  // 사장님이 만드신 그 박스(이름만 '원장재고', 갈 곳 없음)를 그대로 넣는다
  window.__창고['artifacts/vivivic-4b7ef/public/data/amt_boxes/bmtzn0xq0f0ou']=
    {at:1789293288888, name:'원장재고', tone:'white', icon:'layers', link:'', '곳':'home'};
  amtGoHome(); amtBoxSync();
  const 짝=window._amtStockPairs();
  return {짝수:짝.length, 처음다섯:짝.slice(0,5).map(x=>x.원+' · '+(x.마||'(빈칸)')+' · '+(x.색||'(빈칸)')+' | 제품 '+x.제품+' · 줄 '+x.줄)};
},{O,L});
console.log('■ 원장에서 고른 짝:', JSON.stringify(세움,null,1));
const cdp=await ctx.newCDPSession(p);
const 탭=async(sel,n=0)=>{ const c=await p.evaluate(({s,n})=>{const es=document.querySelectorAll(s); const e=es[n]; if(!e) return null;
    e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect();
    return {x:Math.round(b.x+b.width/2), y:Math.round(b.y+b.height/2)};},{s:sel,n});
  if(!c) return false;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,radiusX:14,radiusY:14,force:1}]});
  await p.waitForTimeout(50);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.waitForTimeout(350); return true; };
console.log('■ 박스 글:', await p.evaluate(()=>{const e=document.querySelector('#amth-mine [data-amtb-id]');
  return e? e.innerText.replace(/\s*\n+\s*/g,' / ') : '(박스 없음)';}));
console.log('■ 박스 눌러 열기:', await 탭('#amth-mine [data-amtb-id]'),
  '→ 원장재고 화면?', await p.evaluate(()=>document.documentElement.dataset.amtstock==='1'));
// 원장재고는 한 칸이다 — 알약 세 줄 바로 아래가 목록 자리다(들어가는 칸이 없다).
console.log('■ 알약 줄:', await p.evaluate(()=>['색','두께','가공']
  .map(g=>g+' '+document.querySelectorAll('#ams-'+g+' .amtb-chip').length+'개').join(' · ')));
// 안 고르면 목록을 안 낸다(09-17 02:00 지시). 재려면 먼저 색상 알약 하나를 눌러야 한다.
console.log('■ 안 고른 채 목록:', await p.evaluate(()=>({
  줄:document.querySelectorAll('#ams-list .ams-row').length,
  안내:(document.querySelector('#ams-list .ams-empty')||{}).textContent})));
console.log('■ 첫 색상 알약 누르기:', await 탭('#ams-색 .amtb-chip'),
  '→', await p.evaluate(()=>document.getElementById('ams-sub').textContent));
const 재기=async(sel)=>p.evaluate(s=>{const e=document.querySelector(s); if(!e) return null;
  const r=e.getBoundingClientRect(), st=getComputedStyle(e);
  return {w:Math.round(r.width),h:Math.round(r.height),글자:st.fontSize};},sel);
console.log('■ 머리:', await p.evaluate(()=>document.getElementById('ams-sub').textContent),
  '· 줄 수', await p.evaluate(()=>document.querySelectorAll('#ams-list .ams-row').length));
console.log('■ 첫 줄 글:', await p.evaluate(()=>{const e=document.querySelector('#ams-list .ams-row');
  return e? e.innerText.replace(/\s*\n+\s*/g,' / ') : '(없음)';}));
console.log('■ 크기: 줄', JSON.stringify(await 재기('#ams-list .ams-row')),
  '· + 단추', JSON.stringify(await 재기('.ams-q button')), '· 숫자칸', JSON.stringify(await 재기('.ams-q input')));
// 손가락으로 + 세 번
for(let i=0;i<3;i++) await 탭('#ams-list .ams-row .ams-q button',1);
console.log('■ + 세 번 누른 뒤 — 담긴 칸:', JSON.stringify(await p.evaluate(()=>window.__쓴곳.slice(-1))),
  '\n  담긴 것:', JSON.stringify(await p.evaluate(()=>{const k=window.__쓴곳[window.__쓴곳.length-1]; return window.__창고[k];})),
  '\n  화면 값:', await p.evaluate(()=>document.querySelector('#ams-list .ams-q input').value));
// 숫자 직접 넣기
await p.evaluate(()=>{const i=document.querySelectorAll('#ams-list .ams-q input')[1]; i.value='120';
  i.dispatchEvent(new Event('change',{bubbles:true}));});
await p.waitForTimeout(200);
console.log('■ 둘째 줄에 120 적기 → 담긴 것:', JSON.stringify(await p.evaluate(()=>{
  const k=window.__쓴곳[window.__쓴곳.length-1]; return {칸:k, 값:window.__창고[k]};})));
// 다른 기기에서 따라오는가 — 창고에만 넣고 소식을 울린다
await p.evaluate(()=>{ const k=Object.keys(window.__창고).find(x=>x.includes('amt_plate_stock'));
  window.__창고[k].수량=777; (window.__알림들||[]).forEach(f=>f()); });
await p.waitForTimeout(250);
console.log('■ 다른 기기가 777 로 고친 척 → 화면:', await p.evaluate(()=>document.querySelector('#ams-list .ams-q input').value));
// 찾기
await p.evaluate(()=>{const i=document.getElementById('ams-find'); i.value='아이보리'; i.dispatchEvent(new Event('input',{bubbles:true}));});
await p.waitForTimeout(200);
console.log('■ "아이보리" 찾기 →', await p.evaluate(()=>document.getElementById('ams-sub').textContent),
  '· 줄', await p.evaluate(()=>document.querySelectorAll('#ams-list .ams-row').length));
await p.evaluate(()=>{const i=document.getElementById('ams-find'); i.value=''; i.dispatchEvent(new Event('input',{bubbles:true}));});
await p.waitForTimeout(200);
// 길게 누르기가 손잡이와 안 부딪히는가 — 이 화면엔 길게 누르기를 안 걸었다
const c=await p.evaluate(()=>{const e=document.querySelector('#ams-list .ams-row');
  e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect(); return {x:Math.round(b.x+30),y:Math.round(b.y+b.height/2)};});
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,radiusX:14,radiusY:14,force:1}]});
await p.waitForTimeout(900);
const 뜬것=await p.evaluate(()=>({고치기판:document.documentElement.dataset.amtb==='1',
  값바뀜:document.querySelector('#ams-list .ams-q input').value}));
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await p.waitForTimeout(200);
console.log('■ 재고 줄 0.9초 길게 눌러 봄:', JSON.stringify(뜬것), '(아무 일도 없어야 한다)');
console.log('■ 문서 가로', await p.evaluate(()=>document.documentElement.scrollWidth),
  '· 목록 넘침', await p.evaluate(()=>{const e=document.getElementById('ams-list'); return e.scrollWidth>e.clientWidth+1;}),
  '· 오류', errs.length, errs.slice(0,3));
await p.screenshot({path:process.argv[3]||'/tmp/stk.png'});
console.log('■ 뒤로:', await 탭('#amt-stock-back button'),
  '→ 박스판?', await p.evaluate(()=>document.documentElement.dataset.amthome==='1'));
await b.close();
