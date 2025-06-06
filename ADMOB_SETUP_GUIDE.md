# 🎯 AdMob 설정 가이드

## 📋 앱 등록 전 준비 완료 사항 ✅

- [x] AdMob 플러그인 설치 완료
- [x] 코드 구조 준비 완료
- [x] 테스트 광고 ID 설정 완료
- [x] 안드로이드 ManifestXML 설정 완료

## 🚀 앱 등록 후 AdMob 활성화 방법

### 1단계: Google AdMob 계정 생성
1. [Google AdMob](https://admob.google.com) 접속
2. Google 계정으로 로그인
3. 새 AdMob 계정 생성

### 2단계: 앱 추가
1. AdMob 대시보드에서 "앱 추가" 클릭
2. "Google Play에 게시됨" 선택 (Play Store 등록 후)
3. 앱 정보 입력:
   - 앱 이름: `Corevia Fitness`
   - 패키지명: `com.corevia.fitness`
   - 카테고리: `건강 및 피트니스`

### 3단계: 광고 단위 생성
각 광고 유형별로 광고 단위를 생성:

#### 배너 광고
- 형식: 배너
- 이름: `Corevia_Banner_Bottom`
- 크기: 320x50 (표준 배너)

#### 전면 광고  
- 형식: 전면 광고
- 이름: `Corevia_Interstitial`

#### 보상형 광고
- 형식: 보상형
- 이름: `Corevia_Reward_Video`
- 보상 설정: 프리미엄 기능 24시간 무료

### 4단계: 광고 ID 적용

생성된 광고 ID들을 다음 파일에 적용:

#### 1. `android/app/src/main/AndroidManifest.xml`
```xml
<!-- 현재 테스트 ID를 실제 ID로 변경 -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID"/>
```

#### 2. `src/utils/adMobUtils.ts`
```typescript
// updateAdMobToProduction 함수 사용
updateAdMobToProduction({
  APP_ID: 'ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID',
  BANNER: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_ID',
  INTERSTITIAL: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_INTERSTITIAL_ID',
  REWARD: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_REWARD_ID'
});
```

## 💰 광고 배치 전략

### 배너 광고 (수익률: 낮음, UX: 좋음)
- **위치**: 홈화면 하단 고정
- **시점**: 앱 시작과 함께 항상 표시
- **예상 수익**: 월 $0.5-2 (DAU 100명 기준)

### 전면 광고 (수익률: 높음, UX: 보통) 
- **위치**: 화면 전환 시점
- **시점**: 
  - 운동 완료 후
  - 식단 저장 후  
  - 앱 시작 시 (하루 1-2회)
- **제한**: 하루 최대 5회
- **예상 수익**: 월 $5-15 (DAU 100명 기준)

### 보상형 광고 (수익률: 최고, UX: 최고)
- **위치**: 프리미엄 기능 해제 팝업
- **시점**:
  - 운동 기록 추가 슬롯 필요 시
  - 고급 분석 기능 이용 시
  - 광고 제거 옵션 제공
- **보상**: 프리미엄 기능 24시간 무료
- **예상 수익**: 월 $10-30 (DAU 100명 기준)

## 📱 실제 구현 예시

### HomePage에서 배너 광고
```tsx
import { showBannerAd, hideBannerAd } from '../utils/adMobUtils';

useEffect(() => {
  showBannerAd();
  return () => hideBannerAd();
}, []);
```

### 운동 완료 시 전면 광고
```tsx
import { showInterstitialAd } from '../utils/adMobUtils';

const handleWorkoutComplete = async () => {
  await saveWorkoutData();
  await showInterstitialAd();
  navigate('/workout/complete');
};
```

### 프리미엄 기능 해제 보상형 광고
```tsx
import { showRewardAd } from '../utils/adMobUtils';

const handleUnlockPremium = async () => {
  const rewarded = await showRewardAd();
  if (rewarded) {
    unlockPremiumFeature(24); // 24시간
    toast.success('프리미엄 기능 24시간 무료!');
  }
};
```

## ⚠️ 주의사항

1. **테스트 광고 제거**: 실제 배포 전 `IS_TESTING: false`로 변경
2. **광고 빈도 조절**: 사용자 경험을 해치지 않도록 적절한 빈도 유지  
3. **개인정보 정책**: AdMob 사용 시 개인정보 처리방침 업데이트 필요
4. **Play Store 정책**: Google Play 광고 정책 준수

## 🔧 문제 해결

### 광고가 표시되지 않는 경우
1. 광고 ID 확인
2. 앱 ID 확인
3. 네트워크 연결 상태 확인
4. AdMob 계정 상태 확인

### 수익이 낮은 경우  
1. 광고 배치 위치 최적화
2. 보상형 광고 활용도 증대
3. 사용자 세그먼트 분석
4. A/B 테스트 진행

---

**현재 상태**: 모든 코드 준비 완료 ✅  
**다음 단계**: 앱 등록 → AdMob 계정 생성 → 광고 ID 적용 