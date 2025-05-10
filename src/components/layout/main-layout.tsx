import type { ReactNode } from 'react';
import { AppHeader } from './header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-secondary text-secondary-foreground py-4 text-center text-sm">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} Azure OpGuide Generator. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
