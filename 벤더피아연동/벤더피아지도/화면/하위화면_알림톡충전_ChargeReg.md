# 하위화면 > 알림톡충전 > ChargeReg — 알림톡 요금충전 등록

- 주소: `/System/Kakao/ChargeReg.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 알림톡 요금충전 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./ChargeReg.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 닫기 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| 등록 | `btnChargeSave` | 쓰기 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `txtChargeAmt` | 충전금액 : | 글 | 최대 15 · 이벤트 keyup |
| `txtDiscription` | 비고 : | 긴 글 |  |

## 숨은 값 (이름만)

`hdKey` · `hdAPIKEY` · `hdTemplateID` · `hWidth` · `hMobile`

## 쪽 안 함수


그 밖: `fnClose` · `fnLength`
