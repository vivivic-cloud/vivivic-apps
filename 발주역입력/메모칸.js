/* 메모칸.js — 재단 세부내역 · 이룸산업 · 로앤 출고내역이 함께 쓰는 메모 열(제품명 옆 · 품목명 옆). 공용.
   사장님 11-25(그대로): 「세메뉴모두 제품명 우측옆에 메모 열 하나, 품목명 옆에 메모열 하나를 만들어 텍스트 입력이 가능하게 해주세요.」
   쓰는 법: <script src="메모칸.js?v=1"></script> · const 메모 = 메모칸.만들기({ 자리:[…창고 모음 길…], 띠: 글 => … }) · 메모.시작(window.db, window.fbRead) · 메모.칸('제품'|'품목', 열쇠, 덧속성)
   열쇠: 제품 = 제품명(앞뒤 빈칸 뺀 글자) · 품목 = 제품명 + 탭 + 품목명 — 같은 열쇠면 모든 달·누계에 같은 메모.
   저장 = 창고 `<자리>/_전체` {제품:{열쇠:글}, 품목:{열쇠:글}, 고친때} · 바뀐 열쇠만 setDoc merge(빈칸 = 지움) · onSnapshot 으로 다른 창·기기 것도 바로(치는 칸은 그대로). */
(function(){
  if(window.메모칸) return;
  const 글 = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  function 모양(){
    if(document.getElementById('메모칸모양')) return;
    const st = document.createElement('style'); st.id = '메모칸모양';
    st.textContent = `
.dpr-t td.메모칸{padding:1px 3px;vertical-align:middle}
.dpr-t td.메모칸 input.메모{display:block;width:100%;min-width:90px;height:20px;padding:1px 5px;font:inherit;font-size:11.5px;line-height:16px;color:var(--vg-body);border:1px solid var(--vg-edge);border-radius:4px;background:var(--vg-fill);outline:none;-webkit-appearance:none}
.dpr-t td.메모칸 input.메모:focus{border-color:var(--vg-ink);background:var(--vg-bg)}
.dpr-t td.메모칸 input.메모.있음{background:var(--vg-bg);color:#1565c0;font-weight:700}
@media (max-width:600px){.dpr-t td.메모칸 input.메모{font-size:16px;height:26px}}`;
    document.head.appendChild(st);
  }
  function 만들기(o){
    모양();
    let 값 = {제품:{}, 품목:{}}, db = null, fb = null;
    const 칠 = () => document.querySelectorAll('input.메모[data-z]').forEach(i => {
      if(i === document.activeElement) return;
      const v = (값[i.dataset.z] || {})[i.dataset.k] || '';
      if(i.value !== v) i.value = v; i.classList.toggle('있음', !!v);
    });
    function 쓰기(i){
      const z = i.dataset.z, k = i.dataset.k, v = i.value.trim();
      if(!k || !fb) return;
      if(((값[z] || {})[k] || '') === v){ i.value = v; return; }
      값 = { ...값, [z]: { ...(값[z] || {}) } };
      if(v) 값[z][k] = v; else delete 값[z][k];
      칠();
      fb.setDoc(fb.doc(db, ...o.자리, '_전체'), {[z]:{[k]: v ? v : fb.deleteField()}, 고친때:new Date().toISOString()}, {merge:true})
        .then(() => o.띠 && o.띠(''), e => o.띠 && o.띠('메모를 저장하지 못했습니다 — 새로고침 뒤 다시 해 보십시오 ' + ((e&&(e.code||e.message))||'')));
    }
    document.addEventListener('change', e => { if(e.target.matches && e.target.matches('input.메모[data-z]')) 쓰기(e.target); });
    document.addEventListener('keydown', e => { if(e.key==='Enter' && e.target.matches && e.target.matches('input.메모[data-z]')){ e.preventDefault(); e.target.blur(); } });
    return {
      시작(d, f){ db = d; fb = f;
        f.onSnapshot(f.doc(d, ...o.자리, '_전체'), s => { const x = (s.exists() && s.data()) || {};
          값 = { 제품:(x.제품 && typeof x.제품==='object') ? x.제품 : {}, 품목:(x.품목 && typeof x.품목==='object') ? x.품목 : {} }; 칠(); }, () => {}); },
      칸(z, k, 덧){
        if(!k) return `<td class="메모칸"${덧||''}></td>`;
        const v = (값[z] || {})[k] || '';
        return `<td class="메모칸"${덧||''}><input class="메모${v?' 있음':''}" type="text" autocomplete="off" data-z="${z}" data-k="${글(k)}" value="${글(v)}"></td>`;
      },
    };
  }
  window.메모칸 = { 만들기 };
})();
