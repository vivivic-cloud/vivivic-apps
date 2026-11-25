// 로그인 후 화면(index.aspx)을 메뉴 버튼만 있는 빈 페이지로 바꾼다.
// 누르면 그 화면만 따로 연다.
(() => {
  /* ⚠⚠ 10-21 사장님: 「연동 메인메뉴의 CS등록의 경우 배송관리 화면이 아닌 벤더피아 -판매관리-주문관리 화면이 연동되어야 합니다.」
     사장님이 알려 주신 주소: `view-source:https://vendorpia.com/System/Sales/orderMst.aspx` → 주문관리 = 아래 주소.
     10-22 바로잡음: 그 화면은 **벤더피아 원래 화면이 아니라 우리 배송관리와 같은 꼴**(기간·검색창·표·상담 단추)이고 자료만 주문관리 조회에서 온다 — `불러오기.js` 가 `search.js` 를 보내고 `search.js` 가 가른다.
     비우면 전처럼 배송관리 위에서 CS 판이 열린다. */
  const 주문관리주소 = "/System/Sales/orderMst.aspx";

  const PAGES = [
    { name: "배송관리", url: "/System/Delivery/firmDvList.aspx" },
    { name: "단품관리", url: "/System/Master/goods.aspx" },
    { name: "상품관리", url: "/System/Master/salesGoods.aspx" },
    { name: "재고조회", url: "/System/Stock/StockList.aspx" },
    /* 11-02 [새 지시 구매입고메뉴] 「메인에 벤더피아 기능의 재고관리-입고관리의 구매입고 현재 페이지나 나타나는 구매입고 메뉴를 만들어줘」
       벤더피아 원래 메뉴 재고관리→입고관리→구매입고 = `GoUrl('System/Stock/POWList.aspx', 'menu1_10_004')` (실제 화면에서 확인).
       확장이 이 주소엔 글을 안 보내므로 벤더피아 화면 **그대로** 뜬다. */
    { name: "구매입고", url: "/System/Stock/POWList.aspx" },
    /* ⚠⚠ 10-16 사장님 (이 메뉴 화면을 짚어 보내신 말씀, 그대로): 「**cs등록 항목을 만들어줘**」
         (장부 a1792145842)
       속은 이미 있다 — 배송관리 줄마다 「상담」 단추로 여는 그 판(상담 이력 + 교환·반품·AS 접수).
       **그 판을 메뉴에서도 들어가게** 한다. 길은 배송관리와 같은 쪽이고, 뒤에 `#vgCS` 를 붙여
       그 화면이 **CS등록 판을 바로 열게** 한다(`search.js`).
       ⚠ 꼴은 다른 넷과 **같은 `vp-btn`** 하나다 — 두 벌로 만들지 않는다. */
    { name: "CS등록", url: (주문관리주소 || "/System/Delivery/firmDvList.aspx") + "#vgCS" },
    /* 11-07 [새 지시 CS정산] 「벤더메인 메뉴에 cs정산 메뉴를 만들어 …」 — 주문관리 쪽 + `#vgCal` → search.js 가 cs정산.js 를 부른다 */
    { name: "CS정산", url: "/System/Sales/orderMst.aspx#vgCal" },
    /* 11-16 [새 지시 하우저 메뉴] 「벤더피아 메인에 하우져 메뉴를 만들어서 클릭시 벤피아상품중  배송사가 하우저 인것의 상품들의 정보가 보이게 해줘」
       — 주문관리 쪽 + `#vgHau` → search.js 가 표를 세우고 하우저.js 가 상품관리(배송사 하우저)를 조회만 해 채운다 */
    { name: "하우저", url: "/System/Sales/orderMst.aspx#vgHau" },
  ];

  /* 11-25 [새 지시 지난작업보기] 사장님(그대로): 「메인에 작게 지난작업보기 버튼을 만들어 현재 비요크선불비변경을 그쪽으로 옮겨주세요. 해당 작업은 일회성 메뉴이기 때문에 차후 비슷한 작업이 발생했을때 꺼내 활용할 수 있어야 하니 이 메뉴의 기능이 무엇이고 어떤작업을 했는지 기록해 주세요.」
     일회성 메뉴는 여기에 한 줄 넣는다 → 메인 맨 아래 작은 「지난작업보기」 를 누르면 펼쳐지는 목록에 단추로 나온다(누르면 새 탭, PAGES 와 같음).
     무엇을 했는지 = `지난작업/<이름>.md` · 목록 = CLAUDE.md 「지난작업보기」. */
  const 지난작업 = [
    /* 11-25 [새 지시 비요크선불비변경] 「메인에 이파일을 목록화한 페이지 만들어줘 - 메뉴이름 비요크선불비변경」
       — 주문관리 쪽 + `#vgByk` → search.js 가 표를 세우고 비요크.js 가 올린 .xlsx 를 브라우저 안에서만 읽어 그린다.
       기록 `지난작업/비요크선불비변경.md` */
    { name: "비요크선불비변경", url: "/System/Sales/orderMst.aspx#vgByk" },
  ];

  /* 10-26 [새 지시 새창] 사장님: 「현재 페이지에서 어떤방식으로든 단품관리 상품관리등 링크를 타고 넘어갈때 화면 전환이 아닌 새페이지로 나타나게 해줘」
     → 메뉴 단추는 `target="_blank"` 로 **새 탭**에 연다 (이 메뉴 화면은 그대로 남는다). */

  // 로그인된 화면(원래 메뉴에 배송관리가 있는 화면)에서만 바꾼다
  const loggedIn = [...document.querySelectorAll("a")].some((a) => a.textContent.trim() === "배송관리");
  if (!loggedIn) return;

  const root = document.createElement("div");
  root.id = "vp-root";
  root.innerHTML = `
    <div class="box">
      <h1>벤더피아</h1>
      ${PAGES.map((p) => `<a class="vp-btn" href="${p.url}" target="_blank" rel="noopener">${p.name}</a>`).join("")}
      ${지난작업.length ? `<details class="vp-지난"><summary>지난작업보기</summary>
        ${지난작업.map((p) => `<a class="vp-지난btn" href="${p.url}" target="_blank" rel="noopener">${p.name}</a>`).join("")}
      </details>` : ""}
    </div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");

  // 로그인 뒤 메인 화면에서 각 메뉴가 쓰는 목록을 뒤에서 조용히 받아 둔다 (이미 받아 둔 것은 건너뛴다)
  VP_DATA.prefetch();
})();
