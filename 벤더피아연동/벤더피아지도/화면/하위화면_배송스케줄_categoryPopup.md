# 하위화면 > 배송스케줄 > categoryPopup — 단품분류선택

- 주소: `/System/Master/categoryPopup.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품분류선택
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./categoryPopup.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnCheck` | 쓰기 | 폼 제출(서버 처리) |
| 삭제 | `btnClose` | 이동 | `fnClose(); return false;` · JS만(제출 안 함) |
|  | `oTreen0` | 미확인 |  |

트리: `oTree`(ASP.NET TreeView). 마디 `a` 의 `title` = `분류코드|깊이`, 맨 위 「분류」 는 title 없음(11-07 잼, 단품 등록 쪽에서 연 것과 같은 팝업). 마디를 누르면 `__doPostBack('ctl00$Contents$oTree', 경로)` 로 오른쪽 목록을 다시 조회한다. 마디 이름은 업무 자료라 적지 않았다.

## 숨은 값 (이름만)

`oTree_ExpandState` · `oTree_SelectedNode` · `oTree_PopulateLog` · `hdKey` · `hNode`

## 쪽 안 메시지

- 분류를 선택하세요.

## 연결되는 화면

- `#oTree_SkipLink`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `TreeView_PopulateNodeDoCallBack` · `fnCheckItem` · `fnClose`
