# 하위화면 > 주문관리 > oRowInsert — 주문일괄등록

- 주소: `/System/Upload/oRowInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 주문일괄등록
- 상태: **일부** (2026-11-07— 일부 그리드는 열이 안 그려져 있음(조회·올리기 뒤에 생기는 표))
- 폼: `aspnetForm` POST `./oRowInsert.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnCancel` | 이동 | JS만(제출 안 함) |
| 다음단계 | `btnExcelUpload` | 쓰기 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` |  | 고르기 | 업무 자료 14개(적지 않음) · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlStor` |
| `FileUpload1` | 파일선택 | 파일 | onchange: `return checkFileExtension(this);` · 이벤트 change |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 6개(보임 2) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: 대상컬럼(columnCaption) · 원본컬럼(sheetColumn)

숨은 열: 원본컬럼(columnNm) · 원본컬럼(columnType) · 원본컬럼(regularExp) · 원본컬럼(requiredYn)

### `rGrid` — Infragistics WebDataGrid · 열 0개(보임 0) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `rGrid_clientState` · `hStoreCd` · `hSheetCd` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 첨부 파일은 5MB 이하만 등록할 수 있습니다. 이미지 또는 불필요한 Sheet를 제거 후 다시 시도해주십시오.
- 매출처명을 선택해주세요.
- 엑셀(.xls, .xlsx)파일만 선택이 가능합니다.

## 연결되는 화면

- `../Sales/orderMst.aspx`

## 쪽 안 함수


그 밖: `isFieldValid` · `checkFileExtension`
