/* 로그인 뒤 첫 화면(/home)을 메뉴 단추만 있는 화면으로 덮는다. 하우저 원래 화면은 지우지 않고 「하우저 원본」 단추로 걷는다. */
(() => {
  if (!document.getElementById("logout_button")) return;          // 로그인된 화면에서만
  if (document.getElementById("hw-메뉴")) return;
  const PAGES = [["재고현황", "/storage/inventory/list"], ["상품 조회", "/product/home"], ["등록상품보기", "/product/home?hw=reg"]];
  const 뿌리 = document.createElement("div");
  뿌리.id = "hw-메뉴";
  뿌리.innerHTML = '<div class="box"><h1>하우저</h1>' +
    '<div class="안내"><b>하우저 보기</b>는 하우저 자료를 표로 깔끔하게 보여 주는 확장입니다.' +
    '<ol><li>하우저에 로그인합니다.</li><li>아래에서 재고현황·상품 조회·등록상품보기 중 하나를 누릅니다.</li><li>표에서 검색하고, 줄을 누르면 상세가 열립니다.</li></ol>' +
    '원래 하우저 화면은 오른쪽 위 「하우저 원본」을 누르면 봅니다.</div>' +
    PAGES.map(([n, u]) => `<a class="hw-btn" href="${u}" target="_blank" rel="noopener">${n}</a>`).join("") +
    '<button type="button" class="hw-원본" title="하우저 원래 화면 보기">하우저 원본</button>' +
    '<p class="sub">읽기만 합니다. 하우저 자료를 고치거나 저장·전송하지 않습니다.</p></div>';
  const 칩 = document.createElement("div");
  칩.id = "hw-버전";   // 판 번호 = manifest version (불러오기.js 가 data-hw-판 에 넣어 줌)
  칩.textContent = "v" + (document.documentElement.getAttribute("data-hw-판") || "?");
  뿌리.appendChild(칩);
  뿌리.querySelector("button").onclick = () => 뿌리.remove();
  document.body.appendChild(뿌리);
})();
