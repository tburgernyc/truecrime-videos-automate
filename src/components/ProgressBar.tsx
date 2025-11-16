interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Production Progress</h3>
        <span className="text-sm text-slate-400">{current} of {total} phases</span>
      </div>
      
      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        {Array.from({ length: total }).map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-2 rounded-full transition-all ${
              idx < current ? 'bg-teal-500' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
