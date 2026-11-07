# CS > 블랙컨슈머

- 주소: `/System/CS/blackConsumer.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 블랙컨슈머 목록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./blackConsumer.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbOrderer` | 주문자명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlRowC` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 9개(보임 8) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 블랙컨슈머번호(blackConsumerNo) · 주문자Id(ordererId) · 주문자(orderer) · 주문자전화(ordererTel) · 주문자휴대폰(ordererMobile) · 주소(addr) · 등록일자(regDt)

숨은 열: Page(page)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `supplierInsert.aspx`
- `supplierDtl.aspx`
- `supplierDtl.aspx?supplierCd=…`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `oGrid_CellSelectionChanged`
