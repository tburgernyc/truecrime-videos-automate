import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function MyProjects() {
  const { getSavedProjects, loadProject, deleteProject, createNewProject, currentProjectName, setCurrentProjectName, saveCurrentProject } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  
  const projects = getSavedProjects();

  // Calculate storage usage
  const storageStats = useMemo(() => {
    const storageData = localStorage.getItem('truecrime-projects');
    const bytes = storageData ? new Blob([storageData]).size : 0;
    const kb = (bytes / 1024).toFixed(2);
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return { bytes, kb, mb, display: bytes > 1024 * 1024 ? `${mb} MB` : `${kb} KB` };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Phase filter
    if (phaseFilter !== 'all') {
      const minPhase = parseInt(phaseFilter);
      filtered = filtered.filter(p => p.currentPhase >= minPhase);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return filtered;
  }, [projects, searchTerm, phaseFilter, sortBy]);

  const handleLoad = (id: string) => {
    loadProject(id);
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const handleNewProject = () => {
    if (confirm('Create new project? Current progress will be saved.')) {
      saveCurrentProject();
      createNewProject();
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
        My Projects ({projects.length})
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">My Projects</DialogTitle>
          </DialogHeader>
          
          {/* Current Project */}
          <div className="mb-4 pb-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Current:</span>
              {editingName ? (
                <Input
                  value={currentProjectName}
                  onChange={(e) => setCurrentProjectName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  className="bg-slate-800 border-slate-700 text-white flex-1"
                  autoFocus
                />
              ) : (
                <span className="font-semibold cursor-pointer hover:text-teal-400" onClick={() => setEditingName(true)}>
                  {currentProjectName}
                </span>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400">Total Projects</p>
              <p className="text-2xl font-bold text-teal-400">{projects.length}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400">Storage Used</p>
              <p className="text-2xl font-bold text-teal-400">{storageStats.display}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400">Filtered Results</p>
              <p className="text-2xl font-bold text-teal-400">{filteredProjects.length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="1">Phase 1+</SelectItem>
                <SelectItem value="2">Phase 2+</SelectItem>
                <SelectItem value="3">Phase 3+</SelectItem>
                <SelectItem value="4">Phase 4+</SelectItem>
                <SelectItem value="5">Phase 5+</SelectItem>
                <SelectItem value="6">Phase 6+</SelectItem>
                <SelectItem value="7">Phase 7</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleNewProject} className="w-full mb-4 bg-teal-600 hover:bg-teal-700">
            + New Project
          </Button>

          {/* Projects List */}
          <div className="space-y-3 overflow-y-auto flex-1">
            {filteredProjects.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                {projects.length === 0 ? 'No saved projects yet' : 'No projects match your filters'}
              </p>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <Badge variant="outline" className="bg-teal-900/30 text-teal-400 border-teal-700">
                          Phase {project.currentPhase}/7
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        Updated: {new Date(project.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleLoad(project.id)} size="sm" className="bg-teal-600 hover:bg-teal-700">
                        Load
                      </Button>
                      <Button onClick={() => handleDelete(project.id)} size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
