/* 사장님 10-15: 「이 박스의 내용을 발주하기 페이지의 하단에 발주완료리스트 로
   보이게 해주세요.」

   막는 것
     · 「발주하기」 쪽 **맨 아래**에 그 덩어리가 선다
     · 「작업중」 으로 가면 **제자리로 돌아간다**(거기 것을 뺏지 않는다)
     · 그 덩어리가 화면에 **하나뿐**이다 — 베껴 두 벌이 되면 펼치기가 엉뚱한 것을 집는다
     · 세는 숫자가 두 쪽에서 같다
     · 박스 안(발주하기 박스 셋·timeline)에서는 전처럼 **안 보인다**
     · 375px 가로 넘침 0 · 페이지 오류 0
   ⚠ 화베는 이 상자에서 못 닿는다. 발주 목록을 허수아비로 꽂아 **차례와 자리**만 잰다. */
import { 서버, 브라우저열기, devices, 주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();
const TW = await 테일윈드();
const 그림 = 그림칸();
const { 못, 참, 끝 } = 자판();
const b = await 브라우저열기();

// 발주 다섯 건 — 사장님 화면에 「작업중 5건」 으로 떠 있던 그 수에 맞춘다.
const 발주들 = [1,2,3,4,5].map(i => ({
  idNum: 9900+i, docId: 'd99'+i, orderCode: '조혼-20261009-0'+i,
  displayName: '시험상품 '+i, code: '시험상품 '+i, supplier: '조혼가구',
  amtTimeline: true, deliveryDate: '2026-10-2'+i, orderQty: 10,
  criteria: [], partInfoMap: {}, partStarted: {}, partCompletions: {},
  procOverrides: {}, partMoveLog: {} }));

async function 판(너비 = 375){
  const ctx = await b.newContext({ ...devices['iPhone 12'],
      viewport:{width:너비, height:900}, isMobile:너비<500, hasTouch:true });
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
  await p.evaluate(발주들 => { confirmedOrders.length = 0; 발주들.forEach(o=>confirmedOrders.push(o));
    switchSupplier('조혼가구'); switchPageTab('발주하기'); }, 발주들);
  await p.waitForTimeout(600);
  return { p, ctx, 오류 };
}
const 본다 = (p) => p.evaluate(()=>{
  const 것들 = [...document.querySelectorAll('#registered-orders-section')];
  const el = 것들[0];
  const 쪽 = el ? (el.closest('#page-발주하기') ? '발주하기'
                  : (el.closest('#page-작업중') ? '작업중' : '딴자리')) : '없음';
  const 발 = document.getElementById('page-발주하기');
  return {
    덩이수: 것들.length,
    어느쪽: 쪽,
    보이나: !!el && getComputedStyle(el).display !== 'none',
    맨아래냐: !!(el && 발 && 발.lastElementChild === el),
    셈: (document.getElementById('registered-orders-count-badge')||{}).textContent,
    줄수: document.querySelectorAll('#registered-orders-list-container .job-item').length,
    아이디겹침: (()=>{ const n = document.querySelectorAll('[id^="registered-item-"]').length;
      const s = new Set([...document.querySelectorAll('[id^="registered-item-"]')].map(e=>e.id));
      return n - s.size; })(),
    넘침: [document.documentElement.scrollWidth, document.documentElement.clientWidth] };
});

// ㉠ 발주하기 쪽
{ const { p, ctx, 오류 } = await 판();
  const r = await 본다(p);
  못('㉠ 덩어리는 화면에 하나뿐', r.덩이수, 1);
  못('㉠ 발주하기 쪽에 와 있다', r.어느쪽, '발주하기');
  참('㉠ 보인다', r.보이나, r.보이나);
  참('㉠ 쪽 **맨 아래**에 선다', r.맨아래냐, r.맨아래냐);
  못('㉠ 다섯 건을 센다', r.셈, '5건');
  못('㉠ 줄도 다섯', r.줄수, 5);
  못('⚠ ㉠ 같은 아이디가 두 벌이 아니다', r.아이디겹침, 0);
  못('㉠ 375 가로 넘침 0', r.넘침, [375,375]);
  await p.screenshot({ path: 그림+'발주완료-1발주하기.png', fullPage:true });

  // ㉡ 작업중으로 가면 제자리
  await p.evaluate(()=>switchPageTab('작업중'));
  await p.waitForTimeout(600);
  const r2 = await 본다(p);
  못('㉡ 작업중 제자리로 돌아간다', r2.어느쪽, '작업중');
  참('㉡ 거기서도 보인다', r2.보이나, r2.보이나);
  못('㉡ 세는 숫자가 같다', r2.셈, '5건');
  못('⚠ ㉡ 여전히 하나뿐', r2.덩이수, 1);

  // ㉢ 다시 발주하기
  await p.evaluate(()=>switchPageTab('발주하기'));
  await p.waitForTimeout(600);
  const r3 = await 본다(p);
  못('㉢ 다시 발주하기 쪽으로', r3.어느쪽, '발주하기');
  참('㉢ 다시 맨 아래', r3.맨아래냐, r3.맨아래냐);
  못('㉢ 숫자도 그대로', r3.셈, '5건');

  // ㉣ 박스 안에서는 전처럼 안 보인다
  for (const 박스 of ['order','waiting','danger']) {
    await p.evaluate(k=>johonOpenBox(k), 박스);
    await p.waitForTimeout(350);
    못('㉣ 박스 「'+박스+'」 안에서는 안 보인다',
       await p.evaluate(()=>{ const el=document.getElementById('registered-orders-section');
         return !!el && getComputedStyle(el).display !== 'none'; }), false);
  }
  await p.evaluate(()=>johonGoHome()); await p.waitForTimeout(300);
  못('㉠~㉣ 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉤ 넓은 판
{ const { p, ctx, 오류 } = await 판(1280);
  const r = await 본다(p);
  못('㉤ 1280 — 발주하기 쪽에 하나', [r.덩이수, r.어느쪽], [1, '발주하기']);
  못('㉤ 1280 가로 넘침 0', r.넘침, [1280,1280]);
  못('㉤ 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

await b.close();
끝();
