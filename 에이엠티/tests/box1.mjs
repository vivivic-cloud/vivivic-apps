// 자료 안내 상자(「불러오는 중」 · 「다 못 받았습니다」)가 폰 화면에 맞게 앉는가.
// ※ 이 시험은 제가 같은 이름으로 다른 시험을 덮어써서 잃었다가 다시 쓴 것입니다.
//    보던 값(좌우 여백 10px 씩 · 가로 스크롤 없음)을 그대로 잽니다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const HERE='/tmp/claude-0/-home-user-vivivic-apps/17fbe99e-07b2-5ca2-bd6b-e6d2d41ab942/scratchpad';
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
for (const [폭, opt] of [[375,{...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true}],
                         [1280,{viewport:{width:1280,height:900}}]]) {
  console.log('════ 폭 '+폭+'px ════');
  const ctx=await b.newContext(opt);
  await ctx.route('https://cdn.tailwindcss.com*', r=>r.fulfill({status:200,contentType:'application/javascript',
    body:'document.write('+JSON.stringify('<style>'+CSS+'</style>')+');'}));
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1200);
  const 재기 = () => p.evaluate(()=>{
    // 이 상자에서는 공정 칸이 display:none 이라 자리가 0 으로 읽힌다.
    // 재기 위해서만 억지로 펴 준다(앱은 안 건드린다).
    let el=document.getElementById('process-timeline-container');
    while(el && el!==document.body){
      if(getComputedStyle(el).display==='none'){ el.classList.remove('hidden');
        el.style.setProperty('display','block','important'); }
      el=el.parentElement;
    }
    const c=document.getElementById('process-timeline-container');
    const 감 = document.getElementById('tl-infinite-track') || (c && c.parentElement);
    const cr=c?c.getBoundingClientRect():null, tr=감?감.getBoundingClientRect():null;
    return {글:((c&&c.textContent)||'').replace(/\s+/g,' ').trim().slice(0,40),
            왼:cr?Math.round(cr.left):null, 오른:cr?Math.round(window.innerWidth-cr.right):null,
            상자가로:cr?Math.round(cr.width):null, 감가로:tr?Math.round(tr.width):null,
            화면가로:window.innerWidth, 문서가로:document.documentElement.scrollWidth,
            안내표:c?c.dataset.자료안내:null};
  });
  await p.evaluate(()=>{ const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
    document.documentElement.removeAttribute('data-amthome');
    if(typeof switchPage==='function') switchPage('process'); });
  const 회색 = await 재기();
  console.log('   「불러오는 중」: '+JSON.stringify(회색));
  판('아직 안 왔을 때 「불러오는 중」 이 뜬다', /불러오는 중/.test(회색.글), 회색.글);
  // 예전 시험틀은 제가 실수로 덮어써 잃었습니다. 못 박힌 숫자를 지어내지 않고,
  // 뜻이 있는 것만 잽니다 — 좌우가 같고, 이 집 최소 여백(16px)을 지키는가.
  판('좌우 여백이 같고 16px 이상', 회색.왼===회색.오른 && 회색.왼>=16, '왼 '+회색.왼+' · 오른 '+회색.오른);
  판('상자가 화면 밖으로 안 나간다', 회색.감가로<=회색.화면가로 && 회색.상자가로>0,
     '상자 '+회색.상자가로+' · 감 '+회색.감가로+' ≤ 화면 '+회색.화면가로);
  판('가로 스크롤이 없다', 회색.문서가로<=폭, 회색.문서가로+'px');

  await p.evaluate(()=>{ ['원장','발주','차례'].forEach(k=>window._자료왔다(k)); window._자료탈났다('도면','일부러 막음'); });
  const 빨강 = await 재기();
  console.log('   「다 못 받았습니다」: '+JSON.stringify(빨강));
  판('하나 못 받으면 빨강으로 바뀐다', /다 못 받았습니다/.test(빨강.글), 빨강.글);
  판('빨강도 좌우 여백이 같고 16px 이상', 빨강.왼===빨강.오른 && 빨강.왼>=16, '왼 '+빨강.왼+' · 오른 '+빨강.오른);
  판('빨강도 가로 스크롤이 없다', 빨강.문서가로<=폭, 빨강.문서가로+'px');
  판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
  await ctx.close();
}
console.log(실패===0?'box1   OK':'box1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
