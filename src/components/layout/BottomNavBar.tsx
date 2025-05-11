import { Link, useLocation } from 'react-router-dom';

const BottomNavBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-500'}`}>
          <span>홈</span>
        </Link>
        <Link to="/workout" className={`flex flex-col items-center ${location.pathname === '/workout' ? 'text-blue-500' : 'text-gray-500'}`}>
          <span>운동</span>
        </Link>
        <Link to="/nutrition" className={`flex flex-col items-center ${location.pathname === '/nutrition' ? 'text-blue-500' : 'text-gray-500'}`}>
          <span>영양</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}>
          <span>프로필</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavBar; 