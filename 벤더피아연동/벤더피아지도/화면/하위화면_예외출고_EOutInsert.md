# 하위화면 > 예외출고 > EOutInsert — 예외출고등록

- 주소: `/System/Stock/EOutInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 예외출고등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./EOutInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 이동 | → `EOutList.aspx` |
| 저장 | `btnSave` | 쓰기 | 검사 「예외출고일을 지정해 주십시오.」 · 검사 「출고수량을 입력해 주십시오.」 · 폼 제출(서버 처리) |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSupplier` | 구매사 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlWarehouse` | 출고창고 | 고르기 | 업무 자료 22개(적지 않음) |
| `ddlStatus` | 판매상태 | 고르기 | 전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `dcEOUTDt` | 예외출고일 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 18개(보임 17) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 창고명(wNm) · 매입처코드(supplierCd) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션값(optionValue) · 단가(totUnitPrice) · 양품수량(stockQty) · 불량품수량(defectiveQty) · 회수수량(returnQty) · 출고예정(deliveryQty) · 출고수량(takeOutQty) · 재고상태(stockStatus) · 수취인(recipient) · 배송사(deliveryCoCd) · 송장번호(invoiceNo) · 비고(memo)

숨은 열: 출고창고코드(warehouseCd)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 예외출고일을 지정해 주십시오.
- 출고수량을 입력해 주십시오.

## 연결되는 화면

- `EOutList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellSelectionChanged`
