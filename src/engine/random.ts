export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
// Hash puro: a mesma seed, turno e chave sempre produzem o mesmo resultado.
export function random(seed: number, turn: number, key: number) {
  let n = (seed ^ Math.imul(turn + 1, 0x9e3779b9) ^ Math.imul(key + 1, 0x85ebca6b)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x21f0aaad);
  n = Math.imul(n ^ (n >>> 15), 0x735a2d97);
  return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
}
