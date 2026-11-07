# Master > 매입처관리

- 주소: `/System/Master/supplier.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 매입처관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./supplier.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 이동 | → `supplierDtl.aspx` · 팝업 `supplierInsert.aspx` |
| 일괄등록 | `btnExcelUpload` | 이동 | → `../../System/Upload/supplierUpload.aspx` |
| 삭제 | `btnDel` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbSNm` | 매입처명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlRowC` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 19개(보임 19) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 코드(supplierCd) · 매입처명(supplierNm) · 사업자번호(bizNo) · 대표자(president) · 주소(addr) · 전화번호(tel) · 팩스번호(fax) · 담당자(chargeNm) · 아이디(id) · 비밀번호(pw) · 거래여부(status) · 선결제여부(prepaymentYn) · 결재기간(accPeriod) · 은행명(bankNm) · 예금주(depositor) · 계좌번호(accountNo) · 이메일(email) · 비고사항(memo)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `supplierInsert.aspx`
- `supplierDtl.aspx`
- `../../System/Upload/supplierUpload.aspx`
- `supplierDtl.aspx?supplierCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `supplierDtl.aspx?supplierCd=`
- `fnSearch`: 단추 누름 `btnSearch`
