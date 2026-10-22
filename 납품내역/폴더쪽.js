/* 폴더쪽 — 보링·엣지·납품·실제청구명세서 네 쪽이 같이 쓰는 한 벌 (v6.0.0).
   쪽마다 window.폴더 = { 갈, 묶음?, 파일:[{이름, 열쇠?, 없음?}] } 를 먼저 적고 이 파일을 부른다.
   ⚠ 재단.html 은 이 파일을 쓰지 않는다.

   사장님 10-22: 「현재 한페이지에서 필터링으로 보이는 화면을 없애고 각 폴더별 메뉴를 만들어서
   해당 파일만 정리되어 보이는 페이지로」 → 거르는 알약을 두지 않는다. 폴더의 **파일 목록**을 보이고
   파일을 누르면 그 파일에서 나온 줄만 표로 보인다. 파일은 창고 줄의 **「서류」 칸**으로 가른다
   (10-22 에 세어 보니 네 갈래 다 줄마다 서류 칸이 적혀 있다).

   창고는 읽기만 한다. 들여온 것은 collection·getDocs·query·where 넷뿐이고 넷 다 읽는 함수다.
   칸 목록·20초 못 닿음 안내·2,000줄 윗금·#표통 화면 높이 묶기는 납품내역.html v5.6.2 에서 그대로 가져왔다. */
const 창고자리 = ['artifacts','vivivic-4b7ef','public','data','납품내역'];
const 목칸 = {
 '보링':['일','출고일','PO','출고업체명','제품명','품목','규격','수량','단가','합계'],
 '엣지':['일','출고일','PO','출고업체명','제품명','품목','규격','수량','단가','합계','필름'],
 '납품':['일','거래처','거래일자','제품명','품목','규격','수량','단가','금액','비고'],
 '실제청구명세서':['일','서류','PO','출고업체명','제품명','품목','규격','수량','단가','합계',
                   '원장종류','원장색상','원장모델명','원장출고처','원장입고일','원장수량','출고일','필름','비고']
};
const 많으면 = 2000;          /* 폰에서 줄을 그리다 멎지 않게 한 번에 그리는 윗금 */
const 숫자칸 = new Set(['재단수량','원장수량','재단금액','수량','단가','합계','필름','금액']);
const 보는해 = '2026';
const F = window.폴더;
let 줄들 = null, 고른 = -1, 답했나 = false, 숨긴줄 = 0, 목 = [];

const 씻 = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;');
/* 서류 칸에는 PDF 이름이 「.pdf」 없이 적혀 있고, 묶음 속 엑셀은 「… (묶음이름 속)」 으로 적혀 있다(열쇠). */
const 맞나 = (파일, 서류) => 서류 === (파일.열쇠 || 파일.이름) || 서류 === 파일.이름.replace(/\.pdf$/i,'');

function 상태(큰,작,까닭){
  const el=document.getElementById('상태'); el.style.display='block';
  el.innerHTML = `<div class="big">${큰}</div>` + (작?`<div class="sub">${작}</div>`:'') + (까닭?`<div class="why">${씻(까닭)}</div>`:'');
}
window.목록못읽음 = (큰,까닭) => { 답했나=true; 상태(큰,'관리자에게 알려 주십시오.',까닭||''); };

/* 창고 꾸러미를 못 받으면 module 이 안 돌아 「읽는 중」 에서 멈춘다 — 20초 뒤 그렇다고 적는다.
   파일 목록은 인터넷 없이도 보인다(줄 수만 비어 있다). */
setTimeout(() => { if(!답했나) 상태('창고에 닿지 못했습니다',
  '인터넷이 끊겼거나 창고가 막혀 있습니다. 새로고침해 보십시오.<br>위 <b>파일 목록</b>은 인터넷 없이도 보입니다.'); }, 20000);

window.목록읽기 = async function(){
  상태('창고를 읽는 중입니다…');
  try{
    const { collection, getDocs, query, where } = window.fbRead;
    /* 이 쪽의 갈래 줄만 받는다. 2026년 것만 보이고 다른 해 줄은 창고에 그대로 둔다(사장님 10-14). */
    const 눈 = await getDocs(query(collection(window.db, ...창고자리), where('갈','==',F.갈)));
    답했나 = true;
    줄들 = [];
    눈.forEach(d => { const r = d.data();
      if(String(r.달||'').startsWith(보는해+'-')) 줄들.push(r); else 숨긴줄++; });
    document.getElementById('상태').style.display='none';
    목록그리기();
  }catch(e){ 답했나=true; window.목록못읽음('창고를 읽지 못했습니다',(e&&(e.code||e.message))||''); }
};

function 목록그리기(){
  /* 폴더 목록에 없는 서류 이름이 창고에 있으면 **숨기지 않고** 맨 끝에 덧붙인다. */
  목 = F.파일.map(f => ({...f, 줄:[]}));
  const 남 = {};
  for(const r of (줄들||[])){
    const s = r.서류==null ? '' : String(r.서류);
    const f = 목.find(f => 맞나(f, s));
    if(f) f.줄.push(r); else (남[s||'(서류 안 적힌 줄)'] ||= []).push(r);
  }
  for(const [s,rs] of Object.entries(남)) 목.push({이름:s, 줄:rs, 밖:true});

  const 받음 = 줄들 !== null;
  const 줄합 = 목.reduce((a,f)=>a+f.줄.length,0);
  const 있는 = 목.filter(f=>f.줄.length).length;
  document.getElementById('셈').innerHTML =
    `<div class="c"><div class="k">파일</div><div class="v">${F.파일.length}<small>개</small></div></div>` +
    `<div class="c"><div class="k">줄 있는 파일</div><div class="v">${받음?있는:'…'}<small>개</small></div></div>` +
    `<div class="c"><div class="k">줄</div><div class="v">${받음?줄합.toLocaleString():'…'}<small>줄</small></div></div>`;
  document.getElementById('묶은것').innerHTML =
    `<b>파일로 묶었습니다</b> — 창고 줄마다 적힌 <b>「서류」</b> 칸(그 줄이 나온 파일 이름)으로 갈랐습니다.` +
    (F.묶음 ? `<br>이 폴더의 파일은 묶음 하나 <code>${씻(F.묶음)}</code> 입니다 — 그 <b>안의 엑셀 ${F.파일.length}개</b>로 나눠 보입니다.` : '') +
    (숨긴줄 ? `<br><span class="q">2026년이 아니라 안 보이는 줄 ${숨긴줄}개</span>` : '');

  document.getElementById('파일목').innerHTML = 목.map((f,i) => {
    const n = f.줄.length;
    const 뒤 = !받음 ? '<span class="n">…</span>'
      : n ? `<span class="n">${n.toLocaleString()}줄</span>`
      : `<span class="none">줄 없음 — ${씻(f.없음 || '창고에 이 파일에서 나온 줄이 없습니다')}</span>`;
    return `<div class="file ${n?'':'empty'} ${i===고른?'on':''}" data-i="${i}">` +
      `<span class="nm">${씻(f.이름)}${f.밖?' <span class="q">(폴더 목록에 없는 서류)</span>':''}</span>${뒤}</div>`;
  }).join('');
  if(고른 >= 0) 표그리기();
}

function 표그리기(){
  const f = 목[고른], 틀 = document.getElementById('표틀');
  틀.style.display = 'block';
  document.getElementById('줄셈').innerHTML = `<b>${씻(f.이름)}</b> · <b>${f.줄.length.toLocaleString()}</b>줄`;
  const C = 목칸[F.갈];
  if(!f.줄.length){
    document.getElementById('표').innerHTML =
      `<tbody><tr><td style="color:#8c5a5a;padding:14px 10px;white-space:normal">줄 없음 — ${씻(f.없음 || '창고에 이 파일에서 나온 줄이 없습니다')}</td></tr></tbody>`;
    return;
  }
  const 것 = f.줄.slice().sort((a,b)=> String(a.달||'').localeCompare(String(b.달||'')) || (a.일||0)-(b.일||0));
  /* 폰에서 줄을 몇 천 개씩 그리면 멎는다. 그린 수를 **숨기지 않고 적는다.** */
  const 그릴 = 것.length > 많으면 ? 것.slice(0, 많으면) : 것;
  let t = '<thead><tr>' + C.map(c=>`<th>${c}</th>`).join('') + '</tr></thead><tbody>';
  if(그릴.length < 것.length)
    t += `<tr class="daysep"><td colspan="${C.length}">${것.length}줄 가운데 <b>앞 ${많으면}줄</b>만 그렸습니다.</td></tr>`;
  let 앞 = null;
  for(const r of 그릴){
    const 때 = (r.달 ? +String(r.달).slice(5,7)+'월 ' : '') + (r.일||'?') + '일';
    if(때!==앞){ t += `<tr class="daysep"><td colspan="${C.length}">${때}</td></tr>`; 앞=때; }
    t += '<tr>' + C.map(c=>{
      const v = (r[c]==null)?'':String(r[c]);
      return `<td class="${v===''?'d':(숫자칸.has(c)?'num':'')}">${v===''?'·':씻(v).replace(/\n/g,' ')}</td>`;
    }).join('') + '</tr>';
  }
  document.getElementById('표').innerHTML = t + '</tbody>';
}

document.addEventListener('click', e=>{
  const p = e.target.closest('#파일목 .file'); if(!p || 줄들===null) return;
  고른 = +p.dataset.i;
  목록그리기();
  document.getElementById('표틀').scrollIntoView({behavior:'smooth', block:'start'});
});

목록그리기();
