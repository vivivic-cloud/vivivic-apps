# 하위화면 > 배송관리 > DvEndInsert — 배송완료 일괄등록

- 주소: `/System/Delivery/DvEndInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 배송완료 일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./DvEndInsert.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnCancel` | 이동 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `customFile` | 배송완료 엑셀파일 선택 | 파일 | onchange: `return checkFileExtension(this);` |

## 일반 표

- `kt_table_1`: 배송번호 · 배송완료일

## 숨은 값 (이름만)

`hdKey` · `hStoreCd` · `hSheetCd` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 파일을 선택해주세요.
- 엑셀(.xls, .xlsx)파일만 선택이 가능합니다.

## 연결되는 화면

- `../SCM/scmFirmDvList.aspx`
- `firmDvList.aspx`

## 쪽 안 함수


그 밖: `isFieldValid` · `checkFileExtension` · `doubleSubmitCheck`
