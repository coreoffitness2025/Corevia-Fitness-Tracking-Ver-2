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
  onClick 
}: { 
  isLoading: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded ${
      isLoading ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    type="button"
  >
    {isLoading ? '로그인 중...' : 'Google로 로그인'}
  </button>
);

const LoginHeader = () => (
  <>
    <h1 className="text-2xl font-bold mb-4">Corevia Fitness</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      Google 계정으로 로그인하고<br />나만의 운동 기록을 시작하세요.
    </p>
  </>
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPersonalization, setShowPersonalization] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const { handleLogin } = useLogin({
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
        <LoginButton 
          isLoading={isLoading} 
          onClick={handleLogin} 
        />
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
