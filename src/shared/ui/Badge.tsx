import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive';
}

export function Badge({
  className,
  children,
  onRemove,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/95',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input text-foreground hover:bg-secondary',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none gap-1',
        variants[variant],
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors inline-flex items-center justify-center outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Remove item"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
