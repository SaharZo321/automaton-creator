import type { AutomatonState } from '../types/automaton';

export interface Warning {
  id: string;
  message: string;
  type: 'error' | 'warning';
  stateIds?: string[];
}

export function validateAutomaton(state: AutomatonState): Warning[] {
  const warnings: Warning[] = [];
  const { states, transitions, alphabet, type } = state;

  // No start state
  const startState = states.find((s) => s.isStart);
  if (!startState) {
    warnings.push({
      id: 'no-start',
      message: 'No start state defined.',
      type: 'warning',
    });
  }

  // No accept states
  const acceptStates = states.filter((s) => s.isAccept);
  if (states.length > 0 && acceptStates.length === 0) {
    warnings.push({
      id: 'no-accept',
      message: 'No accept states defined.',
      type: 'warning',
    });
  }

  if (type === 'DFA') {
    // Check for missing transitions
    const missingStates: string[] = [];
    for (const s of states) {
      for (const sym of alphabet) {
        const found = transitions.some((t) => t.from === s.id && t.symbols.includes(sym));
        if (!found) {
          if (!missingStates.includes(s.id)) {
            missingStates.push(s.id);
          }
        }
      }
    }
    if (missingStates.length > 0) {
      const names = missingStates
        .map((id) => states.find((s) => s.id === id)?.name ?? id)
        .join(', ');
      warnings.push({
        id: 'missing-transitions',
        message: `DFA missing transitions: ${names}`,
        type: 'warning',
        stateIds: missingStates,
      });
    }

    // Check for non-determinism (multiple transitions on same symbol)
    for (const s of states) {
      const symCount: Record<string, number> = {};
      for (const t of transitions.filter((tr) => tr.from === s.id)) {
        for (const sym of t.symbols) {
          symCount[sym] = (symCount[sym] ?? 0) + 1;
        }
      }
      const dupes = Object.entries(symCount)
        .filter(([, count]) => count > 1)
        .map(([sym]) => sym);
      if (dupes.length > 0) {
        warnings.push({
          id: `nondeterministic-${s.id}`,
          message: `DFA has multiple transitions on symbol(s) "${dupes.join(', ')}" from state "${s.name}".`,
          type: 'error',
          stateIds: [s.id],
        });
      }
    }
  }

  // Unreachable states
  if (startState && states.length > 1) {
    const reachable = new Set<string>();
    const queue = [startState.id];
    reachable.add(startState.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const t of transitions.filter((tr) => tr.from === current)) {
        if (!reachable.has(t.to)) {
          reachable.add(t.to);
          queue.push(t.to);
        }
      }
    }

    const unreachable = states.filter((s) => !reachable.has(s.id));
    if (unreachable.length > 0) {
      warnings.push({
        id: 'unreachable',
        message: `Unreachable states: ${unreachable.map((s) => s.name).join(', ')}`,
        type: 'warning',
        stateIds: unreachable.map((s) => s.id),
      });
    }
  }

  return warnings;
}

export function getUnreachableIds(state: AutomatonState): Set<string> {
  const { states, transitions } = state;
  const startState = states.find((s) => s.isStart);
  if (!startState) return new Set();

  const reachable = new Set<string>();
  const queue = [startState.id];
  reachable.add(startState.id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const t of transitions.filter((tr) => tr.from === current)) {
      if (!reachable.has(t.to)) {
        reachable.add(t.to);
        queue.push(t.to);
      }
    }
  }

  return new Set(states.filter((s) => !reachable.has(s.id)).map((s) => s.id));
}
