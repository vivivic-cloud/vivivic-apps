# 하위화면 > 주문관리 > HistoryList(수정이력 팝업) — 수정이력 조회

- 어디서: 판매관리 > 주문관리
- 연 방법: 목록 첫 줄의 코드로 기존 건을 열어 구조만 읽음. 값은 적지 않음
- 주소: `/System/History/HistoryList.aspx?vendorCd=…&orderNo=…`
- 쪽 제목: VendorPia
- 화면 머리: 수정이력 조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./HistoryList.aspx?vendorCd=…&orderNo=…` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlColumn` | 변경컬럼 | 고르기 | 0=전체 · 배송메시지 · 메모 · 본사메모 · 선불비 · 착불비 · 제품비 · 기사운임 · 주소 · 수취인 · 수취인전화 · 수취인휴대폰 · CS · 생산처 · 몰 · 주문자 · 수량 · 박스수량 · 배송사 · 배송상태 · 지정일 · 기사메모 · 상품명 · 옵션 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlColu` (기본 `0`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 6개(보임 6) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: NO(RNUM) · 변경컬럼(changed_column) · 이전 값(old_value) · 변경 값(new_value) · 수정일시(change_date) · 수정자(change_user)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `oGrid_CellSelectionChanged`
