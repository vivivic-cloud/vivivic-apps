# 하위화면 > 상품관리 > sGoodsAmtInsert — 상품가격일괄등록

- 주소: `/System/Upload/sGoodsAmtInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 상품가격일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./sGoodsAmtInsert.aspx` (multipart/form-data)
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
| `customFile` |  | 파일 | 이벤트 change,keydown |

## 일반 표

- `kt_table_1`: 매출처상품코드* · 상품명* · 배송사코드* · 공급단가* · 판매단가* · 수도선불비 · 수도착불비 · 수도제품비 · 수도외곽선불비 · 수도외곽착불비 · 수도외곽제품비 · 지방선불비 · 지방착불비 · 지방제품비 · 지방외곽선불비 · 지방외곽착불비 · 지방외곽제품비 · 제주선불비 · 제주착불비 · 제품비 · 수도기사운임비 · 충청기사운임비 · 경상기사운임비 · 전라기사운임비 · 강원기사운임비 · 조립설치비 · 유리비 · 상품메모

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 첨부 파일은 20MB 이하만 등록할 수 있습니다. 이미지 또는 불필요한 Sheet를 제거 후 다시 시도해주십시오.

## 연결되는 화면

- `../../System/Master/salesGoods.aspx`
- `oRowInsert.aspx`
- `../../Download/sGoodsAmtList.xls`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnClose` · `fnDownFile`
