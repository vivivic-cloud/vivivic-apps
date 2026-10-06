/* ==========================================
   벤더피아상품정리 / 잠금.js
   버전: v0.1.0 (2026-10-06)

   이 집의 다른 프로그램은 익명으로 들어간다. 여기만 다르다 —
   벤더피아 자료에는 매입단가·매입금액이 들어 있고, 배송관리 원본에는
   사람 정보가 있었다. 익명 로그인은 주소를 아는 사람이면 누구나 받으므로,
   여기는 사장님 계정으로만 들어가게 한다.

   화베 규칙(`vp_*` 는 사장님 uid 만)과 짝이다. 규칙만 조이고 이 화면이
   없으면 사장님이 못 들어가시고, 이 화면만 있고 규칙이 그대로면
   주소를 아는 사람이 여전히 자료를 가져간다. 둘이 같이 있어야 한다.

   쓰는 법 — 페이지의 module 스크립트에서:
       onAuthStateChanged(auth, (user) => {
           if (!user) { 잠금.열기(이메일로들어가기); return; }
           잠금.닫기(user, 나가기);
           window.initApp();
       });
   ========================================== */
(function () {
'use strict';

const 아이디 = {
    바탕: '잠금바탕', 메일: '잠금메일', 비번: '잠금비번',
    단추: '잠금단추', 말: '잠금말', 나감: '잠금나감'
};

function 모양박기() {
    if (document.getElementById('잠금모양')) return;
    const st = document.createElement('style');
    st.id = '잠금모양';
    // 테일윈드가 못 떠도 로그인 칸은 보여야 한다. 모양을 안에 직접 박는다.
    st.textContent = `
      #${아이디.바탕}{position:fixed;inset:0;z-index:9999;background:#fbfbfa;
        display:flex;align-items:center;justify-content:center;padding:18px;
        font-family:'Inter',ui-sans-serif,system-ui,sans-serif;color:#37352f}
      #${아이디.바탕} .상자{width:100%;max-width:360px}
      #${아이디.바탕} h2{margin:0 0 6px;font-size:22px;font-weight:900;letter-spacing:-.02em}
      #${아이디.바탕} p.풀이{margin:0 0 20px;font-size:13px;color:#787774;line-height:1.6}
      #${아이디.바탕} label{display:block;font-size:11px;font-weight:700;color:#787774;margin-bottom:5px}
      #${아이디.바탕} input{width:100%;min-height:48px;padding:0 13px;margin-bottom:14px;
        border:1px solid #ededeb;border-radius:10px;background:#fff;color:#37352f;
        font-size:16px;box-sizing:border-box}
      #${아이디.바탕} input:focus{outline:none;border-color:#37352f}
      #${아이디.바탕} button{width:100%;min-height:48px;border:0;border-radius:10px;
        background:#37352f;color:#fff;font-size:15px;font-weight:800;cursor:pointer}
      #${아이디.바탕} button:disabled{opacity:.45;cursor:default}
      #${아이디.바탕} .말{margin-top:14px;font-size:12.5px;line-height:1.6;min-height:18px}
      #${아이디.바탕} .말.나쁨{color:#b3261e}
      #${아이디.나감}{display:block;margin-top:10px;font-size:11px;color:#a8a6a2;
        text-decoration:underline;background:none;border:0;padding:6px 0;cursor:pointer}
    `;
    document.head.appendChild(st);
}

// 파이어베이스가 돌려주는 코드를 사장님 말로 옮긴다.
function 사람말(code, 메시지) {
    const 표 = {
        'auth/invalid-email':        '이메일 모양이 아닙니다.',
        'auth/missing-password':     '비밀번호를 넣어 주십시오.',
        'auth/invalid-credential':   '이메일이나 비밀번호가 다릅니다.',
        'auth/wrong-password':       '비밀번호가 다릅니다.',
        'auth/user-not-found':       '그런 계정이 없습니다.',
        'auth/user-disabled':        '막힌 계정입니다.',
        'auth/too-many-requests':    '여러 번 틀려서 잠시 막혔습니다. 조금 뒤에 다시 하십시오.',
        'auth/network-request-failed':'인터넷이 끊겼습니다.'
    };
    return 표[code] || ('들어가지 못했습니다 — ' + (메시지 || code || '까닭을 모르겠습니다'));
}

const 잠금 = {
    // 들어가기 전 — 화면 전체를 덮는다
    열기(들어가기) {
        모양박기();
        if (document.getElementById(아이디.바탕)) return;
        const d = document.createElement('div');
        d.id = 아이디.바탕;
        d.innerHTML =
            '<div class="상자">' +
            '<h2>벤더피아 상품정리</h2>' +
            '<p class="풀이">사장님 계정으로 들어가십니다.</p>' +
            '<label for="' + 아이디.메일 + '">이메일</label>' +
            '<input id="' + 아이디.메일 + '" type="email" autocomplete="username" ' +
            'inputmode="email" autocapitalize="off" spellcheck="false">' +
            '<label for="' + 아이디.비번 + '">비밀번호</label>' +
            '<input id="' + 아이디.비번 + '" type="password" autocomplete="current-password">' +
            '<button id="' + 아이디.단추 + '">들어가기</button>' +
            '<div class="말" id="' + 아이디.말 + '"></div>' +
            '</div>';
        document.body.appendChild(d);

        const 메일 = document.getElementById(아이디.메일);
        const 비번 = document.getElementById(아이디.비번);
        const 단추 = document.getElementById(아이디.단추);
        const 말   = document.getElementById(아이디.말);

        async function 해보기() {
            말.textContent = ''; 말.className = '말';
            const e = 메일.value.trim(), p = 비번.value;
            if (!e || !p) { 말.textContent = '이메일과 비밀번호를 넣어 주십시오.'; 말.className = '말 나쁨'; return; }
            단추.disabled = true; 단추.textContent = '들어가는 중…';
            try {
                await 들어가기(e, p);           // 되면 onAuthStateChanged 가 닫는다
            } catch (err) {
                말.textContent = 사람말(err && err.code, err && err.message);
                말.className = '말 나쁨';
                단추.disabled = false; 단추.textContent = '들어가기';
                비번.value = ''; 비번.focus();
            }
        }
        단추.addEventListener('click', 해보기);
        [메일, 비번].forEach(x => x.addEventListener('keydown', ev => {
            if (ev.key === 'Enter') { ev.preventDefault(); 해보기(); }
        }));
        setTimeout(() => 메일.focus(), 60);
    },

    // 들어온 뒤 — 덮개를 걷고 밑에 「나가기」를 둔다
    닫기(user, 나가기) {
        모양박기();
        const d = document.getElementById(아이디.바탕);
        if (d) d.remove();
        if (!나가기 || document.getElementById(아이디.나감)) return;
        const b = document.createElement('button');
        b.id = 아이디.나감;
        b.textContent = (user && user.email ? user.email : '들어와 있음') + ' · 나가기';
        b.addEventListener('click', () => { 나가기(); });
        const foot = document.querySelector('footer');
        (foot || document.body).appendChild(b);
    }
};

window.잠금 = 잠금;
})();
