# 🌱 Replant App

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54.0.30-000020?logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

> **은둔형 외톨이의 사회복귀를 돕는 앱** - 쉬었음 청년들을 위한 일상 회복 플랫폼

---

## 📱 주요 기능

**하루의 계획 → 수행 → 회고 사이클**

**1. 투두리스트 설정**  
앱을 켜면 하루의 투두리스트를 설정합니다. 필수 미션과 사용자가 직접 추가하는 커스텀 미션으로 구성됩니다.

**2. 미션 수행 및 인증**  
각 미션은 고유한 인증 방식이 있습니다. 인증을 완료하면 미션이 성공 처리되고 경험치를 획득합니다.

**3. 캐릭터(리앤트) 성장**  
획득한 경험치로 캐릭터의 레벨이 올라가며 성장합니다.

**4. 감정일기 작성**  
하루 미션을 수행하면서 느낀 점이나 자유롭게 쓰고 싶은 내용을 감정일기에 기록합니다.

## 🚀 시작하기

### 설치

```bash
# 의존성 설치
npm install

# iOS 설정 (macOS만)
cd ios && pod install && cd ..
```

### 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# Android 키스토어 설정 (릴리즈 빌드용)
cp android/local.properties.example android/local.properties
```

### 실행

```bash
# Metro 서버 시작
npm start

# Android 에뮬레이터
npm run android

# iOS 시뮬레이터 (macOS만)
npm run ios
```

**🌱 함께 성장해요!** - Replant Team
