# Master > 배송사관리

- 주소: `/System/Master/deliveryCo.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 배송사관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./deliveryCo.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 이동 | → `deliveryCoDetl.aspx` |
| 삭제 | `btnDel` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |
| 직배권역배정 | `btnLocDCo` | 이동 | → `locDCo.aspx` |
| 배송사 외각(수도권,지방) 지정 | `btnDeliveryEtc` | 이동 | → `locDeliveryCoConfig.aspx` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbDNm` | 배송사명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 11개(보임 9) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 배송사코드(deliveryCoCd) · 배송사명(deliveryCoNm) · 배송기사여부(delivererYn) · 대표자(president) · 전화번호(tel) · 팩스번호(fax) · 거래여부(useGb) · 주문연동(orderLinkNm)

숨은 열: 배송사바코드(barcode) · ID(id)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `deliveryCoDetl.aspx`
- `locDCo.aspx`
- `locDeliveryCoConfig.aspx`
- `AdditionalPayment.aspx`
- `deliveryCoDetl.aspx?deliveryCoCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `deliveryCoDetl.aspx?deliveryCoCd=`
- `fnSearch`: 단추 누름 `btnSearch`
