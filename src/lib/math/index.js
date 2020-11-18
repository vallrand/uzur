export * from './vec2'
export * from './vec3'
export * from './vec4'

export * from './color'

export * from './mat3x2'
export * from './mat3'
export * from './mat4'

export * from './rng'

Math.TAU = 2 * Math.PI

Math.clamp = (value, min, max) => Math.max(Math.min(value, max), min)

Math.lerp = (a, b, f) => a + f * (b - a)

Math.mod = (n, m) => ((n % m) + m) % m

export const normalizeAngle = angle => angle - Math.TAU * Math.floor((angle + Math.PI) / Math.TAU)

export const shortestAngle = (start, end) => (((end - start) % Math.TAU) + Math.PI + Math.TAU) % Math.TAU - Math.PI

export const sigmoid = (offset, max, steepness) => x => max / (1 + Math.exp(-steepness * (x - offset)))