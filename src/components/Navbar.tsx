import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
              Corevia
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              홈
            </Link>
            <Link
              to="/workout"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/workout')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              운동
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/profile')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              프로필
            </Link>
            {currentUser && (
              <span className="text-gray-700 dark:text-gray-300">
                {currentUser.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 