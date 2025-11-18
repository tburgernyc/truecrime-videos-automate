/**
 * Retry Handler Utility
 * Provides intelligent retry logic with exponential backoff for API calls
 */

export interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  onRetry: () => {}
};

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable (network errors, timeouts, 5xx errors)
 */
export const isRetryableError = (error: any): boolean => {
  // Network errors
  if (error.message?.includes('network') ||
      error.message?.includes('fetch') ||
      error.message?.includes('timeout')) {
    return true;
  }

  // Supabase relay errors (function not ready)
  if (error.message?.includes('FunctionsRelayError') ||
      error.message?.includes('not found')) {
    return true;
  }

  // HTTP 5xx errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Rate limiting (429)
  if (error.status === 429) {
    return true;
  }

  return false;
};

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === cfg.maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        cfg.initialDelayMs * Math.pow(cfg.backoffMultiplier, attempt - 1),
        cfg.maxDelayMs
      );

      // Notify retry callback
      cfg.onRetry(attempt, error);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Create a retryable version of a Supabase function invoke
 */
export async function retrySupabaseFunction<T = any>(
  supabase: any,
  functionName: string,
  body: any,
  config: RetryConfig = {}
): Promise<T> {
  return withRetry(
    async () => {
      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) throw error;

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    config
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (error.message?.includes('FunctionsRelayError') ||
      error.message?.includes('not found')) {
    return 'Service is still deploying. Retrying...';
  }

  if (error.message?.includes('network') ||
      error.message?.includes('fetch')) {
    return 'Network error. Retrying...';
  }

  if (error.status === 429) {
    return 'Rate limit exceeded. Retrying...';
  }

  if (error.status >= 500) {
    return 'Server error. Retrying...';
  }

  return error.message || 'Unknown error occurred';
}
