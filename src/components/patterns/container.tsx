import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: React.ElementType;
}

const sizeClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-[var(--jb-container-max)]',
  full: 'max-w-full',
};

export function Container({
  size = 'xl',
  as: Tag = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn('mx-auto w-full px-5 md:px-8 lg:px-10', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
