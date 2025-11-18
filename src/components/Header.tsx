import { useState, useEffect } from 'react';
import MyProjects from './MyProjects';
import { useAppContext } from '@/contexts/AppContext';
import { getStorageStatus, type StorageStatus } from '@/lib/storage-monitor';
import { AlertTriangle, HardDrive } from 'lucide-react';

export default function Header() {
  const { saveCurrentProject } = useAppContext();
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);

  useEffect(() => {
    // Check storage status on mount and every 30 seconds
    const checkStorage = () => {
      const status = getStorageStatus();
      setStorageStatus(status);
    };

    checkStorage();
    const interval = setInterval(checkStorage, 30000);

    return () => clearInterval(interval);
  }, []);

  const scrollToPhase = (phaseId: string) => {
    const element = document.getElementById(phaseId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">TC</span>
          </div>
          <div className="hidden sm:block">
            <h2 className="text-white font-bold text-base md:text-lg">TrueCrime Clay Studio</h2>
            <p className="text-slate-400 text-xs hidden md:block">Autonomous Production Pipeline</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Phase navigation">
          <button onClick={() => scrollToPhase('phase1')} className="text-slate-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-2 py-1 transition text-sm" aria-label="Go to Phase 1: Discover">Discover</button>
          <button onClick={() => scrollToPhase('phase2')} className="text-slate-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-2 py-1 transition text-sm" aria-label="Go to Phase 2: Research">Research</button>
          <button onClick={() => scrollToPhase('phase3')} className="text-slate-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-2 py-1 transition text-sm" aria-label="Go to Phase 3: Script">Script</button>
          <button onClick={() => scrollToPhase('phase4')} className="text-slate-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-2 py-1 transition text-sm" aria-label="Go to Phase 4: Storyboard">Storyboard</button>
          <button onClick={() => scrollToPhase('phase6')} className="text-slate-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-2 py-1 transition text-sm" aria-label="Go to Phase 6: Package">Package</button>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {storageStatus && storageStatus.status !== 'healthy' && (
            <div
              className={`hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs font-medium ${
                storageStatus.status === 'critical'
                  ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
              }`}
              title={storageStatus.message}
            >
              {storageStatus.status === 'critical' ? (
                <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <HardDrive className="w-3 h-3 md:w-4 md:h-4" />
              )}
              <span className="hidden md:inline">{storageStatus.percentageUsed}% Full</span>
              <span className="md:hidden">{storageStatus.percentageUsed}%</span>
            </div>
          )}
          <MyProjects />
          <button
            onClick={saveCurrentProject}
            className="px-3 md:px-4 py-2 bg-teal-600 hover:bg-teal-700 focus:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950 text-white text-xs md:text-sm font-medium rounded-lg transition shadow-lg hover:shadow-xl"
            aria-label="Save current project"
          >
            <span className="hidden sm:inline">Save Project</span>
            <span className="sm:hidden">Save</span>
          </button>
        </div>
      </div>
    </header>
  );
}
