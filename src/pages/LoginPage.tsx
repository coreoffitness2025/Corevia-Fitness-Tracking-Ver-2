import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import PersonalizationModal from '../components/auth/PersonalizationModal';
import { useAuth } from '../contexts/AuthContext';
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
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [newUserProfile, setNewUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthStateChange = async (user: User | null) => {
    if (user) {
      setIsLoading(true);
      try {
        const userProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          height: 170,
          weight: 70,
          age: 25,
          gender: 'male',
          activityLevel: 'moderate',
          fitnessGoal: 'maintain',
          experience: {
            years: 0,
            level: 'beginner',
            squat: {
              maxWeight: 0,
              maxReps: 0
            }
          }
        };
        setNewUserProfile(userProfile);
        setShowPersonalization(true);
      } catch (error) {
        console.error('Error creating user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePersonalizationComplete = async (profile: Omit<UserProfile, 'uid' | 'displayName' | 'email' | 'photoURL'>) => {
    if (newUserProfile) {
      setIsLoading(true);
      try {
        const updatedProfile: UserProfile = {
          ...newUserProfile,
          ...profile
        };
        await updateProfile(updatedProfile);
        setShowPersonalization(false);
        navigate('/');
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <LoginHeader />
          <div className="space-y-4">
            <LoginButton 
              isLoading={isLoading} 
              onClick={() => handleAuthStateChange({ uid: 'test', displayName: 'Test User', email: 'test@example.com' } as User)}
            />
            <EmailLoginForm 
              onSubmit={async (email, password, rememberMe) => {
                setIsLoading(true);
                try {
                  // TODO: Implement email login
                  console.log('Email login:', { email, password, rememberMe });
                } catch (error) {
                  console.error('Login error:', error);
                } finally {
                  setIsLoading(false);
                }
              }} 
              isLoading={isLoading} 
            />
          </div>
        </div>
        {showPersonalization && (
          <PersonalizationModal
            onClose={() => setShowPersonalization(false)}
            onSave={handlePersonalizationComplete}
          />
        )}
      </div>
    </Layout>
  );
}
