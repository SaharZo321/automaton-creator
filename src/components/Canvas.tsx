import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { AutomatonState, StateNode, Transition } from '../types/automaton';
import { STATE_RADIUS, MIN_ZOOM, MAX_ZOOM } from '../constants';
import { hitTestState } from '../lib/geometry';
import { getUnreachableIds } from '../lib/validation';
import { GridPattern } from './canvas/GridPattern';
import { StateCircle } from './canvas/StateCircle';
import { TransitionEdge } from './canvas/TransitionEdge';
import { SelfLoop } from './canvas/SelfLoop';
import { StartArrow } from './canvas/StartArrow';
import { SelectionRect } from './canvas/SelectionRect';
import { Network } from 'lucide-react';

interface CanvasProps {
  state: AutomatonState;
  showGrid: boolean;
  snapToGrid: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onAddState: (x: number, y: number, snap: boolean) => void;
  onMoveState: (id: string, x: number, y: number, snap: boolean) => void;
  onMoveManyStates: (moves: Array<{ id: string; x: number; y: number }>, snap: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onSelectTransitionSource: (fromId: string) => void;
  onCompleteTransition: (toId: string) => void;
  pendingTransitionFrom: string | null;
  isSelectingTransitionSource: boolean;
  onEditTransition: (id: string, position: { x: number; y: number }) => void;
  onRenameState: (id: string, position: { x: number; y: number }) => void;
  onContextMenuState: (e: React.MouseEvent, id: string) => void;
  onContextMenuTransition: (e: React.MouseEvent, id: string) => void;
  viewBox: { x: number; y: number; zoom: number };
  onViewBoxChange: (vb: { x: number; y: number; zoom: number }) => void;
  onFitView: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  state,
  showGrid,
  snapToGrid,
  svgRef,
  onAddState,
  onMoveState,
  onMoveManyStates,
  onSelectIds,
  onToggleSelect,
  onClearSelection,
  onSelectTransitionSource,
  onCompleteTransition,
  pendingTransitionFrom,
  isSelectingTransitionSource,
  onEditTransition,
  onRenameState,
  onContextMenuState,
  onContextMenuTransition,
  viewBox,
  onViewBoxChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingState = useRef(false);
  const dragStateId = useRef<string | null>(null);
  const dragStartSvg = useRef({ x: 0, y: 0 });
  const dragStartState = useRef({ x: 0, y: 0 });
  const dragGroupOffsets = useRef<Map<string, { x: number; y: number }>>(new Map());

  const isSpaceDown = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const isSelecting = useRef(false);
  const selectStart = useRef({ x: 0, y: 0 });
  const [selectionRect, setSelectionRect] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  const didMoveRef = useRef(false);
  const justCompletedTransitionRef = useRef(false);

  const unreachableIds = getUnreachableIds(state);

  // Convert screen coordinates to SVG/world coordinates
  const screenToSvg = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: viewBox.x + (clientX - rect.left) / viewBox.zoom,
        y: viewBox.y + (clientY - rect.top) / viewBox.zoom,
      };
    },
    [viewBox, svgRef]
  );

  // Find state at SVG point
  const findStateAt = useCallback(
    (svgPt: { x: number; y: number }): StateNode | null => {
      for (let i = state.states.length - 1; i >= 0; i--) {
        const s = state.states[i];
        if (hitTestState(svgPt, s, STATE_RADIUS)) return s;
      }
      return null;
    },
    [state.states]
  );

  // Wheel zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;

      onViewBoxChange((() => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewBox.zoom * delta));
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        const svgX = viewBox.x + cursorX / viewBox.zoom;
        const svgY = viewBox.y + cursorY / viewBox.zoom;
        const newX = svgX - cursorX / newZoom;
        const newY = svgY - cursorY / newZoom;
        return { x: newX, y: newY, zoom: newZoom };
      })());
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [viewBox, onViewBoxChange, svgRef]);

  // Space key tracking
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpaceDown.current) {
        const el = document.activeElement;
        const tag = el?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          isSpaceDown.current = true;
          if (svgRef.current) svgRef.current.style.cursor = 'grab';
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDown.current = false;
        if (svgRef.current) svgRef.current.style.cursor = 'default';
        isPanning.current = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [svgRef]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button === 1 || (e.button === 0 && isSpaceDown.current)) {
        // Pan
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
        if (svgRef.current) svgRef.current.style.cursor = 'grabbing';
        return;
      }

      if (e.button !== 0) return;

      const svgPt = screenToSvg(e.clientX, e.clientY);
      const hit = findStateAt(svgPt);

      if (hit) {
        // Click on state - handled by state's own onMouseDown
        return;
      }

      // Click on empty area - start selection rect
      isSelecting.current = true;
      selectStart.current = svgPt;
      setSelectionRect({ x: svgPt.x, y: svgPt.y, width: 0, height: 0 });
      if (!e.shiftKey) {
        onClearSelection();
      }
    },
    [viewBox, screenToSvg, findStateAt, onClearSelection, svgRef]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Pan
      if (isPanning.current) {
        const dx = (e.clientX - panStart.current.x) / viewBox.zoom;
        const dy = (e.clientY - panStart.current.y) / viewBox.zoom;
        onViewBoxChange({
          ...viewBox,
          x: panStart.current.vx - dx,
          y: panStart.current.vy - dy,
        });
        return;
      }

      // Drag state
      if (isDraggingState.current && dragStateId.current) {
        didMoveRef.current = true;
        const svgPt = screenToSvg(e.clientX, e.clientY);
        const dx = svgPt.x - dragStartSvg.current.x;
        const dy = svgPt.y - dragStartSvg.current.y;

        if (state.selectedIds.size > 1 && state.selectedIds.has(dragStateId.current)) {
          // Move all selected states
          const moves = state.states
            .filter((s) => state.selectedIds.has(s.id))
            .map((s) => {
              const off = dragGroupOffsets.current.get(s.id) ?? { x: 0, y: 0 };
              return { id: s.id, x: off.x + dx, y: off.y + dy };
            });
          onMoveManyStates(moves, false);
        } else {
          onMoveState(
            dragStateId.current,
            dragStartState.current.x + dx,
            dragStartState.current.y + dy,
            false
          );
        }
        return;
      }

      // Selection rect
      if (isSelecting.current) {
        const svgPt = screenToSvg(e.clientX, e.clientY);
        setSelectionRect({
          x: selectStart.current.x,
          y: selectStart.current.y,
          width: svgPt.x - selectStart.current.x,
          height: svgPt.y - selectStart.current.y,
        });
      }
    },
    [viewBox, onViewBoxChange, screenToSvg, state, onMoveState, onMoveManyStates]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isPanning.current) {
        isPanning.current = false;
        if (svgRef.current) svgRef.current.style.cursor = isSpaceDown.current ? 'grab' : 'default';
        return;
      }

      if (isDraggingState.current && dragStateId.current) {
        // Finalize drag - apply snap if needed
        if (didMoveRef.current && snapToGrid) {
          const svgPt = screenToSvg(e.clientX, e.clientY);
          const dx = svgPt.x - dragStartSvg.current.x;
          const dy = svgPt.y - dragStartSvg.current.y;

          if (state.selectedIds.size > 1 && state.selectedIds.has(dragStateId.current)) {
            const moves = state.states
              .filter((s) => state.selectedIds.has(s.id))
              .map((s) => {
                const off = dragGroupOffsets.current.get(s.id) ?? { x: 0, y: 0 };
                return { id: s.id, x: off.x + dx, y: off.y + dy };
              });
            onMoveManyStates(moves, true);
          } else {
            onMoveState(
              dragStateId.current,
              dragStartState.current.x + (svgPt.x - dragStartSvg.current.x),
              dragStartState.current.y + (svgPt.y - dragStartSvg.current.y),
              true
            );
          }
        }
        isDraggingState.current = false;
        dragStateId.current = null;
        didMoveRef.current = false;
        return;
      }

      if (isSelecting.current) {
        isSelecting.current = false;
        if (selectionRect) {
          const rx = selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x;
          const ry = selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y;
          const rw = Math.abs(selectionRect.width);
          const rh = Math.abs(selectionRect.height);

          if (rw > 4 || rh > 4) {
            const selected = state.states
              .filter(
                (s) =>
                  s.x >= rx && s.x <= rx + rw &&
                  s.y >= ry && s.y <= ry + rh
              )
              .map((s) => s.id);
            onSelectIds(selected);
          }
        }
        setSelectionRect(null);
      }
    },
    [screenToSvg, snapToGrid, state, onMoveState, onMoveManyStates, onSelectIds, selectionRect, svgRef]
  );

  const handleStateMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (e.button !== 0) return;

      const svgPt = screenToSvg(e.clientX, e.clientY);
      const s = state.states.find((st) => st.id === id);
      if (!s) return;

      // Selecting source for new transition
      if (isSelectingTransitionSource) {
        onSelectTransitionSource(id);
        return;
      }

      // Completing a transition (selecting destination)
      if (pendingTransitionFrom !== null) {
        justCompletedTransitionRef.current = true;
        onCompleteTransition(id);
        return;
      }

      // Start dragging
      isDraggingState.current = true;
      dragStateId.current = id;
      dragStartSvg.current = svgPt;
      dragStartState.current = { x: s.x, y: s.y };
      didMoveRef.current = false;

      // Record offsets for group drag
      dragGroupOffsets.current = new Map(
        state.states
          .filter((st) => state.selectedIds.has(st.id))
          .map((st) => [st.id, { x: st.x, y: st.y }])
      );

      // Selection
      if (e.shiftKey) {
        onToggleSelect(id);
      } else if (!state.selectedIds.has(id)) {
        onSelectIds([id]);
      }
    },
    [screenToSvg, state, pendingTransitionFrom, isSelectingTransitionSource, onSelectTransitionSource, onCompleteTransition, onToggleSelect, onSelectIds]
  );

  const handleSvgDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (pendingTransitionFrom !== null || isSelectingTransitionSource) return;
      const svgPt = screenToSvg(e.clientX, e.clientY);
      const hit = findStateAt(svgPt);
      if (!hit) {
        onAddState(svgPt.x, svgPt.y, snapToGrid);
      }
    },
    [screenToSvg, findStateAt, onAddState, snapToGrid]
  );

  const handleStateDoubleClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (justCompletedTransitionRef.current) {
        justCompletedTransitionRef.current = false;
        return;
      }
      if (pendingTransitionFrom !== null || isSelectingTransitionSource) return;
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const s = state.states.find((st) => st.id === id);
      if (!s) return;

      // Convert state position to screen coords
      const screenX = (s.x - viewBox.x) * viewBox.zoom + rect.left;
      const screenY = (s.y - viewBox.y) * viewBox.zoom + rect.top;
      onRenameState(id, { x: screenX, y: screenY });
    },
    [state.states, viewBox, svgRef, onRenameState]
  );

  const handleTransitionDoubleClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onEditTransition(id, { x: e.clientX, y: e.clientY });
    },
    [onEditTransition]
  );

  const handleTransitionClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (e.shiftKey) {
        onToggleSelect(id);
      } else {
        onSelectIds([id]);
      }
    },
    [onToggleSelect, onSelectIds]
  );

  const handleMouseLeave = useCallback(() => {
    if (isDraggingState.current) {
      isDraggingState.current = false;
      dragStateId.current = null;
      didMoveRef.current = false;
    }
    isPanning.current = false;
    isSelecting.current = false;
    setSelectionRect(null);
  }, []);

  // Determine curvature for parallel edges
  const getCurvature = (transition: Transition): number => {
    const reverse = state.transitions.find(
      (t) => t.from === transition.to && t.to === transition.from
    );
    if (reverse) {
      return 0.4;
    }
    return 0;
  };

  const svgViewBox = `${viewBox.x} ${viewBox.y} ${
    containerRef.current ? containerRef.current.clientWidth / viewBox.zoom : 800
  } ${containerRef.current ? containerRef.current.clientHeight / viewBox.zoom : 600}`;

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden bg-slate-50 dark:bg-slate-900">
      {state.states.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500 animate-pulse">
            <Network size={48} strokeWidth={1} />
            <p className="text-lg font-medium">Double-click anywhere to create your first state</p>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={svgViewBox}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleSvgDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        style={{ cursor: pendingTransitionFrom ? 'crosshair' : 'default' }}
      >
        <defs>
          <marker
            id="arrowhead-default"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
          </marker>
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
          <GridPattern zoom={viewBox.zoom} />
        </defs>

        {/* Grid background */}
        {showGrid && (
          <rect
            x={viewBox.x - 1000}
            y={viewBox.y - 1000}
            width={10000}
            height={10000}
            fill="url(#grid-pattern)"
          />
        )}

        {/* Start arrow */}
        {state.states
          .filter((s) => s.isStart)
          .map((s) => (
            <StartArrow key={`start-${s.id}`} state={s} />
          ))}

        {/* Transitions (self-loops) */}
        {state.transitions
          .filter((t) => t.from === t.to)
          .map((t) => {
            const s = state.states.find((st) => st.id === t.from);
            if (!s) return null;
            return (
              <SelfLoop
                key={t.id}
                transition={t}
                state={s}
                isSelected={state.selectedIds.has(t.id)}
                onDoubleClick={handleTransitionDoubleClick}
                onContextMenu={onContextMenuTransition}
                onClick={handleTransitionClick}
              />
            );
          })}

        {/* Transitions (edges) */}
        {state.transitions
          .filter((t) => t.from !== t.to)
          .map((t) => {
            const from = state.states.find((s) => s.id === t.from);
            const to = state.states.find((s) => s.id === t.to);
            if (!from || !to) return null;
            return (
              <TransitionEdge
                key={t.id}
                transition={t}
                fromState={from}
                toState={to}
                isSelected={state.selectedIds.has(t.id)}
                curvature={getCurvature(t)}
                onDoubleClick={handleTransitionDoubleClick}
                onContextMenu={onContextMenuTransition}
                onClick={handleTransitionClick}
              />
            );
          })}

        {/* States */}
        {state.states.map((s) => (
          <StateCircle
            key={s.id}
            state={s}
            isSelected={state.selectedIds.has(s.id)}
            isUnreachable={unreachableIds.has(s.id)}
            onMouseDown={(e, id) => {
              handleStateMouseDown(e, id);
            }}
            onDoubleClick={handleStateDoubleClick}
            onContextMenu={onContextMenuState}
          />
        ))}

        {/* Selection rect */}
        <SelectionRect rect={selectionRect} />

        {/* Pending transition preview */}
        {pendingTransitionFrom && (() => {
          const fromState = state.states.find((s) => s.id === pendingTransitionFrom);
          if (!fromState) return null;
          return (
            <circle
              cx={fromState.x}
              cy={fromState.y}
              r={STATE_RADIUS + 8}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          );
        })()}
      </svg>

      {/* Zoom indicator */}
      <button
        className="absolute bottom-4 left-4 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        onClick={() => onViewBoxChange({ ...viewBox, zoom: 1 })}
        title="Click to reset zoom"
      >
        {Math.round(viewBox.zoom * 100)}%
      </button>
    </div>
  );
};
