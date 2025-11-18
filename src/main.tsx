
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CacheManager } from './lib/cache-manager'

// Initialize cache manager (clears cache if version changed)
CacheManager.initialize();

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(<App />);
