# 하위화면 > 주문관리 > orderInsert — 주문등록

- 주소: `/System/Sales/orderInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 주문등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./orderInsert.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 상품검색 | `ImageButton2` | 조회 | `fnSalesGoodsPopup('1'); return false;` · JS만(제출 안 함) |
| 우편번호 | `btnZip2` | 미확인 | `fnZipSearch(); return false;` · JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStoreNm` |  | 고르기 | 업무 자료 19개(적지 않음) |
| `tbSOrderNo` |  | 글 | 최대 50 · 이벤트 keydown |
| `dcOrderDt` |  | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlMediaGb` | 매체구분 | 고르기 | 1=인터넷 · 2=홈쇼핑 · 3=카다로그 (기본 `1`) |
| `tbSGoodsCd` |  | 글 | 읽기전용 · 이벤트 keydown |
| `tbSGoodsNm` |  | 글 | 읽기전용 · 이벤트 keydown |
| `tbThankUGoods` | 사은품 | 글 | 최대 15 · 이벤트 keydown |
| `tbSalesQty` |  | 글 | 최대 15 · 이벤트 blur,keydown,keyup |
| `tbSupplyUnitAmt` |  | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbSalesUnitAmt` |  | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbSalesOption` | 옵션 | 글 | 최대 15 · 이벤트 keydown |
| `tbSupplyAmt` |  | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbSalesAmt` |  | 글 | 최대 15 · 이벤트 keydown,keyup |
| `cbCollectYn` | 수금여부/출고요청 | 체크 | 이벤트 keydown |
| `cbDeliveryOrderYn` | / | 체크 | 이벤트 keydown |
| `tbCollectAmt` | 수금액 | 글 | 최대 15 · 이벤트 blur,keydown,keyup |
| `tbRestAmt` | 잔금 | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbOrderer` | 주문자명 | 글 | 최대 15 · 이벤트 keydown |
| `tbOrdererTel` | 주문자전화 | 글 | 최대 40 · 이벤트 keydown |
| `tbOrdererMobile` | 주문자휴대폰 | 글 | 최대 40 · 이벤트 keydown |
| `tbRecipient` |  | 글 | 최대 15 · 이벤트 keydown |
| `tbRecipientTel` | 수취인전화 | 글 | 최대 40 · 이벤트 keydown |
| `tbRecipientMobile` |  | 글 | 최대 40 · 이벤트 keydown |
| `tbZip` | 우편번호 | 글 | 최대 7 · 이벤트 keydown |
| `tbDeliveryCost` | 선불비 | 글 | 최대 20 · 이벤트 keydown,keyup |
| `tbPostPayment` | 착불비 | 글 | 최대 20 · 이벤트 keydown,keyup |
| `tbAddr1` |  | 글 | 최대 85 · 이벤트 keydown |
| `tbAddr2` |  | 글 | 최대 85 · 이벤트 keydown |
| `dcDeliveryDt` | 출고기준일 | 날짜 | 최대 20 · 이벤트 focus,keydown,keypress,keyup |
| `dcReceiptWishDt` | 지정배송일 | 날짜 | 최대 20 · 이벤트 focus,keydown,keypress,keyup |
| `dcArrangedDt` | 배송예정일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbDeliveryMsg` | 배송메시지 | 긴 글 |  |
| `dcRegDt` |  | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbSendMsg` | (물류메모) | 긴 글 |  |

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 매출처를 선택해주세요.
- 매출처주문번호를 입력해 주세요.
- 매출처주문일을 입력해 주세요.
- 상품코드를 입력해 주세요.
- 상품명을 입력해 주세요.
- 주문수량을 입력해 주세요.
- 공급단가를 입력해 주세요.
- 판매단가를 입력해 주세요.
- 공급금액을 입력해 주세요.
- 판매금액을 입력해 주세요.
- 수취인명을 입력해 주세요.
- 수취인 휴대폰을 입력해 주세요.
- 주소를 입력해 주세요.
- 주문등록일을 입력해 주세요.
- 팝업 차단을 해제해주세요.
- 매출처를 먼저 선택해 주십시오.

## 연결되는 화면

- `orderMst.aspx`
- `../Sales/salesGoodsPopup.aspx?vendorCd=…`

## 쪽 안 함수

- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`
- `fnSalesGoodsPopup`: 팝업주소 `../Sales/salesGoodsPopup.aspx?vendorCd=`

그 밖: `doubleSubmitCheck` · `isFieldValid` · `getReturnValue` · `jusoCallBack` · `calcAmt` · `calcRestAmt`
