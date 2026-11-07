# 하위화면 > 단품관리 > goodsAmtInsert — 단품가격수정

- 주소: `/System/Upload/goodsAmtInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품가격수정
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goodsAmtInsert.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| Close | `` | 화면만 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSupplier` |  | 고르기 | 업무 자료 108개(적지 않음) |
| `customFile` |  | 파일 | 이벤트 keydown |

## 일반 표

- `kt_table_1`: 바코드 · 단품코드* · 단품명* · 재고유형* · 창고명* · 배송사명* · 합포장여부* · 판매상태* · 자재원가 · 자재비용 · 매입단가* · 수도권선불비 · 수도권착불비 · 수도권외곽선불비 · 수도권외곽착불비 · 지방선불비 · 지방착불비 · 지방외곽선불비 · 지방외곽착불비

## 숨은 값 (이름만)

`hdKey`

## 연결되는 화면

- `../../System/Master/goods.aspx`
- `../../Download/goodsAmtList.xls`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnClose` · `fnDownFile`
