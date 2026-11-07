# 하위화면 > 예외출고 > stockEOutInsert — 예외출고일괄등록

- 주소: `/System/Upload/stockEOutInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 예외출고일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./stockEOutInsert.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 |  |
| Close | `` | 화면만 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlWarehouse` |  | 고르기 | 업무 자료 22개(적지 않음) |
| `customFile` |  | 파일 | onchange: `return checkFileExtension(this);` · 이벤트 keydown |
| `dcOutDt` | 예외출고일 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |

## 일반 표

- `kt_table_1`: 매입처코드 · 단품코드 · 단품명 · 옵션값 · 단가 · 출고수량 · 재고상태 · 수취인 · 배송사 · 송장번호 · 비고

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 창고를 선택해주세요.
- 파일을 선택해주세요.
- 예외출고일을 지정해 주십시오.
- 엑셀(.xls, .xlsx)파일만 선택이 가능합니다.

## 연결되는 화면

- `../Stock/EOutList.aspx`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `isFieldValid` · `checkFileExtension`
