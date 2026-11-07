# 하위화면 > 고객주문변경 > MallClaimList

- 주소: `/System/Claim/MallClaimList.aspx`
- 쪽 제목: VendorPia
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./MallClaimList.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `dcStartDt` | 검색기간 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `tbMallOrderNo` | 쇼핑몰주문번호 | 글 |  |
| `ddlClaimType` | 주문상태 | 고르기 | -1=전체 · ORDER=주문 · CANCEL=취소 · EXCHANGE=교환 · RETURN=반품 (기본 `-1`) |
| `ddlMallTypeCd` | 쇼핑몰 | 고르기 | -1=전체 · NAVER=스마트스토어 · MAKESHOP=MakeShop · COUPANG=쿠팡 · AUCTION=옥션 · GMARKET=G마켓 · 11ST=11번가 · INTERPARK=인터파크 · OHOU=오늘의집 · LOTTEON=롯데온 · SSG=신세계(SSG) (기본 `-1`) |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 24개(보임 16) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: NO(RNUM) · 쇼핑몰ID<BR/>쇼핑몰(mallTypeImg) · 쇼핑몰<BR/>주문상태(orderTypeNmDisplay) · 쇼핑몰주문번호(mallOrderNo) · 주문일<BR/>수집일시(orderDate) · 주문자<BR/>연락처(orderer) · 수취인<BR/>연락처(recipient) · 주소(addr) · 상품(goodsNm) · 옵션(goodsOptionNm) · 주문<br/>수량(orderQty) · 취소<br/>수량(claimQty) · CS처리<br/>수량(CSDisplay) · 주문금액(orderAmt) · 사유(reason) · 이력(btnHistory)

숨은 열: 벤더사코드(vendorCd) · 쇼핑몰No(mallNo) · CS처리>수량(CSCnt) · 몰코드(mallTypeCd) · 몰로그인ID(mallLoginId) · 주문번호(ordernos) · 주문상태(orderStatusNm) · 주문상태(orderTypeNm)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 팝업 차단을 해제해주세요.

## 연결되는 화면

- `../Claim/MallClaimHistoryList.aspx?vendorCd=…`
- `../Claim/MallCSOrderList.aspx?vendorCd=…`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`
- `fnPopup`: 팝업주소 `../Claim/MallClaimHistoryList.aspx?vendorCd=`
- `fnPopup2`: 팝업주소 `../Claim/MallCSOrderList.aspx?vendorCd=`

그 밖: `oGrid_CellSelectionChanged`
