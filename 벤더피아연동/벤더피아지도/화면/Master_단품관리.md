# Master > 단품관리

- 주소: `/System/Master/goods.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품목록조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goods.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 단품분류 | `btnPost` | 미확인 | `fnCategory(); return false;` · JS만(제출 안 함) |
| 등록 | `btnInsert` | 이동 | → `goodsDetl.aspx` |
| 일괄등록 | `btnUpload` | 이동 | → `../Upload/gRowInsert.aspx` |
| 단품 일괄수정 | `btnAmtInsert` | 이동 | → `../Upload/goodsAmtInsert.aspx` |
| 삭제 | `btnDelete` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |
| 상태변경 | `btnChangeStatus` | 쓰기 | 확인창 「선택한 단품을 」 · 검사 「상태변경할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `tbSupplierNm` |  | 글 |  |
| `tbCategoryNm` | 단품분류 | 글 | 이벤트 blur |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `tbModelNo` | 바코드 | 글 |  |
| `ddlStockYn` | 재고유형 | 고르기 | 전체 · 1=자사 · 0=타사 (기본 `전체`) |
| `ddlOrderingType` | 발주유형 | 고르기 | 전체 · 1=구매발주 · 0=생산발주 (기본 `전체`) |
| `ddlStatus` | 판매상태 | 고르기 | 전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `전체`) |
| `dcStartDt` | 등록기간 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbFrPurchaseAmt` | 매입단가 | number |  |
| `tbToPurchaseAmt` | ~ | number |  |
| `cbAddGoddsYn` |  | 체크 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 27 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `27`) |
| `ddlToStatus` | 총 4131건 | 고르기 | 1=판매중 · 2=중지 · 3=품절 (기본 `2`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 30개(보임 21) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 매입처명(supplierNm) · 창고(warehouseNm) · 단품분류(categoryNm) · 바코드(modelNo) · 단품코드(goodsCd) · 단품명(goodsNm) · 박스수(boxQty) · 매장판매단가(salesPrice) · 수수료(fee) · 자재원가(itemPrice) · 자재비용(itemCost) · 매입단가(purchaseAmt) · 재고유형(stockType) · 발주유형(orderingType) · 판매상태(salesStatus) · 생산셀명(cellNm) · 포장박스코드(boxCd) · 총재고수량(totStockQty) · 등록일(regDt) · 옵션(OValues)

숨은 열: Page(page) · 수도권선불비(deliveryCost) · 수도착불비(postPayment) · 수도외곽선불비(deliveryCost2) · 수도외곽착불비(postPayment2) · 지방선불비(countryDCost) · 지방착불비(countryPostPay) · 지방외곽선불비(countryDCost2) · 지방외곽착불비(countryPostPay2)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `tbCategoryCd` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 저장할 목록을 선택해 주십시오.
- 확인창: 저장하시겠습니까?
- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?
- 상태변경할 목록을 선택해 주십시오.
- 확인창: 선택한 단품을 
- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `goodsDetl.aspx`
- `../Upload/gRowInsert.aspx`
- `../Upload/goodsAmtInsert.aspx`
- `goodsDetl.aspx?goodsCd=…`
- `categoryPopup.aspx`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `goodsDetl.aspx?goodsCd=`
- `fnCategory`: 팝업주소 `categoryPopup.aspx`

그 밖: `oGrid_Sorting` · `getReturnValue`
