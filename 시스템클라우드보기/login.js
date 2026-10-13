// SystemCloud 로그인 화면을 로그인 칸만 있는 빈 페이지로 바꾼다.
// 입력값은 원래 로그인 칸에 그대로 넣고 원래 로그인 버튼을 누른다 — 사이트의 암호화 로그인을 그대로 쓰고,
// 아이디·비밀번호는 어디에도 저장하지 않는다.
(() => {
  const idInput = document.getElementById("txtLoginId");
  const pwInput = document.getElementById("inputLoginPwd");
  const loginBtn = document.getElementById("btnLogin");
  if (!idInput || !pwInput || !loginBtn) return;

  const root = document.createElement("div");
  root.id = "vp-root";
  root.innerHTML = `
    <form class="box">
      <h1>SystemCloud 로그인</h1>
      <input name="vpId" placeholder="아이디" autocomplete="username" required>
      <input name="vpPw" type="password" placeholder="비밀번호" autocomplete="current-password" required>
      <button type="submit">로그인</button>
    </form>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");

  const myForm = root.querySelector("form");
  myForm.vpId.value = idInput.value;  // 원래 화면에 저장된 아이디가 있으면 그대로
  (myForm.vpId.value ? myForm.vpPw : myForm.vpId).focus();

  // 원래 칸에 값을 넣고, 사이트가 듣는 입력 이벤트를 똑같이 일으킨다
  const fill = (input, value) => {
    input.value = value;
    for (const type of ["input", "keyup", "change", "blur"]) input.dispatchEvent(new Event(type, { bubbles: true }));
  };
  myForm.addEventListener("submit", (e) => {
    e.preventDefault();
    fill(idInput, myForm.vpId.value.trim());
    fill(pwInput, myForm.vpPw.value);
    loginBtn.click();
    // 3초 안에 다음 화면으로 넘어가지 않으면(비밀번호 오류 안내, 회사 선택 등) 원래 화면을 다시 보여준다
    setTimeout(() => {
      document.documentElement.classList.remove("vp-clean");
      root.remove();
    }, 3000);
  });
})();
