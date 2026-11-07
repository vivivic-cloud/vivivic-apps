# 하위화면 > 배송사관리 > deliveryCoDetl — 배송사 등록

- 주소: `/System/Master/deliveryCoDetl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 배송사 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./deliveryCoDetl.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1 · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 검사 「배송사명을 입력해주세요.」 · 검사 「아이디를 입력해주세요.」 · 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| 우편번호 | `btnPost` | 미확인 | JS만(제출 안 함) |
| 아이디체크 | `btnIDCheck` | 미확인 | 폼 제출(서버 처리) |
| 적용 (숨김) | `btnPwApply` | 쓰기 | 포스트백 `btnPwApply` |
| 취소 (숨김) | `` | 쓰기 | `$('#pnlPwChange').hide();` |
| 행추가 (숨김) | `btnDInsert` | 화면만 | JS만(제출 안 함) |
| 행삭제 (숨김) | `btnDDelete` | 화면만 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlDCoCd` |  | 고르기 | 업무 자료 103개(적지 않음) · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlDCoC` |
| `tbDCoNm` |  | 글 | 이벤트 keydown |
| `cbdelivererYn` |  | 체크 | 이벤트 keydown |
| `cbUseYn` |  | 체크 | 이벤트 keydown |
| `tbPresident` | 대표자명 | 글 | 이벤트 keydown |
| `tbBizNo` | 사업자번호(-포함) | 글 | 이벤트 keydown |
| `tbCeoEmail` | CEO 이메일 | 글 | 이벤트 keydown |
| `tbCeoTel` | CEO 전화번호 | 글 | 이벤트 keydown |
| `tbBizStatus` | 업태 | 글 | 이벤트 keydown |
| `tbBizType` | 종목 | 글 | 이벤트 keydown |
| `tbZip` | 우편번호 | 글 | 읽기전용 · 이벤트 keydown |
| `tbAccRate` | 물류배송사 정산율 | 글 | 이벤트 keydown |
| `tbAddr1` | 주소 | 글 | 이벤트 keydown |
| `tbAddr2` | 주소 | 글 | 이벤트 keydown |
| `tbTel` | 전화번호 | 글 | 최대 14 · 이벤트 keydown |
| `tbFax` | 팩스번호 | 글 | 최대 14 · 이벤트 keydown |
| `tbId` |  | 글 | 최대 6 · 이벤트 keydown |
| `tbPwd` |  | 글 | 최대 15 · 이벤트 keydown |
| `tbNewPw` |  (숨김) | 글 | 최대 15 · 안내글 새 비밀번호 · onkeydown: `if(event.keyCode==13){$('#btnPwApply').click();return false;` · 이벤트 keydown |
| `tbCost` | 배송비 | 글 | 최대 15 · 이벤트 keydown,keyup |
| `ddlStatus` | 거래상태 | 고르기 | 0=거래중 · 1=중지 (기본 `0`) |
| `tbUrl` | 참조URL | 글 | 이벤트 keydown |
| `tbParam` | Parameter | 글 | 이벤트 keydown |
| `tbAccPeriod` | 결제기간 | 글 | 이벤트 keydown |
| `tbSettlingDt` | 결제일 | 글 | 이벤트 keydown |
| `tbBanlNm` | 은행명 | 글 | 이벤트 keydown |
| `tbDepositor` | 예금주명 | 글 | 이벤트 keydown |
| `tbAccountNo` | 계좌번호 | 글 | 이벤트 keydown |
| `cbCountryYn` |  | 체크 | 꺼짐 · 이벤트 keydown |
| `ddlWarehouse` | 소속창고 | 고르기 | 업무 자료 22개(적지 않음) · 꺼짐 |
| `ddlOrderJoin` | 주문연동여부 | 고르기 | 1=연동안함 · 2=주문확정시〓▶전송 · 3=지사출발시〓▶전송 · 꺼짐 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlOrde` (기본 `1`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 2개(보임 2) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 배송기사명(deliverer)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `bIDChecked`

## 쪽 안 메시지

- 배송사명을 입력해주세요.
- 아이디를 입력해주세요.
- 비밀번호를 입력해주세요.
- 중복체크를 먼저 실행해 주십시오.
- 팝업 차단을 해제해주세요.
- 아이디가 입력되지 않았습니다.
- 사용중인 아이디 입니다.
- 사용가능한 아이디 입니다.
- 저장할 해당배송사명을 선택하거나 \r 기타배송사를 입력하세요
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `deliveryCoNmPopup.aspx`
- `../WebService.asmx`
- `deliveryCo.aspx`

## 쪽 안 함수

- `fnDeliveryCoNm`: 팝업주소 `deliveryCoNmPopup.aspx`
- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`
- `fnCheckID`: ajax `../WebService.asmx/GetIDCheck`

그 밖: `doubleSubmitCheck` · `getReturnValue` · `jusoCallBack` · `oGrid_RowDeleted` · `fnClose` · `fnSave` · `fnDel` · `DeleteRow`
