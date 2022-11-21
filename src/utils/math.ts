export function inverseLerp(x: number, a: number, b: number): number {
  return (x - a) / (b - a);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
