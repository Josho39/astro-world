'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  category: 'krc20' | 'krc721' | 'utility' | 'main';
  title: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  category,
  title,
  description,
  className,
  icon,
  actions
}: PageHeaderProps) {
  const getCategoryStyles = () => {
    switch (category) {
      case 'krc20':
        return {
          bg: 'bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent',
          text: 'text-green-500',
          border: 'border-green-500/20',
          badge: 'bg-green-500/20 text-green-600'
        };
      case 'krc721':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent',
          text: 'text-yellow-500',
          border: 'border-yellow-500/20',
          badge: 'bg-yellow-500/20 text-yellow-600'
        };
      case 'utility':
        return {
          bg: 'bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent',
          text: 'text-purple-500',
          border: 'border-purple-500/20',
          badge: 'bg-purple-500/20 text-purple-600'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
          text: 'text-primary',
          border: 'border-primary/20',
          badge: 'bg-primary/20 text-primary'
        };
    }
  };

  const styles = getCategoryStyles();

  return (
    <div className={cn(
      styles.bg,
      'p-4 sm:p-6 rounded-t-xl border-b',
      styles.border,
      className
    )}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'px-2 py-1 rounded-md text-xs font-medium uppercase',
              styles.badge
            )}>
              {category === 'krc20' ? 'KRC-20' : 
                category === 'krc721' ? 'KRC-721' : 
                category === 'utility' ? 'Utility' : 'Astro'}
            </div>
            {actions && <div className="hidden sm:block">{actions}</div>}
          </div>
          {actions && <div className="sm:hidden">{actions}</div>}
        </div>
        
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              'flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center',
              styles.badge
            )}>
              {icon}
            </div>
          )}
          <div>
            <h1 className={cn(
              'text-xl sm:text-2xl font-bold tracking-tight',
              styles.text
            )}>
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}