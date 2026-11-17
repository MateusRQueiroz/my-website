import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { themeStorageKey, useTimeMood } from './useTimeMood';

afterEach(() => {vi.useRealTimers();vi.restoreAllMocks();});
it('persists preview selection while clock advances and returns to automatic time', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026,10,16,10,59,59));
  const intervals = vi.spyOn(window,'setInterval');
  const clears = vi.spyOn(window,'clearInterval');
  const {result,unmount} = renderHook(() => useTimeMood(),{wrapper:StrictMode});
  expect(result.current.mood.label).toBe('Morning');
  expect(intervals.mock.calls.length - clears.mock.calls.length).toBe(1);
  act(() => result.current.setChoice('night'));
  expect(localStorage.getItem(themeStorageKey)).toBe('night');
  act(() => vi.advanceTimersByTime(60000));
  expect(result.current.now.getHours()).toBe(11); expect(result.current.mood.label).toBe('Night');
  act(() => result.current.setChoice('auto')); expect(result.current.mood.label).toBe('Midday');
  unmount();
  for (const handle of intervals.mock.results) expect(clears).toHaveBeenCalledWith(handle.value);
});
it('recovers from unavailable storage', () => {
  const get = vi.spyOn(Storage.prototype,'getItem').mockImplementation(() => {throw new Error('Disabled');});
  const set = vi.spyOn(Storage.prototype,'setItem').mockImplementation(() => {throw new Error('Disabled');});
  const {result} = renderHook(() => useTimeMood());
  expect(result.current.choice).toBe('auto');
  act(() => result.current.setChoice('evening')); expect(result.current.mood.label).toBe('Evening');
  get.mockRestore(); set.mockRestore();
});
