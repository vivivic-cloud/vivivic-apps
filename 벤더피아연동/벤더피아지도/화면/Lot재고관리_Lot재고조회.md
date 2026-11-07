# Lot재고관리 > Lot재고조회

- 주소: `/System/Stock/LotNoBarCodeStockList.aspx`
- 쪽 제목: VendorPia
- 화면 머리: Lot재고조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./LotNoBarCodeStockList.aspx` (application/x-www-form-urlencoded)
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
| `ddlWarehouse` | 창고 | 고르기 | 업무 자료 22개(적지 않음) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `tbOptionValue` | 옵션 | 글 |  |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 6개(보임 5) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: NO(RNUM) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션(optionValue) · 수량(QTY)

숨은 열: 단품일련번호(goodsNo)

### `dGrid` — Infragistics WebDataGrid · 열 7개(보임 7) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: NO(RNUM) · Lot번호(lotNo) · 일련번호(seqNo) · 바코드(barcode) · Lot송장번호(memo) · 창고명(warehouseNm) · 이력(historyLink)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `dGrid_clientState` · `hdgoodsNo` · `hdoptionValue` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `../Master/goodsLotBarcodeHistory.aspx?barcode=…`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`
- `oGrid_CellSelectionChanged`: 단추 누름 `btnLotDetailSearch`
- `dGrid_CellSelectionChanged`: 팝업주소 `../Master/goodsLotBarcodeHistory.aspx?barcode=`

그 밖: `fnClose` · `oGrid_HeaderCheckBoxClicked` · `oGrid_Editing_CellValueChanging` · `oGrid_CellEditing_EnteringEditMode`
