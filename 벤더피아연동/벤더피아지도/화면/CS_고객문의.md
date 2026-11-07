# CS > 고객문의

- 주소: `/System/CS/inquiryList.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 고객문의목록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./inquiryList.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 검사 「시작일과 종료일을 모두 선택해 주세요.」 · 검사 「1년 이상 값을 조회할 수 없습니다」 |
| 엑셀 | `btnExcel` | 내려받기 | 검사 「시작일과 종료일을 모두 선택해 주세요.」 · 검사 「1년 이상 값을 조회할 수 없습니다」 |
| 등록 | `btnInsert` | 이동 | → `csDetl.aspx?previousPage=inquiry` |
| 문의 일괄등록 | `btnInquiryUpload` | 이동 | → `inquiryUpload.aspx` |
| (그림 icon_listdel.gif) | `btnDelete` | 쓰기 | 폼 제출(서버 처리) |
| Next | `Pager1$ctl32` | 조회 | 폼 제출(서버 처리) |
| Last | `Pager1$ctl34` | 조회 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 108개(적지 않음) |
| `ddlInqType` | 문의유형 | 고르기 | 업무 자료 28개(적지 않음) |
| `ddlCallEndGb` | 처리결과 | 고르기 | 전체 · 1=처리중 · 2=처리완료 · 3=부재 · 4=확인요청 (기본 `전체`) |
| `ddlMall` | 몰 | 고르기 | 업무 자료 36개(적지 않음) |
| `tbStoreOrderNo` | 주문번호 | 글 |  |
| `tbOrderer` | 주문자 | 글 |  |
| `tbRecipient` | 수취인 | 글 |  |
| `tbInquirer` | 문의자 | 글 |  |
| `tbRegistrant` | 접수자 | 글 |  |
| `cbNotReply` | 미답변 | 체크 |  |
| `tbSGoodsNm` | 상품명 | 글 |  |
| `tbTitle` | 제목 | 글 |  |
| `tbContent` | 문의내용 | 글 |  |
| `dcStartDt` | 접수일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcPromiseDt` | 약속일 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlInboundYn` | 수발신 | 고르기 | 전체 · 1=수신 · 0=발신 · =입력 (기본 `전체`) |
| `tbReplyer` | 답변자 | 글 |  |
| `cbReplyYn` | 답변필요여부 | 체크 |  |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 27 · 50 · 100 · 200 · 300 · 500 · onchange: `$('#btnSearch').click();` (기본 `27`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 34개(보임 19) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events

보이는 열: CHK · 문의자(inquirer) · 몰(mall) · 배송사(deliveryCoNm) · 문의유형(inqType) · 배송상태(dStatus) · 처리결과(callEndGb) · 상품명(sGoodsNm) · 제목(title) · 문의내용(content) · 고객약속일(promiseDt) · 답변내용(replyContent) · 수(salesQty) · 가용수(csUsableQty) · 답변자(replyer) · 수발신(inboundYn) · 주문등록일(orderRegDt) · 문의접수일(registDt) · 접수자(registrant)

숨은 열: 주문번호(orderNo) · ctCd · inquiryCd · 매출처(storeNm) · 매출처주문번호(sOrderNo) · 매출처상품코드(sGoodsCd) · 주문자(orderer) · 주문자전화(ordererTel) · 주문자핸드폰(ordererMobile) · 수취인(recipient) · 수취인전화(recipientTel) · 수취인휴대폰(recipientMobile) · 우편번호(zip) · 주소(addr) · 순번(seq)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hStoreCd` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 시작일과 종료일을 모두 선택해 주세요.
- 1년 이상 값을 조회할 수 없습니다
- 종료일을 먼저 선택하세요.
- \

## 연결되는 화면

- `csDetl.aspx?previousPage=inquiry`
- `inquiryUpload.aspx`
- `csDetl.aspx?`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `csDetl.aspx?`

그 밖: `oGrid_HeaderCheckBoxClicked` · `oGrid_Editing_CellValueChanging` · `oGrid_CellEditing_EnteringEditMode` · `cancelCheck`
