# 하위화면 > 구매발주목록 > POInsert — 구매발주등록

- 주소: `/System/Purchase/POInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 구매발주등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./POInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSave` | 조회 | 검사 「구매입고 내역의 저장될 행이 선택되지 않았습니다.」 · 검사 「PO명이 입력되지 않았습니다.」 |
| 취소 | `btnCancel` | 이동 | → `POList.aspx` |
| 행추가 | `btnDAdd` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnDDel` | 화면만 | 검사 「삭제할 행이 선택되지 않았습니다.」 |
| 서버단에서 처리 (숨김) | `btnRowAdd` | 쓰기 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbPONm` |  | 글 |  |
| `ddlSupplier` |  | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlWarehouse` |  | 고르기 | 업무 자료 22개(적지 않음) |
| `dcPODt` |  | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcWarehousingDt` |  | 날짜 | 이벤트 focus,keydown,keypress,keyup |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 10개(보임 8) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: (체크)(CHK) · 단품코드(goodsCd) · cellBtn · 단품명(goodsNm) · 옵션(optionValue) · 구매단가(POPrice) · 구매수량(POQty) · 구매금액(POAmt)

숨은 열: 순번(seq) · 옵션Count(optionCnt)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hdValue` · `hdTable` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.
- 삭제할 행이 선택되지 않았습니다.
- 구매입고 내역의 저장될 행이 선택되지 않았습니다.
- PO명이 입력되지 않았습니다.
- 입고창고가 선택되지 않았습니다.
- 구매사명이 선택되지 않았습니다.
- 구매발주일이 입력되지 않았습니다.
- 납기일이 입력되지 않았습니다.
- 구매사명을 선택 후 다시 시도해 주십시오.

## 연결되는 화면

- `POList.aspx`
- `POPopup.aspx?`
- `goodsAllPopup.aspx?vendorCd=…`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearchPOList`
- `fnPopupAll`: 팝업주소 `goodsAllPopup.aspx?vendorCd=`
- `getReturnArrayValue`: 단추 누름 `btnRowAdd`

그 밖: `oGrid_CellSelectionChanged` · `oGrid_CellEditing_ExitedEditMode` · `fnDeleteRow` · `oGrid_Editing_CellValueChanging` · `DropDownOpening` · `oGrid_CellEditing_EnteredEditMode` · `oGrid_RowDeleted`
