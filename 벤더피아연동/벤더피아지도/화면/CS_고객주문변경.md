# CS > 고객주문변경

- 주소: `/System/CS/csList.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 고객주문변경 목록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./csList.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 엑셀 | `btnExcel` | 내려받기 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 이동 | → `csDetl.aspx?previousPage=CS` |
| 일괄등록 | `btnCsUpload` | 이동 | → `csUpload.aspx` |
| (그림 icon_listdel.gif, 삭제로 보임) | `btnDelete` | 쓰기 | 폼 제출(서버 처리) |
| (그림 icon_collecompl.gif, 회수완료로 보임) | `btnCollect` | 쓰기 | 검사 「회수지를 선택해 주십시오.」 |
| (그림 icon_collecc.gif, 회수취소로 보임) | `btnCollectCancel` | 쓰기 | 폼 제출(서버 처리) |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |
| 오늘 | `btnRecallToday` | 화면만 | JS만(제출 안 함) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 매출처 | 고르기 | 업무 자료 19개(적지 않음) |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlStockType` | 재고유형 | 고르기 | 전체 · 1=자사 · 0=타사 (기본 `전체`) |
| `tbSOrderNo` | 주문번호 | 글 |  |
| `tbSGoodsNm` | 상품명 | 글 |  |
| `tbRecipient` | 수취인 | 글 |  |
| `ddlDeliveryCo` | 배송사 | 고르기 | 업무 자료 17개(적지 않음) |
| `ddlReason` | 사유 | 고르기 | 전체 · 0=게시판취소 · 1=단순변심 · 2=이중주문 · 3=파손 · 4=사용부주의 · 5=상품변경 · 6=불량 · 7=오배송 · 8=품절 · 9=단종 · 10=누락 · 11=배송지연 · 12=상품회수 · 13=배송전취소 · 15=설치불가 · 16=오주문 · 17=재주문 · 18=입고지연 · 19=오출고 · 20=보상 · 21=배송불만 · 22=재고부족 · 23=재주문 · 99=기타 (기본 `전체`) |
| `ddlCsType` | CS | 고르기 | 전체 · 1=취소 · 2=반품 · 3=교환 · 4=AS · 5=설치 (기본 `전체`) |
| `dcStartDt` | 접수일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbGoodsNm` | 단품명 | 글 |  |
| `ddl_RecallGb` | 회수 | 고르기 | 전체 · 0=미회수 · 1=지사 · 4=대체 · 2=본사 · 3=공장 (기본 `전체`) |
| `ltbStatus` | 배송상태 | 고르기 | 전체 · 1=배송지시 · 2=배송준비중 · 5=물류입고 · 6=지사출발 · 7=지사도착 · 3=배송출발 · 0=▶미완료 · 4=배송완료 (기본 `전체`) |
| `dcRecallStartDt` | 회수일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcRecallEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRecallGbSet` | 회수지 | 고르기 | 1=지사 · 4=대체 · 2=본사 · 3=공장 (기본 `2`) |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 27 · 50 · 100 · 500 · 700 · 10000 · onchange: `$('#btnSearch').click();` (기본 `27`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 35개(보임 29) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, columnFixing, clipboard, events

보이는 열: CHK · CS(csType) · IMG(CSImageLink) · 회수(recallGb) · 회수일(recallDt) · 배송상태(dStatus) · 매출처(storeNm) · 몰(mall) · 주문번호(storeOrderNo) · 매입처(supplierNm) · 상품코드(storeGoodsCd) · 상품명(sGoodsNm) · 단품명(goodsNm) · 수취인(recipient) · 휴대폰(recipientMobile) · 주소(addr) · 배송사(deliveryCoNm) · 수량(qty) · CS과실주체(csDuty) · CS비용(csAmt) · 사유(reasonCd) · 상세사유(reasonDetl) · 물류메모(sendMsg) · 배송메모(memo) · 메모2(memo2) · 주문일(orderRegDt) · 접수일(registDt) · 완료일(dEndDt) · 접수자(registrant)

숨은 열: 순번(seq) · 주문번호(orderNo) · ctCd · CS주문번호(CSOrderNo) · 전화(recipientTel) · csCd


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 회수지를 선택해 주십시오.
- 접수일 또는 회수일 기간을 입력해 주세요.
- 종료일을 먼저 선택하세요.
- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `../Claim/MallClaimList.aspx`
- `csDetl.aspx?previousPage=CS`
- `csUpload.aspx`
- `../CS/csImgListView.aspx?vendorCd=…`
- `//www.ilogen.com/iLOGEN.Web.New/TRACE/TraceView.aspx?gubun=slipno&slipno=…`
- `../Delivery/deliveryTrace.aspx?invoiceNo=…`
- `../Delivery/deliveryTraceMobile.aspx?invoiceNo=…`
- `deliveryTrace.aspx?invoiceNo=…`
- `csDetl.aspx?`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `csDetl.aspx?` · 팝업주소 `../CS/csImgListView.aspx?vendorCd=` · 팝업주소 `../Delivery/deliveryTraceMobile.aspx?invoiceNo=`

그 밖: `checkRange` · `checkSearchDt` · `oGrid_HeaderCheckBoxClicked` · `oGrid_Editing_CellValueChanging` · `oGrid_CellEditing_EnteringEditMode` · `cancelCheck` · `oGrid_MouseOver` · `oGrid_MouseOut`
