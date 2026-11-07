# 하위화면 > 단품관리 > gRowInsert — 단품일괄등록

- 주소: `/System/Upload/gRowInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./gRowInsert.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| (그림 icon_cancel.gif, 닫기/취소로 보임) | `btnClose` | 이동 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `rdoSupplierMode` | 전체 동일 매입처 | 라디오 | 이벤트 change,keydown |
| `rdoSupplierMode` | 엑셀 매입처별 | 라디오 | 이벤트 change,keydown |
| `ddlSupplier` | 기본 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `customFile` |  | 파일 | 이벤트 change,keydown |

## 일반 표

- `kt_table_1`: 매입처명 (선택) · 창고명* · 분류명* · 단품코드* · 단품명* · 바코드 · 제조사 · 과세여부* · 판매상태* · 재고유형* · 합포장 여부* · 포장 단위* · 박스 수량 · 사은품 · 매장판매단가 · 자재단가 · 자재비용 · 매입단가* · 배송사명 · 배송료 구분 · 수도권 선불비 · 수도권 착불비 · 수도권외곽 선불비 · 수도권외곽 착불비 · 지방 선불비 · 지방 착불비 · 지방외곽 선불비 · 지방외곽 착불비 · 옵션1 · 옵션2 · 옵션3 · 옵션4 · 옵션5

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 첨부 파일은 20MB 이하만 등록할 수 있습니다. 이미지 또는 불필요한 Sheet를 제거 후 다시 시도해주십시오.

## 연결되는 화면

- `../../System/Master/goods.aspx`
- `oRowInsert.aspx`
- `../../Download/goodsList.xls`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnClose` · `fnDownFile` · `changeSupplierMode`
