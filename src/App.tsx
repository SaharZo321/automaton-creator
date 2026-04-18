import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { WarningBar } from './components/WarningBar';
import { MiniMap } from './components/MiniMap';
import { GuideModal } from './components/GuideModal';
import { RenamePopover } from './components/RenamePopover';
import { TransitionEditor } from './components/TransitionEditor';
import { ToastProvider, useToast } from './components/Toast';
import { ContextMenuOverlay, buildStateMenuItems, buildTransitionMenuItems } from './components/ContextMenuOverlay';
import { useAutomaton } from './hooks/useAutomaton';
import { usePersistence } from './hooks/usePersistence';
import { useKeyboard } from './hooks/useKeyboard';
import { validateAutomaton } from './lib/validation';
import { computeLayout } from './lib/layout';
import { exportToPng, exportToSvg, exportToJson, serializeAutomaton, deserializeAutomaton } from './lib/export';
import { THEME_KEY } from './constants';
import type { AutomatonState } from './types/automaton';
import 'katex/dist/katex.min.css';

function AppInner() {
  const {
    state,
    undo, redo, canUndo, canRedo,
    addState,
    moveState,
    moveManyStates,
    renameState,
    addTransition,
    updateTransition,
    setType,
    loadAutomaton,
    selectIds,
    clearSelection,
    toggleSelect,
    applyLayout,
    selectAll,
    deleteSelected,
    duplicateSelected,
    setStartState,
    toggleAcceptState,
    deleteStates,
    deleteTransitions,
    setAlphabet,
  } = useAutomaton();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const [showGrid, setShowGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const [pendingTransitionFrom, setPendingTransitionFrom] = useState<string | null>(null);
  const [pendingTransitionSymbolFor, setPendingTransitionSymbolFor] = useState<{
    from: string; to: string; position: { x: number; y: number };
  } | null>(null);

  const [renamePopover, setRenamePopover] = useState<{
    id: string; position: { x: number; y: number };
  } | null>(null);

  const [editingTransition, setEditingTransition] = useState<{
    id: string; position: { x: number; y: number };
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    type: 'state' | 'transition';
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [viewBox, setViewBoxLocal] = useState({ x: 0, y: 0, zoom: 1 });

  const { showToast } = useToast();
  const { saveAs, loadSave, deleteSave, listSaves } = usePersistence(state, loadAutomaton);

  // Update container size
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleViewBoxChange = useCallback((vb: { x: number; y: number; zoom: number }) => {
    setViewBoxLocal(vb);
    setRenamePopover(null);
    setEditingTransition(null);
    setPendingTransitionSymbolFor(null);
  }, []);

  const warnings = validateAutomaton(state);
  const saves = listSaves();

  const handleAutoLayout = useCallback(() => {
    const positions = computeLayout(state.states, state.transitions);
    applyLayout(positions);
    showToast('Layout applied');
  }, [state.states, state.transitions, applyLayout, showToast]);

  const handleFitView = useCallback(() => {
    if (state.states.length === 0) return;
    const padding = 80;
    const minX = Math.min(...state.states.map((s) => s.x)) - 30 - padding;
    const maxX = Math.max(...state.states.map((s) => s.x)) + 30 + padding;
    const minY = Math.min(...state.states.map((s) => s.y)) - 30 - padding;
    const maxY = Math.max(...state.states.map((s) => s.y)) + 30 + padding;
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const zoomX = containerSize.width / contentW;
    const zoomY = containerSize.height / contentH;
    const zoom = Math.min(5, Math.max(0.1, Math.min(zoomX, zoomY) * 0.9));
    setViewBoxLocal({
      x: minX + (contentW - containerSize.width / zoom) / 2,
      y: minY + (contentH - containerSize.height / zoom) / 2,
      zoom,
    });
  }, [state.states, containerSize]);

  const handleCopy = useCallback(() => {
    const data = serializeAutomaton(state);
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      showToast('Copied to clipboard!');
    });
  }, [state, showToast]);

  const handlePaste = useCallback((text: string) => {
    try {
      const data = JSON.parse(text);
      const automaton = deserializeAutomaton(data);
      if (automaton) {
        loadAutomaton(automaton);
        showToast('Automaton loaded from clipboard');
      } else {
        showToast('Invalid automaton JSON', 'error');
      }
    } catch {
      showToast('Failed to parse clipboard JSON', 'error');
    }
  }, [loadAutomaton, showToast]);

  const handleNew = useCallback(() => {
    loadAutomaton({
      type: 'DFA',
      states: [],
      transitions: [],
      alphabet: ['a', 'b'],
      selectedIds: new Set(),
      viewBox: { x: 0, y: 0, zoom: 1 },
    });
    setViewBoxLocal({ x: 0, y: 0, zoom: 1 });
    showToast('New automaton created');
  }, [loadAutomaton, showToast]);

  const handleExportPng = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      await exportToPng(containerRef.current, isDark);
      showToast('Exported as PNG');
    } catch {
      showToast('Export failed', 'error');
    }
  }, [isDark, showToast]);

  const handleExportSvg = useCallback(() => {
    if (!svgRef.current) return;
    exportToSvg(svgRef.current);
    showToast('Exported as SVG');
  }, [showToast]);

  const handleExportJson = useCallback(() => {
    exportToJson(state);
    showToast('Downloaded JSON');
  }, [state, showToast]);

  // Handle completing transition creation
  const handleCompleteTransition = useCallback((toId: string) => {
    if (!pendingTransitionFrom) return;

    const fromId = pendingTransitionFrom;
    setPendingTransitionFrom('__selecting_source__');

    const fromState = state.states.find((s) => s.id === fromId);
    const toState = state.states.find((s) => s.id === toId);
    if (!fromState || !toState) return;

    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();

    const midX = ((fromState.x + toState.x) / 2 - viewBox.x) * viewBox.zoom + rect.left;
    const midY = ((fromState.y + toState.y) / 2 - viewBox.y) * viewBox.zoom + rect.top;

    setPendingTransitionSymbolFor({ from: fromId, to: toId, position: { x: midX, y: midY } });
  }, [pendingTransitionFrom, state.states, viewBox]);

  const handleSaveTransitionSymbol = useCallback((symbols: string[]) => {
    if (!pendingTransitionSymbolFor) return;
    addTransition(pendingTransitionSymbolFor.from, pendingTransitionSymbolFor.to, symbols);
    setPendingTransitionSymbolFor(null);
    showToast('Transition added');
  }, [pendingTransitionSymbolFor, addTransition, showToast]);

  const handleEditTransition = useCallback((id: string, position: { x: number; y: number }) => {
    setEditingTransition({ id, position });
  }, []);

  const handleSaveEditedTransition = useCallback((symbols: string[]) => {
    if (!editingTransition) return;
    updateTransition(editingTransition.id, symbols);
    setEditingTransition(null);
  }, [editingTransition, updateTransition]);

  const handleRenameState = useCallback((id: string, position: { x: number; y: number }) => {
    setRenamePopover({ id, position });
  }, []);

  const handleDoRename = useCallback((name: string) => {
    if (renamePopover) {
      renameState(renamePopover.id, name);
      setRenamePopover(null);
    }
  }, [renamePopover, renameState]);

  // Context menu handlers
  const handleContextMenuState = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!state.selectedIds.has(id)) selectIds([id]);
    setContextMenu({ type: 'state', id, x: e.clientX, y: e.clientY });
  }, [state.selectedIds, selectIds]);

  const handleContextMenuTransition = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!state.selectedIds.has(id)) selectIds([id]);
    setContextMenu({ type: 'transition', id, x: e.clientX, y: e.clientY });
  }, [state.selectedIds, selectIds]);

  useKeyboard({
    onDelete: deleteSelected,
    onUndo: undo,
    onRedo: redo,
    onSelectAll: selectAll,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onToggleGrid: () => setShowGrid((v) => !v),
    onFitView: handleFitView,
    onToggleMinimap: () => setShowMinimap((v) => !v),
    onDuplicate: () => { duplicateSelected(); showToast('Duplicated selection'); },
    onToggleMode: () => {
      if (pendingTransitionFrom !== null) {
        setPendingTransitionFrom(null);
      } else {
        setPendingTransitionFrom('__selecting_source__');
        showToast('Click the source state', 'info');
      }
    },
    onOpenGuide: () => setShowGuide(true),
    onEscape: () => {
      clearSelection();
      setPendingTransitionFrom(null);
      setPendingTransitionSymbolFor(null);
      setRenamePopover(null);
      setEditingTransition(null);
    },
  });

  const currentRenameStateName =
    renamePopover ? (state.states.find((s) => s.id === renamePopover.id)?.name ?? '') : '';

  const currentEditSymbols =
    editingTransition ? (state.transitions.find((t) => t.id === editingTransition.id)?.symbols ?? []) : [];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Toolbar
        automatonType={state.type}
        onTypeChange={setType}
        alphabet={state.alphabet}
        onAlphabetChange={setAlphabet}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onAutoLayout={handleAutoLayout}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap((v) => !v)}
        onOpenGuide={() => setShowGuide(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onExportJson={handleExportJson}
        onNew={handleNew}
        onSaveAs={(name) => { saveAs(name); showToast(`Saved as "${name}"`); }}
        saves={saves}
        onLoadSave={(name) => { loadSave(name); showToast(`Loaded "${name}"`); }}
        onDeleteSave={(name) => { deleteSave(name); showToast(`Deleted "${name}"`); }}
        onLoadJson={(s: AutomatonState) => { loadAutomaton(s); showToast('Automaton loaded'); }}
        onError={(msg) => showToast(msg, 'error')}
        pendingTransitionFrom={pendingTransitionFrom}
        onStartAddTransition={() => {
          setPendingTransitionFrom('__selecting_source__');
          showToast('Click the source state', 'info');
        }}
        onCancelAddTransition={() => setPendingTransitionFrom(null)}
      />

      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <Canvas
          state={state}
          showGrid={showGrid}
          snapToGrid={showGrid}
          svgRef={svgRef}
          onAddState={addState}
          onMoveState={moveState}
          onMoveManyStates={moveManyStates}
          onSelectIds={selectIds}
          onToggleSelect={toggleSelect}
          onClearSelection={clearSelection}
          onDeleteSelected={deleteSelected}
          onSelectTransitionSource={(fromId) => {
            setPendingTransitionFrom(fromId);
            showToast('Now click the destination state', 'info');
          }}
          onCompleteTransition={handleCompleteTransition}
          pendingTransitionFrom={
            pendingTransitionFrom === '__selecting_source__' ? null : pendingTransitionFrom
          }
          isSelectingTransitionSource={pendingTransitionFrom === '__selecting_source__'}
          onEditTransition={handleEditTransition}
          onRenameState={handleRenameState}
          onContextMenuState={handleContextMenuState}
          onContextMenuTransition={handleContextMenuTransition}
          viewBox={viewBox}
          onViewBoxChange={handleViewBoxChange}
          onFitView={handleFitView}
        />

        {showMinimap && (
          <MiniMap
            state={state}
            viewBox={viewBox}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            onNavigate={(x, y) => setViewBoxLocal((prev) => ({ ...prev, x, y }))}
          />
        )}
      </div>

      <WarningBar warnings={warnings} />

      <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />

      <RenamePopover
        open={renamePopover !== null}
        position={renamePopover?.position ?? { x: 0, y: 0 }}
        currentName={currentRenameStateName}
        onRename={handleDoRename}
        onClose={() => setRenamePopover(null)}
      />

      <TransitionEditor
        open={pendingTransitionSymbolFor !== null}
        position={pendingTransitionSymbolFor?.position ?? { x: 0, y: 0 }}
        currentSymbols={[]}
        automatonType={state.type}
        onSave={handleSaveTransitionSymbol}
        onClose={() => setPendingTransitionSymbolFor(null)}
      />

      <TransitionEditor
        open={editingTransition !== null}
        position={editingTransition?.position ?? { x: 0, y: 0 }}
        currentSymbols={currentEditSymbols}
        automatonType={state.type}
        onSave={handleSaveEditedTransition}
        onClose={() => setEditingTransition(null)}
      />

      {contextMenu && (() => {
        if (contextMenu.type === 'state') {
          const s = state.states.find((st) => st.id === contextMenu.id);
          if (!s) return null;
          return (
            <ContextMenuOverlay
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              items={buildStateMenuItems({
                stateId: s.id,
                isStart: s.isStart,
                isAccept: s.isAccept,
                onSetStart: (id) => setStartState(id),
                onToggleAccept: (id) => toggleAcceptState(id),
                onRename: (id) => {
                  setContextMenu(null);
                  const svgEl = svgRef.current;
                  if (!svgEl) return;
                  const rect = svgEl.getBoundingClientRect();
                  const screenX = (s.x - viewBox.x) * viewBox.zoom + rect.left;
                  const screenY = (s.y - viewBox.y) * viewBox.zoom + rect.top;
                  setRenamePopover({ id, position: { x: screenX, y: screenY } });
                },
                onDelete: (id) => deleteStates([id]),
              })}
            />
          );
        }
        return (
          <ContextMenuOverlay
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            items={buildTransitionMenuItems({
              transitionId: contextMenu.id,
              onEdit: (id) => {
                setContextMenu(null);
                setEditingTransition({ id, position: { x: contextMenu.x, y: contextMenu.y } });
              },
              onDelete: (id) => deleteTransitions([id]),
            })}
          />
        );
      })()}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
