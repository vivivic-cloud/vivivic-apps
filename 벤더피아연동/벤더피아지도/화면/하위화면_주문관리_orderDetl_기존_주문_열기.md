# 하위화면 > 주문관리 > orderDetl(기존 주문 열기) — 주문상세내역

- 어디서: 판매관리 > 주문관리
- 연 방법: 목록 첫 줄의 코드로 기존 건을 열어 구조만 읽음. 값은 적지 않음
- 주소: `/System/Sales/orderDetl.aspx?orderNo=…&sCd=…&sNm=…&sGoodsCd=…&vendorCd=…&storeCd=…&supplierCd=…&dCoCd=…&sOrderNo=…&storeGoodsCd=…&sGoodsNm=…&orderer=…&recipient=…`
- 쪽 제목: VendorPia
- 화면 머리: 주문상세내역
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./orderDetl.aspx?orderNo=…&sCd=…&sNm=…&sGoodsCd=…&vendorCd=…&storeCd=…&supplierCd=…&dCoCd=…&sOrderNo=…&storeGoodsCd=…&sGoodsNm=…&orderer=…&recipient=…` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 주문복사 | `btnOrderCopy` | 이동 | 팝업주소 `orderCopyInsert.aspx?vendorCd=…` |
| 상품검색 | `btnSGoods` | 조회 | `fnSalesGoodsPopup(0); return false;` · JS만(제출 안 함) |
| 행추가 | `btnDAdd` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnDDel` | 화면만 | JS만(제출 안 함) |
| 우편번호 | `btnZip` | 미확인 | `fnZipSearch(); return false;` · JS만(제출 안 함) |
| 상품변경 (숨김) | `btnGoodChange` | 쓰기 | 폼 제출(서버 처리) |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbMall` | 몰 | 글 | 최대 50 · 이벤트 keydown |
| `tbSOrderNo` | 매출처주문번호 | 글 | 최대 50 · 이벤트 keydown |
| `ddlMediaGb` | 매체구분 | 고르기 | 1=인터넷 · 2=홈쇼핑 · 3=카다로그 (기본 `1`) |
| `dcOrderDt` | 주문일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbSGoodsCd` |  | 글 | 읽기전용 · 이벤트 keydown |
| `tbSGoodsNm` |  | 글 | 읽기전용 · 이벤트 keydown |
| `tbThankUGoods` | 사은품 | 글 | 최대 15 · 이벤트 keydown |
| `dcConfirmDt` | 주문처리일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbSalesQty` | /가용수량 | 글 | 최대 15 · 이벤트 blur,keydown,keyup |
| `tbCsUsableQty` | /가용수량 | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbSupplyUnitAmt` |  | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbSalesUnitAmt` |  | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbSupplyAmt` | 공급금액 | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbSalesAmt` | 판매금액 | 글 | 최대 15 · 이벤트 keydown,keyup |
| `tbStoreGoodsNm` | 매출처상품명 | 글 | 최대 200 · 이벤트 keydown |
| `tbSalesOption` | 주문옵션 | 긴 글 |  |
| `tbCollectAmt` | 수금액/잔액 | 글 | 최대 15 · 이벤트 blur,keydown,keyup |
| `lbRestAmt` | 수금액/잔액 | 글 | 최대 15 · 읽기전용 · 이벤트 keydown |
| `cbCollectYn` | 수금액/잔액 | 체크 | 이벤트 keydown |
| `cbDeliveryOrderYn` | 수금여부 | 체크 | 이벤트 keydown |
| `cbBundleYn` | 출고여부 | 체크 | 이벤트 keydown |
| `tbOrderer` | 주문자명 | 글 | 최대 15 · 이벤트 keydown |
| `tbOrdererTel` | 주문자전화 | 글 | 최대 40 · 이벤트 keydown |
| `tbOrdererMobile` | 주문자휴대폰 | 글 | 최대 40 · 이벤트 keydown |
| `tbRecipient` |  | 글 | 최대 15 · 이벤트 keydown |
| `tbRecipientTel` |  | 글 | 최대 40 · 이벤트 keydown |
| `tbRecipientMobile` |  | 글 | 최대 40 · 이벤트 keydown |
| `tbZip` | 우편번호 | 글 | 최대 7 · 이벤트 keydown |
| `ddlDCo` | 배송사 | 고르기 | 업무 자료 17개(적지 않음) |
| `ddlDCostGb` | 배송비유형 | 고르기 | 업무 자료 4개(적지 않음) |
| `tbAddr1` |  | 글 | 최대 85 · 이벤트 keydown |
| `tbAddr2` |  | 글 | 최대 85 · 이벤트 keydown |
| `dcArrangedDt` | 배송예정일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcDeliveryDt` | 지방상차일 | 날짜 | 최대 20 · 이벤트 focus,keydown,keypress,keyup |
| `dcReceiptWishDt` | 지정배송일 | 날짜 | 최대 20 · 이벤트 focus,keydown,keypress,keyup |
| `tbDeliveryCost` | 선불배송비 | 글 | 최대 20 · 이벤트 keydown,keyup |
| `tbDeliveryMsg` | 배송메시지 | 긴 글 |  |
| `tbPostPayment` | 착불비 / 제품비 | 글 | 최대 20 · 이벤트 keydown,keyup |
| `tbSGoodsAmt` | 착불비 / 제품비 | 글 | 최대 20 · 이벤트 keydown,keyup |
| `tbDvrAccAmt` | 기사운임 | 글 | 최대 20 · 이벤트 keydown,keyup |
| `tbSendMsg` | (물류메모) | 긴 글 |  |
| `tbMemo2` | 본사메모 | 긴 글 |  |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 19개(보임 16) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 매입처명(supplierNm) · 재고유형(stockType) · 분류(categoryNm) · 단품코드(goodsCd) · cellBtn · 단품명(goodsNm) · 옵션값(optionValue) · 수량(qty) · 가용수량(usableQty) · 매입단가(unitPrice) · 자재원가(itemPrice) · 창고(warehouseCd) · AS여부(asYn) · 생산지시메모(POMemo) · 배송번호(deliveryNo)

숨은 열: rowKey · 주문순번(orderSeq) · 매입처코드(supplierCd)

### `dGrid` — Infragistics WebDataGrid · 열 11개(보임 11) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: 배송번호(deliveryNo) · 상품명(salesGoodsNm) · 배송상태(status) · 배송사(deliveryCoCd) · 판매 배송메모(memo) · 단품명(goodsNm) · 선불비(deliveryCost) · 착불비(postPayment) · 송장번호(invoiceNo) · 송장등록일(accRegDt) · 송장등록자(accRegNm)


## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `dGrid_clientState` · `hOrderNo` · `hStatus` · `hDeliveryNo` · `hDStatus` · `hCompanyType` · `hSupplyUnitAmt` · `hSalesUnitAmt` · `hSupplyAmt` · `hSalesAmt` · `hStoreCd` · `hStoreNm` · `hColseYn` · `sGoodInfo`

## 쪽 안 메시지

- 상품코드를 선택해주세요.
- 상품명을 선택해주세요.
- 주문수량을 입력해주세요.
- 공급단가를 입력해주세요.
- 판매단가를 입력해주세요.
- 수취인명을 입력해주세요.
- 수취인 전화를 입력해주세요.
- 수취인 휴대폰을 입력해주세요.
- 주소를 입력해주세요.
- 배송사를 선택해주세요.
- 옵션이 선택되지 않았습니다.  해당 옵션을 선택해 주세요
- 팝업 차단을 해제해주세요.
- 매출처를 먼저 선택해 주십시오.

## 연결되는 화면

- `orderMst.aspx`
- `orderCopyInsert.aspx?vendorCd=…`
- `../Sales/salesGoodsPopup.aspx?vendorCd=…`
- `../Sales/goodsPopup.aspx?vendorCd=…`
- `../CS/csImgView.aspx?vendorCd=…`

## 쪽 안 함수

- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`
- `fnSalesGoodsPopup`: 팝업주소 `../Sales/salesGoodsPopup.aspx?vendorCd=`
- `fnPopup`: 팝업주소 `../Sales/goodsPopup.aspx?vendorCd=`
- `getReturnValue`: 단추 누름 `btnGoodChange`
- `fnCSImgView`: 팝업주소 `../CS/csImgView.aspx?vendorCd=`

그 밖: `doubleSubmitCheck` · `isFieldValid` · `jusoCallBack` · `calcAmt` · `calcRestAmt` · `GetCheckOption` · `oGrid_CellEditing_ExitedEditMode` · `oGrid_CellEditing_EnteredEditMode` · `DropDownOpening` · `oGrid_CellSelectionChanged` · `oGrid_RowDeleted`
