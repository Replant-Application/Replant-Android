# 워크플로우 테스트 가이드

이 문서는 GitHub Actions 워크플로우를 테스트하고 실행 상태를 확인하는 방법을 안내합니다.

## 워크플로우 실행 방법

### 방법 1: 수동 실행 (권장 - 테스트용)

워크플로우에 `workflow_dispatch`가 설정되어 있어 수동으로 실행할 수 있습니다.

1. **GitHub 저장소로 이동**
2. **Actions** 탭 클릭
3. 왼쪽 사이드바에서 **"Android Release"** 워크플로우 선택
4. 오른쪽 상단의 **"Run workflow"** 버튼 클릭
5. 브랜치 선택 (기본값: `release`)
6. **"Run workflow"** 버튼 클릭

### 방법 2: release 브랜치에 Push

`release` 브랜치에 커밋을 push하면 자동으로 워크플로우가 실행됩니다.

```bash
# release 브랜치로 전환
git checkout release

# 변경사항 커밋 (예: README 수정 등)
git add .
git commit -m "test: 워크플로우 테스트"

# push (브랜치 보호 규칙이 있으면 PR을 통해야 함)
git push origin release
```

⚠️ **주의**: 브랜치 보호 규칙이 설정되어 있으면 직접 push가 차단될 수 있습니다. 이 경우 PR을 생성해야 합니다.

### 방법 3: Pull Request 생성

1. 다른 브랜치에서 작업
2. `release` 브랜치로 PR 생성
3. PR이 머지되면 워크플로우 자동 실행

## 워크플로우 실행 상태 확인

### 1. Actions 탭에서 확인

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽에서 **"Android Release"** 워크플로우 선택
3. 실행 목록에서 최신 실행 클릭
4. 각 단계별 로그 확인

### 2. 실시간 로그 확인

- 워크플로우 실행 중에는 실시간으로 로그가 업데이트됩니다
- 각 단계(step)를 클릭하면 상세 로그 확인 가능
- 실패한 단계는 빨간색으로 표시됩니다

### 3. 주요 확인 사항

✅ **정상 실행 시 확인할 것들:**

1. **로그 마스킹 확인**
   - 민감 정보(KEYSTORE_PASSWORD 등)가 `***`로 마스킹되는지 확인
   - 로그에서 실제 값이 노출되지 않는지 확인

2. **빌드 성공 확인**
   - `Build Release AAB` 단계가 성공하는지 확인
   - 빌드 로그에 에러가 없는지 확인

3. **파일 정리 확인**
   - `Cleanup sensitive files` 단계가 실행되는지 확인
   - 키스토어 파일이 삭제되었는지 확인

4. **Google Play 업로드 확인**
   - `Upload to Google Play` 단계가 성공하는지 확인
   - Google Play Console에서 업로드 확인

## 워크플로우 실행 전 체크리스트

워크플로우를 실행하기 전에 다음을 확인하세요:

### 필수 Secrets 확인

GitHub 저장소 Settings → Secrets and variables → Actions에서 다음 secrets가 설정되어 있는지 확인:

- ✅ `KEYSTORE_BASE64` - Keystore 파일 (Base64 인코딩)
- ✅ `KEYSTORE_PASSWORD` - Keystore 비밀번호
- ✅ `KEY_ALIAS` - 키 별칭
- ✅ `KEY_PASSWORD` - 키 비밀번호
- ✅ `SERVICE_ACCOUNT_JSON` - Google Play Service Account JSON

### Secrets 설정 방법

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Name과 Value 입력
4. **Add secret** 클릭

## 일반적인 문제 해결

### 문제 1: 워크플로우가 실행되지 않음

**원인:**
- `release` 브랜치가 없음
- 워크플로우 파일이 `.github/workflows/` 디렉토리에 없음
- 파일에 문법 오류가 있음

**해결:**
- `release` 브랜치 생성 확인
- 워크플로우 파일 경로 확인
- YAML 문법 검사

### 문제 2: Secrets 관련 오류

**원인:**
- Secrets가 설정되지 않음
- Secret 이름이 잘못됨

**해결:**
- Settings → Secrets에서 모든 필수 secrets 확인
- Secret 이름이 정확한지 확인 (대소문자 구분)

### 문제 3: 빌드 실패

**원인:**
- 의존성 문제
- Gradle 설정 오류
- Keystore 파일 문제

**해결:**
- 로그에서 구체적인 에러 메시지 확인
- 로컬에서 빌드 테스트
- Keystore 파일이 올바르게 인코딩되었는지 확인

### 문제 4: Google Play 업로드 실패

**원인:**
- Service Account 권한 부족
- Package name 불일치
- AAB 파일이 생성되지 않음

**해결:**
- Service Account에 올바른 권한이 있는지 확인
- Package name이 `com.anonymous.replantmobileapp`인지 확인
- 빌드 단계가 성공했는지 확인

## 워크플로우 실행 시간

일반적으로 워크플로우 실행 시간:
- **전체 실행**: 약 10-15분
- **의존성 설치**: 약 2-3분
- **빌드**: 약 5-8분
- **Google Play 업로드**: 약 1-2분

## 로그 다운로드

1. Actions 탭에서 실행 선택
2. 오른쪽 상단의 **"..."** 메뉴 클릭
3. **"Download log archive"** 선택

## 추가 팁

### 테스트용 워크플로우 실행

실제 Google Play 업로드 없이 빌드만 테스트하려면:

1. 워크플로우 파일에서 `Upload to Google Play` 단계를 임시로 주석 처리
2. 또는 `continue-on-error: true` 추가

### 로그에서 민감 정보 확인

로그 마스킹이 제대로 작동하는지 확인:
- 로그에서 `KEYSTORE_PASSWORD` 검색
- 실제 값 대신 `***`로 표시되는지 확인

## 참고 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [워크플로우 문법 가이드](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
