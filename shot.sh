#!/bin/sh
# 움직이는 그림 검증용 스크린샷: ./shot.sh <anim이름> <초> [출력.png]
#   index.html?anim=<이름>&animt=<초> 를 headless Chrome 으로 찍는다. 먼저 python3 build.py 를 돌릴 것.
#   실행마다 새 --user-data-dir 을 쓰고 40초 watchdog 으로 죽인다 (프로파일 공유 시 두 번째부터 멈춤).
NAME="$1"; T="${2:-0}"; OUT="${3:-/tmp/anim_${NAME}_${T}.png}"
DIR="$(cd "$(dirname "$0")" && pwd)"
UD="$(mktemp -d)"
( "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --user-data-dir="$UD" --window-size=1300,760 --virtual-time-budget=3000 --screenshot="$OUT" \
  "file://$DIR/index.html?anim=$NAME&animt=$T" >/dev/null 2>&1 ) & PID=$!
for t in $(seq 1 40); do kill -0 $PID 2>/dev/null || break; sleep 1; done
kill $PID 2>/dev/null; rm -rf "$UD"
echo "$OUT"
