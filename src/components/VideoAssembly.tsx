import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import TimelineScene from './TimelineScene';
import VideoPreview from './VideoPreview';
import RenderProgress from './RenderProgress';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { VideoScene } from '@/types';
import { ASSETS } from '@/config/assets';

export default function VideoAssembly() {
  const { storyboardData, voiceoverData, videoData, setVideoData, isAssemblingVideo, setIsAssemblingVideo } = useAppContext();
  const [scenes, setScenes] = useState<VideoScene[]>([]);
  const [resolution, setResolution] = useState<'1080p' | '4k'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);

  useEffect(() => {
    if (storyboardData && !videoData) {
      const initialScenes = storyboardData.scenes.map((scene, idx) => ({
        id: `scene-${idx}`,
        sceneId: scene.sceneId,
        imageUrl: scene.previewImage || ASSETS.placeholders.scene,
        duration: scene.duration,
        transition: 'fade' as const,
        audioStart: idx > 0 ? storyboardData.scenes.slice(0, idx).reduce((sum, s) => sum + s.duration, 0) : 0,
        audioEnd: storyboardData.scenes.slice(0, idx + 1).reduce((sum, s) => sum + s.duration, 0),
        order: idx + 1
      }));
      setScenes(initialScenes);
    }
  }, [storyboardData, videoData]);

  const handleDurationChange = (id: string, duration: number) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, duration } : s));
  };

  const handleTransitionChange = (id: string, transition: 'fade' | 'dissolve' | 'cut' | 'wipe') => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, transition } : s));
  };

  const handleRemove = (id: string) => {
    setScenes(prev => prev.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleAssemble = () => {
    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
    const videoData = {
      scenes,
      totalDuration,
      audioUrl: voiceoverData?.audioData || null,
      exportFormat: 'mp4' as const,
      resolution,
      fps,
      generatedAt: new Date().toISOString()
    };
    setVideoData(videoData);
    toast.success('Video timeline assembled!');
  };

  const handleExport = async () => {
    if (!videoData) {
      toast.error('Please assemble timeline first');
      return;
    }
    
    setIsAssemblingVideo(true);
    toast.info('Starting video render...');
    
    try {
      const { data, error } = await supabase.functions.invoke('render-video', {
        body: {
          scenes: videoData.scenes,
          audioUrl: videoData.audioUrl,
          settings: {
            resolution: videoData.resolution === '4k' ? '4k' : '1080p',
            fps: videoData.fps
          }
        }
      });

      if (error) throw error;

      if (data.status === 'completed') {
        toast.success('Video rendered successfully!');
        
        // Create download link
        const link = document.createElement('a');
        link.href = data.videoUrl;
        link.download = `truecrime-video-${Date.now()}.mp4`;
        link.click();
        
        // Update video data with the rendered URL
        setVideoData({
          ...videoData,
          renderedVideoUrl: data.videoUrl,
          renderId: data.renderId
        });
      } else if (data.status === 'processing') {
        toast.info('Video is rendering. This may take several minutes...');
        // Could implement polling here
        setVideoData({
          ...videoData,
          renderId: data.renderId,
          renderStatus: 'processing'
        });
      }
    } catch (error) {
      console.error('Export error:', error);

      let errorMessage = 'Failed to export video';
      if (error instanceof Error) {
        if (error.message.includes('FunctionsRelayError') || error.message.includes('not found')) {
          errorMessage = 'Video rendering service is still deploying. Please wait 1-2 minutes and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error during video export. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsAssemblingVideo(false);
    }
  };


  const handleMoveUp = (id: string) => {
    const idx = scenes.findIndex(s => s.id === id);
    if (idx > 0) {
      const newScenes = [...scenes];
      [newScenes[idx - 1], newScenes[idx]] = [newScenes[idx], newScenes[idx - 1]];
      setScenes(newScenes.map((s, i) => ({ ...s, order: i + 1 })));
    }
  };

  const handleMoveDown = (id: string) => {
    const idx = scenes.findIndex(s => s.id === id);
    if (idx < scenes.length - 1) {
      const newScenes = [...scenes];
      [newScenes[idx], newScenes[idx + 1]] = [newScenes[idx + 1], newScenes[idx]];
      setScenes(newScenes.map((s, i) => ({ ...s, order: i + 1 })));
    }
  };

  if (!storyboardData || !voiceoverData) {
    return (
      <div className="bg-slate-900/50 rounded-lg p-8 text-center">
        <p className="text-slate-300">Complete storyboard and voiceover first...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {videoData?.renderStatus === 'processing' && videoData.renderId && (
        <RenderProgress 
          renderId={videoData.renderId}
          onComplete={(videoUrl) => {
            setVideoData({
              ...videoData,
              renderedVideoUrl: videoUrl,
              renderStatus: 'completed'
            });
            const link = document.createElement('a');
            link.href = videoUrl;
            link.download = `truecrime-video-${Date.now()}.mp4`;
            link.click();
          }}
          onCancel={() => {
            setVideoData({
              ...videoData,
              renderStatus: undefined,
              renderId: undefined
            });
          }}
        />
      )}
      
      {videoData && <VideoPreview scenes={scenes} audioUrl={voiceoverData.audioData} />}

      
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Video Timeline Editor</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Scenes</div>
            <div className="text-2xl font-bold text-white">{scenes.length}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Duration</div>
            <div className="text-2xl font-bold text-white">{scenes.reduce((sum, s) => sum + s.duration, 0).toFixed(1)}s</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Audio Synced</div>
            <div className="text-2xl font-bold text-teal-400">Yes</div>
          </div>
        </div>
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex gap-3">
                <img src={scene.imageUrl} alt={`Scene ${scene.order}`} className="w-24 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-semibold text-sm">Scene {scene.order}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleMoveUp(scene.id)} disabled={idx === 0} className="text-xs text-teal-400 hover:text-teal-300 disabled:opacity-30">↑</button>
                      <button onClick={() => handleMoveDown(scene.id)} disabled={idx === scenes.length - 1} className="text-xs text-teal-400 hover:text-teal-300 disabled:opacity-30">↓</button>
                      <button onClick={() => handleRemove(scene.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Duration (s)</label>
                      <input type="number" value={scene.duration} onChange={(e) => handleDurationChange(scene.id, parseFloat(e.target.value))} className="w-full bg-slate-900 text-white px-2 py-1 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Transition</label>
                      <select value={scene.transition} onChange={(e) => handleTransitionChange(scene.id, e.target.value)} className="w-full bg-slate-900 text-white px-2 py-1 rounded text-xs">
                        <option value="fade">Fade</option>
                        <option value="dissolve">Dissolve</option>
                        <option value="cut">Cut</option>
                        <option value="wipe">Wipe</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Resolution</label>
            <select value={resolution} onChange={(e) => setResolution(e.target.value as any)} className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg">
              <option value="1080p">1080p (Full HD)</option>
              <option value="4k">4K (Ultra HD)</option>
            </select>
          </div>
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Frame Rate</label>
            <select value={fps} onChange={(e) => setFps(parseInt(e.target.value) as any)} className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg">
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAssemble} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Assemble Timeline
          </Button>
          {videoData && (
            <Button onClick={handleExport} disabled={isAssemblingVideo} className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              {isAssemblingVideo ? 'Exporting...' : 'Export MP4'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

