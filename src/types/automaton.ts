export type AutomatonType = 'DFA' | 'NFA' | 'NFA-e';

export interface StateNode {
  id: string;
  name: string;
  x: number;
  y: number;
  isStart: boolean;
  isAccept: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbols: string[];
}

export interface AutomatonState {
  type: AutomatonType;
  states: StateNode[];
  transitions: Transition[];
  alphabet: string[];
  selectedIds: Set<string>;
  viewBox: { x: number; y: number; zoom: number };
}
