# 하위화면 > 구매발주목록 > POUpload — 구매발주 일괄등록

- 주소: `/System/Purchase/POUpload.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 구매발주 일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./POUpload.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| 취소 | `btnClose` | 이동 | → `POList.aspx` |
| Close | `` | 화면만 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbPONm` | 구매발주명 : | 글 |  |
| `ddlSupplier` | 구매사명 : | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlWarehouse` | 입고창고 : | 고르기 | 업무 자료 22개(적지 않음) |
| `dcPODt` | 구매발주일 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcWarehousingDt` | 납기 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `customFile` | 파일선택 : | 파일 | onchange: `return checkFileExtension(this);` |

## 숨은 값 (이름만)

`hdKey` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 구매발주명이 입력되지 않았습니다.
- 구매사명이 선택되지 않았습니다.
- 입고창고가 선택되지 않았습니다.
- 구매발주일이 입력되지 않았습니다.
- 납기일이 입력되지 않았습니다.
- 파일을 선택해주세요.
- 엑셀(.xls, .xlsx)파일만 선택이 가능합니다.

## 연결되는 화면

- `POList.aspx`
- `../../Download/POUploadList.xls`

## 쪽 안 함수


그 밖: `isFieldValid` · `checkFileExtension`
