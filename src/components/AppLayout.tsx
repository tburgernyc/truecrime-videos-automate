import Header from './Header';
import FeatureCard from './FeatureCard';
import ConfigPanel from './ConfigPanel';
import ProgressBar from './ProgressBar';
import ActionPanel from './ActionPanel';
import WorkflowPhase from './WorkflowPhase';
import { ResearchCard } from './ResearchCard';
import ScriptEditor from './ScriptEditor';
import { StoryboardViewer } from './StoryboardViewer';
import VideoAssembly from './VideoAssembly';
import PackagingTools from './PackagingTools';
import JsonViewer from './JsonViewer';
import { useAppContext } from '@/contexts/AppContext';



export default function AppLayout() {
  const { currentPhase, setCurrentPhase, researchData, isResearching, storyboardData, isGeneratingStoryboard } = useAppContext();

  const outputData = {
    meta: { timeframe: "7_days", language: "English (US)", target_runtime_minutes: 10 },
    topic_selection: { primary_case_name: "Sample Case", why_it_was_chosen: "High viral potential" }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <div 
        className="relative h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244094585_67b594a3.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            TRUECRIME<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-600">
              CLAY STUDIO
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Autonomous YouTube True Crime Video Production Pipeline
          </p>
          <button 
            onClick={() => setCurrentPhase(1)}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Start Production
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Complete Production Pipeline
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon="https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244095590_b7e761b8.webp"
            title="Discover Trending Topics"
            description="Automatically find the most viral true crime stories on YouTube using advanced analytics"
          />
          <FeatureCard
            icon="https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244096513_2108d4c5.webp"
            title="Research & Fact-Check"
            description="Deep dive into case details with multi-source verification and ethical storytelling"
          />
          <FeatureCard
            icon="https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244097395_2fa0b4e4.webp"
            title="Generate Scripts"
            description="AI-powered 10-minute narrator scripts optimized for retention and engagement"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ConfigPanel onConfigChange={() => {}} />
          <ProgressBar current={currentPhase} total={7} />
        </div>

        <div className="mb-8">
          <ActionPanel />
        </div>

        <div className="space-y-6">
          <WorkflowPhase
            id="phase1"
            title="Phase 1: Topic Discovery"
            description="Find trending true crime topics on YouTube"
            status={currentPhase >= 1 ? 'complete' : 'pending'}
          >
            <div className="bg-slate-900/50 rounded-lg p-4 text-slate-300">
              <p>Enter a case name above to begin research...</p>
            </div>
          </WorkflowPhase>

          <WorkflowPhase
            id="phase2"
            title="Phase 2: Case Research"
            description="Research and fact-check the case details"
            status={currentPhase === 1 ? 'active' : currentPhase > 1 ? 'complete' : 'pending'}
          >
            {isResearching ? (
              <div className="bg-slate-900/50 rounded-lg p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-300">Researching case details...</p>
              </div>
            ) : researchData ? (
              <ResearchCard data={researchData} />
            ) : (
              <div className="bg-slate-900/50 rounded-lg p-4 text-slate-300">
                <p>Research findings will appear here after you search for a case...</p>
              </div>
            )}
          </WorkflowPhase>

          <WorkflowPhase
            id="phase3"
            title="Phase 3: Script Writing"
            description="Generate 10-minute narrator script"
            status={currentPhase === 2 ? 'active' : currentPhase > 2 ? 'complete' : 'pending'}
          >
            <ScriptEditor />
          </WorkflowPhase>

          <WorkflowPhase
            id="phase4"
            title="Phase 4: Claymation Storyboard"
            description="AI-generated shot list with visual previews"
            status={currentPhase === 3 ? 'active' : currentPhase > 3 ? 'complete' : 'pending'}
          >
            <StoryboardViewer />
          </WorkflowPhase>

          <WorkflowPhase
            id="phase5"
            title="Phase 5: Video Assembly"
            description="Combine storyboard and audio into timeline"
            status={currentPhase === 4 ? 'active' : currentPhase > 4 ? 'complete' : 'pending'}
          >
            <VideoAssembly />
          </WorkflowPhase>

          <WorkflowPhase
            id="phase6"
            title="Phase 6: YouTube Packaging"
            description="Generate titles, tags, and thumbnail concepts"
            status={currentPhase === 5 ? 'active' : currentPhase > 5 ? 'complete' : 'pending'}
          >
            <PackagingTools />
          </WorkflowPhase>

          <WorkflowPhase
            id="phase7"
            title="Phase 7: JSON Output"
            description="Export complete production data"
            status={currentPhase === 6 ? 'active' : 'pending'}
          >
            <JsonViewer data={outputData} />
          </WorkflowPhase>
        </div>

      </div>

      <footer className="bg-slate-900 border-t border-slate-800 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-4">TrueCrime Clay Studio</h4>
              <p className="text-slate-400 text-sm">
                Autonomous production pipeline for viral true crime content with ethical storytelling.
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Features</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#discover" className="hover:text-white transition">Topic Discovery</a></li>
                <li><a href="#research" className="hover:text-white transition">Case Research</a></li>
                <li><a href="#script" className="hover:text-white transition">Script Generation</a></li>
                <li><a href="#storyboard" className="hover:text-white transition">Claymation Storyboard</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Resources</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition">Best Practices</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Ethics Guidelines</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 TrueCrime Clay Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
