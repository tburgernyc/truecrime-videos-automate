export interface SavedProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentPhase: number;
  config: {
    timeframe: string;
    language: string;
    targetRuntime: number;
  };
  researchData: any;
  scriptText: string;
  storyboardData: any;
  voiceoverData: any;
  videoData: any;
}

const STORAGE_KEY = 'truecrime_projects';

export const saveProject = (project: SavedProject): void => {
  try {
    const projects = getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving project:', error);
  }
};

export const getAllProjects = (): SavedProject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const getProject = (id: string): SavedProject | null => {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
};

export const deleteProject = (id: string): void => {
  try {
    const projects = getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting project:', error);
  }
};
