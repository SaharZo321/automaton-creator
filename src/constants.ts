export const GRID_SIZE = 20;
export const STATE_RADIUS = 30;

export function getStateRx(name: string): number {
  const textWidth = name.length * 14 * 0.62;
  return Math.max(STATE_RADIUS, textWidth / 2 + 12);
}
export const ARROW_SIZE = 10;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const HISTORY_LIMIT = 50;
export const AUTO_SAVE_DEBOUNCE = 500;
export const STORAGE_KEY = 'automaton-creator-autosave';
export const THEME_KEY = 'automaton-creator-theme';
export const SAVES_KEY = 'automaton-creator-saves';
