import { useState } from 'react';

interface TimelineSceneProps {
  scene: {
    id: string;
    imageUrl: string;
    duration: number;
    transition: string;
    order: number;
  };
  onDurationChange: (id: string, duration: number) => void;
  onTransitionChange: (id: string, transition: string) => void;
  onRemove: (id: string) => void;
}

export default function TimelineScene({ scene, onDurationChange, onTransitionChange, onRemove }: TimelineSceneProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-teal-500 transition">
      <div className="flex gap-3">
        <img src={scene.imageUrl} alt={`Scene ${scene.order}`} className="w-24 h-16 object-cover rounded" />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <span className="text-white font-semibold text-sm">Scene {scene.order}</span>
            <button onClick={() => onRemove(scene.id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Duration (s)</label>
              <input type="number" value={scene.duration} onChange={(e) => onDurationChange(scene.id, parseFloat(e.target.value))} className="w-full bg-slate-900 text-white px-2 py-1 rounded" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Transition</label>
              <select value={scene.transition} onChange={(e) => onTransitionChange(scene.id, e.target.value)} className="w-full bg-slate-900 text-white px-2 py-1 rounded text-xs">
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
  );
}
