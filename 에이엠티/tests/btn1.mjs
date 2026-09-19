import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899'; const 폭=parseInt(process.argv[2]||'375',10);
const O=await 자료('confirmed_orders');
const L=await 자료('원장');
const b=await chromium.launch();
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:폭,height:812},isMobile:폭<500,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1800);
const 셋=await p.evaluate(({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  // 진짜 발주 하나를 베껴 '아직 확정 안 한 것' 으로 화면에만 세운다. 파이어스토어엔 안 쓴다.
  confirmedOrders.length=0;
  const 씨 = O.find(o=>o.partInfoMap) || O[0];
  const 가짜 = JSON.parse(JSON.stringify(씨));
  가짜.docId='시험-대기'; 가짜.idNum=9911; 가짜.orderCode='시험-20260914-01';
  가짜.amtTimeline=false; 가짜.amtRegistered=false; 가짜.amtConfirmedCancel=false; 가짜.checked=true;
  가짜.isCancelRequested=false; delete 가짜.editInfo; delete 가짜.editCompleted;   // 미해결 요청 없는 깨끗한 줄
  confirmedOrders.push(가짜);
  window.__쓴곳=[];
  window.db={}; window.fbFirestore={ collection:()=>({p:'x'}), doc:(db,...a)=>({p:a.join('/')}),
    setDoc:async(r)=>{window.__쓴곳.push(r.p);}, updateDoc:async(r,v)=>{window.__쓴곳.push(r.p);
      // 화면이 바로 따라오게 해 준다 (진짜 창고 대신)
      const o=confirmedOrders.find(x=>x.docId===String(r.p).split('/').pop()); if(o) Object.assign(o,v);},
    deleteDoc:async()=>{}, onSnapshot:()=>{}, query:x=>x, addDoc:async()=>{}, serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}), getDocs:async()=>({forEach:()=>{}}), deleteField:()=>null };
  const _옛토 = window.showToastMessage;
  window.__토스트들=[];
  window.showToastMessage = function(m){ window.__토스트들.push(String(m)); window.__토스트=String(m);
    try{ return _옛토.apply(this, arguments); }catch(e){} };
  if(typeof amtOpenBox==='function') amtOpenBox('pending');
  window._amtVendor='*'; if(typeof amtVendorSync==='function') amtVendorSync();
  renderPendingOrders();
  return {발주:가짜.orderCode};
},{O,L});
console.log('■ 세운 대기 발주:', JSON.stringify(셋));
// 이 상자에선 텔윈드 CDN 이 막혀 있다. 단추가 쓰는 낱개 규칙만 그대로 넣어 크기를 잰다.
await p.addStyleTag({content:`
  #pending-batch-edit-footer{ padding:16px; display:flex; justify-content:center; gap:12px;
    border-top:1px solid #f1f1ef; background:#fbfbfa; }
  #pending-batch-edit-footer.hidden{ display:none; }
  #pending-batch-edit-footer button{ padding:8px 32px; font-size:13px; font-weight:700;
    border-radius:8px; color:#fff; border:0; }
  #pending-batch-edit-footer button:nth-child(1){ background:#b0aeaa; }
  #pending-batch-edit-footer button:nth-child(2){ background:#37352f; }
`});
// 체크박스를 진짜로 눌러 바닥 단추가 뜨게 한다
const cdp0=await ctx.newCDPSession(p);
const 탭0=async(sel)=>{const c=await p.evaluate(s=>{const e=document.querySelector(s); if(!e) return null;
  e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect();
  return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)};},sel);
  if(!c) return false;
  await cdp0.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,radiusX:14,radiusY:14,force:1}]});
  await p.waitForTimeout(50); await cdp0.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.waitForTimeout(350); return true;};
console.log('  대기 목록 상태:', JSON.stringify(await p.evaluate(()=>({
  체크박스수:document.querySelectorAll('.pending-order-check').length,
  대기줄수:document.querySelectorAll('#pending-order-list > div').length,
  거래처판:document.documentElement.dataset.amtvendor||'(없음)',
  박스:document.documentElement.dataset.amtbox||'(없음)',
  대기목록보임:(()=>{const e=document.getElementById('pending-order-container');
    return e? getComputedStyle(e).display : '(없음)';})()}))));
await 탭0('.pending-order-check');
// 체크박스는 손가락 신호로 안 켜지는 수가 있다 — 여기선 '단추를 손가락으로 누르는 것'이
// 시험 대상이므로, 고르는 것은 확실히 켜 두고 간다.
await p.evaluate(()=>{const c=document.querySelector('.pending-order-check');
  if(c && !c.checked){ c.click(); }});
await p.waitForTimeout(350);
console.log('■ 상품 고름 → 체크됨',
  await p.evaluate(()=>document.querySelectorAll('.pending-order-check:checked').length));
const 바닥=async()=>p.evaluate(()=>{
  const f=document.getElementById('pending-batch-edit-footer'); if(!f) return {없음:true};
  const bs=[...f.querySelectorAll('button')];
  const fr=f.getBoundingClientRect();
  return { 보임:!f.classList.contains('hidden'),
    단추:bs.map(e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e);
      return {글:e.textContent.trim(), 폭:Math.round(r.width), 높이:Math.round(r.height),
              위:Math.round(r.top), 바탕:s.backgroundColor, 글자:s.fontSize, 모서리:s.borderRadius};}),
    한줄인가: bs.length===2 && Math.abs(bs[0].getBoundingClientRect().top - bs[1].getBoundingClientRect().top) < 2,
    바닥폭:Math.round(fr.width), 넘침:f.scrollWidth>f.clientWidth+1,
    글잘림: bs.some(e=>e.scrollWidth>e.clientWidth+1 || e.getBoundingClientRect().height>44) };
});
console.log('■ 발주서 바닥 단추:', JSON.stringify(await 바닥(),null,1));
// 진짜 손가락으로 누른다
const cdp=await ctx.newCDPSession(p);
const c=await p.evaluate(()=>{const e=[...document.querySelectorAll('#pending-batch-edit-footer button')]
  .find(x=>x.textContent.trim()==='발주확정'); if(!e) return null;
  e.scrollIntoView({block:'center'}); const b=e.getBoundingClientRect();
  return {x:Math.round(b.x+b.width/2), y:Math.round(b.y+b.height/2)};});
console.log('■ 「발주확정」 단추 찾음:', !!c);
if(c){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,radiusX:14,radiusY:14,force:1}]});
  await p.waitForTimeout(60);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.waitForTimeout(900);
}
console.log('■ 성공 알림 글:', JSON.stringify(await p.evaluate(()=>{
  const t=[...document.querySelectorAll('div,span')].map(e=>e.textContent||'')
    .filter(x=>x.includes('발주확정되었습니다')||x.includes('타임라인에 등록되었습니다'));
  return t.length? t[t.length-1].replace(/\s+/g,' ').trim().slice(0,60) : (window.__토스트||'(못 잡음)');})));
console.log('■ 누른 뒤 — 그 발주가 확정으로 넘어갔나:', JSON.stringify(await p.evaluate(()=>{
  const o=confirmedOrders.find(x=>x.orderCode==='시험-20260914-01');
  return {amtTimeline:o&&o.amtTimeline, 창고에쓴곳:(window.__쓴곳||[]).map(x=>x.split('/').pop()),
    확정목록에보이나: !!document.getElementById('tlconf-card-시험-대기')
      || [...document.querySelectorAll('#timeline-confirmed-section')].some(e=>e.innerText.includes('시험-20260914-01'))};
})));
// 타임라인 빈 자리 안내문 — 그 화면을 열어서 본다
await p.evaluate(()=>{ confirmedOrders.length=0;          // 확정된 것이 하나도 없는 상태로
  if(typeof amtOpenBox==='function') amtOpenBox('timeline');
  if(typeof renderProcessTimeline==='function') renderProcessTimeline(); });
await p.waitForTimeout(700);
console.log('■ 타임라인 빈 자리 안내문:', JSON.stringify(await p.evaluate(()=>{
  const c=document.getElementById('process-timeline-container');
  if(!c) return '(칸 없음)';
  const r=c.getBoundingClientRect();
  return {글:(c.innerText||'').replace(/\s+/g,' ').trim(), 보임:r.width>0&&r.height>0};})));
console.log('■ 뜬 알림 모두:', JSON.stringify(await p.evaluate(()=>window.__토스트들||[])));
console.log('■ 화면 어디에도 「타임라인 등록」 이 남아 있나:', await p.evaluate(()=>document.body.innerText.includes('타임라인 등록')));
console.log('■ 문서 가로', await p.evaluate(()=>document.documentElement.scrollWidth), '· 오류', errs.length, errs.slice(0,3));
await p.evaluate(()=>{const f=document.getElementById('pending-batch-edit-footer'); if(f) f.scrollIntoView({block:'center'});});
await p.waitForTimeout(200);
await p.screenshot({path:process.argv[3]||'/tmp/btn.png'});
await b.close();
