# 하위화면 > 배송사관리 > locDCo — 직배권역배정

- 주소: `/System/Master/locDCo.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 직배권역배정
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./locDCo.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 확인창 「저장하시겠습니까?」 · 검사 「저장할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |
| (그림 btnLocAdd.png) | `btnAddPost` | 쓰기 | 팝업주소 `locDCoPost.aspx` · 검사 「팝업 차단을 해제해주세요.」 |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `AreaSelect` | 도로명 | 라디오 |  |
| `ddlSido` | 시도 | 고르기 | 전체 · 11=서울특별시 · 12=전남광주통합특별시 · 26=부산광역시 · 27=대구광역시 · 28=인천광역시 · 29=광주광역시 · 30=대전광역시 · 31=울산광역시 · 36=세종특별자치시 · 41=경기도 · 43=충청북도 · 44=충청남도 · 46=전라남도 · 47=경상북도 · 48=경상남도 · 50=제주특별자치도 · 51=강원특별자치도 · 52=전북특별자치도 · onchange: `$('#btnSearch').click();` (기본 `전체`) |
| `ddlLoc1` | 권역 | 고르기 | 업무 자료 7개(적지 않음) · onchange: `$('#btnSearch').click();` |
| `ddlLoc` | 권역배정 | 고르기 | 업무 자료 7개(적지 않음) |
| `ddlDCo` | 배송사배정 | 고르기 | 업무 자료 17개(적지 않음) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 9개(보임 9) · 불러온 줄 있음: 예
- 기능: activation, columnResizing, editingCore, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 시군구코드(locNo) · 시군구할당코드(gugunZipCd) · 시도(sidoLocNm) · 구군(gugun) · 읍면동(EUPMYEON) · 자체권역코드(locCd) · 자체권역명(locNm) · 배송사(deliveryCoCd)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 저장할 목록을 선택해 주십시오.
- 확인창: 저장하시겠습니까?
- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `deliveryCo.aspx`
- `locDCoPost.aspx`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`
