# 사방넷 API 규정 정리

확인한 날: 2026-11-27 (Claude 작업자, Chrome 으로 실제 화면을 열어 확인)
「확인 안 됨」 = 화면에서 직접 보지 못한 것. 추측으로 채우지 않는다.

## 결론

- **사방넷 API 있음.** 유료 부가서비스이다 (사방넷 사용료에 포함 안 됨).
- 공식 개발 문서는 **사방넷 연동 개발자센터** `https://developer.sabangnet.co.kr` 에 있다 (운영사 ㈜다우기술).
- 개발자센터는 **초대 받은 사람만 가입**할 수 있다. 명세(API 레퍼런스·워크플로우·FAQ)는 로그인해야 보인다.
  사방넷 쇼핑몰관리 아이디와 개발자센터 아이디는 따로이다.

## 신청 → 사용 순서 (개발자센터 「가이드」 화면 기준)

1. 사방넷 홈페이지 `API 서비스` 화면에서 「API 서비스 상담하기」로 신청한다.
2. 사방넷 **마이페이지 > 연동관리** 에서 앱 연동을 맡을 개발자에게 초대 메일을 보낸다.
3. 초대 메일 링크로 개발자센터에 가입한다. 첫 가입자 = 오너(Owner). 오너가 팀원(멤버)을 초대한다.
4. 개발자센터 상단 메뉴에 [앱] 또는 [솔루션] 환경이 나온다.
   - 앱(App): 우리 회사 내부 시스템(ERP·WMS 등)과 연동. **심사 없이** 바로 라이브 전환.
   - 솔루션(Solution): 다른 사방넷 고객사에 서비스하는 것. 사방넷 심사 필수.
5. 프로젝트를 만들고 **Client ID / Client Secret** 을 받는다.
6. API 를 부르는 서버의 **IP 를 화이트리스트(허용 IP)** 에 등록한다.
7. **OAuth 2.0** 으로 토큰을 받아 호출한다.
8. 샌드박스(고정 응답, 구조·인증 흐름 확인용)에서 시험 → 라이브 전환.

## 제공 기능 (개발자센터 워크플로우 4가지)

| 워크플로우 | 내용 (화면 설명 요약) |
|---|---|
| 상품 | 카테고리 등 사전 세팅, 상품 등록·수정, 쇼핑몰 전송 |
| 주문 | 여러 쇼핑몰 신규 주문 수집 → ERP/WMS 연동 → 운송장 번호 전송 |
| 클레임 | 취소·반품·교환 수집·처리, 반품/교환 송장 처리 |
| 문의사항 | 쇼핑몰 상품 문의(Q&A) 수집, 답변 전송 |

홈페이지 API 서비스 화면 문구: 「상품, 주문, 재고정보까지」 연동.

## 요금 (홈페이지 API 서비스 화면, 월 요금)

| 구분 | 사방넷 상품 | API 월 요금(원) |
|---|---|---|
| 기본 | 싱글, 레귤러, 브론즈 | 50,000 |
| 기본 | 실버, 골드 | 100,000 |
| 무제한 | 스페셜1, 2 | 300,000 |
| 무제한 | 스페셜3, 4 | 400,000 |
| 무제한 | 플래티넘1, 2 | 500,000 |

(「기본」·「무제한」이 호출 횟수 구분인지는 확인 안 됨.)

## 호출 방식

- 인증: OAuth 2.0 (Client ID + Client Secret → 토큰). 허용 IP 등록 필수. — 공식 가이드에서 확인.
- 아래는 **공식 문서가 아닌** 남의 공개 저장소(pharmsville-a11y/pharmsville_dashboard README)에 적힌 것. 참고만:
  - 운영 주소 `https://api.sabangnet.co.kr`, 주문 조회 `POST /v3/sb/order` (API 3.0), JSON 으로 보임.
  - 설정 값 이름: CLIENT_TYPE(SB_APP), CLIENT_CD, SECRET, SVC_ACNT_ID.
  - 주문 조회 때 `updateOrderStsYn=N` 이면 신규주문 상태를 바꾸지 않는다고 적혀 있음.
- 옛 방식(XML): `r200.sabangnet.co.kr/RTL_API/guide/...` 라는 옛 가이드 주소가 검색에 나오고,
  SEND_COMPAYNY_ID · SEND_AUTH_KEY · SEND_DATE(YYYYMMDD) 머리 항목, `xml_url` 로 XML 주소를 넘기는 방식이 보인다.
  2026-11-27 에 열어 보면 403 Forbidden — 지금 쓰는지 **확인 안 됨**.
- 외부 서비스(CJ대한통운·스마트십·채널톡·품고 등) 안내문은 **마이페이지 > 서비스 관리 > 연동키 관리** 에서 연동키를 받는다고 쓴다.
  옛 XML 방식 연동키로 보이며, 새 개발자센터(Client ID/Secret)와의 관계는 **확인 안 됨**.

## 확인 안 됨

- API 레퍼런스 세부 (엔드포인트 목록, 요청·응답 항목, 재고 API 유무) — 개발자센터 로그인 필요
- 호출 제한(분당/일당 횟수), 토큰 유효시간
- 이용약관 중 API 이용 조건 세부
- 우리 회사 사방넷 계정의 API 서비스 가입 여부, 마이페이지 > 연동관리 / 연동키 관리 실제 화면
- 옛 XML(RTL_API) 방식이 아직 쓰이는지

## 출처 (2026-11-27 확인)

- 사방넷 API 서비스 소개·요금: https://www.sabangnet.co.kr/service-intro/api-service
- 개발자센터 가이드(공개): https://developer.sabangnet.co.kr/guide
- 개발자센터 문서(로그인 필요): https://developer.sabangnet.co.kr/docs/ , 워크플로우 `/docs/workflow/sabangnet/{product,order,claim,inquiry}`
- 문의: help_sb@daou.co.kr (이용), biz_sb@daou.co.kr (제휴)
- 참고(비공식): https://github.com/pharmsville-a11y/pharmsville_dashboard
- 참고(비공식, 연동키 위치): https://guide.poomgo.com/491e2bab-982e-4938-9985-540618a4b654 , https://qxguide.oopy.io/6dd1c266-4538-4fb1-bcb3-9b8be5a93795
- 옛 XML 가이드(403): http://r200.sabangnet.co.kr/RTL_API/guide/index.html

## 변동내역

- 2026-11-27 처음 작성. 공개 화면·검색으로 정리. 사방넷 로그인 뒤 화면은 아직 못 봄.
