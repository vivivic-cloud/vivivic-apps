# 하위화면 > 매장충전관리 > StoreChargeAdd — 매장 충전금액 관리

- 주소: `/System/Store/StoreChargeAdd.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 매장 충전금액 관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./StoreChargeAdd.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 검사 「매장을 선택해주십시오.」 · 검사 「충전금액을 입력해주세요.」 |
| 닫기 | `btnClose` | 이동 | `fnClose();return false;` · JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 매장 : | 고르기 | 업무 자료 3개(적지 않음) |
| `tbAmount` | 충전금액 : | 글 | 최대 15 · 이벤트 keyup |
| `tbMemo` | 비고 : | 글 |  |

## 숨은 값 (이름만)

`hdKey` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 매장을 선택해주십시오.
- 충전금액을 입력해주세요.

## 쪽 안 함수


그 밖: `fnClose`
