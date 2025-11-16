import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveProject as saveToStorage, getAllProjects, getProject, deleteProject as deleteFromStorage, SavedProject } from '@/lib/projectStorage';


interface ResearchData {
  caseName: string;
  summary: string;
  timeline: Array<{date: string, event: string}>;
  keyPeople: Array<{name: string, role: string}>;
  locations: string[];
  outcomes: string[];
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
    source: string;
    credibility: 'high' | 'medium' | 'low';
  }>;
  sensitiveElements: string[];
  factCheckingScore: number;
  researchedAt: string;
}

interface StoryboardScene {
  sceneId: string;
  duration: number;
  scriptExcerpt: string;
  visualPrompt: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  mood: string;
  characters: string[];
  setting: string;
  editorNotes: string;
  previewImage?: string | null;
}

interface StoryboardData {
  scenes: StoryboardScene[];
  totalScenes: number;
  totalDuration: number;
  globalStyle: string;
  generatedAt: string;
}

interface VoiceoverData {
  audioData: string | null;
  duration: number;
  voiceStyle: 'dramatic' | 'neutral' | 'mysterious';
  speed: number;
  pitch: number;
  timestamps: Array<{
    time: number;
    sceneId: string;
    label: string;
  }>;
  generatedAt: string;
}

interface VideoScene {
  id: string;
  sceneId: string;
  imageUrl: string;
  duration: number;
  transition: 'fade' | 'dissolve' | 'cut' | 'wipe';
  audioStart: number;
  audioEnd: number;
  order: number;
}

interface VideoData {
  scenes: VideoScene[];
  totalDuration: number;
  audioUrl: string | null;
  exportFormat: 'mp4' | 'mov';
  resolution: '1080p' | '4k';
  fps: 30 | 60;
  generatedAt: string;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPhase: number;
  setCurrentPhase: (phase: number) => void;
  config: {
    timeframe: string;
    language: string;
    targetRuntime: number;
  };
  setConfig: (config: any) => void;
  researchData: ResearchData | null;
  setResearchData: (data: ResearchData | null) => void;
  isResearching: boolean;
  setIsResearching: (loading: boolean) => void;
  storyboardData: StoryboardData | null;
  setStoryboardData: (data: StoryboardData | null) => void;
  isGeneratingStoryboard: boolean;
  setIsGeneratingStoryboard: (loading: boolean) => void;
  scriptText: string;
  setScriptText: (text: string) => void;
  voiceoverData: VoiceoverData | null;
  setVoiceoverData: (data: VoiceoverData | null) => void;
  isGeneratingVoiceover: boolean;
  setIsGeneratingVoiceover: (loading: boolean) => void;
  videoData: VideoData | null;
  setVideoData: (data: VideoData | null) => void;
  isAssemblingVideo: boolean;
  setIsAssemblingVideo: (loading: boolean) => void;
  currentProjectId: string | null;
  currentProjectName: string;
  setCurrentProjectName: (name: string) => void;
  saveCurrentProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  getSavedProjects: () => SavedProject[];
  createNewProject: () => void;
}





const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  currentPhase: 0,
  setCurrentPhase: () => {},
  config: {
    timeframe: '7_days',
    language: 'English (US)',
    targetRuntime: 10
  },
  setConfig: () => {},
  researchData: null,
  setResearchData: () => {},
  isResearching: false,
  setIsResearching: () => {},
  storyboardData: null,
  setStoryboardData: () => {},
  isGeneratingStoryboard: false,
  setIsGeneratingStoryboard: () => {},
  scriptText: '',
  setScriptText: () => {},
  voiceoverData: null,
  setVoiceoverData: () => {},
  isGeneratingVoiceover: false,
  setIsGeneratingVoiceover: () => {},
  videoData: null,
  setVideoData: () => {},
  isAssemblingVideo: false,
  setIsAssemblingVideo: () => {},
  currentProjectId: null,
  currentProjectName: 'Untitled Project',
  setCurrentProjectName: () => {},
  saveCurrentProject: () => {},
  loadProject: () => {},
  deleteProject: () => {},
  getSavedProjects: () => [],
  createNewProject: () => {}
};





const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [config, setConfig] = useState(defaultAppContext.config);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [scriptText, setScriptText] = useState('');
  const [voiceoverData, setVoiceoverData] = useState<VoiceoverData | null>(null);
  const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isAssemblingVideo, setIsAssemblingVideo] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState('Untitled Project');

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const saveCurrentProject = () => {
    const project: SavedProject = {
      id: currentProjectId || `project-${Date.now()}`,
      name: currentProjectName,
      createdAt: currentProjectId ? getProject(currentProjectId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentPhase,
      config,
      researchData,
      scriptText,
      storyboardData,
      voiceoverData,
      videoData
    };
    saveToStorage(project);
    setCurrentProjectId(project.id);
  };

  const loadProject = (id: string) => {
    const project = getProject(id);
    if (project) {
      setCurrentProjectId(project.id);
      setCurrentProjectName(project.name);
      setCurrentPhase(project.currentPhase);
      setConfig(project.config);
      setResearchData(project.researchData);
      setScriptText(project.scriptText);
      setStoryboardData(project.storyboardData);
      setVoiceoverData(project.voiceoverData);
      setVideoData(project.videoData);
    }
  };

  const deleteProject = (id: string) => {
    deleteFromStorage(id);
    if (currentProjectId === id) {
      createNewProject();
    }
  };

  const getSavedProjects = () => {
    return getAllProjects();
  };

  const createNewProject = () => {
    setCurrentProjectId(null);
    setCurrentProjectName('Untitled Project');
    setCurrentPhase(0);
    setConfig(defaultAppContext.config);
    setResearchData(null);
    setScriptText('');
    setStoryboardData(null);
    setVoiceoverData(null);
    setVideoData(null);
  };

  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (researchData || scriptText || storyboardData) {
        saveCurrentProject();
      }
    }, 2000);
    return () => clearTimeout(autoSave);
  }, [researchData, scriptText, storyboardData, voiceoverData, videoData, currentPhase]);


  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentPhase,
        setCurrentPhase,
        config,
        setConfig,
        researchData,
        setResearchData,
        isResearching,
        setIsResearching,
        storyboardData,
        setStoryboardData,
        isGeneratingStoryboard,
        setIsGeneratingStoryboard,
        scriptText,
        setScriptText,
        voiceoverData,
        setVoiceoverData,
        isGeneratingVoiceover,
        setIsGeneratingVoiceover,
        videoData,
        setVideoData,
        isAssemblingVideo,
        setIsAssemblingVideo,
        currentProjectId,
        currentProjectName,
        setCurrentProjectName,
        saveCurrentProject,
        loadProject,
        deleteProject,
        getSavedProjects,
        createNewProject
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
