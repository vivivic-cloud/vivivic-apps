# 하위화면 > 구매발주목록 > PODetl(기존 발주 열기) — 구매발주 상세내역

- 어디서: 구매관리 > 구매발주목록
- 연 방법: 목록 첫 줄의 코드로 기존 건을 열어 구조만 읽음. 값은 적지 않음
- 주소: `/System/Purchase/PODetl.aspx?PONo=…&vendorCd=…`
- 쪽 제목: VendorPia
- 화면 머리: 구매발주 상세내역
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./PODetl.aspx?PONo=…&vendorCd=…` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSave` | 조회 | 폼 제출(서버 처리) |
| 발주서 | `btnExel` | 쓰기 | 폼 제출(서버 처리) |
| 취소 | `btnCancel` | 이동 | → `POList.aspx` |
| 행추가 | `btnDAdd` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnDDelete` | 화면만 | 폼 제출(서버 처리) |
| 서버단에서 처리 (숨김) | `btnRowAdd` | 쓰기 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `dcPODt` | 구매발주일 : | 날짜 | 이벤트 focus,keydown,keypress,keyup |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 10개(보임 10) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 순번(seq) · 입고일(warehousingDt) · 단품코드(goodsCd) · 단품명(goodsNm) · 옵션(optionValue) · 구매단가(purchasePrice) · 수량(qty) · 구매금액(purchaseAmt) · 입고여부(warehousingYn)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hSeq` · `hdValue` · `hdsupplierCd` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 구매사명을 선택 후 다시 시도해 주십시오.
- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `POList.aspx`
- `goodsAllPopup.aspx?vendorCd=…`

## 쪽 안 함수

- `fnPopupAll`: 팝업주소 `goodsAllPopup.aspx?vendorCd=`
- `getReturnArrayValue`: 단추 누름 `btnRowAdd`

그 밖: `fnDeleteRow` · `oGrid_CellSelectionChanged` · `DropDownOpening` · `oGrid_CellEditing_EnteredEditMode` · `oGrid_Editing_CellValueChanging` · `oGrid_CellEditing_ExitedEditMode`
