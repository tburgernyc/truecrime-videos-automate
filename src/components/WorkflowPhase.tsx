import { useState, useEffect } from 'react';

interface WorkflowPhaseProps {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
  children?: React.ReactNode;
}

export default function WorkflowPhase({ id, title, description, status, children }: WorkflowPhaseProps) {
  const [expanded, setExpanded] = useState(status === 'active');

  useEffect(() => {
    if (status === 'active') {
      setExpanded(true);
    }
  }, [status]);


  const statusColors = {
    pending: 'border-slate-700 bg-slate-800/30',
    active: 'border-amber-500 bg-amber-500/10',
    complete: 'border-teal-500 bg-teal-500/10'
  };

  const statusIcons = {
    pending: '○',
    active: '◐',
    complete: '●'
  };

  return (
    <div className={`border-2 rounded-xl overflow-hidden transition-all ${statusColors[status]}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{statusIcons[status]}</span>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <span className="text-white text-xl">{expanded ? '−' : '+'}</span>
      </button>
      
      {expanded && children && (
        <div className="px-6 pb-6 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
