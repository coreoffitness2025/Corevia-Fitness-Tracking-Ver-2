import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signInWithEmail } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

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

const LoginHeader = () => (
  <>
    <h1 className="text-2xl font-bold mb-4">Corevia Fitness</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      계정으로 로그인하고<br />나만의 운동 기록을 시작하세요.
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
      <LoginButton 
        isLoading={isLoading} 
        onClick={() => {}}
        type="email"
      />
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

  // 이미 로그인되어 있으면 홈으로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      checkIfNeedsPersonalization();
    }
  }, [isAuthenticated]);

  // 사용자가 개인화 설정이 필요한지 확인
  const checkIfNeedsPersonalization = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        // 중요 필드가 없으면 개인화 필요
        if (!userData.height || !userData.weight || !userData.age) {
          setUserProfile(userData);
          setIsPersonalizationOpen(true);
        } else {
          // 개인화 완료된 사용자는 홈으로
          navigate('/');
        }
      } else {
        // 문서가 없으면 개인화 필요
        setIsPersonalizationOpen(true);
      }
    } catch (error) {
      console.error('Error checking personalization:', error);
      setError('사용자 데이터를 확인하는 중 오류가 발생했습니다.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      // Auth 컨텍스트의 useEffect가 로그인 상태를 감지하고 처리
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      setError('Google 로그인 중 오류가 발생했습니다.');
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
    } catch (error) {
      console.error('이메일 로그인 오류:', error);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalizationSave = async (profile: Partial<UserProfile>) => {
    try {
      await updateProfile(profile);
      setIsPersonalizationOpen(false);
      navigate('/');
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      setError('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <LoginHeader />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <LoginButton 
            isLoading={isLoading} 
            onClick={handleGoogleLogin}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">또는</span>
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
