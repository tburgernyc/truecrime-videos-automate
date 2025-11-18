import { useState } from 'react';
import type { Config } from '@/types';

interface ConfigPanelProps {
  onConfigChange: (config: Config) => void;
}

export default function ConfigPanel({ onConfigChange }: ConfigPanelProps) {
  const [timeframe, setTimeframe] = useState('7_days');
  const [language, setLanguage] = useState('English (US)');
  const [runtime, setRuntime] = useState(10);

  const handleChange = () => {
    onConfigChange({ timeframe, language, targetRuntime: runtime });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Timeframe</label>
          <select 
            value={timeframe}
            onChange={(e) => { setTimeframe(e.target.value); handleChange(); }}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
          >
            <option value="24_hours">24 Hours</option>
            <option value="48_hours">48 Hours</option>
            <option value="7_days">7 Days</option>
            <option value="30_days">30 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
          <input 
            type="text"
            value={language}
            onChange={(e) => { setLanguage(e.target.value); handleChange(); }}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Runtime: {runtime} minutes
          </label>
          <input 
            type="range"
            min="5"
            max="20"
            value={runtime}
            onChange={(e) => { setRuntime(Number(e.target.value)); handleChange(); }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
