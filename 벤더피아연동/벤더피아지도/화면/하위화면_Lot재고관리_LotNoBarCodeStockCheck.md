# 하위화면 > Lot재고관리 > LotNoBarCodeStockCheck — [BARCODE] 재고확인

- 주소: `/System/Stock/LotNoBarCodeStockCheck.aspx?ScanMode=BARCODE`
- 쪽 제목: VendorPia
- 화면 머리: [BARCODE] 재고확인
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./LotNoBarCodeStockCheck.aspx?ScanMode=BARCODE` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbBarCode` | 🎥 카메라접근권한을 허용해주십시오. | 글 | 최대 13 · onkeypress: `return fnBarCodeAdd();` |

## 일반 표

- `mGridTable`: Lot 번호 · 순번 · 바코드 · Lot송장번호 · 창고명 · 이력
- `dGridTable`: NO · 상품명 · 옵션값 · 창고명 · 수량 · 입고일 · 공급처 코드 · 상품코드 · 창고코드
- `sGridTable`: NO · Lot 번호 · 순번 · 바코드 · Lot송장번호 · 창고명 · 이력

## 숨은 값 (이름만)

`hdKey` · `hdScanMode` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 재고 조회 중 오류가 발생했습니다. 
- code =
- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `LotNoBarCodeHome.aspx`
- `../WebSvcLotBarcode.asmx`
- `../Master/goodsLotBarcodeHistory.aspx?barcode=…`

## 쪽 안 함수

- `fnStockList`: ajax `../WebSvcLotBarcode.asmx/LotBarcodeGetStockList`
- `fnBarCodeCheck`: ajax `../WebSvcLotBarcode.asmx/LotBarcodeStockCheck`
- `fnBarcodeHistory`: 팝업주소 `../Master/goodsLotBarcodeHistory.aspx?barcode=`

그 밖: `drawLine` · `tick` · `highlightRow` · `fnBarCodeAdd` · `resetInputField`
