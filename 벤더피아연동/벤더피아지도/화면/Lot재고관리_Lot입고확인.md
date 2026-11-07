# Lot재고관리 > Lot입고확인

- 주소: `/System/Stock/LotNoCheckingList.aspx`
- 쪽 제목: VendorPia
- 화면 머리: Lot입고확인
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./LotNoCheckingList.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| Button (숨김) | `btnLotDetailSearch` | 화면만 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `dcStartDt` | 생성일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `txtInvoiceNo` | 송장번호 | 글 |  |
| `ddlStatus` | 상태 | 고르기 | 전체 · 진행중 · 완료 (기본 `전체`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 4개(보임 4) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: Lot송장번호(memo) · 수량<br/>(생성)(totalQty) · 수량<br/>(입고)(inQty) · 상태(status)

### `dGrid` — Infragistics WebDataGrid · 열 10개(보임 8) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: NO(RNUM) · 송장번호(memo) · 단품명(goodsNm) · 옵션(optionValue) · 수량<br/>(생성)(totalQty) · 수량<br/>(입고)(inQty) · 상태(status) · 이동(Link)

숨은 열: 생성일(regDt) · 단품No(goodsNo)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `dGrid_clientState` · `hdMemo` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `../Master/goodsLotPopup.aspx?vendorCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: 단추 누름 `btnLotDetailSearch`
- `dGrid_CellSelectionChanged`: 팝업주소 `../Master/goodsLotPopup.aspx?vendorCd=`

그 밖: `fnClose` · `oGrid_HeaderCheckBoxClicked` · `oGrid_Editing_CellValueChanging` · `oGrid_CellEditing_EnteringEditMode`
