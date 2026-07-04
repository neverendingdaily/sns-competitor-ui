#!/usr/bin/env bash
# フロントエンド(sns-competitor-ui)とバックエンド(sns-competitor-backend)を
# 1コマンドで同時起動するスクリプト。
#
# 使い方:
#   ./start_all.sh
#   Ctrl+C で両方停止。
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR"
BACKEND_DIR="$SCRIPT_DIR/../20260702_sns-competitor-backend"

if [[ ! -d "$BACKEND_DIR" ]]; then
  echo "エラー: バックエンドディレクトリが見つかりません: $BACKEND_DIR" >&2
  exit 1
fi
BACKEND_DIR="$(cd "$BACKEND_DIR" && pwd)"

BACKEND_LOG="$SCRIPT_DIR/.backend.log"
FRONTEND_LOG="$SCRIPT_DIR/.frontend.log"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "停止処理中..."
  [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null
  wait 2>/dev/null
  echo "停止しました。"
}
trap cleanup EXIT INT TERM

# --- バックエンド起動 ---
if [[ ! -d "$BACKEND_DIR/venv" ]]; then
  echo "エラー: バックエンドの venv がありません。先に以下を実行してください:" >&2
  echo "  cd \"$BACKEND_DIR\" && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt" >&2
  exit 1
fi

echo "バックエンド起動中 (http://localhost:8000) ..."
(
  cd "$BACKEND_DIR" || exit 1
  # shellcheck disable=SC1091
  source venv/bin/activate
  exec uvicorn app.main:app --reload --port 8000
) > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo "バックエンドの起動待ち..."
READY=0
for _ in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:8000/api/v1/health; then
    READY=1
    break
  fi
  sleep 1
done

if [[ "$READY" -ne 1 ]]; then
  echo "エラー: バックエンドが起動しませんでした。ログを確認してください: $BACKEND_LOG" >&2
  exit 1
fi
echo "バックエンド起動完了。"

# --- フロントエンド起動 ---
echo "フロントエンド起動中 (http://localhost:5173) ..."
(
  cd "$FRONTEND_DIR" || exit 1
  exec npm run dev
) > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

echo ""
echo "==============================================="
echo " バックエンド : http://localhost:8000  (ログ: $BACKEND_LOG)"
echo " フロントエンド: http://localhost:5173  (ログ: $FRONTEND_LOG)"
echo " Ctrl+C で両方停止します"
echo "==============================================="

wait
