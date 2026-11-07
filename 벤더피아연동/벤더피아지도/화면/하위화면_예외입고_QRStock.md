# 하위화면 > 예외입고 > QRStock — QR 입고(단품)

- 주소: `/System/Stock/QRStock.aspx`
- 쪽 제목: VendorPia
- 화면 머리: QR 입고(단품)
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./QRStock.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 검사 「입고창고를 선택해 주십시오.」 · 검사 「예외입고일을 지정해 주십시오.」 |
| 초기화 | `btnClear` | 미확인 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbBarCode` | 🎥 카메라접근권한을 허용해주십시오. | 글 | 읽기전용 · onkeypress: `return fnQRCodeAdd();` |
| `ddlWarehouse` | 창고 | 고르기 | 업무 자료 22개(적지 않음) |
| `dcEWDt` | 예외입고일 : | 날짜 |  |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 9개(보임 5) · 불러온 줄 있음: 아니오
- 기능: editingCore, events

보이는 열: 단품코드(goodsCd) · 단품명(goodsNm) · 옵션명(optionValue) · 입고수량(EWQty) · 상태(Status)

숨은 열: QRCode · 매입처코드(supplierCd) · 입고단가(purchaseAmt) · 비고(Memo)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 입고창고를 선택해 주십시오.
- 예외입고일을 지정해 주십시오.
- 입력된 입고자재 목록이 존재하지 않습니다.
- 입고수량'이 입력되지 않았습니다.
- code =

## 연결되는 화면

- `EWList.aspx`
- `../WebSvcStock.asmx`

## 쪽 안 함수

- `StockQRCodeCheck`: ajax `../WebSvcStock.asmx/QRCodeStock`

그 밖: `drawLine` · `tick` · `sleep` · `fnQRCodeAdd` · `oGrid_AJAXResponse` · `minusComma`
