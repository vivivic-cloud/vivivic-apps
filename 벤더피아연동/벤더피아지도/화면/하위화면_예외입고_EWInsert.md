# 하위화면 > 예외입고 > EWInsert — 예외입고등록

- 주소: `/System/Stock/EWInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 예외입고등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./EWInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 삭제 | `btnCancel` | 이동 | → `POReturnOutList.aspx` |
| 저장 | `btnSave` | 쓰기 | 검사 「입고창고를 선택해 주십시오.」 · 검사 「예외입고일을 지정해 주십시오.」 |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlCategory` | 분류 | 고르기 | 업무 자료 9개(적지 않음) |
| `ddlWarehouse` | 창고 | 고르기 | 업무 자료 22개(적지 않음) |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlStatus` | 판매상태 | 고르기 | 전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `dcEWDt` | 예외입고일 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 16개(보임 14) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 매입처코드(supplierCd) · 창고명(wNm) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션값(optionValue) · 판매상태(salesStatusNm) · 입고단가(purchaseAmt) · 재고수량(stockQty) · 입고수량(EWQty) · 재고상태(stockStatus) · 배송사(deliveryCoCd) · 송장번호(invoiceNo) · 비고(memo)

숨은 열: 창고코드(warehouseCd) · 창고사용여부(useYn)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 입고창고를 선택해 주십시오.
- 예외입고일을 지정해 주십시오.
- '입고수량'이 입력되지 않았습니다.
- 상태변경 내역의 저장될 행이 선택되지 않았습니다.
- 판매상태가 [중지]인 단품은 입고할 수 없습니다.  단품코드 :

## 연결되는 화면

- `POReturnOutList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellSelectionChanged`
