import dagre from 'dagre';
import type { StateNode, Transition } from '../types/automaton';
import { STATE_RADIUS } from '../constants';

export function computeLayout(
  states: StateNode[],
  transitions: Transition[],
  options?: { rankdir?: string }
): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: options?.rankdir ?? 'LR',
    nodesep: 60,
    ranksep: 100,
    marginx: 50,
    marginy: 50,
  });

  g.setDefaultEdgeLabel(() => ({}));

  for (const state of states) {
    g.setNode(state.id, {
      width: STATE_RADIUS * 2,
      height: STATE_RADIUS * 2,
    });
  }

  for (const transition of transitions) {
    if (transition.from !== transition.to) {
      g.setEdge(transition.from, transition.to);
    }
  }

  dagre.layout(g);

  const positions = new Map<string, { x: number; y: number }>();
  for (const state of states) {
    const node = g.node(state.id);
    if (node) {
      positions.set(state.id, { x: node.x, y: node.y });
    }
  }

  return positions;
}
