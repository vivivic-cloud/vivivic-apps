# 하위화면 > 이동관리 > StockMove — 재고이동등록

- 주소: `/System/Stock/StockMove.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 재고이동등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./StockMove.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 삭제 | `btnCancel` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 검사 「상태변경 내역의 저장될 행이 선택되지 않았습니다.」 |
| 엑셀다운로드 | `btnExcelDownload` | 내려받기 | 폼 제출(서버 처리) |
| 엑셀업로드 | `btnExcelUpload` | 이동 | → `StockMoveUpload.aspx` |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlWarehouse` | 출고창고 | 고르기 | 업무 자료 21개(적지 않음) |
| `ddlSupplier` | 구매사 | 고르기 | 업무 자료 107개(적지 않음) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 14개(보임 14) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: (체크)(CHK) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션(optionValue) · 단가(unitPrice) · 양품수량(stockQty) · 불량품(defectiveQty) · 회수수량(returnQty) · 출고예정(deliveryQty) · 이동수량(moveQty) · 재고상태(stockStatus) · 입고창고(wCd) · 메모(memo) · 즉시이동(moveYn)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- '이동수량'이 입력되지 않았습니다.
- '입고창고'가 입력되지 않았습니다.
- 상태변경 내역의 저장될 행이 선택되지 않았습니다.

## 연결되는 화면

- `StockMoveList.aspx`
- `StockMoveUpload.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellSelectionChanged` · `oGrid_Initialize`
