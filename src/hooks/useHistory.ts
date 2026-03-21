import { useState, useCallback } from 'react';
import type { AutomatonState } from '../types/automaton';
import { HISTORY_LIMIT } from '../constants';

interface HistoryStack {
  past: AutomatonState[];
  present: AutomatonState;
  future: AutomatonState[];
}

export function useHistory(initialState: AutomatonState) {
  const [history, setHistory] = useState<HistoryStack>({
    past: [],
    present: initialState,
    future: [],
  });

  const setState = useCallback((newState: AutomatonState | ((prev: AutomatonState) => AutomatonState)) => {
    setHistory((h) => {
      const next = typeof newState === 'function' ? newState(h.present) : newState;
      const past = [...h.past, h.present].slice(-HISTORY_LIMIT);
      return {
        past,
        present: next,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const past = h.past.slice(0, -1);
      const present = h.past[h.past.length - 1];
      const future = [h.present, ...h.future];
      return { past, present, future };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const past = [...h.past, h.present];
      const present = h.future[0];
      const future = h.future.slice(1);
      return { past, present, future };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
