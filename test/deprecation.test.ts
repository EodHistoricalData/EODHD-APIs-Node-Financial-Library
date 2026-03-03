import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deprecated } from '../src/deprecation.js';

describe('deprecated', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('calls the wrapped function and returns its result', async () => {
    const { deprecated } = await import('../src/deprecation.js');
    const spy = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const fn = deprecated('use newFn() instead', (x: number) => x * 2);
    expect(fn(21)).toBe(42);
    spy.mockRestore();
  });

  it('emits process warning on first call', async () => {
    const { deprecated } = await import('../src/deprecation.js');
    const spy = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const fn = deprecated('use newFn() instead', () => 42);
    fn();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('use newFn() instead'),
      'DeprecationWarning',
    );
    spy.mockRestore();
  });

  it('only warns once for same message', async () => {
    const { deprecated } = await import('../src/deprecation.js');
    const spy = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const fn = deprecated('old', () => 42);
    fn();
    fn();
    fn();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('warns separately for different messages', async () => {
    const { deprecated } = await import('../src/deprecation.js');
    const spy = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const fn1 = deprecated('msg1', () => 1);
    const fn2 = deprecated('msg2', () => 2);
    fn1();
    fn2();
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('preserves this context', async () => {
    const { deprecated } = await import('../src/deprecation.js');
    vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const obj = {
      value: 10,
      getValue: deprecated('use newMethod', function (this: { value: number }) {
        return this.value;
      }),
    };
    expect(obj.getValue()).toBe(10);
  });
});
