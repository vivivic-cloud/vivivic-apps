# 하위화면 > 배송사관리 > locDeliveryCoConfig — 배송사 외곽 지정(수도권, 지방) ▶ 외곽배송비 연동

- 주소: `/System/Master/locDeliveryCoConfig.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 배송사 외곽 지정(수도권, 지방) ▶ 외곽배송비 연동
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./locDeliveryCoConfig.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 추가 | `btnDeliveryEtcSave` | 쓰기 | 검사 「지정할 배송사를 목록에서 먼저 선택해 주십시오」 · 검사 「외곽구분을 선택해 주십시오」 · 폼 제출(서버 처리) |
| 추가 | `btnDeliveryEtcDelete` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「지정할 배송사를 목록에서 먼저 선택해 주십시오」 · 폼 제출(서버 처리) |
| Button (숨김) | `btnSearchDetail` | 화면만 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlETCType` | 외곽구분 | 고르기 | =선택하세요 · 수도권외곽 · 지방외곽 |
| `ddlSido` | 시도 | 고르기 | 전체 · 서울특별시 · 전남광주통합특별시 · 부산광역시 · 대구광역시 · 인천광역시 · 광주광역시 · 대전광역시 · 울산광역시 · 세종특별자치시 · 경기도 · 충청북도 · 충청남도 · 전라남도 · 경상북도 · 경상남도 · 제주특별자치도 · 강원특별자치도 · 전북특별자치도 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlSido` (기본 `전체`) |

## 표(그리드)

### `dGrid` — Infragistics WebDataGrid · 열 5개(보임 5) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: 배송사코드(deliveryCoCd) · 배송사명(deliveryCoNm) · 수도권외곽(locEtcCnt1) · 지방외곽(locEtcCnt2) · 거래여부(useGb)

### `cGrid` — Infragistics WebDataGrid · 열 9개(보임 8) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 시군구코드(locNo) · 시군구할당코드(gugunZipCd) · 시도(sidoLocNm) · 구군(gugun) · 외곽구분(LocEtcTypeCd) · 수정자(change_user) · 수정일시(change_date)

숨은 열: 벤더코드(vendorCd)


## 숨은 값 (이름만)

`hdKey` · `dGrid_clientState` · `cGrid_clientState` · `hdDeliveryCoCd` · `hdDeliveryCoNm` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 지정할 배송사를 목록에서 먼저 선택해 주십시오
- 외곽구분을 선택해 주십시오
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `deliveryCo.aspx`

## 쪽 안 함수

- `dGrid_CellSelectionChanged`: 단추 누름 `btnSearchDetail`
