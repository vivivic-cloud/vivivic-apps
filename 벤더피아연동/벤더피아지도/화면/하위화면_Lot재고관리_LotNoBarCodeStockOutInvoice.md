# 하위화면 > Lot재고관리 > LotNoBarCodeStockOutInvoice — [BARCODE] 배송장확인

- 주소: `/System/Stock/LotNoBarCodeStockOutInvoice.aspx?ScanMode=BARCODE&ActionType=INVOICEOUT`
- 쪽 제목: VendorPia
- 화면 머리: [BARCODE] 배송장확인
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./LotNoBarCodeStockOutInvoice.aspx?ScanMode=BARCODE&ActionType=INVOICEOUT` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 초기화 (숨김) | `btnSearchInvoice` | 조회 | 폼 제출(서버 처리) |
| 저장 | `btnSave` | 쓰기 | 검사 「입력된 출고자재 목록이 존재하지 않습니다.」 |
| 초기화 | `btnClear` | 이동 | → `LotNoBarCodeStockOutInvoice.aspx?ScanMode=BARCODE&ActionType=INVOICEOUT` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbInvoiceNo` | 🎥 카메라접근권한을 허용해주십시오. | 글 | 안내글 송장번호 · onkeydown: `fnInvoice(event);` · 이벤트 focus |
| `tbBarCode` | 🎥 카메라접근권한을 허용해주십시오. | 글 | 최대 13 · 안내글 LotNo barcode · onkeypress: `return fnBarCodeAdd();` |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 11개(보임 7) · 불러온 줄 있음: 아니오
- 기능: editingCore, events

보이는 열: NO(RNUM) · 단품명(옵션명)(goodsNm) · 수량(qty) · BarCode(barcode) · 창고명(warehouseNm) · 상태(status) · 선입(firshInCnt)

숨은 열: 단품코드(goodsCd) · 단품명(옵션명)(optionValue) · 주문번호(orderNo) · 주문번호_일련번호(orderSeq)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hdScanMode` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 입력된 출고자재 목록이 존재하지 않습니다.
- code =

## 연결되는 화면

- `LotNoBarCodeHome.aspx`
- `../WebSvcLotBarcode.asmx`

## 쪽 안 함수

- `fnInvoice`: 단추 누름 `btnSearchInvoice`
- `fnBarCodeCheck`: ajax `../WebSvcLotBarcode.asmx/LotBarcodeCheck`

그 밖: `drawLine` · `tick` · `oGrid_AJAXResponse` · `SetRowCount` · `fnBarcodeFocus` · `fnBarCodeAdd` · `resetInputField`
