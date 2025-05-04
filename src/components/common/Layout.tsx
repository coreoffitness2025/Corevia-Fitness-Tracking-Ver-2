import { ReactNode } from 'react';
import BottomNavBar from './BottomNavBar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
