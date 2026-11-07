# Master > 단품(쿠팡)관리

- 주소: `/System/Master/goodsCoupang.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품(쿠팡)관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goodsCoupang.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 일괄등록 | `btnExcelUpload` | 쓰기 | JS만(제출 안 함) |
| 삭제 | `btnDelete` | 쓰기 | 폼 제출(서버 처리) |
| 라벨송장 | `btnLabelInvoice` | 출력 | JS만(제출 안 함) |
| 일괄등록 (숨김) | `btnExcelUploadRun` | 쓰기 | 폼 제출(서버 처리) |
| 일괄출력 | `btnExcelPrintUpload` | 출력 | JS만(제출 안 함) |
| 일괄등록 (숨김) | `btnExcelPrintUploadRun` | 출력 | 폼 제출(서버 처리) |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
| 일괄등록샘플 | `` | 쓰기 | `forceDownload(event)` |
| 일괄출력샘플 | `` | 출력 | `forcePrintDownload(event)` |
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
| `tbCoupangGoodsNm` | 쿠팡상품명 | 글 |  |
| `tbCoupangBarcode` | 쿠팡바코드 | 글 |  |
| `ddlCoupangLabel` | 인쇄양식/매수 | 고르기 | cpLable100_20=라벨용지(100mmX20mm) · cpLable100_50=라벨용지(100mmX50mm) (기본 `cpLable100_20`) |
| `txtPrintQty` | / | 글 | 이벤트 keyup |
| `fuExcel` | / (숨김) | 파일 | 이벤트 change |
| `fuExcelPrint` | 일괄출력샘플 (숨김) | 파일 | 이벤트 change |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 50 · 100 · 200 · 300 · onchange: `$('#btnSearch').click();` (기본 `50`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 14개(보임 11) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · NO(RNUM) · 단품분류(categoryNm) · 매입처명(supplierNm) · 단품코드(goodsCd) · 단품명(goodsnm) · 옵션값(optionValue) · 쿠팡상품명(coupangGoodsNm) · 쿠팡바코드(coupangBarcode) · 판매상태(salesStatus) · 마지막등록일(regDt)

숨은 열: 매입처코드(supplierCd) · 단품No(goodsNo) · 쿠팡번호(coupangNo)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `hdExcelPrintEventId` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 엑셀 파일만 업로드 가능합니다. (.xls, .xlsx)
- 팝업 차단을 해제해주세요.
- 선택된 데이터 중 '쿠팡상품명, 쿠팡바코드' 값이 입력되지 않았습니다.
- 저장할 목록을 선택해 주십시오.
- 출력할 바코드를 선택해주세요!

## 연결되는 화면

- `goodsLotPopup.aspx?vendorCd=…`
- `../WebSvcBarcode.asmx`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: 팝업주소 `goodsLotPopup.aspx?vendorCd=`
- `fnSearch`: 단추 누름 `btnSearch`
- `createOZViewer_goCoupangUploadLabelRpt_callback`: ajax `../WebSvcBarcode.asmx/GoodsCoupangLabelPrintTempDelete`

그 밖: `openExcelFileDialog` · `openExcelPrintFileDialog` · `forceDownload` · `forcePrintDownload` · `oGrid_Editing_CellValueChanging` · `fnChecking` · `goCoupangLabelRpt` · `goCoupangLabelUploadPrint`
