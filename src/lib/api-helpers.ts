// Production-ready API integration helpers

/**
 * Retry helper for API calls with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor(maxTokens: number = 10, refillRate: number = 1) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // Wait until a token is available
    const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.tokens = 0;
  }

  canAcquire(): boolean {
    this.refill();
    return this.tokens >= 1;
  }
}

/**
 * API call wrapper with error handling and logging
 */
export async function apiCall<T>(
  name: string,
  fn: () => Promise<T>,
  options: {
    retry?: boolean;
    logErrors?: boolean;
    timeout?: number;
  } = {}
): Promise<T> {
  const { retry = true, logErrors = true, timeout } = options;

  try {
    let promise: Promise<T>;

    if (retry) {
      promise = retryWithBackoff(fn);
    } else {
      promise = fn();
    }

    // Add timeout if specified
    if (timeout) {
      promise = Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`API call ${name} timed out`)), timeout)
        ),
      ]);
    }

    const result = await promise;
    return result;
  } catch (error) {
    if (logErrors) {
      console.error(`API call ${name} failed:`, error);

      // In production, send to error tracking service
      // Example: Sentry.captureException(error, { tags: { api: name } });
    }
    throw error;
  }
}

/**
 * Validate API response structure
 */
export function validateResponse<T>(
  data: unknown,
  validator: (data: unknown) => data is T
): T {
  if (!validator(data)) {
    throw new Error('Invalid API response structure');
  }
  return data;
}

/**
 * Check if environment variable is set
 */
export function requireEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Safely get optional environment variable
 */
export function getEnvVar(name: string, defaultValue?: string): string | undefined {
  return import.meta.env[name] || defaultValue;
}

/**
 * Check if API key is configured
 */
export function hasApiKey(name: string): boolean {
  const value = import.meta.env[name];
  return !!value && value.length > 0;
}

/**
 * Cache helper for API responses
 */
export class SimpleCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Debounce helper for user input
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle helper for frequent events
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format API error for user display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose technical details to users
    if (error.message.includes('API key')) {
      return 'API configuration error. Please check your settings.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    return 'An error occurred. Please try again.';
  }
  return 'An unexpected error occurred.';
}
