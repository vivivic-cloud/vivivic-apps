/* 공유.js — 「에이엠티출고조사」 공유용 주소(재단 · 이룸산업 · 로앤 · 업체별단품 네 쪽이 함께 씀).
   사장님 11-25(그대로): 「네 공유용 제한된페이지를 다시 만들어주세요- 기존 기능및 연동등에 문제 업겠죠?」
   주소 끝 ?공유=에이엠티 로 열면: 쪽길 = 「에이엠티출고조사」 묶음 네 탭만(묶음 밖 탭 · 「← 외주자료 입력폼」 숨김) · 네 탭 주소에 같은 표시를 붙여 오가도 유지.
   표시 없는 주소(사장님용)는 아무것도 안 바꿈. 화면만 — 창고·저장·연동 그대로. */
(function(){
  let 켬 = false;
  try{ 켬 = new URLSearchParams(location.search).get('공유') === '에이엠티'; }catch(e){}
  if(!켬) return;
  document.documentElement.classList.add('공유에이엠티');
  const st = document.createElement('style');
  st.textContent = 'html.공유에이엠티 .쪽길>a{display:none!important}';   /* 묶음(span.묶음) 밖 탭 · 폼길 = nav 바로 아래 a */
  document.head.appendChild(st);
  const 붙임 = () => document.querySelectorAll('.쪽길 .묶음 a[href]').forEach(a => {
    try{ const u = new URL(a.getAttribute('href'), location.href); u.searchParams.set('공유', '에이엠티'); a.href = u.pathname.split('/').pop() + u.search + u.hash; }catch(e){}
  });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 붙임); else 붙임();
})();
