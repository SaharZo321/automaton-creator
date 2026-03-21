import { useEffect, useCallback, useRef } from 'react';
import type { AutomatonState } from '../types/automaton';
import { STORAGE_KEY, SAVES_KEY, AUTO_SAVE_DEBOUNCE } from '../constants';
import { serializeAutomaton, deserializeAutomaton } from '../lib/export';

export interface SaveEntry {
  name: string;
  type: string;
  stateCount: number;
  lastModified: Date;
}

interface StoredSave {
  name: string;
  type: string;
  stateCount: number;
  lastModified: string;
  data: object;
}

export function usePersistence(
  state: AutomatonState,
  loadAutomaton: (s: AutomatonState) => void
) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  // Load on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const automaton = deserializeAutomaton(data);
        if (automaton) {
          loadAutomaton(automaton);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save with debounce
  useEffect(() => {
    if (!isInitialized.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        const data = serializeAutomaton(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore storage errors
      }
    }, AUTO_SAVE_DEBOUNCE);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state]);

  const saveAs = useCallback(
    (name: string) => {
      try {
        const allSaves = getSaves();
        const data = serializeAutomaton(state);
        const entry: StoredSave = {
          name,
          type: state.type,
          stateCount: state.states.length,
          lastModified: new Date().toISOString(),
          data,
        };

        const idx = allSaves.findIndex((s) => s.name === name);
        if (idx >= 0) {
          allSaves[idx] = entry;
        } else {
          allSaves.push(entry);
        }

        localStorage.setItem(SAVES_KEY, JSON.stringify(allSaves));
      } catch {
        // Ignore
      }
    },
    [state]
  );

  const loadSave = useCallback(
    (name: string) => {
      try {
        const allSaves = getSaves();
        const entry = allSaves.find((s) => s.name === name);
        if (!entry) return;
        const automaton = deserializeAutomaton(entry.data);
        if (automaton) {
          loadAutomaton(automaton);
        }
      } catch {
        // Ignore
      }
    },
    [loadAutomaton]
  );

  const deleteSave = useCallback((name: string) => {
    try {
      const allSaves = getSaves().filter((s) => s.name !== name);
      localStorage.setItem(SAVES_KEY, JSON.stringify(allSaves));
    } catch {
      // Ignore
    }
  }, []);

  const listSaves = useCallback((): SaveEntry[] => {
    return getSaves().map((s) => ({
      name: s.name,
      type: s.type,
      stateCount: s.stateCount,
      lastModified: new Date(s.lastModified),
    }));
  }, []);

  return { saveAs, loadSave, deleteSave, listSaves };
}

function getSaves(): StoredSave[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredSave[];
  } catch {
    return [];
  }
}
