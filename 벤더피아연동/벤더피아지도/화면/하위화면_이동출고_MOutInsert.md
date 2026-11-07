# 하위화면 > 이동출고 > MOutInsert — 이동출고등록

- 주소: `/System/Stock/MOutInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 이동출고등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./MOutInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 이동 | → `EOutList.aspx` |
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlWarehouse` | 출고창고 | 고르기 | 업무 자료 21개(적지 않음) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 12개(보임 11) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션값(optionValue) · 이동수량(moveQty) · 기존출고수량(preOutQty) · 출고수량(outQty) · 입고창고(inWCd) · 재고상태(stockStatus) · 송장번호(invoiceNo) · 비고(memo)

숨은 열: 이동출고번호(stockMoveNo)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 연결되는 화면

- `EOutList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellSelectionChanged`
