# 하위화면 > 외주입고 > PDOWInsert — 외주생산입고등록

- 주소: `/System/Stock/PDOWInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 외주생산입고등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./PDOWInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 이동 | → `PDOWList.aspx` |
| 저장 | `btnSave` | 쓰기 | 검사 「생산입고 내역의 저장될 행이 선택되지 않았습니다.」 |
| Button (숨김) | `btnSearchPOList` | 화면만 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSupplier` | 구매사 | 고르기 | 업무 자료 108개(적지 않음) |
| `tbRecipient` | 고객명 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `dcRWishDt1` | 배송희망일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcRWishDt2` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 15개(보임 11) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: 배송희망일(receiptWishDt) · 입고예정일(warehousingDt) · 구매사명(supplierNm) · 판매지점(storeNm) · 고객명(recipient) · 단품명(goodsNm) · 옵션(optionValue) · 입고수량(wQty) · 비고(PDOMemo) · 금액(purchaseAmt) · 발주일련번호(PDOSeq)

숨은 열: 단품코드(goodsCd) · 구매사코드(supplierCd) · 외주생산발주번호(PDONo) · 순번(seq)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hPONo` · `hSupplierCd` · `hWidth` · `hMobile`

## 쪽 안 메시지

- '입고수량'이 입력되지 않았습니다.
- 생산입고 내역의 저장될 행이 선택되지 않았습니다.

## 연결되는 화면

- `PDOWList.aspx`
