import React from 'react';
import { cn } from '@/lib/utils';

interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageSection({ children, className, ...props }: PageSectionProps) {
  return (
    <section className={cn("py-12 md:py-16", className)} {...props}>
      {children}
    </section>
  );
}
