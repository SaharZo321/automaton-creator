import React from 'react';
import * as CM from '@radix-ui/react-context-menu';
import { Play, Trash2, Edit2, CheckCircle } from 'lucide-react';

interface StateContextMenuProps {
  stateId: string;
  isStart: boolean;
  isAccept: boolean;
  onSetStart: (id: string) => void;
  onToggleAccept: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  children: React.ReactNode;
}

export const StateContextMenu: React.FC<StateContextMenuProps> = ({
  stateId,
  isStart,
  isAccept,
  onSetStart,
  onToggleAccept,
  onDelete,
  onRename,
  children,
}) => {
  return (
    <CM.Root>
      <CM.Trigger asChild>{children}</CM.Trigger>
      <CM.Portal>
        <CM.Content
          className="z-50 min-w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95"
          style={{ animationDuration: '100ms' }}
        >
          <CM.Item
            onSelect={() => onSetStart(stateId)}
            disabled={isStart}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed outline-none"
          >
            <Play size={15} className="text-emerald-500" />
            Set as start state
            {isStart && <span className="ml-auto text-xs text-slate-400">(current)</span>}
          </CM.Item>

          <CM.Item
            onSelect={() => onToggleAccept(stateId)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
          >
            <CheckCircle size={15} className={isAccept ? 'text-emerald-500' : 'text-slate-400'} />
            {isAccept ? 'Remove accept state' : 'Set as accept state'}
          </CM.Item>

          <CM.Item
            onSelect={() => onRename(stateId)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
          >
            <Edit2 size={15} className="text-blue-500" />
            Rename
          </CM.Item>

          <CM.Separator className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

          <CM.Item
            onSelect={() => onDelete(stateId)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 outline-none"
          >
            <Trash2 size={15} />
            Delete
          </CM.Item>
        </CM.Content>
      </CM.Portal>
    </CM.Root>
  );
};

interface TransitionContextMenuProps {
  transitionId: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  children: React.ReactNode;
}

export const TransitionContextMenu: React.FC<TransitionContextMenuProps> = ({
  transitionId,
  onDelete,
  onEdit,
  children,
}) => {
  return (
    <CM.Root>
      <CM.Trigger asChild>{children}</CM.Trigger>
      <CM.Portal>
        <CM.Content
          className="z-50 min-w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95"
          style={{ animationDuration: '100ms' }}
        >
          <CM.Item
            onSelect={() => onEdit(transitionId)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
          >
            <Edit2 size={15} className="text-blue-500" />
            Edit symbols
          </CM.Item>

          <CM.Separator className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

          <CM.Item
            onSelect={() => onDelete(transitionId)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 outline-none"
          >
            <Trash2 size={15} />
            Delete
          </CM.Item>
        </CM.Content>
      </CM.Portal>
    </CM.Root>
  );
};
