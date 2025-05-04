import { useNavigate } from 'react-router-dom';
import { logout } from '../firebase/firebaseConfig';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/common/Layout';

const SettingsPage = () => {
  const { user, logout: authLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    authLogout();
    navigate('/login');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          설정
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || '사용자'}
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-4">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}

            <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {user?.displayName || '사용자'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-4 text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          >
            로그아웃
          </button>

          <a
            href="https://corevia.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            개인정보 처리방침
          </a>

          <a
            href="https://corevia.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            이용약관
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          앱 정보
        </h3>

        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>Corevia Training Tracker</p>
          <p>버전: 1.0.0</p>
          <p>© 2025 Corevia. All rights reserved.</p>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
