# 하위화면 > 상태변경 > ChangeStatus — 재고상태변경

- 주소: `/System/Stock/ChangeStatus.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 재고상태변경
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./ChangeStatus.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 삭제 | `btnCancel` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 검사 「상태변경 내역의 저장될 행이 선택되지 않았습니다.」 |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlWarehouse` | 창고 | 고르기 | 업무 자료 21개(적지 않음) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `ddlStatus` | 변경재고상태 | 고르기 | 1=양품 · 2=불량품 · 3=회수품 (기본 `1`) |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 13개(보임 12) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션(optionValue) · 단가(unitPrice) · 양품수량(stockQty) · 불량품(defectiveQty) · 회수수량(returnQty) · 출고예정(deliveryQty) · 변경수량(changeQty) · 재고상태(stockStatus) · 메모(memo)

숨은 열: 재고코드(stockNo)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- '변경수량'이 입력되지 않았습니다.
- 상태변경 내역의 저장될 행이 선택되지 않았습니다.

## 연결되는 화면

- `ChangeStatusList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellSelectionChanged`
