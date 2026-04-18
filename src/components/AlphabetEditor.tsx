import React, { useState, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { X, Plus } from 'lucide-react';

interface AlphabetEditorProps {
  alphabet: string[];
  onChange: (alphabet: string[]) => void;
}

export const AlphabetEditor: React.FC<AlphabetEditorProps> = ({ alphabet, onChange }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addSymbol = () => {
    const sym = input.trim();
    if (sym.length > 0 && !alphabet.includes(sym)) {
      onChange([...alphabet, sym]);
    }
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeSymbol = (sym: string) => {
    onChange(alphabet.filter((s) => s !== sym));
  };

  const preview = alphabet.length === 0
    ? '∅'
    : alphabet.length <= 4
      ? '{' + alphabet.join(', ') + '}'
      : '{' + alphabet.slice(0, 3).join(', ') + ', …}';

  return (
    <Popover.Root>
      <Tooltip.Provider delayDuration={400}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
              <span className="font-semibold italic">Σ</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">{preview}</span>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2 py-1 rounded shadow-lg z-50"
              sideOffset={6}
            >
              Configure alphabet
              <Tooltip.Arrow className="fill-slate-900 dark:fill-slate-100" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Popover.Portal>
        <Popover.Content
          className="z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-64"
          side="bottom"
          align="start"
          sideOffset={6}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
            Alphabet (Σ)
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px]">
            {alphabet.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                Empty — add symbols below
              </span>
            ) : (
              alphabet.map((sym) => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium"
                >
                  {sym}
                  <button
                    onClick={() => removeSymbol(sym)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label={`Remove ${sym}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSymbol();
                }
              }}
              placeholder="New symbol…"
              className="flex-1 min-w-0 px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addSymbol}
              className="px-2.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex-shrink-0"
              aria-label="Add symbol"
            >
              <Plus size={14} />
            </button>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            In DFA mode, missing transitions are flagged per symbol.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
