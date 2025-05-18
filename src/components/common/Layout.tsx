import { ReactNode, useEffect } from 'react';
import BottomNavBar from './BottomNavBar';

export interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  includeBottomNav?: boolean;
  className?: string;
}

// 레이아웃 스타일을 분리하여 관리
export const getLayoutStyles = (isDarkMode: boolean) => {
  return {
    container: `min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`,
    content: `max-w-4xl mx-auto px-4 py-8 animate-fadeIn`,
    topBar: `fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 z-50`,
  };
};

// 레이아웃 로직을 담당하는 훅
export const useLayoutEffect = () => {
  // 페이지 전환 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 여기에 추가적인 레이아웃 관련 로직을 추가할 수 있음
  return {
    scrollToTop: () => window.scrollTo(0, 0),
  };
};

export default function Layout({ 
  children, 
  header, 
  footer, 
  includeBottomNav = true,
  className = ''
}: LayoutProps) {
  // 비즈니스 로직 분리
  const { scrollToTop } = useLayoutEffect();
  
  // 스타일을 위한 다크모드 확인 (실제로는 theme context에서 가져와야 함)
  const isDarkMode = document.documentElement.classList.contains('dark');
  const styles = getLayoutStyles(isDarkMode);

  return (
    <div className={`${styles.container} ${includeBottomNav ? 'pb-20' : ''} ${className}`}>
      <div className={styles.topBar}></div>
      
      {header && header}
      
      <main className={styles.content}>
        {children}
      </main>
      
      {footer && footer}
      
      {includeBottomNav && <BottomNavBar />}
    </div>
  );
}
