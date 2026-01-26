#!/bin/bash
# 채팅 API 테스트: 로그인 → POST /api/chat (타임아웃 60초 적용 여부는 앱에서 확인)
# 사용: TEST_EMAIL=이메일 TEST_PASSWORD=비밀번호 ./scripts/test-chat-api.sh
# 또는: ./scripts/test-chat-api.sh  (이메일/비밀번호 입력 프롬프트)

set -e
API_BASE="http://localhost:8080"

# 1) 백엔드 가동 확인
echo "[1/3] 백엔드 연결 확인..."
if ! curl -s -o /dev/null -w "%{http_code}" "$API_BASE/v3/api-docs" | grep -q 200; then
  echo "❌ 백엔드(localhost:8080)에 연결할 수 없습니다. Replant-BE 서버를 먼저 실행하세요."
  exit 1
fi
echo "   ✅ 백엔드 연결됨"

# 2) 인증 정보 (없으면 /api/chat 401만 확인하고 종료)
if [ -n "$TEST_EMAIL" ] && [ -n "$TEST_PASSWORD" ]; then
  EMAIL="$TEST_EMAIL"
  PASS="$TEST_PASSWORD"
else
  echo "[2/3] 계정 미제공 — 로그인/채팅 생략. /api/chat 인증 필요 여부만 확인합니다."
  CHAT_401=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/api/chat" \
    -H "Content-Type: application/json" -d '{"message":"x"}')
  if [ "$CHAT_401" = "401" ]; then
    echo "   ✅ /api/chat 인증 필수(401) 확인됨. 전체 테스트: TEST_EMAIL=이메일 TEST_PASSWORD=비밀번호 $0"
  else
    echo "   ⚠️ /api/chat HTTP $CHAT_401 (기대: 401)"
  fi
  exit 0
fi

# 3) 로그인
echo "[2/3] 로그인..."
LOGIN_RESP=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$EMAIL\",\"password\":\"$PASS\"}")

# jq 있으면 파싱, 없으면 grep
if command -v jq >/dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESP" | jq -r '.data.accessToken // .data.tokens.accessToken // empty')
else
  TOKEN=$(echo "$LOGIN_RESP" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
  [ -z "$TOKEN" ] && TOKEN=$(echo "$LOGIN_RESP" | sed -n 's/.*"accessToken":\s*"\([^"]*\)".*/\1/p')
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ 로그인 실패. 응답: $LOGIN_RESP"
  exit 1
fi
echo "   ✅ 로그인 성공 (토큰 획득)"

# 4) 채팅 전송 (시간 측정)
echo "[3/3] POST /api/chat (메시지: '테스트') — 60초 이내 완료되면 타임아웃 수정이 정상 동작합니다."
START=$(python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s000)
CHAT_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"테스트"}' \
  --max-time 65)
END=$(python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || date +%s000)

HTTP_BODY=$(echo "$CHAT_RESP" | head -n -1)
HTTP_CODE=$(echo "$CHAT_RESP" | tail -n 1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ /api/chat 200 OK"
  if command -v jq >/dev/null 2>&1; then
    MSG=$(echo "$HTTP_BODY" | jq -r '.data.message // .message // .' 2>/dev/null)
    echo "   응답 요약: ${MSG:0:120}..."
  else
    echo "   응답: ${HTTP_BODY:0:200}..."
  fi
  echo ""
  echo "✅ 채팅 API 테스트 성공. (앱에서 60초 타임아웃이 적용되었는지는 리앤트 채팅 화면에서 확인하세요.)"
else
  echo "   ❌ /api/chat HTTP $HTTP_CODE"
  echo "   응답: $HTTP_BODY"
  exit 1
fi
