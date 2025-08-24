export function clamp(x: number, min: number, max: number) {
  return Math.min(max, Math.max(min, x))
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
