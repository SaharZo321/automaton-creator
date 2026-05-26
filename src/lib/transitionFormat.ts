import type { AutomatonType } from '../types/automaton';

export const EPSILON_SYMBOL = 'ε';
export const BLANK_SYMBOL = '⊔';

const COMPOUND_TRANSITION_TYPES: AutomatonType[] = ['PDA', 'TM'];

export function getTransitionSeparator(type: AutomatonType): ',' | ';' {
  return COMPOUND_TRANSITION_TYPES.includes(type) ? ';' : ',';
}

function normalizeTmSymbol(symbol: string): string {
  const trimmed = symbol.trim();
  const canonical = trimmed.toLowerCase();
  if (
    canonical === EPSILON_SYMBOL ||
    canonical === 'epsilon' ||
    canonical === 'eps' ||
    canonical === 'blank' ||
    canonical === 'sqcup' ||
    trimmed === '\\sqcup' ||
    trimmed === '□'
  ) {
    return BLANK_SYMBOL;
  }
  return trimmed;
}

export function normalizeTmTransition(input: string): string | null {
  const match = input.trim().match(/^(.+?)\s*\/\s*(.+?)\s*,\s*([LR])$/i);
  if (!match) return null;

  const [, read, write, direction] = match;
  return `${normalizeTmSymbol(read)} / ${normalizeTmSymbol(write)}, ${direction.toUpperCase()}`;
}

export function parseTransitionInput(
  type: AutomatonType,
  value: string
): { symbols: string[]; error?: string } {
  const separator = getTransitionSeparator(type);
  const rawSymbols = value
    .split(separator)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (type !== 'TM') {
    return { symbols: rawSymbols };
  }

  const symbols: string[] = [];
  for (const raw of rawSymbols) {
    const normalized = normalizeTmTransition(raw);
    if (!normalized) {
      return {
        symbols: [],
        error: 'Use read / write, L or read / write, R.',
      };
    }
    symbols.push(normalized);
  }

  return { symbols };
}

export function formatTransitionLabel(type: AutomatonType | undefined, symbol: string): string {
  if (type === 'PDA') {
    return symbol.replace(/\s*\/\s*/g, ' → ');
  }

  if (type === 'TM') {
    const normalized = normalizeTmTransition(symbol);
    if (normalized) {
      return normalized.replace(/\s*\/\s*/, ' → ');
    }

    return symbol
      .replaceAll(EPSILON_SYMBOL, BLANK_SYMBOL)
      .replaceAll('□', BLANK_SYMBOL);
  }

  return symbol;
}
