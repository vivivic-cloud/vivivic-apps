/* 「거래내역」 박스를 **한 번만** 세우는지 잰다.
   못 — 사장님이 지우시고 다시 여셨을 때 **다시 생기면 안 된다.**
   ⚠ 이 상자에서는 화베에 못 쓴다. setDoc/getDoc 을 허수아비로 꽂아
     **무엇을 읽고 무엇을 쓰려 했는지**만 본다. */
import { 서버, 브라우저열기, devices, 주소, 에이주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();
const b=await 브라우저열기();
const { 참: 못, 끝 } = 자판();

// 자국있나: 「한 번 세웠다」 는 자국이 화베에 남아 있나 · 박스있나: 박스판에 그 박스가 있나
async function 판(자국있나, 박스있나){
  const ctx=await b.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true});
  const p=await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(String(e.message)));
  await p.addInitScript(({자국있나,박스있나})=>{
    window.__쓴것=[]; window.__읽은것=[]; window.__스냅=null;
    window.__자국있나=자국있나; window.__박스있나=박스있나;
    window.db={};
    window.fbFirestore={
      collection:(...a)=>({길:a.slice(1)}),
      doc:(...a)=>({길:a.slice(1).join('/')}),
      getDoc: async (d)=>{ window.__읽은것.push(d.길);
        const 있 = 자국있나 && /johon_meta/.test(d.길);
        return { exists:()=>있, data:()=>(있?{거래내역:1791790000000}:undefined) }; },
      setDoc: async (d,v,o)=>{ window.__쓴것.push({길:d.길, 값:v, 덧:o}); },
      onSnapshot:(col,cb)=>{ window.__스냅=cb; },
      getDocs: async ()=>({forEach:()=>{}}),
      serverTimestamp:()=>0 };
    window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
      s.textContent='#auth-login-overlay{display:none!important}';document.head.appendChild(s);});
  }, {자국있나,박스있나});
  await p.route('**cdn.tailwindcss.com**',r=>r.abort());
  await p.goto(주소,{waitUntil:'load'});
  await p.waitForTimeout(1600);
  await p.evaluate(()=>{ johonBoxSync();
    const 들 = [{id:'x',data:()=>({name:'스캔',icon:'scan-text',tone:'white',link:'',at:1})}];
    if (window.__박스있나) 들.push({id:'거래내역',
      data:()=>({name:'거래내역',icon:'receipt',tone:'white',link:'',at:3})});
    window.__스냅({docs:들}); window.__스냅({docs:들});   // 두 번 울린다
  });
  await p.waitForTimeout(900);
  const r = await p.evaluate(()=>({ 쓴것:window.__쓴것, 읽은것:window.__읽은것,
    박스판네모:[...document.querySelectorAll('#jhh-mine [data-go]')]
      .map(e=>e.childNodes[0].textContent.trim()) }));
  await ctx.close();
  return {...r, 오류};
}

// ㉠ 처음 — 자국도 없고 박스도 없다
{ const r=await 판(false,false);
  const 박스쓰기=r.쓴것.filter(x=>/johon_boxes/.test(x.길));
  const 자국쓰기=r.쓴것.filter(x=>/johon_meta/.test(x.길));
  못('처음 — 박스를 한 번 세운다', 박스쓰기.length===1, 박스쓰기.length);
  못('처음 — 문서 이름을 못박았다',
     (박스쓰기[0]||{}).길==='artifacts/vivivic-4b7ef/public/data/johon_boxes/거래내역', (박스쓰기[0]||{}).길);
  못('처음 — 이름·아이콘이 맞다',
     !!(박스쓰기[0]||{}).값 && 박스쓰기[0].값.name==='거래내역' && 박스쓰기[0].값.icon==='receipt',
     (박스쓰기[0]||{}).값);
  못('처음 — 자국을 남긴다', 자국쓰기.length===1, 자국쓰기.map(x=>x.길));
  못('처음 — 두 번 울려도 쓴 것은 각각 한 번', r.쓴것.length===2, r.쓴것.length);
  못('처음 — 페이지 오류 0', r.오류.length===0, r.오류); }

// ㉡ ⚠ 못 — 사장님이 지우셨다. 자국은 남아 있다. **다시 생기면 안 된다.**
{ const r=await 판(true,false);
  못('지운 뒤 — 박스를 다시 안 세운다', r.쓴것.length===0, r.쓴것.map(x=>x.길));
  못('지운 뒤 — 자국은 읽어 본다', r.읽은것.some(x=>/johon_meta/.test(x)), r.읽은것);
  못('지운 뒤 — 박스판에 거래내역 네모가 없다', !r.박스판네모.includes('거래내역'), r.박스판네모);
  못('지운 뒤 — 페이지 오류 0', r.오류.length===0, r.오류); }

// ㉢ 이미 박스가 있다 — 또 쓰지 않는다
{ const r=await 판(false,true);
  const 박스쓰기=r.쓴것.filter(x=>/johon_boxes/.test(x.길));
  못('이미 있으면 — 박스를 안 쓴다', 박스쓰기.length===0, 박스쓰기.length);
  못('이미 있으면 — 박스판에 네모 하나뿐', r.박스판네모.filter(n=>n==='거래내역').length===1, r.박스판네모);
  못('이미 있으면 — 페이지 오류 0', r.오류.length===0, r.오류); }

// ㉣ 자국이 박스판에 네모로 뜨지 않는다
{ const r=await 판(true,true);
  못('자국은 박스판에 안 뜬다',
     r.박스판네모.every(n=>n==='스캔'||n==='거래내역') && !r.박스판네모.includes('박스세움'),
     r.박스판네모);
  못('㉣ 페이지 오류 0', r.오류.length===0, r.오류); }

await b.close();
끝();
