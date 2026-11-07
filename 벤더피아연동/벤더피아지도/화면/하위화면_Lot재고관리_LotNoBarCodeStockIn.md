# 하위화면 > Lot재고관리 > LotNoBarCodeStockIn — [BARCODE] 단품LotNo 입고처리

- 주소: `/System/Stock/LotNoBarCodeStockIn.aspx?ScanMode=BARCODE&ActionType=STOCKIN`
- 쪽 제목: VendorPia
- 화면 머리: [BARCODE] 단품LotNo 입고처리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./LotNoBarCodeStockIn.aspx?ScanMode=BARCODE&ActionType=STOCKIN` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 검사 「입고창고를 선택해 주십시오.」 · 검사 「입력된 입고자재 목록이 존재하지 않습니다.」 |
| 초기화 | `btnClear` | 미확인 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbBarCode` | 🎥 카메라접근권한을 허용해주십시오. | 글 | 최대 13 · onkeypress: `return fnBarCodeAdd();` |
| `ddlWarehouse` | 입고창고 | 고르기 | 업무 자료 22개(적지 않음) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 7개(보임 5) · 불러온 줄 있음: 아니오
- 기능: editingCore, events

보이는 열: BarCode(barcode) · 단품명(옵션명)(goodsNm) · LotNo(lotNo) · 상태(status) · 송장번호(LotInvoiceNo)

숨은 열: 단품코드(goodsCd) · optionValue


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hdScanMode` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 입고창고를 선택해 주십시오.
- 입력된 입고자재 목록이 존재하지 않습니다.
- 입고 창고를 먼저 선택해주십시오.
- code =

## 연결되는 화면

- `LotNoBarCodeHome.aspx`
- `../WebSvcLotBarcode.asmx`

## 쪽 안 함수

- `fnBarCodeCheck`: ajax `../WebSvcLotBarcode.asmx/LotBarcodeCheck`

그 밖: `drawLine` · `tick` · `oGrid_AJAXResponse` · `SetRowCount` · `fnBarCodeAdd` · `resetInputField`
