# 하위화면 > 배송사관리 > AdditionalPayment — 추가운임관리

- 주소: `/System/Master/AdditionalPayment.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 추가운임관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./AdditionalPayment.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 쓰기 | 검사 「추가요금을 입력해주세요.」 · 폼 제출(서버 처리) |
| (그림 icon_listdel.gif, 삭제로 보임) | `btnDelete` | 쓰기 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSido` | 시도 | 고르기 | 강원특별자치도 · 경기도 · 경상남도 · 경상북도 · 광주광역시 · 대구광역시 · 대전광역시 · 부산광역시 · 서울특별시 · 세종특별자치시 · 울산광역시 · 인천광역시 · 전남광주통합특별시 · 전라남도 · 전북특별자치도 · 제주특별자치도 · 충청남도 · 충청북도 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlSido` (기본 `강원특별자치도`) |
| `ddlgugun` | 시군구 | 고르기 | 전체 · 강릉시 · 고성군 · 동해시 · 삼척시 · 속초시 · 양구군 · 양양군 · 영월군 · 원주시 · 인제군 · 정선군 · 철원군 · 춘천시 · 태백시 · 평창군 · 홍천군 · 화천군 · 횡성군 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlgugu` (기본 `전체`) |
| `tbSearch` | 읍면동 | 글 |  |
| `txtAdditionalPayment` | 추가요금 | 글 | 이벤트 keyup |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 8개(보임 8) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 시군구동코드(LOCNODONG) · 시도(SIDO) · 시군구(SIGUNGU) · 읍면동(EUPMYEON) · 추가요금(AdditionalPayment) · 수정자(editNm) · 최종수정일(editDt)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 추가요금을 입력해주세요.
