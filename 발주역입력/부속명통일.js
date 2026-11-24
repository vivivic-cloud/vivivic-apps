/* 부속명통일.js — 품목명 분할(재단.html v1.8.0~v1.8.5 그대로) · 입력폼 부속명 드롭 · 같은 품목명 전체 적용. 공용(이룸산업.html v1.6.5~ · 조혼가구부속명.html v1.1.0~).
   사장님 11-24 이룸 「…부속명을 드롭다운선택…」·「응 거기서 가져와…」·「품목명 분할…」·「다른 제품도 그렇게 되게 해줘」·「…등록대기 대기중인 것, 이후 등록완료된 것…」
   + 조혼가구 「조혼가구 부속명도 이룸가구와 동일하게 입력할 수 있도록 해줘」.
   쓰는 법(페이지):
     <script src="부속명통일.js?v=1"></script>  (모듈 스크립트가 window.폼품목받음 을 부르기 전에 — 모듈은 늦게 도니 일반 스크립트 아무 데나)
     const 부통 = 부속통일.만들기({ 자리:[…창고 모음 길…], 다시그림: () => …, 띠: 글 => … });
     부통.시작(window.db, window.fbRead);   // 창고 읽기 시작(익명 로그인 뒤)
     부통.품목칸(m) · 부통.수량칸(m, 합, 표글) · 부통.월품목칸(m) · 부통.나눈수(m, n) · 부통.값() · 부통.닫기()
   부속명 목록(한 쪽에 하나, 모든 만들기 공유) = ① 공개 `발주역입력_영림원폼/_품목_영림원품목등록` 보내기 줄 반제품(입력폼 품목등록 받기 자료)
     ② 입력폼 erp_items(페이지 모듈이 'erp-input' 로그인으로 읽어 window.폼품목받음(줄) 로 넘김) 대기·진행중·수정대기 반제품
     ③ erp_items 완료 중 createdAt ≥ 이후컷 이고 importedAt 없음. 이름 = 품명 마지막 「_」 뒤 · 같은 이름 하나.
   저장 = 창고 `<자리>/_전체` {분할:{품목명:{방식,위,원}}, 부속:{품목명 | 품목명\t위 | 품목명\t아래: 부속명}, 고친때} · 바뀐 열쇠만 setDoc merge · onSnapshot.
   ⚠ 이벤트는 문서 전체에 한 번(#속 안 td.pm · td.qy · .속명) — 한 쪽에 만들기 하나만. */
(function(){
  if(window.부속통일) return;
  const 이후컷 = '2026-11-24T13:50:00Z';
  const 꼬리 = n => { n = String(n || ''); const i = n.lastIndexOf('_'); return i >= 0 ? n.slice(i+1).trim() : ''; };
  const 글 = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const 나눔이름표 = { '상지판':['상판','지판'] };   /* 재단.html v1.8.5 그대로 */
  const 나눈이름 = m => 나눔이름표[String(m).trim()] || [m + 'R', m + 'L'];
  function 위수(나, n){
    switch(나 && 나.방식){
      case '위3': return Math.ceil(n/3);
      case '아래3': return n - Math.floor(n/3);
      case '직접': { if(!(나.원 > 0)) return Math.ceil(n/2);
        const w = 나.원 === n ? 나.위 : Math.round(나.위 * n / 나.원);   /* 「임시」 원래 수량이 다른 줄은 같은 비율 */
        return Math.max(0, Math.min(n, Math.round(w) || 0)); }
      default: return Math.ceil(n/2);   /* 반반, 홀수면 위 +1 */
    }
  }
  /* ── 부속명 목록 ── */
  let 목록 = [], 읽음 = false, 폼줄 = null, 받기줄 = null, 받기켬 = false;
  const 듣는이 = [];
  function 셈(){
    읽음 = 폼줄 != null || 받기줄 != null;
    const 다 = new Set();
    for(const z of 받기줄 || []){ const 품 = z && z.품목등록 || {}; if(String(품.품목자산분류||'').trim()==='반제품'){ const t = 꼬리(품.품명); if(t) 다.add(t); } }
    for(const x of 폼줄 || []){ if(!x || x.ylwGone || String(x.asset||'').trim()!=='반제품') continue;
      const st = String(x.status||''), 새완료 = st==='완료' && !x.importedAt && String(x.createdAt||'') >= 이후컷;
      if(!['대기','진행중','수정대기'].includes(st) && !새완료) continue;
      const t = 꼬리(x.name); if(t) 다.add(t); }
    목록 = [...다].sort((a,b) => a.localeCompare(b, 'ko'));
    듣는이.forEach(f => { try{ f(); }catch(e){} });
  }
  window.폼품목받음 = (줄) => { 폼줄 = 줄; 셈(); };
  if(window.폼품목대기) window.폼품목받음(...window.폼품목대기);
  function 받기듣기(db, fb){
    if(받기켬) return; 받기켬 = true;
    fb.onSnapshot(fb.doc(db, 'artifacts','vivivic-4b7ef','public','data','발주역입력_영림원폼','_품목_영림원품목등록'), d => {
      받기줄 = (d.exists() && d.data().보내기 && d.data().보내기.줄) || []; 셈(); }, () => {});
  }
  /* ── 모양(한 번) ── */
  function 모양(){
    if(document.getElementById('부속통일모양')) return;
    const st = document.createElement('style'); st.id = '부속통일모양';
    st.textContent = `
.dpr-t td.pm .품줄{display:flex;align-items:center}
.dpr-t td .작{font:inherit;font-size:10.5px;line-height:14px;height:16px;padding:0 4px;margin-left:6px;border:1px solid var(--vg-edge);border-radius:4px;background:var(--vg-bg);color:var(--vg-muted);cursor:pointer;flex:0 0 auto}
.dpr-t td .작:hover{color:var(--vg-ink);border-color:var(--vg-ink)}
.dpr-t td.qy .작{margin:0}
.dpr-t td .반{display:block;min-height:20px;margin:0 -5px;padding:1px 5px}
.dpr-t td .반.위{border-bottom:1px solid #D6D6D3}
.dpr-t td .반 .품줄{display:flex;align-items:center}
.dpr-t td.qy .반{display:flex;align-items:center;justify-content:flex-end;gap:4px}
.dpr-t td.qy input.수{width:52px;height:18px;padding:0 4px;font:inherit;font-size:11.5px;text-align:right;border:1px solid #C7C7C3;border-radius:4px}
.속명{display:block;min-width:90px;height:18px;margin:2px 0 1px;padding:0 5px;font:inherit;font-size:11px;line-height:16px;text-align:left;border:1px dashed #C7C7C3;border-radius:4px;background:var(--vg-bg);color:var(--vg-muted);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.속명.on{border-style:solid;color:#1565c0;font-weight:700}
.속명.없음{background:#FFF1E0;cursor:default}
.vpd{position:fixed;z-index:50;background:var(--vg-bg);border:1px solid #C7C7C3;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.12);overflow-y:auto;-webkit-overflow-scrolling:touch}
.vpd div{padding:4px 8px;font-size:11.5px;line-height:1.3;border-bottom:1px solid #EDEDEA;cursor:pointer;white-space:nowrap}
.vpd div:hover,.vpd div.on{background:var(--vg-fill)}
.vpd div.act{font-weight:700;color:var(--vg-ink);background:var(--vg-fill)}`;
    document.head.appendChild(st);
  }
  const 화면끝 = () => window.visualViewport ? visualViewport.offsetTop + visualViewport.height : innerHeight;

  function 만들기(o){
    모양();
    let 값 = {분할:{}, 부속:{}}, db = null, fb = null, 창 = null;
    const 다시 = () => { if(document.activeElement && document.activeElement.matches && document.activeElement.matches('#속 input.수')) return; o.다시그림(); };
    듣는이.push(다시);
    const 나뉨 = m => 값.분할[m];
    function 단추(k){
      const v = 값.부속[k] || '';
      if(!읽음 || !목록.length) return `<button type="button" class="속명 없음${v?' on':''}" data-k="${글(k)}" title="${글(읽음 ? '입력폼 등록대기·받기 반제품 부속명 0건' : '부속명 목록을 아직 못 읽음')}">${v ? 글(v) : '▾'}</button>`;
      return `<button type="button" class="속명${v?' on':''}" data-k="${글(k)}"${v?` title="${글('입력폼 부속명 ' + v)}"`:''}>${v ? 글(v) : '▾'}</button>`;
    }
    function 쓰기(칸, k, v){
      const 새 = JSON.parse(JSON.stringify(값));
      if(v == null) delete 새[칸][k]; else 새[칸][k] = v;
      if(JSON.stringify(새[칸][k] ?? null) === JSON.stringify(값[칸][k] ?? null)) return;
      값 = 새; 다시();
      fb.setDoc(fb.doc(db, ...o.자리, '_전체'), {[칸]:{[k]: v == null ? fb.deleteField() : v}, 고친때:new Date().toISOString()}, {merge:true})
        .then(() => o.띠 && o.띠(''), e => o.띠 && o.띠('저장하지 못했습니다 — 새로고침 뒤 다시 해 보십시오 ' + ((e&&(e.code||e.message))||'')));
    }
    function 분할바꾸기(k, 나){
      쓰기('분할', k, 나);
      if(!나){ if(값.부속[k + '\t위'] != null) 쓰기('부속', k + '\t위', null); if(값.부속[k + '\t아래'] != null) 쓰기('부속', k + '\t아래', null); }
    }
    function 닫기(){ if(창){ 창.remove(); 창 = null; } }
    function 열기(b){
      닫기();
      const k = b.dataset.k, 지금 = 값.부속[k] || '';
      const d = document.createElement('div'); d.className = 'vpd'; d.dataset.k = k;
      d.innerHTML = (지금 ? `<div class="act" data-v="" title="풀기">×</div>` : '') + 목록.map(v => `<div data-v="${글(v)}"${v===지금?' class="on"':''}>${글(v)}</div>`).join('');
      document.body.appendChild(d); 창 = d;
      const q = b.getBoundingClientRect(), 끝 = 화면끝(); d.style.maxHeight = Math.max(80, Math.min(360, 끝 - 8)) + 'px';
      const w = d.offsetWidth, h = d.offsetHeight;
      let x = q.right + 10, y = Math.max(4, Math.min(q.top, 끝 - h - 4));   /* 칸 옆 10px(오른쪽, 자리 없으면 왼쪽) */
      if(x + w > innerWidth - 4) x = q.left - 10 - w >= 4 ? q.left - 10 - w : Math.max(4, innerWidth - w - 4);
      d.style.left = x + 'px'; d.style.top = y + 'px';
      d.addEventListener('mousedown', e => e.preventDefault());
      d.addEventListener('click', e => { const it = e.target.closest('[data-v]'); if(!it) return; 닫기(); 쓰기('부속', k, it.dataset.v || null); });
    }
    document.addEventListener('click', e => {
      const t = e.target;
      if(창 && !t.closest('.vpd') && !t.closest('.속명')) 닫기();
      const b = t.closest('#속 .속명'); if(b){ if(b.classList.contains('없음')) return; if(창 && 창.dataset.k === b.dataset.k){ 닫기(); return; } 열기(b); return; }
      const pm = t.closest('#속 td.pm');
      if(pm){ if(t.closest('.나눔')) 분할바꾸기(pm.dataset.k, {방식:'반'}); else if(t.closest('.합')) 분할바꾸기(pm.dataset.k, null); return; }
      const 셋 = t.closest('#속 td.qy .셋');
      if(셋){ const td = 셋.closest('td'); 쓰기('분할', td.dataset.k, {방식: 셋.dataset.w==='위' ? '위3' : '아래3'}); }
    });
    document.addEventListener('keydown', e => { if(e.key==='Escape') 닫기(); });
    function 수량고침(input, 저장){
      const td = input.closest('td.qy'), n = +td.dataset.n;
      let v = parseInt(String(input.value).replace(/[^\d]/g,''), 10); if(isNaN(v)) v = 0;
      v = Math.max(0, Math.min(n, v));
      const 남 = td.querySelector(`input.수[data-w="${input.dataset.w==='위'?'아래':'위'}"]`); if(남) 남.value = n - v;
      if(!저장) return;
      input.value = v;
      const 위 = input.dataset.w==='위' ? v : n - v, 나 = 나뉨(td.dataset.k);
      if(나 && 위수(나, n) === 위) return;
      input.blur();
      쓰기('분할', td.dataset.k, {방식:'직접', 위, 원:n});
    }
    document.addEventListener('input', e => { if(e.target.matches('#속 td.qy input.수')) 수량고침(e.target, false); });
    document.addEventListener('change', e => { if(e.target.matches('#속 td.qy input.수')) 수량고침(e.target, true); });
    document.addEventListener('keydown', e => { if(e.key==='Enter' && e.target.matches('#속 td.qy input.수')){ e.preventDefault(); 수량고침(e.target, true); } });

    return {
      시작(d, f){ db = d; fb = f; 받기듣기(d, f);
        f.onSnapshot(f.doc(d, ...o.자리, '_전체'), s => {
          const x = (s.exists() && s.data()) || {};
          값 = {분할:(x.분할 && typeof x.분할==='object') ? x.분할 : {}, 부속:(x.부속 && typeof x.부속==='object') ? x.부속 : {}};
          다시();
        }, () => {}); },
      값: () => 값,
      닫기,
      위수, 나눈이름,
      /* 고치는 품목 칸 — 「분할」 · 나뉘면 위·아래 + 「⋈」 · 칸마다 아래 부속명 드롭 */
      품목칸(m, 덧cls){
        const c = ('pm ' + (덧cls || '')).trim();
        if(나뉨(m)){ const [위, 아래] = 나눈이름(m);
          return `<td class="${c}" data-k="${글(m)}"><div class="반 위"><div class="품줄"><span class="pn">${글(위)}</span><button type="button" class="작 합" title="합치기">⋈</button></div>${단추(m + '\t위')}</div><div class="반 아래"><div class="품줄"><span class="pn">${글(아래)}</span></div>${단추(m + '\t아래')}</div></td>`; }
        return `<td class="${c}" data-k="${글(m)}"><div class="품줄"><span class="pn">${글(m)}</span><button type="button" class="작 나눔">분할</button></div>${단추(m)}</td>`;
      },
      /* 고치는 수량 칸 — 나뉘면 위·아래 수(「3」·직접 고침), 아니면 표글(합) */
      수량칸(m, 합, 표글){
        const 나 = 나뉨(m), n = Math.round(합);
        if(!나 || n !== 합) return `<td class="num">${표글 ? 표글(합) : 글(합)}</td>`;
        const 위 = 위수(나, n);
        return `<td class="num qy" data-k="${글(m)}" data-n="${n}"><div class="반 위"><button type="button" class="작 셋" data-w="위">3</button><input class="수" type="text" inputmode="numeric" data-w="위" value="${위}"></div>`
             + `<div class="반 아래"><button type="button" class="작 셋" data-w="아래">3</button><input class="수" type="text" inputmode="numeric" data-w="아래" value="${n-위}"></div></td>`;
      },
      /* 보기만 하는 품목 칸(월별 명세) — 고른 부속명 또는 나눈이름 */
      월품목칸(m){
        const 나 = 값.분할[m];
        if(나){ const [위, 아래] = 나눈이름(m), a = 값.부속[m + '\t위'], b = 값.부속[m + '\t아래'];
          return `<td title="${글('품목명 ' + m + ' — 누계에서 나눔')}"><div class="반 위">${글(a || 위)}</div><div class="반 아래">${글(b || 아래)}</div></td>`; }
        const v = 값.부속[m];
        return v ? `<td title="${글('품목명 ' + m + ' → 입력폼 부속명')}">${글(v)}</td>` : `<td>${글(m)}</td>`;
      },
      /* 나뉜 품목이면 [위, 아래] 수(n 정수일 때), 아니면 null */
      나눈수(m, n){ const 나 = 값.분할[m]; if(!나 || n == null || !Number.isInteger(n) || n <= 0) return null; const 위 = 위수(나, n); return [위, n - 위]; },
    };
  }
  window.부속통일 = { 만들기, 위수, 나눈이름 };
})();
