# 브랜치 보호 규칙 설정 가이드

이 문서는 `release` 브랜치에 대한 GitHub 브랜치 보호 규칙 설정 방법을 안내합니다.

## 설정 방법

### 1. GitHub 저장소 설정 접근

1. GitHub 저장소로 이동
2. **Settings** 탭 클릭
3. 왼쪽 사이드바에서 **Branches** 클릭
4. **Branch protection rules** 섹션에서 **Add rule** 클릭

### 2. 브랜치 패턴 설정

- **Branch name pattern**: `release` 입력

### 3. 권장 보호 규칙 설정

#### 필수 설정 (Required)

✅ **Require a pull request before merging**
   - **Require approvals**: 1명 이상 (또는 팀 정책에 맞게)
   - **Dismiss stale pull request approvals when new commits are pushed**: 체크
   - **Require review from Code Owners**: 코드 소유자가 있는 경우 체크

✅ **Require status checks to pass before merging**
   - **Require branches to be up to date before merging**: 체크
   - **Status checks that are required**: 
     - `build` (워크플로우의 job 이름)
     - 또는 `Android Release / build`

✅ **Require conversation resolution before merging**: 체크
   - PR의 모든 대화가 해결되어야 머지 가능

✅ **Do not allow bypassing the above settings**: 체크
   - 관리자도 규칙을 우회할 수 없도록 설정

#### 선택적 설정 (권장)

✅ **Restrict who can push to matching branches**
   - 특정 팀이나 사용자만 `release` 브랜치에 직접 push 가능하도록 제한
   - 일반적으로는 PR을 통해서만 머지하도록 권장

✅ **Require linear history**: 체크
   - 깔끔한 히스토리 유지

✅ **Include administrators**: 체크
   - 관리자도 보호 규칙 적용

### 4. 저장

**Create** 또는 **Save changes** 버튼 클릭

## 보안 효과

이러한 보호 규칙을 설정하면:

1. ✅ **무단 변경 방지**: 승인 없이 `release` 브랜치에 직접 push 불가
2. ✅ **CI/CD 검증 필수**: 빌드가 성공해야만 머지 가능
3. ✅ **코드 리뷰 강제**: 최소 1명 이상의 승인 필요
4. ✅ **대화 해결 필수**: PR의 모든 이슈/코멘트 해결 필요
5. ✅ **관리자 우회 방지**: 관리자도 규칙을 우회할 수 없음

## 추가 권장 사항

### Code Owners 파일 생성

`.github/CODEOWNERS` 파일을 생성하여 코드 소유자를 지정할 수 있습니다:

```
# .github/CODEOWNERS
* @your-team-name
/android/ @android-team
/.github/workflows/ @devops-team
```

### 보호 규칙 확인

설정 후 다음을 확인하세요:

1. `release` 브랜치에 직접 push 시도 → 거부되어야 함
2. PR 생성 시 → CI/CD가 자동 실행되어야 함
3. 승인 없이 머지 시도 → 거부되어야 함

## 참고 자료

- [GitHub 브랜치 보호 규칙 공식 문서](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CODEOWNERS 파일 가이드](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
