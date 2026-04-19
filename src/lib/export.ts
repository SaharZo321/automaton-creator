import { toPng } from 'html-to-image';
import type { AutomatonState } from '../types/automaton';

export async function exportToPng(element: HTMLElement, isDark: boolean): Promise<void> {
  const backgroundColor = isDark ? '#1e293b' : '#ffffff';

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor,
  });

  const link = document.createElement('a');
  link.download = 'automaton.png';
  link.href = dataUrl;
  link.click();
}

export function exportToSvg(element: SVGElement): void {
  const clone = element.cloneNode(true) as SVGElement;

  // Set explicit background
  clone.setAttribute('style', 'background: white;');

  const svgData = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = 'automaton.svg';
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

export function exportToJson(state: AutomatonState): void {
  const data = serializeAutomaton(state);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = 'automaton.json';
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

export function serializeAutomaton(state: AutomatonState): object {
  return {
    type: state.type,
    states: state.states.map((s) => ({
      id: s.id,
      name: s.name,
      x: Math.round(s.x),
      y: Math.round(s.y),
      isStart: s.isStart,
      isAccept: s.isAccept,
    })),
    transitions: state.transitions.map((t) => ({
      id: t.id,
      from: t.from,
      to: t.to,
      symbols: t.symbols,
      ...(t.curvature !== undefined && { curvature: t.curvature }),
      ...(t.loopAngle !== undefined && { loopAngle: t.loopAngle }),
    })),
    alphabet: state.alphabet,
  };
}

export function deserializeAutomaton(data: unknown): AutomatonState | null {
  if (!data || typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;

  if (!['DFA', 'NFA', 'NFA-e'].includes(obj.type as string)) return null;
  if (!Array.isArray(obj.states)) return null;
  if (!Array.isArray(obj.transitions)) return null;

  const states = obj.states.map((s: unknown) => {
    const state = s as Record<string, unknown>;
    return {
      id: String(state.id ?? ''),
      name: String(state.name ?? ''),
      x: Number(state.x ?? 0),
      y: Number(state.y ?? 0),
      isStart: Boolean(state.isStart),
      isAccept: Boolean(state.isAccept),
    };
  });

  const transitions = obj.transitions.map((t: unknown) => {
    const tr = t as Record<string, unknown>;
    return {
      id: String(tr.id ?? ''),
      from: String(tr.from ?? ''),
      to: String(tr.to ?? ''),
      symbols: Array.isArray(tr.symbols) ? tr.symbols.map(String) : [],
      ...(tr.curvature !== undefined && { curvature: Number(tr.curvature) }),
      ...(tr.loopAngle !== undefined && { loopAngle: Number(tr.loopAngle) }),
    };
  });

  const alphabet = Array.isArray(obj.alphabet) ? obj.alphabet.map(String) : [];

  return {
    type: obj.type as AutomatonState['type'],
    states,
    transitions,
    alphabet,
    selectedIds: new Set(),
    viewBox: { x: 0, y: 0, zoom: 1 },
  };
}
