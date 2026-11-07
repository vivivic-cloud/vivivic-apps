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
| 저장 | `btnSave` | 쓰기 | onclick `return isFieldValid();` 뒤 폼 제출(서버 처리, 그림 단추) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| 단품분류 | `btnCategory` | 팝업 | `fnCategory` → `categoryPopup.aspx` · 돌아오면 `getReturnValue({categoryCd, categoryNm})` 가 두 칸을 채움 |
| 중복체크 | `btnExist` | 조회 | `fnGetGoodsCd` → `WebService.asmx/GetGoodCdYN` · 되면 `bGoodCdChecked`=`true` + alert 「사용가능한 단품코드 입니다.」 |
| 행추가 | `btnDAdd` | 화면만 | JS만(제출 안 함) |
| 행삭제 | `btnDDel` | 화면만 | JS만(제출 안 함) |
| 옵션관리 | `btnOptionPopup` | 팝업 | `fnOptionPopup();` |
|  (숨김) | `btnOptionReload` | 미확인 | 폼 제출(서버 처리) |
|  | `` | 미확인 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbCategoryCd` | 단품분류명* (코드) | 글 | 읽기전용 · 이벤트 keydown |
| `tbCategoryNm` | 단품분류명* (이름) | 글 | 읽기전용 · 이벤트 keydown |
| `tbGoodsCd` | 단품코드 | 글 | 최대 20 · 처음 값 = 서버가 채운 숫자 8자리(시각으로 보임 — 짐작) · 이벤트 keydown |
| `ddlWarehouseNm` | 창고명* | 고르기 | 업무 자료 22개(적지 않음) · 첫 값 `선택하세요`, 처음 고름 `100` |
| `tbGoodsNm` | 단품명* | 글 | 이벤트 keydown |
| `tbThankUgoods` | 사은품 | 글 | 최대 20 · 이벤트 keydown |
| `tbModelNo` | 바코드 | 글 | 최대 30 · 이벤트 keydown |
| `ddlBundleYn` | 합포장여부 | 고르기 | 1=가능 · 0=불가능 (기본 `1`) |
| `tbPackUnit` | 포장단위* | 글 | 최대 3 · 처음 값 `0` · 이벤트 keydown |
| `ddlTaxYn` | 과세여부 | 고르기 | 1=과세 · 0=면세 (기본 `1`) |
| `ddlDCo` | 배송사명 | 고르기 | 업무 자료 17개(적지 않음) |
| `ddlStockType` | 재고유형 | 고르기 | 1=자사 · 0=타사 (기본 `1`) |
| `ddlOrderingType` | 재고유형 | 고르기 | 1=구매발주 · 0=생산발주 (기본 `1`) |
| `ddlSalesStatus` | 판매상태 | 고르기 | 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `cbAddGoodsYn` | 추가단품여부 | 체크 | 이벤트 keydown |
| `ddlDCostGb` | 배송료구분 | 고르기 | 업무 자료 3개(적지 않음) |
| `tbBoxQty` | 박스수량 | 글 | 이벤트 keydown,keyup |
| `tbCellNm` | 생산셀명 | 글 | 처음 값 `0` · 이벤트 keydown |
| `tbBoxCd` | 포장박스코드 | 글 | 처음 값 `0` · 이벤트 keydown |
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

## 저장 검사 `isFieldValid` (11-07 사장님 크롬에서 잼)

차례: 단품분류(`tbCategoryCd` 빈칸) → 단품코드(`tbGoodsCd` 빈칸) → 중복체크(`bGoodCdChecked` 가 `true` 아님) → 단품명 → 창고(`선택하세요`) → 포장단위 빈칸 → 주거래여부. 알림 글은 아래 「쪽 안 메시지」.
함정: 주거래 동그라미 id 가 `rdbRadio` 라 쪽 코드가 넣는 `hdmajorBizYn` 은 사람이 눌러도 `NaN` 이다(벤더피아 동작 그대로). 동그라미를 누르고 나머지가 차면 `isFieldValid` 는 true.
숨은 창(`sandbox="allow-same-origin allow-scripts allow-forms"`)에서 쪽 JS 가 그대로 돈다: 중복체크·동그라미 누름·`isFieldValid` 확인함(저장은 안 눌러 봄).

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 10개(보임 10) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

- 처음에 1줄(매입처 처음 값 하나 · 시작일 오늘 · 종료일 2050-12-31). 칸 키는 괄호 안 이름. `set_value` 로 숫자가 들어가고 그때 XHR 없음(숨은 창에서 잼, `oGrid_clientState` 길이는 그때 안 바뀜 — 저장 때 실리는지는 미확인).
- 매입처 칸 고르개 `oGrid_ddlDelivery`(WebDropDown)는 쪽을 열 때 항목 1개뿐 — 나머지를 어떻게 불러오는지 미확인.

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
