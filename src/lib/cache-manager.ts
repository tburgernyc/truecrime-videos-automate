/**
 * Cache Management Utility
 * Helps users clear browser cache and fix stale data issues
 */

const APP_VERSION = '2.0.0';
const VERSION_KEY = 'app_version';

export class CacheManager {
  /**
   * Check if app version has changed
   */
  static hasVersionChanged(): boolean {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    return storedVersion !== APP_VERSION;
  }

  /**
   * Clear all app caches
   */
  static async clearAllCaches(): Promise<void> {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear service worker caches if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }

    // Store new version
    localStorage.setItem(VERSION_KEY, APP_VERSION);
  }

  /**
   * Clear only project data, keep settings
   */
  static clearProjectData(): void {
    const keysToKeep = [VERSION_KEY, 'user_preferences'];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Force page reload without cache
   */
  static forceReload(): void {
    window.location.reload();
  }

  /**
   * Initialize cache manager on app start
   */
  static initialize(): void {
    if (this.hasVersionChanged()) {
      console.info(`App updated to version ${APP_VERSION}, clearing old cache...`);
      this.clearAllCaches().then(() => {
        console.info('Cache cleared successfully');
      });
    } else {
      // Just update version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    }
  }

  /**
   * Get current app version
   */
  static getVersion(): string {
    return APP_VERSION;
  }

  /**
   * Check localStorage usage
   */
  static getLocalStorageSize(): { used: number; percentage: number } {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }

    // Most browsers: 5-10MB limit, assume 5MB
    const limit = 5 * 1024 * 1024; // 5MB in bytes
    const usedKB = Math.round(total / 1024);
    const percentage = Math.round((total / limit) * 100);

    return {
      used: usedKB,
      percentage: Math.min(percentage, 100)
    };
  }
}
