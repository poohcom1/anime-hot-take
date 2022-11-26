export function lerp(from: number, to: number, x: number): number {
  return from + (to - from) * x;
}

export function inverseLerp(from: number, to: number, x: number): number {
  return (x - from) / (to - from);
}

export function clamp(val: number, min: number, max: number): number {
  if (isNaN(val)) {
    val = (min + max) / 2;
  }

  return Math.min(Math.max(val, min), max);
}

export function weightedAverage(data: [number, number][]): number {
  if (data.length === 0) return 0;

  return (
    data.reduce((pre, [cur, weight]) => pre + cur * weight, 0) /
    data.reduce((pre, [, weight]) => pre + weight, 0)
  );
}
