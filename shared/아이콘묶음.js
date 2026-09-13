/* ══ 집이 함께 쓰는 아이콘 묶음 ══════════════════════════════════════
   박스를 만들 때 고르는 아이콘 목록이다. 작업대·에이엠티·조혼가구·cartoon 이
   같은 것을 쓰라고 여기 한 벌로 뺐다. 프로그램마다 따로 늘리면 또 달라진다.

   쓰는 법 — lucide.min.js 다음에 이 파일을 싣고, 아이콘 고르는 자리에서
     const 묶음 = window.VG아이콘묶음();   // [[묶음이름, [아이콘이름…]], …]
   한 줄로 갈아 끼우면 된다. 돌려주는 모양은 예전에 각자 손으로 적어 두던
   그 배열과 같다. lucide 가 아직 안 실렸으면 빈 배열을 준다.

   이름을 손으로 적지 않는다. lucide.icons 가 실제로 가진 것을 그대로 읽어
   갈래에 나눈다 — 그래서 lucide 를 올리면 목록도 저절로 따라 는다.
   어느 갈래에도 안 걸리는 것은 버리지 않고 '그 밖' 에 모두 넣는다. */
(function (global) {
  'use strict';

  // 사장님이 이미 눈에 익힌 것들 — 갈래마다 맨 앞에 그대로 세운다.
  var 씨앗 = {
    '자주 쓰는 것': ['square', 'layout-grid', 'folder', 'file-text', 'message-square', 'star',
      'check-check', 'bell', 'tag', 'bookmark', 'pin', 'flag'],
    '프로그램·화면': ['monitor', 'smartphone', 'app-window', 'panel-left', 'table-2', 'list',
      'kanban', 'sliders-horizontal', 'toggle-right', 'mouse-pointer-click'],
    '서류·문서': ['files', 'folder-open', 'clipboard-list', 'receipt', 'notebook-pen', 'book-open',
      'printer', 'scan-text', 'file-spreadsheet', 'file-check', 'stamp', 'signature'],
    '가구·제조': ['hammer', 'wrench', 'ruler', 'pencil-ruler', 'scissors', 'layers', 'package', 'boxes',
      'factory', 'cog', 'drill', 'component'],
    '물류·배송': ['truck', 'ship', 'plane', 'warehouse', 'forklift', 'route', 'map-pin', 'map',
      'scan-barcode', 'qr-code', 'container', 'package-check'],
    '돈·거래': ['banknote', 'coins', 'credit-card', 'calculator', 'percent', 'wallet', 'trending-up',
      'chart-column', 'chart-pie', 'handshake'],
    '사람·연락': ['users', 'user-round', 'phone', 'mail', 'send', 'headphones', 'messages-square',
      'megaphone', 'id-card', 'contact'],
    '시간·일정': ['calendar', 'calendar-days', 'clock', 'timer', 'hourglass', 'alarm-clock',
      'calendar-check', 'history'],
    '알림·상태': ['circle-alert', 'triangle-alert', 'info', 'circle-check', 'circle-dot', 'circle-x',
      'shield-check', 'activity', 'zap', 'heart'],
    '그 밖': ['image', 'camera', 'video', 'mic', 'globe', 'key', 'lock', 'search', 'lightbulb', 'rocket',
      'database', 'code-xml', 'cpu', 'cloud', 'link', 'download', 'upload', 'archive', 'trash-2',
      'wand-sparkles']
  };

  // 갈래 차례. '그 밖' 은 맨 끝이고, 어디에도 안 걸린 것이 전부 여기로 온다.
  var 차례 = ['자주 쓰는 것', '프로그램·화면', '서류·문서', '가구·제조', '물류·배송',
              '돈·거래', '사람·연락', '시간·일정', '알림·상태', '그 밖'];

  // 이름 한 조각이라도 걸리면 그 갈래로 본다. 위에서부터 먼저 걸리는 곳으로 간다.
  // '자주 쓰는 것' 은 씨앗만 둔다 — 자주 쓰는 것이 천 개일 수는 없다.
  var 규칙 = [
    ['프로그램·화면', ['monitor', 'smartphone', 'tablet', 'laptop', 'app-window', 'panel', 'layout',
      'sidebar', 'table', 'list', 'kanban', 'slider', 'toggle', 'mouse', 'keyboard', 'command',
      'terminal', 'code', 'columns', 'rows', 'grid', 'maximize', 'minimize', 'pointer', 'cursor',
      'window', 'screen', 'square-dashed', 'menu', 'chevron', 'arrow', 'move', 'align', 'pilcrow',
      'text', 'type', 'italic', 'bold', 'underline', 'heading', 'indent', 'wrap', 'zoom']],
    ['서류·문서', ['file', 'folder', 'clipboard', 'receipt', 'notebook', 'note', 'book', 'printer',
      'scan', 'stamp', 'signature', 'paperclip', 'sticky', 'newspaper', 'scroll', 'library',
      'graduation', 'pen', 'pencil', 'eraser', 'highlighter', 'edit', 'copy', 'paste', 'page']],
    ['가구·제조', ['hammer', 'wrench', 'ruler', 'scissors', 'layer', 'package', 'box', 'factory',
      'cog', 'drill', 'component', 'construction', 'brick', 'axe', 'saw', 'anvil', 'pickaxe',
      'shovel', 'blocks', 'bolt', 'nut', 'screw', 'crane', 'hard-hat', 'paint', 'brush', 'palette',
      'sofa', 'lamp', 'bed', 'armchair', 'door', 'chair', 'table-lamp', 'refrigerator', 'washing',
      'microwave', 'oven', 'toolbox', 'settings', 'wand']],
    ['물류·배송', ['truck', 'ship', 'plane', 'warehouse', 'forklift', 'route', 'map', 'navigation',
      'barcode', 'qr', 'container', 'train', 'bus', 'car', 'bike', 'fuel', 'anchor', 'sail',
      'compass', 'milestone', 'signpost', 'waypoints', 'tractor', 'caravan', 'luggage', 'parking',
      'traffic', 'road', 'locate', 'globe-lock']],
    ['돈·거래', ['banknote', 'coin', 'credit-card', 'calculator', 'percent', 'wallet', 'trending',
      'chart', 'handshake', 'dollar', 'euro', 'yen', 'won', 'pound', 'currency', 'piggy', 'gem',
      'diamond', 'landmark', 'scale', 'shopping', 'store', 'ticket', 'gift', 'tag', 'badge-dollar',
      'hand-coins', 'circle-dollar', 'receipt-text', 'banknote-arrow']],
    ['사람·연락', ['user', 'users', 'phone', 'mail', 'send', 'headphone', 'message', 'megaphone',
      'id-card', 'contact', 'person', 'baby', 'accessibility', 'smile', 'frown', 'meh', 'annoyed',
      'laugh', 'angry', 'speech', 'at-sign', 'rss', 'share', 'inbox', 'reply', 'forward',
      'voicemail', 'podcast', 'group', 'venetian']],
    ['시간·일정', ['calendar', 'clock', 'timer', 'hourglass', 'alarm', 'history', 'watch',
      'sunrise', 'sunset', 'schedule', 'date', 'stopwatch']],
    ['알림·상태', ['alert', 'info', 'check', 'circle', 'shield', 'activity', 'zap', 'heart', 'bell',
      'octagon', 'triangle', 'ban', 'x-circle', 'loader', 'refresh', 'rotate', 'power', 'battery',
      'signal', 'wifi', 'gauge', 'thermometer', 'pulse', 'lock', 'unlock', 'key', 'eye', 'bug',
      'flame', 'award', 'trophy', 'medal', 'crown', 'verified', 'flag', 'bookmark', 'star', 'pin']]
  ];

  var 된것 = null;

  function 케밥(k) {
    return String(k)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
  }

  function 만들기() {
    var L = (global.lucide && global.lucide.icons) || {};
    var 모든이름 = Object.keys(L);
    if (!모든이름.length) return [];

    var 모두 = [], 본것 = {};
    for (var i = 0; i < 모든이름.length; i++) {
      var n = 케밥(모든이름[i]);
      if (본것[n]) continue;
      본것[n] = 1; 모두.push(n);
    }
    모두.sort();

    var 통 = {}, 놓인것 = {};
    for (var t = 0; t < 차례.length; t++) 통[차례[t]] = [];

    // ① 씨앗 먼저 — 있는 것만, 적어 둔 차례 그대로
    for (var s = 0; s < 차례.length; s++) {
      var 이름 = 차례[s], 씨 = 씨앗[이름] || [];
      for (var j = 0; j < 씨.length; j++) {
        var c = 씨[j];
        if (!본것[c] || 놓인것[c]) continue;
        통[이름].push(c); 놓인것[c] = 1;
      }
    }

    // ② 나머지를 이름 조각으로 갈라 담는다
    for (var k = 0; k < 모두.length; k++) {
      var nm = 모두[k];
      if (놓인것[nm]) continue;
      var 넣을곳 = null;
      for (var r = 0; r < 규칙.length && !넣을곳; r++) {
        var 말들 = 규칙[r][1];
        for (var w = 0; w < 말들.length; w++) {
          if (nm.indexOf(말들[w]) !== -1) { 넣을곳 = 규칙[r][0]; break; }
        }
      }
      통[넣을곳 || '그 밖'].push(nm);
      놓인것[nm] = 1;
    }

    var 낸것 = [];
    for (var z = 0; z < 차례.length; z++) {
      if (통[차례[z]].length) 낸것.push([차례[z], 통[차례[z]]]);
    }
    return 낸것;
  }

  /* 한 번만 셈하고 그 뒤로는 들고 있던 것을 준다. lucide 가 늦게 실려도
     그때 다시 셈한다(빈 것을 물고 있지 않는다). */
  global.VG아이콘묶음 = function () {
    if (된것 && 된것.length) return 된것;
    된것 = 만들기();
    return 된것;
  };
  // 이름만 쭉 필요할 때(찾기 등)
  global.VG아이콘이름 = function () {
    var 묶 = global.VG아이콘묶음(), 다 = [];
    for (var i = 0; i < 묶.length; i++) 다 = 다.concat(묶[i][1]);
    return 다;
  };
})(typeof window !== 'undefined' ? window : this);
