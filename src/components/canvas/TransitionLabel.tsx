import React, { useRef, useLayoutEffect, useState } from 'react';
import { isLatex, renderLatex } from '../../lib/latex';

interface TransitionLabelProps {
  labels: string[];
  separator: string;
  stack: boolean;
  x: number;
  y: number;
  isSelected: boolean;
  enableLatex?: boolean;
}

const LINE_HEIGHT = 20;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const TransitionLabel: React.FC<TransitionLabelProps> = ({
  labels,
  separator,
  stack,
  x,
  y,
  isSelected,
  enableLatex = true,
}) => {
  const lines = stack && labels.length > 0 ? labels : [labels.join(`${separator} `)];
  const anyLatex = enableLatex && lines.some(isLatex);
  const divRef = useRef<HTMLDivElement>(null);
  const [bgWidth, setBgWidth] = useState(40);

  const totalHeight = lines.length * LINE_HEIGHT;
  const topY = y - totalHeight / 2;

  useLayoutEffect(() => {
    if (!anyLatex) {
      const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0);
      setBgWidth(Math.max(40, maxLen * 8 + 12));
      return;
    }

    const temp = document.createElement('div');
    temp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:13px;';
    document.body.appendChild(temp);
    let maxW = 0;
    for (const line of lines) {
      if (isLatex(line)) {
        temp.innerHTML = renderLatex(line);
      } else {
        temp.textContent = line;
      }
      maxW = Math.max(maxW, temp.scrollWidth);
    }
    document.body.removeChild(temp);
    setBgWidth(Math.max(40, maxW + 16));

    if (divRef.current) {
      divRef.current.innerHTML = lines
        .map(
          (line) =>
            `<div style="height:${LINE_HEIGHT}px;display:flex;align-items:center;justify-content:center;">${
              isLatex(line) ? renderLatex(line) : escapeHtml(line)
            }</div>`
        )
        .join('');
    }
  }, [anyLatex, lines.join('')]);

  if (!anyLatex) {
    return (
      <>
        <rect
          x={x - bgWidth / 2}
          y={topY}
          width={bgWidth}
          height={totalHeight}
          rx={4}
          fill="white"
          className="fill-white dark:fill-slate-900"
          opacity={0.9}
        />
        {lines.map((line, i) => (
          <text
            key={i}
            x={x}
            y={topY + (i + 0.5) * LINE_HEIGHT}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontFamily="system-ui, sans-serif"
            fill={isSelected ? '#1d4ed8' : '#334155'}
            className="fill-slate-700 dark:fill-slate-200"
            style={{ userSelect: 'none' }}
          >
            {line}
          </text>
        ))}
      </>
    );
  }

  return (
    <>
      <rect
        x={x - bgWidth / 2}
        y={topY}
        width={bgWidth}
        height={totalHeight}
        rx={4}
        fill="white"
        className="fill-white dark:fill-slate-900"
        opacity={0.9}
      />
      <foreignObject
        x={x - bgWidth / 2}
        y={topY}
        width={bgWidth}
        height={totalHeight}
        style={{ overflow: 'visible', pointerEvents: 'none' }}
      >
        <div
          ref={divRef}
          className={isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}
          style={{
            height: `${totalHeight}px`,
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
