# 하위화면 > 배송스케줄 > DateUpload — 배송정보 일괄등록

- 주소: `/System/Upload/DateUpload.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 배송정보 일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./DateUpload.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnCancel` | 이동 | JS만(제출 안 함) |
| Close | `` | 화면만 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `FileUpload1` |  | 파일 | 이벤트 keydown |

## 일반 표

- `kt_table_1`: 배송번호* · 배송희망일 · 배송예정일 · 선불비 · 착불비 · 메모

## 숨은 값 (이름만)

`hdKey`

## 연결되는 화면

- `../Sales/deliveryList.aspx`

## 쪽 안 함수


그 밖: `doubleSubmitCheck`
