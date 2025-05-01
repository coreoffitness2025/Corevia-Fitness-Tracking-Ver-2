import { ReactNode } from 'react';
import BottomNavBar from './BottomNavBar';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const Layout = ({ children, hideNav = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-6 pb-20">
        {children}
      </main>
      {!hideNav && <BottomNavBar />}
    </div>
  );
};

export default Layout;
