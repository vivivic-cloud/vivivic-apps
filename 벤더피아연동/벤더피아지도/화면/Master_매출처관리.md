# Master > 매출처관리

- 주소: `/System/Master/store.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 매출처목록조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./store.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 이동 | → `storeDtl.aspx` |
| 일괄등록 | `btnExcelUpload` | 이동 | → `../../System/Upload/storeUpload.aspx` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbStoreNm` | 매출처명 | 글 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlRowC` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 19개(보임 19) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 매출처코드(storeCd) · 매출처(storeNm) · 매출처 URL(SCMURL) · 담당직원(chargeNm) · 주소(addr) · 대표자(president) · 전화번호(tel) · 팩스번호(fax) · 사업자번호(bizNo) · 아이디(id) · 비밀번호(pw) · 거래여부(status) · 업체유형(companyType) · 알림톡(msgSendYn) · 차감구분(msgAccType) · AS건발송(msgASYn) · 반품건발송(msgReturnYn) · 설치건발송(msgInstallYn)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 목록을 선택해 주십시오.
- 확인창: [주의사항] 선택한 행을 삭제하시겠습니까?  ▶해당 매출처의 CS내역, Q/A, 주문내역이 모두 영구 삭제됩니다!  ▶필요시 배송관리에서 [ 엑셀 ]출력 백업 후 [ 삭제 ] 해주세요
- 확인창: [주의사항] 데이터가 영구삭제됩니다.(복원불가) 삭제하시겠습니까?

## 연결되는 화면

- `storeDtl.aspx`
- `../../System/Upload/storeUpload.aspx`
- `storeDtl.aspx?storeCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `storeDtl.aspx?storeCd=`
- `fnSearch`: 단추 누름 `btnSearch`
