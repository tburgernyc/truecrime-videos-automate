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
    <div
      id={id}
      className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${statusColors[status]} scroll-mt-24`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <span className="text-xl md:text-2xl flex-shrink-0">{statusIcons[status]}</span>
          <div className="text-left flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-white truncate">{title}</h3>
            <p className="text-xs md:text-sm text-slate-400 line-clamp-1">{description}</p>
          </div>
        </div>
        <span className="text-white text-lg md:text-xl ml-2 flex-shrink-0 transition-transform duration-200" style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(0deg)' }}>
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && children && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
