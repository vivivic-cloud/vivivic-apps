# 하위화면 > 창고관리 > warehouseDetl — 창고 등록

- 주소: `/System/Master/warehouseDetl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 창고 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./warehouseDetl.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| 우편번호 | `btnPost` | 미확인 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbWNm` |  | 글 | 최대 5 · 이벤트 keydown |
| `ddlChargeNm` | 담당직원 | 고르기 | 업무 자료 45개(적지 않음) |
| `tbZip` | 우편번호 | 글 | 읽기전용 · 이벤트 keydown |
| `tbAddr1` | 주소 | 글 | 이벤트 keydown |
| `tbAddr2` | 주소 | 글 | 이벤트 keydown |
| `tbTel` | 전화번호 | 글 | 이벤트 keydown |
| `cbUseYn` |  | 체크 | 이벤트 keydown |

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 확인창: 삭제하시겠습니까?
- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `../../System/Master/warehouse.aspx`

## 쪽 안 함수

- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`

그 밖: `doubleSubmitCheck` · `fnClose` · `fnDelete` · `jusoCallBack`
