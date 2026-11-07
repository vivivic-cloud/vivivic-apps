# Lot재고관리 > Lot전수조사

- 주소: `/System/Stock/stockInspection.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 재고조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./stockInspection.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 등록 | `btnReg` | 쓰기 | 팝업주소 `stockInspectionPopup.aspx` · 검사 「팝업 차단을 해제해주세요.」 |
| 삭제 | `btnDelete` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 수 없는 목록을 선택되었습니다. 」 · 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `dcStartDt` | 일자 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlWarehouse` | 창고 | 고르기 | 업무 자료 22개(적지 않음) |
| `tbMemo` | 전수조사명 | 글 |  |
| `ddlStatus` | 상태 | 고르기 | -1=전체 · REG=전수조사생성 · ING=전수조사진행중 · FINISH=전수조사완료 · CANCEL=전수조사취소 (기본 `-1`) |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlRowC` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 13개(보임 11) · 불러온 줄 있음: 아니오
- 기능: selection, columnResizing, editingCore, events

보이는 열: (체크)(CHK) · No(RNUM) · 전수조사번호(InspectionId) · 전수조사명(InspectionNm) · 일자(InspectionDt) · 창고명(warehouseNm) · 진행상태(statusNm) · 단품수량(goodsCnt) · 검수수량(userCnt) · 비고(memo) · 재고조정(stockLink)

숨은 열: 창고코드(warehouseCd) · 상태코드(statusCd)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `hdDoubleCheck` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 수 없는 목록을 선택되었습니다.
- 확인창: 삭제하시겠습니까?
- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `stockInspectionPopup.aspx`
- `stockInspectionAdjustment.aspx?InspectionId=…`
- `stockInspectionPopup.aspx?InspectionId=…`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`
- `oGrid_CellSelectionChanged`: 팝업주소 `stockInspectionAdjustment.aspx?InspectionId=` · 팝업주소 `stockInspectionPopup.aspx?InspectionId=`
