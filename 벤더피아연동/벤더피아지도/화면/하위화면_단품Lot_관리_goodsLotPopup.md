# 하위화면 > 단품Lot 관리 > goodsLotPopup — 단품 Lot목록

- 어디서: Master > 단품Lot 관리
- 연 방법: 목록 첫 줄의 코드로 기존 건을 열어 구조만 읽음. 값은 적지 않음
- 주소: `/System/Master/goodsLotPopup.aspx?vendorCd=…&goodsNo=…&optionValue=…`
- 쪽 제목: VendorPia
- 화면 머리: 단품 Lot목록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goodsLotPopup.aspx?vendorCd=…&goodsNo=…&optionValue=…` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | `fnClose(); return false;` · JS만(제출 안 함) |
| 일괄입고 | `btnInComeAll` | 쓰기 | 검사 「입고할 창고를 선택해주세요.」 |
| 일괄이동 | `btnOutAll` | 미확인 | 폼 제출(서버 처리) |
| 일괄출고 | `btnMoveAll` | 쓰기 | 검사 「이동입고할 창고를 선택해 주십시오.」 |
| 초기화 | `btnClear` | 미확인 | 확인창 「선택하신 Lot을 초기화 하시겠습니까?」 · 폼 제출(서버 처리) |
| 삭제 | `btnDel` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 수 없는 목록을 선택되었습니다. 」 · 폼 제출(서버 처리) |
| 추가 | `btnAdd` | 쓰기 | 팝업주소 `goodsLotAddPopup.aspx?vendorCd=…` · 검사 「팝업 차단을 해제해주세요.」 |
| 일괄입고 | `btnInComeAll_Lot` | 쓰기 | 검사 「입고할 창고를 선택해주세요.」 · 검사 「선택된 목록중 이미 입고된 자재가 있습니다.」 |
| 일괄이동 | `btnOutAll_Lot` | 미확인 | 검사 「선택된 목록중 출고 불가한 자재가 있습니다.」 |
| 일괄출고 | `btnMoveAll_Lot` | 쓰기 | 검사 「이동할 창고를 선택해주세요.」 · 검사 「선택된 목록중 이동 불가한 자재가 있습니다.」 |
| 삭제 | `btnDeleteLotSeq` | 쓰기 | 폼 제출(서버 처리) |
| 수정 | `btnUpdatetLotSeq` | 쓰기 | 팝업주소 `goodsLotBarcodeUpdatePopup.aspx?vendorCd=…` · 검사 「수정할 바코드를 먼저 클릭해 주십시오.」 · 검사 「팝업 차단을 해제해주세요.」 |
| 추가 | `btnInsertLotSeq` | 쓰기 | 팝업주소 `goodsLotBarcodeUpdatePopup.aspx?vendorCd=…` · 검사 「팝업 차단을 해제해주세요.」 |
| 출력 | `btnPrint` | 출력 | JS만(제출 안 함) |
| Button (숨김) | `btnSearch` | 화면만 | 폼 제출(서버 처리) |
| Button (숨김) | `btnLotDetailSearch` | 화면만 | 폼 제출(서버 처리) |
| ZD230- 프린터드라이브 다운로드 | `` | 출력 | 링크 `https://vendorpia.com/Print/zd230.exe` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlWarehouse` | 창고: | 고르기 | 업무 자료 22개(적지 않음) |
| `ddlWarehouse2` | 창고: | 고르기 | 업무 자료 22개(적지 않음) |
| `tbPrintCnt` | 창고: | 글 | 이벤트 keyup |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 9개(보임 9) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · NO(RNUM) · Lot 번호(lotNo) · 수량(생성)(qty) · 수량(입고)(InCnt) · 수량(출고)(OutCnt) · 수량(고객)(CustomerCnt) · 생성일(regDt) · 송장번호(memo)

### `dGrid` — Infragistics WebDataGrid · 열 9개(보임 8) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · NO(RNUM) · Lot번호(lotNo) · 일련번호(seqNo) · 바코드(barcode) · 입출고구분(InOutTypeNm) · 재고위치(warehouseNm) · 이력(historyLink)

숨은 열: 창고코드(warehouseCd)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `dGrid_clientState` · `hdLotNo` · `hdgoodsNo` · `hdgoodsCd` · `hdoptionValue` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 확인창: 선택하신 Lot을 초기화 하시겠습니까?
- 삭제할 수 없는 목록을 선택되었습니다.
- 확인창: 삭제하시겠습니까?
- 팝업 차단을 해제해주세요.
- 수정할 바코드를 먼저 클릭해 주십시오.
- 입고할 창고를 선택해주세요.
- 이동입고할 창고를 선택해 주십시오.
- 선택된 목록중 이미 입고된 자재가 있습니다.
- 선택된 목록중 출고 불가한 자재가 있습니다.
- 이동할 창고를 선택해주세요.
- 선택된 목록중 이동 불가한 자재가 있습니다.
- 선택된 목록중 창고가 동일한 자재가 있습니다.
- 출력할 데이터를 먼저 선택해주십시오.
- 삭제할 수 없는 바코드가 선택되었습니다.
- 삭제할 데이터를 먼저 선택해주십시오.

## 연결되는 화면

- `goodsLotAddPopup.aspx?vendorCd=…`
- `goodsLotBarcodeUpdatePopup.aspx?vendorCd=…`
- `goodsLotBarcodeHistory.aspx?barcode=…`

## 쪽 안 함수

- `fnSearchDetail`: 단추 누름 `btnSearch`
- `fnSearch`: 단추 누름 `btnSearch`
- `oGrid_CellSelectionChanged`: 단추 누름 `btnLotDetailSearch`
- `dGrid_CellSelectionChanged`: 팝업주소 `goodsLotBarcodeHistory.aspx?barcode=`

그 밖: `fnClose` · `oGrid_HeaderCheckBoxClicked` · `oGrid_Editing_CellValueChanging` · `oGrid_CellEditing_EnteringEditMode` · `goPrintReport` · `goLotSeqDelete`
