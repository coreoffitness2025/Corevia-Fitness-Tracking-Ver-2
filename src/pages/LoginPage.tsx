import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signInWithEmail, getGoogleRedirectResult } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';

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
  isLoading 
}: { 
  onSubmit: (email: string, password: string, rememberMe: boolean) => void; 
  isLoading: boolean;
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
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '로그인 중...' : '이메일로 로그인'}
      </button>
    </form>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, isAuthenticated } = useAuth();
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>(''); // 디버깅 정보

  // 인증 상태 변경 감지
  useEffect(() => {
    console.log('Authentication state changed:', isAuthenticated, currentUser?.uid);
    setDebugInfo(prev => `${prev}\n인증 상태: ${isAuthenticated ? '로그인됨' : '로그인되지 않음'}\n사용자 ID: ${currentUser?.uid || 'none'}`);
    
    if (isAuthenticated) {
      checkIfNeedsPersonalization();
    }
  }, [isAuthenticated, currentUser]);

  // 구글 리디렉션 결과 처리
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setDebugInfo('Google 리디렉션 처리 중...');
        const result = await getGoogleRedirectResult();
        
        if (result && result.user) {
          // 사용자가 리디렉션으로 로그인에 성공했을 때
          console.log('Google 리디렉션 로그인 성공:', result.user);
          setDebugInfo(prev => `${prev}\nGoogle 로그인 성공: ${result.user.uid}`);
          
          // Firestore에 사용자 정보가 없으면 기본 정보로 저장
          const userDocRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // 기본 사용자 프로필 데이터 생성 (타입 단언 사용)
            const userProfileData = {
              uid: result.user.uid,
              displayName: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
            } as UserProfile;
            
            await setDoc(userDocRef, userProfileData);
            setDebugInfo(prev => `${prev}\nFirestore에 사용자 정보 저장 완료`);
          }
          
          // 로그인 성공 메시지
          toast.success('Google 로그인이 완료되었습니다.');
          setDebugInfo(prev => `${prev}\n로그인 완료 - AuthContext 상태 업데이트 대기 중`);
          
          // 로그인 후 처리는 isAuthenticated가 변경될 때 처리됨
        } else {
          setDebugInfo(prev => `${prev}\nGoogle 로그인 결과 없음`);
        }
      } catch (error: any) {
        console.error('리디렉션 결과 처리 오류:', error);
        setError('Google 로그인 처리 중 오류가 발생했습니다.');
        setDebugInfo(prev => `${prev}\n오류: ${error.message || '알 수 없는 오류'}`);
        setIsLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  // 사용자가 개인화 설정이 필요한지 확인
  const checkIfNeedsPersonalization = async () => {
    if (!currentUser) return;
    
    try {
      setDebugInfo(prev => `${prev}\n개인화 설정 확인 중...`);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setDebugInfo(prev => `${prev}\n사용자 데이터 로드됨`);
        
        // 중요 필드가 없으면 개인화 필요
        if (!userData.height || !userData.weight || !userData.age) {
          setUserProfile(userData);
          setIsPersonalizationOpen(true);
          setDebugInfo(prev => `${prev}\n개인화 필요: 모달 표시`);
        } else {
          // 개인화 완료된 사용자는 홈으로
          setDebugInfo(prev => `${prev}\n개인화 완료: 홈으로 이동`);
          navigate('/');
        }
      } else {
        // 문서가 없으면 개인화 필요
        setIsPersonalizationOpen(true);
        setDebugInfo(prev => `${prev}\n사용자 문서 없음: 개인화 모달 표시`);
      }
    } catch (error: any) {
      console.error('Error checking personalization:', error);
      setError('사용자 데이터를 확인하는 중 오류가 발생했습니다.');
      setDebugInfo(prev => `${prev}\n개인화 확인 오류: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo('Google 로그인 시작...');
    
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        // 사용자가 로그인에 성공했을 때
        console.log('Google 로그인 성공:', result.user);
        setDebugInfo(prev => `${prev}\nGoogle 로그인 성공: ${result.user.uid}`);
        
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
          setDebugInfo(prev => `${prev}\nFirestore에 사용자 정보 저장 완료`);
        }
        
        // 로그인 성공 메시지
        toast.success('Google 로그인이 완료되었습니다.');
        setDebugInfo(prev => `${prev}\n로그인 완료 - AuthContext 상태 업데이트 대기 중`);
        
        // 로그인 후 처리는 isAuthenticated가 변경될 때 처리됨
      } else {
        setError('Google 로그인에 실패했습니다.');
        setDebugInfo(prev => `${prev}\nGoogle 로그인 결과 없음`);
      }
    } catch (error: any) {
      console.error('Google 로그인 오류:', error);
      setError('Google 로그인 중 오류가 발생했습니다.');
      setDebugInfo(prev => `${prev}\n오류: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    setError(null);
    setDebugInfo('이메일 로그인 시작...');
    
    try {
      await signInWithEmail(email, password);
      setDebugInfo(prev => `${prev}\n이메일 로그인 완료 - 인증 상태 업데이트 대기 중`);
      // Auth 컨텍스트의 useEffect가 로그인 상태를 감지하고 처리
    } catch (error: any) {
      console.error('이메일 로그인 오류:', error);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setDebugInfo(prev => `${prev}\n오류: ${error.message || '알 수 없는 오류'}`);
      setIsLoading(false);
    }
  };

  const handlePersonalizationSave = async (profile: Partial<UserProfile>) => {
    try {
      setDebugInfo(prev => `${prev}\n개인화 정보 저장 중...`);
      await updateProfile(profile);
      setIsPersonalizationOpen(false);
      setDebugInfo(prev => `${prev}\n개인화 저장 완료: 홈으로 이동`);
      navigate('/');
    } catch (error: any) {
      console.error('프로필 저장 오류:', error);
      setError('프로필 저장 중 오류가 발생했습니다.');
      setDebugInfo(prev => `${prev}\n오류: ${error.message || '알 수 없는 오류'}`);
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
        
        {/* 디버깅 정보 */}
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
            <h3 className="font-bold mb-1">디버깅 정보:</h3>
            {debugInfo}
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
          />
        </div>
      </div>
      
      {isPersonalizationOpen && (
        <PersonalizationModal
          isOpen={isPersonalizationOpen}
          onClose={() => setIsPersonalizationOpen(false)}
          onSave={handlePersonalizationSave}
        />
      )}
    </div>
  );
}
