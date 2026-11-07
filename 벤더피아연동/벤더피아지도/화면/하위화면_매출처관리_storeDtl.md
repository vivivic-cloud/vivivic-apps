# 하위화면 > 매출처관리 > storeDtl — 매출처 등록

- 주소: `/System/Master/storeDtl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 매출처 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./storeDtl.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 검사 「등록할 매출처를 입력해주세요.」 · 검사 「매출처명을 입력해주세요.」 · 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 우편번호 | `btnPost` | 미확인 | JS만(제출 안 함) |
| 중복체크 | `btnId` | 미확인 | 폼 제출(서버 처리) |
| 적용 (숨김) | `btnPwApply` | 쓰기 | 포스트백 `btnPwApply` |
| 취소 (숨김) | `` | 쓰기 | `$('#pnlPwChange').hide();` |
| 행추가 | `btnDInsert` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnDDelete` | 화면만 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStoreNm` |  | 고르기 | 업무 자료 14개(적지 않음) · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlStor` |
| `tbStoreNm` |  | 글 | 최대 8 · 이벤트 keydown |
| `dcFirstBizDt` | 최초거래일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbPresident` | 대표자명 | 글 | 이벤트 keydown |
| `tbBizNo` | 사업자번호(-포함) | 글 | 이벤트 keydown |
| `tbBizStatus` | 업태 | 글 | 이벤트 keydown |
| `tbBizType` | 종목 | 글 | 이벤트 keydown |
| `tbZip` | 우편번호 | 글 | 최대 7 · 이벤트 keydown |
| `tbAddr1` | 주소 | 글 | 최대 85 · 이벤트 keydown |
| `tbAddr2` | 주소 | 글 | 최대 85 · 이벤트 keydown |
| `tbTel` |  | 글 | 최대 14 · 이벤트 keydown |
| `tbFax` | 팩스번호 | 글 | 최대 14 · 이벤트 keydown |
| `ddlCompanyType` | 업체유형 | 고르기 | 0=본사 · 1=종합몰 · 2=대리점 · 3=유통매출처 · 4=매장 · 5=물류본사 · 6=물류매출처 · 8=직영점 · 9=백화점 · 10=오픈마켓 · 11=디자인몰 · 12=자체몰 · 13=총판 · 이벤트 change (기본 `1`) |
| `ddlStatus` | 거래상태 | 고르기 | 0=거래중 · 1=중지 (기본 `0`) |
| `ddlChargeDept` | 담당부서 | 고르기 | 업무 자료 18개(적지 않음) |
| `ddlChargeNm` | 담당직원 | 고르기 | 업무 자료 45개(적지 않음) |
| `tbUserId` |  | 글 | 최대 6 · 이벤트 keydown |
| `tbPw` |  | 글 | 최대 15 · 이벤트 keydown |
| `tbNewPw` |  (숨김) | 글 | 최대 15 · 안내글 새 비밀번호 · onkeydown: `if(event.keyCode==13){$('#btnPwApply').click();return false;` · 이벤트 keydown |
| `tbMallNm` | 쇼핑몰명 | 글 | 최대 15 · 이벤트 keydown |
| `tbChargeMd` | 쇼핑몰담당자 | 글 | 이벤트 keydown |
| `tbMdTel` | 몰담당연락처 | 글 | 이벤트 keydown |
| `tbMdMail` | 몰담당자메일 | 글 | 이벤트 keydown |
| `tbMallAddr` | 쇼핑몰주소 | 글 | 이벤트 keydown |
| `tbSalesFee` | 추가상품 판매수수료(%) | 글 | 이벤트 keydown |
| `tbScmUrl` | SCMURL | 글 | 이벤트 keydown |
| `cbDStartLinkYn` | 배송출발연동여부 | 체크 | 이벤트 keydown |
| `cbPreOrderLinkYn` | 상위배송사 연동여부 | 체크 | 이벤트 keydown |
| `cbOrderLinkYn` | 배송완료연동여부 | 체크 | 이벤트 keydown |
| `cbStockViewYn` | 재고조회 허용 | 체크 | 이벤트 keydown |
| `tbMemo` | 비고사항 | 긴 글 |  |
| `ddlAccount` | 정산기준시점 | 고르기 | 1=송장등록시 · 2=배송완료시 (기본 `1`) |
| `ddlReturn` | 반품기준일 | 고르기 | 0=송장등록일 · 1=반품등록일 (기본 `0`) |
| `tbAccPeriod` | 결제기간 | 글 | 이벤트 keydown |
| `tbSettlingDt` | 추가상품 결제일 | 글 | 이벤트 keydown |
| `tbBanlNm` | 은행명 | 글 | 이벤트 keydown |
| `tbAccountNo` | 계좌번호 | 글 | 이벤트 keydown |
| `tbsalesFeePercent` | 판매수수료(%) | 글 | 이벤트 keydown,keyup |
| `cbmsgSendYn` | 알림톡 발송 여부 | 체크 | 이벤트 keydown |
| `차감` | 본사 | 라디오 | 이벤트 keydown |
| `차감` | 매출처 | 라디오 | 이벤트 keydown |
| `차감` | 사용안함 | 라디오 | 이벤트 keydown |
| `chkAS` | AS | 체크 | 이벤트 keydown |
| `chkReturn` | 반품 | 체크 | 이벤트 keydown |
| `chkInstall` | 설치 | 체크 | 이벤트 keydown |
| `chkChargeYn` | 매장앱 주문시 충전금액 확인 (숨김) | 체크 | 이벤트 keydown |
| `B2C` | B2C 매장 (숨김) | 라디오 | 이벤트 keydown |
| `B2C` | B2B 매장 (숨김) | 라디오 | 이벤트 keydown |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 5개(보임 5) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · SCM 아이디(scmId) · SCM 비밀번호(scmPw) · SCM 코드(scmCd) · SCM 키(scmKey)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `bIDChecked`

## 쪽 안 메시지

- 확인창: 선택한 행을 삭제하시겠습니까?   ▶해당 매출처의 CS내역, Q/A, 주문내역이 모두 삭제됩니다!   ▶필요시 배송관리에서 [ 엑셀 ]출력 백업 후 [ 삭제 ] 해주세요
- 등록할 매출처를 입력해주세요.
- 매출처명을 입력해주세요.
- 전화번호를 입력해주세요.
- 아이디를 입력해주세요.
- 비밀번호를 입력해주세요.
- 중복체크를 먼저 실행해 주십시오.
- 팝업 차단을 해제해주세요.
- 아이디가 입력되지 않았습니다.
- 사용중인 아이디 입니다.
- 사용가능한 아이디 입니다.

## 연결되는 화면

- `store.aspx`
- `../WebService.asmx`

## 쪽 안 함수

- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`
- `fnCheckID`: ajax `../WebService.asmx/GetIDCheck`

그 밖: `doubleSubmitCheck` · `jusoCallBack` · `oGrid_RowDeleted`
