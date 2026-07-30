import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlowDown } from './useSlowDown';

describe('useSlowDown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks send during breath and cooldown', () => {
    const { result } = renderHook(() => useSlowDown({ breathMs: 1000, cooldownMs: 5000 }));
    expect(result.current.sendBlocked).toBe(false);

    act(() => {
      expect(result.current.trigger()).toBe(true);
    });
    expect(result.current.breathing).toBe(true);
    expect(result.current.sendBlocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.breathing).toBe(false);
    expect(result.current.isCoolingDown).toBe(true);
    expect(result.current.sendBlocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.isCoolingDown).toBe(false);
    expect(result.current.sendBlocked).toBe(false);
  });
});
