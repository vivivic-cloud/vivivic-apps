# 하위화면 > 재고조회 > StockHistoryList(재고 이력 팝업) — 수정이력 조회

- 어디서: 재고관리 > 재고조회
- 연 방법: 목록 첫 줄의 코드로 기존 건을 열어 구조만 읽음. 값은 적지 않음
- 주소: `/System/History/StockHistoryList.aspx?vendorCd=…&stockNo=…`
- 쪽 제목: VendorPia
- 화면 머리: 수정이력 조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./StockHistoryList.aspx?vendorCd=…&stockNo=…` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 8개(보임 8) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: NO(RNUM) · 구분(GUBUN_STATUS) · 변경컬럼(columnName) · 이전 값(oldValue) · 변경 값(newValue) · 비고(memo) · 수정일시(editDt) · 수정자(editNm)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `oGrid_CellSelectionChanged`
