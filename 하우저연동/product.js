/* 하우저 상품 조회(/product/home) — 상품명이 첫 칸인 표 + 등록기간 + 검색창 + 상세 창. 읽기만. 칸은 실제 화면(113건)에서 본 것만. */
const 등록 = new URLSearchParams(location.search).get("hw") === "reg";   // 메뉴 「등록상품보기」 로 열었을 때 (같은 목록·같은 읽기)
const 지금 = () => { const d = new Date(), z = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "." + z(d.getMonth() + 1) + "." + z(d.getDate()) + " " + z(d.getHours()) + ":" + z(d.getMinutes()); };
/* 구성품명 = 상품 상세 JSON(/api/product/v1/groups/<그룹>/products/<줄 value>)의 relateds[].product.name. 표 줄의 value 가 그 상세 번호. 읽기(GET)만. */
let 그룹 = null;
const 그룹찾기 = async () => {
  if (그룹) return 그룹;
  const 나 = (await (await fetch("/api/account/v1/users/me", { credentials: "include" })).json()).data;
  const 목 = (await (await fetch("/api/account/v1/users/" + (나.srl || 나.userSrl) + "/groups", { credentials: "include" })).json()).data;
  const 줄 = Array.isArray(목) ? 목 : Object.values(목 || {}).find(Array.isArray) || [];
  그룹 = 줄[0] && 줄[0].id; return 그룹;
};
const 구성품명 = async (r) => {
  const g = await 그룹찾기(); if (!g) return "";
  const j = (await (await fetch("/api/product/v1/groups/" + g + "/products/" + encodeURIComponent(r._값), { credentials: "include" })).json()).data;
  return ((j && j.relateds) || []).map((x) => x.product && x.product.name).filter(Boolean).join(" · ");
};
HW표.열기({
  보태기: 구성품명,
  제목: 등록 ? "하우저 등록상품보기" : "하우저 상품 조회",
  표선택: "table.tbl_global",
  첫칸: "상품명",
  칸순서: ["하우저 상품번호", "시공유형", "상품등록 상태", "가구사 상품코드", "브랜드", "등록일"],
  숫자칸: [],
  검색칸: ["상품명", "하우저 상품번호", "가구사 상품코드", "브랜드"],
  검색문구: "상품명·번호·브랜드 검색",
  기간칸: "등록일",
  알약칸: "상품등록 상태",
  단위: 등록 ? "등록상품" : "상품", 합계칸: [],
  기준: () => 등록 ? "가져온 때 " + 지금() + " (하우저 상품 조회 목록 전 쪽)" : "",
});
