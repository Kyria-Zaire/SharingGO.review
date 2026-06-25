export interface PercentPoint {
  x: number;
  y: number;
}

export type MarkerPlacement = "right" | "left" | "below" | "above";

export interface RouteChevron {
  x: number;
  y: number;
  angle: number;
}

/** Courbe lissée Catmull-Rom → Bézier pour le tracé hero. */
export function smoothRoutePath(points: PercentPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  if (points.length === 2) {
    const [a, b] = points;
    return `M ${a!.x} ${a!.y} L ${b!.x} ${b!.y}`;
  }

  let path = `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

export function resolveMarkerPlacement(x: number, y: number): MarkerPlacement {
  if (x > 72) return "left";
  if (x < 28) return "right";
  if (y < 22) return "below";
  if (y > 78) return "above";
  return x > 50 ? "left" : "right";
}

/** Flèches de sens le long du tracé (référence maquette). */
export function routeChevronPositions(points: PercentPoint[]): RouteChevron[] {
  if (points.length < 3) return [];

  const ratios = [0.32, 0.58, 0.82];

  return ratios
    .map((ratio) => Math.min(points.length - 2, Math.max(1, Math.round(ratio * (points.length - 1)))))
    .map((index) => {
      const prev = points[index - 1]!;
      const next = points[index + 1]!;
      const curr = points[index]!;
      const angle = (Math.atan2(next.y - prev.y, next.x - prev.x) * 180) / Math.PI;
      return { x: curr.x, y: curr.y, angle };
    });
}
