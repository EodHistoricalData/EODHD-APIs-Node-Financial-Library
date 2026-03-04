export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
}

export const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 2,
  initialDelay: 1000,
  maxDelay: 30000,
  multiplier: 2,
};

/** Full jitter: random(floor, min(cap, base * 2^attempt)), floor = initialDelay/2 (min 100ms) */
export function calculateDelay(attempt: number, options: RetryOptions): number {
  const exponential = options.initialDelay * Math.pow(options.multiplier, attempt);
  const capped = Math.min(options.maxDelay, exponential);
  const floor = Math.max(100, options.initialDelay / 2);
  return floor + Math.random() * (capped - floor);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
