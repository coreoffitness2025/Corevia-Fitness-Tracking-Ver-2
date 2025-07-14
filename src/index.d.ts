// 전역 인터페이스 확장
interface Window {
  // 앱 초기화 상태 객체
  appInitStatus?: {
    domLoaded: boolean;
    resourcesLoaded: boolean;
    appInitialized: boolean;
  };
  
  // 앱 로딩 화면을 숨기는 메서드
  hideAppLoadingScreen?: () => void;
}

// HTML 내에 정의된 전역 메서드 추가 