import React from 'react';
import type { Transition, StateNode } from '../../types/automaton';
import { STATE_RADIUS, getStateRx } from '../../constants';
import { getSelfLoopPath } from '../../lib/geometry';

interface SelfLoopProps {
  transition: Transition;
  state: StateNode;
  isSelected: boolean;
  onDoubleClick: (e: React.MouseEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onClick: (e: React.MouseEvent, id: string) => void;
}

export const SelfLoop: React.FC<SelfLoopProps> = ({
  transition,
  state,
  isSelected,
  onDoubleClick,
  onContextMenu,
  onClick,
}) => {
  const pathD = getSelfLoopPath(state.x, state.y, getStateRx(state.name), STATE_RADIUS);
  const label = transition.symbols.join(', ');
  const strokeColor = isSelected ? '#3b82f6' : '#475569';

  // Label position: above the state
  const labelX = state.x;
  const labelY = state.y - STATE_RADIUS - 32;

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

      {/* Label background */}
      <rect
        x={labelX - (label.length * 4 + 6)}
        y={labelY - 10}
        width={label.length * 8 + 12}
        height={20}
        rx={4}
        fill="white"
        className="fill-white dark:fill-slate-900"
        opacity={0.9}
      />

      {/* Label */}
      <text
        x={labelX}
        y={labelY}
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
