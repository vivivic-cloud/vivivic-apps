# 하위화면 > 메인 첫화면 > confirmOrder — 주문확정등록

- 주소: `/System/Sales/confirmOrder.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 주문확정등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./confirmOrder.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 저장 | `btnSave` | 쓰기 | 확인창 「▶체크된 주문 확정 하시겠습니까?」 · 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 이동 | JS만(제출 안 함) |
| 일괄등록 | `btnInsertList` | 이동 | → `../Upload/orderConfirmInsert.aspx` |
| 생산지시서 | `btnProductOrder` | 출력 | 검사 「출력할 목록을 선택해주세요!」 |
| 라벨송장 | `btnLabelInvoice` | 출력 | 검사 「출력할 목록을 선택해주세요!」 |
| Button (숨김) | `btnOption` | 화면만 | 폼 제출(서버 처리) |
| Button (숨김) | `btnWarehouse` | 화면만 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlCSType` | CS | 고르기 | 전체 · D=정상 · R=반품 · E=교환 · A=AS · I=설치 (기본 `전체`) |
| `tbSOrderNo` | 주문번호 | 글 |  |
| `ddlStoreGb` | 유형 | 고르기 | 업무 자료 3개(적지 않음) |
| `ddlStore` | 매출처 | 고르기 | 업무 자료 19개(적지 않음) |
| `ddlMall` | 몰 | 고르기 | 업무 자료 36개(적지 않음) |
| `tbOrderer` | 주문자 | 글 |  |
| `tbOrdererMobile` | 주문자폰 | 글 |  |
| `ddlDCo` | 배송사 | 고르기 | 업무 자료 17개(적지 않음) · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlDCo\` |
| `dcReceiptWishDt` | 배송희망일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcArrangedDt` | 예정일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbMessageBox` | 배송메세지 | 글 |  |
| `dcStartDt` | 등록일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `tbSupplier` |  | 글 |  |
| `tbRecipient` | 수취인 | 글 |  |
| `tbRecipientMobile` | 수취인폰 | 글 |  |
| `tbAddr` | 주소 | 글 |  |
| `tbSGoodsNm` | 상품명 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `tbOptionValue` | 옵션값 | 글 |  |
| `dcArrangedDt1` | 예정일 | 날짜 | 이벤트 change,focus,keydown,keypress,keyup |
| `ddlSort` | 정렬 | 고르기 | orderNo1=주문번호순▲ · orderNo2=주문번호역순▼ · registDt1=등록일▲ · registDt2=등록일▼ · arrangedDt1=배송예정일▲ · arrangedDt2=배송예정일▼ · deliveryCoCd=배송사 · orderer=주문자 · recipient=수취인 · addr=주소 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlSort` (기본 `addr`) |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 100 · 200 · 300 · 500 · 700 · 800 · 900 · 1000 · 1500 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlRowC` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 49개(보임 30) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · CS(csYn) · 매출처명(storeNm) · 권장판매가(salesAmt) · 실판매가(dcSalesAmt) · 제품비(sGoodsAmt) · 선불비(deliveryCost) · 착불비(postPayment) · 등록일(registDt) · 지정일(receiptWishDt) · 예정일(arrangedDt) · 수취인(recipient) · 수취인전화(recipientTel) · 수취인휴대폰(recipientMobile) · (체크)(deliveryCoCd) · 주소(addr1) · 배송메세지(deliveryMsg) · 보내는메시지(sendMsg) · 상품명(sGoodsNm) · 옵션(salesOption) · 본사메모(memo2) · (체크)(supplierCd) · 단품명(goodsNm) · 옵션(optionValue) · 수량(usableQty) · 박스수(boxQty) · 창고(warehouseCd) · 자사재고(stockType) · 매입가(unitPrice) · 배송번호(invoiceNo)

숨은 열: 주문순번(orderSeq) · orderNo · 매출처코드(storeCd) · 매출처상품명(storeGoodsNm) · 단품코드(goodsCd) · 주문최대(maxSeq) · 창고(warehouse) · 바코드(barcode) · 바코드(storeGoodsCd) · 바코드(shopGoodsCd) · 바코드(orderer) · 바코드(addr2) · 바코드(deliveryCostGb) · 바코드(bundleYn) · 우편번호(zip) · 바코드(status) · 바코드(mediaGb) · LastTimeStamp · 박스수량변경(ChangeboxQty)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hdwarehouseValue` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 확인창: ▶체크된 주문 확정 하시겠습니까?
- 출력할 목록을 선택해주세요!
- 종료일을 먼저 선택하세요.
- 현재 주문서는 수정되었습니다.  다시 조회 후 시도해 주십시오.
- 옵션 저장에 실패했습니다. 다시 조회 후 시도해 주세요.
- 옵션 저장 중입니다. 잠시 후 다시 눌러 주세요.
- 현재 주문서는 수정되었습니다  다시[조회] 후[주문확정]해 주세요.다시 조회 후 시도해 주십시오.
- 옵션이 선택되지 않은 주문건이 있습니다. 옵션값을 확인해 주세요.

## 연결되는 화면

- `firmOrdersList.aspx`
- `../Upload/orderConfirmInsert.aspx`
- `../WebServiceUpdateCheck.asmx`
- `WebSvcOrderOption.asmx`
- `../WebSvcOrderOption.asmx`
- `../WebSvcStock.asmx`

## 쪽 안 함수

- `fnCheckLastTimeStamp`: ajax `../WebServiceUpdateCheck.asmx/CheckUpdateTime`
- `saveOptionStock`: ajax `../WebSvcOrderOption.asmx/SaveOptionStock`
- `oGrid_Editing_CellValueChanging`: ajax `../WebSvcStock.asmx/GetWarehouseStockQty` · 단추 누름 `btnWarehouse`

그 밖: `ddlProviderDeliveryCoCd_SelectionChanged` · `ddlProviderSupplier_SelectionChanged` · `oGrid_CellSelectionChanged` · `oGrid_CellEditing_EnteredEditMode` · `oGrid_CellEditing_EnteringEditMode` · `oGrid_keyDown` · `oGrid_key_up` · `ddlwarehouseProvider_SelectionChanged` · `isStockVendor` · `ddlOption_SelectionChanged` · `cellText` · `setCellText` · `applyOptionStock` · `evalChkRow` · `bad` · `groupBad` · `oGrid_Initialize` · `doubleSubmitCheck` · `fnSave`
