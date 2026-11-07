# 하위화면 > 주문서변환 > oSheetInsert — 원본주문서등록

- 주소: `/System/Mapper/oSheetInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 원본주문서등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./oSheetInsert.aspx` (multipart/form-data)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 쓰기 | `fnClose();` · 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` |  | 고르기 | 업무 자료 19개(적지 않음) · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlStor` |
| `ddlKind` | 수집종류 | 고르기 | 1=주문 · 2=취소 · 3=반품 · 4=교환 · 꺼짐 (기본 `1`) |
| `tbMemo` | 메모 | 글 | 이벤트 keydown |
| `tbSheetCd` |  | 글 | 이벤트 keydown,keyup |
| `tbSheetNm` |  | 글 | 이벤트 keydown |
| `FileUpload1` |  | 파일 | onchange: `return checkFileExtension(this);` · 이벤트 keydown |

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 해당 매출처가 선택되지 않았습니다.
- 원본주문서명이 입력되지 않았습니다.
- 엑셀(.xls, .xlsx)파일만 선택이 가능합니다.

## 연결되는 화면

- `../../System/Mapper/oSheetList.aspx`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `doubleSubmitCheck` · `fnClose` · `fnCheckVal` · `checkFileExtension`
