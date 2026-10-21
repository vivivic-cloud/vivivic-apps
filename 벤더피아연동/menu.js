// 로그인 후 화면(index.aspx)을 메뉴 버튼만 있는 빈 페이지로 바꾼다.
// 누르면 그 화면만 따로 연다.
(() => {
  /* ⚠⚠ 10-21 사장님: 「연동 메인메뉴의 CS등록의 경우 배송관리 화면이 아닌 벤더피아 -판매관리-주문관리 화면이 연동되어야 합니다.」
     벤더피아 「판매관리 → 주문관리」 화면 주소(aspx)는 저장소·기록 어디에도 없어 **짐작해 넣지 않았다.**
     알게 되면 **이 한 줄에만** 적는다(예 `/System/Sales/OrderList.aspx` 꼴 — 반드시 진짜 주소로).
     비어 있는 동안은 전처럼 배송관리 위에서 CS 판이 열린다.
     ⚠ 주소를 적은 뒤에도 그 화면에서 글이 돌려면 `불러오기.js`(확장 안, 덮어쓰기 필요)의 주소→글 짝에
       주문관리 주소를 더하고, `search.js` 의 `fetchList`·`plan` 이 읽는 검색 폼 칸 이름을 그 화면 것으로 맞춰야 한다. */
  const 주문관리주소 = "";

  const PAGES = [
    { name: "배송관리", url: "/System/Delivery/firmDvList.aspx" },
    { name: "단품관리", url: "/System/Master/goods.aspx" },
    { name: "상품관리", url: "/System/Master/salesGoods.aspx" },
    { name: "재고조회", url: "/System/Stock/StockList.aspx" },
    /* ⚠⚠ 10-16 사장님 (이 메뉴 화면을 짚어 보내신 말씀, 그대로): 「**cs등록 항목을 만들어줘**」
         (장부 a1792145842)
       속은 이미 있다 — 배송관리 줄마다 「상담」 단추로 여는 그 판(상담 이력 + 교환·반품·AS 접수).
       **그 판을 메뉴에서도 들어가게** 한다. 길은 배송관리와 같은 쪽이고, 뒤에 `#vgCS` 를 붙여
       그 화면이 **CS등록 판을 바로 열게** 한다(`search.js`).
       ⚠ 꼴은 다른 넷과 **같은 `vp-btn`** 하나다 — 두 벌로 만들지 않는다. */
    { name: "CS등록", url: (주문관리주소 || "/System/Delivery/firmDvList.aspx") + "#vgCS" },
  ];

  // 로그인된 화면(원래 메뉴에 배송관리가 있는 화면)에서만 바꾼다
  const loggedIn = [...document.querySelectorAll("a")].some((a) => a.textContent.trim() === "배송관리");
  if (!loggedIn) return;

  const root = document.createElement("div");
  root.id = "vp-root";
  root.innerHTML = `
    <div class="box">
      <h1>벤더피아</h1>
      ${PAGES.map((p) => `<a class="vp-btn" href="${p.url}">${p.name}</a>`).join("")}
    </div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");

  // 로그인 뒤 메인 화면에서 각 메뉴가 쓰는 목록을 뒤에서 조용히 받아 둔다 (이미 받아 둔 것은 건너뛴다)
  VP_DATA.prefetch();
})();
