# 하위화면 > 구매반품목록 > POReturnInsert — 구매반품등록

- 주소: `/System/Purchase/POReturnInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 구매반품등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./POReturnInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 이동 | → `POReturnList.aspx` |
| 저장 | `btnSave` | 쓰기 | 검사 「반품수량을 입력 후 다시 시도해 주십시오.」 · 검사 「구매반품 저장전 선택된 내용이 없습니다.」 |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSupplier` | 구매사 | 고르기 | 업무 자료 107개(적지 않음) |
| `tbPONo` | 구매발주번호 | 글 |  |
| `tbPONm` | 구매발주명 | 글 |  |
| `tbGoodsNm` | 단품명 | 글 |  |
| `dcStartDt` | 발주일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 12개(보임 11) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: (체크)(CHK) · 구매발주번호(PONo) · 구매발주명(PONm) · 구매사(supplierNm) · 단품명(goodsNm) · 옵션값(optionValue) · 발주일(PODt) · 발주수량(qty) · 입고수량(wQty) · 반품수량(returnQty) · 메모(returnMemo)

숨은 열: 순번(seq)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 반품수량을 입력 후 다시 시도해 주십시오.
- 구매반품 저장전 선택된 내용이 없습니다.

## 연결되는 화면

- `POReturnList.aspx`

## 쪽 안 함수


그 밖: `oGrid_CellEditing_ExitedEditMode`
