import React from 'react';
import { GRID_SIZE } from '../../constants';

interface GridPatternProps {
  zoom: number;
}

export const GridPattern: React.FC<GridPatternProps> = ({ zoom }) => {
  const dotSize = Math.max(0.5, 1 / zoom);

  return (
    <defs>
      <pattern
        id="grid-pattern"
        width={GRID_SIZE}
        height={GRID_SIZE}
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx={GRID_SIZE / 2}
          cy={GRID_SIZE / 2}
          r={dotSize}
          className="fill-slate-300 dark:fill-slate-600"
          fill="currentColor"
        />
      </pattern>
    </defs>
  );
};
