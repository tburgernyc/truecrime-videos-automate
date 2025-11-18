/**
 * LocalStorage Monitor and Cleanup Utility
 * Tracks storage usage and provides automatic cleanup for old projects
 */

import { CacheManager } from './cache-manager';

const STORAGE_WARNING_THRESHOLD = 70; // Warn at 70% usage
const STORAGE_CRITICAL_THRESHOLD = 90; // Critical at 90% usage

export interface StorageStatus {
  usedKB: number;
  percentageUsed: number;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
}

/**
 * Get current localStorage usage status
 */
export function getStorageStatus(): StorageStatus {
  const { used, percentage } = CacheManager.getLocalStorageSize();

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  let message = `${used}KB used (${percentage}%)`;

  if (percentage >= STORAGE_CRITICAL_THRESHOLD) {
    status = 'critical';
    message = `Critical: ${used}KB used (${percentage}%). Please delete old projects.`;
  } else if (percentage >= STORAGE_WARNING_THRESHOLD) {
    status = 'warning';
    message = `Warning: ${used}KB used (${percentage}%). Consider deleting old projects.`;
  }

  return {
    usedKB: used,
    percentageUsed: percentage,
    status,
    message
  };
}

/**
 * Get all project keys from localStorage
 */
export function getProjectKeys(): string[] {
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('truecrime_project_')) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Get project metadata (name, timestamp, size)
 */
export interface ProjectMetadata {
  key: string;
  id: string;
  name: string;
  timestamp: number;
  sizeKB: number;
}

export function getProjectMetadata(): ProjectMetadata[] {
  const projects: ProjectMetadata[] = [];
  const keys = getProjectKeys();

  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return;

      const project = JSON.parse(data);
      const sizeKB = Math.round((data.length + key.length) / 1024);

      projects.push({
        key,
        id: key.replace('truecrime_project_', ''),
        name: project.projectName || 'Unnamed Project',
        timestamp: project.timestamp || Date.now(),
        sizeKB
      });
    } catch (error) {
      console.error(`Error reading project ${key}:`, error);
    }
  });

  // Sort by timestamp (oldest first)
  return projects.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Delete oldest projects to free up space
 */
export function cleanupOldProjects(targetPercentage: number = 50): number {
  const projects = getProjectMetadata();
  let freedKB = 0;

  // Keep deleting oldest projects until we're below target
  for (const project of projects) {
    const currentStatus = getStorageStatus();

    if (currentStatus.percentageUsed <= targetPercentage) {
      break;
    }

    localStorage.removeItem(project.key);
    freedKB += project.sizeKB;
  }

  return freedKB;
}

/**
 * Delete specific project by ID
 */
export function deleteProjectById(projectId: string): boolean {
  const key = `truecrime_project_${projectId}`;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    return false;
  }
}

/**
 * Compress project data by removing unnecessary fields
 */
export function optimizeProject(projectId: string): boolean {
  const key = `truecrime_project_${projectId}`;

  try {
    const data = localStorage.getItem(key);
    if (!data) return false;

    const project = JSON.parse(data);

    // Remove large Base64 preview images from storyboard scenes
    if (project.storyboardData?.scenes) {
      project.storyboardData.scenes = project.storyboardData.scenes.map((scene: any) => ({
        ...scene,
        previewImage: undefined // Remove preview images to save space
      }));
    }

    // Save optimized data
    localStorage.setItem(key, JSON.stringify(project));
    return true;
  } catch (error) {
    console.error(`Error optimizing project ${projectId}:`, error);
    return false;
  }
}

/**
 * Optimize all projects
 */
export function optimizeAllProjects(): number {
  const projects = getProjectMetadata();
  let optimized = 0;

  projects.forEach(project => {
    if (optimizeProject(project.id)) {
      optimized++;
    }
  });

  return optimized;
}

/**
 * Monitor storage and show warnings
 */
export function monitorStorage(onWarning?: (status: StorageStatus) => void): void {
  const status = getStorageStatus();

  if (status.status !== 'healthy' && onWarning) {
    onWarning(status);
  }

  // Auto-cleanup if critical
  if (status.status === 'critical') {
    console.warn('Storage critical! Auto-cleaning oldest projects...');
    const freedKB = cleanupOldProjects(70);
    console.log(`Freed ${freedKB}KB of storage`);
  }
}
