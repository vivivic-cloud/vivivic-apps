# Master > 단품(오집)관리

- 주소: `/System/Master/goodsOhouse.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품(오늘의집)관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goodsOhouse.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 일괄등록 | `btnExcelUpload` | 쓰기 | JS만(제출 안 함) |
| 삭제 | `btnDelete` | 쓰기 | 폼 제출(서버 처리) |
| 라벨송장 | `btnLabelInvoice` | 출력 | JS만(제출 안 함) |
| 일괄출력 | `btnExcelPrintUpload` | 출력 | JS만(제출 안 함) |
| (그림 icon_asubmit.gif, 일괄등록로 보임) (숨김) | `btnExcelUploadRun` | 쓰기 | 폼 제출(서버 처리) |
| (그림 icon_asubmit.gif, 일괄등록로 보임) (숨김) | `btnExcelPrintUploadRun` | 출력 | 폼 제출(서버 처리) |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
| 일괄등록샘플 | `` | 쓰기 | `forceDownload(event, '오늘의집바코드.xlsx')` |
| 일괄출력샘플 | `` | 출력 | `forceDownload(event, '오늘의집일괄출력.xlsx')` |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlCategory` | 단품분류 | 고르기 | 업무 자료 9개(적지 않음) |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlStatus` | 판매상태 | 고르기 | 0=전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `ddlRegYn` | 등록여부 | 고르기 | 업무 자료 3개(적지 않음) |
| `tbGoodsCd` | 단품코드 | 글 | 이벤트 keydown |
| `tbGoodsNm` | 단품명 | 글 | 이벤트 keydown |
| `tbOptionValue` | 옵션 | 글 | 이벤트 keydown |
| `tbOhouseSku` | SKU 코드 | 글 | 이벤트 keydown |
| `tbOhouseBarcode` | 바코드 | 글 | 이벤트 keydown |
| `tbOhouseGoodsNm` | SKU 명 | 글 | 이벤트 keydown |
| `ddlOhouseLabel` | 인쇄양식/매수 | 고르기 | cpLableOhouse100_20=라벨용지(100mmX20mm) · cpLableOhouse100_50=라벨용지(100mmX50mm) (기본 `cpLableOhouse100_20`) |
| `txtPrintQty` | / | 글 | 이벤트 keyup |
| `fuExcel` | 일괄출력샘플 (숨김) | 파일 | 이벤트 change |
| `fuExcelPrint` | 일괄출력샘플 (숨김) | 파일 | 이벤트 change |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 50 · 100 · 200 · 300 · onchange: `$('#btnSearch').click();` (기본 `50`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 15개(보임 12) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · NO(RNUM) · 단품분류(categoryNm) · 매입처명(supplierNm) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션값(optionValue) · SKU 코드(ohouseSku) · 바코드(ohouseBarcode) · SKU 명(ohouseGoodsNm) · 판매상태(salesStatus) · 마지막등록일(regDt)

숨은 열: 매입처코드(supplierCd) · 단품No(goodsNo) · 오늘의집번호(ohouseNo)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `hdExcelPrintEventId` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 엑셀 파일만 업로드 가능합니다. (.xls, .xlsx)
- 저장할 목록을 선택해 주십시오.
- 선택된 데이터 중 'SKU 코드, 바코드' 값이 입력되지 않은 행이 있습니다. [
- 삭제할 등록 데이터를 선택해 주십시오.
- 확인창: 선택한
- 출력할 바코드를 선택해주세요! (저장된 바코드만 출력됩니다)
- 매수를 1 이상 숫자로 입력해주세요.

## 연결되는 화면

- `../WebSvcBarcode.asmx`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`
- `createOZViewer_goOhouseUploadLabelRpt_callback`: ajax `../WebSvcBarcode.asmx/GoodsOhouseLabelPrintTempDelete`

그 밖: `fnCheckExcelFile` · `forceDownload` · `oGrid_CellSelectionChanged` · `oGrid_Editing_CellValueChanging` · `oGrid_Editing_CellValueChanged` · `fnGetCheckedRows` · `fnCellText` · `fnChecking` · `fnDeleteChecking` · `goOhouseLabelRpt` · `goOhouseLabelUploadPrint`
