import type { StateNode } from '../types/automaton';

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

export function getSelfLoopPath(cx: number, cy: number, radius: number): string {
  const loopRadius = radius * 0.9;
  const startAngle = -Math.PI / 4;
  const endAngle = -3 * Math.PI / 4;

  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);

  const cp1X = cx + (radius + loopRadius * 2) * Math.cos(startAngle - Math.PI / 6);
  const cp1Y = cy + (radius + loopRadius * 2) * Math.sin(startAngle - Math.PI / 6);
  const cp2X = cx + (radius + loopRadius * 2) * Math.cos(endAngle + Math.PI / 6);
  const cp2Y = cy + (radius + loopRadius * 2) * Math.sin(endAngle + Math.PI / 6);

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
  state: StateNode,
  radius: number
): boolean {
  const dx = point.x - state.x;
  const dy = point.y - state.y;
  return dx * dx + dy * dy <= radius * radius;
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

export function getEdgeEndpoints(
  from: StateNode,
  to: StateNode,
  radius: number,
  curvature: number = 0.3
): { fromPt: { x: number; y: number }; toPt: { x: number; y: number } } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { fromPt: { x: from.x, y: from.y }, toPt: { x: to.x, y: to.y } };

  // Perpendicular for curve
  const px = -dy / dist;
  const py = dx / dist;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const offset = curvature * dist * 0.3;
  const cpX = midX + px * offset;
  const cpY = midY + py * offset;

  // Direction from source to cp
  const dFromX = cpX - from.x;
  const dFromY = cpY - from.y;
  const dFromLen = Math.sqrt(dFromX * dFromX + dFromY * dFromY);

  // Direction from cp to target
  const dToX = to.x - cpX;
  const dToY = to.y - cpY;
  const dToLen = Math.sqrt(dToX * dToX + dToY * dToY);

  const fromPt = {
    x: from.x + (dFromLen > 0 ? (dFromX / dFromLen) * radius : 0),
    y: from.y + (dFromLen > 0 ? (dFromY / dFromLen) * radius : 0),
  };

  const toPt = {
    x: to.x - (dToLen > 0 ? (dToX / dToLen) * radius : 0),
    y: to.y - (dToLen > 0 ? (dToY / dToLen) * radius : 0),
  };

  return { fromPt, toPt };
}
