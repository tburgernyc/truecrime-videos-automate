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
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">TC</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">TrueCrime Clay Studio</h2>
            <p className="text-slate-400 text-xs">Autonomous Production Pipeline</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollToPhase('phase1')} className="text-slate-300 hover:text-white transition text-sm">Discover</button>
          <button onClick={() => scrollToPhase('phase2')} className="text-slate-300 hover:text-white transition text-sm">Research</button>
          <button onClick={() => scrollToPhase('phase3')} className="text-slate-300 hover:text-white transition text-sm">Script</button>
          <button onClick={() => scrollToPhase('phase4')} className="text-slate-300 hover:text-white transition text-sm">Storyboard</button>
          <button onClick={() => scrollToPhase('phase6')} className="text-slate-300 hover:text-white transition text-sm">Package</button>
        </nav>

        <div className="flex items-center gap-3">
          {storageStatus && storageStatus.status !== 'healthy' && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                storageStatus.status === 'critical'
                  ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
              }`}
              title={storageStatus.message}
            >
              {storageStatus.status === 'critical' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <HardDrive className="w-4 h-4" />
              )}
              <span>{storageStatus.percentageUsed}% Full</span>
            </div>
          )}
          <MyProjects />
          <button
            onClick={saveCurrentProject}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition"
          >
            Save Project
          </button>
        </div>
      </div>
    </header>
  );
}
