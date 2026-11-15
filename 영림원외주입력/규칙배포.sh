#!/bin/bash
# v259 저장소 규칙 배포 — 첫 관리자(사장님) 구글 이메일을 넣어 배포한다. 이메일은 저장소(공개)에 안 쓰고 이 맥 ~/.config/vivivic/boss-email 에만 둔다.
# 쓰는 법:  bash 규칙배포.sh firestore-rules-제안-v259.rules        (전환 기간판)
#           bash 규칙배포.sh firestore-rules-제안-v259-구글만.rules  (구글만판 — 파이어베이스 구글 로그인 켠 뒤)
set -e
cd "$(dirname "$0")"
F="${1:?규칙 파일 이름}"; B="$(tr -d ' \n' < ~/.config/vivivic/boss-email)"
[[ "$B" == *@* ]] || { echo "~/.config/vivivic/boss-email 에 사장님 구글 이메일이 없습니다"; exit 1; }
T="$(mktemp -d)"; sed "s/__BOSS_EMAIL__/$(printf '%s' "$B" | tr 'A-Z' 'a-z')/" "$F" > "$T/firestore.rules"
grep -q "__BOSS_EMAIL__" "$T/firestore.rules" && { echo "이메일 자리 못 바꿈"; exit 1; }
echo '{"firestore":{"rules":"firestore.rules"}}' > "$T/firebase.json"
(cd "$T" && firebase deploy --only firestore:rules --project vivivic-4b7ef)
rm -rf "$T"
