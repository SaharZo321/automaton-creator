import React from 'react';
import * as Select from '@radix-ui/react-select';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Undo2, Redo2, Wand2, Grid3X3, Map, HelpCircle,
  ChevronDown, Check, ArrowRight, Link
} from 'lucide-react';
import type { AutomatonType } from '../types/automaton';
import { FileMenu } from './FileMenu';
import { ExportMenu } from './ExportMenu';
import { AlphabetEditor } from './AlphabetEditor';
import { ThemeToggle } from './ThemeToggle';
import type { SaveEntry } from '../hooks/usePersistence';
import type { AutomatonState } from '../types/automaton';

interface ToolbarProps {
  automatonType: AutomatonType;
  onTypeChange: (type: AutomatonType) => void;
  alphabet: string[];
  onAlphabetChange: (alphabet: string[]) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  onOpenGuide: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportJson: () => void;
  onNew: () => void;
  onSaveAs: (name: string) => void;
  saves: SaveEntry[];
  onLoadSave: (name: string) => void;
  onDeleteSave: (name: string) => void;
  onLoadJson: (state: AutomatonState) => void;
  onError: (msg: string) => void;
  pendingTransitionFrom: string | null;
  onStartAddTransition: () => void;
  onCancelAddTransition: () => void;
}

const typeLabels: Record<AutomatonType, string> = {
  DFA: 'DFA',
  NFA: 'NFA',
  'NFA-e': 'NFA-ε',
  PDA: 'PDA',
  TM: 'TM',
};

function TooltipBtn({
  tooltip,
  children,
  onClick,
  disabled,
  active,
  className,
}: {
  tooltip: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <Tooltip.Provider delayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            aria-label={tooltip}
            className={`p-2 rounded-lg transition-colors duration-150 ${
              active
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            } disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ''}`}
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2 py-1 rounded shadow-lg z-50"
            sideOffset={6}
          >
            {tooltip}
            <Tooltip.Arrow className="fill-slate-900 dark:fill-slate-100" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export const Toolbar: React.FC<ToolbarProps> = ({
  automatonType,
  onTypeChange,
  alphabet,
  onAlphabetChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  showGrid,
  onToggleGrid,
  showMinimap,
  onToggleMinimap,
  onOpenGuide,
  isDark,
  onToggleTheme,
  onExportPng,
  onExportSvg,
  onExportJson,
  onNew,
  onSaveAs,
  saves,
  onLoadSave,
  onDeleteSave,
  onLoadJson,
  onError,
  pendingTransitionFrom,
  onStartAddTransition,
  onCancelAddTransition,
}) => {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-wrap shadow-sm z-10">
      {/* File menu */}
      <FileMenu
        onNew={onNew}
        onSaveAs={onSaveAs}
        saves={saves}
        onLoadSave={onLoadSave}
        onDeleteSave={onDeleteSave}
        onLoadJson={onLoadJson}
        onError={onError}
        hasUnsaved={false}
      />

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Automaton type selector */}
      <Select.Root
        value={automatonType}
        onValueChange={(val) => onTypeChange(val as AutomatonType)}
      >
        <Select.Trigger
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
          aria-label="Automaton type"
        >
          <Select.Value />
          <Select.Icon>
            <ChevronDown size={14} className="text-slate-400" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-in fade-in-0 zoom-in-95"
            position="popper"
            sideOffset={6}
          >
            <Select.Viewport>
              {(['DFA', 'NFA', 'NFA-e', 'PDA', 'TM'] as AutomatonType[]).map((type) => (
                <Select.Item
                  key={type}
                  value={type}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
                >
                  <Select.ItemText>{typeLabels[type]}</Select.ItemText>
                  <Select.ItemIndicator className="ml-auto">
                    <Check size={14} className="text-blue-500" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Alphabet editor */}
      <AlphabetEditor alphabet={alphabet} onChange={onAlphabetChange} />

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Undo / Redo */}
      <TooltipBtn tooltip="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
        <Undo2 size={18} />
      </TooltipBtn>
      <TooltipBtn tooltip="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}>
        <Redo2 size={18} />
      </TooltipBtn>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Add transition mode */}
      <TooltipBtn
        tooltip={pendingTransitionFrom ? 'Transition mode — click destination state (T or Esc to cancel)' : 'Add Transition: click source → destination (T)'}
        onClick={pendingTransitionFrom ? onCancelAddTransition : onStartAddTransition}
        active={pendingTransitionFrom !== null}
      >
        <Link size={18} />
      </TooltipBtn>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Auto-layout */}
      <TooltipBtn tooltip="Auto-layout (dagre)" onClick={onAutoLayout}>
        <Wand2 size={18} />
      </TooltipBtn>

      {/* Snap to grid */}
      <TooltipBtn tooltip="Snap to grid (G)" onClick={onToggleGrid} active={showGrid}>
        <Grid3X3 size={18} />
      </TooltipBtn>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Export */}
      <ExportMenu
        onExportPng={onExportPng}
        onExportSvg={onExportSvg}
        onExportJson={onExportJson}
      />

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Minimap toggle */}
      <TooltipBtn tooltip="Toggle minimap (M)" onClick={onToggleMinimap} active={showMinimap}>
        <Map size={18} />
      </TooltipBtn>

      {/* Help */}
      <TooltipBtn tooltip="Help / Guide (?)" onClick={onOpenGuide}>
        <HelpCircle size={18} />
      </TooltipBtn>

      {/* Theme toggle */}
      <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

      {/* Pending transition indicator */}
      {pendingTransitionFrom && (
        <div className="ml-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
          <ArrowRight size={14} />
          Click destination state to complete transition
        </div>
      )}
    </div>
  );
};
