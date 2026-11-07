# 하위화면 > 매입처관리 > supplierDtl — 매입처 등록

- 주소: `/System/Master/supplierDtl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 매입처 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./supplierDtl.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 검사 「매입처명을 입력해주세요.」 · 검사 「아이디를 입력해주세요.」 · 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 우편번호 | `btnPost` | 미확인 | JS만(제출 안 함) |
| 중복체크 | `btnId` | 미확인 | 폼 제출(서버 처리) |
| 적용 (숨김) | `btnPwApply` | 쓰기 | 포스트백 `btnPwApply` |
| 취소 (숨김) | `` | 쓰기 | `$('#pnlPwChange').hide();` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbSupplierNm` |  | 글 | 최대 15 · 이벤트 keydown |
| `tbUrgentCall` | 긴급연락처 | 글 | 이벤트 keydown |
| `tbPresident` | 대표자명 | 글 | 이벤트 keydown |
| `tbPEmail` | 대표자연락처 | 글 | 이벤트 keydown |
| `tbBizStatus` | 업태 | 글 | 이벤트 keydown |
| `tbBizNo` | 사업자번호(-포함) | 글 | 이벤트 keydown |
| `tbZip` | 우편번호 | 글 | 이벤트 keydown |
| `tbBizType` | 종목 | 글 | 이벤트 keydown |
| `tbAddr1` | 주소 | 글 | 이벤트 keydown |
| `tbAddr2` | 주소 | 글 | 이벤트 keydown |
| `tbTel` | 전화번호 | 글 | 이벤트 keydown |
| `tbFax` | 팩스번호 | 글 | 이벤트 keydown |
| `tbId` |  | 글 | 최대 50 · 이벤트 keydown |
| `tbPwd` |  | 글 | 최대 15 · 이벤트 keydown |
| `tbNewPw` |  (숨김) | 글 | 최대 15 · 안내글 새 비밀번호 · onkeydown: `if(event.keyCode==13){$('#btnPwApply').click();return false;` · 이벤트 keydown |
| `ddlSupplierGb` | 매입처구분 | 고르기 | 업무 자료 8개(적지 않음) |
| `ddlChargeNm` | 매입처담당자 | 고르기 |  |
| `dcFirstBizDt` | 최초거래일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlStatus` | 거래상태 | 고르기 | 0=거래중 · 1=중지 (기본 `0`) |
| `tbAccPeriod` | 결제기간 | 글 | 이벤트 keydown |
| `tbSettlingDt` | 결제일 | 글 | 이벤트 keydown |
| `tbBanlNm` | 은행명 | 글 | 이벤트 keydown |
| `tbDepositor` | 예금주 | 글 | 이벤트 keydown |
| `tbAccountNo` | 계좌번호 | 글 | 이벤트 keydown |
| `ddlReturnAccGb` | 반품정산기준일 | 고르기 | 0=송장등록일 · 1=반품등록일 (기본 `0`) |
| `tbMemo` | 비고사항 | 긴 글 |  |
| `cbPrepaymentYn` | 선결제여부 | 체크 | 이벤트 keydown |
| `tbEmail` | 이메일 | 글 | 이벤트 keydown |

## 숨은 값 (이름만)

`hdKey` · `bIDChecked`

## 쪽 안 메시지

- 매입처명을 입력해주세요.
- 아이디를 입력해주세요.
- 아이디 중복여부를 확인해 주세요.
- 비밀번호를 입력해주세요.
- 확인창: 삭제하시겠습니까?
- 팝업 차단을 해제해주세요.
- 아이디가 입력되지 않았습니다.
- 사용중인 아이디 입니다.
- 사용가능한 아이디 입니다.

## 연결되는 화면

- `../../System/Master/supplier.aspx`
- `../WebService.asmx`

## 쪽 안 함수

- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`
- `fnCheckID`: ajax `../WebService.asmx/GetIDCheck`

그 밖: `doubleSubmitCheck` · `jusoCallBack` · `isFieldValid`
