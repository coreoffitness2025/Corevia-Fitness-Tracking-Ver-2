import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithKakao } from '../services/firebaseService';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/common/Layout';

const LoginPage = () => {
  const { isAuthenticated, setUser } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      setUser(user);
      navigate('/');
    }
  };
  
  const handleKakaoSignIn = async () => {
    const user = await signInWithKakao();
    if (user) {
      setUser(user);
      navigate('/');
    }
  };
  
  return (
    <Layout hideNav>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Corevia Training Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400">효율적인 운동 관리를 위한 앱</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">로그인</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center bg-white text-gray-800 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 로그인
              </button>
              
              <button
                onClick={handleKakaoSignIn}
                className="w-full flex items-center justify-center bg-yellow-400 text-gray-900 rounded-md px-4 py-2 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2.1875C6.47812 2.1875 2 5.6875 2 10C2 12.7344 3.65625 15.0938 6.1875 16.4844C5.84375 17.6719 5.14062 20.0625 5.03125 20.5312C4.90625 21.0938 5.28125 21.0938 5.53125 20.9219C5.71875 20.7969 8.58125 18.8906 9.78125 18.1094C10.5 18.2031 11.2344 18.25 12 18.25C17.5219 18.25 22 14.75 22 10C22 5.6875 17.5219 2.1875 12 2.1875Z"
                    fill="currentColor"
                  />
                </svg>
                카카오로 로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
