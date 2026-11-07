# 하위화면 > 메인 첫화면 > confirmDv — 송장등록

- 주소: `/System/Delivery/confirmDv.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 송장등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./confirmDv.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 배송출발 | `btnSave` | 쓰기 | 검사 「저장전 선택된 내용이 없습니다.」 |
| 취소 | `btnCancel` | 이동 | JS만(제출 안 함) |
| 일괄등록 | `btnInsertList` | 이동 | → `invoiceInsert.aspx` |
| 배송준비중 | `btnStatus2` | 미확인 | 검사 「선택된 목록이 존재하지 않습니다.」 |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 매출처 | 고르기 | 업무 자료 19개(적지 않음) |
| `tbSOrderNo` | 주문번호 | 글 |  |
| `ddlDeliveryCo` | 배송사 | 고르기 | 업무 자료 17개(적지 않음) · onchange: `$('#btnSearch').click();` |
| `ddlStockType` | 재고유형 | 고르기 | 전체 · 1=자사 · 0=타사 · onchange: `$('#btnSearch').click();` (기본 `전체`) |
| `ddlDStatus` | 배송상태 | 고르기 | 전체 · 1=배송지시 · 2=배송준비중 · 5=물류입고 · 6=지사출발 · 7=지사도착 · onchange: `$('#btnSearch').click();` (기본 `전체`) |
| `tbLoc1` | 권역 | 글 |  |
| `tbLoc2` | 권역 | 글 |  |
| `tbLoc3` | 권역 | 글 |  |
| `tbLoc4` | 권역 | 글 |  |
| `tbLoc5` | 권역 | 글 |  |
| `tbMemo` | 배송메모 | 글 |  |
| `tbMemo2` | 본사메모 | 글 |  |
| `dcStartDt` | 확정일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `tbSupplierNm` |  | 글 |  |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `tbOrderer` | 주문자 | 글 |  |
| `tbRecipient` | 수취인 | 글 |  |
| `dcRWishDt` | 지정일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcArrangedDt` | 배송예정일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 50 · 100 · 200 · 300 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `50`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 39개(보임 26) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · CS(csYn) · 매출처(storeNm) · 주문번호(storeOrderNo) · 확정일(orderConfirmDt) · 상품명(sGoodsNm) · 주문자(orderer) · 수취인(recipient) · 주소(addr) · 전화(tel) · 휴대폰(mobile) · (체크)(deliveryCoCd) · 송장번호(invoiceNo) · 송장등록일(accRegDt) · 배송메시지(deliveryMsg) · 배송메모(memo) · 본사메모(memo2) · 선불비(deliveryCost) · 착불비(postPayment) · 배송상태(status) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션값(optionValue) · 창고(warehouseCd) · 창고(warehouse) · 수량(qty)

숨은 열: 배송번호(deliveryNo) · 우편번호(zip) · 수정자(codiNm) · 권역(locCd) · 유형(deliveryType) · 가배송(fakeDeliveryYn) · 순번(maxSeq) · 주문번호(orderNo) · 주문순번(orderSeq) · 매입처(supplierNm) · 재고(stockType) · 배송희망일(receiptWishDt) · 재고유무(stockYn)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 저장전 선택된 내용이 없습니다.
- 선택된 목록이 존재하지 않습니다.

## 연결되는 화면

- `firmDvList.aspx`
- `invoiceInsert.aspx`
- `invoiceInsert2.aspx`

## 쪽 안 함수


그 밖: `preventDoubleClick` · `oGrid_CellEditing_EnteringEditMode` · `ddlProviderDeliveryCoCd_SelectionChanged` · `oGrid_Initialize` · `confirmDv_OnSaveCompleted`
