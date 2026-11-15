/* 하우저 로그인 화면을 아이디·비밀번호 칸만 남긴 빈 화면으로 바꾼다(벤더피아연동 login.js 와 같은 꼴).
   ⚠⚠ 아이디·비밀번호는 읽지도 저장하지도 기록하지도 않는다. 칸·단추는 하우저 것 그대로 두고 둘레만 감춘다.
   로그인은 사장님이 직접 한다. 「로그인 상태 유지」 칸도 건드리지 않는다. */
(() => {
  const 칸 = document.getElementById("loginId");
  if (!칸 || !document.getElementById("loginPw")) return;
  document.documentElement.classList.add("hw-login");
  // 0.3.2: 남길 것 = 아이디 칸·비밀번호 칸(.input_comm 통째)·안내 줄(.emph_error)·로그인 유지(.check_comm)·로그인 단추(.btn_comm).
  // 그 길 위의 요소는 남기고, 길 곁가지(머리·꼬리·안내·링크)만 감춘다. 남길 것 안쪽(글자·지우기 단추)은 건드리지 않는다.
  const 폼안 = 칸.closest("form") || document.body;
  const 남길것 = [...폼안.querySelectorAll(".input_comm, .emph_error, .check_comm, .btn_comm")];
  const 칸상자 = 칸.closest(".input_comm") || 칸;
  if (!남길것.includes(칸상자)) 남길것.push(칸상자);
  const 길 = new Set();
  for (const t of 남길것) for (let e = t; e && e !== document.body; e = e.parentElement) 길.add(e);
  for (const e of 길) {
    e.classList.add("hw-keep");
    if (남길것.includes(e)) continue;   // 남길 것 안쪽은 그대로
    for (const 형 of e.children)
      if (!길.has(형) && 형.tagName !== "SCRIPT" && 형.tagName !== "STYLE") 형.classList.add("hw-숨김");
  }
  if (document.body) for (const 형 of document.body.children)
    if (!길.has(형) && 형.tagName !== "SCRIPT" && 형.tagName !== "STYLE") 형.classList.add("hw-숨김");
  const 머리 = document.createElement("div");
  머리.id = "hw-로그인머리";
  머리.innerHTML = "<h1>하우저</h1><p>하우저 아이디·비밀번호로 로그인하세요. 이 확장은 입력한 값을 저장하지 않습니다.</p>";
  const 칩 = document.createElement("div");
  칩.id = "hw-버전";   // 판 번호 = manifest version (불러오기.js 가 data-hw-판 에 넣어 줌)
  칩.textContent = "v" + (document.documentElement.getAttribute("data-hw-판") || "?");
  document.body.appendChild(칩);
  const 폼 = 칸.closest("form");
  if (폼 && 폼.parentElement) 폼.parentElement.insertBefore(머리, 폼);
})();
