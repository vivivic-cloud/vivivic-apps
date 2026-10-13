// 로그인 후 화면(index.aspx)을 메뉴 버튼만 있는 빈 페이지로 바꾼다.
// 누르면 그 화면만 따로 연다.
(() => {
  const PAGES = [
    { name: "배송관리", url: "/System/Delivery/firmDvList.aspx" },
    { name: "단품관리", url: "/System/Master/goods.aspx" },
    { name: "상품관리", url: "/System/Master/salesGoods.aspx" },
    { name: "재고조회", url: "/System/Stock/StockList.aspx" },
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
