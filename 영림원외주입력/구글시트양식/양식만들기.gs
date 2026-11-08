/**
 * 영림원외주입력 — 구글시트 양식 만들기 웹앱 (v113)
 *
 * 하는 일: 폼에서 「양식 다운로드 → 구글 스프레드시트」를 누르면 폼이 그 순간의 엑셀 양식 파일
 *   (폼 칸·드롭다운 목록·머리 메모 그대로)을 보낸다. 이 스크립트는 그 파일을 드라이브
 *   「영림원외주입력 양식」 폴더에 구글시트로 바꿔 만들고, 시트 주소를 돌려준다.
 * 누를 때만 돈다(시간 트리거·자동 실행 없음). 다른 파일은 읽거나 고치지 않는다.
 * 이 파일에는 비밀번호·키·토큰이 없다. 권한은 사장님이 배포할 때 구글 화면에서 직접 승인한다.
 * 올리는 법 = 같은 폴더의 「사장님 할 일.md」.
 */

var FOLDER_ID = '1Gq4Ya9Pd5mfN9YzGdcPrl6QISc1rE24a';   // 드라이브 「영림원외주입력 양식」 폴더
var MAX_BYTES = 3 * 1024 * 1024;                         // 양식 파일 크기 한도(지금 양식은 4~60KB)
var MAX_PER_DAY = 300;                                   // 하루 최대 몇 장까지 만드나(남이 주소로 마구 부르는 것 막기)

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    var name = String(req.name || '');
    if (!/^외주입력_[^\/\\<>:"|?*\u0000-\u001f]{1,80}$/.test(name)) return out_({ ok: false, err: 'name' });
    var bytes = Utilities.base64Decode(String(req.data || ''));
    if (bytes.length < 100 || bytes.length > MAX_BYTES || bytes[0] !== 0x50 || bytes[1] !== 0x4B) return out_({ ok: false, err: 'file' });  // xlsx(zip) 만
    if (!countOk_()) return out_({ ok: false, err: 'limit' });

    DriveApp.getFolderById(FOLDER_ID);   // 폴더가 있는지(없으면 오류)
    var title = name + ' (' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm') + ')';
    var meta = { name: title, mimeType: 'application/vnd.google-apps.spreadsheet', parents: [FOLDER_ID] };
    var b = 'ylw' + Date.now();
    var head = Utilities.newBlob('--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(meta) +
      '\r\n--' + b + '\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n').getBytes();
    var tail = Utilities.newBlob('\r\n--' + b + '--').getBytes();
    var res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'post',
      contentType: 'multipart/related; boundary=' + b,
      payload: head.concat(bytes, tail),
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) return out_({ ok: false, err: 'drive' });
    var id = JSON.parse(res.getContentText()).id;
    return out_({ ok: true, url: 'https://docs.google.com/spreadsheets/d/' + id + '/edit' });
  } catch (err) {
    return out_({ ok: false, err: 'error' });
  }
}

// 주소를 브라우저로 열면 연결됐는지만 알려 준다.
function doGet() {
  return out_({ ok: true, ready: true });
}

// 처음 한 번 권한 승인용(편집기에서 이 함수를 골라 「실행」). 폴더 이름만 읽는다.
function checkAccess() {
  Logger.log('폴더 확인: ' + DriveApp.getFolderById(FOLDER_ID).getName());
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function countOk_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = PropertiesService.getScriptProperties();
    var day = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    var n = p.getProperty('day') === day ? Number(p.getProperty('n') || 0) : 0;
    if (n >= MAX_PER_DAY) return false;
    p.setProperties({ day: day, n: String(n + 1) });
    return true;
  } finally {
    lock.releaseLock();
  }
}
