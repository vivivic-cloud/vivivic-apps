# 하위화면 > CS등록 > ordersPopup(주문 찾기 팝업) — 주문목록 조회

- 주소: `/System/CS/ordersPopup.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 주문목록 조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./ordersPopup.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 검사 「시작일과 종료일을 모두 선택해 주세요.」 · 검사 「1년 이상 값을 조회할 수 없습니다」 |
| (그림 btnMinusYear.png) | `btnMinusYear` | 미확인 | 검사 「종료일을 먼저 선택하세요.」 |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 매출처 | 고르기 | 업무 자료 19개(적지 않음) |
| `tb_SOrderNo` | 주문번호 | 글 |  |
| `tb_SGoodsNm` | 상품명 | 글 |  |
| `tb_Orderer` | 주문자 | 글 |  |
| `tb_OrdererTel` | 주문자전화 | 글 |  |
| `tb_OrdererMobile` | 주문자폰 | 글 |  |
| `tbMemo` | 메모 | 글 |  |
| `ddlMall` | 몰 | 고르기 | 업무 자료 36개(적지 않음) |
| `dcStartDt` | 등록일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlDeliveryCo` | 배송사 | 고르기 | 업무 자료 17개(적지 않음) |
| `tb_Recipient` | 수취인 | 글 |  |
| `tb_RTel` | 수취인전화 | 글 |  |
| `tb_RMobile` | 수취인폰 | 글 |  |
| `tb_Addr` | 주소 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 24 · 50 · 100 · 500 · onchange: `$('#btnSearch').click();` (기본 `24`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 39개(보임 24) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CS(csYn) · 매출처(storeNm) · 몰(mall) · 주문번호(storeOrderNo) · 배송사(deliveryCoCd) · 매출처주문일(storeOrderDt) · 등록일(registDt) · 송장등록일(accRegDt) · 배송완료일(deliveryEndDt) · 배송상태(dStatus) · 상품코드(storeGoodsCd) · 상품명(salesGoodsNm) · 옵션(salesOption) · 수(salesQty) · 가용수(csUsableQty) · 선불비(deliveryCost) · 착불비(postPayment) · 주문자(orderer) · 수취인(recipient) · 수취인전화(recipientTel) · 수취인휴대폰(recipientMobile) · 주소(addr) · 메모(memo) · 메모2(memo2)

숨은 열: 주문번호(orderNo) · storeGoodsNm · orderConfirmDt · salesAmt · supplyAmt · status · deliveryCostGb · receiptWishDt · deliveryMsg · sendMsg · invoiceNo · arrangedDt · deliveryDt · codiNm · blackConsumerYn


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 시작일과 종료일을 모두 선택해 주세요.
- 1년 이상 값을 조회할 수 없습니다
- 종료일을 먼저 선택하세요.

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `oGrid_CellSelectionChanged`
