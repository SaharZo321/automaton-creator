import React, { useRef, useLayoutEffect, useState } from 'react';
import { isLatex, renderLatex } from '../../lib/latex';

interface TransitionLabelProps {
  label: string;
  x: number;
  y: number;
  isSelected: boolean;
  enableLatex?: boolean;
}

export const TransitionLabel: React.FC<TransitionLabelProps> = ({ label, x, y, isSelected, enableLatex = true }) => {
  const hasLatex = enableLatex && isLatex(label);
  const divRef = useRef<HTMLDivElement>(null);
  const [latexBgWidth, setLatexBgWidth] = useState(100);

  useLayoutEffect(() => {
    if (!hasLatex) return;
    const html = renderLatex(label);

    // Measure in an offscreen div so the foreignObject width doesn't constrain measurement
    const temp = document.createElement('div');
    temp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:13px;';
    temp.innerHTML = html;
    document.body.appendChild(temp);
    const w = temp.scrollWidth;
    document.body.removeChild(temp);
    setLatexBgWidth(Math.max(40, w + 16));

    if (divRef.current) {
      divRef.current.innerHTML = html;
    }
  }, [label, hasLatex]);

  if (!hasLatex) {
    const bgWidth = label.length * 8 + 12;
    return (
      <>
        <rect
          x={x - bgWidth / 2}
          y={y - 10}
          width={bgWidth}
          height={20}
          rx={4}
          fill="white"
          className="fill-white dark:fill-slate-900"
          opacity={0.9}
        />
        <text
          x={x}
          y={y}
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
      </>
    );
  }

  return (
    <>
      <rect
        x={x - latexBgWidth / 2}
        y={y - 10}
        width={latexBgWidth}
        height={20}
        rx={4}
        fill="white"
        className="fill-white dark:fill-slate-900"
        opacity={0.9}
      />
      <foreignObject
        x={x - latexBgWidth / 2}
        y={y - 10}
        width={latexBgWidth}
        height={20}
        style={{ overflow: 'visible', pointerEvents: 'none' }}
      >
        <div
          ref={divRef}
          className={isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}
          style={{
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </foreignObject>
    </>
  );
};
