# 하위화면 > 상품관리 > sRowInsert — 상품일괄등록

- 주소: `/System/Upload/sRowInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 상품일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./sRowInsert.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| (그림 icon_cancel.gif, 닫기/취소로 보임) | `btnClose` | 이동 | 폼 제출(서버 처리) |
| Close | `` | 화면만 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` |  | 고르기 | 업무 자료 19개(적지 않음) |
| `customFile` |  | 파일 | 이벤트 change,keydown |

## 일반 표

- `kt_table_1`: 옵션상품 여부 · 매출처 상품코드* · 매출처 상품명 · 상품명* · 판매 담당자* · 배송료 구분* · 배송사명* · 단품코드 1* · 단품코드 2 · 단품코드 3 · 단품코드 4 · 단품코드 5 · 단품코드 6 · 단품코드 7 · 단품코드 8 · 단품코드 9 · 단품코드 10 · 단품코드 11 · 단품코드 12 · 단품코드 13 · 단품코드 14 · 단품코드 15 · 단품 수량1* · 단품 수량2 · 단품 수량3 · 단품 수량4 · 단품 수량5 · 단품 수량6 · 단품 수량7 · 단품 수량8 · 단품 수량9 · 단품 수량10 ·

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 첨부 파일은 20MB 이하만 등록할 수 있습니다. 이미지 또는 불필요한 Sheet를 제거 후 다시 시도해주십시오.

## 연결되는 화면

- `../../System/Master/salesGoods.aspx`
- `oRowInsert.aspx`
- `../../Download/salesGoodsList.xls`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnClose` · `fnDownFile`
