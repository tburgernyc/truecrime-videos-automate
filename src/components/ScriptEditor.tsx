import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Film, Sparkles, RefreshCw, Mic, Volume2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ScriptEditor() {
  const { 
    scriptText, 
    setScriptText, 
    researchData, 
    setStoryboardData, 
    setIsGeneratingStoryboard, 
    setCurrentPhase,
    voiceoverData,
    setVoiceoverData,
    isGeneratingVoiceover,
    setIsGeneratingVoiceover,
    storyboardData
  } = useAppContext();
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState<'dramatic' | 'neutral' | 'mysterious'>('dramatic');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  
  const wordCount = scriptText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const estimatedDuration = Math.round(wordCount / 150); // 150 words per minute
  const targetWordCount = 1400; // Target for 10-minute script
  const wordCountStatus = wordCount < 1200 ? 'text-red-400' : wordCount > 1700 ? 'text-yellow-400' : 'text-green-400';

  const handleGenerateScript = async () => {
    if (!researchData || !researchData.caseName) {
      toast.error('Please complete case research first (Phase 2)');
      return;
    }

    setIsGeneratingScript(true);
    toast.info('AI is writing your script...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          researchData: {
            title: researchData.caseName,
            summary: researchData.summary,
            timeline: researchData.timeline,
            keyPeople: researchData.keyPeople,
            locations: researchData.locations,
            outcomes: researchData.outcomes
          },
          config: {
            targetDuration: 10,
            style: 'documentary'
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setScriptText(data.script.content);
        toast.success(`Script generated! ${data.script.wordCount} words (~${Math.round(data.script.estimatedDuration / 60)} min)`);
      } else {
        throw new Error(data.error || 'Failed to generate script');
      }
    } catch (err: any) {
      console.error('Script generation error:', err);

      let errorMessage = 'Failed to generate script';
      if (err.message?.includes('FunctionsRelayError') || err.message?.includes('not found')) {
        errorMessage = 'Script generation service is still deploying. Please wait 1-2 minutes and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsGeneratingScript(false);
    }
  };


  const handleGenerateStoryboard = async () => {
    if (!scriptText || wordCount < 100) {
      toast.error('Please write a script first (minimum 100 words)');
      return;
    }

    setIsGeneratingStoryboard(true);
    toast.info('Generating claymation storyboard...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-storyboard', {
        body: {
          script: scriptText,
          caseName: researchData?.caseName || 'True Crime Case',
          visualStyle: 'High-detail claymation with cinematic lighting, moody teal/amber color grade, documentary feel'
        }
      });

      if (error) throw error;

      if (data.success) {
        setStoryboardData({
          ...data.storyboard,
          generatedAt: new Date().toISOString()
        });
        toast.success(`Generated ${data.storyboard.totalScenes} scenes!`);
        setCurrentPhase(4); // Move to Phase 4
      } else {
        throw new Error(data.error || 'Failed to generate storyboard');
      }
    } catch (err: any) {
      console.error('Storyboard error:', err);

      let errorMessage = 'Failed to generate storyboard';
      if (err.message?.includes('FunctionsRelayError') || err.message?.includes('not found')) {
        errorMessage = 'Storyboard generation service is still deploying. Please wait 1-2 minutes and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  const handleGenerateVoiceover = async () => {
    if (!scriptText || wordCount < 100) {
      toast.error('Please write a script first (minimum 100 words)');
      return;
    }

    setIsGeneratingVoiceover(true);
    toast.info('Generating AI voiceover...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-voiceover', {
        body: {
          text: scriptText,
          voiceStyle,
          speed,
          pitch
        }
      });

      if (error) throw error;

      if (data.success) {
        // Generate timestamps based on storyboard scenes
        const timestamps = storyboardData?.scenes.map((scene, idx) => ({
          time: scene.duration * idx,
          sceneId: scene.sceneId,
          label: `Scene ${idx + 1}`
        })) || [];

        setVoiceoverData({
          audioData: data.audioData,
          duration: data.duration,
          voiceStyle,
          speed,
          pitch,
          timestamps,
          generatedAt: new Date().toISOString()
        });
        toast.success('Voiceover generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate voiceover');
      }
    } catch (err: any) {
      console.error('Voiceover generation error:', err);

      let errorMessage = 'Failed to generate voiceover';
      if (err.message?.includes('FunctionsRelayError') || err.message?.includes('not found')) {
        errorMessage = 'Voiceover generation service is still deploying. Please wait 1-2 minutes and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsGeneratingVoiceover(false);
    }
  };

  const handleExportAudio = (format: 'mp3' | 'wav') => {
    if (!voiceoverData?.audioData) return;
    
    const link = document.createElement('a');
    link.href = voiceoverData.audioData;
    link.download = `voiceover-${Date.now()}.${format}`;
    link.click();
    toast.success(`Exported as ${format.toUpperCase()}`);
  };



  return (
    <div className="space-y-4">
      {/* AI Script Generation Section */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Script Generator
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Generate a compelling 10-minute true crime script from your research data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Target Length</div>
            <div className="text-lg font-bold text-white">1,400-1,700</div>
            <div className="text-xs text-slate-500">words</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Estimated Time</div>
            <div className="text-lg font-bold text-white">~10 min</div>
            <div className="text-xs text-slate-500">at 150 wpm</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Structure</div>
            <div className="text-sm font-semibold text-white">4 Acts</div>
            <div className="text-xs text-slate-500">Open/Rise/Climax/End</div>
          </div>
        </div>

        <Button 
          onClick={handleGenerateScript}
          disabled={isGeneratingScript || !researchData?.caseName}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
          size="lg"
        >
          {isGeneratingScript ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating Script...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Script from Research
            </>
          )}
        </Button>
      </div>

      {/* Script Editor */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <span className="text-sm font-medium text-slate-300">Narrator Script</span>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-semibold ${wordCountStatus}`}>
              {wordCount} words
            </span>
            <span className="text-xs text-slate-400">
              ~{estimatedDuration} min
            </span>
            {wordCount > 0 && (
              <div className="flex items-center gap-1">
                {wordCount >= 1200 && wordCount <= 1700 ? (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                    Optimal Length
                  </span>
                ) : wordCount < 1200 ? (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                    Too Short
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                    Too Long
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <textarea
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          placeholder="Write your 10-minute narrator script here, or use AI to generate one from your research...

TIPS FOR GREAT TRUE CRIME SCRIPTS:
• Start with a hook - grab attention in first 15 seconds
• Use present tense for immediacy
• Include dramatic pauses and emphasis markers
• Build tension gradually toward the climax
• End with reflection or unanswered questions
• Target: 1,400-1,700 words for 10 minutes"
          className="w-full h-96 bg-slate-900 text-white p-4 font-mono text-sm resize-none focus:outline-none"
        />
      </div>

      {/* Retention Tips */}
      {wordCount > 100 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Retention Optimization Tips</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Hook viewers in the first 15 seconds with a shocking fact or question</li>
            <li>• Use cliffhangers before natural break points to maintain engagement</li>
            <li>• Include surprising twists or revelations every 2-3 minutes</li>
            <li>• End with a thought-provoking statement or unresolved mystery</li>
          </ul>
        </div>
      )}

      {/* AI Voiceover Generator */}
      {wordCount > 100 && (
        <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border border-green-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Mic className="w-5 h-5 text-green-400" />
            AI Text-to-Speech Voiceover
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Voice Style</label>
              <Select value={voiceStyle} onValueChange={(v: any) => setVoiceStyle(v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Speed: {speed.toFixed(1)}x</label>
              <Slider
                value={[speed]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={(v) => setSpeed(v[0])}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Pitch: {pitch.toFixed(1)}x</label>
              <Slider
                value={[pitch]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={(v) => setPitch(v[0])}
                className="mt-2"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateVoiceover}
            disabled={isGeneratingVoiceover || wordCount < 100}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 mb-4"
            size="lg"
          >
            {isGeneratingVoiceover ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating Voiceover...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                Generate Professional Voiceover
              </>
            )}
          </Button>

          {voiceoverData?.audioData && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <AudioPlayer
                audioData={voiceoverData.audioData}
                duration={voiceoverData.duration}
                timestamps={voiceoverData.timestamps}
                onExport={handleExportAudio}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Generate Storyboard Button */}
      <Button 
        onClick={handleGenerateStoryboard}
        disabled={wordCount < 100}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
        size="lg"
      >
        <Film className="w-5 h-5 mr-2" />
        Generate Claymation Storyboard
      </Button>
    </div>
  );
}

