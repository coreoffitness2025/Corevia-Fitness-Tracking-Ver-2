import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, sendPasswordResetEmail } from 'firebase/auth';
import { UserProfile } from '../types';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmail, auth } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import { signInWithGoogleOptimized, handleRedirectResult, logAuthDebugInfo, isMobileDevice } from '../services/authService';

const LoginButton = ({ 
  isLoading, 
  onClick,
  type = 'google'
}: { 
  isLoading: boolean; 
  onClick: () => void;
  type?: 'google' | 'email';
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`${
      type === 'google' 
        ? 'bg-blue-500 hover:bg-blue-600' 
        : 'bg-green-500 hover:bg-green-600'
    } text-white font-medium px-6 py-3 rounded ${
      isLoading ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    type="button"
  >
    {isLoading ? '로그인 중...' : type === 'google' ? 'Google로 로그인' : '이메일로 로그인'}
  </button>
);

const LoginHeader = ({ navigate }: { navigate: (path: string) => void }) => (
  <>
    <h1 className="text-2xl font-bold mb-4">Corevia Fitness</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      계정으로 로그인하고<br />나만의 운동 기록을 시작하세요.
    </p>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      계정이 없으신가요?{' '}
      <button
        onClick={() => navigate('/register')}
        className="text-blue-500 hover:text-blue-700 font-medium"
      >
        회원가입
      </button>
    </p>
  </>
);

const EmailLoginForm = ({ 
  onSubmit, 
  isLoading,
  onForgotPassword 
}: { 
  onSubmit: (email: string, password: string, rememberMe: boolean) => void; 
  isLoading: boolean;
  onForgotPassword: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, rememberMe);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          이메일
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            로그인 상태 유지
          </label>
        </div>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          아이디/비밀번호 찾기
        </button>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '로그인 중...' : '이메일로 로그인'}
      </button>
    </form>
  );
};

// 아이디/비밀번호 찾기 모달 컴포넌트
const ForgotPasswordModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const [activeTab, setActiveTab] = useState<'findId' | 'resetPassword'>('resetPassword');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인해주세요.');
      onClose();
    } catch (error: any) {
      console.error('비밀번호 재설정 오류:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('등록되지 않은 이메일입니다.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('올바른 이메일 형식을 입력해주세요.');
      } else {
        toast.error('비밀번호 재설정 이메일 전송에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 보안상 이유로 직접적인 사용자 존재 확인 대신
      // 비밀번호 재설정 이메일을 보내서 계정 존재 여부를 간접 확인
      await sendPasswordResetEmail(auth, email);
      toast.success('해당 이메일로 계정이 존재합니다. 비밀번호 재설정 이메일도 함께 전송되었습니다.');
    } catch (error: any) {
      console.error('이메일 확인 오류:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('해당 이메일로 가입된 계정이 없습니다.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('올바른 이메일 형식을 입력해주세요.');
      } else {
        toast.error('해당 이메일로 가입된 계정이 없거나 확인할 수 없습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            계정 찾기
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('findId')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'findId'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            아이디 찾기
          </button>
          <button
            onClick={() => setActiveTab('resetPassword')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'resetPassword'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            비밀번호 재설정
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'findId' ? (
            <form onSubmit={handleEmailCheck} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                가입시 사용한 이메일을 입력하시면 계정 존재 여부를 확인해드립니다.
                <br />계정이 존재하는 경우 비밀번호 재설정 이메일도 함께 전송됩니다.
              </p>
              <div>
                <label htmlFor="findEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="findEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="example@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '확인 중...' : '이메일 확인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                가입시 사용한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </p>
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="example@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '전송 중...' : '재설정 이메일 전송'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, isAuthenticated } = useAuth();
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 인증 상태 변경 감지
  useEffect(() => {
    console.log('Authentication state changed:', isAuthenticated, currentUser?.uid);
    
    if (isAuthenticated && currentUser) {
      // 로그인 상태 확인 후 즉시 개인화 필요 여부 확인
      setTimeout(() => {
        checkIfNeedsPersonalization();
      }, 500); // 약간의 지연 시간을 두어 다른 상태가 업데이트될 시간을 줌
    }
  }, [isAuthenticated, currentUser]);

  // 모바일 환경 감지
  useEffect(() => {
    const checkMobileDevice = () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);
      logAuthDebugInfo('모바일 환경 감지', { isMobile: mobile });
    };
    
    checkMobileDevice();
  }, []);

  // 구글 리디렉션 결과 처리
  useEffect(() => {
    const processRedirectResult = async () => {
      setIsLoading(true);
      try {
        logAuthDebugInfo('로그인 페이지에서 리디렉션 결과 처리 시작');
        const result = await handleRedirectResult();
        
        if (result && result.user) {
          // 사용자가 리디렉션으로 로그인에 성공했을 때
          logAuthDebugInfo('리디렉션 로그인 성공', { uid: result.user.uid });
          
          try {
            // Firestore에 사용자 정보가 없으면 기본 정보로 저장
            const userDocRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
              // 기본 사용자 프로필 데이터 생성
              const userProfileData = {
                uid: result.user.uid,
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
              } as UserProfile;
              
              await setDoc(userDocRef, userProfileData);
              
              // 사용자 정보가 없으므로 개인화 모달 표시
              setUserProfile(userProfileData);
              setIsPersonalizationOpen(true);
            }
            
            // 로그인 성공 메시지
            toast.success('Google 로그인이 완료되었습니다.');
          } catch (firestoreError: any) {
            console.error('Firestore 데이터 처리 중 오류:', firestoreError);
            toast.error('사용자 정보 처리 중 오류가 발생했습니다.');
          }
        }
      } catch (error: any) {
        console.error('리디렉션 결과 처리 오류:', error);
        
        // 오류 처리 개선
        if (error.code === 'auth/disallowed-useragent') {
          setError('모바일 브라우저에서는 Google 로그인에 제한이 있습니다. Firebase 콘솔에서 설정을 확인해주세요.');
          toast.error('모바일 브라우저 제한으로 인해 Google 로그인이 차단되었습니다.');
        } else {
          setError('Google 로그인 처리 중 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    processRedirectResult();
  }, []);

  // 사용자가 개인화 설정이 필요한지 확인
  const checkIfNeedsPersonalization = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        
        // 중요 필드가 없으면 개인화 필요
        if (!userData.height || !userData.weight || !userData.age) {
          console.log('개인화 필요: 모달 표시됨');
          setUserProfile(userData);
          setIsPersonalizationOpen(true);
        } else {
          // 개인화 완료된 사용자는 홈으로
          navigate('/');
        }
      } else {
        // 문서가 없으면 개인화 필요
        console.log('사용자 문서 없음: 개인화 모달 표시됨');
        setIsPersonalizationOpen(true);
      }
    } catch (error: any) {
      console.error('Error checking personalization:', error);
      setError('사용자 데이터를 확인하는 중 오류가 발생했습니다.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logAuthDebugInfo('Google 로그인 시작');
      
      // 향상된 Google 로그인 함수 사용
      const result = await signInWithGoogleOptimized();
      
      if (result && result.user) {
        logAuthDebugInfo('Google 로그인 성공', { uid: result.user.uid });
        
        try {
          // Firestore에 사용자 정보가 없으면 기본 정보로 저장
          const userDocRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // 기본 사용자 프로필 데이터 생성
            const userProfileData = {
              uid: result.user.uid,
              displayName: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
            } as UserProfile;
            
            await setDoc(userDocRef, userProfileData);
            
            // 사용자 정보가 없으므로 개인화 모달 표시
            setUserProfile(userProfileData);
            setIsPersonalizationOpen(true);
          } else {
            // 이미 정보가 있는 경우 개인화 필요 여부 확인
            const userData = userDoc.data() as UserProfile;
            
            if (!userData.height || !userData.weight || !userData.age) {
              setUserProfile(userData);
              setIsPersonalizationOpen(true);
            } else {
              // 모든 데이터가 있으면 홈으로 이동
              navigate('/');
            }
          }
          
          // 로그인 성공 메시지
          toast.success('Google 로그인이 완료되었습니다.');
        } catch (firestoreError: any) {
          console.error('Firestore 데이터 처리 중 오류:', firestoreError);
          // 오류가 발생해도 사용자는 로그인된 상태이므로 홈으로 이동
          navigate('/');
        }
      } else if (isMobile) {
        // 모바일에서는 리디렉션 후 결과가 null이 예상됨
        toast.success('로그인 진행 중입니다. 잠시 기다려주세요.');
        logAuthDebugInfo('모바일에서 리디렉션 후 대기 중');
      } else {
        setError('Google 로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Google 로그인 오류:', error);
      logAuthDebugInfo('Google 로그인 오류', error);
      
      // 오류 메시지 개선
      if (error.code === 'auth/unauthorized-domain') {
        setError(`현재 도메인이 Firebase에 등록되지 않았습니다. Firebase 콘솔에서 '인증 > 설정 > 승인된 도메인'에 ${window.location.origin}을 추가해주세요.`);
      } else if (error.code === 'auth/disallowed-useragent') {
        setError('현재 사용 중인 브라우저에서는 Google 로그인이 제한됩니다. 다른 브라우저를 사용하거나 Firebase 설정을 확인해주세요.');
      } else {
        setError('Google 로그인 중 오류가 발생했습니다.');
      }
      
      toast.error('로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmail(email, password);
      // Auth 컨텍스트의 useEffect가 로그인 상태를 감지하고 처리
    } catch (error: any) {
      console.error('이메일 로그인 오류:', error);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setIsLoading(false);
    }
  };

  const handlePersonalizationSave = async (profile: Partial<UserProfile>) => {
    try {
      await updateProfile(profile);
      setIsPersonalizationOpen(false);
      navigate('/');
    } catch (error: any) {
      console.error('프로필 저장 오류:', error);
      setError('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <LoginHeader navigate={navigate} />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {isMobile && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">
              모바일 환경에서는 Google 로그인에 제한이 있을 수 있습니다. 
              오류가 발생한다면 데스크탑 브라우저를 사용해보세요.
            </span>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {isLoading ? '로그인 중...' : 'Google로 로그인'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">또는</span>
            </div>
          </div>
          
          <EmailLoginForm 
            onSubmit={handleEmailLogin} 
            isLoading={isLoading} 
            onForgotPassword={() => setIsForgotPasswordOpen(true)}
          />
        </div>
      </div>
      
      <PersonalizationModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        onSave={handlePersonalizationSave}
      />
      
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
