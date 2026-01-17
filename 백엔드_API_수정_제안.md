# 기상 미션 인증 API 수정 제안

## 문제점
현재 프론트엔드에서 `userMissionId`를 전달받지 못하거나, 전달받았지만 백엔드에서 해당 미션을 찾을 수 없는 경우가 발생합니다.

## 해결 방안

### 방안 1: userMissionId 없이 현재 활성화된 기상 미션 자동 조회 (권장)

#### API 엔드포인트 수정
```
GET /api/missions/my/wakeup/verify-time
```

**현재 동작:**
- `userMissionId`가 없으면 자동으로 찾음
- 하지만 찾지 못하는 경우가 있음

**수정 제안:**
1. **현재 시간대에 할당된 기상 미션 자동 조회**
   - 현재 사용자의 기상 시간대 설정 확인
   - 현재 시간이 해당 시간대에 속하는지 확인
   - 해당 시간대에 할당된 가장 최근의 `ASSIGNED` 상태인 기상 미션 반환

2. **응답 구조 개선**
```json
{
  "canVerify": true,
  "userMissionId": 177,  // 자동으로 찾은 userMissionId 포함
  "currentTimeSlot": "EARLY_MORNING",
  "settingTimeSlot": "EARLY_MORNING",
  "message": "인증 가능합니다",
  "assignedAt": "2024-01-15T06:00:00Z"
}
```

3. **에러 처리 개선**
   - 할당된 미션이 없을 때: `canVerify: false, message: "현재 할당된 기상 미션이 없습니다"`
   - 시간 초과: `canVerify: false, message: "인증 시간이 지났습니다"`

#### 백엔드 구현 예시 (Java/Spring Boot)
```java
@GetMapping("/missions/my/wakeup/verify-time")
public ResponseEntity<WakeupVerificationResult> verifyWakeupTime(
    @RequestParam(required = false) Long userMissionId
) {
    // 1. userMissionId가 제공되면 해당 미션 사용
    // 2. 없으면 현재 사용자의 활성화된 기상 미션 자동 조회
    if (userMissionId == null) {
        userMissionId = findActiveWakeUpMission();
    }
    
    if (userMissionId == null) {
        return ResponseEntity.ok(WakeupVerificationResult.builder()
            .canVerify(false)
            .message("현재 할당된 기상 미션이 없습니다")
            .build());
    }
    
    // 인증 로직 수행
    // ...
}
```

### 방안 2: 인증 API에서 userMissionId 자동 조회

#### API 엔드포인트
```
POST /api/missions/my/wakeup/verify
```

**요청:**
```json
{
  // userMissionId 생략 가능
}
```

**응답:**
```json
{
  "success": true,
  "userMissionId": 177,  // 자동으로 찾은 ID
  "message": "인증 완료"
}
```

### 방안 3: 기상 미션 조회 API 개선

#### 새로운 API 엔드포인트
```
GET /api/missions/my/wakeup/current
```

**응답:**
```json
{
  "userMissionId": 177,
  "assignedAt": "2024-01-15T06:00:00Z",
  "timeRemaining": 480,  // 초 단위
  "canVerify": true
}
```

**에러 응답:**
```json
{
  "error": {
    "code": "M003",
    "message": "현재 활성화된 기상 미션이 없습니다"
  }
}
```

## 권장 사항

1. **방안 1을 우선 구현** (가장 간단하고 효과적)
2. **FCM 알림에 userMissionId 포함** (현재 포함되어 있지만 확인 필요)
3. **에러 메시지 개선** (더 명확한 안내)

## 프론트엔드 대응

프론트엔드에서는 이미 다음을 구현했습니다:
1. `WakeUpMissionContext`로 전역 상태 관리
2. `userMissionId` 없이도 API 호출 가능하도록 수정
3. 에러 처리 개선

백엔드에서 위 방안을 구현하면 프론트엔드에서 `userMissionId` 없이도 정상 작동합니다.
