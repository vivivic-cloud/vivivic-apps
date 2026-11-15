/* 하우저 로그인 화면을 아이디·비밀번호 칸만 남긴 빈 화면으로 바꾼다(벤더피아연동 login.js 와 같은 꼴).
   ⚠⚠ 아이디·비밀번호는 읽지도 저장하지도 기록하지도 않는다. 칸·단추는 하우저 것 그대로 두고 둘레만 감춘다.
   로그인은 사장님이 직접 한다. 「로그인 상태 유지」 칸도 건드리지 않는다. */
(() => {
  const 칸 = document.getElementById("loginId");
  if (!칸 || !document.getElementById("loginPw")) return;
  document.documentElement.classList.add("hw-login");
  // 칸에서 위로 올라가며, 길 위의 요소는 남기고 곁가지(머리·꼬리·안내)는 감춘다.
  let e = 칸;
  while (e && e !== document.body) {
    e.classList.add("hw-keep");
    if (e.parentElement) for (const 형 of e.parentElement.children)
      if (형 !== e && !형.classList.contains("hw-keep") && 형.tagName !== "SCRIPT" && 형.tagName !== "STYLE") 형.classList.add("hw-숨김");
    e = e.parentElement;
  }
  const 머리 = document.createElement("div");
  머리.id = "hw-로그인머리";
  머리.innerHTML = "<h1>하우저</h1><p>하우저 아이디·비밀번호로 로그인하세요. 이 확장은 입력한 값을 저장하지 않습니다.</p>";
  const 폼 = 칸.closest("form");
  if (폼 && 폼.parentElement) 폼.parentElement.insertBefore(머리, 폼);
})();
