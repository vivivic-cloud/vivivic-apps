# Master > 단품QR출력

- 주소: `/System/Master/goodsQRPrint.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품 QRCode출력
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goodsQRPrint.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| QRCode 출력 | `btnQRPrint` | 출력 | 폼 제출(서버 처리) |
| QRCode 출력 | `btnPrintQtyAllChange` | 출력 | 검사 「출력수량 일괄변경 전 선택된 내용이 없습니다.」 |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlCategory` | 단품분류 | 고르기 | 업무 자료 9개(적지 않음) |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlStatus` | 판매상태 | 고르기 | 0=전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `tbOptionValue` | 옵션 | 글 |  |
| `tbPrintQty` | 일괄변경할 출력수량 : | 글 |  |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 11개(보임 9) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · NO(RNUM) · 단품분류(categorynm) · 매입처명(supplierNm) · 단품코드(goodscd) · 단품명(goodsnm) · 옵션값(optionvalue) · 출력수량(printQty) · 판매상태(salesStatus)

숨은 열: 매입처코드(suppliercd) · 옵션코드(optionCd)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 출력수량 일괄변경 전 선택된 내용이 없습니다.
- 처리도중 오류가 발생하였습니다. 관리자에게 문의하여 주시기 바랍니다.
- Error

## 연결되는 화면

- `../WebSvcQRPrint.asmx`

## 쪽 안 함수

- `goLabelQRCodeRpt`: ajax `../WebSvcQRPrint.asmx/SaveQRPrint`

그 밖: `getCurrentDate`
