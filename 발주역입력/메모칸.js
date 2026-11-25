/* 메모칸.js — 재단 세부내역 · 이룸산업 · 로앤 출고내역이 함께 쓰는 메모 열(제품명 옆 · 품목명 옆). 공용.
   사장님 11-25(그대로): 「세메뉴모두 제품명 우측옆에 메모 열 하나, 품목명 옆에 메모열 하나를 만들어 텍스트 입력이 가능하게 해주세요.」
   쓰는 법: <script src="메모칸.js?v=1"></script> · const 메모 = 메모칸.만들기({ 자리:[…창고 모음 길…], 띠: 글 => … }) · 메모.시작(window.db, window.fbRead) · 메모.칸('제품'|'품목', 열쇠, 덧속성)
   열쇠: 제품 = 제품명(앞뒤 빈칸 뺀 글자) · 품목 = 제품명 + 탭 + 품목명 — 같은 열쇠면 모든 달·누계에 같은 메모.
   11-25 사장님 「에이엠티출고조사 메모는 메모량에 따라 열바뀜이 되어 해당칸의 높이가 자동조절되어야 합니다.」 — 칸 = textarea(cols 20, 열 너비 그대로) · 글이 길면 줄바꿈 · 높이 = 글만큼(치는 동안·저장된 글 모두, 표가 새로 그려지면 저절로) · Enter = 저장(줄은 저절로 바뀜).
   v4(11-25): 사장님 「메모는 그냥 메모한 자리만 유일하면 됩니다」 — 칸 묶음 이름을 쓰는 쪽이 정함(로앤·이룸·재단 = 누계제품·누계품목 {제품명⇥품목명} · 월제품·월품목 {달⇥줄 번호⇥제품명}) · 옛 제품·품목 묶음은 창고에 남김(안 보임).
   v3(11-25): 잠김(덧, 말) = 입력 없는 회색 칸(제품 메모는 그 제품 첫 줄에만 — 쓰는 쪽이 고름).
   저장 = 창고 `<자리>/_전체` {제품:{열쇠:글}, 품목:{열쇠:글}, 고친때} · 바뀐 열쇠만 setDoc merge(빈칸 = 지움) · onSnapshot 으로 다른 창·기기 것도 바로(치는 칸은 그대로). */
(function(){
  if(window.메모칸) return;
  const 글 = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  function 모양(){
    if(document.getElementById('메모칸모양')) return;
    const st = document.createElement('style'); st.id = '메모칸모양';
    st.textContent = `
.dpr-t td.메모칸{padding:1px 3px;vertical-align:middle}
.dpr-t td.메모칸 textarea.메모{display:block;width:100%;min-width:90px;height:20px;min-height:20px;resize:none;overflow:hidden;white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;padding:1px 5px;font:inherit;font-size:11.5px;line-height:16px;color:var(--vg-body);border:1px solid var(--vg-edge);border-radius:4px;background:var(--vg-fill);outline:none;-webkit-appearance:none}
.dpr-t td.메모칸 textarea.메모:focus{border-color:var(--vg-ink);background:var(--vg-bg)}
.dpr-t td.메모칸.메모잠김{background:#EFEFEC;cursor:not-allowed}
.dpr-t td.메모칸 textarea.메모.있음{background:var(--vg-bg);color:#1565c0;font-weight:700}
@media (max-width:600px){.dpr-t td.메모칸 textarea.메모{font-size:16px;height:26px;min-height:26px;line-height:22px}}`;
    document.head.appendChild(st);
  }
  /* 높이 = 글만큼(빈 칸은 CSS 높이 그대로) */
  function 높이(t){ t.style.height = ''; if(t.value) t.style.height = t.scrollHeight + 2 + 'px'; }
  function 높이맞춤(){ const 들 = [...document.querySelectorAll('textarea.메모')].filter(t => t.value || t.style.height);
    들.forEach(t => { t.style.height = ''; }); const 잰 = 들.map(t => t.value ? t.scrollHeight + 2 : 0); 들.forEach((t, i) => { if(잰[i]) t.style.height = 잰[i] + 'px'; }); }
  function 만들기(o){
    모양();
    let 값 = {제품:{}, 품목:{}}, db = null, fb = null;
    const 칠 = () => { document.querySelectorAll('textarea.메모[data-z]').forEach(i => {
      if(i === document.activeElement) return;
      const v = (값[i.dataset.z] || {})[i.dataset.k] || '';
      if(i.value !== v) i.value = v; i.classList.toggle('있음', !!v);
    }); 높이맞춤(); };
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
    document.addEventListener('change', e => { if(e.target.matches && e.target.matches('textarea.메모[data-z]')) 쓰기(e.target); });
    document.addEventListener('keydown', e => { if(e.key==='Enter' && !e.isComposing && e.target.matches && e.target.matches('textarea.메모[data-z]')){ e.preventDefault(); e.target.blur(); } });
    document.addEventListener('input', e => { if(e.target.matches && e.target.matches('textarea.메모[data-z]')) 높이(e.target); });
    /* 표가 새로 그려지면(메모 칸이 붙으면) 글 있는 칸 높이를 맞춤 — 한 번에 모아 잼 */
    let 틀 = 0;
    new MutationObserver(목 => { if(틀) return; if(!목.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && (n.matches('textarea.메모') || n.querySelector && n.querySelector('textarea.메모'))))) return;
      틀 = requestAnimationFrame(() => { 틀 = 0; 높이맞춤(); }); }).observe(document.body, { childList:true, subtree:true });
    return {
      시작(d, f){ db = d; fb = f;
        f.onSnapshot(f.doc(d, ...o.자리, '_전체'), s => { const x = (s.exists() && s.data()) || {};
          값 = {}; for(const [z, m] of Object.entries(x)) if(m && typeof m==='object' && !Array.isArray(m)) 값[z] = m; 칠(); }, () => {}); },   /* v4 칸 묶음 = 쓰는 쪽이 정함(누계제품·누계품목·월제품·월품목 …) */
      잠김(덧, 말){ return `<td class="메모칸 메모잠김"${덧||''}${말 ? ` title="${글(말)}"` : ''}></td>`; },   /* v3 같은 제품 둘째 줄부터 — 입력 막음·회색 */
      칸(z, k, 덧){
        if(!k) return `<td class="메모칸"${덧||''}></td>`;
        const v = (값[z] || {})[k] || '';
        return `<td class="메모칸"${덧||''}><textarea class="메모${v?' 있음':''}" rows="1" cols="20" autocomplete="off" data-z="${z}" data-k="${글(k)}">${글(v).replace(/>/g,'&gt;')}</textarea></td>`;
      },
    };
  }
  window.메모칸 = { 만들기 };
})();
