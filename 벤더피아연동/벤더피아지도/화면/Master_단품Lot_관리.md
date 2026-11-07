# Master > 단품Lot 관리

- 주소: `/System/Master/goodsLot.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품 Lot관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goodsLot.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| Lot재고 매뉴얼 | `` | 미확인 | `forceDownload(event)` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlCategory` | 단품분류 | 고르기 | 업무 자료 9개(적지 않음) |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlStatus` | 판매상태 | 고르기 | 0=전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `tbOptionValue` | 옵션 | 글 |  |
| `tbLotNo` | Lot No | 글 |  |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 12개(보임 10) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: NO(RNUM) · 단품분류(categorynm) · 매입처명(supplierNm) · 단품코드(goodscd) · 단품명(goodsnm) · 옵션값(optionvalue) · 판매상태(salesStatus) · Lot 수(lotQty) · 마지막등록일(regDt) · 비고(memo)

숨은 열: 매입처코드(suppliercd) · 단품No(goodsNo)


## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `goodsLotPopup.aspx?vendorCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: 팝업주소 `goodsLotPopup.aspx?vendorCd=`
- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `forceDownload`
