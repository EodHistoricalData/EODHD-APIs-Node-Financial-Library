const warned = new Set<string>();

export function deprecated<T extends (...args: any[]) => any>(message: string, fn: T): T {
  const wrapper = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (!warned.has(message)) {
      warned.add(message);
      if (typeof process !== 'undefined' && process.emitWarning) {
        process.emitWarning(`[eodhd] Deprecated: ${message}`, 'DeprecationWarning');
      }
    }
    return fn.apply(this, args);
  };
  return wrapper as T;
}
