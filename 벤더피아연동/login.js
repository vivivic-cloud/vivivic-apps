// 벤더피아 로그인 화면을 로그인 칸만 있는 빈 페이지로 바꾼다.
// 입력값은 원래 로그인 폼에 그대로 넣어 제출하므로 어디에도 저장하지 않는다.
//
// ⚠ 이 글은 **벤더피아 모든 쪽에서** 돈다(불러오기.js 가 늘 넣는다). 로그인 칸이 없으면
//   아래 로그인 부분은 그냥 돌아선다. 그래서 **모든 쪽에 있어야 하는 화면전환 단추**를
//   여기에 둔다 — 새 글을 더하면 집 꼴(manifest)을 고쳐야 해서 사장님이 덮어쓰셔야 한다.

/* ⚠⚠ 10-15 사장님 (배송관리를 짚으시고, 그대로):
     「모든 페이지에 실제 벤더피아의 화면으로돌아오는 화면전환 버튼이 필요하다
       이 화면 전환버튼 누를시 현재 확장프로그램으로 보여지는 화면에서 딱 이 화면전환 버튼만
       남겨둔채 벤더피아의 실제 모습이 모두 보여져야해」
   우리는 벤더피아 원래 화면을 **지운 것이 아니라 가리고** 있다(`html.vp-clean` 한 줄이
   몸의 바로 밑 자식을 다 감춘다). 그러니 **걷었다 다시 덮으면** 된다.
     · **새로고침하지 않는다** — 조회해 두신 결과가 날아가면 안 된다.
     · 원래 화면을 **지우지 않는다** — 숨겼다 되돌린다.
     · 단추는 **뿌리(documentElement)** 에 단다. 몸에 달면 `vp-clean` 이 그것까지 감춘다.
     · 우리 것 중 화면에 남는 것은 **이 단추 하나뿐** — 판번호 딱지(#vp-판)·붉은 줄(#vp-탈)도 같이 숨긴다.
     · 짚어서 지시하기는 **두 모습 다에서** 그대로 산다 — 손잡이는 문서에 붙어 있어 상관없다. */
(() => {
  const 우리것 = ["vp-root", "vp-판", "vp-탈"];
  let 단추 = null, 원래보는중 = false;
  const 숨김표 = "vp-숨김";

  function 꼴맞추기() {
    if (!단추) return;
    단추.textContent = 원래보는중 ? "← 우리 화면으로" : "벤더피아 원래 화면 보기";
    단추.setAttribute("aria-pressed", 원래보는중 ? "true" : "false");
  }
  function 뒤집기() {
    원래보는중 = !원래보는중;
    if (원래보는중) {
      document.documentElement.classList.remove("vp-clean");   // 가린 것을 걷는다
      for (const id of 우리것) { const el = document.getElementById(id); if (el) el.classList.add(숨김표); }
    } else {
      document.documentElement.classList.add("vp-clean");      // 다시 덮는다
      for (const id of 우리것) { const el = document.getElementById(id); if (el) el.classList.remove(숨김표); }
    }
    꼴맞추기();
  }
  function 단추달기() {
    if (단추) return;
    단추 = document.createElement("button");
    단추.type = "button";
    단추.id = "vp-바꾸기";
    단추.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); 뒤집기(); });
    document.documentElement.appendChild(단추);                // ⚠ 몸이 아니라 뿌리에
    꼴맞추기();
  }
  /* 우리 화면이 떠 있을 때만 단추를 단다. 화면 글이 늦게 붙어도 받아 준다. */
  if (document.documentElement.classList.contains("vp-clean")) 단추달기();
  else {
    const 봄 = new MutationObserver(() => {
      if (document.documentElement.classList.contains("vp-clean")) { 단추달기(); 봄.disconnect(); }
    });
    봄.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setTimeout(() => 봄.disconnect(), 20000);                  // 끝내 안 뜨면 그만 본다
  }
})();

(() => {
  const form = document.getElementById("frmSign");
  const idInput = document.getElementById("txtID");
  const pwInput = document.getElementById("txtPWD");
  const loginBtn = document.getElementById("btnLogin");
  if (!form || !idInput || !pwInput || !loginBtn) return;

  const root = document.createElement("div");
  root.id = "vp-root";
  root.innerHTML = `
    <form class="box">
      <h1>벤더피아 로그인</h1>
      <input name="vpId" placeholder="아이디" autocomplete="username" required>
      <input name="vpPw" type="password" placeholder="비밀번호" autocomplete="current-password" required>
      <button type="submit">로그인</button>
    </form>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");

  const myForm = root.querySelector("form");
  myForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    idInput.value = myForm.vpId.value.trim();
    pwInput.value = myForm.vpPw.value;
    // 새로 로그인하면 저장해 둔 목록을 버린다 (로그인 뒤 새로 받는다)
    try { await VP_DATA.clearCache(); } catch (err) { /* 저장 목록을 못 지워도 로그인은 한다 */ }
    form.requestSubmit(loginBtn);
  });
  myForm.vpId.focus();
})();
