import React from 'react';

interface SelectionRectProps {
  rect: { x: number; y: number; width: number; height: number } | null;
}

export const SelectionRect: React.FC<SelectionRectProps> = ({ rect }) => {
  if (!rect) return null;

  return (
    <rect
      x={rect.width < 0 ? rect.x + rect.width : rect.x}
      y={rect.height < 0 ? rect.y + rect.height : rect.y}
      width={Math.abs(rect.width)}
      height={Math.abs(rect.height)}
      fill="#3b82f620"
      stroke="#3b82f6"
      strokeWidth={1}
      strokeDasharray="4 2"
      style={{ pointerEvents: 'none' }}
    />
  );
};
