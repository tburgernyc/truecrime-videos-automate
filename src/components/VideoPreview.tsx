import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';

interface VideoPreviewProps {
  scenes: Array<{ imageUrl: string; duration: number; transition: string }>;
  audioUrl: string | null;
}

export default function VideoPreview({ scenes, audioUrl }: VideoPreviewProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        
        let accumulated = 0;
        for (let i = 0; i < scenes.length; i++) {
          accumulated += scenes[i].duration;
          if (next < accumulated) {
            setCurrentSceneIndex(i);
            break;
          }
        }
        
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, scenes, totalDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="aspect-video bg-slate-900 rounded-lg mb-4 overflow-hidden relative">
        {scenes[currentSceneIndex] && (
          <img src={scenes[currentSceneIndex].imageUrl} alt={`Scene ${currentSceneIndex + 1}`} className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="text-white text-sm mb-2">Scene {currentSceneIndex + 1} of {scenes.length}</div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full transition-all" style={{ width: `${(currentTime / totalDuration) * 100}%` }}></div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <Button onClick={handlePlayPause} variant="outline" size="sm">
          {isPlaying ? 'Pause' : 'Play'} Preview
        </Button>
        <Button onClick={() => { setCurrentTime(0); setCurrentSceneIndex(0); setIsPlaying(false); }} variant="outline" size="sm">
          Reset
        </Button>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
    </div>
  );
}
