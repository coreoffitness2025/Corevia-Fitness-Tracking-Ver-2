import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, Utensils, HelpCircle, Settings } from 'lucide-react';

const BottomNavBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: React.FC<any>; label: string }) => {
    const active = isActive(path);
    return (
      <Link
        to={path}
        className={`flex flex-col items-center justify-center relative p-2 transition-all duration-300 ${
          active 
            ? 'text-primary-600 scale-110' 
            : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
        }`}
      >
        {active && (
          <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
        )}
        <Icon 
          size={24} 
          strokeWidth={active ? 2.5 : 1.5} 
          className={`transition-all duration-300 ${active ? 'drop-shadow-md' : ''}`}
        />
        <span className={`text-xs mt-1 font-medium transition-all duration-300 ${active ? 'font-semibold' : ''}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-nav backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 transition-all duration-300 z-40">
      <div className="container mx-auto flex justify-around items-center py-3">
        <NavItem path="/" icon={Home} label="홈" />
        <NavItem path="/workout" icon={Activity} label="운동" />
        <NavItem path="/food" icon={Utensils} label="식단" />
        <NavItem path="/qna" icon={HelpCircle} label="Q&A" />
        <NavItem path="/settings" icon={Settings} label="설정" />
      </div>
    </nav>
  );
};

export default BottomNavBar;
