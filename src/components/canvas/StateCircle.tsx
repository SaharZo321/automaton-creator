import React, { useRef, useEffect } from 'react';
import type { StateNode } from '../../types/automaton';
import { STATE_RADIUS } from '../../constants';
import { isLatex, renderLatex } from '../../lib/latex';

interface StateCircleProps {
  state: StateNode;
  isSelected: boolean;
  isUnreachable: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onDoubleClick: (e: React.MouseEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

const ForeignLabel: React.FC<{ name: string; radius: number }> = ({ name, radius }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = renderLatex(name);
    }
  }, [name]);

  const size = radius * 2 - 8;

  return (
    <foreignObject
      x={-size / 2}
      y={-size / 2}
      width={size}
      height={size}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <div
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </foreignObject>
  );
};

export const StateCircle: React.FC<StateCircleProps> = ({
  state,
  isSelected,
  isUnreachable,
  onMouseDown,
  onDoubleClick,
  onContextMenu,
}) => {
  const radius = STATE_RADIUS;
  const opacity = isUnreachable ? 0.4 : 1;

  return (
    <g
      transform={`translate(${state.x}, ${state.y})`}
      onMouseDown={(e) => onMouseDown(e, state.id)}
      onDoubleClick={(e) => onDoubleClick(e, state.id)}
      onContextMenu={(e) => onContextMenu(e, state.id)}
      style={{ cursor: 'grab', opacity }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <circle
          r={radius + 5}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}

      {/* Main circle */}
      <circle
        r={radius}
        className={`
          ${isSelected
            ? 'fill-blue-50 dark:fill-blue-950 stroke-blue-500'
            : 'fill-white dark:fill-slate-800 stroke-slate-700 dark:stroke-slate-300'
          }
        `}
        fill="white"
        stroke={isSelected ? '#3b82f6' : '#475569'}
        strokeWidth={2}
      />

      {/* Accept state double circle */}
      {state.isAccept && (
        <circle
          r={radius - 5}
          fill="none"
          stroke={isSelected ? '#3b82f6' : '#10b981'}
          strokeWidth={2}
        />
      )}

      {/* Label */}
      {isLatex(state.name) ? (
        <ForeignLabel name={state.name} radius={radius} />
      ) : (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontFamily="system-ui, sans-serif"
          fill={isSelected ? '#1d4ed8' : '#1e293b'}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
          className="fill-slate-800 dark:fill-slate-100"
        >
          {state.name}
        </text>
      )}
    </g>
  );
};
