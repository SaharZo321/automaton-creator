import React, { useCallback } from 'react';
import type { AutomatonState } from '../types/automaton';
import { STATE_RADIUS } from '../constants';

interface MiniMapProps {
  state: AutomatonState;
  viewBox: { x: number; y: number; zoom: number };
  containerWidth: number;
  containerHeight: number;
  onNavigate: (x: number, y: number) => void;
}

const MINIMAP_WIDTH = 160;
const MINIMAP_HEIGHT = 120;
const PADDING = 20;

export const MiniMap: React.FC<MiniMapProps> = ({
  state,
  viewBox,
  containerWidth,
  containerHeight,
  onNavigate,
}) => {
  const { states } = state;

  if (states.length === 0) return null;

  const minX = Math.min(...states.map((s) => s.x)) - STATE_RADIUS - PADDING;
  const maxX = Math.max(...states.map((s) => s.x)) + STATE_RADIUS + PADDING;
  const minY = Math.min(...states.map((s) => s.y)) - STATE_RADIUS - PADDING;
  const maxY = Math.max(...states.map((s) => s.y)) + STATE_RADIUS + PADDING;

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  const scaleX = MINIMAP_WIDTH / contentW;
  const scaleY = MINIMAP_HEIGHT / contentH;
  const scale = Math.min(scaleX, scaleY, 0.3);

  const offsetX = (MINIMAP_WIDTH - contentW * scale) / 2;
  const offsetY = (MINIMAP_HEIGHT - contentH * scale) / 2;

  const toMiniX = (x: number) => (x - minX) * scale + offsetX;
  const toMiniY = (y: number) => (y - minY) * scale + offsetY;

  // Viewport rect in mini coords
  const vpW = (containerWidth / viewBox.zoom) * scale;
  const vpH = (containerHeight / viewBox.zoom) * scale;
  const vpX = (viewBox.x - minX) * scale + offsetX;
  const vpY = (viewBox.y - minY) * scale + offsetY;

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert back to world coords
      const worldX = (clickX - offsetX) / scale + minX;
      const worldY = (clickY - offsetY) / scale + minY;

      onNavigate(worldX - containerWidth / viewBox.zoom / 2, worldY - containerHeight / viewBox.zoom / 2);
    },
    [offsetX, offsetY, scale, minX, minY, containerWidth, containerHeight, viewBox.zoom, onNavigate]
  );

  return (
    <div className="absolute bottom-4 right-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800 opacity-90">
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        onClick={handleClick}
        style={{ cursor: 'pointer', display: 'block' }}
      >
        {/* States */}
        {states.map((s) => (
          <circle
            key={s.id}
            cx={toMiniX(s.x)}
            cy={toMiniY(s.y)}
            r={Math.max(2, STATE_RADIUS * scale)}
            fill={s.isAccept ? '#10b981' : '#64748b'}
            opacity={0.8}
          />
        ))}

        {/* Viewport indicator */}
        <rect
          x={vpX}
          y={vpY}
          width={vpW}
          height={vpH}
          fill="#3b82f620"
          stroke="#3b82f6"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
};
