# 하위화면 > 고객주문변경 > csDetl(기존 CS 열기) — 고객주문변경_상세

- 어디서: CS > 고객주문변경
- 연 방법: 목록 첫 줄의 코드로 기존 건을 열어 구조만 읽음. 값은 적지 않음
- 주소: `/System/CS/csDetl.aspx?orderNo=…&ctCd=…&csCd=…&previousPage=CS`
- 쪽 제목: VendorPia
- 화면 머리: 고객주문변경_상세
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./csDetl.aspx?orderNo=…&ctCd=…&csCd=…&previousPage=CS&vendorCd=…` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 탭·시트

- 고객문의 — id `li1` href `#tab1`
- 고객주문변경 — id `li2` href `#tab2` (처음 열림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnList` | 이동 | 폼 제출(서버 처리) |
| 수정 | `btnModify` | 쓰기 | 폼 제출(서버 처리) |
| 삭제 | `btnDelete` | 쓰기 | 확인창 「해당 CS내용을 삭제하시겠습니까?」 · 검사 「\」 · 폼 제출(서버 처리) |
| 반품취소 | `btnReturnCancel` | 쓰기 | 폼 제출(서버 처리) |
| 회수완료 | `btnRecallEnd` | 쓰기 | 폼 제출(서버 처리) |
| 우편번호 | `btnZip` | 미확인 | `fnZipSearch(); return false;` · JS만(제출 안 함) |
| 등록 | `btnImgUpdate` | 쓰기 | `fnCSUpload(); return false;` · JS만(제출 안 함) |
| 색상강조 (숨김) [탭 tab1] | `btnBoldRed` | 미확인 | 폼 제출(서버 처리) |
| Button (숨김) | `btnReflash` | 화면만 | 폼 제출(서버 처리) |
| 수정 (숨김) | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 고객문의 | `li1` | 화면만 | 링크 `#tab1` · tab #tab1 |
| 고객주문변경 | `li2` | 화면만 | 링크 `#tab2` · tab  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlRecallGbSet` | 회수지 | 고르기 | 1=지사 · 4=대체 · 2=본사 · 3=공장 (기본 `2`) |
| `tbStoreNm` | 매출처명 | 글 | 읽기전용 · 이벤트 keydown |
| `tbSOrderNo` | 몰주문/주문/배송번호 | 글 | 읽기전용 · 이벤트 keydown |
| `tbSGoodsNm` | 상품명/옵션 | 글 | 읽기전용 · 이벤트 keydown |
| `tbDGoodsNm` | 매출처상품명 | 글 | 읽기전용 · 이벤트 keydown |
| `tbSalesQty` | 주문수량 | 글 | 읽기전용 · 이벤트 keydown |
| `tbOStatus` | 주문상태 | 글 | 읽기전용 · 이벤트 keydown |
| `tbOrderer` | 주문자 | 글 | 이벤트 keydown |
| `tbOrdererTel` | 주문자휴대폰 | 글 | 이벤트 keydown |
| `tbOrdererMobile` | 주문자전화 | 글 | 이벤트 keydown |
| `tbRecipient` | 수취인 | 글 | 이벤트 keydown |
| `tbRecipM` | 수취인휴대폰 | 글 | 이벤트 keydown |
| `tbRecipientTel` | 수취인전화 | 글 | 이벤트 keydown |
| `tbORegDt` | 주문등록일 | 글 | 읽기전용 · 이벤트 keydown |
| `tbInvoiceNo` | 송장번호 | 글 | 읽기전용 · 이벤트 click,keydown |
| `ddlDCo` | 택배사 | 고르기 | 업무 자료 17개(적지 않음) · 꺼짐 |
| `tbDStatus` | 배송상태 | 글 | 읽기전용 · 이벤트 keydown |
| `tbDRegDt` | 송장등록일 | 글 | 읽기전용 · 이벤트 keydown |
| `tbOrderConfirmDt` | 주문처리일 | 글 | 읽기전용 · 이벤트 keydown |
| `tbSalesAmt` | 판매금액 | 글 | 이벤트 keydown |
| `tbSupplyAmt` | 공급금액 | 글 | 이벤트 keydown |
| `tbReceiptWishDt` | 지정배송일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbZip` | 우편번호 | 글 | 최대 7 · 이벤트 keydown |
| `tbDCostGb` | 배송비유형 | 글 | 읽기전용 · 이벤트 keydown |
| `tbArrangedDt` | 배송예정일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbAddr1` | 수취인주소 | 글 | 최대 85 · 이벤트 keydown |
| `tbAddr2` | 수취인주소 | 글 | 최대 85 · 이벤트 keydown |
| `tbDeliveryMsg` | 배송메세지 | 글 | 이벤트 keydown |
| `tbDeliveryCost` | 선불비/착불비 | 글 | 이벤트 keydown |
| `tbPostPayment` | / | 글 | 이벤트 keydown |
| `tbSendMsg` | (물류메모) | 글 | 이벤트 keydown |
| `tbMemo2` | 본사메모 | 글 | 이벤트 keydown |
| `tbDeliveryMemo` | 배송메모 | 글 | 이벤트 keydown |
| `tbRecallGb` | 회수지 | 글 | 읽기전용 · 이벤트 keydown |
| `tbInquirer` | 문의자 (숨김) [탭 tab1] | 글 | 최대 10 · 읽기전용 · 이벤트 keydown |
| `cbReplyYn` | 답변필요여부 (숨김) [탭 tab1] | 체크 | 꺼짐 · 이벤트 keydown |
| `cbBlackConsumerYn` | 블랙컨슈머등록 (숨김) [탭 tab1] | 체크 | 꺼짐 · 이벤트 keydown |
| `AreaSelect` | 고객전화수신 (숨김) [탭 tab1] | 라디오 | 이벤트 keydown |
| `AreaSelect` | 전화발신 (숨김) [탭 tab1] | 라디오 | 이벤트 keydown |
| `AreaSelect` | 직접입력 (숨김) [탭 tab1] | 라디오 | 이벤트 keydown |
| `ddlInqType` | 문의사유 (숨김) [탭 tab1] | 고르기 | 업무 자료 27개(적지 않음) |
| `ddlCallGb` | 구분 (숨김) [탭 tab1] | 고르기 | 1=배송 · 2=프레임 · 3=매트리스 · 4=기타 (기본 `1`) |
| `tbTitle` | 제목 (숨김) [탭 tab1] | 글 | 최대 50 · 읽기전용 · 이벤트 keydown |
| `ddlCallEndGb` | 처리결과 (숨김) [탭 tab1] | 고르기 | 1=처리중 · 2=처리완료 · 3=부재 · 4=확인요청 (기본 `1`) |
| `tbContent` | 문의내용 (숨김) [탭 tab1] | 긴 글 | 읽기전용 |
| `dcPromiseDt` | 고객약속일 (숨김) [탭 tab1] | 날짜 | 읽기전용 · 이벤트 focus,keydown,keypress,keyup |
| `tbAnswer` | 답변내용 (숨김) [탭 tab1] | 긴 글 |  |
| `ddlCsType` | 유형 [탭 tab2] | 고르기 | 1=취소 · 2=반품 · 3=교환 · 4=AS · 5=설치 · 꺼짐 (기본 `3`) |
| `ddlReason` | 사유 [탭 tab2] | 고르기 | 0=게시판취소 · 1=단순변심 · 2=이중주문 · 3=파손 · 4=사용부주의 · 5=상품변경 · 6=불량 · 7=오배송 · 8=품절 · 9=단종 · 10=누락 · 11=배송지연 · 12=상품회수 · 13=배송전취소 · 15=설치불가 · 16=오주문 · 17=재주문 · 18=입고지연 · 19=오출고 · 20=보상 · 21=배송불만 · 22=재고부족 · 23=재주문 · 99=기타 · 꺼짐 (기본 `0`) |
| `tbQty` | 상품수량 [탭 tab2] | 글 | 읽기전용 · 이벤트 keydown,keyup |
| `dcRegDt` | 매출처접수일 [탭 tab2] | 날짜 | 읽기전용 · 이벤트 focus,keydown,keypress,keyup |
| `ddlCSDuty` | 귀책 [탭 tab2] | 고르기 | 1=고객 · 2=제조사 · 3=물류사 · 4=본사 · 9=기타 · 꺼짐 (기본 `1`) |
| `tbCSAmt` | CS처리비용 [탭 tab2] | 글 | 읽기전용 · 이벤트 keydown |
| `tbUsableQty` | CS등록 가용수량 [탭 tab2] | 글 | 읽기전용 · 이벤트 keydown |
| `tbExInvoiceNo` | 교환송장번호 [탭 tab2] | 글 | 읽기전용 · 이벤트 keydown |
| `tbReasonDetl` | 상세사유 [탭 tab2] | 긴 글 | 읽기전용 · onchange: `javascript:Count(this,500);` · onkeyup: `javascript:Count(this,500);` |
| `chkRecallYn` | 회수 [탭 tab2] | 체크 | 꺼짐 · 이벤트 keydown |
| `dcRegistDt` | CS접수일 [탭 tab2] | 날짜 | 읽기전용 · 이벤트 focus,keydown,keypress,keyup |

## 표(그리드)

### `oGridOrder` — Infragistics WebDataGrid · 열 26개(보임 23) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CS(csYn) · 매출처명(storeNm) · 주문번호(storeOrderNo) · 상품명(sGoodsNm) · 옵션(salesOption) · 주문수량(salesQty) · 가용수량(csUsableQty) · 간선비(countryPostPay) · 조립설치비(installAmt) · 유리비(glassAmt) · 상품메모(memo) · 주문자(orderer) · 주문자전화(ordererTel) · 주문자휴대폰(ordererMobile) · 수취인(recipient) · 주소(addr1) · 몰주문일(storeOrderDt) · 등록일(registDt) · 입고일(warehousingDt) · 지사출발(branchStartDt) · 지사도착(branchEndDt) · 출발일(accRegDt) · 완료일(dEndDt)

숨은 열: 주문번호(orderNo) · 배송메세지(deliveryMsg) · 메모(dMemo)

### `oGridOrderItem` — Infragistics WebDataGrid · 열 26개(보임 19) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 순번(orderSeq) · 매입처명(supplierNm) · 창고명(warehouseNm) · 자사재고(stockType) · 단품코드(goodsCd) · 단품명(goodsNm) · Lot정보(LotViewLink) · 옵션값(optionValue) · 단품메모(memo) · 재고수량(stockQty) · 가용재고(realStockQty) · 미확정건(notConfirmQty) · 출고예정(willOutQty) · 입고예정(PO_ComingSoon) · 주문수량(qty) · 가용수량(usableQty) · 입력수량(csQty) · 매입단가(unitPrice)

숨은 열: 주문번호(orderNo) · 매입처코드(supplierCd) · 창고코드(warehouseCd) · Lot정보(LotNo) · 판매가(salesPrice) · 제품비(dcSalesPrice) · 공급가(supplyPrice)

### `oGridQNA` — Infragistics WebDataGrid · 열 9개(보임 9) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: 주문번호(orderNo) · 순번(seq) · 문의자(inquirer) · 제목(title) · 문의내용(content) · 답변자(replyer) · 답변내용(replyContent) · 접수자(regNm) · 접수일시(regDt)

### `oGridHistory` — Infragistics WebDataGrid · 열 15개(보임 14) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: No(seq) · 유형(csNm) · 수량(qty) · 사유(reasonNm) · 상세사유(reasonDetl) · 회수(recallYn) · 매출처등록일(sRegDt) · 등록일(regDt) · 접수자(registrant) · 매입처(supplierNm) · 단품명(goodsNm) · 옵션(optionValue) · 단품수(goodsQty) · 창고(warehouseNm)

숨은 열: 그리드(gridRows)


## 숨은 값 (이름만)

`hdKey` · `hdPage` · `oGridOrder_clientState` · `oGridOrderItem_clientState` · `oGridQNA_clientState` · `oGridHistory_clientState` · `hOrderNo` · `hdStatusCd` · `hdeliveryNo` · `hCSInQuery` · `tbCsType` · `hCsCd` · `hSeq` · `hTab` · `hCancelConfirm` · `hSearchCondition` · `hCtCd`

## 쪽 안 메시지

- 확인창: 해당 CS내용을 삭제하시겠습니까?
- 일괄취소는
- 일괄취소는 유형이
- 확인창: 일괄취소를 진행하시겠습니까?
- 팝업 차단을 해제해주세요.
- 원주문을 먼저 선택해 주세요. ([원주문 검색] 버튼)
- 문의자를 입력해주세요.
- 제목을 입력해주세요.
- 문의내용을 입력해주세요.
- 부분 반품/AS 처리시 상품수량을 공백으로 처리후 다시 시도해 주십시오.
- 상세사유

## 연결되는 화면

- `../Delivery/deliveryTrace.aspx?invoiceNo=…`
- `../Delivery/deliveryTraceMobile.aspx?invoiceNo=…`
- `inquiryUpload.aspx`
- `../Master/goodsLotDeliveryNoPopup.aspx?invoiceNo=…`
- `goodsImagePopup.aspx?gCd=…`
- `csList.aspx`
- `inquiryList.aspx`
- `../Kakao/KakaoDetail.aspx?msgSeqNo=…`
- `ordersPopup.aspx`
- `csImgUpload.aspx?vendorCd=…`
- `csImgView.aspx?vendorCd=…`
- `//vendorpia.com/index.aspx`

## 쪽 안 함수

- `getReturnValue`: 단추 누름 `btnReflash`
- `fnZipSearch`: 팝업주소 `../Master/jusopopup.asp`
- `oGridOrderItem_CellSelectionChanged`: 팝업주소 `../Master/goodsLotDeliveryNoPopup.aspx?invoiceNo=` · 팝업주소 `goodsImagePopup.aspx?gCd=`
- `kakaoGrid_CellSelectionChanged`: 팝업주소 `../Kakao/KakaoDetail.aspx?msgSeqNo=`
- `oGridQNA_CellSelectionChanged`: → `csDetl.aspx?`
- `OpenOrderList`: 팝업주소 `ordersPopup.aspx`
- `fnCSUpload`: 팝업주소 `csImgUpload.aspx?vendorCd=`
- `fnSearch`: 단추 누름 `btnSearch`
- `fnCSImgView`: 팝업주소 `csImgView.aspx?vendorCd=`

그 밖: `doubleSubmitCheck` · `jusoCallBack` · `fnByteLen` · `fnCheckDInfoLen` · `Count` · `oGrid_CellSelectionChanged` · `oGrid_HeaderCheckBoxClicked` · `oGrid_Editing_CellValueChanging` · `oGrid_CellEditing_EnteringEditMode` · `fnClose`
