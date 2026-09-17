// 박스(타일)가 작업대와 똑같은가 — 폰 375px 에서 잰다.
// 기준은 작업대(viggle/index.html)의 .tile 이다. 다섯 가지를 그대로 잰다:
//   안여백 17px · 최소높이 150px · 아이콘 54px · 이름 글자 20px · 모서리 26px
// 집 박스판(#amt-home)과 거래처 박스판(#amt-vendor-home) 둘 다 본다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const HERE='/tmp/claude-0/-home-user-vivivic-apps/17fbe99e-07b2-5ca2-bd6b-e6d2d41ab942/scratchpad';
const 그림칸 = process.env.SHOTS==='1' ? '/home/user/vivivic-apps/에이엠티/shots' : HERE;
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://localhost:8899';
const O=await (await fetch(B+'/confirmed_orders.json')).json();
// 작업대 원본에서 곧바로 읽어 온 기준값 — 손으로 적지 않는다
const 작업대글 = readFileSync('/home/user/viggle/index.html','utf-8');
const 뽑기 = (덩이, 키) => {
  const m = 작업대글.match(new RegExp('\\n\\s*' + 덩이.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\{([^}]*)\\}'));
  if(!m) return null; const v = m[1].match(new RegExp('(?:^|;|\\s)' + 키 + '\\s*:\\s*([^;}]+)'));
  return v ? v[1].trim() : null;
};
const 기준 = {
  안여백: 뽑기('.tile','padding'), 최소높이: 뽑기('.tile','min-height'), 모서리: 뽑기('.tile','border-radius'),
  아이콘: 뽑기('.tile .ico','width'), 이름글자: 뽑기('.tile h3','font-size'),
  줄간: 뽑기('.tile h3','line-height'), 자간: 뽑기('.tile h3','letter-spacing'),
  부연글자: 뽑기('.tile .pct','font-size'), 부연여백: 뽑기('.tile .pct','margin'),
  칸나눔: 뽑기('.tiles','grid-template-columns'), 칸사이: 뽑기('.tiles','gap'),
};
console.log('■ 작업대 원본(viggle/index.html 에서 그대로 읽음): '+JSON.stringify(기준));

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
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1500);
await p.evaluate((O)=>{
  const o=document.getElementById('auth-login-overlay'); if(o)o.style.display='none';
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},deleteDoc:async()=>{},
    addDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{},query:x=>x,serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  if(typeof amtGoHome==='function') amtGoHome();
}, O);
await p.waitForTimeout(500);

const 재기 = (자리) => p.evaluate(sel=>{
  const 것들=[...document.querySelectorAll(sel+' .amth-tile')].filter(e=>e.offsetParent!==null);
  if(!것들.length) return null;
  const 한=(e)=>{ const s=getComputedStyle(e), r=e.getBoundingClientRect();
    const ico=e.querySelector('.amth-ico'), nm=e.querySelector('.amth-nm'), pct=e.querySelector('.amth-pct');
    const is=ico?getComputedStyle(ico):null, ir=ico?ico.getBoundingClientRect():null;
    const ns=nm?getComputedStyle(nm):null, ps=pct?getComputedStyle(pct):null;
    const svg=ico?ico.querySelector('svg'):null;
    return {바깥:Math.round(r.width)+'x'+Math.round(r.height),
            안여백:s.paddingTop, 최소높이:s.minHeight, 모서리:s.borderTopLeftRadius,
            아이콘:ir?Math.round(ir.width)+'x'+Math.round(ir.height):null, 아이콘둥글기:is?is.borderRadius:null,
            svg:svg?(svg.getAttribute('width')||'')+'x'+(svg.getAttribute('height')||''):null,
            이름글자:ns?ns.fontSize:null, 줄간:ns?ns.lineHeight:null, 자간:ns?ns.letterSpacing:null,
            부연글자:ps?ps.fontSize:null, 부연여백:ps?ps.marginTop:null};
  };
  const 통=document.querySelector(sel+' .amth-tiles');
  const ts=통?getComputedStyle(통):null;
  return {개수:것들.length, 첫:한(것들[0]), 끝:한(것들[것들.length-1]),
          칸나눔:ts?ts.gridTemplateColumns:null, 칸사이:ts?ts.gap:null,
          판세로:(()=>{const e=document.getElementById(sel.slice(1)); return e?Math.round(e.scrollHeight):null;})()};
}, 자리);

const 집 = await 재기('#amt-home');
console.log('■ 집 박스판 타일('+집.개수+'개) 첫 것: '+JSON.stringify(집.첫));
console.log('   판 세로 '+집.판세로+'px · 칸나눔 '+집.칸나눔+' · 칸사이 '+집.칸사이);

// '-.5px' 와 '-0.5px' 는 같은 값이다 — 글자가 아니라 숫자로 견준다
const 같나 = (a, b) => a===b ||
  (/px$/.test(String(a)) && /px$/.test(String(b)) && parseFloat(a)===parseFloat(b));
const 견줌 = (이름, 잰것, 기준값) => 판('타일 '+이름+' 이 작업대와 같다', 같나(잰것, 기준값), 잰것+' (작업대 '+기준값+')');
견줌('안여백', 집.첫.안여백, 기준.안여백);
견줌('최소높이', 집.첫.최소높이, 기준.최소높이);
견줌('모서리', 집.첫.모서리, 기준.모서리);
견줌('아이콘 크기', 집.첫.아이콘, parseFloat(기준.아이콘)+'x'+parseFloat(기준.아이콘));
견줌('이름 글자', 집.첫.이름글자, 기준.이름글자);
견줌('부연 글자', 집.첫.부연글자, 기준.부연글자);
견줌('자간', 집.첫.자간, 기준.자간);
판('칸 사이가 작업대와 같다', 집.칸사이===기준.칸사이, 집.칸사이+' (작업대 '+기준.칸사이+')');

// 거래처 박스판도 같은 CSS 를 쓰는가
await p.evaluate(()=>{ if(typeof amtOpenBox==='function') amtOpenBox('pending'); });
await p.waitForTimeout(700);
const 거래처 = await 재기('#amt-vendor-home');
if(!거래처){ 판('거래처 박스판 타일을 잰다', false, '타일이 안 보인다'); }
else {
  console.log('■ 거래처 박스판 타일('+거래처.개수+'개) 첫 것: '+JSON.stringify(거래처.첫));
  판('거래처 박스판 타일도 집 박스판과 똑같다',
     거래처.첫.안여백===집.첫.안여백 && 거래처.첫.최소높이===집.첫.최소높이 &&
     거래처.첫.아이콘===집.첫.아이콘 && 거래처.첫.이름글자===집.첫.이름글자,
     '안여백 '+거래처.첫.안여백+' · 최소높이 '+거래처.첫.최소높이+' · 아이콘 '+거래처.첫.아이콘+' · 이름 '+거래처.첫.이름글자);
}
// 원장재고는 알약으로 바꿨다 — 거기에 타일이 다시 생기면 안 된다
await p.evaluate(()=>{ if(typeof amtOpenStock==='function') amtOpenStock(); });
await p.waitForTimeout(400);
const 재고타일 = await p.evaluate(()=>document.querySelectorAll('#amt-stock .amth-tile').length);
판('원장재고에는 타일이 없다 (알약으로 바꿨다)', 재고타일===0, 재고타일+'개');

// 원장재고를 열어 뒀으니 그 화면을 먼저 닫는다 — amtGoHome 만으로는 안 닫힌다
await p.evaluate(()=>{ if(typeof amtCloseStock==='function') amtCloseStock();
  else if(typeof amtGoHome==='function') amtGoHome(); window.scrollTo(0,0); });
await p.waitForTimeout(400);
const 집화면 = await p.evaluate(()=>({재고:document.documentElement.dataset.amtstock||'',
  집:document.documentElement.dataset.amthome||'',
  보이는타일:[...document.querySelectorAll('#amt-home .amth-tile')].filter(e=>e.offsetParent!==null).length}));
판('그림은 박스판에서 찍는다 (원장재고가 아니라)',
   집화면.재고==='' && 집화면.보이는타일>0, JSON.stringify(집화면));
await p.screenshot({path:그림칸+'/box-375-박스판.png'});
판('375px 가로 스크롤 없다', (await p.evaluate(()=>document.documentElement.scrollWidth))<=375, '375px');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log('■ 아이콘 안 svg: 에이엠티 '+집.첫.svg+' (작업대는 첫 타일 26, 나머지 22 — 고치지 않았다)');
console.log(실패===0?'tile1   OK':'tile1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
