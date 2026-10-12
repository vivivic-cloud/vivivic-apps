/* 조혼가구가 **제 집에서** 거래명세표를 펴는지 잰다.
   ⚠ 이 상자에서는 화베에 못 쓴다. 읽고·쓰는 자리를 허수아비로 꽂아
     **무엇을 읽고 무엇을 쓰려 했는지**와 화면을 본다. */
import { 서버, 브라우저열기, devices, 주소, 에이주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();
import { createHash } from 'node:crypto';

const TW = await 테일윈드();
const 그림 = 그림칸();
const 큐알='유한-20261009-01-A';
// `출고명세표` 한 장 — 바이글이 전한 꼴 그대로
const 종이 = { 큐알, 발주번호:'유한-20261009-01', 발주문서:'34HCvlc7AjniQ2c7zx3L', 파레트:'A',
  납기일:'2026-10-22', 업체:'유한가구', 줄수:2, 총수량:50, 보낸때:'2026-10-12T09:10:00.000Z', 판:'v1.57.0',
  명세표:[{ 발주:{displayName:'시험상품 스캔', code:'시험상품 스캔',
              orderCode:'유한-20261009-01', deliveryDate:'2026-10-22'},
           계획들:[{ 파:'A', 매:null, 종류:'PB-18T', 색상:'화이트',
                     품목들:[{이름:'도어', 크기:'784*396', 몫:30, 코드:'TA_시험_3'},
                             {이름:'가와', 크기:'600*300', 몫:null, 코드:'TA_시험_4'}] }] }] };
const 규칙 = [{ 이름:'납기 명세서', 꼴:'^[^\\s]+-\\d{8}-\\d+-[A-Z]$', 끔:false, 차례:'10',
  갈곳:'https://vivivic-cloud.github.io/vivivic-apps/에이엠티/에이엠티.html?명세={전체}' }];
const 입고줄 = { 큐알, 업체:'유한가구', 발주번호:'유한-20261009-01', 파레트:'A',
  줄수:2, 총수량:50, 납기일:'2026-10-22', 확인시각글:'2026-10-12 15:40' };

const b=await 브라우저열기({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const { 참: 못, 끝 } = 자판();
let 초록=0, 빨강=0;

/* 종이있나 · 이미확인 · 쓰기됨(거래 쓰기가 되는지) */
async function 판({종이있나=true, 이미확인=false, 쓰기됨=true, 못읽음=false, 너비=375, 높이=812}={}){
  const ctx=await b.newContext({viewport:{width:너비,height:높이},hasTouch:true,isMobile:너비<500});
  const p=await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(String(e.message)));
  await p.addInitScript((설정)=>{
    const {종이, 종이있나, 이미확인, 쓰기됨, 못읽음, 규칙, 큐알, 입고줄} = 설정;
    window.__열림=[]; window.__쓴것=[]; window.__읽은것=[]; window.__입고 = 이미확인 ? 입고줄 : null;
    window.db={};
    const 눈=(있,값)=>({ exists:()=>!!있, data:()=>값 });
    window.fbFirestore={
      collection:(...a)=>({칸:a[a.length-1]}),
      doc:(...a)=>({길:a.slice(1).join('/'), 칸:a[a.length-2], id:a[a.length-1]}),
      getDoc: async (d)=>{ window.__읽은것.push(d.길);
        if (못읽음) throw new Error('읽기 막힘');
        if (d.칸==='출고명세표') return 눈(종이있나, 종이);
        if (d.칸==='입고확인')   return 눈(!!window.__입고, window.__입고);
        return 눈(false, undefined); },
      setDoc: async (d,v,o)=>{ window.__쓴것.push({길:d.길, 값:v}); },
      runTransaction: async (db, fn)=>{
        if (!쓰기됨) throw new Error('쓰기 막힘');
        await fn({ get: async (d)=>{ window.__읽은것.push('T:'+d.길);
                     return 눈(!!window.__입고, window.__입고); },
                   set: (d,v)=>{ window.__쓴것.push({길:d.길, 값:v}); window.__입고 = v; } });
      },
      onSnapshot:()=>{},
      // 규칙표는 **그대로 읽힌다** — 무엇인지 가리는 것은 v1.6.0 그대로다.
      getDocs: async (c)=>{ const 칸 = c && c.칸;
        const 줄 = 칸==='큐알규칙' ? 규칙 : (칸==='입고확인' && window.__입고 ? [window.__입고] : []);
        return { forEach:(f)=>줄.forEach((d,i)=>f({ id:'r'+i, data:()=>d })) }; },
      serverTimestamp:()=>'[때]' };
    let n=0;
    window.BarcodeDetector = class { static async getSupportedFormats(){ return ['qr_code']; }
      constructor(){} async detect(){ n++; return n>=25?[{rawValue:큐알}]:[]; } };
    window.__규칙=규칙;
    window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
      s.textContent='#auth-login-overlay{display:none!important}';document.head.appendChild(s);});
  }, {종이, 종이있나, 이미확인, 쓰기됨, 못읽음, 규칙, 큐알, 입고줄});
  await p.route('**cdn.tailwindcss.com**',r=>r.abort());
  await p.goto(주소,{waitUntil:'load'});
  await p.addStyleTag({path:TW});
  await p.waitForTimeout(1800);
  await p.evaluate(()=>{ window.open=(u)=>{ window.__열림.push(u); return null; };
  });
  return {p,ctx,오류};
}
const 본다=(p)=>p.evaluate(()=>({
  명세화면:document.documentElement.getAttribute('data-johonbill'),
  표떴나:document.documentElement.getAttribute('data-johonbillok'),
  딱지:(document.getElementById('jhb-tag')||{}).textContent.trim(),
  큐알글:(document.getElementById('jhb-q')||{}).textContent.trim(),
  표html:(document.getElementById('jhb-paper')||{}).innerHTML,
  줄:[...document.querySelectorAll('#jhb-paper .명세-표 tr')].length,
  한말:(document.getElementById('jhb-said')||{}).textContent.trim(),
  단추잠김:!!(document.getElementById('jhb-ok')||{}).disabled,
  물음:(document.getElementById('jha-말')||{}).textContent.trim(),
  물음떴나:document.documentElement.getAttribute('data-johonask'),
  넘침:[document.documentElement.scrollWidth, document.documentElement.clientWidth],
  작은자리:(()=>{const 밑=[];
    document.querySelectorAll('#johon-bill button, #johon-ask button, #johon-back button').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width===0&&r.height===0) return;
      if(r.height<44||r.width<44) 밑.push(el.textContent.trim().slice(0,12)); }); return 밑;})() }));
const 찍기=async(p)=>{ await p.evaluate(()=>{ johonScanOpen(); }); await p.waitForTimeout(2400); };
const 탭=async(p,sel)=>{ const 점=await p.evaluate(s=>{ const el=document.querySelector(s);
    const r=el.getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2,
      위에있는거:(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)||{}).id||''}; }, sel);
  await p.touchscreen.tap(점.x,점.y); await p.waitForTimeout(900); return 점; };

// ㉠ 찍어서 → 제 집에서 편다. 에이엠티로 안 간다.
{ const {p,ctx,오류}=await 판({});
  await 찍기(p);
  못('찍으면 「납기 명세서」 단추가 선다',
     (await p.evaluate(()=>[...document.querySelectorAll('#jhs-ways .jhs-way')].map(e=>e.textContent)))
       .join()==='납기 명세서', '납기 명세서');
  const 주소전 = p.url();
  await 탭(p,'#jhs-ways .jhs-way');
  await p.waitForTimeout(900);
  const r=await 본다(p);
  못('⚠ 에이엠티로 안 넘어간다 (창을 안 연다)', (await p.evaluate(()=>window.__열림)).length===0,
     await p.evaluate(()=>window.__열림));
  못('⚠ 주소가 안 바뀐다', p.url()===주소전, p.url()===주소전);
  못('제 집 명세표 화면이 뜬다', r.명세화면==='1', r.명세화면);
  못('그 큐알이 머리에 적힌다', r.큐알글===큐알, r.큐알글);
  못('표가 떴다', r.표떴나==='1' && /명세-표/.test(r.표html), r.표떴나);
  못('표에 「도어」 가 있다', /도어/.test(r.표html), /도어/.test(r.표html));
  못('몫이 null 인 줄은 빈칸이다 (0 아님)', !/>0</.test(r.표html), !/>0</.test(r.표html));
  못('딱지에 업체·납기·줄수', r.딱지==='유한가구 · 납기 2026-10-22 · 2줄', r.딱지);
  못('가로 넘침 0', JSON.stringify(r.넘침)===JSON.stringify([375,375]), r.넘침);
  못('44px 밑 0개', r.작은자리.length===0, r.작은자리);
  await p.screenshot({path:그림+'명세-1표.png'});
  // 입고확인 → 글귀 그대로
  await 탭(p,'#jhb-ok');
  const r2=await 본다(p);
  못('입고확인을 누르면 글귀가 그대로 뜬다',
     r2.물음==='입고된 수량을 정확히 확인했나요? 확인후 착오된 수량의 책임은 유한가구에 기록됩니다.',
     r2.물음);
  못('묻는 창에 「취소」 라는 글자가 없다', !/취소/.test(await p.evaluate(()=>
     (document.getElementById('johon-ask')||{}).innerText||'')), true);
  await p.screenshot({path:그림+'명세-3글귀.png'});
  await 탭(p,'#jha-go');
  await p.waitForTimeout(900);
  const 쓴것=await p.evaluate(()=>window.__쓴것);
  const r3=await 본다(p);
  못('입고확인 — 화베에 한 줄 적는다', 쓴것.length===1, 쓴것.map(x=>x.길));
  못('입고확인 — 적는 자리가 입고확인/{큐알}',
     (쓴것[0]||{}).길==='artifacts/vivivic-4b7ef/public/data/입고확인/'+큐알, (쓴것[0]||{}).길);
  못('입고확인 — 업체는 종이에서 꺼낸다', (쓴것[0]||{}).값 && 쓴것[0].값.업체==='유한가구',
     (쓴것[0]||{}).값 && 쓴것[0].값.업체);
  못('입고확인 — 글귀도 그대로 적힌다',
     (쓴것[0]||{}).값 && /책임은 유한가구에 기록됩니다/.test(쓴것[0].값.글귀), true);
  못('입고확인 — 쓰고 다시 읽어 본다',
     (await p.evaluate(()=>window.__읽은것)).filter(x=>/^artifacts.*입고확인/.test(x)).length>=2,
     (await p.evaluate(()=>window.__읽은것)).filter(x=>/입고확인/.test(x)));
  못('입고확인 — 됐다고 적고 단추를 잠근다', r3.단추잠김 && /입고확인/.test(r3.한말), r3.한말);
  못('입고확인 — 묻는 창은 닫힌다', r3.물음떴나===null, r3.물음떴나);
  못('㉠ 페이지 오류 0', 오류.length===0, 오류);
  await ctx.close(); }

// ㉡ 이미 입고확인된 건 — 덮지 않는다
{ const {p,ctx,오류}=await 판({이미확인:true});
  await p.evaluate(()=>johonBillOpen('유한-20261009-01-A'));
  await p.waitForTimeout(1200);
  const r=await 본다(p);
  못('이미 확인된 건은 단추가 잠겨 있다', r.단추잠김, r.단추잠김);
  못('이미 확인된 건은 그 시각을 적는다', /2026-10-12 15:40/.test(r.한말), r.한말);
  // 억지로 눌러도 덮이지 않는다
  await p.evaluate(()=>johonBillAsk());
  await p.evaluate(()=>johonBillConfirm());
  await p.waitForTimeout(900);
  못('⚠ 두 번 눌러도 안 덮는다 (쓴 것 0회)',
     (await p.evaluate(()=>window.__쓴것)).length===0, await p.evaluate(()=>window.__쓴것));
  못('㉡ 페이지 오류 0', 오류.length===0, 오류);
  await ctx.close(); }

// ㉢ 아직 안 보낸 것
{ const {p,ctx,오류}=await 판({종이있나:false});
  await p.evaluate(()=>johonBillOpen('유한-20261009-01-A'));
  await p.waitForTimeout(1200);
  const r=await 본다(p);
  못('안 보냈으면 한 줄로 알린다', r.딱지==='아직 에이엠티에서 안 보냈습니다', r.딱지);
  못('안 보냈으면 입고확인 단추가 안 선다', r.표떴나===null, r.표떴나);
  못('안 보냈어도 화면은 떠 있다 (빈 화면 아님)', r.명세화면==='1', r.명세화면);
  못('㉢ 페이지 오류 0', 오류.length===0, 오류);
  await p.screenshot({path:그림+'명세-2안보냄.png'});
  await ctx.close(); }

// ㉣ 못 읽음
{ const {p,ctx,오류}=await 판({못읽음:true});
  await p.evaluate(()=>johonBillOpen('유한-20261009-01-A'));
  await p.waitForTimeout(1200);
  const r=await 본다(p);
  못('못 읽어도 안 터지고 한 줄', r.딱지==='명세표를 못 읽었습니다' && r.명세화면==='1', r.딱지);
  못('㉣ 페이지 오류 0', 오류.length===0, 오류);
  await ctx.close(); }

// ㉤ 쓰기가 막혔을 때 — 거짓 초록이 없어야 한다
{ const {p,ctx,오류}=await 판({쓰기됨:false});
  await p.evaluate(()=>johonBillOpen('유한-20261009-01-A'));
  await p.waitForTimeout(1200);
  await p.evaluate(()=>johonBillAsk());
  await p.evaluate(()=>johonBillConfirm());
  await p.waitForTimeout(900);
  const r=await 본다(p);
  못('⚠ 못 적으면 붉게 알린다', r.한말==='기록을 못 남겼습니다', r.한말);
  못('⚠ 거짓 초록이 없다 (단추가 안 잠긴다)', !r.단추잠김, r.단추잠김);
  못('㉤ 페이지 오류 0', 오류.length===0, 오류);
  await ctx.close(); }

// ㉥ 거래내역 목록의 줄도 같은 화면으로
{ const {p,ctx,오류}=await 판({이미확인:true});
  await p.evaluate(()=>{ switchSupplier('유한가구'); johonDealOpen(); });
  await p.waitForTimeout(900);
  await 탭(p,'#jhd-list .jhd-row');
  await p.waitForTimeout(1200);
  const r=await 본다(p);
  못('거래내역 줄도 제 집 화면으로 간다', r.명세화면==='1', r.명세화면);
  못('거래내역 줄도 에이엠티로 안 간다', (await p.evaluate(()=>window.__열림)).length===0,
     await p.evaluate(()=>window.__열림));
  못('㉥ 페이지 오류 0', 오류.length===0, 오류);
  await ctx.close(); }

// ㉦ 좁은 폰 / 넓은 판
for (const [표,높이,너비] of [['좁은 폰 667',667,375],['넓은 판 1280',900,1280]]) {
  const {p,ctx,오류}=await 판({높이,너비});
  await p.evaluate(()=>johonBillOpen('유한-20261009-01-A'));
  await p.waitForTimeout(1200);
  const r=await 본다(p);
  못(표+' — 표가 뜬다', r.표떴나==='1', r.표떴나);
  못(표+' — 가로 넘침 0', JSON.stringify(r.넘침)===JSON.stringify([너비,너비]), r.넘침);
  못(표+' — 44px 밑 0개', r.작은자리.length===0, r.작은자리);
  못(표+' — 페이지 오류 0', 오류.length===0, 오류);
  await ctx.close(); }

// ㉧ 그린 표가 노드에서 그린 것과 한 글자도 안 다른가 (두 집이 같은 종이)
{ const { 그리기 } = await import('file:///home/user/vivivic-apps/shared/거래명세표.js')
    .then(m=>m.default||m).catch(async()=>{
      const { createRequire } = await import('node:module');
      return createRequire(import.meta.url)('/home/user/vivivic-apps/shared/거래명세표.js'); });
  const 노드 = 그리기(종이.명세표, {});
  const {p,ctx}=await 판({});
  await p.evaluate(()=>johonBillOpen('유한-20261009-01-A'));
  await p.waitForTimeout(1200);
  const 화면 = await p.evaluate(()=>(document.getElementById('jhb-paper')||{}).innerHTML);
  const md5=(x)=>createHash('md5').update(x).digest('hex').slice(0,12);
  // 브라우저는 속성 차례를 다시 쓴다 — 글자만 견준다
  // ⚠ 브라우저는 <table> 안에 <tbody> 를 저 혼자 끼워 넣는다. 태그를 세면 그것 때문에
  // 어긋난다 — **보이는 글자만** 견준다. 두 집이 같은 종이인지는 글자가 말해 준다.
  const 글자만=(x)=>x.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  못('노드에서 그린 것과 화면이 같은 내용', md5(글자만(노드.html))===md5(글자만(화면)),
     md5(글자만(노드.html))+' / '+md5(글자만(화면)));
  못('줄수도 같다', 노드.줄수===2, 노드.줄수);
  await ctx.close(); }

await b.close();
끝();
