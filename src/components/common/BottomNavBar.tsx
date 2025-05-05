import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Camera, HelpCircle, Settings } from 'lucide-react';

const BottomNavBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: React.FC<any>; label: string }) => {
    const active = isActive(path);
    return (
      <Link
        to={path}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          active ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Icon size={24} />
        <span className="text-xs mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3">
      <div className="container mx-auto flex justify-around items-center">
        <NavItem path="/" icon={Home} label="홈" />
        <NavItem path="/graph" icon={BookOpen} label="운동일지" />
        <NavItem path="/foodlog" icon={Camera} label="식단기록" />
        <NavItem path="/qna" icon={HelpCircle} label="Q&A" />
        <NavItem path="/settings" icon={Settings} label="설정" />
      </div>
    </nav>
  );
};

export default BottomNavBar;
