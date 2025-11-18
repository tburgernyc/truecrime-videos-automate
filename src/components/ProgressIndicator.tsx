import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  estimatedTimeMs?: number;
}

export default function ProgressIndicator({
  current,
  total,
  label = 'Processing',
  estimatedTimeMs
}: ProgressIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const percentage = Math.round((current / total) * 100);

  useEffect(() => {
    if (estimatedTimeMs && current > 0 && current < total) {
      const msPerItem = estimatedTimeMs / total;
      const remaining = (total - current) * msPerItem;
      setTimeRemaining(remaining);

      const interval = setInterval(() => {
        setTimeRemaining(prev => (prev && prev > 1000 ? prev - 1000 : null));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [current, total, estimatedTimeMs]);

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">
          {current}/{total} ({percentage}%)
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      {timeRemaining && (
        <div className="text-xs text-slate-500 text-right">
          Est. {formatTime(timeRemaining)} remaining
        </div>
      )}
    </div>
  );
}
