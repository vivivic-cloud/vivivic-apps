/* ==========================================
   벤더피아상품정리 / 기록.js
   버전: v0.1.0 (2026-10-06)

   올릴 때마다 「누가 · 언제 · 어느 파일 · 몇 줄」 을 남긴다.
   숫자가 이상할 때 언제부터 틀어졌는지 여기서 찾는다.
   10-03 에 같은 357줄이 문서 714개가 된 일이 있었는데, 그때 이것이 있었으면
   「13:05 에 357, 13:30 에 또 357」 이 바로 보였다.

   자리 — artifacts/vivivic-4b7ef/public/data/vp_기록
   vp_ 로 시작하므로 화베 규칙이 사장님 계정만 들여보낸다. 따로 잠글 것이 없다.

   문서 이름 — 20261006-1532-04__배송관리
   앞이 때라서 이름 차례가 곧 시간 차례다. 정렬을 따로 안 해도 된다.
   ========================================== */
(function () {
'use strict';

const 칸 = ['artifacts','vivivic-4b7ef','public','data','vp_기록'];

function 때이름(d) {
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' +
           p(d.getHours()) + p(d.getMinutes()) + '-' + p(d.getSeconds());
}
function 때보임(id) {
    const m = String(id).match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})/);
    return m ? `${m[2]}-${m[3]} ${m[4]}:${m[5]}` : '';
}
const 막기 = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const 기록 = {
    // 올리기가 끝난 뒤에 부른다. 여기서 터져도 올린 것은 그대로다 — 그래서 삼킨다.
    async 적기(옵션) {
        try {
            const { db, fb, user } = 옵션;
            const 이름 = 때이름(new Date()) + '__' + (옵션.무엇 || '올림');
            await fb.setDoc(fb.doc(db, ...칸, 이름), {
                무엇:   옵션.무엇   || '',
                파일:   옵션.파일   || '',
                줄수:   옵션.줄수   || 0,
                문서수: 옵션.문서수 || 0,
                비고:   옵션.비고   || '',
                누가:   (user && user.email) || '',
                uid:    (user && user.uid)   || '',
                언제:   fb.serverTimestamp()
            });
        } catch (e) {
            console.warn('기록을 남기지 못했습니다', e);   // 올린 것을 되돌리지는 않는다
        }
    },

    // 최근 몇 건을 그린다. 없으면 자리 자체를 숨긴다.
    async 그리기(옵션) {
        const { db, fb, 넣을곳 } = 옵션;
        const 몇개 = 옵션.몇개 || 5;
        const 자리 = typeof 넣을곳 === 'string' ? document.getElementById(넣을곳) : 넣을곳;
        if (!자리) return;
        try {
            const 눈 = await fb.getDocs(fb.collection(db, ...칸));
            const 줄 = [];
            눈.forEach(d => 줄.push(Object.assign({ id: d.id }, d.data())));
            줄.sort((a, b) => a.id < b.id ? 1 : -1);          // 이름 차례가 곧 시간 차례
            if (!줄.length) { 자리.innerHTML = ''; 자리.hidden = true; return; }
            자리.hidden = false;
            자리.innerHTML =
                '<div style="font-size:11px;font-weight:700;color:#787774;margin-bottom:8px">' +
                '올린 기록 · 모두 ' + 줄.length + '건</div>' +
                줄.slice(0, 몇개).map(r =>
                    '<div style="display:flex;gap:10px;min-width:0;font-size:12px;' +
                    'padding:6px 0;border-top:1px solid #ededeb">' +
                    '<span style="font-family:ui-monospace,monospace;color:#787774;flex:none">' +
                    막기(때보임(r.id)) + '</span>' +
                    '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
                    막기(r.무엇) + (r.파일 ? ' · ' + 막기(r.파일) : '') + '</span>' +
                    '<span style="margin-left:auto;flex:none;font-variant-numeric:tabular-nums">' +
                    Number(r.줄수 || 0).toLocaleString('ko-KR') + '줄</span>' +
                    '</div>' +
                    (r.비고 ? '<div style="font-size:11px;color:#a8a6a2;padding-left:2px">' +
                              막기(r.비고) + '</div>' : '')
                ).join('');
        } catch (e) {
            console.warn('기록을 읽지 못했습니다', e);
            자리.hidden = true;
        }
    }
};

window.기록 = 기록;
})();
