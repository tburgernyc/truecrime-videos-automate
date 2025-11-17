// Asset configuration for TrueCrime Clay Studio
// Replace these URLs with your own assets or use environment variables

export const ASSETS = {
  hero: {
    background: import.meta.env.VITE_HERO_BG_URL || 'https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244094585_67b594a3.webp',
  },
  features: {
    discover: import.meta.env.VITE_FEATURE_DISCOVER_URL || 'https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244095590_b7e761b8.webp',
    research: import.meta.env.VITE_FEATURE_RESEARCH_URL || 'https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244096513_2108d4c5.webp',
    generate: import.meta.env.VITE_FEATURE_GENERATE_URL || 'https://d64gsuwffb70l.cloudfront.net/6918f6f64cd379db38cb2c8f_1763244097395_2fa0b4e4.webp',
  },
  placeholders: {
    scene: 'https://placehold.co/400x300/1e293b/cbd5e1?text=Scene+Preview',
  },
} as const;
