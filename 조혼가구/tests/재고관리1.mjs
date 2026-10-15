/* 사장님 10-15: 「새박스 - 재고관리 박스를 만들어 , 각 업체별 제품에 해당하는
   부속들의 재고를 기재할 있는 페이지를 만들어 주세요. 제품명 별 분류해 주세요」

   막는 것
     · 업체를 고르면 그 업체 것만 · **제품명(ing단품명) 별로 묶여** 뜬다
     · 수량을 적으면 **`jh_stock` 에만** 쓴다 — `product_master` 에 한 글자도 안 쓴다
     · **앞 값을 안 지운다** — 두 번 고치면 `이력` 이 둘이 된다
     · 쓰고 **다시 읽어** 본 뒤에 담긴 꼴로 바꾼다. 못 쓰면 붉은 한 줄(거짓 초록 없음)
     · 바탕을 못 읽어도 **안 터지고** 한 줄
     · 손잡이: `?viggle=1&box=stock` 에서 **0.9초 누르면** `.vg-sheet` 가 뜬다
     · 375px 넘침 0 · 44px 밑 0개 · 페이지 오류 0
   ⚠ 화베는 이 상자에서 못 닿는다. 읽고 쓰는 자리를 허수아비로 꽂아
     **무엇을 읽고 무엇을 쓰려 했는지**와 화면만 잰다. 진짜로 들어가는지는 폰에서만 확인된다. */
import { 서버, 브라우저열기, devices, 테일윈드, 그림칸, 자판, 자리 } from './도구/터.mjs';
await 서버();
const 그림 = 그림칸();
const { 못, 참, 끝 } = 자판();
const 주소재고 = 자리 + '/' + encodeURIComponent('조혼가구') + '/' + encodeURIComponent('재고관리.html');

/* 화베에서 실제로 읽어 본 꼴 그대로 — `product_master` 는 속칸이 `fields` 안에 한 겹 더 있다. */
const 줄 = (id, 업체, 제품, 제품코드, 부속, 부속코드, 공급처, 지움) => ({
  id, data: { deleted: !!지움, fields: { ing발주처:업체, ing단품명:제품, ing단품코드:제품코드,
    부속명:부속, 부속코드:부속코드, 공급처:공급처 } } });
const 바탕 = [
  줄('p1','조혼가구','카비 2단 거실 서랍장_C크림버치','kav_drc','고정선반','rk','AMT'),
  줄('p2','조혼가구','카비 2단 거실 서랍장_C크림버치','kav_drc','도어','dr','AMT'),
  줄('p3','조혼가구','블랑 1000 주방수납장','bl_1000','가와','gw','AMT'),
  줄('p4','유한가구','유한 1200 책장','yh_1200','상판','sp','외부발주'),
  줄('p9','조혼가구','지워진 제품','zz','지워진 부속','zz','AMT', true),
];

const b = await 브라우저열기();
async function 판({바탕있나=true, 쓰기됨=true, 너비=375}={}){
  const ctx = await b.newContext({ ...devices['iPhone 12'],
      viewport:{width:너비, height:900}, isMobile:너비<500, hasTouch:true });
  const p = await ctx.newPage(); const 오류 = [];
  p.on('pageerror', e => 오류.push(String(e.message)));
  await p.addInitScript(({바탕, 바탕있나, 쓰기됨})=>{
    window.__쓴것 = []; window.__읽은칸 = []; window.__재고 = {};
    window.db = {};
    const 눈 = (있, 값) => ({ exists:()=>!!있, data:()=>값 });
    window.fbFirestore = {
      collection:(...a)=>({ 칸:a[a.length-1] }),
      doc:(...a)=>({ 길:a.slice(1).join('/'), 칸:a[a.length-2], id:a[a.length-1] }),
      getDocs: async (c)=>{ window.__읽은칸.push(c.칸);
        if (c.칸 === 'product_master') {
          if (!바탕있나) throw new Error('읽기 막힘');
          return { forEach:(f)=>바탕.forEach(r=>f({ id:r.id, data:()=>r.data })) };
        }
        if (c.칸 === 'jh_stock')
          return { forEach:(f)=>Object.entries(window.__재고).forEach(([k,v])=>f({ id:k, data:()=>v })) };
        return { forEach:()=>{} }; },
      getDoc: async (d)=>{ window.__읽은칸.push(d.칸);
        return 눈(!!window.__재고[d.id], window.__재고[d.id]); },
      setDoc: async (d, v)=>{ if (!쓰기됨) throw new Error('쓰기 막힘');
        window.__쓴것.push({ 길:d.길, 칸:d.칸, id:d.id, 값:JSON.parse(JSON.stringify(v)) });
        window.__재고[d.id] = JSON.parse(JSON.stringify(v)); },
      serverTimestamp: ()=>'[때]' };
    // 화베 SDK 는 이 상자에서 못 받아 온다. 시작하는 자리만 손수 민다.
    window.addEventListener('load', ()=>{ setTimeout(()=>{
      window._myAccount = { uid: 'uid시험' };
      if (typeof window.시작 === 'function') window.시작(); }, 60); });
  }, {바탕, 바탕있나, 쓰기됨});
  await p.route('**gstatic.com**', r => r.abort());
  await p.goto(주소재고, { waitUntil:'load' });
  await p.waitForTimeout(900);
  return { p, ctx, 오류 };
}
const 본다 = (p) => p.evaluate(()=>({
  업체들: [...document.querySelectorAll('[data-업체]')].map(e=>e.textContent.trim()),
  켜진업체: (document.querySelector('.업체.켜짐')||{}).textContent,
  제품들: [...document.querySelectorAll('[data-제품]')].map(e=>e.dataset.제품),
  부속수: document.querySelectorAll('.부속').length,
  딱지: (document.getElementById('딱지')||{}).textContent.trim(),
  알림: (()=>{ const e=document.getElementById('알림');
    return e && getComputedStyle(e).display!=='none' ? e.textContent.trim() : ''; })(),
  빨강: !!(document.getElementById('알림')||{}).classList?.contains('빨강'),
  넘침: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
  작은자리: (()=>{ const 밑=[];
    document.querySelectorAll('button, input, a').forEach(el=>{
      const r=el.getBoundingClientRect(); if (r.width===0 && r.height===0) return;
      if (r.height<44) 밑.push((el.textContent||el.tagName).trim().slice(0,12)); }); return 밑; })() }));

// ㉠ 업체·제품·부속이 제대로 서는가
{ const { p, ctx, 오류 } = await 판({});
  const r = await 본다(p);
  못('㉠ 업체 단추가 선다 (많은 차례)', r.업체들, ['조혼가구','유한가구']);
  못('㉠ 첫 업체는 조혼가구', 글다듬(r.켜진업체), '조혼가구');
  못('㉠ **제품명 별로** 묶인다', r.제품들.sort(), ['블랑 1000 주방수납장','카비 2단 거실 서랍장_C크림버치']);
  못('㉠ 그 업체 부속만 (유한 것·지운 것 안 섞임)', r.부속수, 3);
  못('㉠ 딱지에 제품 수·부속 수', r.딱지, '2개 제품 · 부속 3');
  못('㉠ 375 가로 넘침 0', r.넘침, [375,375]);
  못('㉠ 44px 밑 0개', r.작은자리, []);
  // 제품을 펴고 수량을 적는다 — 진짜 손가락으로 편다
  const 점 = await p.evaluate(()=>{ const el=[...document.querySelectorAll('[data-폄]')]
      .find(e=>e.dataset.폄.startsWith('카비'));
    el.scrollIntoView({block:'center'}); const q=el.getBoundingClientRect();
    return {x:q.x+q.width/2, y:q.y+q.height/2}; });
  await p.touchscreen.tap(점.x, 점.y); await p.waitForTimeout(350);
  참('㉠ 제품을 누르면 펴진다',
     await p.evaluate(()=>{ const 몸=document.querySelector('.제품.폄 .제품몸');
       return !!몸 && getComputedStyle(몸).display!=='none'; }), true);
  await p.evaluate(()=>{ const i=document.querySelector('.제품.폄 .수량');
    i.value='12'; i.dispatchEvent(new Event('change',{bubbles:true})); });
  await p.waitForTimeout(700);
  const 쓴것 = await p.evaluate(()=>window.__쓴것);
  못('⚠ ㉠ 쓴 곳은 jh_stock 한 군데', [...new Set(쓴것.map(x=>x.칸))], ['jh_stock']);
  못('⚠ ㉠ product_master 에 쓴 것 0', 쓴것.filter(x=>x.칸==='product_master').length, 0);
  못('㉠ 적은 수량이 들어간다', (쓴것[0]||{}).값 && 쓴것[0].값.수량, 12);
  못('㉠ 업체·제품·부속도 같이 적힌다',
     (쓴것[0]||{}).값 && [쓴것[0].값.업체, 쓴것[0].값.부속코드],
     ['조혼가구','rk']);
  못('㉠ 이력이 한 줄 생긴다', (쓴것[0]||{}).값 && 쓴것[0].값.이력.length, 1);
  참('㉠ 적힌 칸이 담긴 꼴로 바뀐다',
     await p.evaluate(()=>!!document.querySelector('.수량.담김')), true);
  // 두 번 고쳐도 앞 값을 안 지운다
  await p.evaluate(()=>{ const i=document.querySelector('.제품.폄 .수량');
    i.value='30'; i.dispatchEvent(new Event('change',{bubbles:true})); });
  await p.waitForTimeout(700);
  const 쓴것2 = await p.evaluate(()=>window.__쓴것);
  못('⚠ ㉠ 두 번 고치면 이력이 둘 — 앞 값을 안 지운다',
     (쓴것2[1]||{}).값 && 쓴것2[1].값.이력.map(x=>x.수량), [12,30]);
  못('㉠ 지금 수량은 뒤엣것', (쓴것2[1]||{}).값 && 쓴것2[1].값.수량, 30);
  // 업체를 바꾸면 목록이 바뀐다
  await p.evaluate(()=>{ [...document.querySelectorAll('[data-업체]')]
    .find(e=>e.dataset.업체==='유한가구').click(); });
  await p.waitForTimeout(400);
  const r2 = await 본다(p);
  못('㉠ 업체를 바꾸면 그 업체 것만', [r2.제품들, r2.부속수], [['유한 1200 책장'], 1]);
  못('㉠ 페이지 오류 0', 오류.length, 0);
  await p.evaluate(()=>{ [...document.querySelectorAll('[data-업체]')]
    .find(e=>e.dataset.업체==='조혼가구').click(); });
  await p.waitForTimeout(400);
  // 그림은 **알맹이가 보이게** 찍는다 — 접힌 채로 찍으면 수량 칸이 안 보인다.
  await p.evaluate(()=>{ document.querySelectorAll('[data-폄]').forEach(e=>e.click()); });
  await p.waitForTimeout(350);
  못('㉠ 펴면 수량 칸이 부속마다 하나씩',
     await p.evaluate(()=>document.querySelectorAll('.제품.폄 .수량').length), 3);
  await p.screenshot({ path: 그림+'재고-1목록.png', fullPage:true });
  await ctx.close(); }

// ㉡ 바탕을 못 읽을 때 — 안 터지고 한 줄
{ const { p, ctx, 오류 } = await 판({바탕있나:false});
  const r = await 본다(p);
  못('㉡ 못 읽으면 한 줄로 알린다', r.알림, '부속 자료를 못 읽었습니다');
  참('㉡ 붉게 알린다', r.빨강, r.빨강);
  못('㉡ 빈 표를 내지 않는다', r.제품들.length, 0);
  못('㉡ 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉢ 쓰기가 막혔을 때 — 거짓 초록이 없어야 한다
{ const { p, ctx, 오류 } = await 판({쓰기됨:false});
  await p.evaluate(()=>{ document.querySelector('[data-폄]').click(); });
  await p.waitForTimeout(300);
  await p.evaluate(()=>{ const i=document.querySelector('.제품.폄 .수량');
    i.value='7'; i.dispatchEvent(new Event('change',{bubbles:true})); });
  await p.waitForTimeout(700);
  const r = await 본다(p);
  참('⚠ ㉢ 못 적으면 붉게 알린다', r.빨강 && /못 적었습니다/.test(r.알림), r.알림);
  못('⚠ ㉢ 거짓 초록이 없다 (담긴 꼴로 안 바뀐다)',
     await p.evaluate(()=>document.querySelectorAll('.수량.담김').length), 0);
  못('㉢ 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉣ 바이글 손잡이 — 0.9초 누르면 뜬다
{ const ctx = await b.newContext({ ...devices['iPhone 12'],
      viewport:{width:375, height:900}, isMobile:true, hasTouch:true });
  const p = await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(String(e.message)));
  await p.addInitScript(({바탕})=>{
    window.db={}; window.__재고={};
    window.fbFirestore={ collection:(...a)=>({칸:a[a.length-1]}),
      doc:(...a)=>({길:a.slice(1).join('/'), 칸:a[a.length-2], id:a[a.length-1]}),
      getDocs: async (c)=> c.칸==='product_master'
        ? { forEach:(f)=>바탕.forEach(r=>f({id:r.id, data:()=>r.data})) } : { forEach:()=>{} },
      getDoc: async ()=>({exists:()=>false}), setDoc: async ()=>{}, serverTimestamp:()=>0 };
    window.addEventListener('load', ()=>{ setTimeout(()=>{ window._myAccount={uid:'uid시험'};
      if (typeof window.시작==='function') window.시작(); }, 60); });
  }, {바탕});
  await p.route('**gstatic.com**', r=>r.abort());
  await p.goto(주소재고 + '?viggle=1&box=stock', { waitUntil:'load' });
  await p.waitForTimeout(1200);
  참('㉣ 손잡이가 붙는다', await p.evaluate(()=>!!window.__viggle || !!document.querySelector('[class*="vg-"]')
     || typeof window.VG === 'object'), true);
  // 0.9초 누른다 — 진짜로 누르고 뗀다
  const 점 = await p.evaluate(()=>{ const el=document.querySelector('.제품이름') || document.body;
    const r=el.getBoundingClientRect(); return {x:Math.max(8,r.x+10), y:Math.max(8,r.y+8)}; });
  await p.mouse.move(점.x, 점.y);
  await p.mouse.down();
  await p.waitForTimeout(900);
  await p.mouse.up();
  await p.waitForTimeout(500);
  참('⚠ ㉣ 0.9초 누르면 .vg-sheet 가 뜬다',
     await p.evaluate(()=>!!document.querySelector('.vg-sheet')),
     await p.evaluate(()=>!!document.querySelector('.vg-sheet')));
  못('㉣ 손잡이가 집은 박스', await p.evaluate(()=>{
     try { const g = sessionStorage.getItem('viggle') || localStorage.getItem('viggle');
       if (g) return (JSON.parse(g)||{}).box;
       for (const 통 of [sessionStorage, localStorage])
         for (let i=0;i<통.length;i++){ const v=통.getItem(통.key(i));
           try { const o=JSON.parse(v); if (o && o.box) return o.box; } catch(e){} }
     } catch(e){} return ''; }), 'stock');
  await p.screenshot({ path: 그림+'재고-2손잡이.png' });
  못('㉣ 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉤ 넓은 판
{ const { p, ctx, 오류 } = await 판({너비:1280});
  const r = await 본다(p);
  못('㉤ 1280 가로 넘침 0', r.넘침, [1280,1280]);
  못('㉤ 1280 44px 밑 0개', r.작은자리, []);
  못('㉤ 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

await b.close();
끝();

function 글다듬(s){ return String(s==null?'':s).trim(); }
