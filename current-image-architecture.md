# 기존 이미지 아키텍처

## 현재 구조

### 1. 사용자 생성 이미지 (S3 직접 접근)

#### 업로드 프로세스
```
앱 → FormData로 백엔드 API 호출 → 백엔드가 S3에 저장 → fileUrl 반환
```

**업로드 API 엔드포인트:**
- 일반 업로드: `POST /files/upload`
- 미션 인증 사진: `POST /files/upload/mission-verify` → S3 `mission_verify/` 폴더
- 커뮤니티 게시글: `POST /files/upload/REPLANT/COMMUNITY` → S3 `REPLANT/COMMUNITY/` 폴더
- 특정 폴더: `POST /files/upload/:folder`

**응답 형식:**
```typescript
interface UploadResponse {
  fileName: string;
  fileUrl: string;      // S3 직접 URL (예: https://bucket.s3.ap-northeast-2.amazonaws.com/path/file.jpg)
  fileSize: number;
  contentType: string;
}
```

#### 저장 방식
- **미션 인증 사진**: 로컬 스토리지에 `images: string[]` 배열로 저장 (다중 이미지 지원)
- **커뮤니티 게시글**: 백엔드에 `imageUrls: string[]` 배열로 저장
- **인증 게시글**: 백엔드에 `imageUrls: string[]` 배열로 저장

#### 로드 방식
```tsx
// React Native Image 컴포넌트 사용
<Image 
  source={{ uri: imageUrl }}  // S3 직접 URL
  style={styles.image}
  resizeMode="cover"
/>
```

**데이터 구조:**
```typescript
// Mission 타입
interface Mission {
  images?: string[];        // S3 URL 배열 (다중 이미지)
  photo_url?: string;       // @deprecated (하위 호환성)
}

// Post 타입
interface Post {
  imageUrls: string[];      // S3 URL 배열
}
```

### 2. 캐릭터 이미지 (로컬 Assets)

#### 저장 위치
```
src/assets/images/characters/
├── level1/
│   ├── default_static.png
│   ├── default.gif
│   └── happy.gif
├── level2/
│   ├── default_static.png
│   ├── default.gif
│   └── happy.gif
... (level3, level4, level5 동일)
└── transformation.gif
```

#### 로드 방식
```typescript
// require()로 직접 로드
const image = require('../assets/images/characters/level1/default.gif');

// 유틸리티 함수 사용
import { getCharacterImage, getCharacterImageStatic } from '../utils/characterUtils';

const animatedImage = getCharacterImage(level, 'happy');  // GIF
const staticImage = getCharacterImageStatic(level);      // PNG
```

```tsx
// React Native Image 컴포넌트
<Image 
  source={getCharacterImage(level, emotion)}
  style={styles.characterImage}
  resizeMode="contain"
/>

// FastImage 사용 (HomeScreen)
<FastImage
  source={getCharacterImage(level, emotion)}
  style={styles.characterImage}
  resizeMode={FastImage.resizeMode.contain}
/>
```

## 문제점

### S3 직접 접근의 한계
1. **URL 형식**: `https://bucket-name.s3.ap-northeast-2.amazonaws.com/path/file.jpg`
   - 특정 리전에 종속됨
   - 지리적 거리로 인한 지연

2. **캐싱 없음**: 매 요청마다 S3까지 직접 접근
   - 반복 요청 비효율
   - 비용 증가

3. **최적화 없음**: 원본 이미지 그대로 제공
   - 모바일 네트워크에 최적화되지 않음
   - 불필요한 데이터 사용

### 로컬 Assets의 한계
1. **앱 크기 증가**: GIF 파일들이 앱 번들에 포함
2. **업데이트 어려움**: 이미지 수정 시 앱 업데이트 필요
3. **동적 콘텐츠 불가**: 이벤트 스킨 등 제공 불가

## CloudFront 도입 후 예상 구조

### 변경 사항
1. **S3 URL → CloudFront URL 변환**
   ```
   기존: https://bucket.s3.ap-northeast-2.amazonaws.com/path/file.jpg
   변경: https://d1234567890.cloudfront.net/path/file.jpg
   ```

2. **캐릭터 이미지도 S3로 이전**
   - S3 `characters/level{1-5}/` 폴더에 저장
   - CloudFront를 통해 제공

3. **자동 캐싱 및 최적화**
   - 엣지 로케이션에서 캐싱
   - Lambda@Edge로 이미지 최적화 가능
