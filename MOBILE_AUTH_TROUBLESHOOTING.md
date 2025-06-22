# 모바일 인증 문제 해결 가이드

## 문제 설명

모바일 기기에서 "액세스 차단됨: Google 정책에 의해 이 요청이 차단되었습니다" 오류와 함께 "403 오류: disallowed_useragent" 메시지가 나타나는 경우, 이는 Google의 OAuth 인증 정책과 관련된 제한 사항입니다.

![모바일 인증 오류 예시](https://i.imgur.com/example-error.png)

## 원인

이 문제는 다음과 같은 이유로 발생할 수 있습니다:

1. **웹뷰 환경에서의 제한**: Google은 보안상의 이유로 일반 웹뷰(WebView) 또는 앱 내 브라우저에서 OAuth 로그인을 제한하고 있습니다.
2. **승인된 도메인 누락**: Firebase 콘솔에 현재 사용 중인 도메인이 등록되지 않았습니다.
3. **모바일 플랫폼 설정 미비**: Firebase 콘솔에 모바일 플랫폼이 추가되지 않았습니다.

## 해결 방법

### 1. Firebase 콘솔에서 도메인 추가

1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 "인증(Authentication)"을 클릭합니다.
4. "설정(Settings)" 탭을 클릭합니다.
5. "승인된 도메인(Authorized domains)" 섹션으로 이동합니다.
6. "도메인 추가(Add domain)" 버튼을 클릭하고 다음 도메인을 추가합니다:
   - `corevia-fitness-tracking-ver-2.vercel.app`
   - 개발 환경 도메인 (예: `localhost`)

### 2. Google Cloud 콘솔에서 OAuth 설정 변경

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. Firebase 프로젝트와 연결된 Google Cloud 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 "API 및 서비스(APIs & Services)" > "사용자 인증 정보(Credentials)"로 이동합니다.
4. OAuth 2.0 클라이언트 ID를 찾아 클릭합니다.
5. "승인된 자바스크립트 출처(Authorized JavaScript origins)"에 앱 URL을 추가합니다:
   - `https://corevia-fitness-tracking-ver-2.vercel.app`
6. "승인된 리디렉션 URI(Authorized redirect URIs)"에 리디렉션 URL을 추가합니다:
   - `https://corevia-fitness-tracking-ver-2.vercel.app/__/auth/handler`

### 3. 모바일 앱으로 전환 (장기적 해결책)

웹 기반의 OAuth는 계속해서 제한이 있을 수 있으므로, 네이티브 모바일 앱으로 전환하는 것이 좋습니다:

1. Capacitor를 사용하여 웹 앱을 네이티브 앱으로 변환합니다:
   ```bash
   npx cap add android
   npx cap add ios
   npx cap sync
   ```

2. Firebase용 Capacitor 플러그인을 설치합니다:
   ```bash
   npm install @capacitor-firebase/authentication
   ```

3. 네이티브 인증 방식을 사용하도록 코드를 수정합니다.

## Chrome WebView 문제 해결

Android 기기에서 WebView를 통해 앱을 실행하는 경우, 다음 작업을 시도해보세요:

1. **Chrome Custom Tabs 사용**:
   - 앱에서 외부 브라우저 또는 Chrome Custom Tabs를 사용하도록 설정합니다.

2. **OAuth 플로우 변경**:
   - 앱에서 PKCE(Proof Key for Code Exchange) 인증 흐름을 사용합니다.

## 첫 번째 문제 해결 후 다음 단계

모바일 인증 문제를 해결한 후에는:

1. **사용자 경험 테스트**: 다양한 모바일 기기와 브라우저에서 로그인을 테스트합니다.
2. **오류 로그 확인**: 콘솔에 기록된 디버그 로그를 확인하여 잠재적인 문제를 파악합니다.
3. **사용자 피드백 수집**: 사용자로부터 인증 프로세스에 대한 피드백을 수집하여 계속해서 개선합니다.

## 관련 링크

- [Firebase Auth 문서](https://firebase.google.com/docs/auth)
- [Google OAuth 2.0 정책](https://developers.google.com/identity/protocols/oauth2)
- [Capacitor 문서](https://capacitorjs.com/docs) 