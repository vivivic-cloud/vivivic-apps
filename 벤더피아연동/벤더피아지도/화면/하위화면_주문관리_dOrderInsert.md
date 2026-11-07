# 하위화면 > 주문관리 > dOrderInsert — 주문등록

- 주소: `/System/Sales/dOrderInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 주문등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./dOrderInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 우편번호 | `btnZip2` | 미확인 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStoreNm` |  | 고르기 | 업무 자료 19개(적지 않음) |
| `tbStoreOrderNo` | 매출처주문번호 | 글 | 최대 50 |
| `tbMall` | 쇼핑몰 | 글 | 최대 10 |
| `tbThankUgoods` | 생산처 | 글 | 최대 15 |
| `tbdGoodsNm` |  | 긴 글 |  |
| `tbSalesOption` | 옵션 | 긴 글 |  |
| `tbSalesQty` |  | 글 | 최대 3 · 이벤트 keyup |
| `tbBoxQty` | 박스수량 | 글 | 최대 3 · 이벤트 keyup |
| `tbSupplyUnitAmt` | 선불비 | 글 | 최대 9 · 이벤트 keyup |
| `tbSupplyAmt` | 착불비 | 글 | 최대 9 · 이벤트 keyup |
| `tbOrderer` | 주문자명 | 글 | 최대 15 |
| `tbOrdererTel` | 주문자전화 | 글 | 최대 40 |
| `tbOrdererMobile` | 주문자휴대폰 | 글 | 최대 40 |
| `tbRecipient` |  | 글 | 최대 15 |
| `tbRecipientTel` |  | 글 | 최대 40 |
| `tbRecipientMobile` |  | 글 | 최대 40 |
| `tbZip` | 우편번호 | 글 | 최대 7 |
| `tbAddr1` | 주소 | 글 | 최대 85 |
| `tbAddr2` | 주소 | 글 | 최대 85 |
| `dcArrangedDt` | 배송예정(지정)일 | 날짜 | 최대 20 · 이벤트 focus,keydown,keypress,keyup |
| `tbDeliveryMsg` | 배송메시지 | 긴 글 |  |
| `dcRegDt` | 주문등록일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |

## 숨은 값 (이름만)

`hdKey` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.
- 등록할 매출처를 선택해주세요.
- 상품명을 입력해 주세요.
- 주문수량을 입력해 주세요.
- 수취인명을 입력해 주세요.
- 수취인 전화번호를 입력해 주세요.
- 수취인 휴대전화번호를 입력해 주세요.
- 주소를 입력해 주세요.
- 창고를 선택해주세요.
- 주거래여부를 선택해 주세요.
- 이미 실행중입니다.

## 연결되는 화면

- `orderMst.aspx`

## 쪽 안 함수

- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`

그 밖: `jusoCallBack` · `isFieldValid` · `doubleSubmitCheck`
