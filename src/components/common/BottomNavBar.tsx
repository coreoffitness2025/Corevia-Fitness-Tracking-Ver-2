import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, HelpCircle, Settings, Dumbbell } from 'lucide-react';

// 공통 타입 정의 - React Native 전환 시 재사용 가능
export interface NavItem {
  path: string;
  label: string;
  icon: React.FC<any>;
  badgeCount?: number;
}

// 네비게이션 구성 설정 - 플랫폼 독립적 데이터
export const navItems: NavItem[] = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/workout', icon: Dumbbell, label: '운동' },
  { path: '/food', icon: Utensils, label: '식단' },
  { path: '/qna', icon: HelpCircle, label: 'Q&A' },
  { path: '/settings', icon: Settings, label: '설정' }
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
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return {
    currentPath: location.pathname,
    isActive,
  };
};

// NavItem 컴포넌트 - 재사용 가능한 UI 컴포넌트
const NavItemComponent: React.FC<{
  item: NavItem;
  active: boolean;
  isDarkMode?: boolean;
}> = ({ item, active, isDarkMode = false }) => {
  const { path, icon: Icon, label } = item;
  const styles = getNavItemStyles(active, isDarkMode);

  return (
    <Link to={path} className={styles.container}>
      {active && <span className={styles.indicator} />}
      <Icon 
        size={24} 
        strokeWidth={active ? 2.5 : 1.5} 
        className={styles.icon}
      />
      <span className={styles.label}>{label}</span>
    </Link>
  );
};

// 메인 컴포넌트
const BottomNavBar: React.FC = () => {
  const { isActive } = useNavigation();
  // 실제 구현에서는 useTheme 훅 등을 사용해 가져와야 함
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-nav backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 transition-all duration-300 z-40">
      <div className="container mx-auto max-w-md flex justify-around items-center py-3">
        {navItems.map(item => (
          <NavItemComponent 
            key={item.path} 
            item={item} 
            active={isActive(item.path)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
