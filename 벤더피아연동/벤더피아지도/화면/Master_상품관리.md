# Master > 상품관리

- 주소: `/System/Master/salesGoods.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 상품목록조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./salesGoods.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 이동 | → `salesGoodsDetl.aspx` |
| 일괄등록 | `btnUpload` | 이동 | → `../Upload/sRowInsert.aspx` |
| 일괄복사 | `btnCopyList` | 이동 | → `salesGoodsCopy.aspx` |
| 가격등록 | `btnAmtInsert` | 이동 | → `../Upload/sGoodsAmtInsert.aspx` |
| 삭제 | `btnDelete` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |
| 상품변경 | `btnChangeGoods` | 이동 | → `../Upload/changeGoods.aspx` |
| 상태변경 | `btnChangeStatus` | 쓰기 | 확인창 「저장하시겠습니까?」 · 검사 「상태변경할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |
| 배송사일괄변경 | `btnUpdateDCo` | 이동 | → `dCoUpdate.aspx` |
| 선불/착불 | `btnDCostGb` | 쓰기 | 확인창 「저장하시겠습니까?」 · 검사 「선불/착불 변경할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 매출처 | 고르기 | 업무 자료 19개(적지 않음) |
| `tbSGoodsCd` | 상품코드 | 글 |  |
| `tbSGoodsNm` | 상품명 | 글 |  |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `tbSupplierNm` |  | 글 |  |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `tbModelNo` | 바코드 | 글 |  |
| `ddlStatus` | 판매상태 | 고르기 | 전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `ddlUser` | 판매담당 | 고르기 | 업무 자료 46개(적지 않음) |
| `dcStartDt` | 등록기간 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlDCo` | 배송사 | 고르기 | 업무 자료 17개(적지 않음) |
| `cbOptionGoodsYn` | 옵션상품여부 | 체크 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 27 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `27`) |
| `ddlDCostGb` | 총 4415건 | 고르기 | 업무 자료 3개(적지 않음) |
| `ddlToStatus` | 총 4415건 | 고르기 | 1=판매중 · 2=중지 · 3=품절 (기본 `2`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 34개(보임 30) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 매출처명(storeNm) · 상품코드(storeGoodsCd) · 상품명(salesGoodsNm) · 배송사명(deliveryCoNm) · 매입처명(supplierNm) · 단품코드(goodsCd) · 단품명(goodsNm) · 판매금액(salesUnitAmt) · 공급금액(supplyUnitAmt) · 매입금액(purchaseAmt) · 매출이익(fee) · 선착불(deliveryCostGb) · 수도선불비(deliveryCost) · 수도착불비(postPayment) · 수도외곽선불비(deliveryCost2) · 수도외곽착불비(postPayment2) · 지방선불비(countryDCost) · 지방착불비(countryPostPay) · 지방외곽선불비(countryDCost2) · 지방외곽착불비(countryPostPay2) · 제주선불비(jejuCost) · 제주착불비(jejuPostPay) · 조립설치비(installAmt) · 유리비(glassAmt) · 제품비(sGoodsAmt) · 상품메모(memo) · 판매상태(salesStatusNm) · 등록일(regDt) · 수정일(editDt)

숨은 열: 매출처코드(storeCd) · 매출처상품명(storeGoodsNm) · 모델번호(modelNo) · 옵션상품유무(optionGoodsYn)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 상태변경할 목록을 선택해 주십시오.
- 확인창: 저장하시겠습니까?
- 선불/착불 변경할 목록을 선택해 주십시오.
- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `salesGoodsDetl.aspx`
- `../Upload/sRowInsert.aspx`
- `salesGoodsCopy.aspx`
- `../Upload/sGoodsAmtInsert.aspx`
- `../Upload/changeGoods.aspx`
- `dCoUpdate.aspx`
- `salesGoodsDetl.aspx?sGoodsCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `salesGoodsDetl.aspx?sGoodsCd=`
