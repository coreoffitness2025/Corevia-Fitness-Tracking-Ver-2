import React from 'react';
import BottomNavBar from './BottomNavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <main className="pb-16">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default Layout; 