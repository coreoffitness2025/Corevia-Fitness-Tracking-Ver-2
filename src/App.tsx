import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect } from 'react';

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
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
import { isPlatform } from '@ionic/react';

// Ionic 설정
setupIonicReact({
  mode: 'md',
  // 중복 헤더 문제를 방지하기 위한 설정
  swipeBackEnabled: false,
});

const App: React.FC = () => {
  // 앱 초기화
  useEffect(() => {
    // 앱 제목 설정 - 중복 제목 문제 해결
    document.title = 'Corevia Fitness';
    
    // 네이티브 플랫폼 설정
    const setupNative = async () => {
      try {
        // 안드로이드/iOS 네이티브 앱일 때만 실행
        if (isPlatform('hybrid')) {
          // 상태바 설정
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#4285F4' });
          
          // 스플래시 스크린 보이기
          await SplashScreen.show({
            showDuration: 2000,
            autoHide: true
          });
          
          // 중복 헤더 요소 제거
          const headerCleanup = () => {
            // Ionic 헤더와 React Navigation 헤더가 중복되는 문제 해결
            const ionHeaders = document.querySelectorAll('ion-header:not(:first-child)');
            if (ionHeaders.length > 1) {
              for (let i = 1; i < ionHeaders.length; i++) {
                ionHeaders[i].remove();
              }
            }
            
            // 타이틀 중복 제거
            const ionTitles = document.querySelectorAll('ion-title');
            if (ionTitles.length > 1) {
              for (let i = 1; i < ionTitles.length; i++) {
                ionTitles[i].remove();
              }
            }
          };
          
          // 페이지 변경 시마다 중복 요소 정리
          const routeObserver = new MutationObserver(() => {
            headerCleanup();
          });
          
          // ion-router-outlet 관찰 시작
          const routerOutlet = document.querySelector('ion-router-outlet');
          if (routerOutlet) {
            routeObserver.observe(routerOutlet, { 
              childList: true, 
              subtree: true 
            });
          }
          
          // 컴포넌트 언마운트 시 관찰 중지
          return () => routeObserver.disconnect();
        }
      } catch (error) {
        console.error('네이티브 설정 오류:', error);
      }
    };
    
    setupNative();
    
    // 네이티브 앱에서 백버튼 처리
    if (CapacitorApp) {
      CapacitorApp.addListener('backButton', () => {
        if (window.location.pathname === '/home' || window.location.pathname === '/') {
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }

    const initialize = async () => {
      try {
        // 네트워크 모니터링 초기화
        console.log('네트워크 모니터링 초기화 시작...');
        const networkStatus = await initNetworkMonitoring();
        console.log('네트워크 모니터링 초기화 완료:', networkStatus);
        
        // 앱 초기화 완료 후 스플래시 스크린 숨기기
        if (isPlatform('hybrid')) {
          setTimeout(() => {
            SplashScreen.hide().catch(err => console.error('스플래시 스크린 숨기기 오류:', err));
          }, 1000);
        }
      } catch (error) {
        console.error('앱 초기화 오류:', error);
        // 오류 발생해도 스플래시 스크린 숨기기
        if (isPlatform('hybrid')) {
          SplashScreen.hide().catch(err => console.error('스플래시 스크린 숨기기 오류:', err));
        }
      }
    };
    
    initialize();
  }, []);
  
  return (
    <IonApp>
      <ThemeProvider>
        <AuthProvider>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/home" component={HomePage} />
              <Route exact path="/login" component={LoginPage} />
              <Route exact path="/register" component={RegisterPage} />
              <Route exact path="/legal" component={LegalPage} />
              <Route exact path="/qna" component={QnaPage} />
              
              <PrivateRoute exact path="/profile" component={ProfilePage} />
              <PrivateRoute exact path="/settings" component={SettingsPage} />
              <PrivateRoute exact path="/workout" component={WorkoutPage} />
              <PrivateRoute exact path="/food" component={FoodPage} />
              <PrivateRoute exact path="/exercises" component={ExerciseListPage} />
              
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
              <Route component={NotFoundPage} />
            </IonRouterOutlet>
          </IonReactRouter>
          
          <PersonalizationModal />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </ThemeProvider>
    </IonApp>
  );
};

export default App;
