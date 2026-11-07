# 하위화면 > 입고예정 > POWInsert — 구매입고등록

- 주소: `/System/Stock/POWInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 구매입고등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./POWInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 팝업주소 `POPopup.aspx?` · 검사 「팝업 차단을 해제해주세요.」 |
| 취소 | `btnCancel` | 이동 | → `POWList.aspx` |
| 저장 | `btnSave` | 쓰기 | 검사 「구매입고 내역의 저장될 행이 선택되지 않았습니다.」 |
| Button (숨김) | `btnSearchPOList` | 화면만 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbPONo` | 구매발주번호 | 글 |  |
| `ddlSupplier` | 구매사 | 고르기 | 업무 자료 108개(적지 않음) |
| `dcStartDt` | 구매발주일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcPOWDt` | 구매입고일 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 13개(보임 12) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: (체크)(CHK) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션(optionValue) · 발주수량(qty) · 입고예정수량(restQty) · 입고수량(wQty) · 입고단가(purchasePrice) · 입고창고(warehouseCd) · 배송사(deliveryCoCd) · 송장번호(invoiceNo) · 비고(memo)

숨은 열: 순번(seq)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hPONo` · `hSupplierCd` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.
- '입고수량'이 입력되지 않았습니다.
- '입고창고'가 선택되지 않았습니다.
- 구매입고 내역의 저장될 행이 선택되지 않았습니다.

## 연결되는 화면

- `POWList.aspx`
- `POPopup.aspx?`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearchPOList`
