# 자사관리자 > Q&A

- 주소: `/System/Basic/qna.aspx`
- 쪽 제목: VendorPia
- 화면 머리: Q/A 목록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./qna.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 이동 | → `./../dCoSCM/qnaInsert.aspx` · → `qnaInsert.aspx` |
| 삭제 | `btnDel` | 쓰기 | 확인창 「삭제하시겠습니까?」 · 검사 「삭제할 목록을 선택해 주십시오.」 · 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbTitle` | 제목 | 글 |  |
| `tbRegNm` | 작성자 | 글 |  |
| `dcStartDt` | 등록기간 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `$('#btnSearch').click();` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 8개(보임 6) · 불러온 줄 있음: 아니오
- 기능: selection, activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 부서(deptNm) · 작성자(registrant) · 제목(title) · 작성일시(registerDt) · 답변수(qnaDetlCount)

숨은 열: QNA코드(qnaCd) · 답변여부(answerYn)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `qnaInsert.aspx`
- `qnaDetl.aspx?qnaCd=…`

## 쪽 안 함수

- `oGrid_CellSelectionChanged`: → `qnaDetl.aspx?qnaCd=`
- `fnSearch`: 단추 누름 `btnSearch`
