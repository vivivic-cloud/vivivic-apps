# Master > 주문서변환

- 주소: `/System/Mapper/oSheetList.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 주문원본목록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./oSheetList.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 조회 | `btnInsert` | 조회 | → `oSheetInsert.aspx` · 팝업 `supplierInsert.aspx` |
| 엑셀 | `btnDel` | 내려받기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 매출처 | 고르기 | 업무 자료 19개(적지 않음) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 8개(보임 8) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 매출처코드(storeCd) · 매출처명(storeNm) · 원본주문서코드(orderSheetCd) · 버전(version) · 원본주문서명(orderNm) · 수집종류(kind) · 메모(memo)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `supplierInsert.aspx`
- `oSheetInsert.aspx`
- `mapper.aspx?sheetCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `mapper.aspx?sheetCd=`
- `fnSearch`: 단추 누름 `btnSearch`
