import { useCallback } from 'react';
import type { AutomatonState, AutomatonType, StateNode, Transition } from '../types/automaton';
import { useHistory } from './useHistory';
import { GRID_SIZE, STATE_RADIUS } from '../constants';

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const initialState: AutomatonState = {
  type: 'DFA',
  states: [],
  transitions: [],
  alphabet: ['a', 'b'],
  selectedIds: new Set(),
  viewBox: { x: 0, y: 0, zoom: 1 },
};

export function useAutomaton() {
  const { state, setState, setPresent, commitDrag, undo, redo, canUndo, canRedo } = useHistory(initialState);

  const snapToGrid = useCallback((val: number): number => {
    return Math.round(val / GRID_SIZE) * GRID_SIZE;
  }, []);

  const getNextStateName = useCallback(
    (states: StateNode[]): string => {
      let i = 0;
      while (states.some((s) => s.name === `q${i}`)) {
        i++;
      }
      return `q${i}`;
    },
    []
  );

  const addState = useCallback(
    (x: number, y: number, snap = false) => {
      setState((prev) => {
        const snappedX = snap ? snapToGrid(x) : x;
        const snappedY = snap ? snapToGrid(y) : y;
        const name = getNextStateName(prev.states);
        const newState: StateNode = {
          id: generateId(),
          name,
          x: snappedX,
          y: snappedY,
          isStart: prev.states.length === 0,
          isAccept: false,
        };
        return {
          ...prev,
          states: [...prev.states, newState],
          selectedIds: new Set([newState.id]),
        };
      });
    },
    [setState, snapToGrid, getNextStateName]
  );

  const deleteStates = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      setState((prev) => {
        const newStates = prev.states.filter((s) => !idSet.has(s.id));
        const newTransitions = prev.transitions.filter(
          (t) => !idSet.has(t.from) && !idSet.has(t.to)
        );

        // If deleting start state, assign new start if possible
        let states = newStates;
        if (prev.states.find((s) => s.isStart && idSet.has(s.id)) && states.length > 0) {
          states = states.map((s, i) => (i === 0 ? { ...s, isStart: true } : s));
        }

        return {
          ...prev,
          states,
          transitions: newTransitions,
          selectedIds: new Set(),
        };
      });
    },
    [setState]
  );

  // Silent move: updates position without adding to undo history (used during drag)
  const moveStateSilent = useCallback(
    (id: string, x: number, y: number) => {
      setPresent((prev) => ({
        ...prev,
        states: prev.states.map((s) => s.id === id ? { ...s, x, y } : s),
      }));
    },
    [setPresent]
  );

  const moveManyStatesSilent = useCallback(
    (moves: Array<{ id: string; x: number; y: number }>) => {
      setPresent((prev) => ({
        ...prev,
        states: prev.states.map((s) => {
          const m = moves.find((mv) => mv.id === s.id);
          return m ? { ...s, x: m.x, y: m.y } : s;
        }),
      }));
    },
    [setPresent]
  );

  // Commit a completed drag: pushes the pre-drag snapshot to history, applies snap
  const commitDraggedStates = useCallback(
    (snapshot: AutomatonState, moves: Array<{ id: string; x: number; y: number }>, snap = false) => {
      const next: AutomatonState = {
        ...snapshot,
        states: snapshot.states.map((s) => {
          const m = moves.find((mv) => mv.id === s.id);
          if (!m) return s;
          return { ...s, x: snap ? snapToGrid(m.x) : m.x, y: snap ? snapToGrid(m.y) : m.y };
        }),
      };
      commitDrag(snapshot, next);
    },
    [commitDrag, snapToGrid]
  );

  const renameState = useCallback(
    (id: string, name: string) => {
      setState((prev) => ({
        ...prev,
        states: prev.states.map((s) => (s.id === id ? { ...s, name } : s)),
      }));
    },
    [setState]
  );

  const setStartState = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        states: prev.states.map((s) => ({
          ...s,
          isStart: s.id === id,
        })),
      }));
    },
    [setState]
  );

  const toggleAcceptState = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        states: prev.states.map((s) =>
          s.id === id ? { ...s, isAccept: !s.isAccept } : s
        ),
      }));
    },
    [setState]
  );

  const addTransition = useCallback(
    (from: string, to: string, symbols: string[], stackVertically?: boolean) => {
      setState((prev) => {
        // Merge with existing transition if same from/to
        const existing = prev.transitions.find(
          (t) => t.from === from && t.to === to
        );
        if (existing) {
          const merged = Array.from(new Set([...existing.symbols, ...symbols]));
          return {
            ...prev,
            transitions: prev.transitions.map((t) =>
              t.id === existing.id
                ? { ...t, symbols: merged, stackVertically: stackVertically ?? t.stackVertically }
                : t
            ),
          };
        }
        const newTransition: Transition = {
          id: generateId(),
          from,
          to,
          symbols,
          stackVertically,
        };
        return {
          ...prev,
          transitions: [...prev.transitions, newTransition],
        };
      });
    },
    [setState]
  );

  const updateTransition = useCallback(
    (id: string, symbols: string[], stackVertically?: boolean) => {
      setState((prev) => ({
        ...prev,
        transitions: prev.transitions.map((t) =>
          t.id === id ? { ...t, symbols, stackVertically } : t
        ),
      }));
    },
    [setState]
  );

  const updateTransitionGeometry = useCallback(
    (id: string, updates: { curvature?: number; loopAngle?: number }) => {
      setState((prev) => ({
        ...prev,
        transitions: prev.transitions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
    },
    [setState]
  );

  const deleteTransitions = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      setState((prev) => ({
        ...prev,
        transitions: prev.transitions.filter((t) => !idSet.has(t.id)),
        selectedIds: new Set(
          [...prev.selectedIds].filter((id) => !idSet.has(id))
        ),
      }));
    },
    [setState]
  );

  const setType = useCallback(
    (type: AutomatonType) => {
      setState((prev) => ({ ...prev, type }));
    },
    [setState]
  );

  const setAlphabet = useCallback(
    (alphabet: string[]) => {
      setState((prev) => ({ ...prev, alphabet }));
    },
    [setState]
  );

  const loadAutomaton = useCallback(
    (newState: AutomatonState) => {
      setState(newState);
    },
    [setState]
  );

  const selectIds = useCallback(
    (ids: string[]) => {
      setState((prev) => ({ ...prev, selectedIds: new Set(ids) }));
    },
    [setState]
  );

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIds: new Set() }));
  }, [setState]);

  const toggleSelect = useCallback(
    (id: string) => {
      setState((prev) => {
        const next = new Set(prev.selectedIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { ...prev, selectedIds: next };
      });
    },
    [setState]
  );

  const setViewBox = useCallback(
    (viewBox: { x: number; y: number; zoom: number }) => {
      // Don't push viewbox changes to history
      setState((prev) => ({ ...prev, viewBox }));
    },
    [setState]
  );

  const applyLayout = useCallback(
    (positions: Map<string, { x: number; y: number }>) => {
      setState((prev) => ({
        ...prev,
        states: prev.states.map((s) => {
          const pos = positions.get(s.id);
          return pos ? { ...s, x: pos.x, y: pos.y } : s;
        }),
      }));
    },
    [setState]
  );

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: new Set([
        ...prev.states.map((s) => s.id),
        ...prev.transitions.map((t) => t.id),
      ]),
    }));
  }, [setState]);

  const deleteSelected = useCallback(() => {
    setState((prev) => {
      const stateIds = prev.states
        .filter((s) => prev.selectedIds.has(s.id))
        .map((s) => s.id);
      const transitionIds = prev.transitions
        .filter((t) => prev.selectedIds.has(t.id))
        .map((t) => t.id);
      const transSet = new Set(transitionIds);
      const stateSet = new Set(stateIds);

      let newStates = prev.states.filter((s) => !stateSet.has(s.id));
      let newTransitions = prev.transitions.filter(
        (t) =>
          !transSet.has(t.id) && !stateSet.has(t.from) && !stateSet.has(t.to)
      );

      if (
        prev.states.find((s) => s.isStart && stateSet.has(s.id)) &&
        newStates.length > 0
      ) {
        newStates = newStates.map((s, i) => (i === 0 ? { ...s, isStart: true } : s));
      }

      return {
        ...prev,
        states: newStates,
        transitions: newTransitions,
        selectedIds: new Set(),
      };
    });
  }, [setState]);

  const duplicateSelected = useCallback(() => {
    setState((prev) => {
      const selectedStateIds = prev.states
        .filter((s) => prev.selectedIds.has(s.id))
        .map((s) => s.id);
      if (selectedStateIds.length === 0) return prev;

      const idMap = new Map<string, string>();
      selectedStateIds.forEach((id) => idMap.set(id, generateId()));

      const allStates = [...prev.states];
      const newStates: StateNode[] = selectedStateIds.map((id) => {
        const original = prev.states.find((s) => s.id === id)!;
        const newName = getNextStateName(allStates);
        const node: StateNode = {
          ...original,
          id: idMap.get(id)!,
          name: newName,
          isStart: false,
          x: original.x + 20,
          y: original.y + 20,
        };
        allStates.push(node);
        return node;
      });

      // Duplicate transitions where both endpoints are in the selected set
      const newTransitions: Transition[] = prev.transitions
        .filter((t) => idMap.has(t.from) && idMap.has(t.to))
        .map((t) => ({
          ...t,
          id: generateId(),
          from: idMap.get(t.from)!,
          to: idMap.get(t.to)!,
        }));

      return {
        ...prev,
        states: [...prev.states, ...newStates],
        transitions: [...prev.transitions, ...newTransitions],
        selectedIds: new Set(newStates.map((s) => s.id)),
      };
    });
  }, [setState, getNextStateName]);

  const getMinimumRadius = useCallback(() => STATE_RADIUS, []);

  return {
    state,
    undo,
    redo,
    canUndo,
    canRedo,
    addState,
    deleteStates,
    moveStateSilent,
    moveManyStatesSilent,
    commitDraggedStates,
    renameState,
    setStartState,
    toggleAcceptState,
    addTransition,
    updateTransition,
    updateTransitionGeometry,
    deleteTransitions,
    setType,
    setAlphabet,
    loadAutomaton,
    selectIds,
    clearSelection,
    toggleSelect,
    setViewBox,
    applyLayout,
    selectAll,
    deleteSelected,
    duplicateSelected,
    getMinimumRadius,
  };
}
