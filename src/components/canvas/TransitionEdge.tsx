import React from 'react';
import type { Transition, StateNode } from '../../types/automaton';
import { STATE_RADIUS } from '../../constants';
import { getEdgePath, getEdgeEndpoints, getEdgeLabelPosition } from '../../lib/geometry';

interface TransitionEdgeProps {
  transition: Transition;
  fromState: StateNode;
  toState: StateNode;
  isSelected: boolean;
  curvature: number;
  onDoubleClick: (e: React.MouseEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onClick: (e: React.MouseEvent, id: string) => void;
}

export const TransitionEdge: React.FC<TransitionEdgeProps> = ({
  transition,
  fromState,
  toState,
  isSelected,
  curvature,
  onDoubleClick,
  onContextMenu,
  onClick,
}) => {
  const { fromPt, toPt } = getEdgeEndpoints(fromState, toState, STATE_RADIUS, curvature);
  const pathD = getEdgePath(fromPt, toPt, curvature);
  const labelPos = getEdgeLabelPosition(fromPt, toPt, curvature);
  const label = transition.symbols.join(', ');

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

      {/* Label background */}
      <rect
        x={labelPos.x - (label.length * 4 + 6)}
        y={labelPos.y - 10}
        width={label.length * 8 + 12}
        height={20}
        rx={4}
        fill="white"
        className="fill-white dark:fill-slate-900"
        opacity={0.9}
      />

      {/* Label text */}
      <text
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontFamily="system-ui, sans-serif"
        fill={isSelected ? '#1d4ed8' : '#334155'}
        className="fill-slate-700 dark:fill-slate-200"
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  );
};
