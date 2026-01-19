#!/bin/bash

# Replant Android 개발 환경 설정 스크립트
# Cursor 규칙에 따라 개발 환경을 설정합니다.

set -e

PROJECT_DIR="/Users/kimmireu/Desktop/Storage/Programming/Replant-Android"
EMULATOR_NAME="Pixel_8"
APP_PACKAGE="com.anonymous.replantmobileapp"

echo "🚀 Replant Android 개발 환경 설정을 시작합니다..."

# 1. 모든 Metro 번들러 프로세스 종료
echo "📦 1단계: Metro 번들러 프로세스 종료 중..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
echo "✅ Metro 번들러 프로세스 종료 완료"

# 2. 에뮬레이터 재시작
echo "📱 2단계: 에뮬레이터 재시작 중..."
adb -e emu kill 2>/dev/null || pkill -f "emulator.*Pixel_8" 2>/dev/null || true
sleep 2
emulator -avd "$EMULATOR_NAME" &
echo "✅ 에뮬레이터 시작 중... (부팅 대기 중)"

# 3. 에뮬레이터 부팅 대기 후 포트 포워딩 설정
echo "⏳ 3단계: 에뮬레이터 부팅 대기 중..."
adb wait-for-device
echo "✅ 에뮬레이터 연결 확인"

echo "🔌 4단계: 포트 포워딩 설정 중..."
adb reverse tcp:8081 tcp:8081
echo "✅ 포트 포워딩 설정 완료 (8081 -> 8081)"

# 4. Metro 번들러 재시작
echo "📦 5단계: Metro 번들러 재시작 중..."
cd "$PROJECT_DIR"
npm start &
METRO_PID=$!
echo "✅ Metro 번들러 시작됨 (PID: $METRO_PID)"
echo "   Metro 번들러가 완전히 시작될 때까지 몇 초 기다려주세요..."

# 5. 앱 재실행
sleep 5
echo "📱 6단계: 앱 재실행 중..."
adb shell am force-stop "$APP_PACKAGE" 2>/dev/null || true
adb shell am start -n "$APP_PACKAGE/.MainActivity" 2>/dev/null || echo "⚠️  앱이 설치되어 있지 않을 수 있습니다. 'npm run android'로 앱을 빌드하세요."

echo ""
echo "✨ 개발 환경 설정이 완료되었습니다!"
echo ""
echo "📝 다음 단계:"
echo "   1. Metro 번들러가 완전히 시작될 때까지 기다리세요"
echo "   2. 에뮬레이터에서 앱이 실행되는지 확인하세요"
echo "   3. Fast Refresh가 정상 작동하는지 확인하세요"
echo ""
echo "⚠️  참고:"
echo "   - 에뮬레이터를 재시작할 때마다 이 스크립트를 실행하세요"
echo "   - Metro 번들러를 종료하려면 Ctrl+C를 누르세요"
echo ""
