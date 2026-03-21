import { useState, useCallback, useRef } from 'react';
import type { StateNode } from '../types/automaton';
import { MIN_ZOOM, MAX_ZOOM, STATE_RADIUS } from '../constants';

interface ViewBox {
  x: number;
  y: number;
  zoom: number;
}

export function useViewBox(initial: ViewBox) {
  const [viewBox, setViewBox] = useState<ViewBox>(initial);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const handleWheel = useCallback(
    (e: WheelEvent, svgRect: DOMRect) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;

      setViewBox((prev) => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * delta));

        // Zoom centered on cursor
        const cursorX = e.clientX - svgRect.left;
        const cursorY = e.clientY - svgRect.top;

        // Convert cursor position to SVG coords
        const svgX = prev.x + cursorX / prev.zoom;
        const svgY = prev.y + cursorY / prev.zoom;

        // New viewBox origin so cursor stays at same SVG position
        const newX = svgX - cursorX / newZoom;
        const newY = svgY - cursorY / newZoom;

        return { x: newX, y: newY, zoom: newZoom };
      });
    },
    []
  );

  const handlePanStart = useCallback((clientX: number, clientY: number) => {
    isPanning.current = true;
    setViewBox((prev) => {
      panStart.current = { x: clientX, y: clientY, vx: prev.x, vy: prev.y };
      return prev;
    });
  }, []);

  const handlePanMove = useCallback((clientX: number, clientY: number) => {
    if (!isPanning.current) return;
    setViewBox((prev) => {
      const dx = (clientX - panStart.current.x) / prev.zoom;
      const dy = (clientY - panStart.current.y) / prev.zoom;
      return {
        ...prev,
        x: panStart.current.vx - dx,
        y: panStart.current.vy - dy,
      };
    });
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  const fitView = useCallback(
    (states: StateNode[], containerWidth: number, containerHeight: number) => {
      if (states.length === 0) {
        setViewBox({ x: 0, y: 0, zoom: 1 });
        return;
      }

      const padding = 80;
      const minX = Math.min(...states.map((s) => s.x)) - STATE_RADIUS;
      const maxX = Math.max(...states.map((s) => s.x)) + STATE_RADIUS;
      const minY = Math.min(...states.map((s) => s.y)) - STATE_RADIUS;
      const maxY = Math.max(...states.map((s) => s.y)) + STATE_RADIUS;

      const contentW = maxX - minX + padding * 2;
      const contentH = maxY - minY + padding * 2;

      const zoomX = containerWidth / contentW;
      const zoomY = containerHeight / contentH;
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(zoomX, zoomY)));

      const x = minX - padding - (containerWidth / zoom - contentW) / 2;
      const y = minY - padding - (containerHeight / zoom - contentH) / 2;

      setViewBox({ x, y, zoom });
    },
    []
  );

  const resetZoom = useCallback(() => {
    setViewBox((prev) => ({ ...prev, zoom: 1 }));
  }, []);

  return {
    viewBox,
    setViewBox,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    fitView,
    resetZoom,
    isPanning,
  };
}
