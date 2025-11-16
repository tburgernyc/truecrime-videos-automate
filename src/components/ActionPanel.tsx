import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Video, Package, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const ActionPanel: React.FC = () => {
  const { config, setCurrentPhase, setResearchData, isResearching, setIsResearching, setCurrentProjectName } = useAppContext();
  const [caseName, setCaseName] = useState('');


  const handleResearchCase = async () => {
    if (!caseName.trim()) {
      toast({
        title: 'Case name required',
        description: 'Please enter a true crime case name to research',
        variant: 'destructive'
      });
      return;
    }

    setIsResearching(true);
    setCurrentPhase(1); // Move to Research phase
    setCurrentProjectName(caseName.trim()); // Set project name to case name

    try {
      const { data, error } = await supabase.functions.invoke('research-case', {
        body: { 
          caseName: caseName.trim(),
          timeframe: config.timeframe
        }
      });

      if (error) throw error;

      setResearchData(data);
      setCurrentPhase(2); // Move to next phase after research

      
      toast({
        title: 'Research Complete',
        description: `Found ${data.sources.length} sources for ${data.caseName}`,
      });
    } catch (error: any) {
      console.error('Research error:', error);
      toast({
        title: 'Research Failed',
        description: error.message || 'Failed to research case',
        variant: 'destructive'
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleGenerateScript = () => {
    setCurrentPhase(2);
    toast({
      title: 'Script Generation',
      description: 'Starting script generation...',
    });
  };

  const handleGenerateStoryboard = () => {
    setCurrentPhase(3);
    toast({
      title: 'Storyboard Creation',
      description: 'Generating claymation storyboard...',
    });
  };

  const handlePackaging = () => {
    setCurrentPhase(4);
    toast({
      title: 'YouTube Packaging',
      description: 'Creating titles, thumbnails, and metadata...',
    });
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button 
          onClick={handleGenerateScript}
          variant="outline"
          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Script
        </Button>
        <Button 
          onClick={handleGenerateStoryboard}
          variant="outline"
          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-white"
        >
          <Video className="w-4 h-4 mr-2" />
          Create Storyboard
        </Button>
        <Button 
          onClick={handlePackaging}
          variant="outline"
          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-white"
        >
          <Package className="w-4 h-4 mr-2" />
          Package Video
        </Button>
      </div>
    </div>
  );
};

export default ActionPanel;

