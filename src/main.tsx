import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isPlatform } from '@ionic/react';

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root')!);

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

// 앱 초기화 함수
const initializeApp = () => {
  // 웹 환경에서는 즉시 앱 렌더링
  if (!isPlatform('hybrid')) {
    console.log('[APP_INIT] 웹 환경에서 앱을 시작합니다.');
    renderApp();
    return;
  }

  // 네이티브 환경에서는 deviceready 이벤트 대기
  console.log('[APP_INIT] 네이티브 환경 감지. deviceready 이벤트를 기다립니다.');
  document.addEventListener('deviceready', () => {
    console.log('[APP_INIT] deviceready 이벤트 수신. 앱을 렌더링합니다.');
    renderApp();
  }, false);
};

initializeApp();
