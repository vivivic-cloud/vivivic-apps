#!/usr/bin/env bash
# 온톨로지 시험을 전부 돌린다.
#   bash 온톨로지/tests/다돌리기.sh
#
# ⚠ `node --test 온톨로지/tests/` 는 이 노드(22)에서 안 먹는다 — 폴더를 못 받는다.
#   파일을 늘어놓아야 한다.
set -u
cd "$(dirname "$0")/../.." || exit 1
node --test 온톨로지/tests/*.mjs
