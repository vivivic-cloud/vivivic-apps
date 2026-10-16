/* 사장님 10-16: 「이작업 왜 안하는지 세줄로 답변해줘」 — 10-15 의 재고관리 지시를 짚으시며.
   쪽(`재고관리.html`)은 지어 두고 **들어가는 길을 안 냈었다.**
   주소를 손으로 치지 않으면 못 들어갔다. 사장님은 폰으로 쓰신다 — **길이 없으면 없는 것이다.**

   막는 것
     · 박스판에 재고관리로 가는 길이 **있다**(전 0 → 후 1)
     · **진짜 손가락으로 눌러** 그 쪽이 열린다 (375·1280)
     · 다른 타일은 그대로 · 44px 밑 0개 · 가로 넘침 0 · 페이지 오류 0 */
import { 서버, 브라우저열기, devices, 주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();
const TW = await 테일윈드();
const 그림 = 그림칸();
const { 못, 참, 끝 } = 자판();
const b = await 브라우저열기();

for (const [표, 너비, 높이] of [['375', 375, 900], ['1280', 1280, 900]]) {
  const ctx = await b.newContext({ ...devices['iPhone 12'],
      viewport:{width:너비, height:높이}, isMobile:너비<500, hasTouch:true });
  const p = await ctx.newPage(); const 오류 = [];
  p.on('pageerror', e => 오류.push(String(e.message)));
  await p.addInitScript(()=>{
    window.db = {};
    window.fbFirestore = { collection:(...a)=>({칸:a[a.length-1]}), doc:(...a)=>({길:a.slice(1).join('/')}),
      getDoc: async()=>({exists:()=>false}), getDocs: async()=>({forEach:()=>{}}),
      onSnapshot:()=>{}, setDoc: async()=>{}, serverTimestamp:()=>0 };
    window.addEventListener('DOMContentLoaded',()=>{ const s=document.createElement('style');
      s.textContent='#auth-login-overlay{display:none!important}'; document.head.appendChild(s); });
  });
  await p.route('**cdn.tailwindcss.com**', r => r.abort());
  await p.goto(주소, { waitUntil:'load' });
  await p.addStyleTag({ path: TW });
  await p.waitForTimeout(1700);
  await p.evaluate(()=>johonGoHome());
  await p.waitForTimeout(400);

  const 본 = await p.evaluate(()=>{
    const 길 = [...document.querySelectorAll('#johon-home a, #johon-home button')]
      .filter(e => /재고관리/.test(e.textContent||'') ||
                   /재고관리\.html/.test(e.getAttribute('onclick')||'') ||
                   /재고관리\.html/.test(e.getAttribute('href')||''));
    return { 길수: 길.length,
      타일: [...document.querySelectorAll('#johon-home .jhh-tile')]
        .map(e=>(e.querySelector('.jhh-nm')||{}).textContent.replace(/\s+/g,' ').trim()),
      작은자리: (()=>{ const 밑=[];
        document.querySelectorAll('#johon-home .jhh-tile').forEach(el=>{
          const r=el.getBoundingClientRect(); if (r.width===0&&r.height===0) return;
          if (r.height<44) 밑.push((el.textContent||'').trim().slice(0,10)); }); return 밑; })(),
      넘침: [document.documentElement.scrollWidth, document.documentElement.clientWidth] };
  });
  못(표+' — 재고관리로 가는 길 1개', 본.길수, 1);
  못(표+' — 다른 타일은 그대로',
     본.타일, ['발주하기','확정대기 List','공정 일정타임라인','재고관리']);
  못(표+' — 44px 밑 0개', 본.작은자리, []);
  못(표+' — 가로 넘침 0', 본.넘침, [너비, 너비]);

  // ⚠ 진짜 손가락으로 누른다. 눌러서 **정말 그 쪽이 열리는지**가 이번 못이다.
  const 점 = await p.evaluate(()=>{ const el = document.getElementById('jhh-t-stock');
    el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect();
    return { x:r.x+r.width/2, y:r.y+r.height/2,
      위에있는거: (()=>{ const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
        return !!t && (t===el || el.contains(t)); })() }; });
  참(표+' — 타일이 가려지지 않았다', 점.위에있는거, 점.위에있는거);
  // ⚠ 그림은 **누르기 전**에 찍는다 — 누른 뒤에 찍으면 타일이 안 보인다.
  await p.screenshot({ path: 그림+'재고길-'+표+'.png' });
  await p.touchscreen.tap(점.x, 점.y);
  await p.waitForLoadState('load').catch(()=>{});
  await p.waitForTimeout(1200);
  참('⚠ '+표+' — 눌렀더니 재고관리 쪽이 열린다',
     /재고관리\.html/.test(decodeURIComponent(p.url())), decodeURIComponent(p.url()).split('/').pop());
  못(표+' — 페이지 오류 0', 오류.length, 0);
  await ctx.close();
}
await b.close();
끝();
