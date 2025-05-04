import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserProfile } from '../types';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import { useLogin } from '../hooks/useLogin';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/common/Layout';

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
        onClick={() => onSubmit(email, password, rememberMe)}
        type="email"
      />
    </form>
  );
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPersonalization, setShowPersonalization] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loginType, setLoginType] = useState<'google' | 'email'>('google');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const { handleLogin, handleEmailLogin } = useLogin({
    setIsLoading,
    setUser,
    setUserProfile,
    setShowPersonalization,
    navigate,
  });

  const { handleSaveProfile } = useProfile({
    userProfile,
    navigate,
  });

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <LoginHeader />
        
        <div className="mb-6">
          <button
            onClick={() => setLoginType('google')}
            className={`mr-4 px-4 py-2 rounded ${
              loginType === 'google'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Google 로그인
          </button>
          <button
            onClick={() => setLoginType('email')}
            className={`px-4 py-2 rounded ${
              loginType === 'email'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            이메일 로그인
          </button>
        </div>

        {loginType === 'google' ? (
          <LoginButton 
            isLoading={isLoading} 
            onClick={handleLogin} 
          />
        ) : (
          <EmailLoginForm 
            onSubmit={handleEmailLogin} 
            isLoading={isLoading} 
          />
        )}
      </div>

      {showPersonalization && userProfile && (
        <PersonalizationModal
          onClose={() => setShowPersonalization(false)}
          onSave={handleSaveProfile}
        />
      )}
    </Layout>
  );
}
