# 하위화면 > 단품관리 > goodsDetl — 단품 등록

- 주소: `/System/Master/goodsDetl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./goodsDetl.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| 단품분류 | `btnCategory` | 미확인 | JS만(제출 안 함) |
| 중복체크 | `btnExist` | 미확인 | JS만(제출 안 함) |
| 행추가 | `btnDAdd` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnDDel` | 화면만 | JS만(제출 안 함) |
| 옵션관리 | `btnOptionPopup` | 팝업 | `fnOptionPopup();` |
|  (숨김) | `btnOptionReload` | 미확인 | 폼 제출(서버 처리) |
|  | `` | 미확인 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbCategoryCd` |  | 글 | 읽기전용 · 이벤트 keydown |
| `tbCategoryNm` |  | 글 | 읽기전용 · 이벤트 keydown |
| `tbGoodsCd` | 단품코드 | 글 | 최대 20 · 이벤트 keydown |
| `ddlWarehouseNm` |  | 고르기 | 업무 자료 22개(적지 않음) |
| `tbGoodsNm` |  | 글 | 이벤트 keydown |
| `tbThankUgoods` | 사은품 | 글 | 최대 20 · 이벤트 keydown |
| `tbModelNo` | 바코드 | 글 | 최대 30 · 이벤트 keydown |
| `ddlBundleYn` | 합포장여부 | 고르기 | 1=가능 · 0=불가능 (기본 `1`) |
| `tbPackUnit` |  | 글 | 최대 3 · 이벤트 keydown |
| `ddlTaxYn` | 과세여부 | 고르기 | 1=과세 · 0=면세 (기본 `1`) |
| `ddlDCo` | 배송사명 | 고르기 | 업무 자료 17개(적지 않음) |
| `ddlStockType` | 재고유형 | 고르기 | 1=자사 · 0=타사 (기본 `1`) |
| `ddlOrderingType` | 재고유형 | 고르기 | 1=구매발주 · 0=생산발주 (기본 `1`) |
| `ddlSalesStatus` | 판매상태 | 고르기 | 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `cbAddGoodsYn` |  | 체크 | 이벤트 keydown |
| `ddlDCostGb` | 배송료구분 | 고르기 | 업무 자료 3개(적지 않음) |
| `tbBoxQty` | 박스수량 | 글 | 이벤트 keydown,keyup |
| `tbCellNm` | 생산셀명 | 글 | 이벤트 keydown |
| `tbBoxCd` | 포장박스코드 | 글 | 이벤트 keydown |
| `tbDeliveryCost` | 수도권 선불비 | 글 | 이벤트 keydown,keyup |
| `tbPostPayment` | 수도권 착불비 | 글 | 이벤트 keydown,keyup |
| `tbDeliveryCost2` | 수도권외곽 선불비 | 글 | 이벤트 keydown,keyup |
| `tbPostPayment2` | 수도권외곽 착불비 | 글 | 이벤트 keydown,keyup |
| `tbCountryDCost` | 지방 선불비 | 글 | 이벤트 keydown,keyup |
| `tbCountryPostPay` | 지방 착불비 | 글 | 이벤트 keydown,keyup |
| `tbCountryDCost2` | 지방외곽 선불비 | 글 | 이벤트 keydown,keyup |
| `tbCountryPostPay2` | 지방외곽 착불비 | 글 | 이벤트 keydown,keyup |
| `tbMemo` | 메모 | 긴 글 |  |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_tp_rr` | Rows: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_tp_cc` | Cols: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_tp_al` | Align: (숨김) | 고르기 | default=Default · left=Left · right=Right · center=Center (기본 `default`) |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_tp_cp` | Cell padding: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_tp_bds` | Border size: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_tp_cs` | Cell spacing: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_tp_w` | Width: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_cp_ha` | Horizontal alignment: (숨김) | 고르기 | default=Default · left=Left · right=Right · center=Center (기본 `default`) |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_cp_va` | Vertical alignment: (숨김) | 고르기 | default=Default · top=Top · middle=Middle · bottom=Bottom · baseline=Baseline (기본 `default`) |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_cp_w` | Width: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_cp_h` | Height: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_cp_nw` | Height: (숨김) | 체크 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_r_w` | Width: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_r_s` | Size: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_r_al` | Align: (숨김) | 고르기 | default=Default · left=Left · right=Right · center=Center (기본 `default`) |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_r_sld` | Color: (숨김) | 체크 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_f_fw` | Find what: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_f_rw` | Replace with: (숨김) | 글 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_f_mc` | Match case (숨김) | 체크 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_f_mw` | Match whole word (숨김) | 체크 | 이벤트 keydown |
| `ctl00_Contents_ProductDescWebHtmlEditor_iged_b_n` | Bookmark name: (숨김) | 글 | 이벤트 keydown |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 10개(보임 10) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 순번(seq) · 매입처(supplierCd) · 주거래여부(majorBizYn) · 매장판매단가(salesPrice) · 자재원가(itemPrice) · 비용(itemCost) · 매입단가(purchaseAmt) · 시작일(startDt) · 종료일(endDt)


## 숨은 값 (이름만)

`hdKey` · `hdmajorBizYn` · `oGrid_clientState` · `uTree_clientState` · `hNode` · `bGoodCdChecked` · `hdSupplier`

## 쪽 안 메시지

- 단품을 먼저 저장한 뒤, 단품 수정 화면에서 옵션을 등록하세요.
- 팝업 차단을 해제해주세요.
- 옵션을 선택해주세요!
- 옵션을 먼저 선택해 주세요.
- 옵션명을 입력해 주세요.
- 확인창: 삭제하시겠습니까?
- 단품코드가 입력되지 않았습니다.
- 사용중인 단품코드 입니다.
- 사용가능한 단품코드 입니다.
- 단품분류를 선택해주세요.
- 단품코드를 선택해주세요.
- 단품코드 중복여부를 체크해주세요.
- 단품명을 선택해주세요.
- 창고를 선택해주세요.
- 포장단위을 입력해주세요.
- 주거래여부를 선택해 주세요.

## 연결되는 화면

- `goodsOptionPopup.aspx?goodsCd=…`
- `categoryPopup.aspx`
- `../../System/Master/goods.aspx`
- `../WebService.asmx`

## 쪽 안 함수

- `fnOptionPopup`: 팝업주소 `goodsOptionPopup.aspx?goodsCd=`
- `fnOptionReload`: 단추 누름 `btnOptionReload`
- `fnCategory`: 팝업주소 `categoryPopup.aspx`
- `fnGetGoodsCd`: ajax `../WebService.asmx/GetGoodCdYN`
- `fnFirst`: 단추 누름 `btnDAdd`

그 밖: `doubleSubmitCheck` · `oGrid_CellSelectionChanged` · `uTreeNodeSelected` · `fnNodeDelete` · `fnNodeUpdate` · `fnNodeInsert` · `getReturnValue` · `fnClose` · `fnDel` · `isFieldValid` · `WebDataGrid1_Selection_RowSelectionChanging` · `oGrid_RowDeleted` · `checkedHandler`
