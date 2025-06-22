import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, HelpCircle, Settings, Dumbbell } from 'lucide-react';

// 공통 타입 정의 - React Native 전환 시 재사용 가능
export interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

// 네비게이션 구성 설정 - 플랫폼 독립적 데이터
export const navItems: NavItem[] = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/workout', icon: Dumbbell, label: '운동' },
  { path: '/food', icon: Utensils, label: '식단' },
  { path: '/qna', icon: HelpCircle, label: 'Q&A' },
  { path: '/settings', icon: Settings, label: '설정' },
];

// UI 표현을 위한 스타일 함수 - 플랫폼별 구현 가능
export const getNavItemStyles = (active: boolean, isDarkMode: boolean) => {
  return {
    container: `flex flex-col items-center justify-center relative p-2 transition-all duration-300 ${
      active 
        ? 'text-[#4285F4] scale-110' 
        : 'text-gray-500 dark:text-gray-400 hover:text-[#4285F4] dark:hover:text-[#78a9f9]'
    }`,
    icon: `transition-all duration-300 ${active ? 'drop-shadow-md' : ''}`,
    label: `text-xs mt-1 font-medium transition-all duration-300 ${active ? 'font-semibold' : ''}`,
    indicator: 'absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-pulse'
  };
};

// 비즈니스 로직을 담당하는 커스텀 훅
export const useNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return {
    currentPath: location.pathname,
    isActive,
  };
};

// NavItem 컴포넌트 - 재사용 가능한 UI 컴포넌트
const NavItemComponent: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => {
  const { path, icon: Icon, label } = item;
  const activeClass = isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400';
  
  return (
    <Link to={path} className={`flex flex-col items-center justify-center flex-1 p-1 transition-transform duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`${activeClass} mb-0.5 transition-colors`} />
      <span className={`text-xs font-medium ${activeClass} transition-colors`}>{label}</span>
    </Link>
  );
};

// 메인 컴포넌트
const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const isDarkMode = document.documentElement.classList.contains('dark');

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav 
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700"
        style={{ 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className="container mx-auto flex justify-around max-w-lg h-16">
          {navItems.map(item => (
            <NavItemComponent 
              key={item.path} 
              item={item} 
              isActive={isActive(item.path)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavBar;
