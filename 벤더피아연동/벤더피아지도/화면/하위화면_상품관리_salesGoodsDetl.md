# 하위화면 > 상품관리 > salesGoodsDetl — 상품 등록

- 주소: `/System/Master/salesGoodsDetl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 상품 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./salesGoodsDetl.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| 이미지 삭제 | `btnImgDelete` | 쓰기 | 확인창 「이미지를 삭제하시겠습니까?」 · 폼 제출(서버 처리) |
| 행추가 | `btnDAdd` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnDDel` | 화면만 | JS만(제출 안 함) |
| 행추가 | `btnPAdd` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnPDel` | 화면만 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStoreNm` |  | 고르기 | 업무 자료 19개(적지 않음) |
| `ddlDCoNm` |  | 고르기 | 업무 자료 17개(적지 않음) |
| `ddlStatus` | 판매상태 | 고르기 | 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `tbSGoodsNm` |  | 글 | 최대 100 · 이벤트 keydown |
| `tbStoreGoodsCd` |  | 글 | 최대 20 · 이벤트 keydown |
| `tbStoreGoodsNm` | 매출처상품명 | 글 | 최대 200 · 이벤트 keydown |
| `ddlUser` |  | 고르기 | 업무 자료 46개(적지 않음) |
| `cbGoodsOptionYn` |  | 체크 | 이벤트 keydown |
| `tbSpec` | 규격 | 글 | 최대 100 · 이벤트 keydown |
| `tbUnitType` | 단위 | 글 | 최대 100 · 이벤트 keydown |
| `ddlDCostGb` | 착불 | 고르기 | 업무 자료 3개(적지 않음) |
| `tbDeliveryCost` | 수도권 선불비 | 글 | 이벤트 keydown,keyup |
| `tbPostPayment` | 수도권 착불비 | 글 | 이벤트 keydown,keyup |
| `tbSGoodsAmt1` | 수도권 제품비 | 글 | 이벤트 keydown,keyup |
| `tbDCoAccAmt1` | 수도기사 운임비 | 글 | 이벤트 keydown,keyup |
| `tbDeliveryCost2` | 수도외곽 선불비 | 글 | 이벤트 keydown,keyup |
| `tbPostPayment2` | 수도외곽 착불비 | 글 | 이벤트 keydown,keyup |
| `tbSGoodsAmt2` | 수도외곽 제품비 | 글 | 이벤트 keydown,keyup |
| `tbDCoAccAmt2` | 충청기사 운임비 | 글 | 이벤트 keydown,keyup |
| `tbCountryDCost` | 지방 선불비 | 글 | 이벤트 keydown,keyup |
| `tbCountryPostPay` | 지방 착불비 | 글 | 이벤트 keydown,keyup |
| `tbSGoodsAmt3` | 지방 제품비 | 글 | 이벤트 keydown,keyup |
| `tbDCoAccAmt3` | 경상기사 운임비 | 글 | 이벤트 keydown,keyup |
| `tbCountryDCost2` | 지방외곽 선불비 | 글 | 이벤트 keydown,keyup |
| `tbCountryPostPay2` | 지방외곽 착불비 | 글 | 이벤트 keydown,keyup |
| `tbSGoodsAmt4` | 지방외곽 제품비 | 글 | 이벤트 keydown,keyup |
| `tbDCoAccAmt4` | 전라기사 운임비 | 글 | 이벤트 keydown,keyup |
| `tbjejuCost` | 제주 선불비 | 글 | 이벤트 keydown,keyup |
| `tbjejuPostPay` | 제주 착불비 | 글 | 이벤트 keydown,keyup |
| `tbDCoAccAmt5` | 강원기사운임비 | 글 | 이벤트 keydown,keyup |
| `tbInstallAmt` | 조립설치비 | 글 | 이벤트 keydown,keyup |
| `tbGlassAmt` | 유리비 | 글 | 이벤트 keydown,keyup |
| `tbMemo` | 상품메모 | 글 | 최대 50 · 이벤트 keydown |
| `tbDeliverySendMsg` | 물류전달메모 | 글 | 최대 50 · 이벤트 keydown |
| `FileUpload1` | 상품이미지 : | 파일 | 이벤트 keydown |

## 표(그리드)

### `dGrid` — Infragistics WebDataGrid · 열 12개(보임 8) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 매입처명(supplierNm) · 바코드(modelNo) · 단품코드(goodsCd) · cellBtn · 단품명(goodsNm) · 단품수량(goodsQty) · 매입단가(purchaseAmt)

숨은 열: 순번(seq) · 매입처코드(supplierCd) · 판매단가(salesPrice) · 공급단가(supplyPrice)

### `pGrid` — Infragistics WebDataGrid · 열 6개(보임 6) · 불러온 줄 있음: 아니오
- 기능: activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 순번(seq) · 판매단가(salesUnitAmt) · 공급단가(supplyUnitAmt) · 시작일(startDt) · 종료일(endDt)


## 숨은 값 (이름만)

`hdKey` · `dGrid_clientState` · `pGrid_clientState` · `bGoodCdChecked` · `hMODE`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.
- 확인창: 삭제하시겠습니까?
- 매출처명을 선택해주세요.
- 매출처상품코드를 입력해주세요.
- 상품명을 입력해주세요.
- 판매담당을 선택해주세요.
- 배송사를 선택해주세요.
- 단품정보가 등록되지 않았습니다.
- [단품정보]
- 가격정보가 등록되지 않았습니다.
- [가격정보]

## 연결되는 화면

- `categoryPopup.aspx`
- `salesGoods.aspx`
- `../Sales/goodsPopup.aspx?vendorCd=…`

## 쪽 안 함수

- `fnCategory`: 팝업주소 `categoryPopup.aspx`
- `fnPopup`: 팝업주소 `../Sales/goodsPopup.aspx?vendorCd=`
- `fnFirst`: 단추 누름 `btnDAdd` · 단추 누름 `btnPAdd`

그 밖: `doubleSubmitCheck` · `oGrid_CellSelectionChanged` · `fnClose` · `fnDel` · `fnDeleteRow` · `getReturnValue` · `isFieldValid` · `nextGridSeq`
