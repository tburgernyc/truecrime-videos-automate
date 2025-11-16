import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Film, Clock, Camera } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export const StoryboardViewer: React.FC = () => {
  const { storyboardData, isGeneratingStoryboard } = useAppContext();

  const handleExportJSON = () => {
    if (!storyboardData) return;
    const dataStr = JSON.stringify(storyboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `storyboard-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    if (!storyboardData) return;
    const headers = ['Scene ID', 'Duration', 'Camera', 'Movement', 'Mood', 'Setting'];
    const rows = storyboardData.scenes.map(s => [
      s.sceneId, s.duration, s.cameraAngle, s.cameraMovement, s.mood, s.setting
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `storyboard-${Date.now()}.csv`);
    link.click();
  };

  if (isGeneratingStoryboard) {
    return (
      <div className="text-center py-12">
        <Film className="w-16 h-16 mx-auto mb-4 text-amber-400 animate-pulse" />
        <p className="text-lg text-slate-300">Generating claymation storyboard...</p>
      </div>
    );
  }

  if (!storyboardData) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No storyboard generated yet. Write a script in Phase 3 first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Claymation Storyboard</h3>
          <div className="flex gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Film className="w-4 h-4" /> {storyboardData.totalScenes} scenes
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {Math.floor(storyboardData.totalDuration / 60)}:{(storyboardData.totalDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportJSON} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> JSON
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {storyboardData.scenes.map((scene, idx) => (
          <Card key={scene.sceneId} className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex gap-4">
              {scene.previewImage && (
                <img 
                  src={scene.previewImage} 
                  alt={scene.sceneId}
                  className="w-48 h-27 object-cover rounded border border-slate-600"
                />
              )}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white">{scene.sceneId}</h4>
                    <p className="text-sm text-slate-400">{scene.duration}s • {scene.mood}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{scene.cameraAngle}</Badge>
                </div>
                
                <p className="text-sm text-slate-300 italic">"{scene.scriptExcerpt}"</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Camera:</span>
                    <p className="text-slate-300">{scene.cameraMovement}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Lighting:</span>
                    <p className="text-slate-300">{scene.lighting}</p>
                  </div>
                </div>
                
                <details className="text-sm">
                  <summary className="cursor-pointer text-amber-400 hover:text-amber-300">
                    Visual Prompt
                  </summary>
                  <p className="mt-2 text-slate-400">{scene.visualPrompt}</p>
                </details>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
