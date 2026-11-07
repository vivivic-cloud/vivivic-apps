# 하위화면 > 생산발주목록 > PDOInsert — 생산발주등록

- 주소: `/System/Purchase/PDOInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 생산발주등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./PDOInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 이동 | → `PDOList.aspx` |
| 생산발주저장 | `btnSave` | 쓰기 | 검사 「재고출고외 생산발주 저장전 선택된 내용이 없습니다.」 |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 판매사 | 고르기 | 업무 자료 19개(적지 않음) |
| `ddlSupplier` | 구매사 | 고르기 | 업무 자료 107개(적지 않음) |
| `dcStartDt` | 주문처리일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcRWishDt1` | 배송희망일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcRWishDt2` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlWarehouse` | 입고창고 | 고르기 | 업무 자료 21개(적지 않음) |
| `dcWarehousingDt` | 납기일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 20개(보임 14) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: (체크)(CHK) · 배송연(rWishYear) · 월(rWishMonth) · 일(rWishDay) · 판매사(storeNm) · 수취인(recipient) · 단품명(goodsNm) · 옵션값(optionValue) · 수량(qty) · 생산지시메모(PDOMemo) · 판매가(salesAmt) · 구매가(purchaseAmt) · 주문처리일(orderConfirmDt) · 재고출고(orderingYn)

숨은 열: 주문번호(orderNo) · 주문순번(orderSeq) · 구매사명(receiptWishDt) · 판매사코드(storeCd) · 단품코드(goodsCd) · 구매단가(purchasePrice)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 재고출고외 생산발주 저장전 선택된 내용이 없습니다.

## 연결되는 화면

- `PDOList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellEditing_ExitedEditMode`
