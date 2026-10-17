/* 사장님 10-17: 「거래명세표가 안보입니다」 — 거래내역 줄(유한-20261009-01-A)을 누르셨다.

   산 화베를 읽어 보니 (10-17)
     `출고명세표` 0장 — 막힌 것이 아니라 **진짜로 비어 있다.**
     `입고확인` 1장 — 업체 유한가구 · 납기일 · 줄수 1 · 총수량 100 · 확인시각글 있음.
                      그런데 **`명세표` 칸이 없다**(v1.54.0 전에 찍힌 줄).
   → 그릴 종이가 창고에 없다. 그래서 「아직 에이엠티에서 안 보냈습니다」 로 빠진다.

   막는 것
     · 종이가 없어도 **사장님이 아시게** 한다 — 그 한 줄이 **눈에 띄는 크기**로 뜬다
     · 손에 있는 것은 **보여 드린다** — 업체·납기·줄수·총수량·확인시각 머리글
     · 흰 종이만 남지 않는다 · 창고에 쓴 칸 **0개**
     · 375·1280 넘침 0 · 페이지 오류 0 */
import { 서버, 브라우저열기, devices, 주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();
const TW = await 테일윈드();
const 그림 = 그림칸();
const { 못, 참, 끝 } = 자판();
const 큐알 = '유한-20261009-01-A';
// 산 화베에서 그대로 읽어 온 줄 (10-17). `명세표` 칸은 **없다.**
const 입고줄 = { 큐알, 업체:'유한가구', 발주번호:'유한-20261009-01',
  발주문서:'34HCvlc7AjniQ2c7zx3L', 파레트:'A', 납기일:'2026-10-22',
  줄수:1, 총수량:100, 확인시각글:'2026-10-12 15:40', 판:'v1.54.0',
  글귀:'입고된 수량을 정확히 확인했나요? 확인후 착오된 수량의 책임은 유한가구에 기록됩니다.' };

const b = await 브라우저열기();
async function 판(너비){
  const ctx = await b.newContext({ ...devices['iPhone 12'],
      viewport:{width:너비, height:900}, isMobile:너비<500, hasTouch:true });
  const p = await ctx.newPage(); const 오류 = [];
  p.on('pageerror', e => 오류.push(String(e.message)));
  await p.addInitScript(({큐알, 입고줄})=>{
    window.__쓴것 = []; window.db = {};
    const 눈 = (있, 값) => ({ exists:()=>!!있, data:()=>값 });
    window.fbFirestore = {
      collection:(...a)=>({칸:a[a.length-1]}),
      doc:(...a)=>({길:a.slice(1).join('/'), 칸:a[a.length-2], id:a[a.length-1]}),
      // ⚠ 산 화베 그대로 — 출고명세표는 **비어 있다**, 입고확인에는 줄 하나.
      getDoc: async (d)=> d.칸==='입고확인' && d.id===큐알 ? 눈(true, 입고줄) : 눈(false, undefined),
      getDocs: async (c)=> c.칸==='입고확인'
        ? { forEach:(f)=>f({ id:큐알, data:()=>입고줄 }) } : { forEach:()=>{} },
      setDoc: async (d,v)=>{ window.__쓴것.push({칸:d.칸, 값:v}); },
      runTransaction: async ()=>{ throw new Error('안 쓴다'); },
      onSnapshot:()=>{}, serverTimestamp:()=>'[때]' };
    window.addEventListener('DOMContentLoaded',()=>{ const s=document.createElement('style');
      s.textContent='#auth-login-overlay{display:none!important}'; document.head.appendChild(s); });
  }, {큐알, 입고줄});
  await p.route('**cdn.tailwindcss.com**', r=>r.abort());
  await p.goto(주소, { waitUntil:'load' });
  await p.addStyleTag({ path: TW });
  await p.waitForTimeout(1700);
  return { p, ctx, 오류 };
}

for (const 너비 of [375, 1280]) {
  const 표 = String(너비);
  const { p, ctx, 오류 } = await 판(너비);
  // 거래내역을 열고 그 줄을 **진짜 손가락으로** 누른다 — 사장님이 하신 그대로
  await p.evaluate(()=>{ switchSupplier('유한가구'); johonDealOpen(); });
  await p.waitForTimeout(1200);
  못(표+' — 거래내역에 그 줄이 있다',
     await p.evaluate(()=>[...document.querySelectorAll('#jhd-list .jhd-row')]
       .map(e=>e.querySelector('.jhd-q').textContent.trim())), [큐알]);
  const 점 = await p.evaluate(()=>{ const el=document.querySelector('#jhd-list .jhd-row');
    el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect();
    return {x:r.x+r.width/2, y:r.y+r.height/2}; });
  await p.touchscreen.tap(점.x, 점.y);
  await p.waitForTimeout(1500);

  const 본 = await p.evaluate(()=>{
    const 재 = (sel)=>{ const el=document.querySelector(sel); if (!el) return null;
      const r=el.getBoundingClientRect(); const c=getComputedStyle(el);
      return { 글: (el.textContent||'').trim(), 글자크기: Math.round(parseFloat(c.fontSize)),
               보이나: c.display!=='none' && r.width>0 && r.height>0,
               위: Math.round(r.top), 높이: Math.round(r.height) }; };
    return {
      화면: document.documentElement.getAttribute('data-johonbill'),
      큐알칸: 재('#jhb-q'), 딱지: 재('#jhb-tag'), 머리: 재('#jhb-info'),
      표있나: !!document.querySelector('#jhb-paper .명세-표'),
      // 사장님 눈에 들어오는 글 — 화면에 보이는 그대로
      보이는글: (document.getElementById('johon-bill').innerText||'').replace(/\s+/g,' ').trim(),
      넘침: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
      쓴것: window.__쓴것.length };
  });
  console.log('  ■ '+표+' 화면에 보이는 글: ' + JSON.stringify(본.보이는글));
  console.log('  ■ '+표+' 딱지: ' + JSON.stringify(본.딱지));

  못(표+' — 명세표 화면은 뜬다', 본.화면, '1');
  못(표+' — 표는 없다(창고가 비었다)', 본.표있나, false);
  참('⚠ '+표+' — 종이가 없다는 것을 **알린다**',
     /안 보냈습니다/.test(본.보이는글), 본.보이는글.slice(0, 60));
  참('⚠ '+표+' — 그 한 줄이 **눈에 띄는 크기**(15px 이상)',
     !!본.딱지 && 본.딱지.글자크기 >= 15, 본.딱지 && 본.딱지.글자크기);
  참('⚠ '+표+' — 손에 있는 것은 보여 드린다 (업체·납기·줄수·총수량·확인시각)',
     !!본.머리 && 본.머리.보이나 && /유한가구/.test(본.머리.글) &&
     /2026-10-22/.test(본.머리.글) && /100/.test(본.머리.글) &&
     /2026-10-12 15:40/.test(본.머리.글), 본.머리 && 본.머리.글);
  못('⚠ '+표+' — 창고에 쓴 칸 0개', 본.쓴것, 0);
  못(표+' — 가로 넘침 0', 본.넘침, [너비, 너비]);
  못(표+' — 페이지 오류 0', 오류.length, 0);
  await p.screenshot({ path: 그림+'명세없음-'+표+'.png' });
  await ctx.close();
}
await b.close();
끝();
