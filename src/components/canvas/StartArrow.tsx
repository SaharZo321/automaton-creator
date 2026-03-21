import React from 'react';
import type { StateNode } from '../../types/automaton';
import { STATE_RADIUS } from '../../constants';

interface StartArrowProps {
  state: StateNode;
}

export const StartArrow: React.FC<StartArrowProps> = ({ state }) => {
  const arrowLength = 40;
  const startX = state.x - STATE_RADIUS - arrowLength;
  const startY = state.y;
  const endX = state.x - STATE_RADIUS;
  const endY = state.y;

  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke="#475569"
      strokeWidth={2}
      markerEnd="url(#arrowhead-default)"
      className="stroke-slate-600 dark:stroke-slate-400"
    />
  );
};
