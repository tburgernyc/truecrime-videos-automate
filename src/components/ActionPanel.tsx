import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Video, Package, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { InlineLoading } from '@/components/LoadingState';
import { retrySupabaseFunction, getErrorMessage } from '@/lib/retry-handler';

export const ActionPanel: React.FC = () => {
  const {
    config,
    currentPhase,
    setCurrentPhase,
    setResearchData,
    researchData,
    scriptText,
    isResearching,
    setIsResearching,
    setCurrentProjectName
  } = useAppContext();
  const [caseName, setCaseName] = useState('');


  const handleResearchCase = async () => {
    if (!caseName.trim()) {
      toast.error('Please enter a true crime case name to research');
      return;
    }

    setIsResearching(true);
    setCurrentPhase(1); // Move to Research phase
    setCurrentProjectName(caseName.trim()); // Set project name to case name

    try {
      const data = await retrySupabaseFunction(
        supabase,
        'research-case',
        {
          caseName: caseName.trim(),
          timeframe: config.timeframe
        },
        {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            toast.info(`${getErrorMessage(error)} (Attempt ${attempt}/3)`, { duration: 3000 });
          }
        }
      );

      setResearchData(data);
      setCurrentPhase(2); // Move to next phase after research

      toast.success(`Research Complete! Found ${data.sources.length} sources for ${data.caseName}`);
    } catch (error: unknown) {
      console.error('Research error:', error);

      // Provide detailed error message
      let errorMessage = 'Failed to research case after 3 attempts';
      if (error instanceof Error) {
        if (error.message.includes('FunctionsRelayError') || error.message.includes('not found')) {
          errorMessage = 'Edge Function connection failed. The research service may still be deploying (can take 1-2 minutes). Please try again shortly.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = `Research failed: ${error.message}`;
        }
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsResearching(false);
    }
  };

  const handleGenerateScript = () => {
    if (!researchData) {
      toast.error('Please complete case research first (Phase 2)');
      return;
    }
    setCurrentPhase(2);
    toast.info('Navigate to Phase 3: Script Writing to generate script');
  };

  const handleGenerateStoryboard = () => {
    if (!researchData) {
      toast.error('Please complete case research first');
      return;
    }
    if (!scriptText || scriptText.trim().length < 100) {
      toast.error('Please write a script first (minimum 100 characters)');
      return;
    }
    setCurrentPhase(3);
    toast.info('Navigate to Phase 4: Storyboard to generate scenes');
  };

  const handlePackaging = () => {
    if (!researchData || !scriptText) {
      toast.error('Please complete research and script writing first');
      return;
    }
    setCurrentPhase(5);
    toast.info('Navigate to Phase 6: YouTube Packaging');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter true crime case name..."
          value={caseName}
          onChange={(e) => setCaseName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleResearchCase()}
          className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
          disabled={isResearching}
        />
        <Button
          onClick={handleResearchCase}
          disabled={isResearching}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isResearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Research Case
            </>
          )}
        </Button>
      </div>

      {isResearching && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <InlineLoading message="Searching Perplexity AI for case details, timeline, and sources..." />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={handleGenerateScript}
          variant="outline"
          disabled={!researchData}
          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Script
        </Button>
        <Button
          onClick={handleGenerateStoryboard}
          variant="outline"
          disabled={!researchData || !scriptText || scriptText.trim().length < 100}
          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Video className="w-4 h-4 mr-2" />
          Create Storyboard
        </Button>
        <Button
          onClick={handlePackaging}
          variant="outline"
          disabled={!researchData || !scriptText}
          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Package className="w-4 h-4 mr-2" />
          Package Video
        </Button>
      </div>
    </div>
  );
};

export default ActionPanel;

