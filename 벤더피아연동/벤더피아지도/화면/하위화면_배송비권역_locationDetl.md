# 하위화면 > 배송비권역 > locationDetl — 배송권역 등록

- 주소: `/System/Basic/locationDetl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 배송권역 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./locationDetl.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | `fnClose();` · 폼 제출(서버 처리) |
|  (숨김) | `ctl00_btnNull / btnNull` | 미확인 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbLocNm` |  | 글 | 최대 50 · 이벤트 keydown |
| `tbDCoCdAccRate` | 기사정산율 | 글 | 최대 50 · 이벤트 keydown |

## 숨은 값 (이름만)

`hdKey` · `hdLocCd`

## 쪽 안 메시지

- 확인창: 삭제하시겠습니까?

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnDelete` · `fnClose`
