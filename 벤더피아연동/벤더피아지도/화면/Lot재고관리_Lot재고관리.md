# Lot재고관리 > Lot재고관리

- 주소: `/System/Stock/LotNoBarCodeHome.aspx`
- 쪽 제목: VendorPia
- 화면 머리: Lot재고관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./LotNoBarCodeHome.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 입고(QR) | `btnStockInQR` | 이동 | → `LotNoBarCodeStockIn.aspx?ScanMode=QR&ActionType=STOCKIN` |
| 입고(바코드) | `btnStockInBarcode` | 이동 | → `LotNoBarCodeStockIn.aspx?ScanMode=BARCODE&ActionType=STOCKIN` |
| 출고(QR) | `btnStockOut` | 이동 | → `LotNoBarCodeStockOut.aspx?ScanMode=QR&ActionType=STOCKOUT` |
| 출고(바코드) | `btnStockOutBarcode` | 이동 | → `LotNoBarCodeStockOut.aspx?ScanMode=BARCODE&ActionType=STOCKOUT` |
| 창고이동(QR) | `btnStockMove` | 이동 | → `LotNoBarCodeStockMove.aspx?ScanMode=QR&ActionType=STOCKMOVE` |
| 창고이동(바코드) | `btnStockMoveBarcode` | 이동 | → `LotNoBarCodeStockMove.aspx?ScanMode=BARCODE&ActionType=STOCKMOVE` |
| 피킹(QR) | `btnPicking` | 이동 | → `LotNoBarCodePicking.aspx?ScanMode=QR` |
| 피킹(바코드) | `btnPickingBarcode` | 이동 | → `LotNoBarCodePicking.aspx?ScanMode=BARCODE` |
| 배송장확인(QR) | `btnInvoiceStockOut` | 이동 | → `LotNoBarCodeStockOutInvoice.aspx?ScanMode=QR&ActionType=INVOICEOUT` |
| 배송장확인(바코드) | `btnInvoiceStockOutBarcode` | 이동 | → `LotNoBarCodeStockOutInvoice.aspx?ScanMode=BARCODE&ActionType=INVOICEOUT` |
| 도착확인(QR) | `btnStockLocationIn` | 이동 | → `LotNoBarCodeStockLocation.aspx?ScanMode=QR&ActionType=STOCKLOCATIONIN` |
| 도착확인(바코드) | `btnStockLocationBarcodeIn` | 이동 | → `LotNoBarCodeStockLocation.aspx?ScanMode=BARCODE&ActionType=STOCKLOCATIONIN` |
| 출발확인(QR) | `btnStockLocationOut` | 이동 | → `LotNoBarCodeStockLocation.aspx?ScanMode=QR&ActionType=STOCKLOCATIONOUT` |
| 출발확인(바코드) | `btnStockLocationBarcodeOut` | 이동 | → `LotNoBarCodeStockLocation.aspx?ScanMode=BARCODE&ActionType=STOCKLOCATIONOUT` |
| 재고확인(QR) | `btnStockCheck` | 이동 | → `LotNoBarCodeStockCheck.aspx?ScanMode=QR` |
| 재고확인(바코드) | `btnStockCheckBarcode` | 이동 | → `LotNoBarCodeStockCheck.aspx?ScanMode=BARCODE` |
| 전수조사(QR) | `btnStockInspection` | 미확인 | → `StockInspectionForUser.aspx?ScanMode=QR` |
| 전수조사(바코드) | `btnStockInspectionBarcode` | 미확인 | → `StockInspectionForUser.aspx?ScanMode=BARCODE` |

## 숨은 값 (이름만)

`hdKey` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 준비중입니다.

## 연결되는 화면

- `LotNoBarCodeStockIn.aspx?ScanMode=QR&ActionType=STOCKIN`
- `LotNoBarCodeStockIn.aspx?ScanMode=BARCODE&ActionType=STOCKIN`
- `LotNoBarCodeStockOut.aspx?ScanMode=QR&ActionType=STOCKOUT`
- `LotNoBarCodeStockOut.aspx?ScanMode=BARCODE&ActionType=STOCKOUT`
- `LotNoBarCodePicking.aspx?ScanMode=QR`
- `LotNoBarCodePicking.aspx?ScanMode=BARCODE`
- `LotNoBarCodeStockOutInvoice.aspx?ScanMode=QR&ActionType=INVOICEOUT`
- `LotNoBarCodeStockOutInvoice.aspx?ScanMode=BARCODE&ActionType=INVOICEOUT`
- `LotNoBarCodeSave.aspx?gubun=Return`
- `LotNoBarCodeStockMove.aspx?ScanMode=QR&ActionType=STOCKMOVE`
- `LotNoBarCodeStockMove.aspx?ScanMode=BARCODE&ActionType=STOCKMOVE`
- `LotNoBarCodeStockLocation.aspx?ScanMode=QR&ActionType=STOCKLOCATIONIN`
- `LotNoBarCodeStockLocation.aspx?ScanMode=BARCODE&ActionType=STOCKLOCATIONIN`
- `LotNoBarCodeStockLocation.aspx?ScanMode=QR&ActionType=STOCKLOCATIONOUT`
- `LotNoBarCodeStockLocation.aspx?ScanMode=BARCODE&ActionType=STOCKLOCATIONOUT`
- `LotNoBarCodeStockCheck.aspx?ScanMode=QR`
- `LotNoBarCodeStockCheck.aspx?ScanMode=BARCODE`
- `StockInspectionForUser.aspx?ScanMode=QR`
- `StockInspectionForUser.aspx?ScanMode=BARCODE`

## 쪽 안 함수


그 밖: `goBarcode`
