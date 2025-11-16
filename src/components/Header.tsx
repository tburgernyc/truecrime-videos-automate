import MyProjects from './MyProjects';
import { useAppContext } from '@/contexts/AppContext';

export default function Header() {
  const { saveCurrentProject } = useAppContext();

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
          <a href="#discover" className="text-slate-300 hover:text-white transition text-sm">Discover</a>
          <a href="#research" className="text-slate-300 hover:text-white transition text-sm">Research</a>
          <a href="#script" className="text-slate-300 hover:text-white transition text-sm">Script</a>
          <a href="#storyboard" className="text-slate-300 hover:text-white transition text-sm">Storyboard</a>
          <a href="#package" className="text-slate-300 hover:text-white transition text-sm">Package</a>
        </nav>

        <div className="flex items-center gap-3">
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
