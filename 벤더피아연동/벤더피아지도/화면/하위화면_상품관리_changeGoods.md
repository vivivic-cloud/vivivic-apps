# 하위화면 > 상품관리 > changeGoods — 상품일괄변경등록

- 주소: `/System/Upload/changeGoods.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 상품일괄변경등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./changeGoods.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` |  | 고르기 | 업무 자료 19개(적지 않음) |
| `customFile` |  | 파일 | 이벤트 keydown |

## 일반 표

- `kt_table_1`: 매출처상품코드* · 상품명 · 매출처상품명 · 단품코드1* · 단품코드2 · 단품코드3 · 단품코드4 · 단품코드5 · 단품코드6 · 단품코드7 · 단품코드8 · 단품코드9 · 단품코드10

## 숨은 값 (이름만)

`hdKey`

## 연결되는 화면

- `../../System/Master/salesGoods.aspx`
- `../../Download/changeGoodsCd.xls`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnClose` · `fnDownFile`
