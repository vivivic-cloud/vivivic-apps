# 하위화면 > 이동입고 > MWInsert — 이동입고등록

- 주소: `/System/Stock/MWInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 이동입고등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./MWInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 삭제 | `btnCancel` | 이동 | → `POReturnOutList.aspx` |
| 저장 | `btnSave` | 쓰기 | 검사 「상태변경 내역의 저장될 행이 선택되지 않았습니다.」 |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlWarehouse` | 입고창고 | 고르기 | 업무 자료 21개(적지 않음) |
| `ddlStatus` | 판매상태 | 고르기 | 전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `tbGoodsCd` | 단품코드 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 15개(보임 14) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션값(optionValue) · 재고상태(stockStatus) · 이동수량(moveQty) · 기존출고수량(preOutQty) · 출고창고(outWCd) · 출고수량(outQty) · 입고창고(inWCd) · 입고수량(wQty) · 배송사(deliveryCoCd) · 송장번호(invoiceNo) · 메모(memo)

숨은 열: 이동입고번호(stockMoveNo)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- '입고수량'이 입력되지 않았습니다.
- 상태변경 내역의 저장될 행이 선택되지 않았습니다.

## 연결되는 화면

- `POReturnOutList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellSelectionChanged`
