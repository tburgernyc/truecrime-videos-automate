import { useEffect, useState, useRef } from 'react';
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
  const progressRef = useRef(0);

  useEffect(() => {
    // Update ref when progress changes
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!supabase) {
      toast.error('Supabase not configured - cannot check render status');
      return;
    }

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
          setProgress(prev => Math.min(prev + 5, 95));
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus(); // Run immediately on mount

    return () => clearInterval(interval);
  }, [renderId, onComplete, onCancel]);

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
