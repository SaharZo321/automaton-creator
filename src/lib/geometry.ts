import type { StateNode } from '../types/automaton';
import { STATE_RADIUS, getStateRx } from '../constants';

export function getEdgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curvature: number = 0.3
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return '';

  // Perpendicular direction for control point offset
  const px = -dy / dist;
  const py = dx / dist;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  const offset = curvature * dist * 0.3;
  const cpX = midX + px * offset;
  const cpY = midY + py * offset;

  return `M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`;
}

export function getSelfLoopPath(cx: number, cy: number, rx: number, ry: number = rx, angle: number = -Math.PI / 2): string {
  const loopRadius = ry * 0.9;
  const startAngle = angle + Math.PI / 4;
  const endAngle = angle - Math.PI / 4;

  const startX = cx + rx * Math.cos(startAngle);
  const startY = cy + ry * Math.sin(startAngle);
  const endX = cx + rx * Math.cos(endAngle);
  const endY = cy + ry * Math.sin(endAngle);

  const cp1Angle = startAngle - Math.PI / 6;
  const cp2Angle = endAngle + Math.PI / 6;
  const cp1X = cx + (rx + loopRadius * 2) * Math.cos(cp1Angle);
  const cp1Y = cy + (ry + loopRadius * 2) * Math.sin(cp1Angle);
  const cp2X = cx + (rx + loopRadius * 2) * Math.cos(cp2Angle);
  const cp2Y = cy + (ry + loopRadius * 2) * Math.sin(cp2Angle);

  return `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;
}

export function getMidpoint(
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  };
}

export function hitTestState(
  point: { x: number; y: number },
  state: StateNode
): boolean {
  const rx = getStateRx(state.name);
  const ry = STATE_RADIUS;
  const dx = point.x - state.x;
  const dy = point.y - state.y;
  return (dx / rx) * (dx / rx) + (dy / ry) * (dy / ry) <= 1;
}

export function getEdgeLabelPosition(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curvature: number = 0.3
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { x: from.x, y: from.y };

  const px = -dy / dist;
  const py = dx / dist;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  const offset = curvature * dist * 0.3;

  // Label is at the midpoint of the quadratic bezier (t=0.5)
  const cpX = midX + px * offset;
  const cpY = midY + py * offset;

  // Point on quadratic bezier at t=0.5
  const bx = 0.25 * from.x + 0.5 * cpX + 0.25 * to.x;
  const by = 0.25 * from.y + 0.5 * cpY + 0.25 * to.y;

  // Offset label perpendicular to edge
  return {
    x: bx + px * 14,
    y: by + py * 14,
  };
}

function ellipseIntersect(
  cx: number, cy: number, rx: number, ry: number,
  nx: number, ny: number, outward: boolean
): { x: number; y: number } {
  const t = 1 / Math.sqrt((nx / rx) * (nx / rx) + (ny / ry) * (ny / ry));
  const sign = outward ? 1 : -1;
  return { x: cx + sign * nx * t, y: cy + sign * ny * t };
}

export function getEdgeEndpoints(
  from: StateNode,
  to: StateNode,
  curvature: number = 0.3
): { fromPt: { x: number; y: number }; toPt: { x: number; y: number } } {
  const ry = STATE_RADIUS;
  const fromRx = getStateRx(from.name);
  const toRx = getStateRx(to.name);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { fromPt: { x: from.x, y: from.y }, toPt: { x: to.x, y: to.y } };

  const px = -dy / dist;
  const py = dx / dist;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const offset = curvature * dist * 0.3;
  const cpX = midX + px * offset;
  const cpY = midY + py * offset;

  const dFromX = cpX - from.x;
  const dFromY = cpY - from.y;
  const dFromLen = Math.sqrt(dFromX * dFromX + dFromY * dFromY);

  const dToX = to.x - cpX;
  const dToY = to.y - cpY;
  const dToLen = Math.sqrt(dToX * dToX + dToY * dToY);

  const fromPt = dFromLen > 0
    ? ellipseIntersect(from.x, from.y, fromRx, ry, dFromX / dFromLen, dFromY / dFromLen, true)
    : { x: from.x, y: from.y };

  const toPt = dToLen > 0
    ? ellipseIntersect(to.x, to.y, toRx, ry, dToX / dToLen, dToY / dToLen, false)
    : { x: to.x, y: to.y };

  return { fromPt, toPt };
}
