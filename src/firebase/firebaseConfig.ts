// 이 파일은 이제 네이티브 플러그인에서 사용하는 설정값과
// 플러그인이 지원하지 않는 일부 웹 전용 기능만 제공합니다.

import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase 환경 설정 (네이티브 플러그인과 공유)
const firebaseConfig = {
  apiKey: "AIzaSyAVTueD8Zu_yWoSH4FLMx-Sd5KZpqzu-dk",
  authDomain: "corevia-fitness-tracking.firebaseapp.com",
  projectId: "corevia-fitness-tracking",
  storageBucket: "corevia-fitness-tracking.appspot.com",
  messagingSenderId: "911855936443",
  appId: "1:911855936443:web:a074c26f018859ffe1a76b",
  measurementId: "G-YL2PE4ZJK3"
};

// 웹 전용 기능을 위해 제한적으로 앱 초기화.
// 중요: 이 앱 인스턴스는 인증 상태를 관리하거나 DB/Storage와 통신하는 데 사용되지 않습니다.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * 비밀번호 재설정 이메일 전송 (웹 SDK 사용)
 * 이 기능은 현재 Capacitor 플러그인에서 직접 지원하지 않으므로 웹 SDK를 사용합니다.
 */
export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};
