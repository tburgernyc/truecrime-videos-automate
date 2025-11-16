interface StoryboardSceneProps {
  sceneId: string;
  duration: number;
  visualPrompt: string;
  scriptExcerpt: string;
}

export default function StoryboardScene({ 
  sceneId, 
  duration, 
  visualPrompt, 
  scriptExcerpt 
}: StoryboardSceneProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-sm font-bold text-amber-400">{sceneId}</span>
        <span className="text-xs text-slate-400">{duration}s</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <h5 className="text-xs font-semibold text-slate-400 mb-1">Script Excerpt</h5>
          <p className="text-sm text-slate-300 italic">{scriptExcerpt}</p>
        </div>
        
        <div>
          <h5 className="text-xs font-semibold text-slate-400 mb-1">Visual Prompt</h5>
          <p className="text-sm text-slate-300">{visualPrompt}</p>
        </div>
      </div>
    </div>
  );
}
