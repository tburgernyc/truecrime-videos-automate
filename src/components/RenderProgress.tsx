import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface RenderProgressProps {
  renderId: string;
  onComplete: (videoUrl: string) => void;
  onCancel: () => void;
}

export default function RenderProgress({ renderId, onComplete, onCancel }: RenderProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Processing');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-render-status', {
          body: { renderId }
        });

        if (error) throw error;

        if (data.status === 'done') {
          setProgress(100);
          setStatus('Complete');
          toast.success('Video rendered!');
          onComplete(data.videoUrl);
        } else if (data.status === 'failed') {
          setStatus('Failed');
          toast.error('Video render failed');
          onCancel();
        } else {
          setProgress(Math.min(progress + 5, 95));
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [renderId, progress]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30">
      <h4 className="text-white font-bold mb-4">Rendering Video...</h4>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">{status}</span>
          <span className="text-teal-400">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>
    </div>
  );
}
