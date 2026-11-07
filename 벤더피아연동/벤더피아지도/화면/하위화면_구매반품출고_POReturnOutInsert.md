# 하위화면 > 구매반품출고 > POReturnOutInsert — 구매반품출고등록

- 주소: `/System/Stock/POReturnOutInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 구매반품출고등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./POReturnOutInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 삭제 | `btnCancel` | 이동 | → `POReturnOutList.aspx` |
| 저장 | `btnSave` | 쓰기 | 검사 「구매반품출고일을 지정해 주십시오.」 · 검사 「상태변경 내역의 저장될 행이 선택되지 않았습니다.」 |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbPONo` | 구매발주번호 | 글 |  |
| `ddlSupplier` | 구매사 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlWarehouse` | 출고창고 | 고르기 | 업무 자료 21개(적지 않음) |
| `dcStartDt` | 구매발주일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEOUTDt` | 구매반품출고일 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 17개(보임 12) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: (체크)(CHK) · PO번호(PONo) · 구매사(supplierNm) · 발주일(PODt) · 입고일(warehousingDt) · 입고창고(warehouseNm) · 단품명(goodsNm) · 옵션값(optionValue) · 반품수량(returnQty) · 출고수량(outQty) · 출고창고(outWCd) · 메모(memo)

숨은 열: 순번(seq) · PO명(PONm) · 구매사코드(supplierCd) · 단품코드(goodsCd) · 금액(purchasePrice)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 구매반품출고일을 지정해 주십시오.
- '출고수량'이 입력되지 않았습니다.
- '출고창고'가 입력되지 않았습니다.
- 상태변경 내역의 저장될 행이 선택되지 않았습니다.

## 연결되는 화면

- `POReturnOutList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellSelectionChanged` · `oGrid_Initialize`
