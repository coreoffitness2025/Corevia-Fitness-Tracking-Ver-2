import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, FireIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: '홈' },
    { path: '/workout', icon: UserGroupIcon, label: '운동하기' },
    { path: '/workout-record', icon: ChartBarIcon, label: '통계' },
    { path: '/foodlog', icon: FireIcon, label: '식단' },
    { path: '/qna', icon: ChatBubbleLeftRightIcon, label: 'Q&A' },
    { path: '/settings', icon: Cog6ToothIcon, label: '설정' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar; 