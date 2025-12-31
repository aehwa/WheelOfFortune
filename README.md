# Wheel of Fortune

원판형 결정룰렛 웹페이지 프로젝트

## 시작하기

```bash
npm start
```

## 브랜치 구조

- `master`: 메인 브랜치 (프로덕션 배포용)
- `dev`: 개발 브랜치 (개발 작업용)

## GitHub 배포 가이드

### 1. GitHub 저장소 생성

1. GitHub에 로그인 후 새 저장소를 생성합니다.
2. 저장소 이름을 입력하고 Public 또는 Private으로 설정합니다.
3. **README, .gitignore, license는 추가하지 마세요** (이미 프로젝트에 있음)

### 2. 로컬 저장소와 GitHub 연결

```bash
# GitHub 저장소 URL을 원격 저장소로 추가
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 또는 SSH를 사용하는 경우
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# 원격 저장소 확인
git remote -v
```

### 3. 코드 푸시

```bash
# master 브랜치 푸시
git push -u origin master

# dev 브랜치 푸시
git push -u origin dev
```

### 4. GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. **Settings** → **Pages** 메뉴로 이동
3. **Source** 섹션에서:
   - **Branch**: `master` 선택
   - **Folder**: `/ (root)` 선택
4. **Save** 버튼 클릭

### 5. 자동 배포 설정

이 프로젝트는 GitHub Actions를 사용하여 자동 배포가 설정되어 있습니다:
- `master` 브랜치에 푸시할 때마다 자동으로 GitHub Pages에 배포됩니다
- `.github/workflows/deploy.yml` 파일에서 배포 설정을 확인할 수 있습니다

### 6. 배포 확인

배포가 완료되면 다음 URL에서 확인할 수 있습니다:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

배포에는 몇 분 정도 소요될 수 있습니다.

## 개발 워크플로우

1. `dev` 브랜치에서 개발 작업 진행
2. 작업 완료 후 `dev` 브랜치에 커밋 및 푸시
3. 테스트 완료 후 `master` 브랜치로 병합
4. `master` 브랜치 푸시 시 자동 배포


