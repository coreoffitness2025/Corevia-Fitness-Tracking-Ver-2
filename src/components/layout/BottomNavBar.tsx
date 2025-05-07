import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils } from 'lucide-react';

const BottomNavBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-[#4285F4]' : 'text-gray-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">홈</span>
        </Link>
        <Link to="/workout" className={`flex flex-col items-center ${location.pathname === '/workout' ? 'text-[#4285F4]' : 'text-gray-500'}`}>
          <Dumbbell className="w-6 h-6" />
          <span className="text-xs mt-1">운동</span>
        </Link>
        <Link to="/nutrition" className={`flex flex-col items-center ${location.pathname === '/nutrition' ? 'text-[#4285F4]' : 'text-gray-500'}`}>
          <Utensils className="w-6 h-6" />
          <span className="text-xs mt-1">영양</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-[#4285F4]' : 'text-gray-500'}`}>
          <span>프로필</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavBar; 