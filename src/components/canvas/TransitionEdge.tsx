import React from 'react';
import type { Transition, StateNode } from '../../types/automaton';
import { getEdgePath, getEdgeEndpoints, getEdgeLabelPosition } from '../../lib/geometry';
import { TransitionLabel } from './TransitionLabel';

interface TransitionEdgeProps {
  transition: Transition;
  fromState: StateNode;
  toState: StateNode;
  isSelected: boolean;
  curvature: number;
  enableLatex?: boolean;
  onDoubleClick: (e: React.MouseEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onClick: (e: React.MouseEvent, id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
}

export const TransitionEdge: React.FC<TransitionEdgeProps> = ({
  transition,
  fromState,
  toState,
  isSelected,
  curvature,
  enableLatex = false,
  onDoubleClick,
  onContextMenu,
  onClick,
  onDragStart,
}) => {
  const { fromPt, toPt } = getEdgeEndpoints(fromState, toState, curvature);
  const pathD = getEdgePath(fromPt, toPt, curvature);
  const labelPos = getEdgeLabelPosition(fromPt, toPt, curvature);
  const label = transition.symbols.join(', ');

  // Drag handle at bezier midpoint (t=0.5)
  const edgeDx = toPt.x - fromPt.x;
  const edgeDy = toPt.y - fromPt.y;
  const edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
  const edgePx = edgeDist > 0 ? -edgeDy / edgeDist : 0;
  const edgePy = edgeDist > 0 ? edgeDx / edgeDist : 0;
  const edgeMidX = (fromPt.x + toPt.x) / 2;
  const edgeMidY = (fromPt.y + toPt.y) / 2;
  const handleX = edgeMidX + 0.5 * edgePx * (curvature * edgeDist * 0.3);
  const handleY = edgeMidY + 0.5 * edgePy * (curvature * edgeDist * 0.3);

  const strokeColor = isSelected ? '#3b82f6' : '#475569';

  return (
    <g
      onDoubleClick={(e) => onDoubleClick(e, transition.id)}
      onContextMenu={(e) => onContextMenu(e, transition.id)}
      onClick={(e) => onClick(e, transition.id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Invisible wider hit area */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />

      {/* Visible edge */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        markerEnd={`url(#arrowhead-${isSelected ? 'selected' : 'default'})`}
      />

      <TransitionLabel label={label} x={labelPos.x} y={labelPos.y} isSelected={isSelected} enableLatex={enableLatex} />

      {/* Curve drag handle */}
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
