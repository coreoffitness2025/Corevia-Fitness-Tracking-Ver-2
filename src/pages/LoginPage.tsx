import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/firebaseService';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/common/Layout';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      setUser(user);
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-4">Corevia Fitness</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Google 계정으로 로그인하고<br />나만의 운동 기록을 시작하세요.
        </p>

        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded"
        >
          Google로 로그인
        </button>
      </div>
    </Layout>
  );
}
