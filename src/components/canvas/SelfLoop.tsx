import React from 'react';
import type { Transition, StateNode } from '../../types/automaton';
import { STATE_RADIUS, getStateRx } from '../../constants';
import { getSelfLoopPath } from '../../lib/geometry';
import { TransitionLabel } from './TransitionLabel';

interface SelfLoopProps {
  transition: Transition;
  state: StateNode;
  isSelected: boolean;
  loopAngle: number;
  enableLatex?: boolean;
  onDoubleClick: (e: React.MouseEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onClick: (e: React.MouseEvent, id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
}

export const SelfLoop: React.FC<SelfLoopProps> = ({
  transition,
  state,
  isSelected,
  loopAngle,
  enableLatex = false,
  onDoubleClick,
  onContextMenu,
  onClick,
  onDragStart,
}) => {
  const rx = getStateRx(state.name);
  const ry = STATE_RADIUS;
  const pathD = getSelfLoopPath(state.x, state.y, rx, ry, loopAngle);
  const label = transition.symbols.join(', ');
  const strokeColor = isSelected ? '#3b82f6' : '#475569';

  // Label position: in the loop direction
  const labelDist = STATE_RADIUS + 32;
  const labelX = state.x + labelDist * Math.cos(loopAngle);
  const labelY = state.y + labelDist * Math.sin(loopAngle);

  // Drag handle at bezier midpoint of the loop
  const loopR = ry * 0.9;
  const a0 = loopAngle + Math.PI / 4;
  const a3 = loopAngle - Math.PI / 4;
  const a1 = loopAngle + Math.PI / 12;
  const a2 = loopAngle - Math.PI / 12;
  const p0x = state.x + rx * Math.cos(a0);   const p0y = state.y + ry * Math.sin(a0);
  const p1x = state.x + (rx + loopR * 2) * Math.cos(a1); const p1y = state.y + (ry + loopR * 2) * Math.sin(a1);
  const p2x = state.x + (rx + loopR * 2) * Math.cos(a2); const p2y = state.y + (ry + loopR * 2) * Math.sin(a2);
  const p3x = state.x + rx * Math.cos(a3);   const p3y = state.y + ry * Math.sin(a3);
  const handleX = (p0x + 3 * p1x + 3 * p2x + p3x) / 8;
  const handleY = (p0y + 3 * p1y + 3 * p2y + p3y) / 8;

  return (
    <g
      onDoubleClick={(e) => onDoubleClick(e, transition.id)}
      onContextMenu={(e) => onContextMenu(e, transition.id)}
      onClick={(e) => onClick(e, transition.id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Hit area */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={16} />

      {/* Visible loop */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        markerEnd={`url(#arrowhead-${isSelected ? 'selected' : 'default'})`}
      />

      <TransitionLabel label={label} x={labelX} y={labelY} isSelected={isSelected} enableLatex={enableLatex} />

      {/* Loop drag handle */}
      {isSelected && (
        <circle
          cx={handleX}
          cy={handleY}
          r={5}
          fill="white"
          stroke={strokeColor}
          strokeWidth={1.5}
          style={{ cursor: 'grab' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onDragStart(e, transition.id);
          }}
        />
      )}
    </g>
  );
};
