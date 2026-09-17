// 원장재고 — 가공(마감)별로 제대로 갈라지고, 그 안에서 더 좁혀지는가.
//
// ※ 이 시험은 제가 지웠다가 되살린 것입니다.
//    처음에는 「가공 칩줄」(v1.9.94)을 보던 시험이었는데, 그 칩줄 자체가 사장님 지시로
//    걷히고 「가공 박스」(v1.9.95)로 바뀌면서 제가 지워 버렸습니다. 보던 것(가공별로
//    갈라지는가 · 셋을 같이 걸면 좁혀지는가 · 거르기 풀기가 다 푸는가)은 그대로 두고,
//    보는 자리만 칩줄에서 박스로 옮겨 다시 붙게 했습니다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const HERE='/tmp/claude-0/-home-user-vivivic-apps/17fbe99e-07b2-5ca2-bd6b-e6d2d41ab942/scratchpad';
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
await ctx.route('https://cdn.tailwindcss.com*', r=>r.fulfill({status:200,contentType:'application/javascript',
  body:'document.write('+JSON.stringify('<style>'+CSS+'</style>')+');'}));
for (const [무늬,길] of [['https://cdn.sheetjs.com/**','node_modules/xlsx/dist/xlsx.full.min.js'],
                        ['https://cdn.jsdelivr.net/npm/sortablejs**','node_modules/sortablejs/Sortable.min.js'],
                        ['https://cdn.jsdelivr.net/npm/gsap**','node_modules/gsap/dist/gsap.min.js']])
  await ctx.route(무늬, r=>r.fulfill({status:200,contentType:'application/javascript',body:readFileSync(HERE+'/'+길,'utf-8')}));
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);

await p.evaluate((L)=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  window.__쓰기=0; const 셈=()=>async()=>{window.__쓰기++;};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:셈(),setDoc:셈(),deleteDoc:셈(),addDoc:셈(),
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  amtOpenStock();
}, L);
await p.waitForTimeout(400);

// ── 손으로 센 것: 원장에서 마감(가공)이 몇 가지이고 짝이 몇인가
const 손 = await p.evaluate(()=>{
  const 짝=window._amtStockPairs();
  const m=new Map(); 짝.forEach(x=>{ const v=x.마||'(가공 없음)'; m.set(v,(m.get(v)||0)+1); });
  return {가짓수:m.size, 전체짝:짝.length, 표:[...m.entries()].sort((a,b)=>b[1]-a[1])};
});
console.log('■ 원장에서 센 가공: '+손.가짓수+'가지 · 전체 '+손.전체짝+'짝');
console.log('   '+손.표.map(([k,v])=>k+'('+v+')').join(' · '));

const 알약 = (칸) => p.evaluate(id=>[...(document.getElementById(id)||{children:[]}).children]
  .map(b=>({이름:b.childNodes[0].textContent.trim(),
            짝:parseInt(((b.querySelector('.ams-수')||{}).textContent||'').replace(/[^\d]/g,''),10)||0,
            값:b.dataset['값']})), 칸);
const 가공칩 = await 알약('ams-가공');
console.log('■ 화면의 가공 알약: '+가공칩.length+'개');
판('가공이 원장에 적힌 그대로 갈라진다 (합치지 않는다)',
   가공칩.length===손.가짓수 && 손.표.every(([k,v])=>가공칩.some(x=>x.값===k && x.짝===v)),
   '화면 '+가공칩.length+'가지 · 원장 '+손.가짓수+'가지');
판('가공별 짝을 다 더하면 전체와 같다', 가공칩.reduce((a,c)=>a+c.짝,0)===손.전체짝,
   가공칩.reduce((a,c)=>a+c.짝,0)+' / '+손.전체짝);

// ── 진짜 손가락으로 제일 큰 가공 알약을 누르고, 색상·두께로 더 좁힌다
const 톡 = async (sel, n=0) => {
  const h=await p.evaluateHandle(({s,n})=>document.querySelectorAll(s)[n]||null,{s:sel,n});
  const el=h.asElement(); if(!el) return false;
  await el.scrollIntoViewIfNeeded(); await el.tap(); await p.waitForTimeout(280); return true;
};
const 칩톡 = async (칸, 값) => {
  const i=await p.evaluate(({s,g})=>[...(document.getElementById(s)||{children:[]}).children]
      .findIndex(e=>e.dataset['값']===g), {s:칸,g:값});
  if(i<0) return false; return 톡('#'+칸+' .amtb-chip', i);
};
const 셈보기 = () => p.evaluate(()=>({
  머리:(document.getElementById('ams-sub')||{}).textContent,
  줄:document.querySelectorAll('#ams-list .ams-row').length,
  켠것:['색','두께','가공'].map(g=>[...document.querySelectorAll('#ams-'+g+' .amtb-chip.on')]
        .map(e=>e.dataset['값'])).flat(),
  푼다:(document.getElementById('ams-푼다')||{classList:{contains:()=>null}}).classList.contains('on')}));

const 다 = await 셈보기();
const 큰것 = 가공칩[0];
await 칩톡('ams-가공', 큰것.값);
const 안 = await 셈보기();
console.log('■ 「'+큰것.이름+'」 알약 누른 뒤: '+JSON.stringify(안));
판('가공 알약을 누르면 그 가공 짝만 목록에 남는다', 안.줄===큰것.짝 && 안.켠것[0]===큰것.값,
   큰것.이름+' 알약 '+큰것.짝+'짝 · 화면 '+안.줄+'줄');

// 그 위에 색상 하나를 더 건다
const 색칩 = await 알약('ams-색');
await 칩톡('ams-색', 색칩[0].값);
const 색까지 = await 셈보기();
// 두께도 하나 더
const 두칩 = await 알약('ams-두께');
await 칩톡('ams-두께', 두칩[0].값);
const 두께까지 = await 셈보기();
console.log('■ 좁히기: 전체 '+다.줄+'줄 → 가공만 '+안.줄+'줄 → +'+색칩[0].이름+' '+색까지.줄+'줄 → +'+두칩[0].이름+' '+두께까지.줄+'줄');
판('가공 + 색상 + 두께를 같이 걸면 좁혀진다 (AND 그대로)',
   안.줄 >= 색까지.줄 && 색까지.줄 >= 두께까지.줄,
   안.줄+' ≥ '+색까지.줄+' ≥ '+두께까지.줄);
판('거르기를 걸면 「거르기 풀기」 가 켜진다', 두께까지.푼다===true, String(두께까지.푼다));

// ── 거르기 풀기가 다 푸는가
await 톡('#ams-푼다', 0);
const 푼뒤 = await 셈보기();
console.log('■ 거르기 푼 뒤: '+JSON.stringify(푼뒤));
판('거르기 풀기가 색상·두께·가공을 다 푼다', 푼뒤.켠것.length===0, JSON.stringify(푼뒤.켠것));
판('풀면 전체 짝 수로 돌아온다', 푼뒤.줄===손.전체짝, 손.전체짝+' → '+푼뒤.줄);
판('풀면 「거르기 풀기」 가 꺼진다', 푼뒤.푼다===false, String(푼뒤.푼다));

// ── 같은 알약을 다시 누르면 풀린다 (들어가는 칸이 없으니 되돌리는 길은 이것뿐이다)
await 칩톡('ams-가공', 큰것.값);
const 다시1 = await 셈보기();
await 칩톡('ams-가공', 큰것.값);
const 다시2 = await 셈보기();
console.log('■ 같은 알약 두 번: '+다시1.줄+'줄 → '+다시2.줄+'줄');
판('같은 알약을 다시 누르면 풀린다', 다시1.줄===큰것.짝 && 다시2.줄===손.전체짝,
   다시1.줄+' → '+다시2.줄);

const 끝 = await p.evaluate(()=>({쓰기:window.__쓰기, 문서가로:document.documentElement.scrollWidth}));
판('375px 가로 스크롤 없다', 끝.문서가로<=375, 끝.문서가로+'px');
판('파이어스토어 쓰기 0 (원장은 읽기만)', 끝.쓰기===0, 끝.쓰기+'번');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'stock1   OK':'stock1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
