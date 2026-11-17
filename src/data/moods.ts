export const moodIds = ['dawn', 'morning', 'midday', 'afternoon', 'evening', 'night'] as const;
export type MoodId = typeof moodIds[number];
export type ThemeChoice = 'auto' | MoodId;

/** Scene colors and composition for each mood live in src/styles/scene.css. */
export const moods: Record<MoodId, { label: string; description: string }> = {
  dawn: { label: 'Dawn', description: 'First light along the horizon' },
  morning: { label: 'Morning', description: 'Clouds drifting in' },
  midday: { label: 'Midday', description: 'High sun, open sky' },
  afternoon: { label: 'Afternoon', description: 'Golden hour' },
  evening: { label: 'Evening', description: 'Windows coming on' },
  night: { label: 'Night', description: 'Stars over the city' },
};

export function getMoodId(hour: number): MoodId {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === 'auto' || moodIds.includes(value as MoodId);
}
