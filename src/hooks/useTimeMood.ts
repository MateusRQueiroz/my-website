import { useEffect, useState } from 'react';
import { getMoodId, isThemeChoice, moods, type MoodId, type ThemeChoice } from '../data/moods';

export const themeStorageKey = 'mq-portfolio-theme';

function readTheme(): ThemeChoice {
  try { const value = localStorage.getItem(themeStorageKey); return isThemeChoice(value) ? value : 'auto'; }
  catch { return 'auto'; }
}

export function useTimeMood() {
  const [now, setNow] = useState(() => new Date());
  const [choice, setChoice] = useState<ThemeChoice>(readTheme);
  const moodId: MoodId = choice === 'auto' ? getMoodId(now.getHours()) : choice;
  const mood = moods[moodId];
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(themeStorageKey, choice); } catch { /* Preference remains available in memory. */ }
  }, [choice]);
  useEffect(() => {
    document.documentElement.dataset.mood = moodId;
    return () => { delete document.documentElement.dataset.mood; };
  }, [moodId]);
  return { now, mood, moodId, choice, setChoice };
}

export type TimeMood = ReturnType<typeof useTimeMood>;
