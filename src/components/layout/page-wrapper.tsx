import type { ReactNode } from 'react';

export function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="container mx-auto px-4 py-8 max-w-5xl">{children}</div>;
}
