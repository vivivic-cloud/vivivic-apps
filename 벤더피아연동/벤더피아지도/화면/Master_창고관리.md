# Master > 창고관리

- 주소: `/System/Master/warehouse.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 창고관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./warehouse.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 이동 | → `warehouseDetl.aspx` |
| 삭제 | `btnDel` | 쓰기 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbSCd` | 창고코드 | 글 |  |
| `tbSNm` | 창고명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlRowC` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 6개(보임 6) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 창고코드(warehouseCd) · 창고명(warehouseNm) · 담당직원(chargeNm) · 전화번호(tel) · 사용여부(useYn)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `warehouseDetl.aspx`
- `warehouseDetl.aspx?warehouseCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `warehouseDetl.aspx?warehouseCd=`
- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `fnDelete`
