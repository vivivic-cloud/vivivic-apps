# 하위화면 > 상품관리 > dCoUpdate — 매입처 상품 배송사 일괄변경

- 주소: `/System/Master/dCoUpdate.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 매입처 상품 배송사 일괄변경
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./dCoUpdate.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSupplier` | 매입처명 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlDCoNm` | 변경될 배송사명 | 고르기 | 업무 자료 17개(적지 않음) |

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 매입처명을 선택해주세요.
- 배송사명을 선택해주세요.

## 연결되는 화면

- `../../System/Master/salesGoods.aspx`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `isFieldValid` · `fnClose`
