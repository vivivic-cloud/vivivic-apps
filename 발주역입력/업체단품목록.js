/* 발주역입력 / 업체단품목록.js — 로앤·이룸 출고내역이 함께 쓰는 「출고업체명 → 업체별 단품명 거래처」 와 그 거래처 단품 목록.
   사장님 11-21(그대로): 「로앤출고업체명 기준 ING는 본사, 바른은 조혼가구, 아인은 아인가구 유한은 진아산업 럭스는 럭스디자인으로 구분되어 표기되고 있으니 …
     로앤/이룸 출고내역에서 출고업체명을 업체별단품명 기준으로 변경되게 해주세요」 — 화면만, 창고·PDF 값은 그대로.
   목록 = 창고 `발주역입력_업체별단품/{업체}` 의 단품코드·단품명(읽기만, onSnapshot) + 교체(`발주역입력_업체별단품교체`, 업체별단품 v1.4.0) — 교체된 단품은 새 코드·이름.
   쓰는 법: 업체단품.맞춤(출고업체명) → {문서, 이름} | null · 업체단품.듣기(db, fb, 바뀌면) · 업체단품.목록([문서…]) → [{코드, 이름}] | null(아직 못 받음). */
(function(){
  const 자리 = ['artifacts','vivivic-4b7ef','public','data','발주역입력_업체별단품'];
  const 교체자리 = ['artifacts','vivivic-4b7ef','public','data','발주역입력_업체별단품교체'];
  /* 출고업체명(PDF 글자) → 업체별 단품명 문서 이름. 유한가구 문서 = 화면 이름 진아산업(업체별단품 v1.2.2). */
  const 짝 = { 'ING':'본사', '바른':'조혼가구', '아인':'아인가구', '유한':'유한가구', '럭스':'럭스디자인' };
  const 별명 = v => String(v ?? '').replace(/유한가구/g, '진아산업');
  const 문서이름 = u => String(u).replace(/\//g, '／');
  const 받은 = {}, 교체 = {};
  let 알림 = () => {};
  function 맞춤(원){
    const s = String(원 ?? '').trim();
    const 문서 = 짝[s] || (Object.values(짝).includes(s) ? s : '');
    return 문서 ? { 문서, 이름: 별명(문서) } : null;
  }
  function 듣기(db, fb, 바뀌면){
    if(바뀌면) 알림 = 바뀌면;
    const { doc, onSnapshot } = fb;
    for(const u of new Set(Object.values(짝))){
      onSnapshot(doc(db, ...자리, 문서이름(u)), s => { 받은[u] = s.exists() ? s.data() : { 칸:[], 줄:[] }; 알림(); }, () => { 받은[u] = { 칸:[], 줄:[] }; 알림(); });
      onSnapshot(doc(db, ...교체자리, 문서이름(u)), s => { 교체[u] = (s.exists() && s.data().교체) || {}; 알림(); }, () => { 교체[u] = {}; 알림(); });
    }
  }
  function 목록(문서들){
    const 나옴 = [], 본 = new Set();
    for(const u of 문서들){
      const d = 받은[u]; if(!d) return null;
      const 칸 = d.칸 || [], ci = 칸.indexOf('단품코드'), ni = 칸.indexOf('단품명');
      if(ci < 0) continue;
      const 바뀜 = 교체[u] || {};
      for(const r of d.줄 || []){
        const 원코드 = String(r.v[ci] ?? '').trim(); if(!원코드) continue;
        const x = 바뀜[원코드.toLowerCase()];
        const 코드 = x ? String(x.새코드) : 원코드, 이름 = 별명(x ? x.새이름 : (ni >= 0 ? String(r.v[ni] ?? '').trim() : ''));
        const 열 = 코드.toLowerCase(); if(본.has(열)) continue; 본.add(열);
        나옴.push({ 코드, 이름, 업체: 별명(u) });
      }
    }
    return 나옴;
  }
  window.업체단품 = { 맞춤, 듣기, 목록, 별명 };
})();
