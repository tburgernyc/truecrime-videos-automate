// Shared type definitions for TrueCrime Clay Studio

export interface ResearchData {
  caseName: string;
  summary: string;
  timeline: Array<{ date: string; event: string }>;
  keyPeople: Array<{ name: string; role: string }>;
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

export interface StoryboardScene {
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

export interface StoryboardData {
  scenes: StoryboardScene[];
  totalScenes: number;
  totalDuration: number;
  globalStyle: string;
  generatedAt: string;
}

export interface VoiceoverData {
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

export interface VideoScene {
  id: string;
  sceneId: string;
  imageUrl: string;
  duration: number;
  transition: 'fade' | 'dissolve' | 'cut' | 'wipe';
  audioStart: number;
  audioEnd: number;
  order: number;
}

export interface VideoData {
  scenes: VideoScene[];
  totalDuration: number;
  audioUrl: string | null;
  exportFormat: 'mp4' | 'mov';
  resolution: '1080p' | '4k';
  fps: 30 | 60;
  generatedAt: string;
  renderId?: string;
  renderStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  renderedVideoUrl?: string;
}

export interface Config {
  timeframe: string;
  language: string;
  targetRuntime: number;
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentPhase: number;
  config: Config;
  researchData: ResearchData | null;
  scriptText: string;
  storyboardData: StoryboardData | null;
  voiceoverData: VoiceoverData | null;
  videoData: VideoData | null;
}

export interface RenderJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  scenes: VideoScene[];
  audioUrl: string | null;
  resolution: '1080p' | '4k';
  fps: 30 | 60;
  totalDuration: number;
  videoUrl?: string;
  externalRenderId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
