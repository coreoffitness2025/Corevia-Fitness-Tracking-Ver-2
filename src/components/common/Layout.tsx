import { ReactNode, useEffect } from 'react';
import BottomNavBar from './BottomNavBar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // 페이지 전환 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20 transition-colors duration-300">
      <div className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 z-50"></div>
      <main className="container mx-auto px-4 py-8 animate-fadeIn">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
