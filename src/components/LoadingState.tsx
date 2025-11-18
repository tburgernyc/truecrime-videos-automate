import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={`${sizeClasses[size]} text-teal-500 animate-spin`} />
      <p className={`${textSizes[size]} text-slate-400`}>{message}</p>
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
}

export function InlineLoading({ message = 'Processing...' }: InlineLoadingProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
      <span>{message}</span>
    </div>
  );
}
