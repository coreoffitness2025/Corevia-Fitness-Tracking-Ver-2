import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, isPlatform } from '@ionic/react';
import { useEffect, useState, useCallback } from 'react';

// 페이지 임포트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import WorkoutPage from './pages/workout/WorkoutPage';
import FoodPage from './pages/food/FoodPage';
import LegalPage from './pages/LegalPage';
import QnaPage from './pages/QnaPage';
import ExerciseListPage from './pages/exercise/ExerciseListPage';

// 인증 관련 컴포넌트
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PersonalizationModal from './components/auth/PersonalizationModal';

// 테마 관련
import { ThemeProvider } from './contexts/ThemeContext';

// 스타일시트
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './App.css';
import './index.css';

// Firebase 설정
import { Toaster } from 'react-hot-toast';
import { initNetworkMonitoring } from './services/networkService';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LoadingScreen } from './components/common/LoadingSpinner';

// Ionic 설정
setupIonicReact({
  mode: 'md',
  swipeBackEnabled: false,
});

const AppContent: React.FC = () => {
  const { user, loading: authLoading, userProfile, updateProfile, setUserFromInit } = useAuth();
  const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // 앱 초기화 및 인증 처리
  useEffect(() => {
    console.log('[APP] 앱 초기화 시작');
    
    const initializeApp = async () => {
      try {
        // 1. 네이티브 기기 설정
        if (isPlatform('hybrid')) {
          try {
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#4285F4' });
            // 스플래시 화면은 아직 유지 - 초기화가 완료될 때까지
          } catch (error) {
            console.error('네이티브 설정 오류:', error);
          }
        }
        
        // 2. 네트워크 모니터링 초기화
        await initNetworkMonitoring();
        
        // 3. 새 인증 초기화 서비스를 통한 인증 처리
        console.log('[APP] 인증 초기화 시작');
        const authResult = await initializeAuth();
        console.log('[APP] 인증 초기화 결과:', authResult);
        
        if (authResult.error) {
          setInitError(authResult.error);
        }
        
        // 4. AuthContext에 초기화된 사용자 설정
        if (authResult.user) {
          setUserFromInit(authResult.user, authResult.userProfile);
        }
        
        // 5. 초기화 완료 표시
        setAppInitialized(true);
      } catch (error) {
        console.error('[APP] 앱 초기화 중 오류:', error);
        setInitError('앱 초기화 중 오류가 발생했습니다.');
        setAppInitialized(true);
      }
    };

    initializeApp();
  }, [setUserFromInit]);
  
  // 스플래시 화면 제어 함수 - 오류 복구 메커니즘 추가
  const hideSplashScreen = useCallback(() => {
    if (!isPlatform('hybrid')) return;

    console.log('[APP] 스플래시 화면 숨기기 시도');
    
    // 안전한 스플래시 화면 숨기기 (오류 복구 포함)
    const attemptHide = (retries = 2) => {
      SplashScreen.hide()
        .then(() => {
          console.log('[APP] 스플래시 화면 숨김 성공');
        })
        .catch(err => {
          console.error('[APP] 스플래시 화면 숨김 오류:', err);
          
          // 재시도 로직 (최대 2회)
          if (retries > 0) {
            console.log(`[APP] 스플래시 화면 숨기기 재시도... (남은 시도: ${retries})`);
            setTimeout(() => attemptHide(retries - 1), 500);
          } else {
            console.warn('[APP] 스플래시 화면 숨기기 최대 재시도 횟수 초과');
          }
        });
    };
    
    // 약간의 지연 후 숨기기 시도 (UI 렌더링 완료 후)
    setTimeout(() => {
      attemptHide();
    }, 300);
  }, []);
  
  // 인증 로딩 상태가 변경될 때 스플래시 화면을 제어합니다.
  useEffect(() => {
    // 로딩이 완료되었을 때 (성공이든 실패든)
    if (!authLoading) {
      // 네이티브 플랫폼에서만 스플래시 화면을 숨깁니다.
      if (isPlatform('hybrid')) {
        console.log('[APP] 인증 확인 완료. 스플래시 화면을 숨깁니다.');
        SplashScreen.hide();
      }
    }
  }, [authLoading]);
  
  // 앱 초기화 중이거나 인증 로딩 중일 때 로딩 화면 표시
  // 이제 authLoading이 확실하게 false로 변경되므로 이 조건이 정상적으로 작동
  if (authLoading) {
    return <LoadingScreen message="사용자 정보를 확인 중입니다..." />;
  }
  
  // 사용자 프로필 확인 및 개인화 모달
  useEffect(() => {
    if (userProfile && sessionStorage.getItem('needsPersonalization') === 'true') {
      setIsPersonalizationModalOpen(true);
    }
  }, [userProfile]);

  const handleModalClose = useCallback(() => {
    setIsPersonalizationModalOpen(false);
    sessionStorage.removeItem('needsPersonalization');
  }, []);

  const handleModalSave = useCallback(async (profile: any) => {
    if (updateProfile) {
      await updateProfile(profile);
    }
    handleModalClose();
  }, [updateProfile, handleModalClose]);
  
  return (
    <>
      <IonRouterOutlet>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/qna" element={<QnaPage />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/exercises" element={<ExerciseListPage />} />
          </Route>
          
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </IonRouterOutlet>
      
      {userProfile && (
        <PersonalizationModal 
          isOpen={isPersonalizationModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          userProfile={userProfile}
        />
      )}
      <Toaster position="bottom-center" />
    </>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </IonApp>
  );
};

export default App;
